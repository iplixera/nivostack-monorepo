import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Secret key for migration endpoint (should match env var)
const MIGRATION_SECRET = process.env.MIGRATION_SECRET || 'migrate-secret-2024'

export async function POST(request: NextRequest) {
  try {
    // Check secret
    const { secret } = await request.json()
    if (secret !== MIGRATION_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const results: string[] = []

    // Check current Device columns
    const deviceColumns = await prisma.$queryRaw<{column_name: string}[]>`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'Device' AND table_schema = 'public'
    `
    const deviceColumnNames = deviceColumns.map(c => c.column_name)
    results.push(`Current Device columns: ${deviceColumnNames.join(', ')}`)

    // Add deviceCode if missing
    if (!deviceColumnNames.includes('deviceCode')) {
      await prisma.$executeRawUnsafe(`ALTER TABLE "Device" ADD COLUMN "deviceCode" TEXT`)
      results.push('Added deviceCode')
    }

    // Add user columns if missing
    if (!deviceColumnNames.includes('userId')) {
      await prisma.$executeRawUnsafe(`ALTER TABLE "Device" ADD COLUMN "userId" TEXT`)
      results.push('Added userId')
    }
    if (!deviceColumnNames.includes('userEmail')) {
      await prisma.$executeRawUnsafe(`ALTER TABLE "Device" ADD COLUMN "userEmail" TEXT`)
      results.push('Added userEmail')
    }
    if (!deviceColumnNames.includes('userName')) {
      await prisma.$executeRawUnsafe(`ALTER TABLE "Device" ADD COLUMN "userName" TEXT`)
      results.push('Added userName')
    }

    // Add debug mode columns if missing
    if (!deviceColumnNames.includes('debugModeEnabled')) {
      await prisma.$executeRawUnsafe(`ALTER TABLE "Device" ADD COLUMN "debugModeEnabled" BOOLEAN DEFAULT FALSE`)
      results.push('Added debugModeEnabled')
    }
    if (!deviceColumnNames.includes('debugModeEnabledAt')) {
      await prisma.$executeRawUnsafe(`ALTER TABLE "Device" ADD COLUMN "debugModeEnabledAt" TIMESTAMP(3)`)
      results.push('Added debugModeEnabledAt')
    }
    if (!deviceColumnNames.includes('debugModeExpiresAt')) {
      await prisma.$executeRawUnsafe(`ALTER TABLE "Device" ADD COLUMN "debugModeExpiresAt" TIMESTAMP(3)`)
      results.push('Added debugModeExpiresAt')
    }
    if (!deviceColumnNames.includes('debugModeEnabledBy')) {
      await prisma.$executeRawUnsafe(`ALTER TABLE "Device" ADD COLUMN "debugModeEnabledBy" TEXT`)
      results.push('Added debugModeEnabledBy')
    }

    // Check SdkSettings columns
    const sdkColumns = await prisma.$queryRaw<{column_name: string}[]>`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'SdkSettings' AND table_schema = 'public'
    `
    const sdkColumnNames = sdkColumns.map(c => c.column_name)
    results.push(`Current SdkSettings columns: ${sdkColumnNames.join(', ')}`)

    // Add trackingMode if missing
    if (!sdkColumnNames.includes('trackingMode')) {
      await prisma.$executeRawUnsafe(`ALTER TABLE "SdkSettings" ADD COLUMN "trackingMode" TEXT DEFAULT 'all'`)
      results.push('Added trackingMode')
    }

    // Add indexes if they don't exist
    try {
      await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Device_deviceCode_key" ON "Device"("deviceCode")`)
      results.push('Added deviceCode unique index')
    } catch (e) {
      results.push('deviceCode index already exists or failed')
    }

    try {
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Device_projectId_userId_idx" ON "Device"("projectId", "userId")`)
      results.push('Added projectId_userId index')
    } catch (e) {
      results.push('projectId_userId index already exists or failed')
    }

    try {
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Device_projectId_userEmail_idx" ON "Device"("projectId", "userEmail")`)
      results.push('Added projectId_userEmail index')
    } catch (e) {
      results.push('projectId_userEmail index already exists or failed')
    }

    try {
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Device_projectId_debugModeEnabled_idx" ON "Device"("projectId", "debugModeEnabled")`)
      results.push('Added projectId_debugModeEnabled index')
    } catch (e) {
      results.push('projectId_debugModeEnabled index already exists or failed')
    }

    return NextResponse.json({
      success: true,
      results
    })

  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({
      error: 'Migration failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
