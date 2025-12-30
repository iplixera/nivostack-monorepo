import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

/**
 * PATCH /api/business-config/[id]/approvals/[approvalId]
 * Approve or reject an approval request
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; approvalId: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, approvalId } = await params
    const body = await request.json()
    const { action, comment } = body // action: "approve" | "reject"

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'action must be "approve" or "reject"' },
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

    const approval = await prisma.configApproval.findUnique({
      where: { id: approvalId }
    })

    if (!approval) {
      return NextResponse.json({ error: 'Approval not found' }, { status: 404 })
    }

    // Verify user is an approver
    const approvers = approval.approvers as string[]
    if (!approvers.includes(user.id)) {
      return NextResponse.json(
        { error: 'You are not authorized to approve this request' },
        { status: 403 }
      )
    }

    // Check if already decided
    if (approval.status !== 'pending') {
      return NextResponse.json(
        { error: 'Approval request has already been decided' },
        { status: 400 }
      )
    }

    // Check if user already approved
    const approvals = approval.approvals as Array<{
      userId: string
      status: string
      comment?: string
      timestamp: string
    }>
    const existingApproval = approvals.find(a => a.userId === user.id)
    if (existingApproval) {
      return NextResponse.json(
        { error: 'You have already provided your approval' },
        { status: 400 }
      )
    }

    // Add approval/rejection
    const newApproval = {
      userId: user.id,
      status: action,
      comment: comment || null,
      timestamp: new Date().toISOString()
    }

    const updatedApprovals = [...approvals, newApproval]
    const currentApprovals = updatedApprovals.filter(a => a.status === 'approve').length

    // Determine final status
    let finalStatus = approval.status
    if (action === 'reject') {
      finalStatus = 'rejected'
    } else if (currentApprovals >= approval.requiredApprovals) {
      finalStatus = 'approved'
    }

    // Update approval
    const updated = await prisma.configApproval.update({
      where: { id: approvalId },
      data: {
        status: finalStatus,
        currentApprovals,
        approvals: updatedApprovals as any,
        decidedBy: finalStatus !== 'pending' ? user.id : null,
        decidedAt: finalStatus !== 'pending' ? new Date() : null,
        decisionComment: finalStatus !== 'pending' ? comment || null : null
      }
    })

    // If approved, apply the change
    if (finalStatus === 'approved') {
      await applyApprovedChange(config.id, approval.changeData, approval.changeType)
    }

    return NextResponse.json({ approval: updated })
  } catch (error) {
    console.error('Update approval error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Apply approved change to config
 */
async function applyApprovedChange(
  configId: string,
  changeData: any,
  changeType: string
): Promise<void> {
  const config = await prisma.businessConfig.findUnique({
    where: { id: configId }
  })

  if (!config) {
    throw new Error('Config not found')
  }

  switch (changeType) {
    case 'update':
      await prisma.businessConfig.update({
        where: { id: configId },
        data: changeData
      })
      break
    case 'deploy':
      // Trigger deployment
      // This would call the deployment endpoint logic
      break
    default:
      console.warn(`Unknown change type: ${changeType}`)
  }
}

