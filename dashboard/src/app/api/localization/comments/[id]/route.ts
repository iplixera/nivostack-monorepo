import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

/**
 * PATCH /api/localization/comments/[id]
 * Update a comment (resolve/unresolve)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: TranslationComment model needs to be added to Prisma schema
    return NextResponse.json({ error: 'TranslationComment model not yet implemented' }, { status: 500 })
    
    /* COMMENTED OUT UNTIL TRANSLATIONCOMMENT MODEL IS ADDED
    const { id } = await params
    const { isResolved } = await request.json()

    const comment = await (prisma as any).translationComment.findUnique({
      where: { id },
      include: {
        translation: {
          include: {
            key: {
              include: {
                project: true
              }
            }
          }
        }
      }
    })

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    // Verify project ownership
    if (comment.translation.key.project.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const updatedComment = await (prisma as any).translationComment.update({
      where: { id },
      data: {
        isResolved: isResolved ?? comment.isResolved,
        resolvedBy: isResolved ? user.id : null,
        resolvedAt: isResolved ? new Date() : null
      }
    })

    return NextResponse.json({ comment: updatedComment })
    */
  } catch (error) {
    console.error('Update comment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/localization/comments/[id]
 * Delete a comment
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: TranslationComment model needs to be added to Prisma schema
    return NextResponse.json({ error: 'TranslationComment model not yet implemented' }, { status: 500 })
    
    /* COMMENTED OUT UNTIL TRANSLATIONCOMMENT MODEL IS ADDED
    const { id } = await params

    const comment = await (prisma as any).translationComment.findUnique({
      where: { id },
      include: {
        translation: {
          include: {
            key: {
              include: {
                project: true
              }
            }
          }
        }
      }
    })

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    // Verify project ownership
    if (comment.translation.key.project.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await (prisma as any).translationComment.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
    */
  } catch (error) {
    console.error('Delete comment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

