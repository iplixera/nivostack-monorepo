import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

// DELETE - Delete a device and all its associated data
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Get device and verify ownership
    const device = await prisma.device.findUnique({
      where: { id },
      select: {
        id: true,
        deviceId: true,
        deviceCode: true,
        projectId: true,
        project: {
          select: { userId: true }
        }
      }
    })

    if (!device) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 })
    }

    // Verify user owns the project
    if (!device.project || device.project.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Delete all associated data in a transaction
    // Order matters due to foreign key constraints
    const result = await prisma.$transaction(async (tx) => {
      // First, get all session IDs for this device to delete their related data
      const sessions = await tx.session.findMany({
        where: { deviceId: id },
        select: { id: true }
      })
      const sessionIds = sessions.map(s => s.id)

      // Delete logs associated with the device (direct relation)
      const logsDeleted = await tx.log.deleteMany({
        where: { deviceId: id }
      })

      // Delete API traces associated with the device (direct relation)
      const tracesDeleted = await tx.apiTrace.deleteMany({
        where: { deviceId: id }
      })

      // Delete crashes associated with the device
      const crashesDeleted = await tx.crash.deleteMany({
        where: { deviceId: id }
      })

      // Delete sessions associated with the device
      const sessionsDeleted = await tx.session.deleteMany({
        where: { deviceId: id }
      })

      // Finally, delete the device itself
      await tx.device.delete({
        where: { id }
      })

      return {
        logsDeleted: logsDeleted.count,
        tracesDeleted: tracesDeleted.count,
        crashesDeleted: crashesDeleted.count,
        sessionsDeleted: sessionsDeleted.count,
        sessionIds
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Device and all associated data deleted successfully',
      deleted: {
        deviceId: device.deviceId,
        deviceCode: device.deviceCode,
        logs: result.logsDeleted,
        traces: result.tracesDeleted,
        crashes: result.crashesDeleted,
        sessions: result.sessionsDeleted
      }
    })
  } catch (error) {
    console.error('Delete device error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET - Get device details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Get device and verify ownership (only active devices)
    const device = await prisma.device.findFirst({
      where: { 
        id,
        status: 'active' // Only show active devices
      },
      include: {
        project: {
          select: { userId: true, name: true }
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

    if (!device) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 })
    }

    // Verify user owns the project
    if (!device.project || device.project.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Check if debug mode is expired
    const now = new Date()
    const isDebugExpired = device.debugModeExpiresAt && device.debugModeExpiresAt < now
    const effectiveDebugMode = device.debugModeEnabled && !isDebugExpired

    return NextResponse.json({
      device: {
        id: device.id,
        deviceId: device.deviceId,
        deviceCode: device.deviceCode,
        platform: device.platform,
        osVersion: device.osVersion,
        appVersion: device.appVersion,
        model: device.model,
        manufacturer: device.manufacturer,
        metadata: device.metadata,
        userId: device.userId,
        userEmail: device.userEmail,
        userName: device.userName,
        debugModeEnabled: effectiveDebugMode,
        debugModeEnabledAt: device.debugModeEnabledAt?.toISOString() || null,
        debugModeExpiresAt: device.debugModeExpiresAt?.toISOString() || null,
        lastSeenAt: device.lastSeenAt?.toISOString() || null,
        createdAt: device.createdAt?.toISOString() || null,
        // Firebase-like device properties (using type assertions as these may not exist in schema)
        deviceCategory: (device as any).deviceCategory,
        deviceBrand: (device as any).deviceBrand,
        locale: (device as any).locale,
        language: (device as any).language,
        timeZone: (device as any).timeZone,
        timeZoneOffset: (device as any).timeZoneOffset,
        advertisingId: (device as any).advertisingId,
        vendorId: (device as any).vendorId,
        limitedAdTracking: (device as any).limitedAdTracking,
        appId: (device as any).appId,
        appInstanceId: (device as any).appInstanceId,
        firstOpenAt: (device as any).firstOpenAt?.toISOString() || null,
        firstPurchaseAt: (device as any).firstPurchaseAt?.toISOString() || null,
        // Enhanced fingerprinting (using type assertions as these may not exist in schema)
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
        projectName: device.project?.name || null,
        stats: {
          logs: device._count.logs,
          crashes: device._count.crashes,
          apiTraces: device._count.apiTraces,
          sessions: device._count.sessions
        }
      }
    })
  } catch (error) {
    console.error('Get device error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
