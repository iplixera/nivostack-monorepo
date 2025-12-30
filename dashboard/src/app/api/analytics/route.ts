import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// GET - Get cost analytics for a project
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const projectId = request.nextUrl.searchParams.get('projectId')
    const deviceId = request.nextUrl.searchParams.get('deviceId')

    if (!authHeader || !projectId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const payload = verifyToken(token)

    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: payload.userId
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const whereClause: Record<string, unknown> = { projectId }
    if (deviceId) {
      whereClause.deviceId = deviceId
    }

    // Total cost of all requests
    const totalCostResult = await prisma.apiTrace.aggregate({
      where: whereClause,
      _sum: { cost: true },
      _count: true
    })

    // Cost by endpoint
    const tracesByEndpoint = await prisma.apiTrace.groupBy({
      by: ['url', 'method'],
      where: whereClause,
      _sum: { cost: true },
      _count: true,
      orderBy: { _sum: { cost: 'desc' } },
      take: 20
    })

    // Cost by device
    const deviceCosts = await prisma.apiTrace.groupBy({
      by: ['deviceId'],
      where: { ...whereClause, deviceId: { not: null } },
      _sum: { cost: true },
      _count: true,
      orderBy: { _sum: { cost: 'desc' } }
    })

    // Get device details for the cost breakdown
    const deviceIds = deviceCosts.map(d => d.deviceId).filter(Boolean) as string[]
    const devices = await prisma.device.findMany({
      where: { id: { in: deviceIds } },
      select: {
        id: true,
        deviceId: true,
        platform: true,
        model: true
      }
    })

    const deviceCostsWithDetails = deviceCosts.map(dc => {
      const device = devices.find(d => d.id === dc.deviceId)
      return {
        deviceId: dc.deviceId,
        device: device || null,
        totalCost: dc._sum.cost || 0,
        requestCount: dc._count
      }
    })

    // Cost by session (recent sessions)
    const sessionCosts = await prisma.session.findMany({
      where: { projectId, ...(deviceId ? { deviceId } : {}) },
      include: {
        device: {
          select: {
            deviceId: true,
            platform: true,
            model: true
          }
        },
        _count: {
          select: { apiTraces: true }
        }
      },
      orderBy: { startedAt: 'desc' },
      take: 50
    })

    const sessionsWithCost = await Promise.all(
      sessionCosts.map(async (session) => {
        const costResult = await prisma.apiTrace.aggregate({
          where: { sessionId: session.id },
          _sum: { cost: true }
        })

        return {
          id: session.id,
          sessionToken: session.sessionToken.slice(0, 8) + '...',
          startedAt: session.startedAt,
          endedAt: session.endedAt,
          isActive: session.isActive,
          device: session.device,
          requestCount: session._count.apiTraces,
          totalCost: costResult._sum.cost || 0
        }
      })
    )

    // Unique endpoints cost (cost of distinct API calls)
    const uniqueEndpointsCost = tracesByEndpoint.reduce((sum, e) => {
      // Get the cost per request config for this endpoint
      const costPerRequest = e._sum.cost ? e._sum.cost / e._count : 0
      return sum + costPerRequest
    }, 0)

    // Format endpoint costs
    const endpointCosts = tracesByEndpoint.map(e => {
      let endpointPath: string
      try {
        const url = new URL(e.url)
        endpointPath = url.pathname
      } catch {
        endpointPath = e.url
      }

      return {
        endpoint: endpointPath,
        method: e.method,
        fullUrl: e.url,
        totalCost: e._sum.cost || 0,
        requestCount: e._count,
        avgCostPerRequest: e._count > 0 ? (e._sum.cost || 0) / e._count : 0
      }
    })

    return NextResponse.json({
      summary: {
        totalCost: totalCostResult._sum.cost || 0,
        totalRequests: totalCostResult._count,
        uniqueEndpointsCost,
        avgCostPerRequest: totalCostResult._count > 0
          ? (totalCostResult._sum.cost || 0) / totalCostResult._count
          : 0
      },
      endpointCosts,
      deviceCosts: deviceCostsWithDetails,
      sessionCosts: sessionsWithCost
    })
  } catch (error) {
    console.error('Analytics GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
