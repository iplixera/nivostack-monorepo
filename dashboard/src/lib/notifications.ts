/**
 * Notification Utilities
 * 
 * Helper functions for creating and managing user notifications
 */

import { prisma } from './prisma'

export type NotificationType = 'invitation' | 'project_update' | 'alert' | 'system'

export interface CreateNotificationParams {
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, any>
  actionUrl?: string
}

/**
 * Create a notification for a user
 */
export async function createNotification(params: CreateNotificationParams) {
  return await prisma.userNotification.create({
    data: {
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      data: params.data || null,
      actionUrl: params.actionUrl || null,
    },
  })
}

/**
 * Create invitation notification
 */
export async function createInvitationNotification(
  userId: string,
  projectId: string,
  invitationId: string,
  projectName: string,
  inviterName: string,
  role: string,
  invitationToken?: string
) {
  return await createNotification({
    userId,
    type: 'invitation',
    title: `You've been invited to join ${projectName}`,
    message: `${inviterName} has invited you to join the "${projectName}" project as a ${role}.`,
    data: {
      projectId,
      invitationId,
      role,
      token: invitationToken, // Include token for direct acceptance
    },
    actionUrl: `/team?project=${projectId}`, // Link to team page where they can accept
  })
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string, userId: string) {
  return await prisma.userNotification.updateMany({
    where: {
      id: notificationId,
      userId, // Ensure user owns the notification
    },
    data: {
      read: true,
      readAt: new Date(),
    },
  })
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string) {
  return await prisma.userNotification.updateMany({
    where: {
      userId,
      read: false,
    },
    data: {
      read: true,
      readAt: new Date(),
    },
  })
}

/**
 * Get user's unread notification count
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  try {
    return await prisma.userNotification.count({
      where: {
        userId,
        read: false,
      },
    })
  } catch (error: any) {
    // If UserNotification table doesn't exist (migration not run), return 0
    if (error?.message?.includes('does not exist') || 
        error?.message?.includes('model') ||
        error?.code === 'P2021') {
      console.warn('UserNotification table not found, returning 0 for unread count:', error.message)
      return 0
    }
    throw error
  }
}

