import { prisma } from './prisma'
import { getPlan } from './plan'
import { createHistoryRecord } from './subscription-history'
import { expireSubscription } from './subscription'
import { stripe, getOrCreateCustomer, chargePaymentMethod } from './stripe'

/**
 * Check if Free Plan should be renewed
 */
export function shouldRenewFreePlan(
  subscription: { trialEndDate: Date | null; status: string },
  plan: { price: number }
): boolean {
  // Paid plans are handled separately
  if (plan.price > 0) {
    return false
  }

  // If subscription is not active, don't renew
  if (subscription.status !== 'active') {
    return false
  }

  // If trialEndDate is null or far future, always renew (forever free)
  if (!subscription.trialEndDate || subscription.trialEndDate > new Date('2099-12-31')) {
    return true
  }

  // If trial expired, don't renew
  if (subscription.trialEndDate <= new Date()) {
    return false
  }

  // Trial still active, renew
  return true
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
 * Renew Free Plan subscription
 */
export async function renewFreePlan(subscriptionId: string): Promise<void> {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: { plan: true, user: true },
  })

  if (!subscription) {
    throw new Error(`Subscription ${subscriptionId} not found`)
  }

  const plan = subscription.plan

  // Check if should renew
  if (!shouldRenewFreePlan(subscription, plan)) {
    // Trial expired, expire subscription
    await expireSubscription(subscriptionId)
    return
  }

  // Calculate period end based on plan interval
  const intervalMonths = plan.interval === 'year' ? 12 : 1
  const newPeriodStart = subscription.currentPeriodEnd
  const newPeriodEnd = addMonths(newPeriodStart, intervalMonths)

  // Create history record for completed period
  await createHistoryRecord(subscriptionId, {
    userId: subscription.userId,
    planId: subscription.planId,
    periodStart: subscription.currentPeriodStart,
    periodEnd: subscription.currentPeriodEnd,
    status: 'completed',
    totalInvoiced: 0, // Free plan
    totalPaid: 0,
  })

  // Update subscription for new period
  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      currentPeriodStart: newPeriodStart,
      currentPeriodEnd: newPeriodEnd,
      subscriptionCount: { increment: 1 },
      // Status stays 'active'
      // enabled stays true
    },
  })
}

/**
 * Renew Paid Plan subscription (requires payment)
 * This will be called by the renewal cron job, which will handle payment separately
 */
export async function renewPaidPlan(subscriptionId: string): Promise<{
  success: boolean
  invoiceId?: string
  error?: string
}> {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: { plan: true, user: true },
  })

  if (!subscription) {
    throw new Error(`Subscription ${subscriptionId} not found`)
  }

  const plan = subscription.plan

  if (plan.price === 0) {
    // This is a free plan, use renewFreePlan instead
    await renewFreePlan(subscriptionId)
    return { success: true }
  }

  // Calculate period end based on plan interval
  const intervalMonths = plan.interval === 'year' ? 12 : 1
  const newPeriodStart = subscription.currentPeriodEnd
  const newPeriodEnd = addMonths(newPeriodStart, intervalMonths)

  // Calculate invoice amount (with discount if applicable)
  const invoiceAmount = subscription.discountedPrice || plan.price

  // Create invoice for new period
  const invoice = await prisma.invoice.create({
    data: {
      subscriptionId,
      invoiceNumber: `INV-${new Date().toISOString().split('T')[0]}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      status: 'draft',
      amount: invoiceAmount,
      currency: plan.currency || 'USD',
      periodStart: newPeriodStart,
      periodEnd: newPeriodEnd,
      dueDate: addMonths(newPeriodStart, intervalMonths), // Due date is period end
    },
  })

  // Attempt payment if Stripe is configured and user has payment method
  if (stripe && invoiceAmount > 0) {
    // Get user's default payment method
    const defaultPaymentMethod = await prisma.paymentMethod.findFirst({
      where: {
        userId: subscription.userId,
        isDefault: true,
      },
    })

    if (defaultPaymentMethod && defaultPaymentMethod.stripeCustomerId) {
      // Attempt payment
      const paymentResult = await chargePaymentMethod(
        defaultPaymentMethod.stripePaymentMethodId,
        defaultPaymentMethod.stripeCustomerId,
        invoiceAmount,
        plan.currency || 'USD',
        `${plan.displayName} - ${newPeriodStart.toISOString().split('T')[0]} to ${newPeriodEnd.toISOString().split('T')[0]}`
      )

      if (paymentResult.success && paymentResult.paymentIntentId) {
        // Payment succeeded - update invoice and renew subscription
        await prisma.invoice.update({
          where: { id: invoice.id },
          data: {
            status: 'paid',
            paidAt: new Date(),
            stripePaymentIntentId: paymentResult.paymentIntentId,
            paymentMethodId: defaultPaymentMethod.id,
          },
        })

        // Create history record for completed period
        await createHistoryRecord(subscriptionId, {
          userId: subscription.userId,
          planId: subscription.planId,
          periodStart: subscription.currentPeriodStart,
          periodEnd: subscription.currentPeriodEnd,
          status: 'completed',
          totalInvoiced: invoiceAmount,
          totalPaid: invoiceAmount,
        })

        // Update subscription for new period
        await prisma.subscription.update({
          where: { id: subscriptionId },
          data: {
            currentPeriodStart: newPeriodStart,
            currentPeriodEnd: newPeriodEnd,
            subscriptionCount: { increment: 1 },
            // Clear grace period fields if they were set
            gracePeriodEnd: null,
            gracePeriodReason: null,
            paymentRetryCount: 0,
            lastPaymentAttempt: null,
          },
        })

        return {
          success: true,
          invoiceId: invoice.id,
        }
      } else {
        // Payment failed - enter grace period
        const gracePeriodEnd = new Date()
        gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7) // 7 days grace period

        await prisma.invoice.update({
          where: { id: invoice.id },
          data: {
            status: 'open', // Unpaid
          },
        })

        await prisma.subscription.update({
          where: { id: subscriptionId },
          data: {
            gracePeriodEnd,
            gracePeriodReason: paymentResult.error || 'Payment failed',
            lastPaymentAttempt: new Date(),
            paymentRetryCount: 1,
          },
        })

        return {
          success: false,
          invoiceId: invoice.id,
          error: paymentResult.error || 'Payment failed',
        }
      }
    } else {
      // No payment method - enter grace period
      const gracePeriodEnd = new Date()
      gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7)

      await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          status: 'open',
        },
      })

      await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          gracePeriodEnd,
          gracePeriodReason: 'No payment method on file',
          lastPaymentAttempt: new Date(),
          paymentRetryCount: 0,
        },
      })

      return {
        success: false,
        invoiceId: invoice.id,
        error: 'No payment method on file',
      }
    }
  } else {
    // Stripe not configured or free plan - just create invoice
    return {
      success: true,
      invoiceId: invoice.id,
    }
  }
}

/**
 * Process subscription renewal (called by cron job)
 */
export async function processRenewal(subscriptionId: string): Promise<{
  success: boolean
  renewed: boolean
  error?: string
}> {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: { plan: true },
  })

  if (!subscription) {
    return { success: false, renewed: false, error: 'Subscription not found' }
  }

  const plan = subscription.plan

  try {
    if (plan.price === 0) {
      // Free Plan
      await renewFreePlan(subscriptionId)
      return { success: true, renewed: true }
    } else {
      // Paid Plan - payment will be handled separately
      const result = await renewPaidPlan(subscriptionId)
      return { success: result.success, renewed: result.success, error: result.error }
    }
  } catch (error) {
    console.error(`Error renewing subscription ${subscriptionId}:`, error)
    return {
      success: false,
      renewed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

