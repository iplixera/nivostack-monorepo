import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateApiKey, getAuthUser } from '@/lib/auth'
import { validateFeature } from '@/lib/subscription-validation'
import { checkThrottling } from '@/lib/throttling'

// SDK endpoint: Report a crash
export async function POST(request: NextRequest) {
  try {
    const project = await validateApiKey(request)
    if (!project) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    // Validate subscription and feature access
    const validation = await validateFeature(project.userId, 'crashReporting')
    if (!validation.valid) {
      return NextResponse.json({
        error: validation.error || 'Subscription invalid',
        message: validation.error || 'Please upgrade to continue using DevBridge.'
      }, { status: 403 })
    }

    // Check throttling for crashes
    const throttling = await checkThrottling(project.userId, 'crashes')
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

    const { deviceId, message, stackTrace, metadata, timestamp } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'message is required' }, { status: 400 })
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

    const crash = await prisma.crash.create({
      data: {
        projectId: project.id,
        deviceId: device?.id,
        message,
        stackTrace,
        metadata,
        timestamp: timestamp ? new Date(timestamp) : new Date()
      }
    })

    return NextResponse.json({ crash: { id: crash.id } })
  } catch (error) {
    console.error('Report crash error:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error('Error details:', { errorMessage, errorStack })
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }, { status: 500 })
  }
}

// Dashboard endpoint: List crashes for a project
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const deviceId = searchParams.get('deviceId')
    const platform = searchParams.get('platform')
    const search = searchParams.get('search')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const sortBy = searchParams.get('sortBy') || 'timestamp'
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

    // Build where clause
    const where: Record<string, unknown> = { projectId }
    
    if (deviceId) {
      const device = await prisma.device.findFirst({
        where: { projectId, deviceId, status: 'active' },
        select: { id: true }
      })
      if (device) {
        where.deviceId = device.id
      } else {
        // If device not found, return empty results
        return NextResponse.json({ 
          crashes: [], 
          total: 0, 
          limit, 
          offset: (page - 1) * limit,
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false
          },
          platforms: [],
          devices: []
        })
      }
    }

    if (platform) {
      const devicesWithPlatform = await prisma.device.findMany({
        where: { projectId, platform, status: 'active' },
        select: { id: true }
      })
      if (devicesWithPlatform.length > 0) {
        where.deviceId = { in: devicesWithPlatform.map(d => d.id) }
      } else {
        // If no devices with platform, return empty results
        return NextResponse.json({ 
          crashes: [], 
          total: 0, 
          limit, 
          offset: (page - 1) * limit,
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false
          },
          platforms: [],
          devices: []
        })
      }
    }

    if (startDate || endDate) {
      const timestampFilter: { gte?: Date; lte?: Date } = {}
      if (startDate) {
        timestampFilter.gte = new Date(startDate)
      }
      if (endDate) {
        timestampFilter.lte = new Date(endDate)
      }
      where.timestamp = timestampFilter
    }

    if (search) {
      where.OR = [
        { message: { contains: search, mode: 'insensitive' } },
        { stackTrace: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Calculate pagination
    const offset = (page - 1) * limit
    const orderBy: Record<string, string> = {}
    orderBy[sortBy] = sortOrder

    // Get unique platforms and devices for filters
    const [crashes, total, allDevices] = await Promise.all([
      prisma.crash.findMany({
        where,
        include: {
          device: {
            select: { deviceId: true, platform: true, model: true }
          }
        },
        orderBy,
        take: limit,
        skip: offset
      }),
      prisma.crash.count({ where }),
      prisma.device.findMany({
        where: { projectId, status: 'active' },
        select: { id: true, deviceId: true, platform: true, model: true },
        distinct: ['platform']
      })
    ])

    // Get unique platforms
    const platforms = Array.from(new Set(allDevices.map(d => d.platform))).filter(Boolean)

    // Calculate pagination info
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
      crashes, 
      total, 
      limit, 
      offset,
      pagination,
      platforms,
      devices: allDevices.map(d => ({ id: d.id, deviceId: d.deviceId, platform: d.platform, model: d.model }))
    })
  } catch (error) {
    console.error('Get crashes error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
