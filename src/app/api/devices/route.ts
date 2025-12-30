import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateApiKey, getAuthUser } from '@/lib/auth'
import { validateFeature } from '@/lib/subscription-validation'
import { checkThrottling } from '@/lib/throttling'

// SDK endpoint: Register or update a device
export async function POST(request: NextRequest) {
  try {
    const project = await validateApiKey(request)
    if (!project) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    // Validate subscription and feature access
    const validation = await validateFeature(project.userId, 'deviceTracking')
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || 'Subscription invalid' },
        { status: 403 }
      )
    }

    const { 
      deviceId, 
      platform, 
      osVersion, 
      appVersion, 
      model, 
      manufacturer, 
      metadata, 
      deviceCode,
      // Phase 1: Enhanced fingerprinting and health metrics
      fingerprint,
      batteryLevel,
      storageFree,
      memoryTotal,
      networkType,
      screenWidth,
      screenHeight,
      screenDensity,
      cpuArchitecture,
      // Firebase-like device properties
      deviceCategory,
      deviceBrand,
      locale,
      language,
      timeZone,
      timeZoneOffset,
      advertisingId,
      vendorId,
      limitedAdTracking,
      appId,
      appInstanceId,
      firstOpenAt,
      firstPurchaseAt
    } = await request.json()

    // Check throttling for devices (only for new registrations)
    // Check if device already exists (unique constraint removed, so use findFirst)
    // Note: We check for any device with this projectId+deviceId, regardless of status
    // If it exists but is deleted, we'll reactivate it
    const existingDevice = await prisma.device.findFirst({
      where: {
        projectId: project.id,
        deviceId
      },
    })

    // Only check throttling for new device registrations
    if (!existingDevice) {
      const throttling = await checkThrottling(project.userId, 'devices')
      if (throttling.throttled) {
        return NextResponse.json(
          {
            error: throttling.error || 'Quota exceeded',
            retryAfter: throttling.retryAfter,
          },
          {
            status: 429,
            headers: {
              'Retry-After': throttling.retryAfter?.toString() || '3600',
            },
          }
        )
      }
    }

    if (!deviceId || !platform) {
      return NextResponse.json(
        { error: 'deviceId and platform are required' },
        { status: 400 }
      )
    }

    // Build device data object
    // Store extra fields that don't exist in Device model in metadata
    const extraMetadata: any = {}
    if (fingerprint !== undefined) extraMetadata.fingerprint = fingerprint
    if (batteryLevel !== undefined) extraMetadata.batteryLevel = batteryLevel
    if (storageFree !== undefined) extraMetadata.storageFree = storageFree
    if (memoryTotal !== undefined) extraMetadata.memoryTotal = memoryTotal
    if (networkType !== undefined) extraMetadata.networkType = networkType
    if (screenWidth !== undefined) extraMetadata.screenWidth = screenWidth
    if (screenHeight !== undefined) extraMetadata.screenHeight = screenHeight
    if (screenDensity !== undefined) extraMetadata.screenDensity = screenDensity
    if (cpuArchitecture !== undefined) extraMetadata.cpuArchitecture = cpuArchitecture
    if (deviceCategory !== undefined) extraMetadata.deviceCategory = deviceCategory
    if (deviceBrand !== undefined) extraMetadata.deviceBrand = deviceBrand
    if (locale !== undefined) extraMetadata.locale = locale
    if (language !== undefined) extraMetadata.language = language
    if (timeZone !== undefined) extraMetadata.timeZone = timeZone
    if (timeZoneOffset !== undefined) extraMetadata.timeZoneOffset = timeZoneOffset
    if (advertisingId !== undefined) extraMetadata.advertisingId = advertisingId
    if (vendorId !== undefined) extraMetadata.vendorId = vendorId
    if (limitedAdTracking !== undefined) extraMetadata.limitedAdTracking = limitedAdTracking
    if (appId !== undefined) extraMetadata.appId = appId
    if (appInstanceId !== undefined) extraMetadata.appInstanceId = appInstanceId
    if (firstOpenAt !== undefined) extraMetadata.firstOpenAt = firstOpenAt
    if (firstPurchaseAt !== undefined) extraMetadata.firstPurchaseAt = firstPurchaseAt

    // Merge provided metadata with extra fields
    // Handle metadata as object or string
    let finalMetadata: any = {}
    if (metadata) {
      if (typeof metadata === 'string') {
        try {
          finalMetadata = JSON.parse(metadata)
        } catch {
          finalMetadata = { raw: metadata }
        }
      } else if (typeof metadata === 'object') {
        finalMetadata = metadata
      }
    }
    const combinedMetadata = { ...finalMetadata, ...extraMetadata }

    const deviceData: any = {
      projectId: project.id,
      deviceId,
      platform,
      status: 'active',
      deletedAt: null,
      lastSeenAt: new Date()
    }

    // Add optional fields only if they're provided (only fields that exist in schema)
    if (osVersion) deviceData.osVersion = osVersion
    if (appVersion) deviceData.appVersion = appVersion
    if (model) deviceData.model = model
    if (manufacturer) deviceData.manufacturer = manufacturer
    if (Object.keys(combinedMetadata).length > 0) deviceData.metadata = combinedMetadata
    if (deviceCode) deviceData.deviceCode = deviceCode

    let device
    if (existingDevice) {
      // Update existing device
      const { projectId: _, deviceId: __, ...updateData } = deviceData
      device = await prisma.device.update({
        where: { id: existingDevice.id },
        data: updateData,
        select: {
          id: true,
          deviceCode: true,
          debugModeEnabled: true,
          debugModeExpiresAt: true
        }
      })
    } else {
      // Create new device
      device = await prisma.device.create({
        data: deviceData,
        select: {
          id: true,
          deviceCode: true,
          debugModeEnabled: true,
          debugModeExpiresAt: true
        }
      })
    }

    // Check if debug mode is expired
    const now = new Date()
    const isDebugExpired = device.debugModeExpiresAt && device.debugModeExpiresAt < now
    const effectiveDebugMode = device.debugModeEnabled && !isDebugExpired

    return NextResponse.json({
      device: {
        id: device.id,
        deviceCode: device.deviceCode,
        debugModeEnabled: effectiveDebugMode,
        debugModeExpiresAt: device.debugModeExpiresAt?.toISOString() || null,
        trackingEnabled: true // This will be controlled by SDK settings trackingMode
      }
    })
  } catch (error) {
    console.error('Device registration error:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error('Error details:', { errorMessage, errorStack })
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }, { status: 500 })
  }
}

// Dashboard endpoint: List devices for a project
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const platform = searchParams.get('platform') // 'android' | 'ios' | ''
    const startDate = searchParams.get('startDate') // ISO date string
    const endDate = searchParams.get('endDate') // ISO date string
    const search = searchParams.get('search') // Search by deviceId, model
    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const sortBy = searchParams.get('sortBy') || 'lastSeenAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

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

    // Build where clause with filters
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { 
      projectId
      // Note: Status filter temporarily removed until Prisma client recognizes the field
      // TODO: Re-enable status filter after Prisma client is properly regenerated
      // AND: [
      //   {
      //     OR: [
      //       { status: 'active' },
      //       { status: null } // Handle devices created before status field was added
      //     ]
      //   }
      // ]
    }

    if (platform) {
      where.platform = platform
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        // Set to end of day
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        where.createdAt.lte = end
      }
    }

    // Search by deviceId, model, deviceCode, user email
    // Combine search with status filter using AND
    if (search) {
      where.AND = where.AND || []
      where.AND.push({
        OR: [
          { deviceId: { contains: search, mode: 'insensitive' } },
          { model: { contains: search, mode: 'insensitive' } },
          { platform: { contains: search, mode: 'insensitive' } },
          { deviceCode: { contains: search, mode: 'insensitive' } },
          { userEmail: { contains: search, mode: 'insensitive' } },
          { userName: { contains: search, mode: 'insensitive' } }
        ]
      })
    }

    // Calculate pagination offset
    const skip = (page - 1) * limit

    // Build orderBy clause
    const orderBy: Record<string, string> = {}
    orderBy[sortBy] = sortOrder

    // Fetch devices with filters and pagination
    // Note: Status filter will be added once Prisma client recognizes the status field
    const [devices, filteredCount, totalCount, androidCount, iosCount, todayCount, thisWeekCount, thisMonthCount, debugModeCount] = await Promise.all([
      prisma.device.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          projectId: true,
          deviceId: true,
          deviceCode: true,
          platform: true,
          osVersion: true,
          appVersion: true,
          model: true,
          manufacturer: true,
          metadata: true,
          userId: true,
          userEmail: true,
          userName: true,
          debugModeEnabled: true,
          debugModeEnabledAt: true,
          debugModeExpiresAt: true,
          lastSeenAt: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      // Count filtered results for pagination
      prisma.device.count({ where }),
      // Get aggregated stats (always for the full project, not filtered)
      // Note: Status filter temporarily removed until Prisma client recognizes the field
      prisma.device.count({ where: { projectId } }),
      prisma.device.count({ where: { projectId, platform: 'android' } }),
      prisma.device.count({ where: { projectId, platform: 'ios' } }),
      prisma.device.count({
        where: {
          projectId,
          createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
        }
      }),
      prisma.device.count({
        where: {
          projectId,
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      }),
      prisma.device.count({
        where: {
          projectId,
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      }),
      prisma.device.count({
        where: {
          projectId,
          debugModeEnabled: true
        }
      })
    ])

    const totalPages = Math.ceil(filteredCount / limit)

    const stats = {
      total: totalCount,
      android: androidCount,
      ios: iosCount,
      today: todayCount,
      thisWeek: thisWeekCount,
      thisMonth: thisMonthCount,
      debugModeCount
    }

    const pagination = {
      page,
      limit,
      total: filteredCount,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }

    return NextResponse.json({ devices, stats, pagination })
  } catch (error) {
    console.error('Get devices error:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error('Error details:', { errorMessage, errorStack })
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }, { status: 500 })
  }
}
