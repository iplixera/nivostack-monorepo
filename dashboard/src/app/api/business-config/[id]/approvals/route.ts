import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

/**
 * GET /api/business-config/[id]/approvals
 * Get approval requests for a config
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

    const approvals = await prisma.configApproval.findMany({
      where: { configId: id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ approvals })
  } catch (error) {
    console.error('Get approvals error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/business-config/[id]/approvals
 * Create an approval request
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
    const body = await request.json()
    const {
      changeType,
      changeData,
      requiredApprovals,
      approvers
    } = body

    if (!changeType || !changeData || !approvers || !Array.isArray(approvers)) {
      return NextResponse.json(
        { error: 'changeType, changeData, and approvers array are required' },
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

    // Check if approvers include the requester
    if (!approvers.includes(user.id)) {
      return NextResponse.json(
        { error: 'Approvers must include at least one valid user' },
        { status: 400 }
      )
    }

    const approval = await prisma.configApproval.create({
      data: {
        projectId: config.projectId,
        configId: id,
        changeType,
        changeData: changeData as any,
        requiredApprovals: requiredApprovals || 1,
        approvers: approvers as any,
        approvals: [],
        requestedBy: user.id
      }
    })

    // TODO: Send notification to approvers

    return NextResponse.json({ approval })
  } catch (error) {
    console.error('Create approval error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

