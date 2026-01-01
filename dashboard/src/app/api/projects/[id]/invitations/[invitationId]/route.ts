import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { canPerformAction, getInvitationExpiryDays } from '@/lib/team-access'

/**
 * DELETE /api/projects/[id]/invitations/[invitationId]
 * Cancel an invitation
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; invitationId: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: projectId, invitationId } = await params

    // Check if user can invite members (required to cancel)
    const canInvite = await canPerformAction(user.id, projectId, 'invite')
    if (!canInvite) {
      return NextResponse.json(
        { error: 'You do not have permission to cancel invitations' },
        { status: 403 }
      )
    }

    // Get invitation
    const invitation = await prisma.projectInvitation.findUnique({
      where: { id: invitationId },
    })

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      )
    }

    if (invitation.projectId !== projectId) {
      return NextResponse.json(
        { error: 'Invitation does not belong to this project' },
        { status: 400 }
      )
    }

    // Cancel invitation
    await prisma.projectInvitation.update({
      where: { id: invitationId },
      data: { status: 'cancelled' },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Cancel invitation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

