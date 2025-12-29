import { NextRequest, NextResponse } from 'next/server'
import { validateAdmin } from '@/lib/auth'
import { enableSubscription } from '@/lib/admin'

/**
 * PATCH /api/admin/subscriptions/[id]/enable
 * Enable a subscription (admin only)
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
    await enableSubscription(id, admin.id)

    return NextResponse.json({
      success: true,
      message: 'Subscription enabled successfully',
    })
  } catch (error) {
    console.error('Enable subscription error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

