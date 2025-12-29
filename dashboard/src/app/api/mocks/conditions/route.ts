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

      if (!response || response.endpoint.environment.project.userId !== user.id) {
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

      if (!endpoint || endpoint.environment.project.userId !== user.id) {
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

