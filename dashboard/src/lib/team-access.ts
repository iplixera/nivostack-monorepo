/**
 * Team Access Control Utilities
 * 
 * Helper functions for checking user roles and permissions in projects
 */

import { prisma } from './prisma'

export type ProjectRole = 'owner' | 'admin' | 'member' | 'viewer'

export interface ProjectMemberWithUser {
  id: string
  role: ProjectRole
  user: {
    id: string
    email: string
    name: string | null
  }
  invitedBy: string | null
  invitedAt: Date
  joinedAt: Date | null
}

/**
 * Get user's role in a project
 */
export async function getUserProjectRole(
  userId: string,
  projectId: string
): Promise<ProjectRole | null> {
  const member = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
    select: {
      role: true,
    },
  })

  return member?.role as ProjectRole | null
}

/**
 * Check if user has a specific role (or higher) in a project
 * Role hierarchy: owner > admin > member > viewer
 */
export async function hasProjectRole(
  userId: string,
  projectId: string,
  requiredRole: ProjectRole
): Promise<boolean> {
  const userRole = await getUserProjectRole(userId, projectId)

  if (!userRole) {
    // Check if user is the project owner (backward compatibility)
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { userId: true },
    })

    if (project?.userId === userId) {
      // User is owner via legacy userId field
      return requiredRole === 'owner' || requiredRole === 'admin' || requiredRole === 'member' || requiredRole === 'viewer'
    }

    return false
  }

  const roleHierarchy: Record<ProjectRole, number> = {
    owner: 4,
    admin: 3,
    member: 2,
    viewer: 1,
  }

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

/**
 * Check if user can perform an action based on role
 */
export async function canPerformAction(
  userId: string,
  projectId: string,
  action: 'invite' | 'remove_member' | 'change_role' | 'transfer_ownership' | 'delete_project' | 'manage_settings' | 'edit_config' | 'view'
): Promise<boolean> {
  const role = await getUserProjectRole(userId, projectId)

  // If no role, check if user is project owner (backward compatibility)
  if (!role) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { userId: true },
    })

    if (project?.userId === userId) {
      // Legacy owner - can do everything
      return true
    }

    return false
  }

  // Role-based permissions
  const permissions: Record<ProjectRole, string[]> = {
    owner: [
      'invite',
      'remove_member',
      'change_role',
      'transfer_ownership',
      'delete_project',
      'manage_settings',
      'edit_config',
      'view',
    ],
    admin: [
      'invite',
      'remove_member',
      'change_role',
      'manage_settings',
      'edit_config',
      'view',
    ],
    member: [
      'edit_config',
      'view',
    ],
    viewer: [
      'view',
    ],
  }

  return permissions[role]?.includes(action) ?? false
}

/**
 * Get all members of a project
 */
export async function getProjectMembers(projectId: string): Promise<ProjectMemberWithUser[]> {
  const members = await prisma.projectMember.findMany({
    where: { projectId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
    orderBy: [
      { role: 'asc' }, // owner first, then admin, member, viewer
      { joinedAt: 'asc' },
    ],
  })

  return members.map((m) => ({
    id: m.id,
    role: m.role as ProjectRole,
    user: m.user,
    invitedBy: m.invitedBy,
    invitedAt: m.invitedAt,
    joinedAt: m.joinedAt,
  }))
}

/**
 * Check seat limits for a plan
 */
export async function checkSeatLimit(projectId: string): Promise<{ allowed: boolean; current: number; limit: number | null }> {
  // Get project owner's subscription
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      user: {
        include: {
          subscription: {
            include: {
              plan: true,
            },
          },
        },
      },
    },
  })

  if (!project) {
    return { allowed: false, current: 0, limit: null }
  }

  const plan = project.user.subscription?.plan
  const maxSeats = plan?.maxTeamMembers ?? plan?.maxSeats ?? null

  // Count current members
  const currentMembers = await prisma.projectMember.count({
    where: { projectId },
  })

  // If no limit, allow unlimited
  if (maxSeats === null) {
    return { allowed: true, current: currentMembers, limit: null }
  }

  return {
    allowed: currentMembers < maxSeats,
    current: currentMembers,
    limit: maxSeats,
  }
}

/**
 * Get invitation expiry days from system configuration
 */
export async function getInvitationExpiryDays(): Promise<number> {
  const config = await prisma.systemConfiguration.findUnique({
    where: {
      category_key: {
        category: 'notifications',
        key: 'invitation_expiry_days',
      },
    },
  })

  if (config?.value) {
    const days = parseInt(config.value, 10)
    if (!isNaN(days) && days > 0) {
      return days
    }
  }

  return 7 // Default: 7 days
}

