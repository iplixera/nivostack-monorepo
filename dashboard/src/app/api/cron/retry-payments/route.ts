import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { retryFailedPayment, suspendSubscription } from '@/lib/payment-retry'

// Verify cron secret (set in Vercel environment variables)
const CRON_SECRET = process.env.CRON_SECRET

/**
 * POST /api/cron/retry-payments
 * 
 * Cron job to retry failed payments for subscriptions in grace period.
 * Runs daily at 2 AM UTC.
 * 
 * Process:
 * 1. Find subscriptions in grace period with unpaid invoices
 * 2. Retry payment for each subscription
 * 3. If payment succeeds, renew subscription
 * 4. If grace period expired, suspend subscription
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    
    // Find subscriptions in grace period with unpaid invoices
    const subscriptions = await prisma.subscription.findMany({
      where: {
        status: 'active',
        enabled: true,
        // TODO: gracePeriodEnd field needs to be added to Subscription model
        // Temporarily using currentPeriodEnd as fallback
        currentPeriodEnd: {
          lte: addDays(now, 1), // Within 24 hours of expiry or expired
        },
        invoices: {
          some: {
            status: 'open',
            dueDate: { lte: now },
          },
        },
      },
      include: {
        invoices: {
          where: { status: 'open' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

    console.log(`Found ${subscriptions.length} subscriptions in grace period`)

    let retriedCount = 0
    let succeededCount = 0
    let suspendedCount = 0
    let errorCount = 0
    const errors: string[] = []

    for (const subscription of subscriptions) {
      try {
        // Check if grace period expired (using currentPeriodEnd as fallback)
        const gracePeriodEnd = (subscription as any).gracePeriodEnd || subscription.currentPeriodEnd
        if (gracePeriodEnd && gracePeriodEnd <= now) {
          // Grace period expired - suspend subscription
          await suspendSubscription(
            subscription.id,
            `Payment failure - grace period expired on ${gracePeriodEnd.toISOString()}`
          )
          suspendedCount++
          console.log(`Suspended subscription ${subscription.id} - grace period expired`)
          continue
        }

        // Don't retry more than once per day
        const lastPaymentAttempt = (subscription as any).lastPaymentAttempt
        if (lastPaymentAttempt) {
          const hoursSinceLastAttempt = (now.getTime() - lastPaymentAttempt.getTime()) / (1000 * 60 * 60)
          if (hoursSinceLastAttempt < 24) {
            continue // Skip if retried within last 24 hours
          }
        }

        // Retry payment
        const result = await retryFailedPayment(subscription.id)

        if (result.success) {
          succeededCount++
          retriedCount++
          console.log(`Payment succeeded for subscription ${subscription.id}`)
        } else {
          retriedCount++
          const errorMsg = `Payment retry failed for subscription ${subscription.id}: ${result.error}`
          errors.push(errorMsg)
          console.error(errorMsg)
        }
      } catch (error) {
        errorCount++
        const errorMsg = `Error processing subscription ${subscription.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
        errors.push(errorMsg)
        console.error(errorMsg)
      }
    }

    return NextResponse.json({
      success: true,
      processed: subscriptions.length,
      retried: retriedCount,
      succeeded: succeededCount,
      suspended: suspendedCount,
      errors: errorCount,
      errorDetails: errors.length > 0 ? errors : undefined,
      message: `Processed ${subscriptions.length} subscriptions: ${retriedCount} retried, ${succeededCount} succeeded, ${suspendedCount} suspended, ${errorCount} errors`,
    })
  } catch (error) {
    console.error('Retry payments cron error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

