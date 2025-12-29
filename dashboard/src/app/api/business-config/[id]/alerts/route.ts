import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

/**
 * GET /api/business-config/[id]/alerts
 * Get alerts for a config
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

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

    const alerts = await prisma.configAlert.findMany({
      where: {
        projectId: config.projectId,
        configId: id
      },
      include: {
        _count: {
          select: {
            events: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ alerts })
  } catch (error) {
    console.error('Get alerts error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/business-config/[id]/alerts
 * Create an alert for a config
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const {
      name,
      description,
      condition,
      threshold,
      operator,
      timeWindow,
      minOccurrences,
      webhookUrl,
      emailRecipients
    } = body

    if (!name || !condition || threshold === undefined) {
      return NextResponse.json(
        { error: 'name, condition, and threshold are required' },
        { status: 400 }
      )
    }

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

    const alert = await prisma.configAlert.create({
      data: {
        projectId: config.projectId,
        configId: id,
        name,
        description: description || null,
        condition,
        threshold,
        operator: operator || '>',
        timeWindow: timeWindow || 60,
        minOccurrences: minOccurrences || 1,
        webhookUrl: webhookUrl || null,
        emailRecipients: emailRecipients || null
      }
    })

    return NextResponse.json({ alert })
  } catch (error) {
    console.error('Create alert error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

