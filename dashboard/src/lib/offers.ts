import { prisma } from './prisma'
import { getUsageStats } from './subscription'
import { sendEmail } from './email'

export type OfferType = 'early_renewal' | 'extension' | 'upgrade'
export type OfferStatus = 'pending' | 'sent' | 'accepted' | 'declined' | 'expired'

export type Offer = {
  id: string
  userId: string
  subscriptionId: string
  type: OfferType
  status: OfferStatus
  discountPercent?: number
  discountAmount?: number
  message?: string
  expiresAt: Date
  createdAt: Date
  acceptedAt?: Date
}

/**
 * Create early renewal offer for users at 80%+ usage
 */
export async function createEarlyRenewalOffers(
  discountPercent: number = 10,
  daysUntilExpiry: number = 7
): Promise<{ created: number; errors: string[] }> {
  const errors: string[] = []
  let created = 0

  // Get all active subscriptions
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

  const now = new Date()
  const expiryDate = new Date(now)
  expiryDate.setDate(expiryDate.getDate() + daysUntilExpiry)

  for (const sub of subscriptions) {
    try {
      // Check if user already has a pending offer
      const existingOffer = await prisma.offer.findFirst({
        where: {
          userId: sub.userId,
          subscriptionId: sub.id,
          type: 'early_renewal',
          status: 'pending',
          expiresAt: { gt: now },
        },
      })

      if (existingOffer) {
        continue // Skip if offer already exists
      }

      // Get usage stats
      const usage = await getUsageStats(sub.userId)
      if (!usage) continue

      // Check if any meter is at 80%+
      const meters = [usage.devices, usage.apiTraces, usage.logs, usage.sessions]
      const maxUsage = Math.max(...meters.map((m) => m?.percentage || 0))

      if (maxUsage >= 80 && maxUsage < 100) {
        // Calculate discount amount
        const discountAmount = sub.plan.price * (discountPercent / 100)
        const discountedPrice = sub.plan.price - discountAmount

        // Create offer
        await prisma.offer.create({
          data: {
            userId: sub.userId,
            subscriptionId: sub.id,
            type: 'early_renewal',
            status: 'pending',
            discountPercent,
            discountAmount,
            message: `Renew early and save ${discountPercent}%! Your usage is at ${maxUsage.toFixed(1)}% and you're approaching your limits.`,
            expiresAt: expiryDate,
          },
        })

        // Send email notification
        await sendEmail(sub.user.email, 'early_renewal_offer', {
          email: sub.user.email,
          planName: sub.plan.displayName,
          discountPercent,
          discountAmount,
          discountedPrice,
          currentUsage: maxUsage.toFixed(1),
          expiresAt: expiryDate,
        })

        created++
      }
    } catch (error) {
      errors.push(`Failed to create offer for user ${sub.userId}: ${error}`)
    }
  }

  return { created, errors }
}

/**
 * Create extension offers for users at 100%+ usage
 */
export async function createExtensionOffers(
  extensionDays: number = 30,
  discountPercent: number = 15
): Promise<{ created: number; errors: string[] }> {
  const errors: string[] = []
  let created = 0

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

  const now = new Date()
  const expiryDate = new Date(now)
  expiryDate.setDate(expiryDate.getDate() + 7) // Offer expires in 7 days

  for (const sub of subscriptions) {
    try {
      // Check if user already has a pending offer
      const existingOffer = await prisma.offer.findFirst({
        where: {
          userId: sub.userId,
          subscriptionId: sub.id,
          type: 'extension',
          status: 'pending',
          expiresAt: { gt: now },
        },
      })

      if (existingOffer) {
        continue
      }

      // Get usage stats
      const usage = await getUsageStats(sub.userId)
      if (!usage) continue

      // Check if any meter is at 100%+
      const meters = [usage.devices, usage.apiTraces, usage.logs, usage.sessions]
      const exceededMeters = meters.filter((m) => m && m.limit !== null && m.percentage >= 100)

      if (exceededMeters.length > 0) {
        const exceededMeterNames = exceededMeters.map((_, i) => {
          const names = ['devices', 'apiTraces', 'logs', 'sessions']
          return names[i]
        })

        // Calculate discount
        const discountAmount = sub.plan.price * (discountPercent / 100)
        const discountedPrice = sub.plan.price - discountAmount

        // Create offer
        await prisma.offer.create({
          data: {
            userId: sub.userId,
            subscriptionId: sub.id,
            type: 'extension',
            status: 'pending',
            discountPercent,
            discountAmount,
            message: `Extend your limits! You've exceeded ${exceededMeterNames.join(', ')}. Get ${extensionDays} extra days with ${discountPercent}% off.`,
            expiresAt: expiryDate,
            metadata: {
              extensionDays,
              exceededMeters: exceededMeterNames,
            } as any,
          },
        })

        // Send email notification
        await sendEmail(sub.user.email, 'extension_offer', {
          email: sub.user.email,
          planName: sub.plan.displayName,
          discountPercent,
          discountAmount,
          discountedPrice,
          extensionDays,
          exceededMeters: exceededMeterNames.join(', '),
          expiresAt: expiryDate,
        })

        created++
      }
    } catch (error) {
      errors.push(`Failed to create extension offer for user ${sub.userId}: ${error}`)
    }
  }

  return { created, errors }
}

/**
 * Create upgrade offers for conversion opportunities
 */
export async function createUpgradeOffers(
  discountPercent: number = 20
): Promise<{ created: number; errors: string[] }> {
  const errors: string[] = []
  let created = 0

  const { getSubscriptionAnalytics } = await import('./subscription-analytics')
  const analytics = await getSubscriptionAnalytics()

  const now = new Date()
  const expiryDate = new Date(now)
  expiryDate.setDate(expiryDate.getDate() + 14) // Offer expires in 14 days

  for (const opp of analytics.conversionOpportunities || []) {
    try {
      // Get subscription
      const subscription = await prisma.subscription.findFirst({
        where: {
          userId: opp.userId,
          status: 'active',
        },
        include: {
          plan: true,
          user: true,
        },
      })

      if (!subscription) continue

      // Get recommended plan
      const recommendedPlan = await prisma.plan.findUnique({
        where: { name: opp.recommendedPlan },
      })

      if (!recommendedPlan) continue

      // Check if offer already exists
      const existingOffer = await prisma.offer.findFirst({
        where: {
          userId: opp.userId,
          subscriptionId: subscription.id,
          type: 'upgrade',
          status: 'pending',
          expiresAt: { gt: now },
        },
      })

      if (existingOffer) continue

      // Calculate discount
      const discountAmount = recommendedPlan.price * (discountPercent / 100)
      const discountedPrice = recommendedPlan.price - discountAmount

      // Create offer
      await prisma.offer.create({
        data: {
          userId: opp.userId,
          subscriptionId: subscription.id,
          type: 'upgrade',
          status: 'pending',
          discountPercent,
          discountAmount,
          message: `Upgrade to ${recommendedPlan.displayName} and save ${discountPercent}%! Your usage is at ${opp.usagePercentage.toFixed(1)}%.`,
          expiresAt: expiryDate,
          metadata: {
            recommendedPlanId: recommendedPlan.id,
            recommendedPlanName: recommendedPlan.name,
            currentUsage: opp.usagePercentage,
          } as any,
        },
      })

      // Send email notification
      await sendEmail(subscription.user.email, 'upgrade_offer', {
        email: subscription.user.email,
        currentPlan: subscription.plan.displayName,
        recommendedPlan: recommendedPlan.displayName,
        discountPercent,
        discountAmount,
        discountedPrice,
        usagePercentage: opp.usagePercentage.toFixed(1),
        expiresAt: expiryDate,
      })

      created++
    } catch (error) {
      errors.push(`Failed to create upgrade offer for user ${opp.userId}: ${error}`)
    }
  }

  return { created, errors }
}

/**
 * Accept an offer
 */
export async function acceptOffer(offerId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: {
        subscription: {
          include: {
            plan: true,
            user: true,
          },
        },
      },
    })

    if (!offer) {
      return { success: false, error: 'Offer not found' }
    }

    if (offer.status !== 'pending') {
      return { success: false, error: `Offer is ${offer.status}` }
    }

    if (offer.expiresAt < new Date()) {
      await prisma.offer.update({
        where: { id: offerId },
        data: { status: 'expired' },
      })
      return { success: false, error: 'Offer has expired' }
    }

    // Handle different offer types
    switch (offer.type) {
      case 'early_renewal':
        // Extend subscription period
        const newPeriodEnd = new Date(offer.subscription.currentPeriodEnd)
        newPeriodEnd.setDate(newPeriodEnd.getDate() + 30) // Add 30 days

        await prisma.subscription.update({
          where: { id: offer.subscriptionId },
          data: {
            currentPeriodEnd: newPeriodEnd,
            subscriptionCount: { increment: 1 },
          },
        })

        // Create invoice with discount
        await prisma.invoice.create({
          data: {
            subscriptionId: offer.subscriptionId,
            invoiceNumber: `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            status: 'paid',
            amount: offer.discountAmount ? offer.subscription.plan.price - offer.discountAmount : offer.subscription.plan.price,
            currency: 'USD',
            periodStart: offer.subscription.currentPeriodStart,
            periodEnd: newPeriodEnd,
            dueDate: newPeriodEnd,
          },
        })
        break

      case 'extension':
        // Extend limits temporarily (would need to implement quota extension logic)
        // For now, extend period
        const extensionEnd = new Date(offer.subscription.currentPeriodEnd)
        extensionEnd.setDate(extensionEnd.getDate() + (offer.metadata as any)?.extensionDays || 30)

        await prisma.subscription.update({
          where: { id: offer.subscriptionId },
          data: {
            currentPeriodEnd: extensionEnd,
          },
        })
        break

      case 'upgrade':
        // Upgrade to recommended plan
        const recommendedPlanId = (offer.metadata as any)?.recommendedPlanId
        if (recommendedPlanId) {
          await prisma.subscription.update({
            where: { id: offer.subscriptionId },
            data: {
              planId: recommendedPlanId,
            },
          })
        }
        break
    }

    // Mark offer as accepted
    await prisma.offer.update({
      where: { id: offerId },
      data: {
        status: 'accepted',
        acceptedAt: new Date(),
      },
    })

    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

