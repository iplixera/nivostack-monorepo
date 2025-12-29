import { NextRequest, NextResponse } from 'next/server'
import { validateToken } from '@/lib/auth'
import { getUsageStats } from '@/lib/subscription'

/**
 * GET /api/subscription/usage
 * Get usage statistics for current user's subscription
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await validateToken(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const usage = await getUsageStats(userId)
    if (!usage) {
      return NextResponse.json({ error: 'Usage stats not found' }, { status: 404 })
    }

    return NextResponse.json({ usage })
  } catch (error) {
    console.error('Get usage stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

