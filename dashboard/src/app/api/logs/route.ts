import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateApiKey, getAuthUser } from '@/lib/auth'
import { validateFeature } from '@/lib/subscription-validation'
import { checkThrottling } from '@/lib/throttling'

// Default values for settings
const DEFAULT_SDK_SETTINGS = {
  trackingMode: 'all'
}

const DEFAULT_FEATURE_FLAGS = {
  sdkEnabled: true,
  logging: true
}

// Helper to check if tracking is enabled for a device
async function isTrackingEnabled(projectId: string, deviceId?: string): Promise<boolean> {
  // Fetch feature flags and SDK settings
  const [featureFlags, sdkSettings, device] = await Promise.all([
    prisma.featureFlags.findUnique({
      where: { projectId },
      select: { sdkEnabled: true, logging: true }
    }),
    prisma.sdkSettings.findUnique({
      where: { projectId },
      select: { trackingMode: true }
    }),
    deviceId ? prisma.device.findFirst({
      where: { projectId, deviceId },
      select: { 
        debugModeEnabled: true, 
        debugModeExpiresAt: true 
      }
    }) : null
  ])

  const effectiveFlags = featureFlags || DEFAULT_FEATURE_FLAGS
  const effectiveSettings = sdkSettings || DEFAULT_SDK_SETTINGS

  // Check master kill switch
  if (!effectiveFlags.sdkEnabled) return false
  
  // Check logging feature flag
  if (!effectiveFlags.logging) return false

  // Check tracking mode
  const trackingMode = effectiveSettings.trackingMode || 'all'
  
  if (trackingMode === 'none') return false
  
  if (trackingMode === 'debug_only') {
    // Only allow if device exists and has active debug mode
    if (!device) return false
    if (!device.debugModeEnabled) return false
    
    // Check if debug mode is expired
    if (device.debugModeExpiresAt && device.debugModeExpiresAt < new Date()) {
      return false
    }
    
    return true
  }
  
  // trackingMode === 'all'
  return true
}

// SDK endpoint: Create a log entry (or batch of logs)
export async function POST(request: NextRequest) {
  try {
    const project = await validateApiKey(request)
    if (!project) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    const body = await request.json()

    // Support both single log and batch logs
    const logs = Array.isArray(body) ? body : [body]

    // Get deviceId from first log entry to check tracking
    const firstLog = logs[0]
    const deviceId = firstLog?.deviceId

    // Validate subscription and feature access
    const validation = await validateFeature(project.userId, 'logging')
    if (!validation.valid) {
      return NextResponse.json({
        logs: [],
        count: 0,
        error: validation.error || 'Subscription invalid',
        message: validation.error || 'Please upgrade to continue using DevBridge.'
      }, { status: 403 })
    }

    // Check throttling for logs
    const throttling = await checkThrottling(project.userId, 'logs')
    if (throttling.throttled) {
      return NextResponse.json({
        logs: [],
        count: 0,
        error: throttling.error || 'Quota exceeded',
        retryAfter: throttling.retryAfter,
      }, {
        status: 429,
        headers: {
          'Retry-After': throttling.retryAfter?.toString() || '3600',
        },
      })
    }

    // Check if tracking is enabled before processing logs
    const trackingAllowed = await isTrackingEnabled(project.id, deviceId)
    if (!trackingAllowed) {
      // Silently reject - SDK should handle this, but server validates too
      return NextResponse.json({
        logs: [],
        count: 0,
        message: 'Tracking disabled'
      }, { status: 200 })
    }

    const createdLogs = []

    for (const logData of logs) {
      const {
        deviceId,
        sessionToken,
        level,
        message,
        tag,
        data,
        fileName,
        lineNumber,
        functionName,
        className,
        screenName,
        threadName,
        timestamp
      } = logData

      if (!message) {
        continue // Skip logs without message
      }

      // Find device if deviceId provided
      let device = null
      if (deviceId) {
        device = await prisma.device.findFirst({
          where: {
            projectId: project.id,
            deviceId,
            status: 'active'
          }
        })
      }

      // Find session if sessionToken provided
      let session = null
      if (sessionToken) {
        session = await prisma.session.findUnique({
          where: { sessionToken }
        })
      }

      const log = await prisma.log.create({
        data: {
          projectId: project.id,
          deviceId: device?.id,
          sessionId: session?.id,
          level: level || 'info',
          message,
          tag,
          data,
          fileName,
          lineNumber,
          functionName,
          className,
          screenName,
          threadName,
          timestamp: timestamp ? new Date(timestamp) : new Date()
        }
      })

      createdLogs.push({ id: log.id })
    }

    return NextResponse.json({
      logs: createdLogs,
      count: createdLogs.length
    })
  } catch (error) {
    console.error('Create log error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Dashboard endpoint: List logs for a project with search and filters
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const deviceId = searchParams.get('deviceId')
    const level = searchParams.get('level')
    const tag = searchParams.get('tag')
    const search = searchParams.get('search')
    const screenName = searchParams.get('screenName')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    // Pagination parameters (support both page/limit and offset/limit for backwards compatibility)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : (page - 1) * limit

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
    }

    // Verify user owns the project
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: user.id }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Build where clause
    const where: Record<string, unknown> = { projectId }
    if (deviceId) where.deviceId = deviceId
    if (level) where.level = level
    if (tag) where.tag = tag
    if (screenName) where.screenName = screenName

    // Search in message and tag
    if (search) {
      where.OR = [
        { message: { contains: search, mode: 'insensitive' } },
        { tag: { contains: search, mode: 'insensitive' } },
        { className: { contains: search, mode: 'insensitive' } },
        { functionName: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Date range filter
    if (startDate || endDate) {
      where.timestamp = {}
      if (startDate) (where.timestamp as Record<string, Date>).gte = new Date(startDate)
      if (endDate) (where.timestamp as Record<string, Date>).lte = new Date(endDate)
    }

    const [logs, total, levelCounts, tagCounts, screenCounts] = await Promise.all([
      prisma.log.findMany({
        where,
        include: {
          device: {
            select: { deviceId: true, platform: true, model: true }
          },
          session: {
            select: { id: true, sessionToken: true }
          }
        },
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.log.count({ where }),
      // Get counts per level
      prisma.log.groupBy({
        by: ['level'],
        where: { projectId },
        _count: true
      }),
      // Get unique tags
      prisma.log.findMany({
        where: { projectId, tag: { not: null } },
        select: { tag: true },
        distinct: ['tag']
      }),
      // Get unique screen names
      prisma.log.findMany({
        where: { projectId, screenName: { not: null } },
        select: { screenName: true },
        distinct: ['screenName']
      })
    ])

    // Process level counts into an object
    const levels = {
      verbose: 0,
      debug: 0,
      info: 0,
      warn: 0,
      error: 0,
      assert: 0
    }
    levelCounts.forEach(item => {
      if (item.level in levels) {
        levels[item.level as keyof typeof levels] = item._count
      }
    })

    const totalPages = Math.ceil(total / limit)

    const pagination = {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }

    return NextResponse.json({
      logs,
      total,
      limit,
      offset,
      pagination,
      levels,
      tags: tagCounts.map(t => t.tag).filter(Boolean),
      screenNames: screenCounts.map(s => s.screenName).filter(Boolean)
    })
  } catch (error) {
    console.error('Get logs error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Dashboard endpoint: Delete logs
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const logId = searchParams.get('logId')
    const level = searchParams.get('level')
    const olderThan = searchParams.get('olderThan') // ISO date string

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
    }

    // Verify user owns the project
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: user.id }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Delete specific log
    if (logId) {
      await prisma.log.delete({
        where: { id: logId, projectId }
      })
      return NextResponse.json({ message: 'Log deleted', count: 1 })
    }

    // Build where clause for bulk delete
    const where: Record<string, unknown> = { projectId }
    if (level) where.level = level
    if (olderThan) where.timestamp = { lt: new Date(olderThan) }

    const result = await prisma.log.deleteMany({ where })

    return NextResponse.json({
      message: 'Logs deleted',
      count: result.count
    })
  } catch (error) {
    console.error('Delete logs error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
