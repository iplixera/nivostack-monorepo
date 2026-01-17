import { NextRequest, NextResponse } from 'next/server'
import { enqueueHourlyAggregation } from '@/lib/aggregation/enqueue'

/**
 * POST /api/cron/hourly-aggregation
 * Vercel Cron Job endpoint for triggering hourly aggregation
 * Scheduled to run every hour: "0 * * * *"
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[Cron] Starting hourly aggregation...')

    // Enqueue hourly aggregation jobs for all projects
    const result = await enqueueHourlyAggregation()

    console.log(`[Cron] ✅ Hourly aggregation completed: ${result.enqueued} jobs enqueued`)

    return NextResponse.json({
      success: true,
      message: `Hourly aggregation triggered: ${result.enqueued} jobs enqueued`,
      enqueued: result.enqueued,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Cron] ❌ Hourly aggregation failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Hourly aggregation failed',
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/cron/hourly-aggregation
 * Health check endpoint for Vercel cron monitoring
 */
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    cron: 'hourly-aggregation',
    schedule: '0 * * * *', // Every hour
    description: 'Triggers hourly aggregation for all projects',
    timestamp: new Date().toISOString(),
  })
}
