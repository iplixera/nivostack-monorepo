import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// Types for screen flow data
type ScreenNode = {
  id: string
  name: string
  requestCount: number
  totalCost: number
  successCount: number
  errorCount: number
}

type ScreenEdge = {
  id: string
  source: string
  target: string
  requestCount: number
  totalCost: number
  successCount: number
  errorCount: number
  sequenceNumber: number
  topEndpoints: Array<{
    method: string
    endpoint: string
    url: string
    count: number
    cost: number
    successRate: number
    statusCode: number
    duration: number
    requestBody?: string
    responseBody?: string
  }>
}

type FlowData = {
  nodes: ScreenNode[]
  edges: ScreenEdge[]
  sessions: Array<{
    id: string
    sessionToken: string
    startedAt: string
    endedAt: string | null
    isActive: boolean
    device: { deviceId: string; platform: string; model: string | null } | null
    requestCount: number
    totalCost: number
    screenSequence: string[]
  }>
}

// GET - Get screen flow data for visualization
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const projectId = request.nextUrl.searchParams.get('projectId')
    const sessionId = request.nextUrl.searchParams.get('sessionId')

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

    // Build where clause
    const whereClause: Record<string, unknown> = {
      projectId,
      screenName: { not: null }
    }
    if (sessionId) {
      whereClause.sessionId = sessionId
    }

    // Get all traces with screen names ordered by timestamp
    const traces = await prisma.apiTrace.findMany({
      where: whereClause,
      select: {
        id: true,
        url: true,
        method: true,
        statusCode: true,
        duration: true,
        screenName: true,
        cost: true,
        timestamp: true,
        sessionId: true,
        requestBody: true,
        responseBody: true,
        session: {
          select: {
            id: true,
            sessionToken: true,
            startedAt: true,
            endedAt: true,
            isActive: true,
            device: {
              select: {
                deviceId: true,
                platform: true,
                model: true
              }
            }
          }
        }
      },
      orderBy: { timestamp: 'asc' }
    })

    // Build nodes (unique screens)
    const nodeMap = new Map<string, ScreenNode>()
    const edgeMap = new Map<string, ScreenEdge & {
      endpoints: Map<string, {
        method: string;
        endpoint: string;
        url: string;
        count: number;
        cost: number;
        successCount: number;
        statusCode: number;
        duration: number;
        requestBody?: string;
        responseBody?: string;
      }>
    }>()
    let globalSequenceNumber = 0
    const sessionMap = new Map<string, {
      id: string
      sessionToken: string
      startedAt: Date
      endedAt: Date | null
      isActive: boolean
      device: { deviceId: string; platform: string; model: string | null } | null
      requestCount: number
      totalCost: number
      screenSequence: string[]
      lastScreen: string | null
    }>()

    // Process traces
    for (const trace of traces) {
      const screenName = trace.screenName || 'Unknown'
      const isSuccess = trace.statusCode && trace.statusCode >= 200 && trace.statusCode < 400
      const cost = trace.cost || 0

      // Extract endpoint path from URL
      let endpointPath: string
      try {
        const url = new URL(trace.url)
        endpointPath = url.pathname
      } catch {
        endpointPath = trace.url
      }

      // Update node
      if (!nodeMap.has(screenName)) {
        nodeMap.set(screenName, {
          id: screenName,
          name: screenName,
          requestCount: 0,
          totalCost: 0,
          successCount: 0,
          errorCount: 0
        })
      }
      const node = nodeMap.get(screenName)!
      node.requestCount++
      node.totalCost += cost
      if (isSuccess) {
        node.successCount++
      } else {
        node.errorCount++
      }

      // Track session data
      if (trace.sessionId && trace.session) {
        if (!sessionMap.has(trace.sessionId)) {
          sessionMap.set(trace.sessionId, {
            id: trace.session.id,
            sessionToken: trace.session.sessionToken.slice(0, 8) + '...',
            startedAt: trace.session.startedAt,
            endedAt: trace.session.endedAt,
            isActive: trace.session.isActive,
            device: trace.session.device,
            requestCount: 0,
            totalCost: 0,
            screenSequence: [],
            lastScreen: null
          })
        }
        const session = sessionMap.get(trace.sessionId)!
        session.requestCount++
        session.totalCost += cost

        // Track screen transitions within session
        const lastScreen = session.lastScreen
        if (lastScreen && lastScreen !== screenName) {
          globalSequenceNumber++
          // Create edge for this transition
          const edgeId = `${lastScreen}->${screenName}`
          if (!edgeMap.has(edgeId)) {
            edgeMap.set(edgeId, {
              id: edgeId,
              source: lastScreen,
              target: screenName,
              requestCount: 0,
              totalCost: 0,
              successCount: 0,
              errorCount: 0,
              sequenceNumber: globalSequenceNumber,
              topEndpoints: [],
              endpoints: new Map()
            })
          }
          const edge = edgeMap.get(edgeId)!
          edge.requestCount++
          edge.totalCost += cost
          if (isSuccess) {
            edge.successCount++
          } else {
            edge.errorCount++
          }

          // Track endpoint for this edge with request/response data
          const endpointKey = `${trace.method}:${endpointPath}`
          if (!edge.endpoints.has(endpointKey)) {
            edge.endpoints.set(endpointKey, {
              method: trace.method,
              endpoint: endpointPath,
              url: trace.url,
              count: 0,
              cost: 0,
              successCount: 0,
              statusCode: trace.statusCode || 0,
              duration: trace.duration || 0,
              requestBody: trace.requestBody || undefined,
              responseBody: trace.responseBody || undefined
            })
          }
          const ep = edge.endpoints.get(endpointKey)!
          ep.count++
          ep.cost += cost
          if (isSuccess) ep.successCount++
          // Update with latest request/response data
          if (trace.requestBody) ep.requestBody = trace.requestBody
          if (trace.responseBody) ep.responseBody = trace.responseBody
          ep.statusCode = trace.statusCode || ep.statusCode
          ep.duration = trace.duration || ep.duration
        }

        // Update screen sequence
        if (session.screenSequence.length === 0 || session.screenSequence[session.screenSequence.length - 1] !== screenName) {
          session.screenSequence.push(screenName)
        }
        session.lastScreen = screenName
      }
    }

    // Convert maps to arrays
    const nodes = Array.from(nodeMap.values())

    // Process edges and calculate top endpoints
    const edges: ScreenEdge[] = Array.from(edgeMap.values())
      .sort((a, b) => a.sequenceNumber - b.sequenceNumber)
      .map(edge => {
        const topEndpoints = Array.from(edge.endpoints.values())
          .sort((a, b) => b.count - a.count)
          .slice(0, 10)
          .map(ep => ({
            method: ep.method,
            endpoint: ep.endpoint,
            url: ep.url,
            count: ep.count,
            cost: ep.cost,
            successRate: ep.count > 0 ? (ep.successCount / ep.count) * 100 : 0,
            statusCode: ep.statusCode,
            duration: ep.duration,
            requestBody: ep.requestBody,
            responseBody: ep.responseBody
          }))

        return {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          requestCount: edge.requestCount,
          totalCost: edge.totalCost,
          successCount: edge.successCount,
          errorCount: edge.errorCount,
          sequenceNumber: edge.sequenceNumber,
          topEndpoints
        }
      })

    // Convert sessions
    const sessions = Array.from(sessionMap.values())
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
      .slice(0, 50)
      .map(s => ({
        id: s.id,
        sessionToken: s.sessionToken,
        startedAt: s.startedAt.toISOString(),
        endedAt: s.endedAt?.toISOString() || null,
        isActive: s.isActive,
        device: s.device,
        requestCount: s.requestCount,
        totalCost: s.totalCost,
        screenSequence: s.screenSequence
      }))

    const flowData: FlowData = { nodes, edges, sessions }

    return NextResponse.json(flowData)
  } catch (error) {
    console.error('Flow GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
