import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/stats/devices
 * Returns aggregated device statistics for a project
 *
 * Query params:
 * - projectId: string (required)
 * - timeRange: string (optional) - 'last_15m', 'last_1h', 'last_24h', 'last_7d', 'last_30d', 'all'
 * - environment: string (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const timeRange = searchParams.get('timeRange') || 'last_24h'
    const environment = searchParams.get('environment')

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
    }

    // Calculate time range
    const now = new Date()
    let startDate: Date | undefined

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
      case 'all':
      default:
        startDate = undefined
    }

    // Build base where clause
    const baseWhere = {
      projectId,
      status: 'active',
    }

    // Total devices (all-time)
    const totalDevices = await prisma.device.count({
      where: baseWhere,
    })

    // Active devices (within time range)
    const activeDevices = await prisma.device.count({
      where: {
        ...baseWhere,
        ...(startDate && { lastSeenAt: { gte: startDate } }),
      },
    })

    // Debug enabled devices
    const debugEnabled = await prisma.device.count({
      where: {
        ...baseWhere,
        debugModeEnabled: true,
      },
    })

    // New devices (first seen within time range)
    const newDevices = startDate
      ? await prisma.device.count({
          where: {
            ...baseWhere,
            createdAt: { gte: startDate },
          },
        })
      : totalDevices

    // Platform distribution
    const platformDistribution = await prisma.device.groupBy({
      by: ['platform'],
      where: baseWhere,
      _count: { platform: true },
      orderBy: { _count: { platform: 'desc' } },
    })

    // OS version distribution (top 10)
    const osVersionDistribution = await prisma.device.groupBy({
      by: ['osVersion'],
      where: {
        ...baseWhere,
        osVersion: { not: null },
      },
      _count: { osVersion: true },
      orderBy: { _count: { osVersion: 'desc' } },
      take: 10,
    })

    // App version distribution (top 10)
    const appVersionDistribution = await prisma.device.groupBy({
      by: ['appVersion'],
      where: {
        ...baseWhere,
        appVersion: { not: null },
      },
      _count: { appVersion: true },
      orderBy: { _count: { appVersion: 'desc' } },
      take: 10,
    })

    // Model distribution (top 10)
    const modelDistribution = await prisma.device.groupBy({
      by: ['model'],
      where: {
        ...baseWhere,
        model: { not: null },
      },
      _count: { model: true },
      orderBy: { _count: { model: 'desc' } },
      take: 10,
    })

    return NextResponse.json({
      kpis: {
        totalDevices,
        activeDevices,
        debugEnabled,
        newDevices,
      },
      segmentation: {
        platform: platformDistribution.map((p) => ({
          label: p.platform,
          value: p.platform.toLowerCase(),
          count: p._count.platform,
        })),
        osVersion: osVersionDistribution.map((o) => ({
          label: o.osVersion || 'Unknown',
          value: o.osVersion || 'unknown',
          count: o._count.osVersion,
        })),
        appVersion: appVersionDistribution.map((a) => ({
          label: a.appVersion || 'Unknown',
          value: a.appVersion || 'unknown',
          count: a._count.appVersion,
        })),
        model: modelDistribution.map((m) => ({
          label: m.model || 'Unknown',
          value: m.model || 'unknown',
          count: m._count.model,
        })),
      },
      timeRange,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching device stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch device statistics' },
      { status: 500 }
    )
  }
}
