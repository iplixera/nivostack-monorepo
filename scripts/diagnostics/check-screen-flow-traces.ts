/**
 * Diagnose Screen Flow "Unknown" issue
 * Check if traces have screenName and if they're being filtered correctly
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const projectId = process.argv[2]

  if (!projectId) {
    console.log('Usage: npx tsx scripts/diagnostics/check-screen-flow-traces.ts <project-id>')
    process.exit(1)
  }

  console.log('Analyzing Screen Flow traces for project:', projectId)
  console.log('='.repeat(80))

  // Count total traces
  const totalTraces = await prisma.apiTrace.count({
    where: { projectId }
  })

  console.log(`\nTotal traces in project: ${totalTraces}`)

  // Count traces with/without screenName
  const tracesWithScreenName = await prisma.apiTrace.count({
    where: {
      projectId,
      screenName: { not: null }
    }
  })

  const tracesWithoutScreenName = await prisma.apiTrace.count({
    where: {
      projectId,
      screenName: null
    }
  })

  console.log(`Traces WITH screenName: ${tracesWithScreenName}`)
  console.log(`Traces WITHOUT screenName (null): ${tracesWithoutScreenName}`)
  console.log()

  // Group by screenName to see distribution
  const screenNameDistribution = await prisma.apiTrace.groupBy({
    by: ['screenName'],
    where: { projectId },
    _count: true,
    orderBy: { _count: { screenName: 'desc' } }
  })

  console.log('Screen Name Distribution:')
  console.log('-'.repeat(80))
  screenNameDistribution.forEach(group => {
    const name = group.screenName || '(null)'
    const count = group._count
    console.log(`  ${name}: ${count} traces`)
  })
  console.log()

  // Check recent traces (last 50)
  console.log('Recent 20 traces:')
  console.log('-'.repeat(80))
  const recentTraces = await prisma.apiTrace.findMany({
    where: { projectId },
    select: {
      id: true,
      url: true,
      method: true,
      screenName: true,
      timestamp: true,
      sessionId: true,
      device: {
        select: {
          deviceId: true,
          model: true,
          platform: true
        }
      }
    },
    orderBy: { timestamp: 'desc' },
    take: 20
  })

  recentTraces.forEach((trace, idx) => {
    const device = trace.device
      ? `${trace.device.model || 'Unknown'} (${trace.device.platform})`
      : 'No device'

    console.log(`${idx + 1}. [${trace.timestamp.toISOString()}]`)
    console.log(`   ${trace.method} ${trace.url}`)
    console.log(`   Screen: ${trace.screenName || '❌ NULL'}`)
    console.log(`   Device: ${device}`)
    console.log(`   Session: ${trace.sessionId || 'None'}`)
    console.log()
  })

  // Check if any sessions exist
  const sessionsCount = await prisma.session.count({
    where: { projectId }
  })
  console.log(`Total sessions in project: ${sessionsCount}`)

  if (sessionsCount > 0) {
    // Show recent sessions
    const recentSessions = await prisma.session.findMany({
      where: { projectId },
      select: {
        id: true,
        sessionToken: true,
        startedAt: true,
        endedAt: true,
        isActive: true,
        device: {
          select: {
            deviceId: true,
            model: true,
            platform: true
          }
        },
        _count: {
          select: {
            traces: true
          }
        }
      },
      orderBy: { startedAt: 'desc' },
      take: 10
    })

    console.log('\nRecent 10 sessions:')
    console.log('-'.repeat(80))
    recentSessions.forEach((session, idx) => {
      const device = session.device
        ? `${session.device.model || 'Unknown'} (${session.device.platform})`
        : 'No device'

      console.log(`${idx + 1}. Session ${session.sessionToken.slice(0, 8)}...`)
      console.log(`   Started: ${session.startedAt.toISOString()}`)
      console.log(`   Status: ${session.isActive ? 'Active' : 'Ended'}`)
      console.log(`   Device: ${device}`)
      console.log(`   Traces: ${session._count.traces}`)
      console.log()
    })
  }

  // Check what Screen Flow API would return
  console.log('\n🔍 What Screen Flow API sees:')
  console.log('-'.repeat(80))
  console.log(`Traces fetched by API (screenName NOT null): ${tracesWithScreenName}`)

  if (tracesWithScreenName === 0) {
    console.log('\n❌ PROBLEM: Screen Flow API filters for screenName NOT NULL')
    console.log('   All traces have NULL screenName, so Screen Flow sees 0 traces!')
    console.log('\n✅ SOLUTION:')
    console.log('   1. Rebuild app with latest SDK (has "AppLaunch" default)')
    console.log('   2. Generate new traces by using the app')
    console.log('   3. New traces will have screenName set')
    console.log('   4. Screen Flow will show data')
  } else {
    console.log('\n✅ Screen Flow should show data!')
    console.log(`   Found ${tracesWithScreenName} traces with screenName`)
  }

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
