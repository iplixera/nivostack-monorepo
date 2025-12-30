import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateNextDeploymentStep, DeploymentConfig, shouldUpdateDeployment } from '@/lib/business-config/deployment'

/**
 * POST /api/cron/update-deployments
 * Cron job to update running deployments
 * Should be called every 5-10 minutes
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: ConfigDeployment model needs to be added to Prisma schema
    return NextResponse.json({ success: true, updated: 0, completed: 0, total: 0 })
    
    /* COMMENTED OUT UNTIL CONFIGDEPLOYMENT MODEL IS ADDED
    // Get all running deployments
    const deployments = await prisma.configDeployment.findMany({
      where: {
        status: 'running'
      },
      include: {
        config: true
      }
    })

    const updated: string[] = []
    const completed: string[] = []

    for (const deployment of deployments) {
      try {
        const deploymentConfig = deployment.configData as DeploymentConfig
        const deploymentState = {
          currentPercentage: deployment.currentPercentage,
          targetPercentage: deployment.targetPercentage,
          nextUpdateTime: deployment.endDate,
          completed: deployment.status === 'completed'
        }

        // Check if should update
        if (shouldUpdateDeployment(deploymentState)) {
          const nextStep = calculateNextDeploymentStep(
            {
              strategy: deployment.strategy as any,
              ...deploymentConfig
            },
            deployment.currentPercentage,
            deployment.startDate
          )

          // Update deployment
          await prisma.configDeployment.update({
            where: { id: deployment.id },
            data: {
              currentPercentage: nextStep.currentPercentage,
              endDate: nextStep.nextUpdateTime,
              status: nextStep.completed ? 'completed' : 'running',
              completedAt: nextStep.completed ? new Date() : null
            }
          })

          // Update config rollout percentage
          await prisma.businessConfig.update({
            where: { id: deployment.configId },
            data: { rolloutPercentage: nextStep.currentPercentage }
          })

          updated.push(deployment.id)

          if (nextStep.completed) {
            completed.push(deployment.id)
          }
        }
      } catch (error) {
        console.error(`Error updating deployment ${deployment.id}:`, error)
        // Mark as failed
        await prisma.configDeployment.update({
          where: { id: deployment.id },
          data: { status: 'failed' }
        })
      }
    }

    return NextResponse.json({
      success: true,
      updated: updated.length,
      completed: completed.length,
      total: deployments.length
    })
    */
  } catch (error) {
    console.error('Update deployments cron error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

