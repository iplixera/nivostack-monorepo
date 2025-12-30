import { prisma } from './prisma'
import { getUsageStats } from './subscription'

export type ForecastMetrics = {
  churnRisk: {
    high: number
    medium: number
    low: number
  }
  revenueForecast: {
    currentMRR: number
    potentialMRR: number
    growthPotential: number
    churnRiskMRR: number
  }
  conversionForecast: {
    opportunities: number
    estimatedConversions: number
    estimatedRevenue: number
    conversionRate: number
  }
  usageTrends: {
    averageUsageGrowth: number
    usersApproachingLimits: number
    projectedChurn: number
  }
}

/**
 * Calculate churn risk based on usage patterns
 */
export async function calculateChurnRisk(): Promise<ForecastMetrics['churnRisk']> {
  const subscriptions = await prisma.subscription.findMany({
    where: {
      status: 'active',
      enabled: true,
    },
    include: {
      user: true,
      plan: true,
    },
  })

  let highRisk = 0
  let mediumRisk = 0
  let lowRisk = 0

  for (const sub of subscriptions) {
    try {
      const usage = await getUsageStats(sub.userId)
      if (!usage) {
        lowRisk++
        continue
      }

      const meters = [usage.devices, usage.apiTraces, usage.logs, usage.sessions]
      const maxUsage = Math.max(...meters.map((m) => m?.percentage || 0))

      // Check grace period
      const inGracePeriod = sub.gracePeriodEnd && sub.gracePeriodEnd > new Date()

      // Check payment retry count
      const paymentIssues = sub.paymentRetryCount > 0

      // High risk: 100%+ usage OR in grace period OR multiple payment retries
      if (maxUsage >= 100 || inGracePeriod || sub.paymentRetryCount >= 3) {
        highRisk++
      }
      // Medium risk: 80-100% usage OR payment retries
      else if (maxUsage >= 80 || paymentIssues) {
        mediumRisk++
      }
      // Low risk: everything else
      else {
        lowRisk++
      }
    } catch (error) {
      lowRisk++ // Default to low risk on error
    }
  }

  return { high: highRisk, medium: mediumRisk, low: lowRisk }
}

/**
 * Calculate revenue forecasting
 */
export async function calculateRevenueForecast(): Promise<ForecastMetrics['revenueForecast']> {
  const subscriptions = await prisma.subscription.findMany({
    where: {
      status: 'active',
      enabled: true,
    },
    include: {
      plan: true,
      invoices: {
        where: { status: 'paid' },
      },
    },
  })

  // Current MRR (Monthly Recurring Revenue)
  const currentMRR = subscriptions.reduce((sum, sub) => {
    return sum + (sub.discountedPrice || sub.plan.price)
  }, 0)

  // Potential MRR from upgrades (assuming 30% conversion rate)
  const { getSubscriptionAnalytics } = await import('./subscription-analytics')
  const analytics = await getSubscriptionAnalytics()
  const conversionOpportunities = analytics.conversionOpportunities || []

  const potentialMRR = conversionOpportunities.reduce((sum, opp) => {
    // Get recommended plan price (simplified - would need to fetch actual plan)
    const planPrices: Record<string, number> = {
      free: 0,
      pro: 29.99,
      team: 99.99,
      enterprise: 299.99,
    }
    const currentPrice = planPrices[opp.currentPlan] || 0
    const recommendedPrice = planPrices[opp.recommendedPlan] || 0
    return sum + (recommendedPrice - currentPrice) * 0.3 // 30% conversion rate
  }, currentMRR)

  // Churn risk MRR (high risk users * their MRR * churn probability)
  const churnRisk = await calculateChurnRisk()
  const highRiskMRR = subscriptions
    .filter((sub) => {
      // Simplified - would need to check actual risk
      return sub.paymentRetryCount >= 3 || (sub.gracePeriodEnd && sub.gracePeriodEnd > new Date())
    })
    .reduce((sum, sub) => sum + (sub.discountedPrice || sub.plan.price), 0)

  const churnRiskMRR = highRiskMRR * 0.5 // Assume 50% churn probability for high-risk users

  return {
    currentMRR,
    potentialMRR,
    growthPotential: potentialMRR - currentMRR,
    churnRiskMRR,
  }
}

/**
 * Calculate conversion forecast
 */
export async function calculateConversionForecast(): Promise<ForecastMetrics['conversionForecast']> {
  const { getSubscriptionAnalytics } = await import('./subscription-analytics')
  const analytics = await getSubscriptionAnalytics()
  const opportunities = analytics.conversionOpportunities || []

  const planPrices: Record<string, number> = {
    free: 0,
    pro: 29.99,
    team: 99.99,
    enterprise: 299.99,
  }

  // Estimate conversions (30% conversion rate for upgrade offers)
  const estimatedConversions = Math.floor(opportunities.length * 0.3)

  const estimatedRevenue = opportunities
    .slice(0, estimatedConversions)
    .reduce((sum, opp) => {
      const currentPrice = planPrices[opp.currentPlan] || 0
      const recommendedPrice = planPrices[opp.recommendedPlan] || 0
      return sum + (recommendedPrice - currentPrice)
    }, 0)

  return {
    opportunities: opportunities.length,
    estimatedConversions,
    estimatedRevenue,
    conversionRate: opportunities.length > 0 ? (estimatedConversions / opportunities.length) * 100 : 0,
  }
}

/**
 * Calculate usage trends
 */
export async function calculateUsageTrends(): Promise<ForecastMetrics['usageTrends']> {
  const subscriptions = await prisma.subscription.findMany({
    where: {
      status: 'active',
      enabled: true,
    },
  })

  let totalUsage = 0
  let usersApproachingLimits = 0
  let count = 0

  for (const sub of subscriptions) {
    try {
      const usage = await getUsageStats(sub.userId)
      if (!usage) continue

      const meters = [usage.devices, usage.apiTraces, usage.logs, usage.sessions]
      const maxUsage = Math.max(...meters.map((m) => m?.percentage || 0))

      totalUsage += maxUsage
      count++

      if (maxUsage >= 80) {
        usersApproachingLimits++
      }
    } catch (error) {
      // Skip on error
    }
  }

  const averageUsageGrowth = count > 0 ? totalUsage / count : 0

  // Projected churn: users at 100%+ usage with high churn probability
  const churnRisk = await calculateChurnRisk()
  const projectedChurn = Math.floor(churnRisk.high * 0.5) // 50% churn probability

  return {
    averageUsageGrowth,
    usersApproachingLimits,
    projectedChurn,
  }
}

/**
 * Get comprehensive forecast metrics
 */
export async function getForecastMetrics(): Promise<ForecastMetrics> {
  const [churnRisk, revenueForecast, conversionForecast, usageTrends] = await Promise.all([
    calculateChurnRisk(),
    calculateRevenueForecast(),
    calculateConversionForecast(),
    calculateUsageTrends(),
  ])

  return {
    churnRisk,
    revenueForecast,
    conversionForecast,
    usageTrends,
  }
}

