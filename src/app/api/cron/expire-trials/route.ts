import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { expireSubscription } from '@/lib/subscription'
import { sendEmail } from '@/lib/email'

// Verify cron secret (set in Vercel environment variables)
const CRON_SECRET = process.env.CRON_SECRET

/**
 * POST /api/cron/expire-trials
 * 
 * Cron job to expire free trial subscriptions and disable SDK.
 * Runs daily at 2 AM UTC.
 * 
 * Process:
 * 1. Find all active subscriptions with expired trials
 * 2. Disable feature flags for all projects (SDK disabled)
 * 3. Update subscription status to 'expired'
 * 4. Send email notification asking user to upgrade
 * 
 * NOTE: Data is NOT deleted - preserved for user to upgrade and continue using.
 * Data deletion will be handled separately based on retention policy.
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    
    // Find all active subscriptions with expired trials
    const expiredSubscriptions = await prisma.subscription.findMany({
      where: {
        status: 'active',
        trialEndDate: {
          lte: now,
        },
      },
      include: {
        user: {
          include: {
            projects: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    })

    console.log(`Found ${expiredSubscriptions.length} expired trials`)

    let expiredCount = 0
    let emailSentCount = 0
    const errors: string[] = []

    for (const subscription of expiredSubscriptions) {
      const userId = subscription.userId
      const projectIds = subscription.user.projects.map(p => p.id)

      try {
        // Disable feature flags for all projects (SDK disabled)
        if (projectIds.length > 0) {
          await prisma.featureFlags.updateMany({
            where: { projectId: { in: projectIds } },
            data: {
              sdkEnabled: false,
              apiTracking: false,
              screenTracking: false,
              crashReporting: false,
              logging: false,
            },
          })
        }

        // Update subscription status to expired
        await expireSubscription(subscription.id)

        // Send email notification asking user to upgrade
        try {
          await sendEmail(subscription.user.email, 'trial_expired', {
            email: subscription.user.email,
            trialEndDate: subscription.trialEndDate,
          })
          emailSentCount++
          console.log(`Sent trial expiration email to ${subscription.user.email}`)
        } catch (emailError) {
          const errorMsg = `Failed to send email to ${subscription.user.email}: ${emailError instanceof Error ? emailError.message : 'Unknown error'}`
          errors.push(errorMsg)
          console.error(errorMsg)
        }

        expiredCount++
        console.log(`Expired subscription ${subscription.id} for user ${userId} (SDK disabled, data preserved)`)
      } catch (error) {
        const errorMsg = `Error processing subscription ${subscription.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
        errors.push(errorMsg)
        console.error(errorMsg)
      }
    }

    return NextResponse.json({
      success: true,
      expiredCount,
      emailSentCount,
      errors: errors.length > 0 ? errors : undefined,
      message: `Processed ${expiredSubscriptions.length} expired trials: ${expiredCount} expired, ${emailSentCount} emails sent. SDK disabled, data preserved.`,
    })
  } catch (error) {
    console.error('Expire trials cron error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

