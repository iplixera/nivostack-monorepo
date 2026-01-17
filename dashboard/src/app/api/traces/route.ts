import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

/**
 * GET /api/traces
 * Get API traces for a project with filtering and pagination
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
    const method = searchParams.get('method')
    const screenName = searchParams.get('screenName')
    const groupByDevice = searchParams.get('groupByDevice') === 'true'

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

    if (method) {
      where.method = method
    }

    if (screenName) {
      where.screenName = screenName
    }

    const skip = (page - 1) * limit

    let traces
    let total

    if (groupByDevice) {
      // Group by device and get latest trace per device
      const deviceTraces = await prisma.apiTrace.groupBy({
        by: ['deviceId'],
        where,
        _max: {
          timestamp: true,
        },
        orderBy: {
          _max: {
            timestamp: 'desc',
          },
        },
        skip,
        take: limit,
      })

      traces = await prisma.apiTrace.findMany({
        where: {
          projectId,
          deviceId: {
            in: deviceTraces.map(dt => dt.deviceId),
          },
          timestamp: {
            in: deviceTraces.map(dt => dt._max.timestamp!),
          },
        },
        include: {
          device: {
            select: {
              deviceId: true,
              platform: true,
              model: true,
            },
          },
        },
        orderBy: {
          timestamp: 'desc',
        },
      })

      total = await prisma.apiTrace.findMany({
        where,
        select: {
          deviceId: true,
        },
        distinct: ['deviceId'],
      }).then(results => results.length)
    } else {
      // Regular pagination
      traces = await prisma.apiTrace.findMany({
        where,
        include: {
          device: {
            select: {
              deviceId: true,
              platform: true,
              model: true,
            },
          },
        },
        orderBy: {
          timestamp: 'desc',
        },
        skip,
        take: limit,
      })

      total = await prisma.apiTrace.count({ where })
    }

    // Calculate stats (temporarily disabled)
    const methodStats = {} as Record<string, { count: number; avgDuration: number }>

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      traces: traces.map(trace => ({
        id: trace.id,
        url: trace.url,
        method: trace.method,
        statusCode: trace.statusCode,
        duration: trace.duration,
        responseSize: trace.responseSize,
        timestamp: trace.timestamp.toISOString(),
        userAgent: trace.userAgent,
        ipAddress: trace.ipAddress,
        screenName: trace.screenName,
          device: trace.device ? {
            deviceId: trace.device.deviceId,
            platform: trace.device.platform,
            model: trace.device.model,
            userEmail: trace.device.userEmail,
          } : null,
      })),
      stats: methodStats,
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
    console.error('Error fetching traces:', error)
    console.error('Stack:', error.stack)
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 })
  }
}
