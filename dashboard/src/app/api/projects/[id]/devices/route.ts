import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseDeviceQuery, buildDeviceWhere } from '@/lib/deviceQuery'

/**
 * GET /api/projects/:projectId/devices
 * 
 * Returns paginated device list using the same filter logic as summary/facets.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id
    const { searchParams } = new URL(request.url)
    const query = parseDeviceQuery(searchParams)

    // Build where clause using unified logic
    const where = buildDeviceWhere(query, projectId)
    
    // Pagination
    const page = query.page || 1
    const pageSize = query.pageSize || 50
    const skip = (page - 1) * pageSize

    // Sorting
    const orderBy: any = {}
    if (query.sort?.field) {
      orderBy[query.sort.field] = query.sort.dir || 'desc'
    } else {
      orderBy.lastSeenAt = 'desc'
    }

    // Fetch devices and total count
    const [devices, total] = await Promise.all([
      prisma.device.findMany({
        where,
        orderBy,
        take: pageSize,
        skip,
        select: {
          id: true,
          deviceId: true,
          platform: true,
          environment: true,
          osVersion: true,
          appVersion: true,
          model: true,
          manufacturer: true,
          deviceCode: true,
          lastSeenAt: true,
          createdAt: true,
          debugModeEnabled: true,
          debugModeEnabledAt: true,
          debugModeEnabledBy: true,
          userId: true,
          userEmail: true,
          userName: true,
          status: true,
        },
      }),
      prisma.device.count({ where }),
    ])

    const totalPages = Math.ceil(total / pageSize)

    return NextResponse.json({
      devices,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error('Error fetching devices:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

