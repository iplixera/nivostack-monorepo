/**
 * Check device details to understand why "Unknown" appears
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const projectId = process.argv[2]

  if (!projectId) {
    console.log('Usage: npx tsx scripts/diagnostics/check-devices-detailed.ts <project-id>')
    process.exit(1)
  }

  console.log('Checking devices for project:', projectId)
  console.log('='.repeat(80))

  // Get all devices
  const devices = await prisma.device.findMany({
    where: { projectId },
    orderBy: { lastSeenAt: 'desc' }
  })

  console.log(`\nFound ${devices.length} devices:\n`)

  devices.forEach((device, idx) => {
    console.log(`Device ${idx + 1}:`)
    console.log(`  ID: ${device.id}`)
    console.log(`  Device ID: ${device.deviceId}`)
    console.log(`  Device Code: ${device.deviceCode || '❌ NULL'}`)
    console.log(`  Model: ${device.model || '❌ NULL'}`)
    console.log(`  Manufacturer: ${device.manufacturer || '❌ NULL'}`)
    console.log(`  Platform: ${device.platform}`)
    console.log(`  OS Version: ${device.osVersion || 'Unknown'}`)
    console.log(`  App Version: ${device.appVersion || 'Unknown'}`)
    console.log(`  Last Seen: ${device.lastSeenAt.toISOString()}`)
    console.log()
  })

  // Get sessions with device info
  const sessions = await prisma.session.findMany({
    where: { projectId },
    include: {
      device: true,
      _count: {
        select: { traces: true }
      }
    },
    orderBy: { startedAt: 'desc' },
    take: 20
  })

  console.log(`\nRecent 20 sessions:\n`)

  sessions.forEach((session, idx) => {
    const device = session.device
    console.log(`Session ${idx + 1}:`)
    console.log(`  Session Token: ${session.sessionToken}`)
    console.log(`  Started: ${session.startedAt.toISOString()}`)
    console.log(`  Traces: ${session._count.traces}`)

    if (device) {
      console.log(`  Device:`)
      console.log(`    Model: ${device.model || '❌ NULL'}`)
      console.log(`    Manufacturer: ${device.manufacturer || '❌ NULL'}`)
      console.log(`    Device Code: ${device.deviceCode || '❌ NULL'}`)
      console.log(`    Platform: ${device.platform}`)
    } else {
      console.log(`  Device: ❌ NULL (no device linked)`)
    }
    console.log()
  })

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
