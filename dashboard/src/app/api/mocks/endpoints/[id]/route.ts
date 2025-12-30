import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/mocks/endpoints/[id] - Get mock endpoint
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
    const endpoint = await prisma.mockEndpoint.findUnique({
      where: { id },
      include: {
        environment: {
          include: {
            project: true,
          },
        },
        responses: {
          include: {
            conditions: true,
          },
          orderBy: [{ order: 'asc' }, { isDefault: 'desc' }],
        },
        conditions: true,
      },
    })

    if (!endpoint) {
      return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 })
    }

    if (endpoint.environment.project.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json({ endpoint })
  } catch (error) {
    console.error('Get mock endpoint error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/mocks/endpoints/[id] - Update mock endpoint
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

    // Verify endpoint ownership
    const endpoint = await prisma.mockEndpoint.findUnique({
      where: { id },
      include: {
        environment: {
          include: {
            project: true,
          },
        },
      },
    })

    if (!endpoint) {
      return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 })
    }

    if (endpoint.environment.project.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const updated = await prisma.mockEndpoint.update({
      where: { id },
      data: {
        path: data.path,
        method: data.method ? data.method.toUpperCase() : undefined,
        description: data.description,
        isEnabled: data.isEnabled,
        order: data.order,
      },
    })

    return NextResponse.json({ endpoint: updated })
  } catch (error) {
    console.error('Update mock endpoint error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/mocks/endpoints/[id] - Delete mock endpoint
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

    // Verify endpoint ownership
    const endpoint = await prisma.mockEndpoint.findUnique({
      where: { id },
      include: {
        environment: {
          include: {
            project: true,
          },
        },
      },
    })

    if (!endpoint) {
      return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 })
    }

    if (endpoint.environment.project.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await prisma.mockEndpoint.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete mock endpoint error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

