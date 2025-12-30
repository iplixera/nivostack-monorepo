import { NextRequest, NextResponse } from 'next/server'
import { validateToken } from '@/lib/auth'
import { getSubscription } from '@/lib/subscription'
import { getPlan } from '@/lib/plan'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

/**
 * POST /api/subscription/confirm-upgrade
 * Confirm plan upgrade after payment intent succeeds
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await validateToken(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { paymentIntentId, planId } = await request.json()

    if (!paymentIntentId || !planId) {
      return NextResponse.json({ error: 'paymentIntentId and planId are required' }, { status: 400 })
    }

    if (!stripe) {
      return NextResponse.json({ error: 'Payment processing not available' }, { status: 503 })
    }

    // Verify payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: `Payment not completed. Status: ${paymentIntent.status}` },
        { status: 402 }
      )
    }

    // Get current subscription
    const currentSubscription = await getSubscription(userId)
    if (!currentSubscription) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 })
    }

    // Get target plan
    const targetPlan = await getPlan(planId)
    if (!targetPlan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    // Verify payment intent amount matches plan price
    const expectedAmount = Math.round(targetPlan.price * 100) // Convert to cents
    if (paymentIntent.amount !== expectedAmount) {
      return NextResponse.json(
        { error: 'Payment amount mismatch' },
        { status: 400 }
      )
    }

    const now = new Date()

    // Upgrade subscription
    await prisma.subscription.update({
      where: { id: currentSubscription.id },
      data: {
        planId: targetPlan.id,
        stripeCustomerId: paymentIntent.customer as string,
        currentPeriodStart: now,
        currentPeriodEnd: addMonths(now, targetPlan.interval === 'year' ? 12 : 1),
        status: 'active',
        enabled: true,
      },
    })

    // Create invoice
    await prisma.invoice.create({
      data: {
        subscriptionId: currentSubscription.id,
        invoiceNumber: `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        status: 'paid',
        amount: targetPlan.price,
        currency: targetPlan.currency || 'USD',
        periodStart: now,
        periodEnd: addMonths(now, targetPlan.interval === 'year' ? 12 : 1),
        dueDate: addMonths(now, targetPlan.interval === 'year' ? 12 : 1),
        stripePaymentIntentId: paymentIntentId,
      },
    })

    return NextResponse.json({
      success: true,
      subscription: await getSubscription(userId),
      message: 'Plan upgraded successfully',
    })
  } catch (error) {
    console.error('Confirm upgrade error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

