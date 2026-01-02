#!/usr/bin/env tsx

/**
 * Migration Script: Convert existing projects to use ProjectMember model
 * 
 * This script:
 * 1. Creates ProjectMember entries for all existing project owners
 * 2. Sets their role to "owner"
 * 3. Adds system configuration for invitation expiry
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Migrating existing projects to ProjectMember model...')
  console.log('')

  // Get all projects
  const projects = await prisma.project.findMany({
    include: {
      user: true,
    },
  })

  console.log(`📋 Found ${projects.length} projects to migrate`)
  console.log('')

  let migrated = 0
  let skipped = 0

  for (const project of projects) {
    // Check if ProjectMember already exists
    const existingMember = await prisma.projectMember.findFirst({
      where: {
        projectId: project.id,
        userId: project.userId,
      },
    })

    if (existingMember) {
      console.log(`⏭️  Skipping project "${project.name}" - owner already has ProjectMember`)
      skipped++
      continue
    }

    // Create ProjectMember for owner
    await prisma.projectMember.create({
      data: {
        projectId: project.id,
        userId: project.userId,
        role: 'owner',
        invitedAt: project.createdAt,
        joinedAt: project.createdAt,
      },
    })

    console.log(`✅ Migrated project "${project.name}" - created owner ProjectMember`)
    migrated++
  }

  console.log('')
  console.log('📊 Migration Summary:')
  console.log(`   ✅ Migrated: ${migrated}`)
  console.log(`   ⏭️  Skipped: ${skipped}`)
  console.log('')

  // Add system configuration for invitation expiry
  console.log('⚙️  Setting up system configuration...')
  console.log('')

  const expiryConfig = await prisma.systemConfiguration.upsert({
    where: {
      category_key: {
        category: 'notifications',
        key: 'invitation_expiry_days',
      },
    },
    update: {},
    create: {
      category: 'notifications',
      key: 'invitation_expiry_days',
      value: '7',
      description: 'Number of days before invitation expires (default: 7)',
      isActive: true,
    },
  })

  console.log(`✅ System configuration added: invitation_expiry_days = ${expiryConfig.value} days`)

  // Add email enabled config (default: false for Phase 1)
  const emailConfig = await prisma.systemConfiguration.upsert({
    where: {
      category_key: {
        category: 'notifications',
        key: 'email_enabled',
      },
    },
    update: {},
    create: {
      category: 'notifications',
      key: 'email_enabled',
      value: 'false',
      description: 'Enable/disable email sending globally (Phase 1: false, in-app only)',
      isActive: true,
    },
  })

  console.log(`✅ System configuration added: email_enabled = ${emailConfig.value}`)

  // Add email from address
  const fromEmailConfig = await prisma.systemConfiguration.upsert({
    where: {
      category_key: {
        category: 'notifications',
        key: 'email_from_address',
      },
    },
    update: {},
    create: {
      category: 'notifications',
      key: 'email_from_address',
      value: 'noreply@nivostack.com',
      description: 'Default sender email address',
      isActive: true,
    },
  })

  console.log(`✅ System configuration added: email_from_address = ${fromEmailConfig.value}`)

  // Add email from name
  const fromNameConfig = await prisma.systemConfiguration.upsert({
    where: {
      category_key: {
        category: 'notifications',
        key: 'email_from_name',
      },
    },
    update: {},
    create: {
      category: 'notifications',
      key: 'email_from_name',
      value: 'NivoStack',
      description: 'Default sender name',
      isActive: true,
    },
  })

  console.log(`✅ System configuration added: email_from_name = ${fromNameConfig.value}`)

  console.log('')
  console.log('✅ Migration complete!')
  console.log('')
  console.log('📋 Next steps:')
  console.log('   1. Verify ProjectMember entries were created')
  console.log('   2. Start implementing API endpoints')
  console.log('')
}

main()
  .catch((e) => {
    console.error('❌ Migration error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

