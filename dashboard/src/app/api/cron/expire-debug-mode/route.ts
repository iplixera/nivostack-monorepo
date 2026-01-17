import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Vercel Cron Job: Expire debug mode for devices past their expiry time
// Runs every hour to disable debug mode for devices where debugModeExpiresAt < now
export async function GET(request: NextRequest) {
  try {
    // Verify this is called by Vercel Cron (or allow in development)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    // In production, verify the cron secret
    if (process.env.NODE_ENV === 'production' && cronSecret) {
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
    }

    const now = new Date()

    // Find all devices with expired debug mode
    const expiredDevices = await prisma.device.findMany({
      where: {
        debugModeEnabled: true,
        debugModeExpiresAt: {
          lt: now
        }
      },
      select: {
        id: true,
        deviceCode: true,
        projectId: true,
        debugModeExpiresAt: true
      }
    })

    if (expiredDevices.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No expired debug modes found',
        expiredCount: 0,
        timestamp: now.toISOString()
      })
    }

    // Disable debug mode for all expired devices
    const result = await prisma.device.updateMany({
      where: {
        debugModeEnabled: true,
        debugModeExpiresAt: {
          lt: now
        }
      },
      data: {
        debugModeEnabled: false
      }
    })

    // Log the expiration for debugging
    console.log(`[Cron] Debug mode expired for ${result.count} devices:`,
      expiredDevices.map(d => ({
        deviceCode: d.deviceCode,
        projectId: d.projectId,
        expiredAt: d.debugModeExpiresAt
      }))
    )

    return NextResponse.json({
      success: true,
      message: `Disabled debug mode for ${result.count} expired devices`,
      expiredCount: result.count,
      expiredDevices: expiredDevices.map(d => ({
        id: d.id,
        deviceCode: d.deviceCode,
        projectId: d.projectId
      })),
      timestamp: now.toISOString()
    })
  } catch (error) {
    console.error('[Cron] Debug mode expiry error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}

// Also support POST for manual triggering from dashboard
export async function POST(request: NextRequest) {
  return GET(request)
}
