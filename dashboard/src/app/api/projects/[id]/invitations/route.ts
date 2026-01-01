import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { canPerformAction, checkSeatLimit, getInvitationExpiryDays } from '@/lib/team-access'
import { createInvitationNotification } from '@/lib/notifications'

/**
 * GET /api/projects/[id]/invitations
 * List all invitations for a project
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

    const { id: projectId } = await params

    // Check if user can view project (must be member)
    const canView = await canPerformAction(user.id, projectId, 'view')
    if (!canView) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get invitations
    const invitations = await prisma.projectInvitation.findMany({
      where: { projectId },
      include: {
        inviter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { invitedAt: 'desc' },
    })

    return NextResponse.json({
      invitations: invitations.map((inv) => ({
        id: inv.id,
        email: inv.email,
        role: inv.role,
        invitedBy: {
          id: inv.inviter.id,
          name: inv.inviter.name,
          email: inv.inviter.email,
        },
        invitedAt: inv.invitedAt.toISOString(),
        expiresAt: inv.expiresAt.toISOString(),
        status: inv.status,
        emailSent: inv.emailSent,
        emailSentAt: inv.emailSentAt?.toISOString() || null,
        emailDelivered: inv.emailDelivered,
        emailOpened: inv.emailOpened,
        emailClicked: inv.emailClicked,
        resendCount: inv.resendCount,
        lastResentAt: inv.lastResentAt?.toISOString() || null,
        lastResentBy: inv.lastResentBy || null,
      })),
    })
  } catch (error) {
    console.error('Get invitations error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/projects/[id]/invitations
 * Send invitation by email
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

    const { id: projectId } = await params
    const { email, role = 'member', message } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles = ['admin', 'member', 'viewer']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${validRoles.join(', ')}` },
        { status: 400 }
      )
    }

    // Check if user can invite members
    const canInvite = await canPerformAction(user.id, projectId, 'invite')
    if (!canInvite) {
      return NextResponse.json(
        { error: 'You do not have permission to invite members' },
        { status: 403 }
      )
    }

    // Check seat limits
    const seatCheck = await checkSeatLimit(projectId)
    if (!seatCheck.allowed) {
      return NextResponse.json(
        {
          error: `Seat limit reached. Current: ${seatCheck.current}, Limit: ${seatCheck.limit}`,
          current: seatCheck.current,
          limit: seatCheck.limit,
        },
        { status: 403 }
      )
    }

    // Check if user is already a member
    const existingMember = await prisma.projectMember.findFirst({
      where: {
        projectId,
        user: {
          email,
        },
      },
    })

    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a member of this project' },
        { status: 400 }
      )
    }

    // Check if there's a pending invitation for this email
    const existingInvitation = await prisma.projectInvitation.findFirst({
      where: {
        projectId,
        email,
        status: 'pending',
      },
    })

    if (existingInvitation) {
      // Check if expired
      if (existingInvitation.expiresAt < new Date()) {
        // Update to expired
        await prisma.projectInvitation.update({
          where: { id: existingInvitation.id },
          data: { status: 'expired' },
        })
      } else {
        return NextResponse.json(
          { error: 'A pending invitation already exists for this email' },
          { status: 400 }
        )
      }
    }

    // Get invitation expiry days
    const expiryDays = await getInvitationExpiryDays()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expiryDays)

    // Generate invitation token
    const token = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`

    // Create invitation
    let invitation: any
    try {
      invitation = await prisma.projectInvitation.create({
        data: {
          projectId,
          email,
          role,
          token,
          invitedBy: user.id,
          expiresAt,
          status: 'pending',
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })
    } catch (err: any) {
      console.error('Error creating invitation:', err)
      if (err.message?.includes('undefined') || err.message?.includes('create')) {
        return NextResponse.json(
          { error: 'Team invitations feature not available. Please ensure database migrations are complete.' },
          { status: 503 }
        )
      }
      throw err
    }

    // Check if user exists (by email)
    let invitedUser = null
    try {
      invitedUser = await prisma.user.findUnique({
        where: { email },
      })
    } catch (err) {
      console.warn('Could not check if user exists:', err)
    }

    // Create notification if user exists
    if (invitedUser) {
      try {
        await createInvitationNotification(
          invitedUser.id,
          projectId,
          invitation.id,
          invitation.project.name,
          user.name || user.email,
          role
        )
      } catch (notifErr) {
        console.warn('Could not create notification:', notifErr)
        // Don't fail the invitation if notification creation fails
      }
    }

    // TODO: Phase 3 - Send email if email_enabled is true

    return NextResponse.json({
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        token: invitation.token,
        expiresAt: invitation.expiresAt.toISOString(),
        status: invitation.status,
      },
    })
  } catch (error) {
    console.error('Create invitation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

