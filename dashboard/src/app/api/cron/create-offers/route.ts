import { NextRequest, NextResponse } from 'next/server'
import {
  createEarlyRenewalOffers,
  createExtensionOffers,
  createUpgradeOffers,
} from '@/lib/offers'

const CRON_SECRET = process.env.CRON_SECRET

/**
 * POST /api/cron/create-offers
 * Cron job to automatically create offers for eligible users
 * Runs daily at 10 AM UTC
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const results = {
      earlyRenewal: { created: 0, errors: [] as string[] },
      extension: { created: 0, errors: [] as string[] },
      upgrade: { created: 0, errors: [] as string[] },
    }

    // Create early renewal offers (10% discount, expires in 7 days)
    try {
      const earlyRenewalResult = await createEarlyRenewalOffers(10, 7)
      results.earlyRenewal = earlyRenewalResult
    } catch (error) {
      results.earlyRenewal.errors.push(error instanceof Error ? error.message : 'Unknown error')
    }

    // Create extension offers (15% discount, 30 days extension)
    try {
      const extensionResult = await createExtensionOffers(30, 15)
      results.extension = extensionResult
    } catch (error) {
      results.extension.errors.push(error instanceof Error ? error.message : 'Unknown error')
    }

    // Create upgrade offers (20% discount)
    try {
      const upgradeResult = await createUpgradeOffers(20)
      results.upgrade = upgradeResult
    } catch (error) {
      results.upgrade.errors.push(error instanceof Error ? error.message : 'Unknown error')
    }

    const totalCreated =
      results.earlyRenewal.created + results.extension.created + results.upgrade.created

    return NextResponse.json({
      success: true,
      ...results,
      totalCreated,
      message: `Created ${totalCreated} offers (${results.earlyRenewal.created} early renewal, ${results.extension.created} extension, ${results.upgrade.created} upgrade)`,
    })
  } catch (error) {
    console.error('Create offers cron error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

