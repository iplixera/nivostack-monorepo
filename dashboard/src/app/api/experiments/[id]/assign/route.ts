import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateApiKey } from '@/lib/auth'
import { assignToVariant, AssignmentContext } from '@/lib/business-config/experiments'

/**
 * POST /api/experiments/[id]/assign
 * Assign user/device to experiment variant (SDK endpoint)
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
    const { deviceId, userId, context } = await request.json()

    const experiment = await prisma.experiment.findUnique({
      where: { id },
      include: {
        config: true
      }
    })

    if (!experiment) {
      return NextResponse.json({ error: 'Experiment not found' }, { status: 404 })
    }

    // Verify experiment belongs to project
    if (experiment.projectId !== project.id) {
      return NextResponse.json({ error: 'Experiment not found' }, { status: 404 })
    }

    // Check if experiment is running
    if (experiment.status !== 'running') {
      return NextResponse.json({
        error: 'Experiment is not running',
        status: experiment.status
      }, { status: 400 })
    }

    // Check date range
    const now = new Date()
    if (experiment.startDate && now < experiment.startDate) {
      return NextResponse.json({
        error: 'Experiment has not started yet'
      }, { status: 400 })
    }
    if (experiment.endDate && now > experiment.endDate) {
      return NextResponse.json({
        error: 'Experiment has ended'
      }, { status: 400 })
    }

    // Check for existing assignment
    const existingAssignment = await prisma.experimentAssignment.findUnique({
      where: {
        experimentId_deviceId_userId: {
          experimentId: id,
          deviceId: deviceId || null,
          userId: userId || null
        }
      }
    })

    if (existingAssignment) {
      // Return existing assignment
      return NextResponse.json({
        variantIndex: existingAssignment.variantIndex,
        variantName: existingAssignment.variantName,
        value: (experiment.variants as any[])[existingAssignment.variantIndex]?.value
      })
    }

    // Assign to variant
    const assignment = assignToVariant(
      {
        id: experiment.id,
        variants: experiment.variants as any,
        assignmentType: experiment.assignmentType as any,
        targetingRules: experiment.targetingRules as any
      },
      { deviceId, userId, ...(context || {}) }
    )

    if (!assignment) {
      return NextResponse.json({ error: 'Failed to assign variant' }, { status: 500 })
    }

    // Store assignment
    await prisma.experimentAssignment.create({
      data: {
        experimentId: id,
        deviceId: deviceId || null,
        userId: userId || null,
        variantIndex: assignment.variantIndex,
        variantName: assignment.variant.name
      }
    })

    return NextResponse.json({
      variantIndex: assignment.variantIndex,
      variantName: assignment.variant.name,
      value: assignment.variant.value
    })
  } catch (error) {
    console.error('Assign experiment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

