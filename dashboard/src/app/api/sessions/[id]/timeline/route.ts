import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// Timeline event types
type ScreenEvent = {
  type: 'screen'
  name: string
  timestamp: string
}

type RequestEvent = {
  type: 'request'
  id: string
  method: string
  url: string
  endpoint: string
  statusCode: number | null
  duration: number | null
  cost: number | null
  error: string | null
  requestBody: string | null
  responseBody: string | null
  requestHeaders: unknown
  responseHeaders: unknown
  timestamp: string
}

type LogEvent = {
  type: 'log'
  id: string
  level: string
  message: string
  tag: string | null
  data: unknown
  fileName: string | null
  lineNumber: number | null
  functionName: string | null
  className: string | null
  timestamp: string
}

type TimelineEvent = ScreenEvent | RequestEvent | LogEvent

type TimelineResponse = {
  session: {
    id: string
    sessionToken: string
    startedAt: string
    endedAt: string | null
    isActive: boolean
    duration: number | null
    screenCount: number
    eventCount: number
    errorCount: number
    appVersion: string | null
    osVersion: string | null
    locale: string | null
    timezone: string | null
    device: {
      deviceId: string
      platform: string
      model: string | null
    } | null
  }
  timeline: TimelineEvent[]
  stats: {
    totalRequests: number
    totalLogs: number
    successfulRequests: number
    failedRequests: number
    totalCost: number
  }
}

// GET - Get session timeline with all events (screens, requests, logs)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const payload = verifyToken(token)

    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch session with device info
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        device: {
          select: {
            deviceId: true,
            platform: true,
            model: true
          }
        },
        project: {
          select: {
            userId: true
          }
        }
      }
    })

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Verify project ownership
    if (session.project.userId !== payload.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Fetch all traces for this session
    const traces = await prisma.apiTrace.findMany({
      where: { sessionId },
      select: {
        id: true,
        url: true,
        method: true,
        statusCode: true,
        duration: true,
        cost: true,
        error: true,
        screenName: true,
        requestBody: true,
        responseBody: true,
        requestHeaders: true,
        responseHeaders: true,
        timestamp: true
      },
      orderBy: { timestamp: 'asc' }
    })

    // Fetch all logs for this session
    const logs = await prisma.log.findMany({
      where: { sessionId },
      select: {
        id: true,
        level: true,
        message: true,
        tag: true,
        data: true,
        fileName: true,
        lineNumber: true,
        functionName: true,
        className: true,
        screenName: true,
        timestamp: true
      },
      orderBy: { timestamp: 'asc' }
    })

    // Build timeline by merging traces and logs
    const timeline: TimelineEvent[] = []
    let currentScreen: string | null = null
    let traceIdx = 0
    let logIdx = 0

    // Helper to extract endpoint path from URL
    const getEndpoint = (url: string): string => {
      try {
        const parsed = new URL(url)
        return parsed.pathname
      } catch {
        return url
      }
    }

    // Merge traces and logs in timestamp order
    while (traceIdx < traces.length || logIdx < logs.length) {
      const trace = traces[traceIdx]
      const log = logs[logIdx]

      // Determine which comes first
      let nextIsTrace = false
      if (trace && log) {
        nextIsTrace = new Date(trace.timestamp) <= new Date(log.timestamp)
      } else if (trace) {
        nextIsTrace = true
      }

      if (nextIsTrace && trace) {
        // Check for screen change
        const screenName = trace.screenName || 'Unknown'
        if (screenName !== currentScreen) {
          timeline.push({
            type: 'screen',
            name: screenName,
            timestamp: trace.timestamp.toISOString()
          })
          currentScreen = screenName
        }

        // Add request event
        timeline.push({
          type: 'request',
          id: trace.id,
          method: trace.method,
          url: trace.url,
          endpoint: getEndpoint(trace.url),
          statusCode: trace.statusCode,
          duration: trace.duration,
          cost: trace.cost,
          error: trace.error,
          requestBody: trace.requestBody,
          responseBody: trace.responseBody,
          requestHeaders: trace.requestHeaders,
          responseHeaders: trace.responseHeaders,
          timestamp: trace.timestamp.toISOString()
        })
        traceIdx++
      } else if (log) {
        // Check for screen change from log
        const logScreenName: string = log.screenName || currentScreen || 'Unknown'
        if (logScreenName !== currentScreen && log.screenName) {
          timeline.push({
            type: 'screen',
            name: logScreenName,
            timestamp: log.timestamp.toISOString()
          })
          currentScreen = logScreenName
        }

        // Add log event
        timeline.push({
          type: 'log',
          id: log.id,
          level: log.level,
          message: log.message,
          tag: log.tag,
          data: log.data,
          fileName: log.fileName,
          lineNumber: log.lineNumber,
          functionName: log.functionName,
          className: log.className,
          timestamp: log.timestamp.toISOString()
        })
        logIdx++
      }
    }

    // If timeline is empty but session has entry screen, add it
    if (timeline.length === 0 && session.entryScreen) {
      timeline.push({
        type: 'screen',
        name: session.entryScreen,
        timestamp: session.startedAt.toISOString()
      })
    }

    // Calculate stats
    const successfulRequests = traces.filter(t => t.statusCode && t.statusCode >= 200 && t.statusCode < 400).length
    const failedRequests = traces.filter(t => t.statusCode && (t.statusCode >= 400 || t.statusCode === 0)).length
    const totalCost = traces.reduce((sum, t) => sum + (t.cost || 0), 0)

    const response: TimelineResponse = {
      session: {
        id: session.id,
        sessionToken: session.sessionToken,
        startedAt: session.startedAt.toISOString(),
        endedAt: session.endedAt?.toISOString() || null,
        isActive: session.isActive,
        duration: session.duration,
        screenCount: session.screenCount,
        eventCount: session.eventCount,
        errorCount: session.errorCount,
        appVersion: session.appVersion,
        osVersion: session.osVersion,
        locale: session.locale,
        timezone: session.timezone,
        device: session.device
      },
      timeline,
      stats: {
        totalRequests: traces.length,
        totalLogs: logs.length,
        successfulRequests,
        failedRequests,
        totalCost
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Session timeline GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
