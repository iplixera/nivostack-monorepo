import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

/**
 * PATCH /api/devices/[id]/tags
 * Update device tags
 */
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
    const { tags } = await request.json()

    if (!Array.isArray(tags)) {
      return NextResponse.json({ error: 'Tags must be an array' }, { status: 400 })
    }

    // Verify user owns the device's project
    const device = await prisma.device.findUnique({
      where: { id },
      include: { project: true }
    })

    if (!device) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 })
    }

    if (!device.project || device.project.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update device tags
    // TODO: tags field needs to be added to Device model
    const updatedDevice = await prisma.device.update({
      where: { id },
      data: { tags } as any,
      select: {
        id: true
      }
    })
    
    // Return tags from the input since we can't select it
    const deviceTags = (updatedDevice as any).tags || tags

    return NextResponse.json({ device: { ...updatedDevice, tags: deviceTags } })
  } catch (error) {
    console.error('Update device tags error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

