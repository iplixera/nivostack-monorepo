/**
 * Middleware for requiring project access
 * 
 * This middleware ensures that:
 * 1. User is authenticated
 * 2. User has access to the project (as owner or member)
 * 3. User has the required role/permission (optional)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { canPerformAction, getUserProjectRole } from '@/lib/team-access'

export interface RequireProjectAccessOptions {
    /**
     * Required action/permission (e.g., 'view', 'edit_config', 'invite')
     * If not provided, only checks if user has access to project
     */
    action?: 'invite' | 'remove_member' | 'change_role' | 'transfer_ownership' | 'delete_project' | 'manage_settings' | 'edit_config' | 'view'

    /**
     * Required role (e.g., 'owner', 'admin', 'member', 'viewer')
     * If provided, checks if user has this role or higher
     */
    role?: 'owner' | 'admin' | 'member' | 'viewer'

    /**
     * Custom error message
     */
    errorMessage?: string
}

/**
 * Middleware to require project access
 * 
 * Usage:
 * ```ts
 * export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
 *   const accessCheck = await requireProjectAccess(request, await params, { action: 'view' })
 *   if (accessCheck) return accessCheck // Returns error response if access denied
 *   
 *   // Continue with handler logic
 * }
 * ```
 */
export async function requireProjectAccess(
    request: NextRequest,
    params: Promise<{ id: string }> | { id: string },
    options: RequireProjectAccessOptions = {}
): Promise<NextResponse | null> {
    // Get authenticated user
    const user = await getAuthUser(request)
    if (!user) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        )
    }

    // Get project ID from params
    const resolvedParams = await Promise.resolve(params)
    const projectId = resolvedParams.id

    if (!projectId) {
        return NextResponse.json(
            { error: 'Project ID is required' },
            { status: 400 }
        )
    }

    // Check if user has access to project
    const hasAccess = await canPerformAction(user.id, projectId, options.action || 'view')

    if (!hasAccess) {
        // Check if user is legacy owner (backward compatibility)
        const { prisma } = await import('@/lib/prisma')
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { userId: true },
        })

        if (project?.userId !== user.id) {
            return NextResponse.json(
                { error: options.errorMessage || 'You do not have access to this project' },
                { status: 403 }
            )
        }
    }

    // If role is specified, check role
    if (options.role) {
        const userRole = await getUserProjectRole(user.id, projectId)

        // Check legacy owner
        if (!userRole) {
            const { prisma } = await import('@/lib/prisma')
            const project = await prisma.project.findUnique({
                where: { id: projectId },
                select: { userId: true },
            })

            if (project?.userId === user.id) {
                // Legacy owner has all permissions
                return null
            }
        }

        const roleHierarchy: Record<string, number> = {
            owner: 4,
            admin: 3,
            member: 2,
            viewer: 1,
        }

        const requiredLevel = roleHierarchy[options.role] || 0
        const userLevel = userRole ? roleHierarchy[userRole] : 0

        if (userLevel < requiredLevel) {
            return NextResponse.json(
                { error: options.errorMessage || `This action requires ${options.role} role or higher` },
                { status: 403 }
            )
        }
    }

    return null // Access granted
}

/**
 * Helper to get user's role in project
 * Returns role or null if no access
 */
export async function getUserRoleInProject(
    request: NextRequest,
    projectId: string
): Promise<'owner' | 'admin' | 'member' | 'viewer' | null> {
    const user = await getAuthUser(request)
    if (!user) return null

    const role = await getUserProjectRole(user.id, projectId)

    // Check legacy owner
    if (!role) {
        const { prisma } = await import('@/lib/prisma')
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { userId: true },
        })

        if (project?.userId === user.id) {
            return 'owner'
        }
    }

    return role as 'owner' | 'admin' | 'member' | 'viewer' | null
}

