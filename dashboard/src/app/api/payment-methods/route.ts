import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe, getOrCreateCustomer, attachPaymentMethod, listPaymentMethods } from '@/lib/stripe'

/**
 * GET /api/payment-methods
 * List all payment methods for the authenticated user
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

    // TODO: PaymentMethod model needs to be added to Prisma schema
    return NextResponse.json({ paymentMethods: [] })
    
    /* COMMENTED OUT UNTIL PAYMENTMETHOD MODEL IS ADDED
    // Get user's payment methods from database
    const paymentMethods = await (prisma as any).paymentMethod.findMany({
      where: { userId: payload.userId },
      orderBy: { isDefault: 'desc', createdAt: 'desc' },
    })

    // If Stripe is configured, enrich with Stripe data
    if (stripe && paymentMethods.length > 0) {
      // Get Stripe customer ID (from first payment method or create)
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { email: true, name: true },
      })

      if (user) {
        const customerId = await getOrCreateCustomer(payload.userId, user.email, user.name || undefined)
        if (customerId) {
          const stripePaymentMethods = await listPaymentMethods(customerId)
          // Merge Stripe data with database records
          const enriched = paymentMethods.map(pm => {
            const stripePm = stripePaymentMethods.find(spm => spm.id === pm.stripePaymentMethodId)
            return {
              ...pm,
              stripe: stripePm ? {
                brand: stripePm.card?.brand,
                last4: stripePm.card?.last4,
                expMonth: stripePm.card?.exp_month,
                expYear: stripePm.card?.exp_year,
              } : null,
            }
          })
          return NextResponse.json({ paymentMethods: enriched })
        }
      }
    }

    return NextResponse.json({ paymentMethods })
    */
  } catch (error) {
    console.error('Get payment methods error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/payment-methods
 * Add a new payment method
 */
export async function POST(request: NextRequest) {
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

    const { paymentMethodId, isDefault } = await request.json()

    if (!paymentMethodId) {
      return NextResponse.json({ error: 'paymentMethodId is required' }, { status: 400 })
    }

    if (!stripe) {
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { email: true, name: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get or create Stripe customer
    const customerId = await getOrCreateCustomer(payload.userId, user.email, user.name || undefined)
    if (!customerId) {
      return NextResponse.json({ error: 'Failed to create Stripe customer' }, { status: 500 })
    }

    // Attach payment method to customer
    const paymentMethod = await attachPaymentMethod(paymentMethodId, customerId)
    if (!paymentMethod) {
      return NextResponse.json({ error: 'Failed to attach payment method' }, { status: 500 })
    }

    // TODO: PaymentMethod model needs to be added to Prisma schema
    return NextResponse.json({ error: 'PaymentMethod model not yet implemented' }, { status: 500 })
    
    /* COMMENTED OUT UNTIL PAYMENTMETHOD MODEL IS ADDED
    // If this is set as default, unset other defaults
    if (isDefault) {
      await (prisma as any).paymentMethod.updateMany({
        where: { userId: payload.userId, isDefault: true },
        data: { isDefault: false },
      })
    }

    // Save payment method to database
    const savedPaymentMethod = await (prisma as any).paymentMethod.create({
      data: {
        userId: payload.userId,
        stripePaymentMethodId: paymentMethod.id,
        stripeCustomerId: customerId,
        type: paymentMethod.type,
        last4: paymentMethod.card?.last4 || null,
        brand: paymentMethod.card?.brand || null,
        expMonth: paymentMethod.card?.exp_month || null,
        expYear: paymentMethod.card?.exp_year || null,
        country: paymentMethod.card?.country || null,
        isDefault: isDefault || false,
      },
    })

    return NextResponse.json({ paymentMethod: savedPaymentMethod })
    */
  } catch (error) {
    console.error('Create payment method error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

