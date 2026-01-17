import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { getHistoryByUserId } from '@/lib/subscription-history'

/**
 * GET /api/subscription/history
 * Get subscription history for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const history = await getHistoryByUserId(payload.userId)

    return NextResponse.json({ history })
  } catch (error) {
    console.error('Get subscription history error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

