import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { createMockCondition } from '@/lib/mock'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/mocks/conditions - Create mock condition
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { responseId, endpointId, type, key, operator, value, isCaseSensitive, order } =
      await request.json()

    if (!type || !key || !operator) {
      return NextResponse.json(
        { error: 'type, key, and operator are required' },
        { status: 400 }
      )
    }

    if (!responseId && !endpointId) {
      return NextResponse.json(
        { error: 'Either responseId or endpointId is required' },
        { status: 400 }
      )
    }

    // Verify ownership
    if (responseId) {
      const response = await prisma.mockResponse.findUnique({
        where: { id: responseId },
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
      // Check if user has access to project (owner or member)
      const { canPerformAction: canPerformAction1 } = await import('@/lib/team-access')
      const hasAccess1 = await canPerformAction1(user.id, response.endpoint.environment.projectId, 'view')
      if (!hasAccess1) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }
    } else if (endpointId) {
      const endpoint = await prisma.mockEndpoint.findUnique({
        where: { id: endpointId },
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
      // Check if user has access to project (owner or member)
      const { canPerformAction: canPerformAction2 } = await import('@/lib/team-access')
      const hasAccess2 = await canPerformAction2(user.id, endpoint.environment.projectId, 'view')
      if (!hasAccess2) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }
    }

    const condition = await createMockCondition({
      responseId,
      endpointId,
      type,
      key,
      operator,
      value,
      isCaseSensitive,
      order,
    })

    return NextResponse.json({ condition })
  } catch (error) {
    console.error('Create mock condition error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

