import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseDeviceQuery, buildDeviceWhere } from '@/lib/deviceQuery'

/**
 * GET /api/projects/:projectId/devices/export
 * 
 * Exports devices as CSV based on current filters
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

    // Sorting
    const orderBy: any = {}
    if (query.sort?.field) {
      orderBy[query.sort.field] = query.sort.dir || 'desc'
    } else {
      orderBy.lastSeenAt = 'desc'
    }

    // Fetch all devices (no pagination for export)
    const devices = await prisma.device.findMany({
      where,
      orderBy,
      take: 10000, // Max export limit
      select: {
        deviceId: true,
        platform: true,
        environment: true,
        osVersion: true,
        appVersion: true,
        model: true,
        manufacturer: true,
        deviceCode: true,
        lastSeenAt: true,
        createdAt: true,
        debugModeEnabled: true,
        userId: true,
        userEmail: true,
        userName: true,
        status: true,
      },
    })

    // Generate CSV
    const headers = [
      'Device ID',
      'Platform',
      'Environment',
      'OS Version',
      'App Version',
      'Model',
      'Manufacturer',
      'Device Code',
      'Last Seen',
      'Created',
      'Debug Enabled',
      'User ID',
      'User Email',
      'User Name',
      'Status',
    ]

    const rows = devices.map(d => [
      d.deviceId,
      d.platform,
      d.environment,
      d.osVersion || '',
      d.appVersion || '',
      d.model || '',
      d.manufacturer || '',
      d.deviceCode || '',
      d.lastSeenAt.toISOString(),
      d.createdAt.toISOString(),
      d.debugModeEnabled ? 'Yes' : 'No',
      d.userId || '',
      d.userEmail || '',
      d.userName || '',
      d.status,
    ])

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="devices_${new Date().toISOString()}.csv"`,
      },
    })
  } catch (error) {
    console.error('Error exporting devices:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

