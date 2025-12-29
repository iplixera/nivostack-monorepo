import { NextRequest, NextResponse } from 'next/server'
import { getPublicPlans } from '@/lib/plan'

/**
 * GET /api/plans
 * Get all public plans (for pricing page)
 * No authentication required - public endpoint
 */
export async function GET(request: NextRequest) {
  try {
    const plans = await getPublicPlans()
    return NextResponse.json({ plans })
  } catch (error) {
    console.error('Get plans error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

