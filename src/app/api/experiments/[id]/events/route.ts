import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateApiKey } from '@/lib/auth'

/**
 * POST /api/experiments/[id]/events
 * Track experiment event (SDK endpoint)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const project = await validateApiKey(request)
    if (!project) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    const { id } = await params
    const { deviceId, userId, eventType, eventName, eventValue, metadata } = await request.json()

    if (!eventType || !eventName) {
      return NextResponse.json(
        { error: 'eventType and eventName are required' },
        { status: 400 }
      )
    }

    const experiment = await prisma.experiment.findUnique({
      where: { id }
    })

    if (!experiment) {
      return NextResponse.json({ error: 'Experiment not found' }, { status: 404 })
    }

    // Verify experiment belongs to project
    if (experiment.projectId !== project.id) {
      return NextResponse.json({ error: 'Experiment not found' }, { status: 404 })
    }

    // Get assignment to get variant index
    const assignment = await prisma.experimentAssignment.findUnique({
      where: {
        experimentId_deviceId_userId: {
          experimentId: id,
          deviceId: deviceId || null,
          userId: userId || null
        }
      }
    })

    if (!assignment) {
      return NextResponse.json({
        error: 'User/device not assigned to experiment. Call /assign first.'
      }, { status: 400 })
    }

    // Create event
    await prisma.experimentEvent.create({
      data: {
        experimentId: id,
        deviceId: deviceId || null,
        userId: userId || null,
        eventType,
        eventName,
        eventValue: eventValue || null,
        metadata: metadata || null
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Track experiment event error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

