import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { canPerformAction } from '@/lib/team-access'

/**
 * GET /api/projects/[id]/stats
 * Get dashboard statistics for a project
 * Supports mode=aggregated|raw (default: aggregated)
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
    const { searchParams } = new URL(request.url)
    const mode = searchParams.get('mode') || 'aggregated' // 'aggregated' | 'raw'
    const timeRange = searchParams.get('timeRange') || '24h' // '1h', '24h', '7d', '30d'

    // Check if user has access to project
    const hasAccess = await canPerformAction(user.id, id, 'view')
    if (!hasAccess) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 })
    }

    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id },
      select: { id: true, name: true }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Calculate time range
    const now = new Date()
    let startTime: Date
    let granularity: 'hourly' | 'daily'

    switch (timeRange) {
      case '1h':
        startTime = new Date(now.getTime() - 60 * 60 * 1000)
        granularity = 'hourly'
        break
      case '24h':
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        granularity = 'hourly'
        break
      case '7d':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        granularity = 'daily'
        break
      case '30d':
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        granularity = 'daily'
        break
      default:
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        granularity = 'hourly'
    }

    let stats: any = {}

    if (mode === 'aggregated') {
      // Use aggregate tables for fast dashboard stats
      const [apiTraceStats, logStats, crashStats, sessionStats, deviceStats] = await Promise.all([
        // API Trace aggregates
        prisma.apiTraceAggregate.aggregate({
          where: {
            projectId: id,
            granularity,
            period: { gte: startTime, lt: now }
          },
          _sum: {
            count: true,
            errorCount: true,
            costSum: true,
            status2xx: true,
            status4xx: true,
            status5xx: true
          },
          _avg: {
            durationAvg: true,
            durationP95: true
          }
        }),

        // Log aggregates
        prisma.logAggregate.aggregate({
          where: {
            projectId: id,
            granularity,
            period: { gte: startTime, lt: now }
          },
          _sum: {
            count: true,
            errorCount: true
          }
        }),

        // Crash aggregates
        prisma.crashAggregate.aggregate({
          where: {
            projectId: id,
            granularity,
            period: { gte: startTime, lt: now }
          },
          _sum: {
            count: true,
            uniqueMessages: true
          }
        }),

        // Session aggregates
        prisma.sessionAggregate.aggregate({
          where: {
            projectId: id,
            granularity,
            period: { gte: startTime, lt: now }
          },
          _sum: {
            count: true
          },
          _avg: {
            durationAvg: true,
            screenCountAvg: true,
            eventCountAvg: true,
            errorCountAvg: true
          }
        }),

        // Active devices (raw count for now)
        prisma.device.count({
          where: {
            projectId: id,
            status: 'active',
            lastSeenAt: { gte: startTime }
          }
        })
      ])

      // Calculate derived metrics
      const totalRequests = apiTraceStats._sum.count || 0
      const totalErrors = apiTraceStats._sum.errorCount || 0
      const errorRate = totalRequests > 0 ? totalErrors / totalRequests : 0

      stats = {
        activeDevices: deviceStats,
        sessions: sessionStats._sum.count || 0,
        apiRequests: totalRequests,
        errorRate,
        p95Latency: apiTraceStats._avg.durationP95 || 0,
        costEstimate: Number(apiTraceStats._sum.costSum || 0),
        logs: logStats._sum.count || 0,
        crashes: crashStats._sum.count || 0,
        status2xx: apiTraceStats._sum.status2xx || 0,
        status4xx: apiTraceStats._sum.status4xx || 0,
        status5xx: apiTraceStats._sum.status5xx || 0,
        avgSessionDuration: sessionStats._avg.durationAvg || 0,
        avgScreensPerSession: sessionStats._avg.screenCountAvg || 0,
        avgEventsPerSession: sessionStats._avg.eventCountAvg || 0,
        sessionErrorRate: sessionStats._avg.errorCountAvg || 0,
        uniqueCrashMessages: crashStats._sum.uniqueMessages || 0,
        logErrorCount: logStats._sum.errorCount || 0
      }
    } else {
      // Fallback to raw data (slower but exact)
      const [apiTraceStats, logStats, crashStats, sessionStats, deviceStats] = await Promise.all([
        // API Trace raw stats
        prisma.apiTrace.aggregate({
          where: {
            projectId: id,
            timestamp: { gte: startTime, lt: now }
          },
          _count: { id: true },
          _sum: {
            cost: true
          },
          _avg: {
            duration: true
          }
        }),

        // Log raw stats
        prisma.log.aggregate({
          where: {
            projectId: id,
            timestamp: { gte: startTime, lt: now }
          },
          _count: { id: true }
        }),

        // Crash raw stats
        prisma.crash.aggregate({
          where: {
            projectId: id,
            timestamp: { gte: startTime, lt: now }
          },
          _count: { id: true }
        }),

        // Session raw stats
        prisma.session.aggregate({
          where: {
            projectId: id,
            startedAt: { gte: startTime, lt: now }
          },
          _count: { id: true },
          _avg: {
            duration: true,
            screenCount: true,
            eventCount: true,
            errorCount: true
          }
        }),

        // Active devices
        prisma.device.count({
          where: {
            projectId: id,
            status: 'active',
            lastSeenAt: { gte: startTime }
          }
        })
      ])

      // Calculate error rate and status codes from raw data (simplified)
      const [errorCount, status2xx, status4xx, status5xx] = await Promise.all([
        prisma.apiTrace.count({
          where: {
            projectId: id,
            timestamp: { gte: startTime, lt: now },
            statusCode: { not: null },
            OR: [
              { statusCode: { gte: 400, lt: 500 } },
              { statusCode: { gte: 500 } }
            ]
          }
        }),
        prisma.apiTrace.count({
          where: {
            projectId: id,
            timestamp: { gte: startTime, lt: now },
            statusCode: { gte: 200, lt: 300 }
          }
        }),
        prisma.apiTrace.count({
          where: {
            projectId: id,
            timestamp: { gte: startTime, lt: now },
            statusCode: { gte: 400, lt: 500 }
          }
        }),
        prisma.apiTrace.count({
          where: {
            projectId: id,
            timestamp: { gte: startTime, lt: now },
            statusCode: { gte: 500 }
          }
        })
      ])

      const totalRequests = apiTraceStats._count.id
      const errorRate = totalRequests > 0 ? errorCount / totalRequests : 0

      stats = {
        activeDevices: deviceStats,
        sessions: sessionStats._count.id,
        apiRequests: totalRequests,
        errorRate,
        p95Latency: 0, // Would need more complex query for percentiles
        costEstimate: Number(apiTraceStats._sum.cost || 0),
        logs: logStats._count.id,
        crashes: crashStats._count.id,
        status2xx,
        status4xx,
        status5xx,
        avgSessionDuration: sessionStats._avg.duration || 0,
        avgScreensPerSession: sessionStats._avg.screenCount || 0,
        avgEventsPerSession: sessionStats._avg.eventCount || 0,
        sessionErrorRate: sessionStats._avg.errorCount || 0,
        uniqueCrashMessages: 0, // Would need groupBy query
        logErrorCount: 0 // Would need level filter
      }
    }

    return NextResponse.json({
      project: {
        id: project.id,
        name: project.name
      },
      stats,
      mode,
      timeRange,
      startTime: startTime.toISOString(),
      endTime: now.toISOString(),
      granularity
    })
  } catch (error) {
    console.error('Get project stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
