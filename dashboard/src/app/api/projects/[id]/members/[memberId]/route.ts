import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { canPerformAction, getUserProjectRole } from '@/lib/team-access'

/**
 * PATCH /api/projects/[id]/members/[memberId]
 * Update member role
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: projectId, memberId } = await params
    const { role } = await request.json()

    if (!role) {
      return NextResponse.json(
        { error: 'Role is required' },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles = ['owner', 'admin', 'member', 'viewer']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${validRoles.join(', ')}` },
        { status: 400 }
      )
    }

    // Check if user can change roles
    const canChangeRole = await canPerformAction(user.id, projectId, 'change_role')
    if (!canChangeRole) {
      return NextResponse.json(
        { error: 'You do not have permission to change member roles' },
        { status: 403 }
      )
    }

    // Get member
    const member = await prisma.projectMember.findUnique({
      where: { id: memberId },
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    if (member.projectId !== projectId) {
      return NextResponse.json(
        { error: 'Member does not belong to this project' },
        { status: 400 }
      )
    }

    // Prevent changing owner role (use transfer ownership endpoint)
    if (member.role === 'owner' && role !== 'owner') {
      return NextResponse.json(
        { error: 'Cannot change owner role. Use transfer ownership endpoint instead.' },
        { status: 400 }
      )
    }

    // Prevent non-owners from changing roles to owner
    const userRole = await getUserProjectRole(user.id, projectId)
    if (role === 'owner' && userRole !== 'owner') {
      return NextResponse.json(
        { error: 'Only owners can assign owner role' },
        { status: 403 }
      )
    }

    // Update role
    const updatedMember = await prisma.projectMember.update({
      where: { id: memberId },
      data: { role },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json({
      member: {
        id: updatedMember.id,
        user: updatedMember.user,
        role: updatedMember.role,
        joinedAt: updatedMember.joinedAt?.toISOString() || null,
      },
    })
  } catch (error) {
    console.error('Update member role error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/projects/[id]/members/[memberId]
 * Remove a team member
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: projectId, memberId } = await params

    // Check if user can remove members
    const canRemove = await canPerformAction(user.id, projectId, 'remove_member')
    if (!canRemove) {
      return NextResponse.json(
        { error: 'You do not have permission to remove members' },
        { status: 403 }
      )
    }

    // Get member
    const member = await prisma.projectMember.findUnique({
      where: { id: memberId },
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    if (member.projectId !== projectId) {
      return NextResponse.json(
        { error: 'Member does not belong to this project' },
        { status: 400 }
      )
    }

    // Prevent removing owner (use transfer ownership first)
    if (member.role === 'owner') {
      return NextResponse.json(
        { error: 'Cannot remove owner. Transfer ownership first.' },
        { status: 400 }
      )
    }

    // Prevent removing yourself
    if (member.userId === user.id) {
      return NextResponse.json(
        { error: 'You cannot remove yourself. Ask another admin/owner to remove you.' },
        { status: 400 }
      )
    }

    // Remove member
    await prisma.projectMember.delete({
      where: { id: memberId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Remove member error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

