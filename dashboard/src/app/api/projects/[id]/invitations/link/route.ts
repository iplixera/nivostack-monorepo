import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { canPerformAction, checkSeatLimit, getInvitationExpiryDays } from '@/lib/team-access'

/**
 * POST /api/projects/[id]/invitations/link
 * Generate invitation link (without email)
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
    const { role = 'member', expiresInDays } = await request.json()

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

    // Get invitation expiry days
    const expiryDays = expiresInDays || (await getInvitationExpiryDays())
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expiryDays)

    // Generate invitation token
    const token = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`

    // Create invitation (no email, link-based)
    const invitation = await prisma.projectInvitation.create({
      data: {
        projectId,
        email: '', // Empty for link-based invitations
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

    // Generate invitation link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const link = `${baseUrl}/invite/${token}`

    return NextResponse.json({
      link,
      token: invitation.token,
      expiresAt: invitation.expiresAt.toISOString(),
      role: invitation.role,
    })
  } catch (error) {
    console.error('Generate invitation link error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

