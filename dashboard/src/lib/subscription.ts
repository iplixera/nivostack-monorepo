import { prisma } from './prisma'
import { getPlan } from './plan'

export type Subscription = {
  id: string
  userId: string
  planId: string
  status: string
  enabled: boolean
  trialStartDate: Date
  trialEndDate: Date
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelledAt: Date | null
  cancelledReason: string | null
  disabledBy: string | null
  disabledAt: Date | null
  enabledBy: string | null
  enabledAt: Date | null
  createdAt: Date
  updatedAt: Date
  plan?: any
}

/**
 * Create a new subscription for a user
 */
export async function createSubscription(
  userId: string,
  planName: string = 'free'
): Promise<Subscription> {
  const plan = await prisma.plan.findUnique({
    where: { name: planName },
  })

  if (!plan) {
    throw new Error(`Plan "${planName}" not found`)
  }

  const trialStartDate = new Date()
  
  // Use plan's retentionDays as trial period, or default to 30 days
  // For free plans, retentionDays typically represents the trial period
  const trialDays = plan.retentionDays || 30
  const trialEndDate = new Date(trialStartDate)
  trialEndDate.setDate(trialEndDate.getDate() + trialDays)

  const currentPeriodEnd = new Date(trialEndDate)

  return prisma.subscription.create({
    data: {
      userId,
      planId: plan.id,
      status: 'active',
      trialStartDate,
      trialEndDate,
      currentPeriodStart: trialStartDate,
      currentPeriodEnd,
    },
    include: {
      plan: true,
    },
  })
}

/**
 * Get user's subscription
 */
export async function getSubscription(userId: string): Promise<Subscription | null> {
  try {
    const sub = await prisma.subscription.findUnique({
      where: { userId },
      include: {
        plan: true,
      },
    })
    // Type assertion to include admin fields
    return sub as Subscription | null
  } catch (error: any) {
    // If Plan table or columns don't exist (migration not run), try without plan
    if (error?.message?.includes('does not exist') || 
        error?.message?.includes('column') ||
        error?.code === 'P2022' || error?.code === 'P2021') {
      console.warn('Plan table or columns not found, fetching subscription without plan:', error.message)
      try {
        const sub = await prisma.subscription.findUnique({
          where: { userId },
        })
        return sub as Subscription | null
      } catch (innerError) {
        console.error('Failed to fetch subscription:', innerError)
        return null
      }
    }
    throw error
  }
}

/**
 * Check if trial is still active
 */
export async function isTrialActive(subscription: Subscription | null): Promise<boolean> {
  if (!subscription) return false
  
  // Check if admin disabled the subscription
  if (subscription.enabled === false) return false
  
  // Check if trial expired
  if (subscription.status === 'expired') return false
  if (subscription.status !== 'active') return false
  
  const now = new Date()
  return subscription.trialEndDate > now
}

/**
 * Check if subscription allows a specific feature
 */
export async function isFeatureAllowed(
  subscription: Subscription | null,
  feature: string
): Promise<boolean> {
  if (!subscription) return false
  
  // If trial expired, no features allowed
  if (!(await isTrialActive(subscription))) {
    return false
  }

  const plan = await getPlan(subscription.planId)
  if (!plan) return false

  // Map feature names to plan flags
  const featureMap: Record<string, keyof typeof plan> = {
    deviceTracking: 'allowScreenTracking', // Device registration uses screen tracking flag
    sessionTracking: 'allowScreenTracking', // Sessions use screen tracking flag
    apiTracking: 'allowApiTracking',
    screenTracking: 'allowScreenTracking',
    crashReporting: 'allowCrashReporting',
    logging: 'allowLogging',
    businessConfig: 'allowBusinessConfig',
    localization: 'allowLocalization',
    customDomains: 'allowCustomDomains',
    webhooks: 'allowWebhooks',
    teamMembers: 'allowTeamMembers',
    prioritySupport: 'allowPrioritySupport',
  }

  const planFlag = featureMap[feature]
  if (!planFlag) return false

  return plan[planFlag] === true
}

/**
 * Get usage statistics for a subscription
 */
export async function getUsageStats(userId: string) {
  const subscription = await getSubscription(userId)
  if (!subscription) {
    return null
  }

  let plan
  try {
    plan = await getPlan(subscription.planId)
  } catch (error: any) {
    // If Plan table or columns don't exist (migration not run), return null
    if (error?.message?.includes('does not exist') || 
        error?.message?.includes('column') ||
        error?.code === 'P2022' || error?.code === 'P2021') {
      console.warn('Plan table or columns not found, returning null for usage stats:', error.message)
      return null
    }
    throw error
  }

  if (!plan) {
    return null
  }

  // Use quota overrides if set, otherwise use plan defaults
  const getLimit = (quotaOverride: number | null | undefined, planLimit: number | null | undefined) => {
    return quotaOverride !== undefined && quotaOverride !== null ? quotaOverride : (planLimit ?? null)
  }

  // Safely access plan fields that might not exist yet
  const planAny = plan as any
  const maxProjects = getLimit((subscription as any).quotaMaxProjects, plan.maxProjects)
  const maxDevices = getLimit((subscription as any).quotaMaxDevices, plan.maxDevices)
  const maxMockEndpoints = getLimit((subscription as any).quotaMaxMockEndpoints, plan.maxMockEndpoints)
  const maxApiEndpoints = getLimit((subscription as any).quotaMaxApiEndpoints, plan.maxApiEndpoints)
  const maxApiRequests = getLimit((subscription as any).quotaMaxApiRequests, plan.maxApiRequests)
  const maxLogs = getLimit((subscription as any).quotaMaxLogs, plan.maxLogs)
  const maxSessions = getLimit((subscription as any).quotaMaxSessions, plan.maxSessions)
  const maxCrashes = getLimit((subscription as any).quotaMaxCrashes, plan.maxCrashes)
  const maxBusinessConfigKeys = getLimit((subscription as any).quotaMaxBusinessConfigKeys, plan.maxBusinessConfigKeys)
  const maxLocalizationLanguages = getLimit((subscription as any).quotaMaxLocalizationLanguages, plan.maxLocalizationLanguages)
  const maxLocalizationKeys = getLimit((subscription as any).quotaMaxLocalizationKeys, plan.maxLocalizationKeys)
  // Safely access maxTeamMembers/maxSeats which might not exist yet
  const maxTeamMembers = getLimit((subscription as any).quotaMaxTeamMembers, planAny.maxTeamMembers ?? planAny.maxSeats ?? null)

  // FIXED: Use currentPeriodStart/currentPeriodEnd instead of trialStartDate/trialEndDate
  const periodStart = subscription.currentPeriodStart
  const periodEnd = subscription.currentPeriodEnd

  // Count usage for current billing period
  const [mockEndpoints, logs, sessions, crashes, devices, projects, apiEndpoints, apiRequests, businessConfigKeys, localizationLanguages, localizationKeys, teamMembers] = await Promise.all([
    // Mock Endpoints: Lifetime meter (never reset)
    prisma.mockEndpoint.count({
      where: {
        environment: {
          project: { userId },
        },
      },
    }),
    prisma.log.count({
      where: {
        project: { userId },
        createdAt: { gte: periodStart, lt: periodEnd },
      },
    }),
    prisma.session.count({
      where: {
        project: { userId },
        createdAt: { gte: periodStart, lt: periodEnd },
      },
    }),
    prisma.crash.count({
      where: {
        project: { userId },
        createdAt: { gte: periodStart, lt: periodEnd },
      },
    }),
    // FIXED: Devices now period-based (resets monthly)
    prisma.device.count({
      where: {
        project: { userId },
        createdAt: { gte: periodStart, lt: periodEnd },
      },
    }),
    // Projects: Lifetime meter (never reset)
    prisma.project.count({
      where: { userId },
    }),
    // API Endpoints: Unique endpoints in current period
    prisma.apiTrace.groupBy({
      by: ['url'],
      where: {
        project: { userId },
        createdAt: { gte: periodStart, lt: periodEnd },
      },
    }).then(result => result.length),
    // API Requests: Total requests in current period
    prisma.apiTrace.count({
      where: {
        project: { userId },
        createdAt: { gte: periodStart, lt: periodEnd },
      },
    }),
    // Business Config Keys: Lifetime meter (never reset)
    prisma.businessConfig.count({
      where: { project: { userId } },
    }),
    // Localization Languages: Lifetime meter (never reset)
    prisma.language.count({
      where: { project: { userId } },
    }),
    // Localization Keys: Lifetime meter (never reset)
    prisma.localizationKey.count({
      where: { project: { userId } },
    }),
    // Team Members: Count all unique team members across all projects owned by user
    // This counts all ProjectMember entries for projects owned by the user
    // Note: The owner themselves are counted if they have ProjectMember entries
    (async () => {
      try {
        const ownedProjects = await prisma.project.findMany({
          where: { userId },
          select: { id: true },
        })
        const projectIds = ownedProjects.map(p => p.id)
        if (projectIds.length === 0) return 0
        
        // Count unique users who are members of any owned project
        // This includes all invited members (admin, member, viewer roles)
        const uniqueMembers = await prisma.projectMember.findMany({
          where: { projectId: { in: projectIds } },
          select: { userId: true },
        })
        
        // Get unique user IDs (using Set to deduplicate)
        const uniqueUserIds = new Set(uniqueMembers.map(m => m.userId))
        
        // Return count of unique team members
        // Note: This counts all members, not including the owner unless they have a ProjectMember entry
        return uniqueUserIds.size
      } catch (error: any) {
        // If ProjectMember table doesn't exist (migration not run), return 0
        if (error?.message?.includes('does not exist') || 
            error?.message?.includes('model') ||
            error?.code === 'P2021') {
          console.warn('ProjectMember table not found, returning 0 for team members:', error.message)
          return 0
        }
        throw error
      }
    })(),
  ])

  return {
    mockEndpoints: {
      used: mockEndpoints,
      limit: maxMockEndpoints,
      percentage: maxMockEndpoints ? (mockEndpoints / maxMockEndpoints) * 100 : 0,
    },
    apiEndpoints: {
      used: apiEndpoints,
      limit: maxApiEndpoints,
      percentage: maxApiEndpoints ? (apiEndpoints / maxApiEndpoints) * 100 : 0,
    },
    apiRequests: {
      used: apiRequests,
      limit: maxApiRequests,
      percentage: maxApiRequests ? (apiRequests / maxApiRequests) * 100 : 0,
    },
    logs: {
      used: logs,
      limit: maxLogs,
      percentage: maxLogs ? (logs / maxLogs) * 100 : 0,
    },
    sessions: {
      used: sessions,
      limit: maxSessions,
      percentage: maxSessions ? (sessions / maxSessions) * 100 : 0,
    },
    crashes: {
      used: crashes,
      limit: maxCrashes,
      percentage: maxCrashes ? (crashes / maxCrashes) * 100 : 0,
    },
    devices: {
      used: devices,
      limit: maxDevices,
      percentage: maxDevices ? (devices / maxDevices) * 100 : 0,
    },
    projects: {
      used: projects,
      limit: maxProjects,
      percentage: maxProjects ? (projects / maxProjects) * 100 : 0,
    },
    businessConfigKeys: {
      used: businessConfigKeys,
      limit: maxBusinessConfigKeys,
      percentage: maxBusinessConfigKeys ? (businessConfigKeys / maxBusinessConfigKeys) * 100 : 0,
    },
    localizationLanguages: {
      used: localizationLanguages,
      limit: maxLocalizationLanguages,
      percentage: maxLocalizationLanguages ? (localizationLanguages / maxLocalizationLanguages) * 100 : 0,
    },
    localizationKeys: {
      used: localizationKeys,
      limit: maxLocalizationKeys,
      percentage: maxLocalizationKeys ? (localizationKeys / maxLocalizationKeys) * 100 : 0,
    },
    teamMembers: {
      used: teamMembers,
      limit: maxTeamMembers,
      percentage: maxTeamMembers ? (teamMembers / maxTeamMembers) * 100 : 0,
    },
    trialActive: await isTrialActive(subscription),
    trialEndDate: subscription.trialEndDate,
    currentPeriodStart: subscription.currentPeriodStart,
    currentPeriodEnd: subscription.currentPeriodEnd,
    daysRemaining: Math.max(
      0,
      Math.ceil((subscription.currentPeriodEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    ),
  }
}

/**
 * Update subscription status to expired
 */
export async function expireSubscription(subscriptionId: string): Promise<void> {
  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      status: 'expired',
    },
  })
}

