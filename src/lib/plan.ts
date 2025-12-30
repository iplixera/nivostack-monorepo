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
  return prisma.plan.findUnique({
    where: { id: planId },
  })
}

/**
 * Get a plan by name (e.g., "free", "pro", "team")
 */
export async function getPlanByName(name: string): Promise<Plan | null> {
  return prisma.plan.findUnique({
    where: { name },
  })
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
  })
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

