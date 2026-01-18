#!/usr/bin/env tsx
/**
 * Diagnostic script to check screen flow data
 *
 * Usage: tsx scripts/diagnostics/check-screen-flow.ts <projectId>
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const projectId = process.argv[2]

  if (!projectId) {
    console.error('Usage: tsx scripts/diagnostics/check-screen-flow.ts <projectId>')
    process.exit(1)
  }

  console.log(`\n🔍 Screen Flow Diagnostics for Project: ${projectId}\n`)

  // 1. Check project exists
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, name: true }
  })

  if (!project) {
    console.error('❌ Project not found')
    process.exit(1)
  }

  console.log(`✅ Project: ${project.name}`)

  // 2. Check feature flags
  const featureFlags = await prisma.featureFlag.findUnique({
    where: { projectId },
    select: {
      sessionTracking: true,
      screenTracking: true,
      apiTracking: true,
      sdkEnabled: true
    }
  })

  console.log(`\n📋 Feature Flags:`)
  console.log(`   sessionTracking: ${featureFlags?.sessionTracking ?? 'N/A'}`)
  console.log(`   screenTracking: ${featureFlags?.screenTracking ?? 'N/A'}`)
  console.log(`   apiTracking: ${featureFlags?.apiTracking ?? 'N/A'}`)
  console.log(`   sdkEnabled: ${featureFlags?.sdkEnabled ?? 'N/A'}`)

  // 3. Check sessions
  const sessions = await prisma.session.findMany({
    where: { projectId },
    select: {
      id: true,
      sessionToken: true,
      startedAt: true,
      isActive: true,
      screenFlow: true,
      deviceId: true
    },
    orderBy: { startedAt: 'desc' },
    take: 5
  })

  console.log(`\n📊 Sessions (last 5):`)
  if (sessions.length === 0) {
    console.log(`   ❌ No sessions found!`)
  } else {
    sessions.forEach(session => {
      console.log(`   - ${session.id.slice(0, 8)}... | Active: ${session.isActive} | Screens: ${session.screenFlow.length} | Started: ${session.startedAt.toISOString()}`)
      if (session.screenFlow.length > 0) {
        console.log(`     Screens: ${session.screenFlow.join(' → ')}`)
      }
    })
  }

  // 4. Check API traces
  const traces = await prisma.apiTrace.findMany({
    where: { projectId },
    select: {
      id: true,
      screenName: true,
      sessionId: true,
      url: true,
      method: true,
      timestamp: true
    },
    orderBy: { timestamp: 'desc' },
    take: 10
  })

  console.log(`\n🌐 API Traces (last 10):`)
  if (traces.length === 0) {
    console.log(`   ❌ No traces found!`)
  } else {
    traces.forEach(trace => {
      const hasScreen = trace.screenName ? '✅' : '❌'
      const hasSession = trace.sessionId ? '✅' : '❌'
      console.log(`   ${hasScreen} Screen: ${trace.screenName || 'NULL'} | ${hasSession} Session: ${trace.sessionId ? trace.sessionId.slice(0, 8) + '...' : 'NULL'}`)
      console.log(`      ${trace.method} ${trace.url}`)
    })
  }

  // 5. Check traces with screenName but no sessionId
  const orphanTraces = await prisma.apiTrace.count({
    where: {
      projectId,
      screenName: { not: null },
      sessionId: null
    }
  })

  if (orphanTraces > 0) {
    console.log(`\n⚠️  Warning: ${orphanTraces} traces have screenName but NO sessionId!`)
  }

  // 6. Check traces with sessionId
  const tracesWithSession = await prisma.apiTrace.count({
    where: {
      projectId,
      sessionId: { not: null }
    }
  })

  const tracesWithScreenName = await prisma.apiTrace.count({
    where: {
      projectId,
      screenName: { not: null }
    }
  })

  console.log(`\n📈 Summary:`)
  console.log(`   Total sessions: ${sessions.length}`)
  console.log(`   Total traces: ${traces.length}`)
  console.log(`   Traces with screenName: ${tracesWithScreenName}`)
  console.log(`   Traces with sessionId: ${tracesWithSession}`)
  console.log(`   Orphan traces (screenName but no sessionId): ${orphanTraces}`)

  // 7. Flow API simulation
  const flowTraces = await prisma.apiTrace.findMany({
    where: {
      projectId,
      screenName: { not: null }
    },
    select: {
      sessionId: true,
      session: {
        select: {
          id: true,
          sessionToken: true
        }
      }
    }
  })

  const sessionsInFlow = new Set()
  flowTraces.forEach(trace => {
    if (trace.sessionId && trace.session) {
      sessionsInFlow.add(trace.sessionId)
    }
  })

  console.log(`\n🎯 Flow API would show:`)
  console.log(`   Sessions with screenName traces: ${sessionsInFlow.size}`)

  if (sessionsInFlow.size === 0) {
    console.log(`\n❌ PROBLEM IDENTIFIED:`)
    if (sessions.length === 0) {
      console.log(`   → No sessions exist! Session tracking might be failing.`)
    } else if (tracesWithScreenName === 0) {
      console.log(`   → No traces have screenName! Check if SDK fix is deployed.`)
    } else if (orphanTraces > 0) {
      console.log(`   → Traces have screenName but no sessionId!`)
      console.log(`   → This means traces are being created without a session.`)
      console.log(`   → Check if sessionToken is being sent with traces.`)
    }
  }

  console.log(`\n`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
