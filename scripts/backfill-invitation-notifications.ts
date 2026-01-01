/**
 * Backfill Invitation Notifications
 * 
 * This script creates notifications for users who registered but didn't receive
 * notifications for pending invitations (e.g., if they were invited before registering)
 * 
 * Usage: tsx scripts/backfill-invitation-notifications.ts
 * Or: cd dashboard && pnpm backfill:invitations
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { PrismaClient } from '@prisma/client'

// Load environment variables from .env.local (in project root)
const envPath = resolve(__dirname, '../.env.local')
config({ path: envPath })

// Verify database URL is loaded
if (!process.env.POSTGRES_PRISMA_URL) {
  console.error('❌ Error: POSTGRES_PRISMA_URL not found in environment variables')
  console.error(`   Expected .env.local at: ${envPath}`)
  console.error('   Make sure .env.local exists in the project root')
  process.exit(1)
}

const prisma = new PrismaClient()

async function backfillInvitationNotifications() {
  console.log('🔄 Starting invitation notification backfill...')
  console.log('')

  try {
    // Find all pending invitations
    const pendingInvitations = await prisma.projectInvitation.findMany({
      where: {
        status: 'pending',
        expiresAt: {
          gt: new Date(), // Not expired
        },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        inviter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    console.log(`Found ${pendingInvitations.length} pending invitations`)
    console.log('')

    let createdCount = 0
    let skippedCount = 0
    let errorCount = 0

    for (const invitation of pendingInvitations) {
      try {
        // Find user by email (case-insensitive)
        const user = await prisma.user.findFirst({
          where: {
            email: {
              equals: invitation.email,
              mode: 'insensitive',
            },
          },
        })

        if (!user) {
          // User doesn't exist yet, skip
          skippedCount++
          continue
        }

        // Check if notification already exists
        const existingNotification = await prisma.userNotification.findFirst({
          where: {
            userId: user.id,
            type: 'invitation',
            data: {
              path: ['invitationId'],
              equals: invitation.id,
            },
          },
        })

        if (existingNotification) {
          // Notification already exists, skip
          skippedCount++
          continue
        }

        // Create notification
        await prisma.userNotification.create({
          data: {
            userId: user.id,
            type: 'invitation',
            title: `You've been invited to join ${invitation.project.name}`,
            message: `${invitation.inviter.name || invitation.inviter.email} has invited you to join the "${invitation.project.name}" project as a ${invitation.role}.`,
            data: {
              projectId: invitation.projectId,
              invitationId: invitation.id,
              role: invitation.role,
            },
            actionUrl: `/projects/${invitation.projectId}/invitations/${invitation.id}`,
          },
        })

        createdCount++
        console.log(`✅ Created notification for ${user.email} - invitation to ${invitation.project.name}`)
      } catch (error: any) {
        errorCount++
        console.error(`❌ Error processing invitation ${invitation.id}:`, error.message)
      }
    }

    console.log('')
    console.log('📊 Summary:')
    console.log(`   Created: ${createdCount}`)
    console.log(`   Skipped: ${skippedCount}`)
    console.log(`   Errors: ${errorCount}`)
    console.log('')
    console.log('✅ Backfill complete!')
  } catch (error) {
    console.error('❌ Backfill failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run if executed directly
if (require.main === module) {
  backfillInvitationNotifications()
    .then(() => {
      process.exit(0)
    })
    .catch((error) => {
      console.error('Fatal error:', error)
      process.exit(1)
    })
}

export default backfillInvitationNotifications

