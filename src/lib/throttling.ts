import { getUsageStats } from './subscription'
import { evaluateEnforcementState, updateEnforcementState, getEnforcementState } from './enforcement'
import { getSubscription } from './subscription'

export type ThrottlingResult = {
  throttled: boolean
  error?: string
  retryAfter?: number // Seconds until retry allowed
  usage?: {
    used: number
    limit: number | null
    percentage: number
  }
  enforcementState?: 'ACTIVE' | 'WARN' | 'GRACE' | 'DEGRADED' | 'SUSPENDED'
  effectivePolicy?: any
}

/**
 * Check if a meter is throttled (usage exceeded limit)
 * Now uses admin-configured enforcement thresholds
 */
export async function checkThrottling(
  userId: string,
  meterKey: 'devices' | 'apiTraces' | 'apiRequests' | 'apiEndpoints' | 'logs' | 'sessions' | 'crashes' | 'projects' | 'businessConfigKeys' | 'localizationLanguages' | 'localizationKeys' | 'mockEndpoints'
): Promise<ThrottlingResult> {
  const usage = await getUsageStats(userId)
  
  if (!usage) {
    return {
      throttled: false,
      error: 'Usage stats not available',
    }
  }

  const meter = usage[meterKey]
  if (!meter) {
    return {
      throttled: false,
      error: `Meter ${meterKey} not found`,
    }
  }

  // If limit is null, it's unlimited - never throttle
  if (meter.limit === null) {
    return {
      throttled: false,
      usage: meter,
      enforcementState: 'ACTIVE',
    }
  }

  // Evaluate enforcement state (uses admin-configured thresholds)
  const subscription = await getSubscription(userId)
  if (!subscription) {
    return {
      throttled: false,
      usage: meter,
      enforcementState: 'ACTIVE',
    }
  }

  // Get or evaluate enforcement state
  let enforcement = await getEnforcementState(subscription.id)
  
  // Re-evaluate if needed
  if (!enforcement || new Date() >= enforcement.nextEvaluationAt) {
    const evaluation = await evaluateEnforcementState(userId)
    await updateEnforcementState(subscription.id, evaluation)
    enforcement = await getEnforcementState(subscription.id)
  }

  const state = enforcement?.state || 'ACTIVE'
  const effectivePolicy = enforcement?.effectivePolicy

  // CRITICAL: Check if this specific meter has exceeded its limit
  // This should block regardless of enforcement state (except SUSPENDED which is handled below)
  if (meter.limit !== null && meter.used >= meter.limit) {
    // Quota exceeded - BLOCK immediately
    // Note: Grace period is for overall subscription health, not for individual meter limits
    return {
      throttled: true,
      error: `Quota exceeded: ${meter.used}/${meter.limit} ${meterKey}. Please upgrade your plan.`,
      retryAfter: 3600, // 1 hour
      usage: meter,
      enforcementState: state,
      effectivePolicy,
    }
  }

  // SUSPENDED state - block all requests
  if (state === 'SUSPENDED') {
    return {
      throttled: true,
      error: 'Subscription suspended. Please contact support.',
      usage: meter,
      enforcementState: state,
      effectivePolicy,
    }
  }

  // DEGRADED state - apply sampling/degradation but don't block
  if (state === 'DEGRADED') {
    // Don't throttle - apply degradation instead (handled by effective policy)
    return {
      throttled: false, // Don't block, but degradation applies
      usage: meter,
      enforcementState: state,
      effectivePolicy,
    }
  }

  // GRACE state - allow full fidelity
  if (state === 'GRACE') {
    return {
      throttled: false,
      usage: meter,
      enforcementState: state,
      effectivePolicy,
    }
  }

  // WARN or ACTIVE - normal operation
  return {
    throttled: false,
    usage: meter,
    enforcementState: state,
    effectivePolicy,
  }
}

/**
 * Check multiple meters at once
 */
export async function checkMultipleMeters(
  userId: string,
  meterKeys: Array<'devices' | 'apiTraces' | 'apiRequests' | 'apiEndpoints' | 'logs' | 'sessions' | 'crashes' | 'projects' | 'businessConfigKeys' | 'localizationLanguages' | 'localizationKeys' | 'mockEndpoints'>
): Promise<{
  throttled: boolean
  errors: string[]
  results: Record<string, ThrottlingResult>
}> {
  const results: Record<string, ThrottlingResult> = {}
  const errors: string[] = []

  for (const meterKey of meterKeys) {
    const result = await checkThrottling(userId, meterKey)
    results[meterKey] = result
    
    if (result.throttled) {
      errors.push(result.error || `Quota exceeded for ${meterKey}`)
    }
  }

  return {
    throttled: errors.length > 0,
    errors,
    results,
  }
}

