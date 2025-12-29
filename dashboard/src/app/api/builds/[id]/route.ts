import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { getBuild, updateBuild, deleteBuild } from '@/lib/build'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/builds/[id] - Get build details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const build = await getBuild(id)

    if (!build) {
      return NextResponse.json({ error: 'Build not found' }, { status: 404 })
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: {
        id: build.projectId,
        userId: user.id,
      },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json({ build })
  } catch (error) {
    console.error('Get build error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/builds/[id] - Update build name/description
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

    const { name, description } = await request.json()
    const { id } = await params

    // Verify build ownership
    const build = await getBuild(id)
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

    const updatedBuild = await updateBuild(id, { name, description })

    return NextResponse.json({ build: updatedBuild })
  } catch (error) {
    console.error('Update build error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/builds/[id] - Delete build
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify build ownership
    const build = await getBuild(id)
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

    await deleteBuild(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete build error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

