import { NextRequest, NextResponse } from 'next/server'
import { enqueueDailyAggregation } from '@/lib/aggregation/enqueue'

/**
 * POST /api/cron/daily-aggregation
 * Vercel Cron Job endpoint for triggering daily aggregation
 * Scheduled to run daily at midnight: "0 0 * * *"
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[Cron] Starting daily aggregation...')

    // Enqueue daily aggregation jobs for all projects
    const result = await enqueueDailyAggregation()

    console.log(`[Cron] ✅ Daily aggregation completed: ${result.enqueued} jobs enqueued`)

    return NextResponse.json({
      success: true,
      message: `Daily aggregation triggered: ${result.enqueued} jobs enqueued`,
      enqueued: result.enqueued,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Cron] ❌ Daily aggregation failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Daily aggregation failed',
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/cron/daily-aggregation
 * Health check endpoint for Vercel cron monitoring
 */
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    cron: 'daily-aggregation',
    schedule: '0 0 * * *', // Daily at midnight
    description: 'Triggers daily aggregation for all projects',
    timestamp: new Date().toISOString(),
  })
}
