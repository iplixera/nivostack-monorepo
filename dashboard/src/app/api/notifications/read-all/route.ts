import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { markAllNotificationsAsRead } from '@/lib/notifications'

/**
 * POST /api/notifications/read-all
 * Mark all notifications as read
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await markAllNotificationsAsRead(user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Mark all notifications as read error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

