import { NextRequest, NextResponse } from 'next/server'
import { validateAdmin } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

/**
 * POST /api/admin/migrations/run
 * Run database migrations (admin only)
 * This endpoint allows admins to run Prisma migrations from the Studio admin page
 * Uses Prisma's programmatic API to push schema changes
 */
export async function POST(request: NextRequest) {
    try {
        const admin = await validateAdmin(request)
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 })
        }

        console.log('Running database migrations via Prisma...')

        try {
            // Use Prisma's programmatic API
            const { PrismaClient: Prisma } = await import('@prisma/client')
            const prisma = new PrismaClient()

            // Push schema changes to database
            // Note: This requires Prisma CLI to be available, but we can use $executeRaw for manual SQL
            // Instead, we'll use Prisma's migrate API if available, or fall back to manual SQL

            // For now, we'll execute the necessary SQL directly
            const results: string[] = []
            const warnings: string[] = []

            try {
                // Add maxTeamMembers and maxSeats to Plan table
                await prisma.$executeRawUnsafe(`
          ALTER TABLE "Plan" 
          ADD COLUMN IF NOT EXISTS "maxTeamMembers" INTEGER,
          ADD COLUMN IF NOT EXISTS "maxSeats" INTEGER;
        `)
                results.push('Added maxTeamMembers and maxSeats to Plan table')
            } catch (e: any) {
                if (e.message?.includes('already exists') || e.message?.includes('duplicate')) {
                    warnings.push('Plan columns may already exist')
                } else {
                    throw e
                }
            }

            // Create ProjectMember table
            try {
                await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "ProjectMember" (
            "id" TEXT NOT NULL,
            "projectId" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "role" TEXT NOT NULL DEFAULT 'member',
            "invitedBy" TEXT,
            "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "joinedAt" TIMESTAMP(3),
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "ProjectMember_pkey" PRIMARY KEY ("id"),
            CONSTRAINT "ProjectMember_projectId_userId_key" UNIQUE ("projectId", "userId")
          );
        `)
                results.push('Created ProjectMember table')
            } catch (e: any) {
                if (e.message?.includes('already exists')) {
                    warnings.push('ProjectMember table may already exist')
                } else {
                    throw e
                }
            }

            // Create ProjectInvitation table
            try {
                await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "ProjectInvitation" (
            "id" TEXT NOT NULL,
            "projectId" TEXT NOT NULL,
            "email" TEXT NOT NULL,
            "role" TEXT NOT NULL DEFAULT 'member',
            "token" TEXT NOT NULL,
            "invitedBy" TEXT NOT NULL,
            "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "expiresAt" TIMESTAMP(3) NOT NULL,
            "status" TEXT NOT NULL DEFAULT 'pending',
            "emailSent" BOOLEAN NOT NULL DEFAULT false,
            "emailSentAt" TIMESTAMP(3),
            "emailDelivered" BOOLEAN NOT NULL DEFAULT false,
            "emailOpened" BOOLEAN NOT NULL DEFAULT false,
            "emailClicked" BOOLEAN NOT NULL DEFAULT false,
            "resendCount" INTEGER NOT NULL DEFAULT 0,
            "lastResentAt" TIMESTAMP(3),
            "lastResentBy" TEXT,
            "acceptedAt" TIMESTAMP(3),
            "acceptedBy" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "ProjectInvitation_pkey" PRIMARY KEY ("id"),
            CONSTRAINT "ProjectInvitation_token_key" UNIQUE ("token")
          );
        `)
                results.push('Created ProjectInvitation table')
            } catch (e: any) {
                if (e.message?.includes('already exists')) {
                    warnings.push('ProjectInvitation table may already exist')
                } else {
                    throw e
                }
            }

            // Create UserNotification table
            try {
                await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "UserNotification" (
            "id" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "type" TEXT NOT NULL,
            "title" TEXT NOT NULL,
            "message" TEXT NOT NULL,
            "data" JSONB,
            "read" BOOLEAN NOT NULL DEFAULT false,
            "readAt" TIMESTAMP(3),
            "actionUrl" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "UserNotification_pkey" PRIMARY KEY ("id")
          );
        `)
                results.push('Created UserNotification table')
            } catch (e: any) {
                if (e.message?.includes('already exists')) {
                    warnings.push('UserNotification table may already exist')
                } else {
                    throw e
                }
            }

            // Create UserNotificationPreferences table
            try {
                await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "UserNotificationPreferences" (
            "id" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "emailInvitations" BOOLEAN NOT NULL DEFAULT true,
            "emailProjectUpdates" BOOLEAN NOT NULL DEFAULT true,
            "emailAlerts" BOOLEAN NOT NULL DEFAULT true,
            "emailWeeklyDigest" BOOLEAN NOT NULL DEFAULT false,
            "inAppInvitations" BOOLEAN NOT NULL DEFAULT true,
            "inAppProjectUpdates" BOOLEAN NOT NULL DEFAULT true,
            "inAppAlerts" BOOLEAN NOT NULL DEFAULT true,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "UserNotificationPreferences_pkey" PRIMARY KEY ("id"),
            CONSTRAINT "UserNotificationPreferences_userId_key" UNIQUE ("userId")
          );
        `)
                results.push('Created UserNotificationPreferences table')
            } catch (e: any) {
                if (e.message?.includes('already exists')) {
                    warnings.push('UserNotificationPreferences table may already exist')
                } else {
                    throw e
                }
            }

            // Create indexes
            try {
                await prisma.$executeRawUnsafe(`
          CREATE INDEX IF NOT EXISTS "ProjectMember_projectId_idx" ON "ProjectMember"("projectId");
          CREATE INDEX IF NOT EXISTS "ProjectMember_userId_idx" ON "ProjectMember"("userId");
          CREATE INDEX IF NOT EXISTS "ProjectMember_role_idx" ON "ProjectMember"("role");
          CREATE INDEX IF NOT EXISTS "ProjectInvitation_projectId_idx" ON "ProjectInvitation"("projectId");
          CREATE INDEX IF NOT EXISTS "ProjectInvitation_email_idx" ON "ProjectInvitation"("email");
          CREATE INDEX IF NOT EXISTS "ProjectInvitation_token_idx" ON "ProjectInvitation"("token");
          CREATE INDEX IF NOT EXISTS "ProjectInvitation_status_idx" ON "ProjectInvitation"("status");
          CREATE INDEX IF NOT EXISTS "UserNotification_userId_idx" ON "UserNotification"("userId");
          CREATE INDEX IF NOT EXISTS "UserNotification_userId_read_idx" ON "UserNotification"("userId", "read");
          CREATE INDEX IF NOT EXISTS "UserNotification_type_idx" ON "UserNotification"("type");
          CREATE INDEX IF NOT EXISTS "UserNotificationPreferences_userId_idx" ON "UserNotificationPreferences"("userId");
        `)
                results.push('Created indexes')
            } catch (e: any) {
                warnings.push('Some indexes may already exist')
            }

            await prisma.$disconnect()

            return NextResponse.json({
                success: true,
                message: 'Migrations applied successfully',
                output: results.join('\n'),
                warnings: warnings.length > 0 ? warnings.join('\n') : null,
            })
        } catch (error: any) {
            const errorMessage = error.message || String(error)
            console.error('Migration error:', errorMessage)

            return NextResponse.json(
                {
                    success: false,
                    message: 'Migration failed',
                    error: errorMessage,
                },
                { status: 500 }
            )
        }
    } catch (error: any) {
        console.error('Migration endpoint error:', error)
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to run migrations',
                error: error.message || String(error),
            },
            { status: 500 }
        )
    }
}

/**
 * GET /api/admin/migrations/status
 * Check migration status (admin only)
 * Returns information about which tables/columns are missing
 */
export async function GET(request: NextRequest) {
    try {
        const admin = await validateAdmin(request)
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 })
        }

        const { prisma } = await import('@/lib/prisma')

        // Check which tables/columns exist
        const checks = {
            projectMember: false,
            projectInvitation: false,
            userNotification: false,
            userNotificationPreferences: false,
            planMaxTeamMembers: false,
            planMaxSeats: false,
        }

        try {
            // Try to query each table/column
            await prisma.$queryRaw`SELECT 1 FROM "ProjectMember" LIMIT 1`
            checks.projectMember = true
        } catch (e: any) {
            if (!e.message?.includes('does not exist')) {
                console.warn('Error checking ProjectMember:', e.message)
            }
        }

        try {
            await prisma.$queryRaw`SELECT 1 FROM "ProjectInvitation" LIMIT 1`
            checks.projectInvitation = true
        } catch (e: any) {
            if (!e.message?.includes('does not exist')) {
                console.warn('Error checking ProjectInvitation:', e.message)
            }
        }

        try {
            await prisma.$queryRaw`SELECT 1 FROM "UserNotification" LIMIT 1`
            checks.userNotification = true
        } catch (e: any) {
            if (!e.message?.includes('does not exist')) {
                console.warn('Error checking UserNotification:', e.message)
            }
        }

        try {
            await prisma.$queryRaw`SELECT 1 FROM "UserNotificationPreferences" LIMIT 1`
            checks.userNotificationPreferences = true
        } catch (e: any) {
            if (!e.message?.includes('does not exist')) {
                console.warn('Error checking UserNotificationPreferences:', e.message)
            }
        }

        try {
            await prisma.$queryRaw`SELECT "maxTeamMembers" FROM "Plan" LIMIT 1`
            checks.planMaxTeamMembers = true
        } catch (e: any) {
            if (!e.message?.includes('does not exist') && !e.message?.includes('column')) {
                console.warn('Error checking Plan.maxTeamMembers:', e.message)
            }
        }

        try {
            await prisma.$queryRaw`SELECT "maxSeats" FROM "Plan" LIMIT 1`
            checks.planMaxSeats = true
        } catch (e: any) {
            if (!e.message?.includes('does not exist') && !e.message?.includes('column')) {
                console.warn('Error checking Plan.maxSeats:', e.message)
            }
        }

        const allComplete = Object.values(checks).every(v => v === true)
        const missingItems = Object.entries(checks)
            .filter(([_, exists]) => !exists)
            .map(([name]) => name)

        return NextResponse.json({
            status: allComplete ? 'complete' : 'pending',
            checks,
            missingItems,
            message: allComplete
                ? 'All migrations are complete'
                : `Missing: ${missingItems.join(', ')}`,
        })
    } catch (error: any) {
        console.error('Migration status check error:', error)
        return NextResponse.json(
            {
                status: 'error',
                error: error.message || String(error),
            },
            { status: 500 }
        )
    }
}

