import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ deviceId: string }> }
) {
  try {
    // Temporarily disable auth for development
    // const authHeader = request.headers.get('authorization')
    // if (!authHeader?.startsWith('Bearer ')) {
    //   return NextResponse.json(
    //     { error: 'Unauthorized' },
    //     { status: 401 }
    //   )
    // }

    // const token = authHeader.substring(7)
    // const payload = await verifyToken(token)
    
    // if (!payload?.userId) {
    //   return NextResponse.json(
    //     { error: 'Invalid token' },
    //     { status: 401 }
    //   )
    // }

    const { deviceId } = await params
    const body = await request.json()
    const { enabled, durationHours = 24 } = body

    console.log('[Debug Toggle] deviceId:', deviceId, 'enabled:', enabled)

    // Find the device
    const device = await prisma.device.findUnique({
      where: { id: deviceId },
      include: { project: true }
    })

    if (!device) {
      console.error('[Debug Toggle] Device not found:', deviceId)
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      )
    }

    // Temporarily skip access check for development
    // const hasAccess = await prisma.projectMember.findFirst({
    //   where: {
    //     projectId: device.projectId!,
    //     userId: payload.userId,
    //     role: { in: ['owner', 'admin', 'developer'] }
    //   }
    // })

    // if (!hasAccess && device.project?.userId !== payload.userId) {
    //   return NextResponse.json(
    //     { error: 'Forbidden: You do not have access to this project' },
    //     { status: 403 }
    //   )
    // }

    // Update debug mode
    const now = new Date()
    const expiresAt = new Date(now.getTime() + durationHours * 60 * 60 * 1000)

    const updatedDevice = await prisma.device.update({
      where: { id: deviceId },
      data: {
        debugModeEnabled: enabled,
        debugModeEnabledAt: enabled ? now : null,
        debugModeExpiresAt: enabled ? expiresAt : null,
        debugModeEnabledBy: enabled ? 'dev-user' : null // Temporary for development
      }
    })

    console.log('[Debug Toggle] Success:', updatedDevice.deviceId, 'debug:', updatedDevice.debugModeEnabled)

    return NextResponse.json({
      success: true,
      device: {
        id: updatedDevice.id,
        deviceId: updatedDevice.deviceId,
        debugModeEnabled: updatedDevice.debugModeEnabled,
        debugModeExpiresAt: updatedDevice.debugModeExpiresAt
      }
    })
  } catch (error) {
    console.error('Error updating debug mode:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { deviceId: string } }
) {
  try {
    const { deviceId } = params

    const device = await prisma.device.findUnique({
      where: { id: deviceId },
      select: {
        id: true,
        deviceId: true,
        debugModeEnabled: true,
        debugModeEnabledAt: true,
        debugModeExpiresAt: true,
        debugModeEnabledBy: true
      }
    })

    if (!device) {
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ device })
  } catch (error) {
    console.error('Error fetching debug mode:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

