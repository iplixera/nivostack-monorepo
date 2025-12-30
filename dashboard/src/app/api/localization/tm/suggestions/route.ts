import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

/**
 * GET /api/localization/tm/suggestions
 * Get translation memory suggestions for a source text
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const sourceLanguageId = searchParams.get('sourceLanguageId')
    const targetLanguageId = searchParams.get('targetLanguageId')
    const sourceText = searchParams.get('sourceText')
    const minSimilarity = parseFloat(searchParams.get('minSimilarity') || '0.7')

    if (!projectId || !sourceLanguageId || !targetLanguageId || !sourceText) {
      return NextResponse.json(
        { error: 'projectId, sourceLanguageId, targetLanguageId, and sourceText are required' },
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

    // TODO: TranslationMemory model needs to be added to Prisma schema
    return NextResponse.json({ suggestions: [] })
    
    /* COMMENTED OUT UNTIL TRANSLATIONMEMORY MODEL IS ADDED
    // Get all translation memory entries for this language pair
    const tmEntries = await (prisma as any).translationMemory.findMany({
      where: {
        projectId,
        sourceLanguageId,
        targetLanguageId
      }
    })

    // Calculate similarity scores
    const suggestions = tmEntries
      .map(entry => ({
        targetText: entry.targetText,
        similarity: calculateSimilarity(sourceText, entry.sourceText),
        usageCount: entry.usageCount,
        lastUsedAt: entry.lastUsedAt
      }))
      .filter(s => s.similarity >= minSimilarity)
      .sort((a, b) => {
        // Sort by similarity first, then by usage count
        if (Math.abs(a.similarity - b.similarity) > 0.01) {
          return b.similarity - a.similarity
        }
        return b.usageCount - a.usageCount
      })
      .slice(0, 10) // Return top 10 suggestions

    return NextResponse.json({ suggestions })
    */
  } catch (error) {
    console.error('TM suggestions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Calculate similarity between two strings using Levenshtein distance
 * Returns a value between 0 and 1 (1 = identical)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2
  const shorter = str1.length > str2.length ? str2 : str1

  if (longer.length === 0) {
    return 1.0
  }

  const distance = levenshteinDistance(str1, str2)
  return (longer.length - distance) / longer.length
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = []

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1 // deletion
        )
      }
    }
  }

  return matrix[str2.length][str1.length]
}

