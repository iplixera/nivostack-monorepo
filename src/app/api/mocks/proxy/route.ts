import { NextRequest, NextResponse } from 'next/server'
import { getMockResponse } from '@/lib/mock'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/mocks/proxy - Mock proxy endpoint (SDK calls this)
 * 
 * This endpoint is called by the SDK before making real API calls.
 * Returns mock response if match found, or { mockFound: false } if no mock.
 * SDK will forward to real backend if mockFound: false
 */
export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key')
    if (!apiKey) {
      return NextResponse.json({ error: 'API key required' }, { status: 401 })
    }

    const project = await prisma.project.findUnique({
      where: { apiKey },
    })

    if (!project) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    const {
      environmentId,
      path,
      method,
      query = {},
      headers = {},
      body = null,
    } = await request.json()

    if (!path || !method) {
      return NextResponse.json(
        { error: 'path and method are required' },
        { status: 400 }
      )
    }

    // Get mock response
    const mockResult = await getMockResponse(
      project.id,
      environmentId || null,
      path,
      method,
      query,
      headers,
      body
    )

    if (!mockResult || !mockResult.mockFound) {
      return NextResponse.json({
        mockFound: false,
        message: `No mock endpoint found for ${method} ${path}`,
      })
    }

    // Apply delay if specified
    if (mockResult.delay && mockResult.delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, mockResult.delay))
    }

    return NextResponse.json({
      mockFound: true,
      matched: true,
      endpointId: mockResult.endpointId,
      responseId: mockResult.responseId,
      statusCode: mockResult.statusCode,
      headers: mockResult.headers || {},
      body: mockResult.body,
      delay: mockResult.delay || 0,
    })
  } catch (error) {
    console.error('Mock proxy error:', error)
    return NextResponse.json(
      {
        mockFound: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}

