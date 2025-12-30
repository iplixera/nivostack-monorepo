import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhook events
 */
export async function POST(request: NextRequest) {
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 })
  }

  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  try {
    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent)
        break

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment intent succeeded:', paymentIntent.id)

  // Find invoice by payment intent ID
  const invoice = await prisma.invoice.findFirst({
    where: {
      stripePaymentIntentId: paymentIntent.id,
    } as any,
    include: {
      subscription: true,
    },
  })

  if (invoice) {
    // Update invoice status
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        status: 'paid',
      },
    })

    // Update subscription if needed
    if (invoice.subscription && invoice.subscription.status !== 'active') {
      await prisma.subscription.update({
        where: { id: invoice.subscriptionId },
        data: {
          status: 'active',
          enabled: true,
          gracePeriodEnd: null,
          gracePeriodReason: null,
        } as any,
      })
    }
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment intent failed:', paymentIntent.id)

  // Find invoice by payment intent ID
  const invoice = await prisma.invoice.findFirst({
    where: {
      stripePaymentIntentId: paymentIntent.id,
    } as any,
    include: {
      subscription: true,
    },
  })

  if (invoice && invoice.subscription) {
    // Update invoice status
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        status: 'open',
      },
    })

    // Enter grace period if not already in one
    if (!(invoice.subscription as any).gracePeriodEnd) {
      const gracePeriodEnd = new Date()
      gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7) // 7-day grace period

      await prisma.subscription.update({
        where: { id: invoice.subscriptionId },
        data: {
          gracePeriodEnd,
          gracePeriodReason: 'Payment failed',
          paymentRetryCount: { increment: 1 },
          lastPaymentAttempt: new Date(),
        } as any,
      })
    }
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Invoice payment succeeded:', invoice.id)
  // Handle invoice payment success if using Stripe subscriptions
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Invoice payment failed:', invoice.id)
  // Handle invoice payment failure if using Stripe subscriptions
}

