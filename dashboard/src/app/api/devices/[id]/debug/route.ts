import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

// Toggle debug mode for a device
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { enabled, expiresIn } = await request.json()

    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'enabled (boolean) is required' },
        { status: 400 }
      )
    }

    // Get device and verify ownership
    const device = await prisma.device.findUnique({
      where: { id },
      select: {
        id: true,
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

    // Calculate expiry time if enabled and expiresIn provided
    let expiresAt: Date | null = null
    if (enabled && expiresIn) {
      const now = new Date()
      switch (expiresIn) {
        case '1h':
          expiresAt = new Date(now.getTime() + 1 * 60 * 60 * 1000)
          break
        case '4h':
          expiresAt = new Date(now.getTime() + 4 * 60 * 60 * 1000)
          break
        case '24h':
          expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000)
          break
        // null or 'never' = no expiry
      }
    }

    // Update debug mode in database
    const updatedDevice = await prisma.device.update({
      where: { id },
      data: {
        debugModeEnabled: enabled,
        debugModeEnabledAt: enabled ? new Date() : null,
        debugModeExpiresAt: enabled ? expiresAt : null,
        debugModeEnabledBy: enabled ? user.id : null
      },
      select: {
        id: true,
        deviceCode: true,
        debugModeEnabled: true,
        debugModeEnabledAt: true,
        debugModeExpiresAt: true
      }
    })

    return NextResponse.json({
      device: {
        id: updatedDevice.id,
        deviceCode: updatedDevice.deviceCode,
        debugModeEnabled: updatedDevice.debugModeEnabled,
        debugModeEnabledAt: updatedDevice.debugModeEnabledAt?.toISOString() || null,
        debugModeExpiresAt: updatedDevice.debugModeExpiresAt?.toISOString() || null
      }
    })
  } catch (error) {
    console.error('Toggle debug mode error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Get debug mode status for a device
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

    // Get device and verify ownership
    const device = await prisma.device.findUnique({
      where: { id },
      select: {
        id: true,
        projectId: true,
        debugModeEnabled: true,
        debugModeEnabledAt: true,
        debugModeExpiresAt: true,
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

    // Check if debug mode is expired
    const now = new Date()
    const isExpired = device.debugModeExpiresAt ? device.debugModeExpiresAt < now : false

    return NextResponse.json({
      debugModeEnabled: device.debugModeEnabled && !isExpired,
      debugModeEnabledAt: device.debugModeEnabledAt?.toISOString() || null,
      debugModeExpiresAt: device.debugModeExpiresAt?.toISOString() || null,
      isExpired
    })
  } catch (error) {
    console.error('Get debug mode error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
