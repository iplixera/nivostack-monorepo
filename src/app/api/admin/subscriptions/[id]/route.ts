import { NextRequest, NextResponse } from 'next/server'
import { validateAdmin } from '@/lib/auth'
import { getSubscriptionDetails } from '@/lib/admin'

/**
 * GET /api/admin/subscriptions/[id]
 * Get subscription details (admin only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await validateAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 })
    }

    const { id } = await params
    const subscription = await getSubscriptionDetails(id)

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    return NextResponse.json({ subscription })
  } catch (error) {
    console.error('Get subscription details error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

