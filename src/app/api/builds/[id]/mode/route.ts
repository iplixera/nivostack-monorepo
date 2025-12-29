import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { setBuildMode } from '@/lib/build'
import { prisma } from '@/lib/prisma'

/**
 * PATCH /api/builds/[id]/mode - Set build mode (preview or production)
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

    const { mode } = await request.json()
    const { id } = await params

    if (!mode || (mode !== 'preview' && mode !== 'production')) {
      return NextResponse.json(
        { error: 'mode must be "preview" or "production"' },
        { status: 400 }
      )
    }

    // Verify build ownership
    const build = await prisma.build.findUnique({
      where: { id },
      select: { projectId: true },
    })

    if (!build) {
      return NextResponse.json({ error: 'Build not found' }, { status: 404 })
    }

    const project = await prisma.project.findFirst({
      where: {
        id: build.projectId,
        userId: user.id,
      },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const updatedBuild = await setBuildMode(build.projectId, id, mode)

    return NextResponse.json({ build: updatedBuild })
  } catch (error) {
    console.error('Set build mode error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

