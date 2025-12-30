import { getSubscription } from './subscription'
import { isTrialActive } from './subscription'

export type ValidationResult = {
  valid: boolean
  error?: string
  subscription?: any
}

/**
 * Validate subscription for SDK access
 * Checks: enabled, status, trial expiration, grace period
 */
export async function validateSubscription(userId: string): Promise<ValidationResult> {
  const subscription = await getSubscription(userId)

  // Check 1: Subscription exists
  if (!subscription) {
    return {
      valid: false,
      error: 'No subscription found',
    }
  }

  // Check 2: Subscription enabled (admin control)
  if (!subscription.enabled) {
    return {
      valid: false,
      error: 'Subscription disabled by admin',
      subscription,
    }
  }

  // Check 3: Subscription status
  if (subscription.status !== 'active') {
    return {
      valid: false,
      error: `Subscription ${subscription.status}`,
      subscription,
    }
  }

  // Check 4: Grace period expired (for paid plans)
  if (subscription.gracePeriodEnd && subscription.gracePeriodEnd <= new Date()) {
    return {
      valid: false,
      error: 'Subscription suspended due to payment failure',
      subscription,
    }
  }

  // Check 5: Trial expiration (for free plans or trial periods)
  const trialActive = await isTrialActive(subscription)
  if (!trialActive && subscription.status === 'active') {
    // For free plans, if trial expired, subscription should be expired
    // But check anyway for safety
    return {
      valid: false,
      error: 'Trial expired',
      subscription,
    }
  }

  return {
    valid: true,
    subscription,
  }
}

/**
 * Validate subscription and check if specific feature is allowed
 */
export async function validateFeature(
  userId: string,
  feature: string
): Promise<ValidationResult & { featureAllowed?: boolean }> {
  const validation = await validateSubscription(userId)

  if (!validation.valid) {
    return validation
  }

  // Import here to avoid circular dependency
  const { isFeatureAllowed } = await import('./subscription')
  const featureAllowed = await isFeatureAllowed(validation.subscription, feature)

  if (!featureAllowed) {
    return {
      valid: false,
      error: `Feature ${feature} not available in your plan`,
      subscription: validation.subscription,
      featureAllowed: false,
    }
  }

  return {
    ...validation,
    featureAllowed: true,
  }
}

