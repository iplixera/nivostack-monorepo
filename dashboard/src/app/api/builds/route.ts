import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { createBuild, getBuildHistory, getBuildCreator } from '@/lib/build'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/builds - Create a new build
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId, featureType, name, description } = await request.json()

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
    }

    if (!featureType || !['business_config', 'localization', 'api_mocks'].includes(featureType)) {
      return NextResponse.json({ error: 'featureType is required and must be business_config, localization, or api_mocks' }, { status: 400 })
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: user.id,
      },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const build = await createBuild(projectId, user.id, featureType, name, description)

    return NextResponse.json({ build })
  } catch (error) {
    console.error('Create build error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/builds - List all builds for a project
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const featureType = searchParams.get('featureType')

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: user.id,
      },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const builds = await getBuildHistory(projectId, featureType || undefined)

    // Enrich builds with creator information
    const buildsWithCreators = await Promise.all(
      builds.map(async (build) => {
        const creator = build.createdBy ? await getBuildCreator(build.createdBy) : null
        return {
          ...build,
          creator: creator ? {
            id: creator.id,
            email: creator.email,
            name: creator.name,
          } : null,
        }
      })
    )

    return NextResponse.json({ builds: buildsWithCreators })
  } catch (error) {
    console.error('Get builds error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

