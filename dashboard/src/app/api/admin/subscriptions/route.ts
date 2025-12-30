import { NextRequest, NextResponse } from 'next/server'
import { validateAdmin } from '@/lib/auth'
import { getAllSubscriptions, createSubscriptionForUser } from '@/lib/admin'

/**
 * GET /api/admin/subscriptions
 * Get all subscriptions (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const admin = await validateAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 })
    }

    console.log('Fetching subscriptions...')
    const subscriptions = await getAllSubscriptions()
    console.log(`Fetched ${subscriptions.length} subscriptions`)
    
    // Next.js automatically serializes Date objects to ISO strings in JSON responses
    // No manual serialization needed
    return NextResponse.json({ subscriptions })
  } catch (error) {
    console.error('Get subscriptions error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error('Error details:', { errorMessage, errorStack })
    return NextResponse.json(
      { error: errorMessage, details: process.env.NODE_ENV === 'development' ? errorStack : undefined },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/subscriptions
 * Create a new subscription for a user (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const admin = await validateAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { userId, planId, promoCodeId, discountPercent, discountAmount } = body

    if (!userId || !planId) {
      return NextResponse.json(
        { error: 'userId and planId are required' },
        { status: 400 }
      )
    }

    const subscription = await createSubscriptionForUser(
      userId,
      planId,
      admin.id,
      {
        promoCodeId,
        discountPercent,
        discountAmount,
      }
    )

    return NextResponse.json({ subscription }, { status: 201 })
  } catch (error) {
    console.error('Create subscription error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
