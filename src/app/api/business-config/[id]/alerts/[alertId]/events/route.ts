import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

/**
 * GET /api/business-config/[id]/alerts/[alertId]/events
 * Get alert events
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; alertId: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, alertId } = await params
    const { searchParams } = new URL(request.url)
    const acknowledged = searchParams.get('acknowledged')

    const config = await prisma.businessConfig.findUnique({
      where: { id },
      include: { project: true }
    })

    if (!config) {
      return NextResponse.json({ error: 'Config not found' }, { status: 404 })
    }

    // Verify project ownership
    if (config.project.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const where: any = { alertId }
    if (acknowledged !== null) {
      where.acknowledged = acknowledged === 'true'
    }

    const events = await prisma.configAlertEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100
    })

    return NextResponse.json({ events })
  } catch (error) {
    console.error('Get alert events error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/business-config/[id]/alerts/[alertId]/events/[eventId]
 * Acknowledge an alert event
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; alertId: string; eventId: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, eventId } = await params

    const config = await prisma.businessConfig.findUnique({
      where: { id },
      include: { project: true }
    })

    if (!config) {
      return NextResponse.json({ error: 'Config not found' }, { status: 404 })
    }

    // Verify project ownership
    if (config.project.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const event = await prisma.configAlertEvent.update({
      where: { id: eventId },
      data: {
        acknowledged: true,
        acknowledgedBy: user.id,
        acknowledgedAt: new Date()
      }
    })

    return NextResponse.json({ event })
  } catch (error) {
    console.error('Acknowledge alert event error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

