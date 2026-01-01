import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { validateFeature } from '@/lib/subscription-validation'
import { checkThrottling } from '@/lib/throttling'
import { canPerformAction } from '@/lib/team-access'

// GET - List sessions for a project (dashboard)
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const projectId = request.nextUrl.searchParams.get('projectId')
    const deviceId = request.nextUrl.searchParams.get('deviceId')
    const isActive = request.nextUrl.searchParams.get('isActive')
    // Pagination parameters
    const page = parseInt(request.nextUrl.searchParams.get('page') || '1')
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50')
    const sortBy = request.nextUrl.searchParams.get('sortBy') || 'startedAt'
    const sortOrder = request.nextUrl.searchParams.get('sortOrder') || 'desc'

    if (!authHeader || !projectId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const payload = verifyToken(token)

    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has access to project (owner or member)
    const hasAccess = await canPerformAction(payload.userId, projectId, 'view')
    if (!hasAccess) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 })
    }

    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const whereClause: Record<string, unknown> = { projectId }
    if (deviceId) {
      whereClause.deviceId = deviceId
    }
    if (isActive === 'true') {
      whereClause.isActive = true
    } else if (isActive === 'false') {
      whereClause.isActive = false
    }

    // Calculate pagination offset
    const skip = (page - 1) * limit

    // Build orderBy clause
    const orderBy: Record<string, string> = {}
    orderBy[sortBy] = sortOrder

    const [sessions, totalCount] = await Promise.all([
      prisma.session.findMany({
        where: whereClause,
        include: {
          device: {
            select: {
              deviceId: true,
              platform: true,
              model: true
            }
          },
          _count: {
            select: { apiTraces: true }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.session.count({ where: whereClause })
    ])

    // Calculate cost per session
    const sessionsWithCost = await Promise.all(
      sessions.map(async (session) => {
        const costResult = await prisma.apiTrace.aggregate({
          where: { sessionId: session.id },
          _sum: { cost: true },
          _count: true
        })

        return {
          id: session.id,
          sessionToken: session.sessionToken,
          startedAt: session.startedAt,
          endedAt: session.endedAt,
          isActive: session.isActive,
          duration: session.duration,
          screenCount: session.screenCount,
          screenFlow: session.screenFlow,
          device: session.device,
          requestCount: costResult._count,
          totalCost: costResult._sum.cost || 0
        }
      })
    )

    const totalPages = Math.ceil(totalCount / limit)

    const pagination = {
      page,
      limit,
      total: totalCount,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }

    return NextResponse.json({ sessions: sessionsWithCost, pagination })
  } catch (error) {
    console.error('Sessions GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Start a new session (from device)
export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key')

    if (!apiKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const project = await prisma.project.findUnique({
      where: { apiKey }
    })

    if (!project) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    // Validate subscription and feature access
    const validation = await validateFeature(project.userId, 'sessionTracking')
    if (!validation.valid) {
      return NextResponse.json({
        error: validation.error || 'Subscription invalid',
        message: validation.error || 'Please upgrade to continue using DevBridge.'
      }, { status: 403 })
    }

    // Check throttling for sessions
    const throttling = await checkThrottling(project.userId, 'sessions')
    if (throttling.throttled) {
      return NextResponse.json({
        error: throttling.error || 'Quota exceeded',
        retryAfter: throttling.retryAfter,
      }, {
        status: 429,
        headers: {
          'Retry-After': throttling.retryAfter?.toString() || '3600',
        },
      })
    }

    const body = await request.json()
    const {
      deviceId,
      sessionToken,
      metadata,
      // New session context fields
      appVersion,
      osVersion,
      locale,
      timezone,
      networkType,
      entryScreen,
      userProperties
    } = body

    if (!deviceId || !sessionToken) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Find or create the device
    let device = await prisma.device.findFirst({
      where: {
        projectId: project.id,
        deviceId,
        status: 'active'
      }
    })

    if (!device) {
      // Device should already exist from registration, but create if not
      device = await prisma.device.create({
        data: {
          projectId: project.id,
          deviceId,
          platform: metadata?.platform || 'unknown'
        }
      })
    }

    // End any existing active sessions for this device
    const endedSessions = await prisma.session.updateMany({
      where: {
        deviceId: device.id,
        isActive: true
      },
      data: {
        isActive: false,
        endedAt: new Date()
      }
    })

    // Calculate duration for ended sessions
    if (endedSessions.count > 0) {
      const activeSessions = await prisma.session.findMany({
        where: {
          deviceId: device.id,
          endedAt: { not: null },
          duration: null
        }
      })

      for (const sess of activeSessions) {
        if (sess.endedAt && sess.startedAt) {
          const durationSeconds = Math.floor((sess.endedAt.getTime() - sess.startedAt.getTime()) / 1000)
          await prisma.session.update({
            where: { id: sess.id },
            data: { duration: durationSeconds }
          })
        }
      }
    }

    // Create new session with context
    const session = await prisma.session.create({
      data: {
        projectId: project.id,
        deviceId: device.id,
        sessionToken,
        appVersion,
        osVersion,
        locale,
        timezone,
        networkType,
        entryScreen,
        screenFlow: entryScreen ? [entryScreen] : [],
        screenCount: entryScreen ? 1 : 0,
        userProperties: userProperties || {},
        metadata: metadata || {},
        isActive: true
      }
    })

    return NextResponse.json({
      sessionId: session.id,
      sessionToken: session.sessionToken
    })
  } catch (error: unknown) {
    console.error('Sessions POST error:', error)
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      // Session token already exists - return existing session
      const body = await request.json().catch(() => ({}))
      const existingSession = await prisma.session.findUnique({
        where: { sessionToken: body.sessionToken }
      })
      if (existingSession) {
        return NextResponse.json({
          sessionId: existingSession.id,
          sessionToken: existingSession.sessionToken
        })
      }
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - End a session (from device)
export async function PUT(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key')

    if (!apiKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const project = await prisma.project.findUnique({
      where: { apiKey }
    })

    if (!project) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    const body = await request.json()
    const { sessionToken, exitScreen, screenFlow, eventCount, errorCount, userProperties } = body

    if (!sessionToken) {
      return NextResponse.json({ error: 'Missing session token' }, { status: 400 })
    }

    // Get the current session first to calculate duration
    const currentSession = await prisma.session.findFirst({
      where: {
        sessionToken,
        projectId: project.id
      }
    })

    if (!currentSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    const endedAt = new Date()
    const durationSeconds = Math.floor((endedAt.getTime() - currentSession.startedAt.getTime()) / 1000)

    // Calculate unique screen count from screenFlow
    const uniqueScreens = screenFlow ? new Set(screenFlow).size : currentSession.screenCount

    const session = await prisma.session.update({
      where: { id: currentSession.id },
      data: {
        isActive: false,
        endedAt,
        exitScreen: exitScreen || (screenFlow && screenFlow.length > 0 ? screenFlow[screenFlow.length - 1] : null),
        screenFlow: screenFlow || currentSession.screenFlow,
        screenCount: uniqueScreens,
        duration: durationSeconds,
        eventCount: eventCount ?? currentSession.eventCount,
        errorCount: errorCount ?? currentSession.errorCount,
        userProperties: userProperties ? { ...currentSession.userProperties as object, ...userProperties } : currentSession.userProperties
      }
    })

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      duration: durationSeconds,
      screenCount: uniqueScreens
    })
  } catch (error) {
    console.error('Sessions PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Update session (add screen to flow, update metrics)
export async function PATCH(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key')

    if (!apiKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const project = await prisma.project.findUnique({
      where: { apiKey }
    })

    if (!project) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    // Check throttling for sessions (screen tracking uses sessions)
    const throttling = await checkThrottling(project.userId, 'sessions')
    if (throttling.throttled) {
      return NextResponse.json({
        error: throttling.error || 'Session quota exceeded',
        usage: throttling.usage,
        retryAfter: throttling.retryAfter,
      }, {
        status: 429,
        headers: {
          'Retry-After': throttling.retryAfter?.toString() || '3600',
        },
      })
    }

    const body = await request.json()
    const { sessionToken, screenName, incrementEventCount, incrementErrorCount, userProperties, metadata } = body

    if (!sessionToken) {
      return NextResponse.json({ error: 'Missing session token' }, { status: 400 })
    }

    // Get current session
    const currentSession = await prisma.session.findFirst({
      where: {
        sessionToken,
        projectId: project.id
      }
    })

    if (!currentSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Build update data
    const updateData: Record<string, unknown> = {}

    // Add screen to flow if provided
    if (screenName) {
      const currentFlow = currentSession.screenFlow || []
      // Only add if it's different from the last screen (avoid duplicates from re-renders)
      if (currentFlow.length === 0 || currentFlow[currentFlow.length - 1] !== screenName) {
        updateData.screenFlow = [...currentFlow, screenName]
        updateData.screenCount = new Set([...currentFlow, screenName]).size
      }
    }

    // Increment counters
    if (incrementEventCount) {
      updateData.eventCount = currentSession.eventCount + (typeof incrementEventCount === 'number' ? incrementEventCount : 1)
    }

    if (incrementErrorCount) {
      updateData.errorCount = currentSession.errorCount + (typeof incrementErrorCount === 'number' ? incrementErrorCount : 1)
    }

    // Merge user properties
    if (userProperties) {
      updateData.userProperties = { ...currentSession.userProperties as object, ...userProperties }
    }

    // Merge metadata
    if (metadata) {
      updateData.metadata = { ...currentSession.metadata as object, ...metadata }
    }

    // Only update if there's something to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: true, message: 'No updates to apply' })
    }

    const session = await prisma.session.update({
      where: { id: currentSession.id },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      screenCount: session.screenCount,
      eventCount: session.eventCount
    })
  } catch (error) {
    console.error('Sessions PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
