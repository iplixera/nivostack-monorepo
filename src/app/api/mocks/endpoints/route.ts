import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { createMockEndpoint } from '@/lib/mock'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/mocks/endpoints - Create mock endpoint
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { environmentId, path, method, description, order } = await request.json()

    if (!environmentId || !path || !method) {
      return NextResponse.json(
        { error: 'environmentId, path, and method are required' },
        { status: 400 }
      )
    }

    // Verify environment ownership
    const environment = await prisma.mockEnvironment.findUnique({
      where: { id: environmentId },
      include: { project: true },
    })

    if (!environment) {
      return NextResponse.json({ error: 'Environment not found' }, { status: 404 })
    }

    if (environment.project.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Check mock endpoints quota
    const { checkThrottling } = await import('@/lib/throttling')
    const throttling = await checkThrottling(environment.project.userId, 'mockEndpoints')
    if (throttling.throttled || (throttling.usage && throttling.usage.limit !== null && throttling.usage.used >= throttling.usage.limit)) {
      return NextResponse.json(
        {
          error: throttling.error || `Mock endpoints limit reached. You have used ${throttling.usage?.used || 0} of ${throttling.usage?.limit || 0} endpoints. Please upgrade your plan to create more mock endpoints.`,
          usage: throttling.usage,
        },
        {
          status: throttling.throttled ? 429 : 403,
          headers: throttling.retryAfter
            ? { 'Retry-After': throttling.retryAfter.toString() }
            : {},
        }
      )
    }

    const endpoint = await createMockEndpoint(environmentId, {
      path,
      method,
      description,
      order,
    })

    return NextResponse.json({ endpoint })
  } catch (error) {
    console.error('Create mock endpoint error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/mocks/endpoints - List mock endpoints
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const environmentId = searchParams.get('environmentId')

    if (!environmentId) {
      return NextResponse.json(
        { error: 'environmentId is required' },
        { status: 400 }
      )
    }

    // Verify environment ownership
    const environment = await prisma.mockEnvironment.findUnique({
      where: { id: environmentId },
      include: { project: true },
    })

    if (!environment) {
      return NextResponse.json({ error: 'Environment not found' }, { status: 404 })
    }

    if (environment.project.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const endpoints = await prisma.mockEndpoint.findMany({
      where: { environmentId },
      include: {
        responses: {
          include: {
            conditions: true,
          },
          orderBy: [{ order: 'asc' }, { isDefault: 'desc' }],
        },
        conditions: true,
      },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({ endpoints })
  } catch (error) {
    console.error('Get mock endpoints error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

