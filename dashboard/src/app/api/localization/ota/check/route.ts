import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateApiKey } from '@/lib/auth'

/**
 * GET /api/localization/ota/check
 * Check for OTA translation updates (SDK endpoint)
 */
export async function GET(request: NextRequest) {
  try {
    const project = await validateApiKey(request)
    if (!project) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const currentVersion = searchParams.get('currentVersion')
    const languageCode = searchParams.get('languageCode')

    if (!projectId || !languageCode) {
      return NextResponse.json(
        { error: 'projectId and languageCode are required' },
        { status: 400 }
      )
    }

    if (projectId !== project.id) {
      return NextResponse.json({ error: 'Invalid project' }, { status: 403 })
    }

    // Get the latest build version for this project
    const latestBuild = await prisma.build.findFirst({
      where: {
        projectId,
        mode: 'production'
      },
      orderBy: {
        version: 'desc'
      },
      select: {
        version: true,
        localizationSnapshot: true
      }
    })

    if (!latestBuild || !latestBuild.localizationSnapshot) {
      return NextResponse.json({
        updateAvailable: false,
        latestVersion: currentVersion ? parseInt(currentVersion) : 0
      })
    }

    const latestVersion = latestBuild.version || 0
    const currentVersionNum = currentVersion ? parseInt(currentVersion) : 0

    if (latestVersion <= currentVersionNum) {
      return NextResponse.json({
        updateAvailable: false,
        latestVersion
      })
    }

    // Get current and latest translations
    const currentTranslations = currentVersionNum > 0
      ? await getTranslationsForVersion(projectId, languageCode, currentVersionNum)
      : {}

    const latestTranslations = await getTranslationsForLanguage(projectId, languageCode)

    // Calculate delta
    const delta = calculateDelta(currentTranslations, latestTranslations)

    return NextResponse.json({
      updateAvailable: true,
      latestVersion,
      delta: Object.keys(delta.added).length > 0 || Object.keys(delta.updated).length > 0 || delta.deleted.length > 0
        ? delta
        : undefined,
      fullPayload: latestTranslations
    })
  } catch (error) {
    console.error('OTA check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Get translations for a specific build version
 */
async function getTranslationsForVersion(
  projectId: string,
  languageCode: string,
  version: number
): Promise<Record<string, string>> {
  const build = await prisma.build.findFirst({
    where: {
      projectId,
      version,
      mode: 'production'
    },
    select: {
      localizationSnapshot: true
    }
  })

  if (!build || !build.localizationSnapshot) {
    return {}
  }

  const snapshot = build.localizationSnapshot as any
  return snapshot[languageCode] || {}
}

/**
 * Get current translations for a language
 */
async function getTranslationsForLanguage(
  projectId: string,
  languageCode: string
): Promise<Record<string, string>> {
  const language = await prisma.language.findFirst({
    where: {
      projectId,
      code: languageCode,
      isEnabled: true
    }
  })

  if (!language) {
    return {}
  }

  const translations = await prisma.translation.findMany({
    where: {
      projectId,
      languageId: language.id
    },
    include: {
      key: true
    }
  })

  const result: Record<string, string> = {}
  for (const translation of translations) {
    result[translation.key.key] = translation.value
  }

  return result
}

/**
 * Calculate delta between two translation sets
 */
function calculateDelta(
  current: Record<string, string>,
  latest: Record<string, string>
): {
  added: Record<string, string>
  updated: Record<string, string>
  deleted: string[]
} {
  const added: Record<string, string> = {}
  const updated: Record<string, string> = {}
  const deleted: string[] = []

  // Find added and updated
  for (const [key, value] of Object.entries(latest)) {
    if (!(key in current)) {
      added[key] = value
    } else if (current[key] !== value) {
      updated[key] = value
    }
  }

  // Find deleted
  for (const key of Object.keys(current)) {
    if (!(key in latest)) {
      deleted.push(key)
    }
  }

  return { added, updated, deleted }
}

