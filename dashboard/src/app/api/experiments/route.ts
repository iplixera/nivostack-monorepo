import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

/**
 * GET /api/experiments
 * List experiments for a project
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const status = searchParams.get('status')

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId is required' },
        { status: 400 }
      )
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: user.id }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const where: any = { projectId }
    if (status) {
      where.status = status
    }

    // TODO: Experiment model needs to be added to Prisma schema
    return NextResponse.json({ experiments: [] })
    
    /* COMMENTED OUT UNTIL EXPERIMENT MODEL IS ADDED
    const experiments = await (prisma as any).experiment.findMany({
      where,
      include: {
        config: {
          select: {
            key: true,
            label: true
          }
        },
        _count: {
          select: {
            assignments: true,
            events: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ experiments })
    */
  } catch (error) {
    console.error('Get experiments error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/experiments
 * Create a new experiment
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      projectId,
      configId,
      name,
      description,
      variants,
      targetingRules,
      assignmentType
    } = body

    if (!projectId || !configId || !name || !variants || !Array.isArray(variants)) {
      return NextResponse.json(
        { error: 'projectId, configId, name, and variants array are required' },
        { status: 400 }
      )
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: user.id }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Verify config exists and belongs to project
    const config = await prisma.businessConfig.findFirst({
      where: { id: configId, projectId }
    })

    if (!config) {
      return NextResponse.json({ error: 'Config not found' }, { status: 404 })
    }

    // Validate variants
    const totalWeight = variants.reduce((sum: number, v: any) => sum + (v.weight || 0), 0)
    if (Math.abs(totalWeight - 100) > 0.01) {
      return NextResponse.json(
        { error: 'Variant weights must sum to 100' },
        { status: 400 }
      )
    }

    // TODO: Experiment model needs to be added to Prisma schema
    return NextResponse.json({ error: 'Experiment model not yet implemented' }, { status: 500 })
    
    /* COMMENTED OUT UNTIL EXPERIMENT MODEL IS ADDED
    const experiment = await (prisma as any).experiment.create({
      data: {
        projectId,
        configId,
        name,
        description: description || null,
        variants: variants as any,
        targetingRules: targetingRules || null,
        assignmentType: assignmentType || 'random',
        status: 'draft',
        createdBy: user.id
      },
      include: {
        config: {
          select: {
            key: true,
            label: true
          }
        }
      }
    })

    return NextResponse.json({ experiment })
    */
  } catch (error) {
    console.error('Create experiment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

