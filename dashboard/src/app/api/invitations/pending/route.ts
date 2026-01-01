import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

/**
 * GET /api/invitations/pending
 * Get all pending invitations for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find all pending invitations for this user's email
    const pendingInvitations = await prisma.projectInvitation.findMany({
      where: {
        email: {
          equals: user.email,
          mode: 'insensitive',
        },
        status: 'pending',
        expiresAt: {
          gt: new Date(), // Not expired
        },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        inviter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { invitedAt: 'desc' },
    })

    return NextResponse.json({
      invitations: pendingInvitations,
    })
  } catch (error) {
    console.error('Get pending invitations error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

