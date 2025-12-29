import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { getMockEnvironment, updateMockEnvironment, deleteMockEnvironment } from '@/lib/mock'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/mocks/environments/[id] - Get mock environment
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
    const environment = await getMockEnvironment(id)

    if (!environment) {
      return NextResponse.json({ error: 'Environment not found' }, { status: 404 })
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: {
        id: environment.projectId,
        userId: user.id,
      },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json({ environment })
  } catch (error) {
    console.error('Get mock environment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/mocks/environments/[id] - Update mock environment
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

    const { id } = await params
    const data = await request.json()

    // Verify environment ownership
    const environment = await getMockEnvironment(id)
    if (!environment) {
      return NextResponse.json({ error: 'Environment not found' }, { status: 404 })
    }

    const project = await prisma.project.findFirst({
      where: {
        id: environment.projectId,
        userId: user.id,
      },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const updated = await updateMockEnvironment(id, data)

    return NextResponse.json({ environment: updated })
  } catch (error) {
    console.error('Update mock environment error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/mocks/environments/[id] - Delete mock environment
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

    // Verify environment ownership
    const environment = await getMockEnvironment(id)
    if (!environment) {
      return NextResponse.json({ error: 'Environment not found' }, { status: 404 })
    }

    const project = await prisma.project.findFirst({
      where: {
        id: environment.projectId,
        userId: user.id,
      },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    await deleteMockEnvironment(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete mock environment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

