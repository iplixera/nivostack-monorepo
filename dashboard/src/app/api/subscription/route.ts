import { NextRequest, NextResponse } from 'next/server'
import { validateToken } from '@/lib/auth'
import { getSubscription, getUsageStats } from '@/lib/subscription'

/**
 * GET /api/subscription
 * Get current user's subscription
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await validateToken(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let subscription = await getSubscription(userId)
    
    // If no subscription exists, create a free one (shouldn't happen, but safety check)
    if (!subscription) {
      const { createSubscription } = await import('@/lib/subscription')
      try {
        subscription = await createSubscription(userId, 'free')
      } catch (error) {
        console.error('Failed to create subscription:', error)
        return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 })
      }
    }

    return NextResponse.json({ subscription })
  } catch (error) {
    console.error('Get subscription error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/subscription
 * Update subscription (upgrade/downgrade)
 * Note: Currently not implemented - placeholder for future Stripe integration
 */
export async function PATCH(request: NextRequest) {
  try {
    const userId = await validateToken(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { planName } = await request.json()

    // For now, only allow upgrades (not implemented yet)
    // This is a placeholder for future Stripe integration
    return NextResponse.json({ 
      error: 'Plan upgrades coming soon',
      message: 'Please contact support to upgrade your plan'
    }, { status: 501 })
  } catch (error) {
    console.error('Update subscription error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

