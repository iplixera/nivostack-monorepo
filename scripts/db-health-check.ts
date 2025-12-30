import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🏥 Database Health Check')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('')

  try {
    // Test connection
    console.log('🔌 Testing database connection...')
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    console.log('')

    // Get database stats
    console.log('📊 Database Statistics:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    const [
      userCount,
      projectCount,
      deviceCount,
      sessionCount,
      logCount,
      traceCount,
      crashCount
    ] = await Promise.all([
      prisma.user.count(),
      prisma.project.count(),
      prisma.device.count(),
      prisma.session.count(),
      prisma.log.count(),
      prisma.apiTrace.count(),
      prisma.crash.count()
    ])

    console.log(`   Users:      ${userCount.toLocaleString()}`)
    console.log(`   Projects:   ${projectCount.toLocaleString()}`)
    console.log(`   Devices:    ${deviceCount.toLocaleString()}`)
    console.log(`   Sessions:   ${sessionCount.toLocaleString()}`)
    console.log(`   Logs:       ${logCount.toLocaleString()}`)
    console.log(`   API Traces: ${traceCount.toLocaleString()}`)
    console.log(`   Crashes:    ${crashCount.toLocaleString()}`)
    console.log('')

    // Check recent activity
    console.log('🕐 Recent Activity:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    const recentDevice = await prisma.device.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { 
        deviceCode: true, 
        platform: true, 
        createdAt: true 
      }
    })

    if (recentDevice) {
      const timeSince = Math.floor((Date.now() - recentDevice.createdAt.getTime()) / 1000)
      console.log(`   Last Device: ${recentDevice.deviceCode || 'N/A'} (${recentDevice.platform})`)
      console.log(`   Registered: ${formatTimeSince(timeSince)} ago`)
    } else {
      console.log('   No devices registered yet')
    }

    const recentLog = await prisma.log.findFirst({
      orderBy: { timestamp: 'desc' },
      select: { level: true, message: true, timestamp: true }
    })

    if (recentLog) {
      const timeSince = Math.floor((Date.now() - recentLog.timestamp.getTime()) / 1000)
      console.log(`   Last Log: [${recentLog.level}] ${recentLog.message.substring(0, 50)}`)
      console.log(`   Logged: ${formatTimeSince(timeSince)} ago`)
    }

    console.log('')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ Database health check passed!')
    console.log('')

  } catch (error) {
    console.log('')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.error('❌ Database health check failed!')
    console.log('')
    console.error('Error:', error)
    console.log('')
    console.log('Troubleshooting:')
    console.log('1. Check POSTGRES_PRISMA_URL is set correctly')
    console.log('2. Verify database is accessible')
    console.log('3. Run: pnpm prisma db push')
    console.log('4. Check Vercel logs for more details')
    console.log('')
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

function formatTimeSince(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
  return `${Math.floor(seconds / 86400)}d`
}

main()

