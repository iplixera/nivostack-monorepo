import { NextRequest, NextResponse } from 'next/server'
import { validateToken } from '@/lib/auth'
import { getEnforcementState, evaluateEnforcementState, updateEnforcementState } from '@/lib/enforcement'
import { getSubscription } from '@/lib/subscription'

/**
 * GET /api/subscription/enforcement
 * Get enforcement state for current user's subscription
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const payload = validateToken(token)

    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const subscription = await getSubscription(payload.userId)
    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    // Get or evaluate enforcement state
    let enforcement = await getEnforcementState(subscription.id)
    
    // Re-evaluate if needed
    if (!enforcement || new Date() >= enforcement.nextEvaluationAt) {
      const evaluation = await evaluateEnforcementState(payload.userId)
      await updateEnforcementState(subscription.id, evaluation)
      enforcement = await getEnforcementState(subscription.id)
    }

    if (!enforcement) {
      // No enforcement state - return default (ACTIVE)
      return NextResponse.json({
        state: 'ACTIVE',
        effectivePolicy: null,
        graceEndsAt: null,
        triggeredMetrics: [],
      })
    }

    return NextResponse.json({
      state: enforcement.state,
      effectivePolicy: enforcement.effectivePolicy,
      graceEndsAt: enforcement.graceEndsAt?.toISOString() || null,
      triggeredMetrics: enforcement.triggeredMetrics || [],
      warnEnteredAt: enforcement.warnEnteredAt?.toISOString() || null,
      graceEnteredAt: enforcement.graceEnteredAt?.toISOString() || null,
      degradedEnteredAt: enforcement.degradedEnteredAt?.toISOString() || null,
    })
  } catch (error) {
    console.error('Get enforcement state error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

