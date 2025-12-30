import { NextRequest, NextResponse } from 'next/server'
import { validateAdmin } from '@/lib/auth'
import { updateSubscriptionStatus, getSubscriptionDetails } from '@/lib/admin'

/**
 * PATCH /api/admin/subscriptions/[id]/status
 * Update subscription status (admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await validateAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 })
    }

    const { id } = await params
    const { status } = await request.json()

    if (!status) {
      return NextResponse.json({ error: 'status is required' }, { status: 400 })
    }

    const validStatuses = ['active', 'expired', 'cancelled', 'suspended', 'disabled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    await updateSubscriptionStatus(id, status as any, admin.id)

    // Return updated subscription with full details
    const subscription = await getSubscriptionDetails(id)
    return NextResponse.json({ success: true, subscription })
  } catch (error) {
    console.error('Update subscription status error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

