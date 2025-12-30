import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { getBuildDiff } from '@/lib/build'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/builds/diff/[id1]/[id2] - Compare two builds
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id1: string; id2: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id1, id2 } = await params

    // Verify both builds belong to user's projects
    const [build1, build2] = await Promise.all([
      prisma.build.findUnique({
        where: { id: id1 },
        select: { projectId: true },
      }),
      prisma.build.findUnique({
        where: { id: id2 },
        select: { projectId: true },
      }),
    ])

    if (!build1 || !build2) {
      return NextResponse.json({ error: 'One or both builds not found' }, { status: 404 })
    }

    if (build1.projectId !== build2.projectId) {
      return NextResponse.json(
        { error: 'Builds must belong to the same project' },
        { status: 400 }
      )
    }

    const project = await prisma.project.findFirst({
      where: {
        id: build1.projectId,
        userId: user.id,
      },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const diff = await getBuildDiff(id1, id2)

    return NextResponse.json({ diff })
  } catch (error) {
    console.error('Get build diff error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
