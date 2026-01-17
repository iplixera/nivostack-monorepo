import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { processRenewal } from '@/lib/subscription-renewal'

// Verify cron secret (set in Vercel environment variables)
const CRON_SECRET = process.env.CRON_SECRET

/**
 * POST /api/cron/renew-subscriptions
 * 
 * Cron job to renew subscriptions that have reached their billing period end.
 * Runs daily at 00:00 UTC.
 * 
 * Process:
 * 1. Find all active subscriptions where currentPeriodEnd <= now
 * 2. For each subscription:
 *    - Free Plan: Renew if trial still active, otherwise expire
 *    - Paid Plan: Create invoice and attempt payment (payment handled separately)
 * 3. Create history record for completed period
 * 4. Advance billing period
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    
    // Find all active subscriptions that need renewal
    const subscriptionsToRenew = await prisma.subscription.findMany({
      where: {
        currentPeriodEnd: { lte: now },
        status: 'active',
        enabled: true,
      },
      include: {
        plan: true,
      },
    })

    console.log(`Found ${subscriptionsToRenew.length} subscriptions to renew`)

    let renewedCount = 0
    let expiredCount = 0
    let errorCount = 0
    const errors: string[] = []

    for (const subscription of subscriptionsToRenew) {
      try {
        const result = await processRenewal(subscription.id)
        
        if (result.success && result.renewed) {
          renewedCount++
          console.log(`Renewed subscription ${subscription.id} for user ${subscription.userId}`)
        } else if (result.success && !result.renewed) {
          // Subscription expired (Free Plan trial ended)
          expiredCount++
          console.log(`Expired subscription ${subscription.id} for user ${subscription.userId}`)
        } else {
          errorCount++
          const errorMsg = `Failed to renew subscription ${subscription.id}: ${result.error}`
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
      processed: subscriptionsToRenew.length,
      renewed: renewedCount,
      expired: expiredCount,
      errors: errorCount,
      errorDetails: errors.length > 0 ? errors : undefined,
      message: `Processed ${subscriptionsToRenew.length} subscriptions: ${renewedCount} renewed, ${expiredCount} expired, ${errorCount} errors`,
    })
  } catch (error) {
    console.error('Renew subscriptions cron error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

