import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/stats/dashboard
 * Returns aggregated dashboard statistics for a project
 *
 * Query params:
 * - projectId: string (required)
 * - timeRange: string (optional) - 'last_15m', 'last_1h', 'last_24h', 'last_7d', 'last_30d'
 * - environment: string (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const timeRange = searchParams.get('timeRange') || 'last_24h'

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
    }

    // Calculate time range
    const now = new Date()
    let startDate: Date

    switch (timeRange) {
      case 'last_15m':
        startDate = new Date(now.getTime() - 15 * 60 * 1000)
        break
      case 'last_1h':
        startDate = new Date(now.getTime() - 60 * 60 * 1000)
        break
      case 'last_24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case 'last_7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'last_30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    }

    // KPIs
    // Active devices (distinct devices with activity in time range)
    const activeDevices = await prisma.device.count({
      where: {
        projectId,
        status: 'active',
        lastSeenAt: { gte: startDate },
      },
    })

    // Total sessions
    const totalSessions = await prisma.session.count({
      where: {
        projectId,
        startedAt: { gte: startDate },
      },
    })

    // Total API requests
    const totalApiRequests = await prisma.apiTrace.count({
      where: {
        projectId,
        timestamp: { gte: startDate },
      },
    })

    // Error count (4xx and 5xx status codes)
    const errorCount = await prisma.apiTrace.count({
      where: {
        projectId,
        timestamp: { gte: startDate },
        statusCode: { gte: 400 },
      },
    })

    // Crash count
    const crashCount = await prisma.crash.count({
      where: {
        projectId,
        timestamp: { gte: startDate },
      },
    })

    // Calculate error rate
    const errorRate = totalApiRequests > 0
      ? ((errorCount / totalApiRequests) * 100).toFixed(2)
      : '0.00'

    // Calculate crash-free rate
    const crashFreeRate = totalSessions > 0
      ? (((totalSessions - crashCount) / totalSessions) * 100).toFixed(1)
      : '100.0'

    // Get P95 latency from API traces
    const traces = await prisma.apiTrace.findMany({
      where: {
        projectId,
        timestamp: { gte: startDate },
        duration: { not: null },
      },
      select: { duration: true },
      orderBy: { duration: 'asc' },
    })

    let p95Latency = 0
    if (traces.length > 0) {
      const index = Math.floor(traces.length * 0.95)
      p95Latency = traces[index]?.duration || 0
    }

    // Top issues (errors, crashes, slow endpoints)
    // Get top error endpoints
    const topErrorEndpoints = await prisma.apiTrace.groupBy({
      by: ['url', 'method', 'statusCode'],
      where: {
        projectId,
        timestamp: { gte: startDate },
        statusCode: { gte: 400 },
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    })

    // Get recent crashes
    const recentCrashes = await prisma.crash.findMany({
      where: {
        projectId,
        timestamp: { gte: startDate },
      },
      orderBy: { timestamp: 'desc' },
      take: 5,
      select: {
        id: true,
        message: true,
        timestamp: true,
        device: {
          select: { platform: true, model: true },
        },
      },
    })

    // Get slow endpoints (P95 > 1000ms)
    const slowEndpoints = await prisma.$queryRaw<Array<{
      url: string
      method: string
      avg_duration: number
      count: bigint
    }>>`
      SELECT url, method, AVG(duration) as avg_duration, COUNT(*) as count
      FROM "ApiTrace"
      WHERE "projectId" = ${projectId}
        AND timestamp >= ${startDate}
        AND duration IS NOT NULL
        AND duration > 1000
      GROUP BY url, method
      ORDER BY avg_duration DESC
      LIMIT 5
    `

    // Format top issues
    const topIssues = [
      ...recentCrashes.map((c) => ({
        type: 'crash' as const,
        title: c.message.substring(0, 50),
        subtitle: `${c.device?.platform || 'Unknown'} • ${c.device?.model || 'Unknown'}`,
        timestamp: c.timestamp,
      })),
      ...topErrorEndpoints.map((e) => ({
        type: 'error' as const,
        title: `${e.method} ${e.url.substring(0, 40)}`,
        subtitle: `HTTP ${e.statusCode} • ${e._count.id} occurrences`,
        timestamp: new Date(),
      })),
      ...slowEndpoints.map((s) => ({
        type: 'slow' as const,
        title: `${s.method} ${s.url.substring(0, 40)}`,
        subtitle: `P95 ${Math.round(s.avg_duration)}ms • ${Number(s.count)} requests`,
        timestamp: new Date(),
      })),
    ].slice(0, 5)

    // Platform distribution for breakdown
    const platformDistribution = await prisma.device.groupBy({
      by: ['platform'],
      where: {
        projectId,
        status: 'active',
        lastSeenAt: { gte: startDate },
      },
      _count: { platform: true },
      orderBy: { _count: { platform: 'desc' } },
    })

    return NextResponse.json({
      kpis: {
        activeDevices,
        sessions: totalSessions,
        apiRequests: totalApiRequests,
        errorRate: parseFloat(errorRate),
        crashFreeRate: parseFloat(crashFreeRate),
        crashRate: (100 - parseFloat(crashFreeRate)).toFixed(1),
        p95Latency,
      },
      topIssues,
      breakdown: {
        platform: platformDistribution.map((p) => ({
          label: p.platform,
          value: p.platform.toLowerCase(),
          count: p._count.platform,
        })),
      },
      timeRange,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    )
  }
}
