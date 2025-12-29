import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json({ error: 'Missing projectId' }, { status: 400 })
    }

    // Authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const payload = verifyToken(token)

    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: payload.userId },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Get all keys
    const totalKeys = await prisma.localizationKey.count({
      where: { projectId },
    })

    // Get all languages
    const languages = await prisma.language.findMany({
      where: { projectId },
      include: {
        translations: {
          select: {
            id: true,
            isReviewed: true,
          },
        },
      },
    })

    const totalLanguages = languages.length

    // Calculate statistics per language
    const languageStats = await Promise.all(
      languages.map(async (lang) => {
        const totalTranslations = await prisma.translation.count({
          where: {
            projectId,
            languageId: lang.id,
          },
        })

        const reviewedCount = await prisma.translation.count({
          where: {
            projectId,
            languageId: lang.id,
            isReviewed: true,
          },
        })

        const completionRate = totalKeys > 0 ? (totalTranslations / totalKeys) * 100 : 0
        const reviewedRate = totalTranslations > 0 ? (reviewedCount / totalTranslations) * 100 : 0

        return {
          id: lang.id,
          code: lang.code,
          name: lang.name,
          totalKeys,
          translatedKeys: totalTranslations,
          completionRate: Math.round(completionRate * 100) / 100,
          missingKeys: totalKeys - totalTranslations,
          reviewedCount,
          reviewedRate: Math.round(reviewedRate * 100) / 100,
        }
      })
    )

    // Calculate overall completion rate
    const totalTranslations = await prisma.translation.count({
      where: { projectId },
    })

    const overallCompletionRate =
      totalLanguages > 0 && totalKeys > 0
        ? (totalTranslations / (totalKeys * totalLanguages)) * 100
        : 0

    // Get category statistics
    const keysByCategory = await prisma.localizationKey.groupBy({
      by: ['category'],
      where: { projectId },
      _count: {
        id: true,
      },
    })

    const categoryStats = await Promise.all(
      keysByCategory.map(async (cat) => {
        const categoryKeys = await prisma.localizationKey.findMany({
          where: {
            projectId,
            category: cat.category,
          },
          select: { id: true },
        })

        const keyIds = categoryKeys.map((k) => k.id)
        const translatedCount = await prisma.translation.count({
          where: {
            projectId,
            keyId: { in: keyIds },
          },
        })

        const completionRate = cat._count.id > 0 ? (translatedCount / (cat._count.id * totalLanguages)) * 100 : 0

        return {
          category: cat.category || 'Uncategorized',
          totalKeys: cat._count.id,
          translatedKeys: translatedCount,
          completionRate: Math.round(completionRate * 100) / 100,
        }
      })
    )

    // Get recent activity (last 50 activities)
    // Note: This is a simplified version. In production, you might want a dedicated Activity model
    const recentKeys = await prisma.localizationKey.findMany({
      where: { projectId },
      orderBy: { updatedAt: 'desc' },
      take: 20,
      select: {
        id: true,
        key: true,
        updatedAt: true,
        createdAt: true,
      },
    })

    const recentTranslations = await prisma.translation.findMany({
      where: { projectId },
      orderBy: { updatedAt: 'desc' },
      take: 30,
      select: {
        id: true,
        key: {
          select: {
            key: true,
          },
        },
        language: {
          select: {
            code: true,
            name: true,
          },
        },
        updatedAt: true,
        createdAt: true,
      },
    })

    const recentActivity: Array<{
      type: string
      timestamp: string
      details: Record<string, any>
    }> = []

    // Add key creation activities
    for (const key of recentKeys) {
      if (key.createdAt.getTime() === key.updatedAt.getTime()) {
        recentActivity.push({
          type: 'key_created',
          timestamp: key.createdAt.toISOString(),
          details: {
            key: key.key,
          },
        })
      }
    }

    // Add translation activities
    for (const trans of recentTranslations) {
      const isNew = trans.createdAt.getTime() === trans.updatedAt.getTime()
      recentActivity.push({
        type: isNew ? 'translation_created' : 'translation_updated',
        timestamp: trans.updatedAt.toISOString(),
        details: {
          key: trans.key.key,
          language: trans.language.code,
          languageName: trans.language.name,
        },
      })
    }

    // Sort by timestamp and limit
    recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    recentActivity.splice(50) // Keep only last 50

    return NextResponse.json({
      overview: {
        totalKeys,
        totalLanguages,
        totalTranslations,
        completionRate: Math.round(overallCompletionRate * 100) / 100,
      },
      languages: languageStats,
      categories: categoryStats,
      recentActivity,
    })
  } catch (error) {
    console.error('Statistics error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

