import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

/**
 * GET /api/devices
 * Get devices for a project with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    // const user = await getAuthUser(request)
    // if (!user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const search = searchParams.get('search')
    const platform = searchParams.get('platform')
    const environment = searchParams.get('environment')
    const debugMode = searchParams.get('debugMode')
    const lastSeenAfter = searchParams.get('lastSeenAfter')
    const sortBy = searchParams.get('sortBy') || 'lastSeenAt'
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'

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

    // Add search filter
    if (search) {
      where.OR = [
        { deviceId: { contains: search, mode: 'insensitive' } },
        { deviceCode: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { manufacturer: { contains: search, mode: 'insensitive' } },
        { userEmail: { contains: search, mode: 'insensitive' } },
        { appVersion: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Add platform filter
    if (platform && platform !== 'all') {
      where.platform = platform
    }

    // Add environment filter
    if (environment && environment !== 'all') {
      where.environment = environment
    }

    // Add debug mode filter
    if (debugMode && debugMode !== 'all') {
      where.debugModeEnabled = debugMode === 'enabled'
    }

    // Add lastSeenAfter filter
    if (lastSeenAfter) {
      where.lastSeenAt = {
        gte: new Date(lastSeenAfter)
      }
    }

    const skip = (page - 1) * limit

    // Get devices with user info
    const [devices, total] = await Promise.all([
      prisma.device.findMany({
        where,
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
      }),
      prisma.device.count({ where }),
    ])

    // Calculate stats
    const stats = await prisma.device.groupBy({
      by: ['platform'],
      where: { projectId },
      _count: true,
    })

    const platformStats = stats.reduce((acc, stat) => {
      acc[stat.platform.toLowerCase()] = stat._count
      return acc
    }, {} as Record<string, number>)

    // Get recent activity stats
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const [todayCount, weekCount, monthCount, debugModeCount] = await Promise.all([
      prisma.device.count({
        where: {
          projectId,
          lastSeenAt: { gte: oneDayAgo },
        },
      }),
      prisma.device.count({
        where: {
          projectId,
          lastSeenAt: { gte: oneWeekAgo },
        },
      }),
      prisma.device.count({
        where: {
          projectId,
          lastSeenAt: { gte: oneMonthAgo },
        },
      }),
      prisma.device.count({
        where: {
          projectId,
          debugModeEnabled: true,
        },
      }),
    ])

    const deviceStats = {
      total,
      ...platformStats, // Include all platforms dynamically
      today: todayCount,
      thisWeek: weekCount,
      thisMonth: monthCount,
      debugModeCount,
      platforms: stats.map(s => ({ name: s.platform, count: s._count })), // Array of all platforms
    }

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      devices: devices.map(device => ({
        id: device.id,
        deviceId: device.deviceId,
        platform: device.platform,
        osVersion: device.osVersion,
        appVersion: device.appVersion,
        model: device.model,
        manufacturer: device.manufacturer,
        lastSeenAt: device.lastSeenAt.toISOString(),
        createdAt: device.createdAt.toISOString(),
        debugModeEnabled: device.debugModeEnabled,
        userId: device.userId,
        userEmail: device.userEmail,
      })),
      stats: deviceStats,
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
    console.error('Error fetching devices:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
