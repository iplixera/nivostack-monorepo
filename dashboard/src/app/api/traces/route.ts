import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateApiKey, getAuthUser } from '@/lib/auth'
import { validateSubscription, validateFeature } from '@/lib/subscription-validation'
import { checkThrottling } from '@/lib/throttling'
import { canPerformAction } from '@/lib/team-access'

// Default values for settings
const DEFAULT_SDK_SETTINGS = {
  trackingMode: 'all'
}

const DEFAULT_FEATURE_FLAGS = {
  sdkEnabled: true,
  apiTracking: true
}

// Helper to check if tracking is enabled for a device
async function isTrackingEnabled(projectId: string, deviceId?: string): Promise<boolean> {
  // Fetch feature flags and SDK settings
  // Note: deviceId parameter is the database ID (cuid), not platform device ID
  const [featureFlags, sdkSettings, device] = await Promise.all([
    prisma.featureFlags.findUnique({
      where: { projectId },
      select: { sdkEnabled: true, apiTracking: true }
    }),
    prisma.sdkSettings.findUnique({
      where: { projectId },
      select: { trackingMode: true }
    }),
    deviceId ? prisma.device.findFirst({
      where: { projectId, id: deviceId }, // Query by database ID
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
  
  // Check API tracking feature flag
  if (!effectiveFlags.apiTracking) return false

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

// Helper function to check alerts and create monitored errors
async function checkAlertsForTrace(
  projectId: string,
  trace: {
    id: string
    url: string
    method: string
    statusCode?: number
    requestBody?: string
    responseBody?: string
    deviceId?: string
    sessionId?: string
  }
): Promise<void> {
  try {
    // Extract endpoint path from URL
    let endpointPath: string
    try {
      const urlObj = new URL(trace.url)
      endpointPath = urlObj.pathname
    } catch {
      endpointPath = trace.url
    }

    // Find matching alerts for this project
    const alerts = await prisma.apiAlert.findMany({
      where: {
        projectId,
        isEnabled: true
      }
    })

    for (const alert of alerts) {
      // Check if endpoint matches
      let endpointMatches = false
      if (!alert.endpoint) {
        // No endpoint filter = matches all
        endpointMatches = true
      } else if (alert.endpoint === endpointPath) {
        endpointMatches = true
      } else if (alert.endpoint.endsWith('/*')) {
        const pattern = alert.endpoint.slice(0, -2)
        endpointMatches = endpointPath.startsWith(pattern)
      }

      if (!endpointMatches) continue

      // Check if method matches
      if (alert.method && alert.method !== trace.method) continue

      // Check error conditions
      let isError = false
      let errorType = ''
      let errorCode = ''

      // Check status codes
      if (trace.statusCode) {
        // Check standard error codes
        if (alert.monitorStandardErrors && alert.standardErrorCodes.length > 0) {
          if (alert.standardErrorCodes.includes(trace.statusCode)) {
            isError = true
            errorType = 'status_code'
            errorCode = trace.statusCode.toString()
          }
        }

        // Check custom status codes
        if (!isError && alert.customStatusCodes.length > 0) {
          if (alert.customStatusCodes.includes(trace.statusCode)) {
            isError = true
            errorType = 'custom_status_code'
            errorCode = trace.statusCode.toString()
          }
        }
      }

      // Check body error field
      if (!isError && alert.bodyErrorField && alert.bodyErrorValues.length > 0 && trace.responseBody) {
        try {
          const body = JSON.parse(trace.responseBody)
          const fieldValue = alert.bodyErrorField.split('.').reduce((obj, key) => obj?.[key], body)
          if (fieldValue && alert.bodyErrorValues.includes(String(fieldValue))) {
            isError = true
            errorType = 'body_error'
            errorCode = String(fieldValue)
          }
        } catch {
          // Not JSON or field not found
        }
      }

      // Check header error field (would need responseHeaders in trace)
      // Skipping for now as headers aren't always available

      if (isError) {
        // Check if we already have this error tracked
        const existingError = await prisma.monitoredError.findFirst({
          where: {
            alertId: alert.id,
            projectId,
            endpoint: endpointPath,
            method: trace.method,
            errorCode,
            isResolved: false
          }
        })

        if (existingError) {
          // Update existing error
          const affectedDevices = existingError.affectedDevices
          const affectedSessions = existingError.affectedSessions

          if (trace.deviceId && !affectedDevices.includes(trace.deviceId)) {
            affectedDevices.push(trace.deviceId)
          }
          if (trace.sessionId && !affectedSessions.includes(trace.sessionId)) {
            affectedSessions.push(trace.sessionId)
          }

          await prisma.monitoredError.update({
            where: { id: existingError.id },
            data: {
              lastOccurrence: new Date(),
              occurrenceCount: { increment: 1 },
              affectedDevices,
              affectedSessions,
              lastTraceId: trace.id,
              requestBody: trace.requestBody,
              responseBody: trace.responseBody,
              statusCode: trace.statusCode
            }
          })
        } else {
          // Create new monitored error
          await prisma.monitoredError.create({
            data: {
              alertId: alert.id,
              projectId,
              errorType,
              errorCode,
              endpoint: endpointPath,
              method: trace.method,
              statusCode: trace.statusCode,
              requestBody: trace.requestBody,
              responseBody: trace.responseBody,
              affectedDevices: trace.deviceId ? [trace.deviceId] : [],
              affectedSessions: trace.sessionId ? [trace.sessionId] : [],
              lastTraceId: trace.id
            }
          })
        }

        // TODO: Send notifications based on alert settings
        // (email, push, SMS, webhook)
        break // Only create one error per trace
      }
    }
  } catch (error) {
    console.error('Error checking alerts for trace:', error)
  }
}

// Helper function to calculate cost for a trace
async function calculateTraceCost(projectId: string, url: string, method: string): Promise<number> {
  try {
    // Extract endpoint path from URL
    let endpointPath: string
    try {
      const urlObj = new URL(url)
      endpointPath = urlObj.pathname
    } catch {
      endpointPath = url
    }

    console.log(`Trace cost calc: projectId=${projectId}, path=${endpointPath}, method=${method}`)

    // Find matching API config
    // First try exact match with method
    let config = await prisma.apiConfig.findFirst({
      where: {
        projectId,
        endpoint: endpointPath,
        method: method,
        isEnabled: true
      }
    })

    // If not found, try exact match without method (null method = all methods)
    if (!config) {
      config = await prisma.apiConfig.findFirst({
        where: {
          projectId,
          endpoint: endpointPath,
          method: null,
          isEnabled: true
        }
      })
    }

    // If still not found, try pattern matching (endpoints ending with /*)
    if (!config) {
      const configs = await prisma.apiConfig.findMany({
        where: {
          projectId,
          endpoint: { endsWith: '/*' },
          isEnabled: true
        }
      })

      for (const c of configs) {
        const pattern = c.endpoint.slice(0, -2) // Remove /*
        if (endpointPath.startsWith(pattern)) {
          if (!c.method || c.method === method) {
            config = c
            break
          }
        }
      }
    }

    const cost = config?.costPerRequest || 0
    console.log(`Trace cost calc result: config=${config?.id || 'none'}, cost=${cost}`)

    return cost
  } catch (error) {
    console.error('Error calculating trace cost:', error)
    return 0
  }
}

// SDK endpoint: Create an API trace
export async function POST(request: NextRequest) {
  try {
    const project = await validateApiKey(request)
    if (!project) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    // Validate subscription and feature access
    const validation = await validateFeature(project.userId, 'apiTracking')
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || 'Subscription invalid' },
        { status: 403 }
      )
    }

    const {
      deviceId,
      sessionToken,
      url,
      method,
      statusCode,
      requestHeaders,
      requestBody,
      responseHeaders,
      responseBody,
      duration,
      error,
      timestamp,
      // New metadata fields
      screenName,
      networkType,
      country,
      carrier,
      ipAddress,
      userAgent
    } = await request.json()

    if (!url || !method) {
      return NextResponse.json(
        { error: 'url and method are required' },
        { status: 400 }
      )
    }

    // Check throttling for API requests (each trace is a request)
    const requestsThrottling = await checkThrottling(project.userId, 'apiRequests')
    if (requestsThrottling.throttled || (requestsThrottling.usage && requestsThrottling.usage.limit !== null && requestsThrottling.usage.used >= requestsThrottling.usage.limit)) {
      return NextResponse.json(
        {
          error: requestsThrottling.error || `API requests limit reached. You have used ${requestsThrottling.usage?.used || 0} of ${requestsThrottling.usage?.limit || 0} requests. Please upgrade your plan.`,
          usage: requestsThrottling.usage,
          retryAfter: requestsThrottling.retryAfter,
        },
        {
          status: requestsThrottling.throttled ? 429 : 403,
          headers: {
            'Retry-After': requestsThrottling.retryAfter?.toString() || '3600',
          },
        }
      )
    }

    // Check API endpoints quota (unique endpoints)
    // Note: We check this before creating, but the actual count happens after creation
    // This is a best-effort check - the final count happens in getUsageStats
    const endpointsThrottling = await checkThrottling(project.userId, 'apiEndpoints')
    if (endpointsThrottling.throttled || (endpointsThrottling.usage && endpointsThrottling.usage.limit !== null && endpointsThrottling.usage.used >= endpointsThrottling.usage.limit)) {
      // Check if this is a new unique endpoint
      const existingTrace = await prisma.apiTrace.findFirst({
        where: {
          projectId: project.id,
          url,
          method,
          createdAt: {
            gte: new Date(new Date().setDate(new Date().getDate() - 30)) // Check within current period
          }
        },
      })
      
      // Block if limit is reached AND this is a new unique endpoint
      // If endpoint already exists, allow it (reusing existing endpoint doesn't count against limit)
      if (!existingTrace) {
        return NextResponse.json(
          {
            error: endpointsThrottling.error || `API endpoints limit reached. You have used ${endpointsThrottling.usage?.used || 0} of ${endpointsThrottling.usage?.limit || 0} unique endpoints. Please upgrade your plan.`,
            usage: endpointsThrottling.usage,
            retryAfter: endpointsThrottling.retryAfter,
          },
          {
            status: endpointsThrottling.throttled ? 429 : 403,
            headers: {
              'Retry-After': endpointsThrottling.retryAfter?.toString() || '3600',
            },
          }
        )
      }
    }

    // Check if tracking is enabled before processing trace
    const trackingAllowed = await isTrackingEnabled(project.id, deviceId)
    if (!trackingAllowed) {
      // Silently reject - SDK should handle this, but server validates too
      return NextResponse.json({
        trace: null,
        message: 'Tracking disabled'
      }, { status: 200 })
    }

    // Find device if deviceId provided
    // Note: SDK sends the database device ID (cuid), not the platform device ID
    let device = null
    if (deviceId) {
      device = await prisma.device.findFirst({
        where: {
          projectId: project.id,
          id: deviceId, // Query by database ID, not platform deviceId field
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

    // Get IP from request headers if not provided
    const clientIp = ipAddress ||
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown'

    // Calculate cost for this request
    const cost = await calculateTraceCost(project.id, url, method)

    const processedRequestBody = typeof requestBody === 'string' ? requestBody : JSON.stringify(requestBody)
    const processedResponseBody = typeof responseBody === 'string' ? responseBody : JSON.stringify(responseBody)

    const trace = await prisma.apiTrace.create({
      data: {
        projectId: project.id,
        deviceId: device?.id,
        sessionId: session?.id,
        url,
        method,
        statusCode,
        requestHeaders,
        requestBody: processedRequestBody,
        responseHeaders,
        responseBody: processedResponseBody,
        duration,
        error,
        screenName,
        networkType,
        country,
        carrier,
        ipAddress: clientIp,
        userAgent,
        cost,
        timestamp: timestamp ? new Date(timestamp) : new Date()
      }
    })

    // Check alerts and create monitored errors if needed (async, don't block response)
    checkAlertsForTrace(project.id, {
      id: trace.id,
      url,
      method,
      statusCode,
      requestBody: processedRequestBody,
      responseBody: processedResponseBody,
      deviceId: device?.id,
      sessionId: session?.id
    }).catch(err => console.error('Alert check error:', err))

    return NextResponse.json({ trace: { id: trace.id, cost } })
  } catch (error) {
    console.error('Create trace error:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error('Error details:', { errorMessage, errorStack })
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }, { status: 500 })
  }
}

// Dashboard endpoint: List API traces for a project
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const deviceId = searchParams.get('deviceId')
    const method = searchParams.get('method')
    const statusCode = searchParams.get('statusCode')
    const baseUrl = searchParams.get('baseUrl')
    const endpoint = searchParams.get('endpoint')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const screenName = searchParams.get('screenName')
    const groupByDevice = searchParams.get('groupByDevice') === 'true'
    // Pagination parameters (support both page/limit and offset/limit for backwards compatibility)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : (page - 1) * limit

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
    }

    // Check if user has access to project (owner or member)
    const hasAccess = await canPerformAction(user.id, projectId, 'view')
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

    const where: Record<string, unknown> = { projectId }
    if (deviceId) where.deviceId = deviceId
    if (method) where.method = method
    if (statusCode) where.statusCode = parseInt(statusCode)

    // Handle URL filtering - baseUrl and endpoint can be combined
    if (baseUrl || endpoint) {
      const urlConditions: any[] = []
      if (baseUrl) {
        urlConditions.push({ contains: baseUrl })
      }
      if (endpoint) {
        urlConditions.push({ contains: endpoint })
      }

      if (urlConditions.length === 1) {
        where.url = urlConditions[0]
      } else {
        where.url = {
          AND: urlConditions
        }
      }
    }

    if (startDate || endDate) {
      const dateRange: any = {}
      if (startDate) dateRange.gte = new Date(startDate + 'T00:00:00.000Z')
      if (endDate) dateRange.lte = new Date(endDate + 'T23:59:59.999Z')
      where.timestamp = dateRange
    }
    if (screenName) where.screenName = screenName

    // Get unique screen names for filter dropdown
    const screenNames = await prisma.apiTrace.findMany({
      where: { projectId },
      select: { screenName: true },
      distinct: ['screenName']
    })

    // Get unique devices for grouping
    const devices = await prisma.device.findMany({
      where: { projectId },
      select: { id: true, deviceId: true, platform: true, model: true }
    })

    const [traces, total] = await Promise.all([
      prisma.apiTrace.findMany({
        where,
        include: {
          device: {
            select: { deviceId: true, platform: true, model: true }
          }
        },
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.apiTrace.count({ where })
    ])

    // Group traces by device if requested
    let groupedTraces = null
    if (groupByDevice) {
      groupedTraces = devices.map(device => ({
        device,
        traces: traces.filter(t => t.device?.deviceId === device.deviceId),
        count: traces.filter(t => t.device?.deviceId === device.deviceId).length
      }))
    }

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
      traces,
      total,
      limit,
      offset,
      pagination,
      screenNames: screenNames.map(s => s.screenName).filter(Boolean),
      devices,
      groupedTraces
    })
  } catch (error) {
    console.error('Get traces error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Dashboard endpoint: Delete traces
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const deviceId = searchParams.get('deviceId')
    const traceId = searchParams.get('traceId')

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

    // Delete specific trace or all traces for project/device
    if (traceId) {
      await prisma.apiTrace.delete({
        where: { id: traceId, projectId }
      })
      return NextResponse.json({ message: 'Trace deleted', count: 1 })
    }

    const where: Record<string, string> = { projectId }
    if (deviceId) where.deviceId = deviceId

    const result = await prisma.apiTrace.deleteMany({ where })

    return NextResponse.json({
      message: deviceId ? 'Device traces cleared' : 'All traces cleared',
      count: result.count
    })
  } catch (error) {
    console.error('Delete traces error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
