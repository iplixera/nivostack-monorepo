import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

/**
 * GET /api/localization/comments
 * Get comments for a translation
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const translationId = searchParams.get('translationId')
    const projectId = searchParams.get('projectId')

    if (!translationId || !projectId) {
      return NextResponse.json(
        { error: 'translationId and projectId are required' },
        { status: 400 }
      )
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: user.id }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const comments = await prisma.translationComment.findMany({
      where: {
        translationId,
        projectId
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ comments })
  } catch (error) {
    console.error('Get comments error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/localization/comments
 * Create a new comment on a translation
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      translationId,
      projectId,
      content
    } = await request.json()

    if (!translationId || !projectId || !content) {
      return NextResponse.json(
        { error: 'translationId, projectId, and content are required' },
        { status: 400 }
      )
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: user.id }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Verify translation exists
    const translation = await prisma.translation.findUnique({
      where: { id: translationId }
    })

    if (!translation || translation.projectId !== projectId) {
      return NextResponse.json({ error: 'Translation not found' }, { status: 404 })
    }

    const comment = await prisma.translationComment.create({
      data: {
        translationId,
        projectId,
        userId: user.id,
        userName: user.name || user.email,
        content
      }
    })

    return NextResponse.json({ comment })
  } catch (error) {
    console.error('Create comment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

