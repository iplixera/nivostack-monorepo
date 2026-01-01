import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { canPerformAction, getProjectMembers, checkSeatLimit } from '@/lib/team-access'

/**
 * GET /api/projects/[id]/members
 * List all team members of a project
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

    // Get members
    const members = await getProjectMembers(projectId)

    // Get seat limit info
    const seatCheck = await checkSeatLimit(projectId)

    // Get inviter names for members
    const membersWithInviter = await Promise.all(
      members.map(async (member) => {
        let inviter = null
        if (member.invitedBy) {
          const inviterUser = await prisma.user.findUnique({
            where: { id: member.invitedBy },
            select: {
              id: true,
              name: true,
              email: true,
            },
          })
          if (inviterUser) {
            inviter = {
              id: inviterUser.id,
              name: inviterUser.name,
              email: inviterUser.email,
            }
          }
        }

        return {
          id: member.id,
          user: member.user,
          role: member.role,
          joinedAt: member.joinedAt?.toISOString() || null,
          invitedBy: inviter,
        }
      })
    )

    return NextResponse.json({
      members: membersWithInviter,
      seatInfo: {
        current: seatCheck.current,
        limit: seatCheck.limit,
        allowed: seatCheck.allowed,
      },
    })
  } catch (error) {
    console.error('Get members error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

