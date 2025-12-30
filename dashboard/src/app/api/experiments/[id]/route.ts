import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

/**
 * GET /api/experiments/[id]
 * Get experiment details
 */
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

    // TODO: Experiment model needs to be added to Prisma schema
    return NextResponse.json({ error: 'Experiment model not yet implemented' }, { status: 500 })
    
    /* COMMENTED OUT UNTIL EXPERIMENT MODEL IS ADDED
    const experiment = await (prisma as any).experiment.findUnique({
      where: { id },
      include: {
        config: {
          select: {
            key: true,
            label: true,
            valueType: true
          }
        },
        _count: {
          select: {
            assignments: true,
            events: true
          }
        }
      }
    })

    if (!experiment) {
      return NextResponse.json({ error: 'Experiment not found' }, { status: 404 })
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { id: experiment.projectId, userId: user.id }
    })

    if (!project) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json({ experiment })
    */
  } catch (error) {
    console.error('Get experiment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/experiments/[id]
 * Update experiment
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
    const body = await request.json()

    // TODO: Experiment model needs to be added to Prisma schema
    return NextResponse.json({ error: 'Experiment model not yet implemented' }, { status: 500 })
    
    /* COMMENTED OUT UNTIL EXPERIMENT MODEL IS ADDED
    const experiment = await (prisma as any).experiment.findUnique({
      where: { id },
      include: { project: true }
    })

    if (!experiment) {
      return NextResponse.json({ error: 'Experiment not found' }, { status: 404 })
    }

    // Verify project ownership
    if (experiment.project.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const updateData: any = {}
    if (body.name !== undefined) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description
    if (body.status !== undefined) updateData.status = body.status
    if (body.variants !== undefined) {
      // Validate variants
      const totalWeight = body.variants.reduce((sum: number, v: any) => sum + (v.weight || 0), 0)
      if (Math.abs(totalWeight - 100) > 0.01) {
        return NextResponse.json(
          { error: 'Variant weights must sum to 100' },
          { status: 400 }
        )
      }
      updateData.variants = body.variants
    }
    if (body.targetingRules !== undefined) updateData.targetingRules = body.targetingRules
    if (body.startDate !== undefined) updateData.startDate = body.startDate ? new Date(body.startDate) : null
    if (body.endDate !== undefined) updateData.endDate = body.endDate ? new Date(body.endDate) : null

    // Auto-set startDate when starting experiment
    if (body.status === 'running' && !experiment.startDate) {
      updateData.startDate = new Date()
    }

    const updated = await (prisma as any).experiment.update({
      where: { id },
      data: updateData,
      include: {
        config: {
          select: {
            key: true,
            label: true
          }
        }
      }
    })

    return NextResponse.json({ experiment: updated })
    */
  } catch (error) {
    console.error('Update experiment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/experiments/[id]
 * Delete experiment
 */
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

    // TODO: Experiment model needs to be added to Prisma schema
    return NextResponse.json({ error: 'Experiment model not yet implemented' }, { status: 500 })
    
    /* COMMENTED OUT UNTIL EXPERIMENT MODEL IS ADDED
    const experiment = await (prisma as any).experiment.findUnique({
      where: { id },
      include: { project: true }
    })

    if (!experiment) {
      return NextResponse.json({ error: 'Experiment not found' }, { status: 404 })
    }

    // Verify project ownership
    if (experiment.project.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await (prisma as any).experiment.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
    */
  } catch (error) {
    console.error('Delete experiment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

