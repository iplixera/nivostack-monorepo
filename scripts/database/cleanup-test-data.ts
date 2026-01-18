#!/usr/bin/env tsx
/**
 * Cleanup test data for a specific project
 *
 * This script deletes:
 * - All devices for the project
 * - All API traces for the project
 * - All logs for the project
 * - All sessions for the project
 *
 * Usage:
 *   npx tsx scripts/database/cleanup-test-data.ts <projectId>
 *
 * Example:
 *   npx tsx scripts/database/cleanup-test-data.ts cmkiixzic00039krtzw3ynm87
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanupProjectData(projectId: string) {
  console.log(`\n🧹 Cleaning up test data for project: ${projectId}\n`)

  try {
    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, name: true }
    })

    if (!project) {
      console.error(`❌ Project not found: ${projectId}`)
      process.exit(1)
    }

    console.log(`✅ Found project: ${project.name}\n`)

    // Count records before deletion
    const deviceCount = await prisma.device.count({
      where: { projectId }
    })
    const traceCount = await prisma.apiTrace.count({
      where: { projectId }
    })
    const logCount = await prisma.log.count({
      where: { projectId }
    })
    const sessionCount = await prisma.session.count({
      where: { projectId }
    })

    console.log(`📊 Current data:`)
    console.log(`   - Devices: ${deviceCount}`)
    console.log(`   - API Traces: ${traceCount}`)
    console.log(`   - Logs: ${logCount}`)
    console.log(`   - Sessions: ${sessionCount}\n`)

    if (deviceCount === 0 && traceCount === 0 && logCount === 0 && sessionCount === 0) {
      console.log(`✨ No data to clean up!`)
      return
    }

    // Delete data in correct order (respecting foreign key constraints)
    console.log(`🗑️  Deleting data...\n`)

    // 1. Delete API traces (no foreign key dependencies)
    if (traceCount > 0) {
      const deletedTraces = await prisma.apiTrace.deleteMany({
        where: { projectId }
      })
      console.log(`   ✓ Deleted ${deletedTraces.count} API traces`)
    }

    // 2. Delete logs (no foreign key dependencies)
    if (logCount > 0) {
      const deletedLogs = await prisma.log.deleteMany({
        where: { projectId }
      })
      console.log(`   ✓ Deleted ${deletedLogs.count} logs`)
    }

    // 3. Delete sessions (may reference devices)
    if (sessionCount > 0) {
      const deletedSessions = await prisma.session.deleteMany({
        where: { projectId }
      })
      console.log(`   ✓ Deleted ${deletedSessions.count} sessions`)
    }

    // 4. Delete devices (must be last due to foreign key references)
    if (deviceCount > 0) {
      const deletedDevices = await prisma.device.deleteMany({
        where: { projectId }
      })
      console.log(`   ✓ Deleted ${deletedDevices.count} devices`)
    }

    console.log(`\n✅ Cleanup complete!\n`)
    console.log(`📝 Summary:`)
    console.log(`   - Removed ${deviceCount} devices`)
    console.log(`   - Removed ${traceCount} API traces`)
    console.log(`   - Removed ${logCount} logs`)
    console.log(`   - Removed ${sessionCount} sessions\n`)

  } catch (error) {
    console.error(`\n❌ Error during cleanup:`, error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Main execution
const projectId = process.argv[2]

if (!projectId) {
  console.error(`\n❌ Error: Project ID is required\n`)
  console.log(`Usage: npx tsx scripts/database/cleanup-test-data.ts <projectId>\n`)
  console.log(`Example: npx tsx scripts/database/cleanup-test-data.ts cmkiixzic00039krtzw3ynm87\n`)
  process.exit(1)
}

cleanupProjectData(projectId)
