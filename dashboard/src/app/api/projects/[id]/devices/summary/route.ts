import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseDeviceQuery, buildDeviceWhere, getNewDevicesCutoff } from '@/lib/deviceQuery'

/**
 * GET /api/projects/:projectId/devices/summary
 * 
 * Returns KPI cards and usage bar data for the Devices page.
 * Uses the same filter logic as the devices list to ensure consistency.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id
    const { searchParams } = new URL(request.url)
    const query = parseDeviceQuery(searchParams)

    // Build where clause using unified logic
    const where = buildDeviceWhere(query, projectId)
    
    // Get new devices cutoff
    const newDevicesCutoff = getNewDevicesCutoff(query)

    // Compute KPIs using the same filter context
    const [
      totalDevices,
      activeDevices,
      debugOnDevices,
      newDevices,
    ] = await Promise.all([
      // Total devices (in current filter context)
      prisma.device.count({ where }),
      
      // Active devices (already filtered by time range in where clause)
      prisma.device.count({ where }),
      
      // Debug enabled devices (in current filter context)
      prisma.device.count({
        where: { ...where, debugModeEnabled: true }
      }),
      
      // New devices (created within time range)
      newDevicesCutoff ? prisma.device.count({
        where: {
          ...where,
          createdAt: { gte: newDevicesCutoff }
        }
      }) : 0,
    ])

    // Usage limit (from project plan or default)
    // TODO: Add plan field to Project model or fetch from subscription service
    const usageLimit = 10000 // Default limit
    const usagePercent = Math.min(Math.round((totalDevices / usageLimit) * 100), 100)

    return NextResponse.json({
      kpis: {
        totalDevices,
        activeDevices,
        debugOnDevices,
        newDevices,
      },
      usage: {
        current: totalDevices,
        limit: usageLimit,
        percent: usagePercent,
      },
    })
  } catch (error) {
    console.error('Error fetching devices summary:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
