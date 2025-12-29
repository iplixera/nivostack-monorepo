import { NextRequest, NextResponse } from 'next/server'
import { validateAdmin } from '@/lib/auth'
import { getForecastMetrics } from '@/lib/forecasting'

/**
 * GET /api/admin/forecast
 * Get forecasting metrics
 */
export async function GET(request: NextRequest) {
  try {
    const admin = await validateAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 })
    }

    const forecast = await getForecastMetrics()

    return NextResponse.json({ forecast })
  } catch (error) {
    console.error('Get forecast error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

