import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { getUnreadNotificationCount } from '@/lib/notifications'

/**
 * GET /api/notifications
 * Get user's notifications
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    const where: any = {
      userId: user.id,
    }

    if (unreadOnly) {
      where.read = false
    }

    const notifications = await prisma.userNotification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    const unreadCount = await getUnreadNotificationCount(user.id)

    return NextResponse.json({
      notifications: notifications.map((notif) => ({
        id: notif.id,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        data: notif.data,
        read: notif.read,
        readAt: notif.readAt?.toISOString() || null,
        actionUrl: notif.actionUrl,
        createdAt: notif.createdAt.toISOString(),
      })),
      unreadCount,
    })
  } catch (error) {
    console.error('Get notifications error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

