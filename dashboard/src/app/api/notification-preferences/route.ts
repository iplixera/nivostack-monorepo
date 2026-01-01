import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

/**
 * GET /api/notification-preferences
 * Get user's notification preferences
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let preferences = await prisma.userNotificationPreferences.findUnique({
      where: { userId: user.id },
    })

    // Create default preferences if they don't exist
    if (!preferences) {
      preferences = await prisma.userNotificationPreferences.create({
        data: {
          userId: user.id,
        },
      })
    }

    return NextResponse.json({
      preferences: {
        emailInvitations: preferences.emailInvitations,
        emailProjectUpdates: preferences.emailProjectUpdates,
        emailAlerts: preferences.emailAlerts,
        emailWeeklyDigest: preferences.emailWeeklyDigest,
        inAppInvitations: preferences.inAppInvitations,
        inAppProjectUpdates: preferences.inAppProjectUpdates,
        inAppAlerts: preferences.inAppAlerts,
      },
    })
  } catch (error) {
    console.error('Get notification preferences error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/notification-preferences
 * Update user's notification preferences
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const updates = await request.json()

    // Upsert preferences
    const preferences = await prisma.userNotificationPreferences.upsert({
      where: { userId: user.id },
      update: {
        emailInvitations: updates.emailInvitations !== undefined ? updates.emailInvitations : undefined,
        emailProjectUpdates: updates.emailProjectUpdates !== undefined ? updates.emailProjectUpdates : undefined,
        emailAlerts: updates.emailAlerts !== undefined ? updates.emailAlerts : undefined,
        emailWeeklyDigest: updates.emailWeeklyDigest !== undefined ? updates.emailWeeklyDigest : undefined,
        inAppInvitations: updates.inAppInvitations !== undefined ? updates.inAppInvitations : undefined,
        inAppProjectUpdates: updates.inAppProjectUpdates !== undefined ? updates.inAppProjectUpdates : undefined,
        inAppAlerts: updates.inAppAlerts !== undefined ? updates.inAppAlerts : undefined,
      },
      create: {
        userId: user.id,
        emailInvitations: updates.emailInvitations ?? true,
        emailProjectUpdates: updates.emailProjectUpdates ?? true,
        emailAlerts: updates.emailAlerts ?? true,
        emailWeeklyDigest: updates.emailWeeklyDigest ?? false,
        inAppInvitations: updates.inAppInvitations ?? true,
        inAppProjectUpdates: updates.inAppProjectUpdates ?? true,
        inAppAlerts: updates.inAppAlerts ?? true,
      },
    })

    return NextResponse.json({
      preferences: {
        emailInvitations: preferences.emailInvitations,
        emailProjectUpdates: preferences.emailProjectUpdates,
        emailAlerts: preferences.emailAlerts,
        emailWeeklyDigest: preferences.emailWeeklyDigest,
        inAppInvitations: preferences.inAppInvitations,
        inAppProjectUpdates: preferences.inAppProjectUpdates,
        inAppAlerts: preferences.inAppAlerts,
      },
    })
  } catch (error) {
    console.error('Update notification preferences error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

