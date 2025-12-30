import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/mocks/responses/[id] - Get mock response
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
    const response = await prisma.mockResponse.findUnique({
      where: { id },
      include: {
        endpoint: {
          include: {
            environment: {
              include: {
                project: true,
              },
            },
          },
        },
        conditions: true,
      },
    })

    if (!response) {
      return NextResponse.json({ error: 'Response not found' }, { status: 404 })
    }

    if (response.endpoint.environment.project.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json({ response })
  } catch (error) {
    console.error('Get mock response error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/mocks/responses/[id] - Update mock response
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

    // Verify response ownership
    const response = await prisma.mockResponse.findUnique({
      where: { id },
      include: {
        endpoint: {
          include: {
            environment: {
              include: {
                project: true,
              },
            },
          },
        },
      },
    })

    if (!response) {
      return NextResponse.json({ error: 'Response not found' }, { status: 404 })
    }

    if (response.endpoint.environment.project.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // If setting as default, unset other defaults
    if (data.isDefault) {
      await prisma.mockResponse.updateMany({
        where: {
          endpointId: response.endpointId,
          isDefault: true,
          id: { not: id },
        },
        data: { isDefault: false },
      })
    }

    const updated = await prisma.mockResponse.update({
      where: { id },
      data: {
        statusCode: data.statusCode,
        name: data.name,
        description: data.description,
        responseBody: data.responseBody,
        responseHeaders: data.responseHeaders,
        delay: data.delay,
        isDefault: data.isDefault,
        isEnabled: data.isEnabled,
        order: data.order,
      },
    })

    return NextResponse.json({ response: updated })
  } catch (error) {
    console.error('Update mock response error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/mocks/responses/[id] - Delete mock response
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

    // Verify response ownership
    const response = await prisma.mockResponse.findUnique({
      where: { id },
      include: {
        endpoint: {
          include: {
            environment: {
              include: {
                project: true,
              },
            },
          },
        },
      },
    })

    if (!response) {
      return NextResponse.json({ error: 'Response not found' }, { status: 404 })
    }

    if (response.endpoint.environment.project.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await prisma.mockResponse.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete mock response error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

