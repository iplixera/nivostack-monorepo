import { NextRequest, NextResponse } from 'next/server'
import { validateAdmin } from '@/lib/auth'
import {
  createEarlyRenewalOffers,
  createExtensionOffers,
  createUpgradeOffers,
} from '@/lib/offers'

/**
 * POST /api/admin/offers/create
 * Create offers for users (early renewal, extension, or upgrade)
 */
export async function POST(request: NextRequest) {
  try {
    const admin = await validateAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 })
    }

    const { type, discountPercent, extensionDays, daysUntilExpiry } = await request.json()

    let result

    switch (type) {
      case 'early_renewal':
        result = await createEarlyRenewalOffers(
          discountPercent || 10,
          daysUntilExpiry || 7
        )
        break

      case 'extension':
        result = await createExtensionOffers(
          extensionDays || 30,
          discountPercent || 15
        )
        break

      case 'upgrade':
        result = await createUpgradeOffers(discountPercent || 20)
        break

      default:
        return NextResponse.json({ error: 'Invalid offer type' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      created: result.created,
      errors: result.errors,
      message: `Created ${result.created} ${type} offers`,
    })
  } catch (error) {
    console.error('Create offers error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

