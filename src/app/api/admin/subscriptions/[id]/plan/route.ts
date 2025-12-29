import { NextRequest, NextResponse } from 'next/server'
import { validateAdmin } from '@/lib/auth'
import { changeSubscriptionPlan, getSubscriptionDetails } from '@/lib/admin'

/**
 * PATCH /api/admin/subscriptions/[id]/plan
 * Change subscription plan (admin only)
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
    const { planId } = await request.json()

    if (!planId) {
      return NextResponse.json({ error: 'planId is required' }, { status: 400 })
    }

    await changeSubscriptionPlan(id, planId, admin.id)

    // Return updated subscription with full details
    const subscription = await getSubscriptionDetails(id)
    return NextResponse.json({ success: true, subscription })
  } catch (error) {
    console.error('Change subscription plan error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

