import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey } from '@/lib/auth'
import { getEnforcementState, evaluateEnforcementState, updateEnforcementState } from '@/lib/enforcement'
import { getSubscription } from '@/lib/subscription'

/**
 * GET /api/enforcement/policy
 * Get effective enforcement policy for SDK
 * Uses API key authentication (SDK endpoint)
 */
export async function GET(request: NextRequest) {
  try {
    const project = await validateApiKey(request)
    if (!project) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    // Get subscription for this user
    const subscription = await getSubscription(project.userId)
    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    // Get or evaluate enforcement state
    let enforcement = await getEnforcementState(subscription.id)
    
    // Re-evaluate if needed (state might be stale)
    if (!enforcement || new Date() >= enforcement.nextEvaluationAt) {
      const evaluation = await evaluateEnforcementState(project.userId)
      await updateEnforcementState(subscription.id, evaluation)
      enforcement = await getEnforcementState(subscription.id)
    }

    if (!enforcement) {
      // No enforcement state - return default (ACTIVE)
      return NextResponse.json({
        state: 'ACTIVE',
        effectivePolicy: {
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
        },
        graceEndsAt: null,
        nextEvaluationAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      })
    }

    // Return effective policy for SDK
    return NextResponse.json({
      state: enforcement.state,
      effectivePolicy: enforcement.effectivePolicy,
      graceEndsAt: enforcement.graceEndsAt?.toISOString() || null,
      nextEvaluationAt: enforcement.nextEvaluationAt.toISOString(),
      triggeredMetrics: enforcement.triggeredMetrics || [],
    })
  } catch (error) {
    console.error('Get enforcement policy error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

