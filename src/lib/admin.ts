import { prisma } from './prisma'

/**
 * Check if user is admin
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true },
  })
  return user?.isAdmin === true
}

/**
 * Get all users with their subscriptions
 */
export async function getAllUsers() {
  return prisma.user.findMany({
    include: {
      subscription: {
        include: {
          plan: true,
        },
      },
      projects: {
        select: {
          id: true,
        },
      },
      _count: {
        select: {
          projects: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

/**
 * Get all subscriptions with user details
 */
export async function getAllSubscriptions() {
  return prisma.subscription.findMany({
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
          maxProjects: true,
          maxDevices: true,
          maxMockEndpoints: true,
          maxApiEndpoints: true,
          maxApiRequests: true,
          maxLogs: true,
          maxSessions: true,
          maxCrashes: true,
          maxBusinessConfigKeys: true,
          maxLocalizationLanguages: true,
          maxLocalizationKeys: true,
          retentionDays: true,
        },
      },
      invoices: {
        select: {
          id: true,
          amount: true,
          status: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 1, // Latest invoice
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

/**
 * Enable a subscription (admin action)
 */
export async function enableSubscription(
  subscriptionId: string,
  adminUserId: string
): Promise<void> {
  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      enabled: true,
      enabledBy: adminUserId,
      enabledAt: new Date(),
      updatedAt: new Date(),
    },
  })
}

/**
 * Disable a subscription (admin action)
 */
export async function disableSubscription(
  subscriptionId: string,
  adminUserId: string
): Promise<void> {
  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      enabled: false,
      disabledBy: adminUserId,
      disabledAt: new Date(),
      updatedAt: new Date(),
    },
  })
}

/**
 * Get platform statistics (admin only)
 */
export async function getPlatformStats() {
  const [
    totalUsers,
    activeSubscriptions,
    expiredSubscriptions,
    disabledSubscriptions,
    totalProjects,
    totalDevices,
    totalApiTraces,
    totalLogs,
    totalSessions,
    totalCrashes,
    businessConfigs,
    localizationKeys,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.subscription.count({
      where: {
        enabled: true,
        status: 'active',
      },
    }),
    prisma.subscription.count({
      where: {
        status: 'expired',
      },
    }),
    prisma.subscription.count({
      where: {
        enabled: false,
      },
    }),
    prisma.project.count(),
    prisma.device.count(),
    prisma.apiTrace.count(),
    prisma.log.count(),
    prisma.session.count(),
    prisma.crash.count(),
    prisma.businessConfig.count(),
    prisma.localizationKey.count(),
  ])

  return {
    users: {
      total: totalUsers,
      active: activeSubscriptions,
      expired: expiredSubscriptions,
      disabled: disabledSubscriptions,
    },
    platform: {
      projects: totalProjects,
      devices: totalDevices,
      apiTraces: totalApiTraces,
      logs: totalLogs,
      sessions: totalSessions,
      crashes: totalCrashes,
    },
    features: {
      businessConfig: businessConfigs,
      localization: localizationKeys,
    },
  }
}

/**
 * Get revenue statistics (admin only)
 */
export async function getRevenueStats() {
  const subscriptions = await prisma.subscription.findMany({
    include: {
      plan: true,
      invoices: {
        where: {
          status: 'paid',
        },
      },
    },
  })

  const totalRevenue = subscriptions.reduce((sum, sub) => {
    const invoiceTotal = sub.invoices.reduce((invoiceSum, inv) => invoiceSum + inv.amount, 0)
    return sum + invoiceTotal
  }, 0)

  const activeSubscriptions = subscriptions.filter(
    (sub) => sub.enabled && sub.status === 'active'
  ).length

  const expiredSubscriptions = subscriptions.filter(
    (sub) => sub.status === 'expired'
  ).length

  return {
    totalRevenue,
    activeSubscriptions,
    expiredSubscriptions,
  }
}

/**
 * Get all plans with subscription counts
 */
export async function getAllPlans() {
  return prisma.plan.findMany({
    include: {
      _count: {
        select: {
          subscriptions: true,
        },
      },
    },
    orderBy: {
      price: 'asc',
    },
  })
}

/**
 * Get plan by ID
 */
export async function getPlanById(planId: string) {
  return prisma.plan.findUnique({
    where: { id: planId },
    include: {
      _count: {
        select: {
          subscriptions: true,
        },
      },
    },
  })
}

/**
 * Create a new plan (admin only)
 */
export async function createPlan(data: {
  name: string
  displayName: string
  description?: string | null
  price: number
  currency?: string
  interval?: string
  isActive?: boolean
  isPublic?: boolean
  maxProjects?: number | null
  maxDevices?: number | null
  maxMockEndpoints?: number | null
  maxApiEndpoints?: number | null
  maxApiRequests?: number | null
  maxLogs?: number | null
  maxSessions?: number | null
  maxCrashes?: number | null
  retentionDays?: number | null
  allowApiTracking?: boolean
  allowScreenTracking?: boolean
  allowCrashReporting?: boolean
  allowLogging?: boolean
  allowBusinessConfig?: boolean
  allowLocalization?: boolean
  allowCustomDomains?: boolean
  allowWebhooks?: boolean
  allowTeamMembers?: boolean
  allowPrioritySupport?: boolean
  enforcementConfig?: any
}) {
  return prisma.plan.create({
    data: {
      name: data.name,
      displayName: data.displayName,
      description: data.description || null,
      price: data.price,
      currency: data.currency || 'USD',
      interval: data.interval || 'month',
      isActive: data.isActive !== undefined ? data.isActive : true,
      isPublic: data.isPublic !== undefined ? data.isPublic : true,
      maxProjects: data.maxProjects ?? null,
      maxDevices: data.maxDevices ?? null,
      maxMockEndpoints: data.maxMockEndpoints ?? null,
      maxApiEndpoints: data.maxApiEndpoints ?? null,
      maxApiRequests: data.maxApiRequests ?? null,
      maxLogs: data.maxLogs ?? null,
      maxSessions: data.maxSessions ?? null,
      maxCrashes: data.maxCrashes ?? null,
      retentionDays: data.retentionDays ?? null,
      allowApiTracking: data.allowApiTracking ?? true,
      allowScreenTracking: data.allowScreenTracking ?? true,
      allowCrashReporting: data.allowCrashReporting ?? true,
      allowLogging: data.allowLogging ?? true,
      allowBusinessConfig: data.allowBusinessConfig ?? true,
      allowLocalization: data.allowLocalization ?? true,
      allowCustomDomains: data.allowCustomDomains ?? false,
      allowWebhooks: data.allowWebhooks ?? false,
      allowTeamMembers: data.allowTeamMembers ?? false,
      allowPrioritySupport: data.allowPrioritySupport ?? false,
      enforcementConfig: data.enforcementConfig || null,
    },
  })
}

/**
 * Update a plan (admin only)
 */
export async function updatePlan(planId: string, data: Partial<{
  name: string
  displayName: string
  description: string | null
  price: number
  currency: string
  interval: string
  isActive: boolean
  isPublic: boolean
  maxProjects: number | null
  maxDevices: number | null
  maxMockEndpoints: number | null
  maxApiEndpoints: number | null
  maxApiRequests: number | null
  maxLogs: number | null
  maxSessions: number | null
  maxCrashes: number | null
  retentionDays: number | null
  allowApiTracking: boolean
  allowScreenTracking: boolean
  allowCrashReporting: boolean
  allowLogging: boolean
  allowBusinessConfig: boolean
  allowLocalization: boolean
  allowCustomDomains: boolean
  allowWebhooks: boolean
  allowTeamMembers: boolean
  allowPrioritySupport: boolean
  features?: any
  enforcementConfig?: any
}>) {
  // Filter out read-only fields that might be sent from frontend
  const {
    id,
    createdAt,
    updatedAt,
    _count,
    subscriptions,
    ...updateData
  } = data as any

  return prisma.plan.update({
    where: { id: planId },
    data: {
      ...updateData,
      updatedAt: new Date(),
    },
  })
}

/**
 * Delete a plan (admin only)
 * Only allowed if no active subscriptions use this plan
 */
export async function deletePlan(planId: string) {
  // Check if plan has active subscriptions
  const subscriptionCount = await prisma.subscription.count({
    where: {
      planId,
      status: 'active',
    },
  })

  if (subscriptionCount > 0) {
    throw new Error(`Cannot delete plan: ${subscriptionCount} active subscription(s) are using this plan`)
  }

  return prisma.plan.delete({
    where: { id: planId },
  })
}

/**
 * Change subscription plan (admin only)
 */
export async function changeSubscriptionPlan(
  subscriptionId: string,
  newPlanId: string,
  adminUserId: string
) {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: { plan: true },
  })

  if (!subscription) {
    throw new Error('Subscription not found')
  }

  const plan = await prisma.plan.findUnique({
    where: { id: newPlanId },
  })

  if (!plan) {
    throw new Error('Plan not found')
  }

  return prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      planId: newPlanId,
      // Reset trial dates if moving to free plan
      ...(plan.name === 'free' && {
        trialStartDate: new Date(),
        trialEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      }),
      updatedAt: new Date(),
    },
  })
}

/**
 * Update subscription quotas (admin only)
 */
export async function updateSubscriptionQuotas(
  subscriptionId: string,
  quotas: Partial<{
    quotaMaxProjects: number | null
    quotaMaxDevices: number | null
    quotaMaxMockEndpoints: number | null
    quotaMaxApiEndpoints: number | null
    quotaMaxApiRequests: number | null
    quotaMaxLogs: number | null
    quotaMaxSessions: number | null
    quotaMaxCrashes: number | null
    quotaMaxBusinessConfigKeys: number | null
    quotaMaxLocalizationLanguages: number | null
    quotaMaxLocalizationKeys: number | null
  }>
) {
  return prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      ...quotas,
      updatedAt: new Date(),
    },
    include: {
      plan: true,
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  })
}

/**
 * Update subscription status (admin only)
 */
export async function updateSubscriptionStatus(
  subscriptionId: string,
  status: 'active' | 'expired' | 'cancelled' | 'suspended' | 'disabled',
  adminUserId: string
) {
  const updateData: any = {
    status,
    updatedAt: new Date(),
  }

  if (status === 'disabled' || status === 'suspended') {
    updateData.enabled = false
    updateData.disabledBy = adminUserId
    updateData.disabledAt = new Date()
  } else if (status === 'active') {
    updateData.enabled = true
    updateData.enabledBy = adminUserId
    updateData.enabledAt = new Date()
  }

  return prisma.subscription.update({
    where: { id: subscriptionId },
    data: updateData,
  })
}

/**
 * Get subscription with full details (admin only)
 */
export async function getSubscriptionDetails(subscriptionId: string) {
  return prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
        },
      },
      plan: true,
      invoices: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      },
    },
  })
}

/**
 * Create subscription for a user (admin only)
 */
export async function createSubscriptionForUser(
  userId: string,
  planId: string,
  adminUserId: string,
  options?: {
    promoCodeId?: string
    discountPercent?: number
    discountAmount?: number
  }
) {
  // Check if user already has a subscription
  const existingSubscription = await prisma.subscription.findUnique({
    where: { userId },
  })

  if (existingSubscription) {
    throw new Error('User already has a subscription. Use changeSubscriptionPlan instead.')
  }

  // Get plan
  const plan = await prisma.plan.findUnique({
    where: { id: planId },
  })

  if (!plan) {
    throw new Error('Plan not found')
  }

  // Calculate discount
  let discountPercent = options?.discountPercent || null
  let discountAmount = options?.discountAmount || null
  let discountedPrice = plan.price

  // If promo code provided, validate and apply
  if (options?.promoCodeId) {
    const promoCode = await prisma.promoCode.findUnique({
      where: { id: options.promoCodeId },
    })

    if (!promoCode) {
      throw new Error('Promo code not found')
    }

    if (!promoCode.isActive) {
      throw new Error('Promo code is not active')
    }

    const now = new Date()
    if (now < promoCode.validFrom) {
      throw new Error('Promo code is not yet valid')
    }

    if (promoCode.validUntil && now > promoCode.validUntil) {
      throw new Error('Promo code has expired')
    }

    if (promoCode.maxUses !== null && promoCode.currentUses >= promoCode.maxUses) {
      throw new Error('Promo code has reached maximum uses')
    }

    if (promoCode.applicablePlans.length > 0 && !promoCode.applicablePlans.includes(plan.name)) {
      throw new Error('Promo code does not apply to this plan')
    }

    if (promoCode.minPlanPrice !== null && plan.price < promoCode.minPlanPrice) {
      throw new Error('Promo code requires a higher plan price')
    }

    // Apply discount
    if (promoCode.discountType === 'percent') {
      discountPercent = promoCode.discountValue
      discountedPrice = plan.price * (1 - promoCode.discountValue / 100)
    } else {
      discountAmount = promoCode.discountValue
      discountedPrice = Math.max(0, plan.price - promoCode.discountValue)
    }

    // Increment usage
    await prisma.promoCode.update({
      where: { id: promoCode.id },
      data: {
        currentUses: {
          increment: 1,
        },
      },
    })
  } else if (options?.discountPercent) {
    // Direct percentage discount
    discountedPrice = plan.price * (1 - options.discountPercent / 100)
  } else if (options?.discountAmount) {
    // Direct fixed discount
    discountedPrice = Math.max(0, plan.price - options.discountAmount)
  }

  // Calculate trial dates
  const trialStartDate = new Date()
  const trialDays = plan.retentionDays || 30
  const trialEndDate = new Date(trialStartDate)
  trialEndDate.setDate(trialEndDate.getDate() + trialDays)

  // Create subscription
  return prisma.subscription.create({
    data: {
      userId,
      planId,
      status: 'active',
      enabled: true,
      trialStartDate,
      trialEndDate,
      currentPeriodStart: trialStartDate,
      currentPeriodEnd: trialEndDate,
      // Note: promoCodeId, discountPercent, discountAmount, discountedPrice fields don't exist in Subscription model
      // Promo code and discount information should be stored in Invoice model or handled separately
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
      plan: true,
    },
  })
}
