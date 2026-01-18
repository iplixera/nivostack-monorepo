/**
 * Find Pixel device in database
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const projectId = process.argv[2]

  if (!projectId) {
    console.log('Usage: npx tsx scripts/diagnostics/check-pixel-device.ts <project-id>')
    process.exit(1)
  }

  console.log('Searching for Pixel devices in project:', projectId)
  console.log('='.repeat(80))

  // Find all devices for project
  const devices = await prisma.device.findMany({
    where: { projectId },
    orderBy: { lastSeenAt: 'desc' }
  })

  console.log(`\nFound ${devices.length} devices:\n`)

  devices.forEach((device, idx) => {
    console.log(`Device ${idx + 1}:`)
    console.log(`  ID: ${device.id}`)
    console.log(`  Device ID: ${device.deviceId}`)
    console.log(`  Model: ${device.model || 'Unknown'}`)
    console.log(`  Manufacturer: ${device.manufacturer || 'Unknown'}`)
    console.log(`  Platform: ${device.platform}`)
    console.log(`  OS Version: ${device.osVersion || 'Unknown'}`)
    console.log(`  App Version: ${device.appVersion || 'Unknown'}`)
    console.log(`  Device Code: ${device.deviceCode || 'None'}`)
    console.log(`  User ID: ${device.userId || 'None'}`)
    console.log(`  User Email: ${device.userEmail || 'None'}`)
    console.log(`  User Name: ${device.userName || 'None'}`)
    console.log(`  Last Seen: ${device.lastSeenAt.toISOString()}`)
    console.log(`  Debug Mode: ${device.debugModeEnabled ? 'Enabled' : 'Disabled'}`)
    console.log()
  })

  // Find Pixel devices
  const pixelDevices = devices.filter(d =>
    d.model?.toLowerCase().includes('pixel') ||
    d.manufacturer?.toLowerCase().includes('google')
  )

  if (pixelDevices.length > 0) {
    console.log(`\n🎯 Found ${pixelDevices.length} Pixel device(s):`)
    pixelDevices.forEach((device, idx) => {
      console.log(`\nPixel ${idx + 1}:`)
      console.log(`  Model: ${device.model}`)
      console.log(`  Device ID: ${device.deviceId}`)
      console.log(`  Last Seen: ${device.lastSeenAt.toISOString()}`)
    })
  } else {
    console.log('\n⚠️  No Pixel devices found')
    console.log('\nTip: Check if the app is sending device model/manufacturer info')
  }

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
