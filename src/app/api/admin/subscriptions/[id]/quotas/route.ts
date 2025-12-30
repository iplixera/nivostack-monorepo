import { NextRequest, NextResponse } from 'next/server'
import { validateAdmin } from '@/lib/auth'
import { updateSubscriptionQuotas, getSubscriptionDetails } from '@/lib/admin'

/**
 * PATCH /api/admin/subscriptions/[id]/quotas
 * Update subscription quotas (admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await validateAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 })
    }

    const { id } = await params
    const quotas = await request.json()

    // Update subscription quota overrides (null = use plan default)
    await updateSubscriptionQuotas(id, {
      quotaMaxProjects: quotas.maxProjects !== undefined ? quotas.maxProjects : null,
      quotaMaxDevices: quotas.maxDevices !== undefined ? quotas.maxDevices : null,
      quotaMaxMockEndpoints: quotas.maxMockEndpoints !== undefined ? quotas.maxMockEndpoints : null,
      quotaMaxApiEndpoints: quotas.maxApiEndpoints !== undefined ? quotas.maxApiEndpoints : null,
      quotaMaxApiRequests: quotas.maxApiRequests !== undefined ? quotas.maxApiRequests : null,
      quotaMaxLogs: quotas.maxLogs !== undefined ? quotas.maxLogs : null,
      quotaMaxSessions: quotas.maxSessions !== undefined ? quotas.maxSessions : null,
      quotaMaxCrashes: quotas.maxCrashes !== undefined ? quotas.maxCrashes : null,
      quotaMaxBusinessConfigKeys: quotas.maxBusinessConfigKeys !== undefined ? quotas.maxBusinessConfigKeys : null,
      quotaMaxLocalizationLanguages: quotas.maxLocalizationLanguages !== undefined ? quotas.maxLocalizationLanguages : null,
      quotaMaxLocalizationKeys: quotas.maxLocalizationKeys !== undefined ? quotas.maxLocalizationKeys : null,
    })

    // Return updated subscription with full details
    const subscription = await getSubscriptionDetails(id)
    return NextResponse.json({ success: true, subscription })
  } catch (error) {
    console.error('Update quotas error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

