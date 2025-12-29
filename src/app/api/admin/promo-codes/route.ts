import { NextRequest, NextResponse } from 'next/server'
import { validateAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/admin/promo-codes
 * Get all promo codes (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const admin = await validateAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 })
    }

    const promoCodes = await prisma.promoCode.findMany({
      include: {
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ promoCodes })
  } catch (error) {
    console.error('Get promo codes error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/admin/promo-codes
 * Create a new promo code (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const admin = await validateAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const {
      code,
      description,
      discountType,
      discountValue,
      maxUses,
      validFrom,
      validUntil,
      applicablePlans,
      minPlanPrice,
      isActive,
    } = body

    if (!code || !discountType || discountValue === undefined) {
      return NextResponse.json(
        { error: 'code, discountType, and discountValue are required' },
        { status: 400 }
      )
    }

    if (discountType === 'percent' && (discountValue < 0 || discountValue > 100)) {
      return NextResponse.json(
        { error: 'Percentage discount must be between 0 and 100' },
        { status: 400 }
      )
    }

    if (discountType === 'fixed' && discountValue < 0) {
      return NextResponse.json(
        { error: 'Fixed discount must be positive' },
        { status: 400 }
      )
    }

    // Check if code already exists
    const existing = await prisma.promoCode.findUnique({
      where: { code },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Promo code already exists' },
        { status: 409 }
      )
    }

    const promoCode = await prisma.promoCode.create({
      data: {
        code: code.toUpperCase(),
        description,
        discountType,
        discountValue,
        maxUses: maxUses || null,
        validFrom: validFrom ? new Date(validFrom) : new Date(),
        validUntil: validUntil ? new Date(validUntil) : null,
        applicablePlans: applicablePlans || [],
        minPlanPrice: minPlanPrice || null,
        isActive: isActive !== undefined ? isActive : true,
      },
    })

    return NextResponse.json({ promoCode }, { status: 201 })
  } catch (error) {
    console.error('Create promo code error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

