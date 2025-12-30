import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

/**
 * GET /api/devices/export
 * Export device data as CSV or JSON
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const format = searchParams.get('format') || 'json' // 'json' or 'csv'

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
    }

    // Verify user owns the project
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: user.id }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Fetch all devices for the project
    const devices = await prisma.device.findMany({
      where: { projectId },
      select: {
        id: true,
        deviceId: true,
        deviceCode: true,
        platform: true,
        osVersion: true,
        appVersion: true,
        model: true,
        manufacturer: true,
        // TODO: The following fields need to be added to Device model
        // deviceCategory, deviceBrand, locale, language, timeZone, timeZoneOffset,
        // advertisingId, vendorId, limitedAdTracking, appId, appInstanceId,
        // firstOpenAt, firstPurchaseAt, userId, userEmail, userName,
        // debugModeEnabled, debugModeExpiresAt, fingerprint, batteryLevel,
        // storageFree, memoryTotal, networkType, screenWidth, screenHeight,
        // screenDensity, cpuArchitecture, tags, state
        lastSeenAt: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    if (format === 'csv') {
      // Convert to CSV
      const headers = [
        'ID',
        'Device ID',
        'Device Code',
        'Platform',
        'OS Version',
        'App Version',
        'Model',
        'Manufacturer',
        'Device Category',
        'Device Brand',
        'Locale',
        'Language',
        'Timezone',
        'Timezone Offset',
        'App ID',
        'App Instance ID',
        'Advertising ID',
        'Vendor ID',
        'Limited Ad Tracking',
        'User ID',
        'User Email',
        'User Name',
        'Debug Mode',
        'Debug Expires',
        'Fingerprint',
        'Battery Level',
        'Storage Free (bytes)',
        'Memory Total (bytes)',
        'Network Type',
        'Screen Width',
        'Screen Height',
        'Screen Density',
        'CPU Architecture',
        'Tags',
        'State',
        'First Open',
        'First Purchase',
        'Last Seen',
        'Created At'
      ]

      const rows = devices.map(device => [
        device.id,
        device.deviceId,
        device.deviceCode || '',
        device.platform,
        device.osVersion || '',
        device.appVersion || '',
        device.model || '',
        device.manufacturer || '',
        (device as any).deviceCategory || '',
        (device as any).deviceBrand || '',
        (device as any).locale || '',
        (device as any).language || '',
        (device as any).timeZone || '',
        (device as any).timeZoneOffset?.toString() || '',
        (device as any).appId || '',
        (device as any).appInstanceId || '',
        (device as any).advertisingId || '',
        (device as any).vendorId || '',
        (device as any).limitedAdTracking ? 'Yes' : 'No',
        (device as any).userId || '',
        (device as any).userEmail || '',
        (device as any).userName || '',
        (device as any).debugModeEnabled ? 'Yes' : 'No',
        (device as any).debugModeExpiresAt?.toISOString() || '',
        (device as any).fingerprint || '',
        (device as any).batteryLevel?.toString() || '',
        (device as any).storageFree?.toString() || '',
        (device as any).memoryTotal?.toString() || '',
        (device as any).networkType || '',
        (device as any).screenWidth?.toString() || '',
        (device as any).screenHeight?.toString() || '',
        (device as any).screenDensity?.toString() || '',
        (device as any).cpuArchitecture || '',
        ((device as any).tags || []).join(';') || '',
        (device as any).state || '',
        (device as any).firstOpenAt?.toISOString() || '',
        (device as any).firstPurchaseAt?.toISOString() || '',
        device.lastSeenAt.toISOString(),
        device.createdAt.toISOString()
      ])

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n')

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="devices-${projectId}-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    } else {
      // Return JSON
      return NextResponse.json({
        projectId,
        exportedAt: new Date().toISOString(),
        count: devices.length,
        devices
      }, {
        headers: {
          'Content-Disposition': `attachment; filename="devices-${projectId}-${new Date().toISOString().split('T')[0]}.json"`
        }
      })
    }
  } catch (error) {
    console.error('Export devices error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

