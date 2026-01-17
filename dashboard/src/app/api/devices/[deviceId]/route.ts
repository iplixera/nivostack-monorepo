import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ deviceId: string }> }
) {
  try {
    const { deviceId } = await params

    const device = await prisma.device.findUnique({
      where: { id: deviceId },
      include: {
        project: { select: { id: true, name: true } },
      }
    })

    if (!device) {
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      )
    }

    // Get counts for tabs
    const [sessionCount, logCount, crashCount, traceCount] = await Promise.all([
      prisma.session.count({ where: { deviceId } }),
      prisma.log.count({ where: { deviceId } }),
      prisma.crash.count({ where: { deviceId } }),
      prisma.apiTrace.count({ where: { deviceId } }),
    ])

    return NextResponse.json({
      device: {
        ...device,
        metadata: device.metadata || {},
      },
      counts: {
        sessions: sessionCount,
        logs: logCount,
        crashes: crashCount,
        traces: traceCount,
      }
    })
  } catch (error) {
    console.error('Error fetching device:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ deviceId: string }> }
) {
  try {
    const { deviceId } = await params
    
    // Soft delete - mark as deleted
    await prisma.device.update({
      where: { id: deviceId },
      data: {
        status: 'deleted',
        deletedAt: new Date()
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting device:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


