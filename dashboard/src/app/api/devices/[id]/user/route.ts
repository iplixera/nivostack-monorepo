import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateApiKey } from '@/lib/auth'

// SDK endpoint: Associate user with device
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const project = await validateApiKey(request)
    if (!project) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    const { id } = await params
    const { userId, email, name } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // Get device and verify it belongs to the project
    const device = await prisma.device.findUnique({
      where: { id }
    })

    if (!device) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 })
    }

    if (device.projectId !== project.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Verify device is registered (has deviceId set)
    if (!device.deviceId) {
      return NextResponse.json({ 
        error: 'Device not registered. Please register the device first.' 
      }, { status: 400 })
    }

    // Update device with user info
    const updatedDevice = await prisma.device.update({
      where: { id },
      data: {
        userId,
        userEmail: email || null,
        userName: name || null,
        lastSeenAt: new Date()
      }
    })

    return NextResponse.json({
      device: {
        id: updatedDevice.id,
        userId: updatedDevice.userId,
        userEmail: updatedDevice.userEmail,
        userName: updatedDevice.userName
      }
    })
  } catch (error) {
    console.error('Set user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// SDK endpoint: Clear user from device (on logout)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const project = await validateApiKey(request)
    if (!project) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    const { id } = await params

    // Get device and verify it belongs to the project
    const device = await prisma.device.findUnique({
      where: { id }
    })

    if (!device) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 })
    }

    if (device.projectId !== project.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Clear user info from device
    await prisma.device.update({
      where: { id },
      data: {
        userId: null,
        userEmail: null,
        userName: null,
        lastSeenAt: new Date()
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Clear user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
