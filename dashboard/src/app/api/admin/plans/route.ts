import { NextRequest, NextResponse } from 'next/server'
import { validateAdmin } from '@/lib/auth'
import { getAllPlans, createPlan } from '@/lib/admin'

/**
 * GET /api/admin/plans
 * Get all plans (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const admin = await validateAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 })
    }

    const plans = await getAllPlans()
    return NextResponse.json({ plans })
  } catch (error) {
    console.error('Get plans error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error('Error details:', { errorMessage, errorStack })
    return NextResponse.json(
      { error: errorMessage, details: process.env.NODE_ENV === 'development' ? errorStack : undefined },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/plans
 * Create a new plan (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const admin = await validateAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    
    // Validate required fields
    if (!body.name || !body.displayName || body.price === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: name, displayName, price' },
        { status: 400 }
      )
    }

    // Check if plan name already exists
    const existingPlan = await getAllPlans()
    if (existingPlan.some(p => p.name === body.name)) {
      return NextResponse.json(
        { error: `Plan with name "${body.name}" already exists` },
        { status: 409 }
      )
    }

    const plan = await createPlan(body)
    return NextResponse.json({ plan }, { status: 201 })
  } catch (error) {
    console.error('Create plan error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

