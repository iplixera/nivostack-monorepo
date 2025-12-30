import { prisma } from './prisma'
import { getUsageStats } from './subscription'

export type UsageSegment = 'low' | 'medium' | 'high' | 'exceeded'
export type PlanDistribution = {
  planName: string
  planDisplayName: string
  count: number
  percentage: number
  totalRevenue: number
}

export type UsageSegmentStats = {
  segment: UsageSegment
  label: string
  count: number
  percentage: number
  users: Array<{
    userId: string
    email: string
    planName: string
    usagePercentage: number
    meters: Record<string, { used: number; limit: number | null; percentage: number }>
  }>
}

export type SubscriptionAnalytics = {
  planDistribution: PlanDistribution[]
  usageSegmentation: {
    devices: UsageSegmentStats[]
    apiRequests: UsageSegmentStats[]
    logs: UsageSegmentStats[]
    sessions: UsageSegmentStats[]
  }
  atRiskUsers: Array<{
    userId: string
    email: string
    planName: string
    highestUsage: { meter: string; percentage: number }
    allMeters: Record<string, { used: number; limit: number | null; percentage: number }>
  }>
  atLimitUsers: Array<{
    userId: string
    email: string
    planName: string
    exceededMeters: string[]
    allMeters: Record<string, { used: number; limit: number | null; percentage: number }>
  }>
  conversionOpportunities: Array<{
    userId: string
    email: string
    currentPlan: string
    recommendedPlan: string
    reason: string
    usagePercentage: number
  }>
  summary: {
    totalUsers: number
    totalActiveSubscriptions: number
    averageUsagePercentage: number
    usersAtRisk: number
    usersAtLimit: number
    conversionOpportunities: number
  }
}

/**
 * Get subscription analytics with usage segmentation
 */
export async function getSubscriptionAnalytics(): Promise<SubscriptionAnalytics> {
  // Get all active subscriptions with users and plans
  const subscriptions = await prisma.subscription.findMany({
    where: {
      status: 'active',
      enabled: true,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
      plan: {
        select: {
          id: true,
          name: true,
          displayName: true,
          price: true,
        },
      },
    },
  })

  // Plan distribution
  const planCounts: Record<string, { count: number; revenue: number }> = {}
  subscriptions.forEach((sub) => {
    const planName = sub.plan.name
    if (!planCounts[planName]) {
      planCounts[planName] = { count: 0, revenue: 0 }
    }
    planCounts[planName].count++
    planCounts[planName].revenue += sub.plan.price
  })

  const totalSubscriptions = subscriptions.length
  const planDistribution: PlanDistribution[] = Object.entries(planCounts).map(
    ([planName, data]) => {
      const plan = subscriptions.find((s) => s.plan.name === planName)?.plan
      return {
        planName,
        planDisplayName: plan?.displayName || planName,
        count: data.count,
        percentage: totalSubscriptions > 0 ? (data.count / totalSubscriptions) * 100 : 0,
        totalRevenue: data.revenue,
      }
    }
  )

  // Usage segmentation
  const usageData: Array<{
    userId: string
    email: string
    planName: string
    usage: Awaited<ReturnType<typeof getUsageStats>>
  }> = []

  for (const sub of subscriptions) {
    try {
      const usage = await getUsageStats(sub.userId)
      if (usage) {
        usageData.push({
          userId: sub.userId,
          email: sub.user.email,
          planName: sub.plan.name,
          usage,
        })
      }
    } catch (error) {
      console.error(`Error getting usage for user ${sub.userId}:`, error)
    }
  }

  // Segment users by usage percentage
  function segmentByUsage(
    meterKey: 'devices' | 'apiRequests' | 'logs' | 'sessions'
  ): UsageSegmentStats[] {
    const segments: Record<UsageSegment, typeof usageData> = {
      low: [],
      medium: [],
      high: [],
      exceeded: [],
    }

    usageData.forEach((data) => {
      if (!data.usage) return
      const meter = (data.usage as any)[meterKey]
      if (!meter) return

      const percentage = meter.percentage
      let segment: UsageSegment

      if (meter.limit === null) {
        // Unlimited - consider as low usage
        segment = 'low'
      } else if (percentage >= 100) {
        segment = 'exceeded'
      } else if (percentage >= 80) {
        segment = 'high'
      } else if (percentage >= 50) {
        segment = 'medium'
      } else {
        segment = 'low'
      }

      segments[segment].push(data)
    })

    return [
      {
        segment: 'low',
        label: 'Low Usage (0-50%)',
        count: segments.low.length,
        percentage: usageData.length > 0 ? (segments.low.length / usageData.length) * 100 : 0,
        users: segments.low.filter(d => d.usage).map((d) => ({
          userId: d.userId,
          email: d.email,
          planName: d.planName,
          usagePercentage: d.usage![meterKey]?.percentage || 0,
          meters: {
            devices: d.usage!.devices,
            apiRequests: d.usage!.apiRequests,
            logs: d.usage!.logs,
            sessions: d.usage!.sessions,
          },
        })),
      },
      {
        segment: 'medium',
        label: 'Medium Usage (50-80%)',
        count: segments.medium.length,
        percentage: usageData.length > 0 ? (segments.medium.length / usageData.length) * 100 : 0,
        users: segments.medium.filter(d => d.usage).map((d) => ({
          userId: d.userId,
          email: d.email,
          planName: d.planName,
          usagePercentage: d.usage![meterKey]?.percentage || 0,
          meters: {
            devices: d.usage!.devices,
            apiRequests: d.usage!.apiRequests,
            logs: d.usage!.logs,
            sessions: d.usage!.sessions,
          },
        })),
      },
      {
        segment: 'high',
        label: 'High Usage (80-100%)',
        count: segments.high.length,
        percentage: usageData.length > 0 ? (segments.high.length / usageData.length) * 100 : 0,
        users: segments.high.filter(d => d.usage).map((d) => ({
          userId: d.userId,
          email: d.email,
          planName: d.planName,
          usagePercentage: d.usage![meterKey]?.percentage || 0,
          meters: {
            devices: d.usage!.devices,
            apiRequests: d.usage!.apiRequests,
            logs: d.usage!.logs,
            sessions: d.usage!.sessions,
          },
        })),
      },
      {
        segment: 'exceeded',
        label: 'Exceeded Limit (100%+)',
        count: segments.exceeded.length,
        percentage: usageData.length > 0 ? (segments.exceeded.length / usageData.length) * 100 : 0,
        users: segments.exceeded.filter(d => d.usage).map((d) => ({
          userId: d.userId,
          email: d.email,
          planName: d.planName,
          usagePercentage: d.usage![meterKey]?.percentage || 0,
          meters: {
            devices: d.usage!.devices,
            apiRequests: d.usage!.apiRequests,
            logs: d.usage!.logs,
            sessions: d.usage!.sessions,
          },
        })),
      },
    ]
  }

  // At-risk users (80%+ usage on any meter)
  const atRiskUsers = usageData
    .filter((d) => {
      const meters = d.usage ? [d.usage.devices, d.usage.apiRequests, d.usage.logs, d.usage.sessions] : []
      return meters.some((m) => m && m.limit !== null && m.percentage >= 80 && m.percentage < 100)
    })
    .filter(d => d.usage)
    .map((d) => {
      const meters = {
        devices: d.usage!.devices,
        apiRequests: d.usage!.apiRequests,
        logs: d.usage!.logs,
        sessions: d.usage!.sessions,
      }
      const highestUsage = Object.entries(meters)
        .map(([key, meter]) => ({ meter: key, percentage: meter.percentage }))
        .sort((a, b) => b.percentage - a.percentage)[0]

      return {
        userId: d.userId,
        email: d.email,
        planName: d.planName,
        highestUsage,
        allMeters: meters,
      }
    })
    .sort((a, b) => b.highestUsage.percentage - a.highestUsage.percentage)

  // At-limit users (100%+ usage on any meter)
  const atLimitUsers = usageData
    .filter((d) => {
      const meters = d.usage ? [d.usage.devices, d.usage.apiRequests, d.usage.logs, d.usage.sessions] : []
      return meters.some((m) => m && m.limit !== null && m.percentage >= 100)
    })
    .filter(d => d.usage)
    .map((d) => {
      const meters = {
        devices: d.usage!.devices,
        apiRequests: d.usage!.apiRequests,
        logs: d.usage!.logs,
        sessions: d.usage!.sessions,
      }
      const exceededMeters = Object.entries(meters)
        .filter(([_, meter]) => meter.limit !== null && meter.percentage >= 100)
        .map(([key]) => key)

      return {
        userId: d.userId,
        email: d.email,
        planName: d.planName,
        exceededMeters,
        allMeters: meters,
      }
    })

  // Conversion opportunities (users on lower plans with high usage)
  const conversionOpportunities: SubscriptionAnalytics['conversionOpportunities'] = []
  const planHierarchy = ['free', 'pro', 'team', 'enterprise']
  
  usageData.forEach((d) => {
    const currentPlanIndex = planHierarchy.indexOf(d.planName)
    if (currentPlanIndex === -1 || currentPlanIndex === planHierarchy.length - 1 || !d.usage) return

    const meters = [d.usage.devices, d.usage.apiRequests, d.usage.logs, d.usage.sessions]
    const maxUsage = Math.max(...meters.map((m) => m?.percentage || 0))

    if (maxUsage >= 80) {
      const recommendedPlan = planHierarchy[currentPlanIndex + 1]
      conversionOpportunities.push({
        userId: d.userId,
        email: d.email,
        currentPlan: d.planName,
        recommendedPlan,
        reason: `Usage at ${maxUsage.toFixed(1)}% - Consider upgrading to ${recommendedPlan}`,
        usagePercentage: maxUsage,
      })
    }
  })

  // Calculate summary
  const totalUsagePercentages = usageData.filter(d => d.usage).map((d) => {
    const meters = [d.usage!.devices, d.usage!.apiRequests, d.usage!.logs, d.usage!.sessions]
    return Math.max(...meters.map((m) => m?.percentage || 0))
  })
  const averageUsagePercentage =
    totalUsagePercentages.length > 0
      ? totalUsagePercentages.reduce((a, b) => a + b, 0) / totalUsagePercentages.length
      : 0

  return {
    planDistribution,
    usageSegmentation: {
      devices: segmentByUsage('devices'),
      apiRequests: segmentByUsage('apiRequests'),
      logs: segmentByUsage('logs'),
      sessions: segmentByUsage('sessions'),
    },
    atRiskUsers,
    atLimitUsers,
    conversionOpportunities: conversionOpportunities.sort((a, b) => b.usagePercentage - a.usagePercentage),
    summary: {
      totalUsers: subscriptions.length,
      totalActiveSubscriptions: subscriptions.length,
      averageUsagePercentage,
      usersAtRisk: atRiskUsers.length,
      usersAtLimit: atLimitUsers.length,
      conversionOpportunities: conversionOpportunities.length,
    },
  }
}

