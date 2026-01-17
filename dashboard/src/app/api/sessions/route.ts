import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

/**
 * GET /api/sessions
 * Get sessions for a project with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    // const user = await getAuthUser(request)
    // if (!user) {
    // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }
    const user = { id: 'dev-user' } // Mock user for development

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const deviceId = searchParams.get('deviceId')
    const platform = searchParams.get('platform')
    const hasErrors = searchParams.get('hasErrors')

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    // Check if user has access to this project
    // const projectMember = await prisma.projectMember.findFirst({
    //   where: {
    //     projectId,
    //     userId: user.id,
    //   },
    // })

    // if (!projectMember) {
    //   return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    // }

    const where: any = {
      projectId,
    }

    // Add filters
    if (deviceId) {
      where.deviceId = deviceId
    }

    if (platform) {
      where.device = {
        platform: platform,
      }
    }

    if (hasErrors === 'true') {
      where.OR = [
        { errorCount: { gt: 0 } },
        { crashCount: { gt: 0 } },
      ]
    }

    const skip = (page - 1) * limit

    const [sessions, total] = await Promise.all([
      prisma.session.findMany({
        where,
        include: {
          device: {
            select: {
              deviceId: true,
              platform: true,
              model: true,
              appVersion: true,
            },
          },
          _count: {
            select: {
              logs: true,
              apiTraces: true,
            },
          },
        },
        orderBy: {
          startedAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.session.count({ where }),
    ])

    // Calculate stats (temporarily disabled)
    const platformStats = {} as Record<string, number>

    const sessionStats = {
      total: 0,
      avgDuration: 0,
      avgScreens: 0,
      avgEvents: 0,
      totalErrors: 0,
      totalCrashes: 0,
      platforms: platformStats,
    }

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      sessions: sessions.map(session => ({
        id: session.id,
        startTime: session.startedAt.toISOString(),
        endTime: session.endedAt?.toISOString(),
        duration: session.duration,
        screenCount: session.screenCount,
        eventCount: session.eventCount,
        errorCount: session.errorCount,
        crashCount: session.crashCount,
        device: session.device ? {
          deviceId: session.device.deviceId,
          platform: session.device.platform,
          model: session.device.model,
          appVersion: session.device.appVersion,
          userEmail: session.device.userEmail,
        } : null,
        _count: session._count,
      })),
      stats: sessionStats,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error('Error fetching sessions:', error)
    console.error('Stack:', error.stack)
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 })
  }
}
