import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

/**
 * GET /api/crashes
 * Get crashes for a project with filtering and pagination
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
    const platform = searchParams.get('platform')
    const deviceId = searchParams.get('deviceId')
    const search = searchParams.get('search')

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
    if (platform) {
      where.device = {
        platform: platform,
      }
    }

    if (deviceId) {
      where.deviceId = deviceId
    }

    if (search) {
      where.OR = [
        { message: { contains: search, mode: 'insensitive' } },
        { stackTrace: { contains: search, mode: 'insensitive' } },
        { device: { model: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const skip = (page - 1) * limit

    const [crashes, total] = await Promise.all([
      prisma.crash.findMany({
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
        },
        orderBy: {
          timestamp: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.crash.count({ where }),
    ])

    // Calculate stats (temporarily disabled)
    const platformStats = {} as Record<string, number>

    // Get unique crash messages count
    const uniqueMessages = await prisma.crash.findMany({
      where: { projectId },
      select: { message: true },
      distinct: ['message'],
    }).then(results => results.length)

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      crashes: crashes.map(crash => ({
        id: crash.id,
        message: crash.message,
        stackTrace: crash.stackTrace,
        timestamp: crash.timestamp.toISOString(),
          device: crash.device ? {
            deviceId: crash.device.deviceId,
            platform: crash.device.platform,
            model: crash.device.model,
            appVersion: crash.device.appVersion,
            userEmail: crash.device.userEmail,
          } : null,
      })),
      stats: {
        total,
        platforms: platformStats,
        uniqueMessages,
      },
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
    console.error('Error fetching crashes:', error)
    console.error('Stack:', error.stack)
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 })
  }
}
