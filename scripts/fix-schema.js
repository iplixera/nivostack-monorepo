const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixSchema() {
  console.log('Adding missing columns to Device table...')

  try {
    // Check current columns
    const columns = await prisma.$queryRaw`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'Device' AND table_schema = 'public'
    `
    console.log('Current Device columns:', columns.map(c => c.column_name))

    // Check if deviceCode exists
    const hasDeviceCode = columns.some(c => c.column_name === 'deviceCode')

    if (!hasDeviceCode) {
      console.log('Adding deviceCode column...')
      await prisma.$executeRaw`ALTER TABLE "Device" ADD COLUMN IF NOT EXISTS "deviceCode" TEXT`
      console.log('deviceCode added!')
    } else {
      console.log('deviceCode already exists')
    }

    // Check if other device columns exist
    const hasUserId = columns.some(c => c.column_name === 'userId')
    if (!hasUserId) {
      console.log('Adding user columns...')
      await prisma.$executeRaw`ALTER TABLE "Device" ADD COLUMN IF NOT EXISTS "userId" TEXT`
      await prisma.$executeRaw`ALTER TABLE "Device" ADD COLUMN IF NOT EXISTS "userEmail" TEXT`
      await prisma.$executeRaw`ALTER TABLE "Device" ADD COLUMN IF NOT EXISTS "userName" TEXT`
      console.log('User columns added!')
    }

    // Check if debug columns exist
    const hasDebugMode = columns.some(c => c.column_name === 'debugModeEnabled')
    if (!hasDebugMode) {
      console.log('Adding debug mode columns...')
      await prisma.$executeRaw`ALTER TABLE "Device" ADD COLUMN IF NOT EXISTS "debugModeEnabled" BOOLEAN DEFAULT FALSE`
      await prisma.$executeRaw`ALTER TABLE "Device" ADD COLUMN IF NOT EXISTS "debugModeEnabledAt" TIMESTAMP(3)`
      await prisma.$executeRaw`ALTER TABLE "Device" ADD COLUMN IF NOT EXISTS "debugModeExpiresAt" TIMESTAMP(3)`
      await prisma.$executeRaw`ALTER TABLE "Device" ADD COLUMN IF NOT EXISTS "debugModeEnabledBy" TEXT`
      console.log('Debug mode columns added!')
    }

    // Check SdkSettings trackingMode
    const sdkColumns = await prisma.$queryRaw`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'SdkSettings' AND table_schema = 'public'
    `
    console.log('Current SdkSettings columns:', sdkColumns.map(c => c.column_name))

    const hasTrackingMode = sdkColumns.some(c => c.column_name === 'trackingMode')
    if (!hasTrackingMode) {
      console.log('Adding trackingMode column to SdkSettings...')
      await prisma.$executeRaw`ALTER TABLE "SdkSettings" ADD COLUMN IF NOT EXISTS "trackingMode" TEXT DEFAULT 'all'`
      console.log('trackingMode added!')
    } else {
      console.log('trackingMode already exists')
    }

    console.log('\nSchema fix complete!')

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixSchema()
