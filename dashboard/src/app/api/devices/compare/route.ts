import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

/**
 * GET /api/devices/compare
 * Compare multiple devices side-by-side
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const deviceIds = searchParams.get('ids')?.split(',') || []

    if (deviceIds.length < 2) {
      return NextResponse.json({ error: 'At least 2 device IDs are required' }, { status: 400 })
    }

    if (deviceIds.length > 5) {
      return NextResponse.json({ error: 'Maximum 5 devices can be compared' }, { status: 400 })
    }

    // Fetch all devices with counts (only active devices)
    const devices = await prisma.device.findMany({
      where: {
        id: { in: deviceIds },
        status: 'active', // Only compare active devices
        project: {
          userId: user.id
        }
      },
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            logs: true,
            crashes: true,
            apiTraces: true,
            sessions: true
          }
        }
      }
    })

    if (devices.length !== deviceIds.length) {
      return NextResponse.json({ error: 'Some devices were not found or access denied' }, { status: 404 })
    }

    // Format comparison data
    const comparison = {
      devices: devices.map(device => ({
        id: device.id,
        deviceId: device.deviceId,
        deviceCode: device.deviceCode,
        platform: device.platform,
        osVersion: device.osVersion,
        appVersion: device.appVersion,
        model: device.model,
        manufacturer: device.manufacturer,
        deviceCategory: (device as any).deviceCategory,
        deviceBrand: (device as any).deviceBrand,
        locale: (device as any).locale,
        language: (device as any).language,
        timeZone: (device as any).timeZone,
        timeZoneOffset: (device as any).timeZoneOffset,
        appId: (device as any).appId,
        appInstanceId: (device as any).appInstanceId,
        advertisingId: (device as any).advertisingId,
        vendorId: (device as any).vendorId,
        limitedAdTracking: (device as any).limitedAdTracking,
        firstOpenAt: (device as any).firstOpenAt?.toISOString() || null,
        firstPurchaseAt: (device as any).firstPurchaseAt?.toISOString() || null,
        user: (device as any).userEmail || (device as any).userName || (device as any).userId || null,
        debugModeEnabled: (device as any).debugModeEnabled,
        debugModeExpiresAt: (device as any).debugModeExpiresAt,
        fingerprint: (device as any).fingerprint,
        batteryLevel: (device as any).batteryLevel,
        storageFree: (device as any).storageFree ? Number((device as any).storageFree) : null,
        memoryTotal: (device as any).memoryTotal ? Number((device as any).memoryTotal) : null,
        networkType: (device as any).networkType,
        screenWidth: (device as any).screenWidth,
        screenHeight: (device as any).screenHeight,
        screenDensity: (device as any).screenDensity,
        cpuArchitecture: (device as any).cpuArchitecture,
        tags: (device as any).tags,
        state: (device as any).state,
        lastSeenAt: device.lastSeenAt.toISOString(),
        createdAt: device.createdAt.toISOString(),
        stats: {
          logs: device._count.logs,
          crashes: device._count.crashes,
          apiTraces: device._count.apiTraces,
          sessions: device._count.sessions
        },
        metadata: device.metadata
      })),
      comparedAt: new Date().toISOString()
    }

    return NextResponse.json({ comparison })
  } catch (error) {
    console.error('Compare devices error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

