import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/invitations/[token]
 * Get invitation details (public endpoint, no auth required)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    const invitation = await prisma.projectInvitation.findUnique({
      where: { token },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        inviter: {
          select: {
            name: true,
            email: true,
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

    // Check if cancelled
    if (invitation.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Invitation has been cancelled' },
        { status: 410 }
      )
    }

    // Check if already accepted
    if (invitation.status === 'accepted') {
      return NextResponse.json(
        { error: 'Invitation has already been accepted' },
        { status: 410 }
      )
    }

    return NextResponse.json({
      invitation: {
        id: invitation.id,
        project: {
          id: invitation.project.id,
          name: invitation.project.name,
        },
        role: invitation.role,
        email: invitation.email,
        invitedBy: {
          name: invitation.inviter.name,
          email: invitation.inviter.email,
        },
        expiresAt: invitation.expiresAt.toISOString(),
        status: invitation.status,
      },
    })
  } catch (error) {
    console.error('Get invitation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

