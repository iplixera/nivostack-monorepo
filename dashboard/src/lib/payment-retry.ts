import { prisma } from './prisma'
import { stripe, chargePaymentMethod } from './stripe'
import { createHistoryRecord } from './subscription-history'

/**
 * Add days to a date
 */
function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/**
 * Add months to a date
 */
function addMonths(date: Date, months: number): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

/**
 * Enter grace period for a subscription
 */
export async function enterGracePeriod(
  subscriptionId: string,
  options: {
    invoiceId: string
    gracePeriodEnd: Date
    paymentFailureReason: string
  }
): Promise<void> {
  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      gracePeriodEnd: options.gracePeriodEnd,
      gracePeriodReason: options.paymentFailureReason,
      lastPaymentAttempt: new Date(),
      paymentRetryCount: { increment: 1 },
      // Status stays 'active' during grace period
    } as any,
  })
}

/**
 * Suspend subscription due to payment failure
 */
export async function suspendSubscription(
  subscriptionId: string,
  reason: string
): Promise<void> {
  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      status: 'suspended',
      gracePeriodEnd: null,
      gracePeriodReason: reason,
    } as any,
  })
}

/**
 * Retry failed payment for a subscription
 */
export async function retryFailedPayment(subscriptionId: string): Promise<{
  success: boolean
  error?: string
}> {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: {
      plan: true,
      user: true,
      invoices: {
        where: { status: 'open' },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  })

  if (!subscription) {
    return { success: false, error: 'Subscription not found' }
  }

  const invoice = subscription.invoices[0]
  if (!invoice) {
    return { success: false, error: 'No unpaid invoice found' }
  }

  // Get default payment method
  // TODO: PaymentMethod model needs to be added to Prisma schema
  const defaultPaymentMethod = await (prisma as any).paymentMethod.findFirst({
    where: {
      userId: subscription.userId,
      isDefault: true,
    },
  })

  if (!defaultPaymentMethod || !defaultPaymentMethod.stripeCustomerId) {
    return { success: false, error: 'No payment method found' }
  }

  if (!stripe) {
    return { success: false, error: 'Stripe is not configured' }
  }

  // Attempt payment
  const paymentResult = await chargePaymentMethod(
    defaultPaymentMethod.stripePaymentMethodId,
    defaultPaymentMethod.stripeCustomerId,
    invoice.amount,
    invoice.currency,
    `DevBridge ${subscription.plan.displayName} - Retry Payment`
  )

  if (paymentResult.success && paymentResult.paymentIntentId) {
    // Payment succeeded
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        status: 'paid',
        paidAt: new Date(),
        stripePaymentIntentId: paymentResult.paymentIntentId,
        paymentMethodId: defaultPaymentMethod.id,
      } as any,
    })

    // Create history record for completed period
    await createHistoryRecord(subscriptionId, {
      userId: subscription.userId,
      planId: subscription.planId,
      periodStart: subscription.currentPeriodStart,
      periodEnd: subscription.currentPeriodEnd,
      status: 'completed',
      totalInvoiced: invoice.amount,
      totalPaid: invoice.amount,
    })

    // Renew subscription
    const intervalMonths = subscription.plan.interval === 'year' ? 12 : 1
    const newPeriodStart = subscription.currentPeriodEnd
    const newPeriodEnd = addMonths(newPeriodStart, intervalMonths)

    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        currentPeriodStart: newPeriodStart,
        currentPeriodEnd: newPeriodEnd,
        subscriptionCount: { increment: 1 },
        gracePeriodEnd: null,
        gracePeriodReason: null,
        paymentRetryCount: 0,
        lastPaymentAttempt: new Date(),
      } as any,
    })

    return { success: true }
  } else {
    // Payment still failed
    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        lastPaymentAttempt: new Date(),
        paymentRetryCount: { increment: 1 },
      } as any,
    })

    return {
      success: false,
      error: paymentResult.error || 'Payment failed',
    }
  }
}

