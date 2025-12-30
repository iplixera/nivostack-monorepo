import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { createMockResponse } from '@/lib/mock'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/mocks/responses - Create mock response
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      endpointId,
      statusCode,
      name,
      description,
      responseBody,
      responseHeaders,
      delay,
      isDefault,
      order,
    } = await request.json()

    if (!endpointId || statusCode === undefined) {
      return NextResponse.json(
        { error: 'endpointId and statusCode are required' },
        { status: 400 }
      )
    }

    // Verify endpoint ownership
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

    if (endpoint.environment.project.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const response = await createMockResponse(endpointId, {
      statusCode,
      name,
      description,
      responseBody,
      responseHeaders,
      delay: delay || 0,
      isDefault: isDefault || false,
      order: order || 0,
    })

    return NextResponse.json({ response })
  } catch (error) {
    console.error('Create mock response error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

