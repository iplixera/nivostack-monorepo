import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

/**
 * GET /api/business-config/analytics
 * Get analytics for business config usage
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const configKey = searchParams.get('configKey')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId is required' },
        { status: 400 }
      )
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: user.id }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Build where clause
    let where: any = { projectId }
    if (configKey) {
      where.configKey = configKey
    }
    if (startDate || endDate) {
      where.lastFetchedAt = {}
      if (startDate) {
        where.lastFetchedAt.gte = new Date(startDate)
      }
      if (endDate) {
        where.lastFetchedAt.lte = new Date(endDate)
      }
    }

    // Get usage metrics
    const metrics = await prisma.configUsageMetric.findMany({
      where,
      orderBy: {
        lastFetchedAt: 'desc'
      }
    })

    // Aggregate statistics
    const stats = {
      totalFetches: metrics.reduce((sum, m) => sum + m.fetchCount, 0),
      uniqueDevices: new Set(metrics.filter(m => m.deviceId).map(m => m.deviceId)).size,
      uniqueUsers: new Set(metrics.filter(m => m.userId).map(m => m.userId)).size,
      cacheHitRate: metrics.length > 0
        ? metrics.filter(m => m.cacheHit).length / metrics.length
        : 0,
      targetingMatchRate: metrics.length > 0
        ? metrics.filter(m => m.targetingMatched).length / metrics.length
        : 0,
      rolloutReceiveRate: metrics.length > 0
        ? metrics.filter(m => m.rolloutReceived).length / metrics.length
        : 0
    }

    // Group by config key
    const byConfigKey = metrics.reduce((acc, m) => {
      if (!acc[m.configKey]) {
        acc[m.configKey] = {
          configKey: m.configKey,
          totalFetches: 0,
          uniqueDevices: new Set<string>(),
          uniqueUsers: new Set<string>(),
          cacheHits: 0,
          targetingMatches: 0,
          rolloutReceives: 0
        }
      }
      acc[m.configKey].totalFetches += m.fetchCount
      if (m.deviceId) acc[m.configKey].uniqueDevices.add(m.deviceId)
      if (m.userId) acc[m.configKey].uniqueUsers.add(m.userId)
      if (m.cacheHit) acc[m.configKey].cacheHits++
      if (m.targetingMatched) acc[m.configKey].targetingMatches++
      if (m.rolloutReceived) acc[m.configKey].rolloutReceives++
      return acc
    }, {} as Record<string, any>)

    // Convert sets to counts
    Object.keys(byConfigKey).forEach(key => {
      byConfigKey[key].uniqueDevices = byConfigKey[key].uniqueDevices.size
      byConfigKey[key].uniqueUsers = byConfigKey[key].uniqueUsers.size
    })

    return NextResponse.json({
      stats,
      byConfigKey: Object.values(byConfigKey),
      metrics: metrics.slice(0, 100) // Limit to recent 100
    })
  } catch (error) {
    console.error('Get config analytics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

