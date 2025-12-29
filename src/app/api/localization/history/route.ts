import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

/**
 * GET /api/localization/history
 * Get translation history for a key or translation
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const translationId = searchParams.get('translationId')
    const keyId = searchParams.get('keyId')
    const projectId = searchParams.get('projectId')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId is required' },
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

    let where: any = { projectId }

    if (translationId) {
      where.translationId = translationId
    } else if (keyId) {
      // Get all translations for this key
      const translations = await prisma.translation.findMany({
        where: { keyId, projectId },
        select: { id: true }
      })
      where.translationId = { in: translations.map(t => t.id) }
    }

    const history = await prisma.translationHistory.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    })

    return NextResponse.json({ history })
  } catch (error) {
    console.error('Get history error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

