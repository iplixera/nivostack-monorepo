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
      // Return empty/default usage stats instead of 404
      return NextResponse.json({ 
        usage: {
          mockEndpoints: { used: 0, limit: null, percentage: 0 },
          apiEndpoints: { used: 0, limit: null, percentage: 0 },
          apiRequests: { used: 0, limit: null, percentage: 0 },
          logs: { used: 0, limit: null, percentage: 0 },
          sessions: { used: 0, limit: null, percentage: 0 },
          crashes: { used: 0, limit: null, percentage: 0 },
          devices: { used: 0, limit: null, percentage: 0 },
          projects: { used: 0, limit: null, percentage: 0 },
          businessConfigKeys: { used: 0, limit: null, percentage: 0 },
          localizationLanguages: { used: 0, limit: null, percentage: 0 },
          localizationKeys: { used: 0, limit: null, percentage: 0 },
          teamMembers: { used: 0, limit: null, percentage: 0 },
          trialActive: false,
          trialEndDate: new Date().toISOString(),
          currentPeriodStart: new Date().toISOString(),
          currentPeriodEnd: new Date().toISOString(),
          daysRemaining: 0,
        }
      })
    }

    return NextResponse.json({ usage })
  } catch (error) {
    console.error('Get usage stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

