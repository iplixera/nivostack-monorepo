import { prisma } from './prisma'
import { getUsageStats } from './subscription'
import { getSubscription } from './subscription'

export type EnforcementState = 'ACTIVE' | 'WARN' | 'GRACE' | 'DEGRADED' | 'SUSPENDED'

export type EnforcementConfig = {
  warnThreshold?: number // Default: 80
  hardThreshold?: number // Default: 100
  gracePeriodHours?: number // Default: 48
  overageBufferPercent?: number // Default: 0
  moduleRules?: {
    apiTraces?: {
      samplingRate?: number // Sample 1 in N requests
      dropResponseBodies?: boolean
    }
    logs?: {
      prioritizeCrashes?: boolean
      minRetentionDays?: number
    }
    sessions?: {
      samplingRate?: number // Sample 1 in N sessions
      capEventsPerSession?: number
    }
    businessConfig?: {
      freezePublishing?: boolean
      serveLastPublished?: boolean
    }
    localization?: {
      freezePublishing?: boolean
      serveLastPublished?: boolean
    }
  }
}

export type EffectivePolicy = {
  sampling: {
    apiTraces: { rate: number; enabled: boolean }
    sessions: { rate: number; enabled: boolean }
    logs: { prioritizeCrashes: boolean; dropDebug: boolean }
  }
  retention: {
    apiTraces: number
    logs: number
    sessions: number
  }
  freezes: {
    businessConfig: boolean
    localization: boolean
  }
}

export type EnforcementEvaluation = {
  state: EnforcementState
  triggeredMetrics: Array<{
    metric: string
    usage: number
    limit: number | null
    percentage: number
  }>
  effectivePolicy: EffectivePolicy
  graceEndsAt?: Date
  nextEvaluationAt: Date
}

/**
 * Get default enforcement config (used when plan doesn't have custom config)
 */
export function getDefaultEnforcementConfig(): EnforcementConfig {
  return {
    warnThreshold: 80,
    hardThreshold: 100,
    gracePeriodHours: 48,
    overageBufferPercent: 0,
    moduleRules: {
      apiTraces: {
        samplingRate: 10,
        dropResponseBodies: true,
      },
      logs: {
        prioritizeCrashes: true,
        minRetentionDays: 7,
      },
      sessions: {
        samplingRate: 10,
        capEventsPerSession: 100,
      },
      businessConfig: {
        freezePublishing: true,
        serveLastPublished: true,
      },
      localization: {
        freezePublishing: true,
        serveLastPublished: true,
      },
    },
  }
}

/**
 * Get enforcement config for a plan (with defaults)
 */
export function getEnforcementConfig(plan: { enforcementConfig: any } | null): EnforcementConfig {
  if (!plan?.enforcementConfig) {
    return getDefaultEnforcementConfig()
  }

  const config = plan.enforcementConfig as EnforcementConfig
  const defaults = getDefaultEnforcementConfig()

  return {
    warnThreshold: config.warnThreshold ?? defaults.warnThreshold,
    hardThreshold: config.hardThreshold ?? defaults.hardThreshold,
    gracePeriodHours: config.gracePeriodHours ?? defaults.gracePeriodHours,
    overageBufferPercent: config.overageBufferPercent ?? defaults.overageBufferPercent,
    moduleRules: {
      ...defaults.moduleRules,
      ...config.moduleRules,
    },
  }
}

/**
 * Evaluate enforcement state for a subscription
 */
export async function evaluateEnforcementState(
  userId: string
): Promise<EnforcementEvaluation> {
  const subscription = await getSubscription(userId)
  if (!subscription) {
    throw new Error('Subscription not found')
  }

  // Get plan with enforcement config
  const plan = await prisma.plan.findUnique({
    where: { id: subscription.planId },
  })

  if (!plan) {
    throw new Error('Plan not found')
  }

  const config = getEnforcementConfig(plan)
  const usage = await getUsageStats(userId)

  if (!usage) {
    // No usage data - default to ACTIVE
    return {
      state: 'ACTIVE',
      triggeredMetrics: [],
      effectivePolicy: getDefaultEffectivePolicy(),
      nextEvaluationAt: new Date(Date.now() + 15 * 60 * 1000), // Re-evaluate in 15 minutes
    }
  }

  // Check all meters for threshold violations
  const triggeredMetrics: Array<{
    metric: string
    usage: number
    limit: number | null
    percentage: number
  }> = []

  const meters = [
    'devices',
    'apiRequests', // Changed from apiTraces to apiRequests
    'logs',
    'sessions',
    'crashes',
    'projects',
  ] as const

  let maxPercentage = 0
  let hasHardThreshold = false

  for (const meterKey of meters) {
    const meter = (usage as any)[meterKey]
    if (!meter || meter.limit === null) continue

    const percentage = meter.percentage

    if (percentage >= config.hardThreshold!) {
      hasHardThreshold = true
      triggeredMetrics.push({
        metric: meterKey,
        usage: meter.usage || meter.used || 0,
        limit: meter.limit,
        percentage,
      })
    } else if (percentage >= config.warnThreshold!) {
      triggeredMetrics.push({
        metric: meterKey,
        usage: meter.usage || meter.used || 0,
        limit: meter.limit,
        percentage,
      })
    }

    if (percentage > maxPercentage) {
      maxPercentage = percentage
    }
  }

  // Get current enforcement state from database
  const currentState = await prisma.enforcementState.findUnique({
    where: { subscriptionId: subscription.id },
  })

  // Determine new state
  let newState: EnforcementState = 'ACTIVE'
  let graceEndsAt: Date | undefined

  if (subscription.status !== 'active' || !subscription.enabled) {
    newState = 'SUSPENDED'
  } else if (hasHardThreshold) {
    // Check if we're in grace period
    if (currentState?.state === 'GRACE' && currentState.graceEndsAt) {
      if (new Date() < currentState.graceEndsAt) {
        // Still in grace period
        newState = 'GRACE'
        graceEndsAt = currentState.graceEndsAt
      } else {
        // Grace period expired
        newState = 'DEGRADED'
      }
    } else {
      // Enter grace period
      newState = 'GRACE'
      const graceHours = config.gracePeriodHours || 48
      graceEndsAt = new Date(Date.now() + graceHours * 60 * 60 * 1000)
    }
  } else if (maxPercentage >= config.warnThreshold!) {
    newState = 'WARN'
  }

  // Generate effective policy based on state
  const effectivePolicy = generateEffectivePolicy(newState, config, plan)

  // Calculate next evaluation time (15 minutes for active/warn, 5 minutes for grace/degraded)
  const evaluationInterval = newState === 'ACTIVE' || newState === 'WARN' ? 15 : 5
  const nextEvaluationAt = new Date(Date.now() + evaluationInterval * 60 * 1000)

  return {
    state: newState,
    triggeredMetrics,
    effectivePolicy,
    graceEndsAt,
    nextEvaluationAt,
  }
}

/**
 * Generate effective policy based on enforcement state
 */
function generateEffectivePolicy(
  state: EnforcementState,
  config: EnforcementConfig,
  plan: { retentionDays: number | null }
): EffectivePolicy {
  const defaultPolicy = getDefaultEffectivePolicy()

  if (state === 'ACTIVE' || state === 'WARN' || state === 'GRACE') {
    // No degradation - use plan defaults
    const retentionDays = plan.retentionDays || 30
    return {
      sampling: {
        apiTraces: { rate: 1, enabled: false },
        sessions: { rate: 1, enabled: false },
        logs: { prioritizeCrashes: false, dropDebug: false },
      },
      retention: {
        apiTraces: retentionDays,
        logs: retentionDays,
        sessions: retentionDays,
      },
      freezes: {
        businessConfig: false,
        localization: false,
      },
    }
  }

  if (state === 'DEGRADED') {
    // Apply degradation rules
    const moduleRules = config.moduleRules || {}
    const retentionDays = plan.retentionDays || 30
    const minRetention = moduleRules.logs?.minRetentionDays || 7

    return {
      sampling: {
        apiTraces: {
          rate: moduleRules.apiTraces?.samplingRate || 10,
          enabled: true,
        },
        sessions: {
          rate: moduleRules.sessions?.samplingRate || 10,
          enabled: true,
        },
        logs: {
          prioritizeCrashes: moduleRules.logs?.prioritizeCrashes ?? true,
          dropDebug: true,
        },
      },
      retention: {
        apiTraces: Math.max(retentionDays - 7, 7),
        logs: Math.max(minRetention, 7),
        sessions: Math.max(retentionDays - 7, 7),
      },
      freezes: {
        businessConfig: moduleRules.businessConfig?.freezePublishing ?? true,
        localization: moduleRules.localization?.freezePublishing ?? true,
      },
    }
  }

  // SUSPENDED - minimal policy
  return {
    sampling: {
      apiTraces: { rate: 1, enabled: false },
      sessions: { rate: 1, enabled: false },
      logs: { prioritizeCrashes: false, dropDebug: false },
    },
    retention: {
      apiTraces: 0,
      logs: 0,
      sessions: 0,
    },
    freezes: {
      businessConfig: true,
      localization: true,
    },
  }
}

/**
 * Get default effective policy
 */
function getDefaultEffectivePolicy(): EffectivePolicy {
  return {
    sampling: {
      apiTraces: { rate: 1, enabled: false },
      sessions: { rate: 1, enabled: false },
      logs: { prioritizeCrashes: false, dropDebug: false },
    },
    retention: {
      apiTraces: 30,
      logs: 30,
      sessions: 30,
    },
    freezes: {
      businessConfig: false,
      localization: false,
    },
  }
}

/**
 * Update enforcement state in database
 */
export async function updateEnforcementState(
  subscriptionId: string,
  evaluation: EnforcementEvaluation
): Promise<void> {
  const now = new Date()
  const existing = await prisma.enforcementState.findUnique({
    where: { subscriptionId },
  })

  await prisma.enforcementState.upsert({
    where: { subscriptionId },
    create: {
      subscriptionId,
      state: evaluation.state,
      warnEnteredAt: evaluation.state === 'WARN' ? now : null,
      graceEnteredAt: evaluation.state === 'GRACE' ? now : null,
      graceEndsAt: evaluation.graceEndsAt || null,
      degradedEnteredAt: evaluation.state === 'DEGRADED' ? now : null,
      effectivePolicy: evaluation.effectivePolicy as any,
      triggeredMetrics: evaluation.triggeredMetrics as any,
      lastEvaluatedAt: now,
      nextEvaluationAt: evaluation.nextEvaluationAt,
    },
    update: {
      state: evaluation.state,
      warnEnteredAt:
        evaluation.state === 'WARN' && !existing?.warnEnteredAt
          ? now
          : existing?.warnEnteredAt,
      graceEnteredAt:
        evaluation.state === 'GRACE' && !existing?.graceEnteredAt
          ? now
          : existing?.graceEnteredAt,
      graceEndsAt: evaluation.graceEndsAt || existing?.graceEndsAt || null,
      degradedEnteredAt:
        evaluation.state === 'DEGRADED' && !existing?.degradedEnteredAt
          ? now
          : existing?.degradedEnteredAt,
      effectivePolicy: evaluation.effectivePolicy as any,
      triggeredMetrics: evaluation.triggeredMetrics as any,
      lastEvaluatedAt: now,
      nextEvaluationAt: evaluation.nextEvaluationAt,
    },
  })
}

/**
 * Get current enforcement state for a subscription
 */
export async function getEnforcementState(subscriptionId: string) {
  return prisma.enforcementState.findUnique({
    where: { subscriptionId },
  })
}

