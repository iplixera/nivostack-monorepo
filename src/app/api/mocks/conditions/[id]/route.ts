import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * PATCH /api/mocks/conditions/[id] - Update mock condition
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

    // Verify condition ownership
    const condition = await prisma.mockCondition.findUnique({
      where: { id },
      include: {
        response: {
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
        },
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

    if (!condition) {
      return NextResponse.json({ error: 'Condition not found' }, { status: 404 })
    }

    const project = condition.response
      ? condition.response.endpoint.environment.project
      : condition.endpoint?.environment.project

    if (!project || project.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const updated = await prisma.mockCondition.update({
      where: { id },
      data: {
        type: data.type,
        key: data.key,
        operator: data.operator,
        value: data.value,
        isCaseSensitive: data.isCaseSensitive,
        order: data.order,
      },
    })

    return NextResponse.json({ condition: updated })
  } catch (error) {
    console.error('Update mock condition error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/mocks/conditions/[id] - Delete mock condition
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

    // Verify condition ownership
    const condition = await prisma.mockCondition.findUnique({
      where: { id },
      include: {
        response: {
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
        },
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

    if (!condition) {
      return NextResponse.json({ error: 'Condition not found' }, { status: 404 })
    }

    const project = condition.response
      ? condition.response.endpoint.environment.project
      : condition.endpoint?.environment.project

    if (!project || project.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await prisma.mockCondition.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete mock condition error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

