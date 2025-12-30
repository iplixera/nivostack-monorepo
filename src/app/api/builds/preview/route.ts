import { NextRequest, NextResponse } from 'next/server'
import { getActiveBuild } from '@/lib/build'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/builds/preview - Get active preview build (SDK endpoint)
 */
export async function GET(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key')
    if (!apiKey) {
      return NextResponse.json({ error: 'API key required' }, { status: 401 })
    }

    const project = await prisma.project.findUnique({
      where: { apiKey },
    })

    if (!project) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    const build = await getActiveBuild(project.id, 'preview')

    if (!build) {
      return NextResponse.json(
        { error: 'No active preview build found' },
        { status: 404 }
      )
    }

    // Return cached build data (immutable)
    return NextResponse.json({
      build: {
        version: build.version,
        name: build.name,
        mode: build.mode,
        createdAt: build.createdAt.toISOString(),
      },
      businessConfig: build.businessConfigSnapshot,
      localization: build.localizationSnapshot,
    })
  } catch (error) {
    console.error('Get preview build error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

