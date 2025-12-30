import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { calculateNextDeploymentStep, DeploymentConfig } from '@/lib/business-config/deployment'

/**
 * POST /api/business-config/[id]/deploy
 * Start a deployment with a specific strategy
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { strategy, config: deploymentConfig } = await request.json()

    if (!strategy || !['immediate', 'canary', 'linear', 'exponential'].includes(strategy)) {
      return NextResponse.json(
        { error: 'Invalid strategy. Must be: immediate, canary, linear, or exponential' },
        { status: 400 }
      )
    }

    const config = await prisma.businessConfig.findUnique({
      where: { id },
      include: { project: true }
    })

    if (!config) {
      return NextResponse.json({ error: 'Config not found' }, { status: 404 })
    }

    // Verify project ownership
    if (config.project.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Check for existing active deployment
    const activeDeployment = await prisma.configDeployment.findFirst({
      where: {
        configId: id,
        status: { in: ['pending', 'running'] }
      }
    })

    if (activeDeployment) {
      return NextResponse.json(
        { error: 'An active deployment already exists for this config' },
        { status: 400 }
      )
    }

    // Create deployment
    const deployment = await prisma.configDeployment.create({
      data: {
        configId: id,
        projectId: config.projectId,
        strategy,
        status: strategy === 'immediate' ? 'completed' : 'running',
        currentPercentage: strategy === 'immediate' ? 100 : 0,
        targetPercentage: 100,
        configData: deploymentConfig || {}
      }
    })

    // If immediate, update config rollout percentage
    if (strategy === 'immediate') {
      await prisma.businessConfig.update({
        where: { id },
        data: { rolloutPercentage: 100 }
      })
    } else {
      // Calculate first step
      const nextStep = calculateNextDeploymentStep(
        { strategy, ...(deploymentConfig || {}) } as DeploymentConfig,
        0,
        new Date()
      )

      // Update deployment with first step
      await prisma.configDeployment.update({
        where: { id: deployment.id },
        data: {
          currentPercentage: nextStep.currentPercentage,
          endDate: nextStep.nextUpdateTime
        }
      })

      // Update config rollout percentage
      await prisma.businessConfig.update({
        where: { id },
        data: { rolloutPercentage: nextStep.currentPercentage }
      })
    }

    return NextResponse.json({ deployment })
  } catch (error) {
    console.error('Deploy config error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/business-config/[id]/deploy/rollback
 * Rollback a deployment
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { reason } = await request.json()

    const config = await prisma.businessConfig.findUnique({
      where: { id },
      include: { project: true }
    })

    if (!config) {
      return NextResponse.json({ error: 'Config not found' }, { status: 404 })
    }

    // Verify project ownership
    if (config.project.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Find active deployment
    const deployment = await prisma.configDeployment.findFirst({
      where: {
        configId: id,
        status: { in: ['pending', 'running'] }
      },
      orderBy: { createdAt: 'desc' }
    })

    if (!deployment) {
      return NextResponse.json(
        { error: 'No active deployment found' },
        { status: 404 }
      )
    }

    // Rollback: set rollout percentage to 0
    await prisma.businessConfig.update({
      where: { id },
      data: { rolloutPercentage: 0 }
    })

    // Update deployment status
    await prisma.configDeployment.update({
      where: { id: deployment.id },
      data: {
        status: 'rolled_back',
        rolledBackAt: new Date(),
        rolledBackBy: user.id,
        rollbackReason: reason || null
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Rollback deployment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

