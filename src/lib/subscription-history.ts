import { prisma } from './prisma'

export type SubscriptionHistory = {
  id: string
  subscriptionId: string
  userId: string
  planId: string
  periodStart: Date
  periodEnd: Date
  status: string
  totalInvoiced: number
  totalPaid: number | null
  devicesRegistered: number
  apiTracesCount: number
  apiRequestsCount: number
  logsCount: number
  sessionsCount: number
  crashesCount: number
  createdAt: Date
}

/**
 * Create a history record for a completed billing period
 */
export async function createHistoryRecord(
  subscriptionId: string,
  data: {
    userId: string
    planId: string
    periodStart: Date
    periodEnd: Date
    status: 'completed' | 'cancelled' | 'expired'
    totalInvoiced: number
    totalPaid?: number | null
  }
): Promise<SubscriptionHistory> {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: { user: { include: { projects: { select: { id: true } } } } }
  })

  if (!subscription) {
    throw new Error(`Subscription ${subscriptionId} not found`)
  }

  const projectIds = subscription.user.projects.map(p => p.id)

  // Calculate usage statistics for this period
  const [devicesRegistered, apiTracesCount, logsCount, sessionsCount, crashesCount] = await Promise.all([
    prisma.device.count({
      where: {
        project: { userId: data.userId },
        createdAt: { gte: data.periodStart, lt: data.periodEnd },
      },
    }),
    prisma.apiTrace.count({
      where: {
        project: { userId: data.userId },
        createdAt: { gte: data.periodStart, lt: data.periodEnd },
      },
    }),
    prisma.log.count({
      where: {
        project: { userId: data.userId },
        createdAt: { gte: data.periodStart, lt: data.periodEnd },
      },
    }),
    prisma.session.count({
      where: {
        project: { userId: data.userId },
        createdAt: { gte: data.periodStart, lt: data.periodEnd },
      },
    }),
    prisma.crash.count({
      where: {
        project: { userId: data.userId },
        createdAt: { gte: data.periodStart, lt: data.periodEnd },
      },
    }),
  ])

  // API requests count (same as apiTraces for now, can be enhanced later)
  const apiRequestsCount = apiTracesCount

  return prisma.subscriptionHistory.create({
    data: {
      subscriptionId,
      userId: data.userId,
      planId: data.planId,
      periodStart: data.periodStart,
      periodEnd: data.periodEnd,
      status: data.status,
      totalInvoiced: data.totalInvoiced,
      totalPaid: data.totalPaid || null,
      devicesRegistered,
      apiTracesCount,
      apiRequestsCount,
      logsCount,
      sessionsCount,
      crashesCount,
    },
  })
}

/**
 * Get subscription history for a user
 */
export async function getHistoryByUserId(userId: string): Promise<SubscriptionHistory[]> {
  return prisma.subscriptionHistory.findMany({
    where: { userId },
    orderBy: { periodStart: 'desc' },
    include: {
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
}

/**
 * Get subscription history for a subscription
 */
export async function getHistoryBySubscriptionId(subscriptionId: string): Promise<SubscriptionHistory[]> {
  return prisma.subscriptionHistory.findMany({
    where: { subscriptionId },
    orderBy: { periodStart: 'desc' },
    include: {
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
}

/**
 * Get subscription count for a user (number of completed periods)
 */
export async function getSubscriptionCount(userId: string): Promise<number> {
  return prisma.subscriptionHistory.count({
    where: {
      userId,
      status: 'completed',
    },
  })
}

