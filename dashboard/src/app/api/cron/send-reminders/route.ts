import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { getUsageStats } from '@/lib/subscription'

// Verify cron secret (set in Vercel environment variables)
const CRON_SECRET = process.env.CRON_SECRET

/**
 * POST /api/cron/send-reminders
 * 
 * Cron job to send payment reminders, trial expiration reminders, and usage alerts.
 * Runs daily at 9 AM UTC.
 * 
 * Process:
 * 1. Payment reminders (3 days, 1 day before grace period ends)
 * 2. Trial expiration reminders (7 days, 3 days, 1 day before trial ends)
 * 3. Usage alerts (80%, 90%, 100% of quota)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const results = {
      paymentReminders: 0,
      trialReminders: 0,
      usageAlerts: 0,
      errors: [] as string[],
    }

    // 1. Payment Reminders
    try {
      const subscriptionsWithUnpaidInvoices = await prisma.subscription.findMany({
        where: {
          status: 'active',
          enabled: true,
          // TODO: gracePeriodEnd field needs to be added to Subscription model
          // Temporarily removed from where clause
          invoices: {
            some: {
              status: 'open',
            },
          },
        },
        include: {
          user: true,
          plan: true,
          invoices: {
            where: { status: 'open' },
            orderBy: { dueDate: 'asc' },
            take: 1,
          },
        },
      })

      for (const sub of subscriptionsWithUnpaidInvoices) {
        // TODO: gracePeriodEnd field needs to be added to Subscription model
        const gracePeriodEnd = (sub as any).gracePeriodEnd || sub.currentPeriodEnd
        if (!gracePeriodEnd) continue

        const invoice = sub.invoices[0]
        if (!invoice) continue

        const daysUntilGraceEnd = Math.ceil(
          (gracePeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        )

        // Send reminders at 3 days and 1 day before grace period ends
        if (daysUntilGraceEnd === 3 || daysUntilGraceEnd === 1) {
          try {
            await sendEmail(sub.user.email, 'payment_reminder', {
              email: sub.user.email,
              planName: sub.plan.displayName,
              amount: invoice.amount,
              dueDate: invoice.dueDate,
              daysRemaining: daysUntilGraceEnd,
              gracePeriodEnd: gracePeriodEnd,
            })
            results.paymentReminders++
          } catch (error) {
            results.errors.push(`Payment reminder failed for ${sub.user.email}: ${error}`)
          }
        }
      }
    } catch (error) {
      results.errors.push(`Payment reminders error: ${error}`)
    }

    // 2. Trial Expiration Reminders
    try {
      const freePlanSubscriptions = await prisma.subscription.findMany({
        where: {
          status: 'active',
          enabled: true,
          plan: { price: 0 },
          trialEndDate: {
            gte: now,
            lte: addDays(now, 7),
          },
        },
        include: {
          user: true,
          plan: true,
        },
      })

      for (const sub of freePlanSubscriptions) {
        const daysRemaining = Math.ceil(
          (sub.trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        )

        // Send reminders at 7 days, 3 days, and 1 day before trial ends
        if (daysRemaining === 7 || daysRemaining === 3 || daysRemaining === 1) {
          try {
            await sendEmail(sub.user.email, 'trial_expiring', {
              email: sub.user.email,
              daysRemaining,
              trialEndDate: sub.trialEndDate,
            })
            results.trialReminders++
          } catch (error) {
            results.errors.push(`Trial reminder failed for ${sub.user.email}: ${error}`)
          }
        }
      }
    } catch (error) {
      results.errors.push(`Trial reminders error: ${error}`)
    }

    // 3. Usage Alerts
    try {
      const activeSubscriptions = await prisma.subscription.findMany({
        where: {
          status: 'active',
          enabled: true,
        },
        include: {
          user: true,
          plan: true,
        },
      })

      for (const sub of activeSubscriptions) {
        try {
          const usage = await getUsageStats(sub.userId)
          if (!usage) continue

          const meters: Array<{
            key: string
            name: string
            used: number
            limit: number | null
            percentage: number
          }> = [
            { key: 'devices', name: 'Device Registrations', ...usage.devices },
            { key: 'apiTraces', name: 'API Traces', ...(usage as any).apiTraces || { used: 0, limit: null, percentage: 0 } },
            { key: 'logs', name: 'Logs', ...usage.logs },
            { key: 'sessions', name: 'Sessions', ...usage.sessions },
            { key: 'crashes', name: 'Crashes', ...usage.crashes },
          ]

          for (const meter of meters) {
            if (!meter.limit) continue // Skip unlimited meters

            const percentage = meter.percentage
            const lastAlertField = `lastAlert${Math.floor(percentage / 10) * 10}` as 'lastAlert80' | 'lastAlert90' | 'lastAlert100'
            const lastAlertDate = (sub as any)[lastAlertField]

            // Check if we should send alert (not sent in last 24 hours)
            const lastAlert90 = (sub as any).lastAlert90
            const lastAlert80 = (sub as any).lastAlert80
            const shouldSendAlert =
              (percentage >= 100 && (!lastAlertDate || hoursSince(lastAlertDate) >= 24)) ||
              (percentage >= 90 && percentage < 100 && (!lastAlert90 || hoursSince(lastAlert90) >= 24)) ||
              (percentage >= 80 && percentage < 90 && (!lastAlert80 || hoursSince(lastAlert80) >= 24))

            if (shouldSendAlert) {
              let template: 'quota_warning_80' | 'quota_warning_90' | 'quota_exceeded'
              if (percentage >= 100) {
                template = 'quota_exceeded'
              } else if (percentage >= 90) {
                template = 'quota_warning_90'
              } else {
                template = 'quota_warning_80'
              }

              await sendEmail(sub.user.email, template, {
                email: sub.user.email,
                meterName: meter.name,
                used: meter.used,
                limit: meter.limit,
                percentage: percentage.toFixed(1),
              })

              // Update last alert timestamp
              await prisma.subscription.update({
                where: { id: sub.id },
                data: {
                  [lastAlertField]: new Date(),
                },
              })

              results.usageAlerts++
            }
          }
        } catch (error) {
          results.errors.push(`Usage alert failed for ${sub.userId}: ${error}`)
        }
      }
    } catch (error) {
      results.errors.push(`Usage alerts error: ${error}`)
    }

    return NextResponse.json({
      success: true,
      ...results,
      message: `Sent ${results.paymentReminders} payment reminders, ${results.trialReminders} trial reminders, ${results.usageAlerts} usage alerts`,
    })
  } catch (error) {
    console.error('Send reminders cron error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
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

function hoursSince(date: Date): number {
  return (Date.now() - date.getTime()) / (1000 * 60 * 60)
}

