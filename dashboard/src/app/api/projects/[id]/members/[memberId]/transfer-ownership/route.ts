import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { getUserProjectRole } from '@/lib/team-access'

/**
 * POST /api/projects/[id]/members/[memberId]/transfer-ownership
 * Transfer project ownership to another member
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: projectId, memberId } = await params

    // Check if user is owner
    const userRole = await getUserProjectRole(user.id, projectId)
    if (userRole !== 'owner') {
      // Check legacy owner (backward compatibility)
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { userId: true },
      })

      if (project?.userId !== user.id) {
        return NextResponse.json(
          { error: 'Only the project owner can transfer ownership' },
          { status: 403 }
        )
      }
    }

    // Get member to transfer to
    const newOwnerMember = await prisma.projectMember.findUnique({
      where: { id: memberId },
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

    if (!newOwnerMember) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    if (newOwnerMember.projectId !== projectId) {
      return NextResponse.json(
        { error: 'Member does not belong to this project' },
        { status: 400 }
      )
    }

    // Use transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      // Update old owner to admin
      const oldOwnerMember = await tx.projectMember.findFirst({
        where: {
          projectId,
          userId: user.id,
          role: 'owner',
        },
      })

      if (oldOwnerMember) {
        await tx.projectMember.update({
          where: { id: oldOwnerMember.id },
          data: { role: 'admin' },
        })
      }

      // Update new owner
      await tx.projectMember.update({
        where: { id: memberId },
        data: { role: 'owner' },
      })

      // Update project userId (backward compatibility)
      await tx.project.update({
        where: { id: projectId },
        data: { userId: newOwnerMember.userId },
      })
    })

    return NextResponse.json({
      success: true,
      message: 'Ownership transferred successfully',
      newOwner: {
        id: newOwnerMember.user.id,
        email: newOwnerMember.user.email,
        name: newOwnerMember.user.name,
      },
    })
  } catch (error) {
    console.error('Transfer ownership error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

