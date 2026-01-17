import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { canPerformAction, getInvitationExpiryDays } from '@/lib/team-access'
import { createInvitationNotification } from '@/lib/notifications'

/**
 * POST /api/projects/[id]/invitations/[invitationId]/resend
 * Resend an invitation
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; invitationId: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: projectId, invitationId } = await params
    const { expiresInDays } = await request.json()

    // Check if user can invite members
    const canInvite = await canPerformAction(user.id, projectId, 'invite')
    if (!canInvite) {
      return NextResponse.json(
        { error: 'You do not have permission to resend invitations' },
        { status: 403 }
      )
    }

    // Get invitation
    const invitation = await prisma.projectInvitation.findUnique({
      where: { id: invitationId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
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

    if (invitation.status !== 'pending') {
      return NextResponse.json(
        { error: 'Can only resend pending invitations' },
        { status: 400 }
      )
    }

    // Update expiry if provided
    let expiresAt = invitation.expiresAt
    if (expiresInDays) {
      expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + expiresInDays)
    } else {
      // Extend by default expiry days
      const expiryDays = await getInvitationExpiryDays()
      expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + expiryDays)
    }

    // Update invitation
    const updatedInvitation = await prisma.projectInvitation.update({
      where: { id: invitationId },
      data: {
        expiresAt,
        resendCount: invitation.resendCount + 1,
        lastResentAt: new Date(),
        lastResentBy: user.id,
        emailSent: false, // Reset email tracking
        emailSentAt: null,
        emailDelivered: false,
        emailOpened: false,
        emailClicked: false,
      },
      include: {
        inviter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // Create notification if user exists
    if (invitation.email) {
      const invitedUser = await prisma.user.findUnique({
        where: { email: invitation.email },
      })

      if (invitedUser) {
        await createInvitationNotification(
          invitedUser.id,
          projectId,
          invitation.id,
          invitation.project.name,
          updatedInvitation.inviter.name || updatedInvitation.inviter.email,
          invitation.role
        )
      }
    }

    // TODO: Phase 3 - Send email if email_enabled is true

    return NextResponse.json({
      invitation: {
        id: updatedInvitation.id,
        email: updatedInvitation.email,
        role: updatedInvitation.role,
        status: updatedInvitation.status,
        resendCount: updatedInvitation.resendCount,
        lastResentAt: updatedInvitation.lastResentAt?.toISOString() || null,
        lastResentBy: {
          id: updatedInvitation.inviter.id,
          name: updatedInvitation.inviter.name,
          email: updatedInvitation.inviter.email,
        },
        expiresAt: updatedInvitation.expiresAt.toISOString(),
        emailSent: updatedInvitation.emailSent,
        emailSentAt: updatedInvitation.emailSentAt?.toISOString() || null,
        emailDelivered: updatedInvitation.emailDelivered,
        emailOpened: updatedInvitation.emailOpened,
        emailClicked: updatedInvitation.emailClicked,
      },
    })
  } catch (error) {
    console.error('Resend invitation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

