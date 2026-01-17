import { NextRequest, NextResponse } from 'next/server'
import { validateToken } from '@/lib/auth'
import { getSubscription } from '@/lib/subscription'
import { getPlan } from '@/lib/plan'
import { prisma } from '@/lib/prisma'
import { stripe, getOrCreateCustomer, createPaymentIntent, chargePaymentMethod } from '@/lib/stripe'

/**
 * POST /api/subscription/upgrade
 * Initiate plan upgrade with Stripe payment
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await validateToken(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { planId, paymentMethodId } = await request.json()

    if (!planId) {
      return NextResponse.json({ error: 'planId is required' }, { status: 400 })
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

    // Check if already on this plan
    if (currentSubscription.planId === planId) {
      return NextResponse.json({ error: 'Already subscribed to this plan' }, { status: 400 })
    }

    // Get user for email
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculate upgrade amount (prorated if mid-cycle, or full amount)
    const now = new Date()
    const daysRemaining = Math.ceil(
      (currentSubscription.currentPeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )
    const daysInPeriod = Math.ceil(
      (currentSubscription.currentPeriodEnd.getTime() - currentSubscription.currentPeriodStart.getTime()) / (1000 * 60 * 60 * 24)
    )

    // For now, charge full amount (can add proration later)
    const upgradeAmount = targetPlan.price

    // If free plan, no payment needed - just upgrade
    if (targetPlan.price === 0) {
      // Downgrade to free plan
      await prisma.subscription.update({
        where: { id: currentSubscription.id },
        data: {
          planId: targetPlan.id,
          // Reset period dates for free plan
          currentPeriodStart: now,
          currentPeriodEnd: addMonths(now, 1),
        },
      })

      return NextResponse.json({
        success: true,
        subscription: await getSubscription(userId),
        message: 'Plan upgraded successfully',
      })
    }

    // For paid plans, need payment
    if (!stripe) {
      return NextResponse.json({ error: 'Payment processing not available' }, { status: 503 })
    }

    // Get or create Stripe customer
    const customerId = await getOrCreateCustomer(userId, user.email, user.name || undefined)

    // If payment method provided, charge immediately
    if (paymentMethodId) {
      try {
        // Attach payment method to customer if not already attached
        if (customerId) {
          await stripe.paymentMethods.attach(paymentMethodId, {
            customer: customerId,
          })
        }

        // Set as default if no default exists
        if (customerId) {
          const customer = await stripe.customers.retrieve(customerId)
          if (customer && !('deleted' in customer) && !customer.invoice_settings?.default_payment_method) {
              await stripe.customers.update(customerId, {
              invoice_settings: {
                default_payment_method: paymentMethodId,
              },
            })
          }
        }

        // Charge the payment method
        if (!customerId) {
          return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 })
        }
        
        const chargeResult = await chargePaymentMethod(
          paymentMethodId,
          customerId,
          upgradeAmount,
          targetPlan.currency || 'usd',
          `DevBridge Plan Upgrade to ${targetPlan.displayName}`
        )

        if (!chargeResult.success) {
          return NextResponse.json(
            { error: chargeResult.error || 'Payment failed' },
            { status: 402 }
          )
        }

        // Payment succeeded - upgrade subscription
        await prisma.subscription.update({
          where: { id: currentSubscription.id },
          data: {
            planId: targetPlan.id,
            stripeCustomerId: customerId,
            currentPeriodStart: now,
            currentPeriodEnd: addMonths(now, targetPlan.interval === 'year' ? 12 : 1),
            status: 'active',
            enabled: true,
          } as any,
        })

        // Create invoice
        await prisma.invoice.create({
          data: {
            subscriptionId: currentSubscription.id,
            invoiceNumber: `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            status: 'paid',
            amount: upgradeAmount,
            currency: targetPlan.currency || 'USD',
            periodStart: now,
            periodEnd: addMonths(now, targetPlan.interval === 'year' ? 12 : 1),
            dueDate: addMonths(now, targetPlan.interval === 'year' ? 12 : 1),
            stripePaymentIntentId: chargeResult.paymentIntentId || null,
          } as any,
        })

        return NextResponse.json({
          success: true,
          subscription: await getSubscription(userId),
          paymentIntentId: chargeResult.paymentIntentId,
          message: 'Plan upgraded successfully',
        })
      } catch (error: any) {
        console.error('Payment error:', error)
        return NextResponse.json(
          { error: error.message || 'Payment processing failed' },
          { status: 402 }
        )
      }
    } else {
      // No payment method provided - create payment intent for frontend confirmation
      if (!customerId) {
        return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 })
      }
      
      const paymentIntent = await createPaymentIntent(
        customerId,
        upgradeAmount,
        targetPlan.currency || 'usd'
      )

      if (!paymentIntent) {
        return NextResponse.json({ error: 'Failed to create payment intent' }, { status: 500 })
      }

      return NextResponse.json({
        success: false,
        requiresPayment: true,
        paymentIntent: {
          id: paymentIntent.id,
          clientSecret: paymentIntent.client_secret,
          amount: upgradeAmount,
          currency: targetPlan.currency || 'usd',
        },
        plan: {
          id: targetPlan.id,
          name: targetPlan.name,
          displayName: targetPlan.displayName,
          price: targetPlan.price,
        },
        message: 'Payment method required to complete upgrade',
      })
    }
  } catch (error) {
    console.error('Upgrade subscription error:', error)
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

