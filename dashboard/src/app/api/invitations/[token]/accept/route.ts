import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { checkSeatLimit } from '@/lib/team-access'

/**
 * POST /api/invitations/[token]/accept
 * Accept an invitation (requires authentication)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to accept the invitation.' },
        { status: 401 }
      )
    }

    const { token } = await params

    // Get invitation
    const invitation = await prisma.projectInvitation.findUnique({
      where: { token },
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

    // Check if expired
    if (invitation.expiresAt < new Date() && invitation.status === 'pending') {
      await prisma.projectInvitation.update({
        where: { id: invitation.id },
        data: { status: 'expired' },
      })
      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 410 }
      )
    }

    // Check status
    if (invitation.status !== 'pending') {
      return NextResponse.json(
        { error: `Invitation is ${invitation.status}` },
        { status: 400 }
      )
    }

    // If invitation has email, verify it matches user's email
    if (invitation.email && invitation.email !== user.email) {
      return NextResponse.json(
        { error: 'This invitation was sent to a different email address' },
        { status: 403 }
      )
    }

    // Check if user is already a member
    const existingMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: invitation.projectId,
          userId: user.id,
        },
      },
    })

    if (existingMember) {
      // Mark invitation as accepted anyway
      await prisma.projectInvitation.update({
        where: { id: invitation.id },
        data: {
          status: 'accepted',
          acceptedAt: new Date(),
          acceptedBy: user.id,
        },
      })

      return NextResponse.json({
        success: true,
        message: 'You are already a member of this project',
        project: {
          id: invitation.project.id,
          name: invitation.project.name,
        },
      })
    }

    // Check seat limits
    const seatCheck = await checkSeatLimit(invitation.projectId)
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

    // Create ProjectMember
    await prisma.projectMember.create({
      data: {
        projectId: invitation.projectId,
        userId: user.id,
        role: invitation.role,
        invitedBy: invitation.invitedBy,
        invitedAt: invitation.invitedAt,
        joinedAt: new Date(),
      },
    })

    // Mark invitation as accepted
    await prisma.projectInvitation.update({
      where: { id: invitation.id },
      data: {
        status: 'accepted',
        acceptedAt: new Date(),
        acceptedBy: user.id,
      },
    })

    // Delete notification for this invitation
    // Find notifications with matching invitationId in data
    const notifications = await prisma.userNotification.findMany({
      where: {
        userId: user.id,
        type: 'invitation',
      },
    })

    // Filter and delete notifications matching this invitation
    for (const notif of notifications) {
      if (notif.data && typeof notif.data === 'object' && 'invitationId' in notif.data) {
        if ((notif.data as any).invitationId === invitation.id) {
          await prisma.userNotification.delete({
            where: { id: notif.id },
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Invitation accepted successfully',
      project: {
        id: invitation.project.id,
        name: invitation.project.name,
      },
    })
  } catch (error) {
    console.error('Accept invitation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

