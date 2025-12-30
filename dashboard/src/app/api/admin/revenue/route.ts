import { NextRequest, NextResponse } from 'next/server'
import { validateAdmin } from '@/lib/auth'
import { getRevenueStats } from '@/lib/admin'

/**
 * GET /api/admin/revenue
 * Get revenue statistics (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const admin = await validateAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 })
    }

    const revenue = await getRevenueStats()
    return NextResponse.json({ revenue })
  } catch (error) {
    console.error('Get revenue error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

