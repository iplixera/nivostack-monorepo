import { prisma } from './prisma'

export type Plan = {
  id: string
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
  maxApiTraces: number | null
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
  features: any | null
  createdAt: Date
  updatedAt: Date
}

/**
 * Get a plan by ID
 */
export async function getPlan(planId: string): Promise<Plan | null> {
  try {
    return await prisma.plan.findUnique({
      where: { id: planId },
    }) as unknown as Promise<Plan | null>
  } catch (error: any) {
    // If Plan table or columns don't exist (migration not run), return null
    if (error?.message?.includes('does not exist') || 
        error?.message?.includes('column') ||
        error?.code === 'P2022' || error?.code === 'P2021') {
      console.warn('Plan table or columns not found, returning null:', error.message)
      return null
    }
    throw error
  }
}

/**
 * Get a plan by name (e.g., "free", "pro", "team")
 */
export async function getPlanByName(name: string): Promise<Plan | null> {
  return prisma.plan.findUnique({
    where: { name },
  }) as unknown as Promise<Plan | null>
}

/**
 * Get all public plans (for pricing page)
 */
export async function getPublicPlans(): Promise<Plan[]> {
  return prisma.plan.findMany({
    where: {
      isPublic: true,
    },
    orderBy: {
      price: 'asc',
    },
  }) as unknown as Promise<Plan[]>
}

/**
 * Get plan limits for a given plan ID
 */
export async function getPlanLimits(planId: string) {
  const plan = await getPlan(planId)
  if (!plan) return null

  return {
    maxProjects: plan.maxProjects,
    maxDevices: plan.maxDevices,
    maxApiTraces: plan.maxApiTraces,
    maxLogs: plan.maxLogs,
    maxSessions: plan.maxSessions,
    maxCrashes: plan.maxCrashes,
    retentionDays: plan.retentionDays,
  }
}

