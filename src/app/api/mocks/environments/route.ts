import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { createMockEnvironment, getMockEnvironments } from '@/lib/mock'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/mocks/environments - Create mock environment
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId, name, description, basePath, mode, whitelist, blacklist, isDefault } =
      await request.json()

    if (!projectId || !name) {
      return NextResponse.json(
        { error: 'projectId and name are required' },
        { status: 400 }
      )
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

    const environment = await createMockEnvironment(projectId, user.id, {
      name,
      description,
      basePath,
      mode: mode || 'selective',
      whitelist: whitelist || [],
      blacklist: blacklist || [],
      isDefault: isDefault || false,
    })

    return NextResponse.json({ environment })
  } catch (error) {
    console.error('Create mock environment error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/mocks/environments - List mock environments
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

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

    const environments = await getMockEnvironments(projectId)

    return NextResponse.json({ environments })
  } catch (error) {
    console.error('Get mock environments error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

