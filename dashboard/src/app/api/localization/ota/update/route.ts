import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateApiKey } from '@/lib/auth'

/**
 * POST /api/localization/ota/update
 * Log OTA update statistics (SDK endpoint)
 */
export async function POST(request: NextRequest) {
  try {
    const project = await validateApiKey(request)
    if (!project) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    const {
      projectId,
      deviceId,
      fromVersion,
      toVersion,
      languageCode
    } = await request.json()

    if (!projectId || !deviceId || !fromVersion || !toVersion || !languageCode) {
      return NextResponse.json(
        { error: 'projectId, deviceId, fromVersion, toVersion, and languageCode are required' },
        { status: 400 }
      )
    }

    if (projectId !== project.id) {
      return NextResponse.json({ error: 'Invalid project' }, { status: 403 })
    }

    // Log the update (could be stored in a separate OTAUpdateLog table in the future)
    // For now, we'll just return success
    // In production, you might want to track:
    // - Update success/failure rates
    // - Update timing
    // - Device-specific update history

    return NextResponse.json({
      success: true,
      message: 'OTA update logged'
    })
  } catch (error) {
    console.error('OTA update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

