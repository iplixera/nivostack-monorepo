import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

/**
 * GET /api/business-config/[id]/deployments
 * Get deployment history for a config
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

    // TODO: ConfigDeployment model needs to be added to Prisma schema
    return NextResponse.json({ deployments: [] })
    
    /* COMMENTED OUT UNTIL CONFIGDEPLOYMENT MODEL IS ADDED
    const deployments = await prisma.configDeployment.findMany({
      where: { configId: id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ deployments })
    */
  } catch (error) {
    console.error('Get deployments error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

