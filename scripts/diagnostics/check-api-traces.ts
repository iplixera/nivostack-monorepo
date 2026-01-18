#!/usr/bin/env tsx
/**
 * Diagnostic script to check API traces data and investigate issues
 *
 * Usage: tsx scripts/diagnostics/check-api-traces.ts <projectId> [options]
 *
 * Options:
 *   --sessions <tokens>  Check specific session tokens (comma-separated)
 *   --devices            Show device information
 *   --errors-only        Show only error traces (4xx, 5xx, 0)
 *   --no-screen          Show only traces without screenName
 *   --limit <n>          Limit number of traces to check (default: 20)
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface Options {
  sessionTokens?: string[]
  showDevices?: boolean
  errorsOnly?: boolean
  noScreenOnly?: boolean
  limit?: number
}

async function main() {
  const args = process.argv.slice(2)
  const projectId = args[0]

  if (!projectId) {
    console.error('Usage: tsx scripts/diagnostics/check-api-traces.ts <projectId> [options]')
    console.error('\nOptions:')
    console.error('  --sessions <tokens>  Check specific session tokens (comma-separated)')
    console.error('  --devices            Show device information')
    console.error('  --errors-only        Show only error traces (4xx, 5xx, 0)')
    console.error('  --no-screen          Show only traces without screenName')
    console.error('  --limit <n>          Limit number of traces (default: 20)')
    process.exit(1)
  }

  // Parse options
  const options: Options = {
    limit: 20
  }

  for (let i = 1; i < args.length; i++) {
    switch (args[i]) {
      case '--sessions':
        options.sessionTokens = args[++i]?.split(',').map(t => t.trim())
        break
      case '--devices':
        options.showDevices = true
        break
      case '--errors-only':
        options.errorsOnly = true
        break
      case '--no-screen':
        options.noScreenOnly = true
        break
      case '--limit':
        options.limit = parseInt(args[++i]) || 20
        break
    }
  }

  console.log(`\n🔍 API Traces Diagnostics for Project: ${projectId}\n`)

  // 1. Check project exists
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, name: true, apiKey: true }
  })

  if (!project) {
    console.error('❌ Project not found')
    process.exit(1)
  }

  console.log(`✅ Project: ${project.name}`)
  console.log(`   API Key: ${project.apiKey}`)

  // 2. Check feature flags
  const featureFlags = await prisma.featureFlag.findUnique({
    where: { projectId },
    select: {
      apiTracking: true,
      screenTracking: true,
      sessionTracking: true,
      sdkEnabled: true
    }
  })

  console.log(`\n📋 Feature Flags:`)
  console.log(`   apiTracking: ${featureFlags?.apiTracking ?? 'N/A'}`)
  console.log(`   screenTracking: ${featureFlags?.screenTracking ?? 'N/A'}`)
  console.log(`   sessionTracking: ${featureFlags?.sessionTracking ?? 'N/A'}`)
  console.log(`   sdkEnabled: ${featureFlags?.sdkEnabled ?? 'N/A'}`)

  // 3. Get trace statistics
  const totalTraces = await prisma.apiTrace.count({ where: { projectId } })
  const tracesWithScreen = await prisma.apiTrace.count({
    where: { projectId, screenName: { not: null } }
  })
  const tracesWithoutScreen = await prisma.apiTrace.count({
    where: { projectId, screenName: null }
  })
  const tracesWithSession = await prisma.apiTrace.count({
    where: { projectId, sessionId: { not: null } }
  })
  const tracesWithoutSession = await prisma.apiTrace.count({
    where: { projectId, sessionId: null }
  })
  const orphanTraces = await prisma.apiTrace.count({
    where: {
      projectId,
      screenName: { not: null },
      sessionId: null
    }
  })

  // Error traces
  const errorTraces = await prisma.apiTrace.count({
    where: {
      projectId,
      OR: [
        { statusCode: 0 },
        { statusCode: { gte: 400 } }
      ]
    }
  })

  console.log(`\n📊 Trace Statistics:`)
  console.log(`   Total traces: ${totalTraces}`)
  console.log(`   With screenName: ${tracesWithScreen} (${((tracesWithScreen/totalTraces)*100).toFixed(1)}%)`)
  console.log(`   Without screenName: ${tracesWithoutScreen} (${((tracesWithoutScreen/totalTraces)*100).toFixed(1)}%)`)
  console.log(`   With sessionId: ${tracesWithSession} (${((tracesWithSession/totalTraces)*100).toFixed(1)}%)`)
  console.log(`   Without sessionId: ${tracesWithoutSession} (${((tracesWithoutSession/totalTraces)*100).toFixed(1)}%)`)
  console.log(`   Orphans (screen but no session): ${orphanTraces}`)
  console.log(`   Error traces (4xx/5xx/0): ${errorTraces} (${((errorTraces/totalTraces)*100).toFixed(1)}%)`)

  // 4. Check sessions if checking specific tokens
  if (options.sessionTokens && options.sessionTokens.length > 0) {
    console.log(`\n🔗 Checking specific sessions:`)
    for (const token of options.sessionTokens) {
      const session = await prisma.session.findUnique({
        where: { sessionToken: token },
        select: {
          id: true,
          sessionToken: true,
          deviceId: true,
          startedAt: true,
          isActive: true,
          screenFlow: true,
          appVersion: true
        }
      })

      if (!session) {
        console.log(`   ❌ Session ${token} not found`)
        continue
      }

      console.log(`\n   Session: ${session.id}`)
      console.log(`   Token: ${session.sessionToken}`)
      console.log(`   Device ID: ${session.deviceId || 'NULL'}`)
      console.log(`   App Version: ${session.appVersion}`)
      console.log(`   Started: ${session.startedAt.toISOString()}`)
      console.log(`   Active: ${session.isActive}`)
      console.log(`   Screens: ${session.screenFlow.length > 0 ? session.screenFlow.join(' → ') : 'None'}`)

      // Check traces for this session
      const sessionTraces = await prisma.apiTrace.findMany({
        where: {
          OR: [
            { sessionId: session.id },
            // Also check by deviceId if session has device
            session.deviceId ? { deviceId: session.deviceId } : {}
          ]
        },
        select: {
          id: true,
          url: true,
          method: true,
          statusCode: true,
          screenName: true,
          sessionId: true,
          deviceId: true,
          timestamp: true
        },
        orderBy: { timestamp: 'desc' },
        take: options.limit
      })

      console.log(`   Traces: ${sessionTraces.length} found`)
      sessionTraces.forEach(trace => {
        const status = trace.statusCode >= 200 && trace.statusCode < 300 ? '✅' :
                      trace.statusCode >= 400 || trace.statusCode === 0 ? '❌' : '⚠️'
        const hasScreen = trace.screenName ? '✅' : '❌'
        const hasSession = trace.sessionId === session.id ? '✅' : '❌'

        console.log(`     ${status} ${trace.statusCode} | ${hasScreen} Screen: ${trace.screenName || 'NULL'} | ${hasSession} Linked`)
        console.log(`        ${trace.method} ${trace.url.slice(0, 80)}`)
        console.log(`        Time: ${trace.timestamp.toISOString()}`)
      })
    }
  }

  // 5. Get environment breakdown
  const allTraces = await prisma.apiTrace.findMany({
    where: { projectId },
    select: { url: true },
    take: 1000 // Sample
  })

  const environments = new Map<string, number>()
  allTraces.forEach(trace => {
    try {
      const url = new URL(trace.url)
      const hostname = url.hostname
      environments.set(hostname, (environments.get(hostname) || 0) + 1)
    } catch {
      environments.set('invalid-url', (environments.get('invalid-url') || 0) + 1)
    }
  })

  console.log(`\n🌍 Environment Breakdown (sampled ${allTraces.length} traces):`)
  Array.from(environments.entries())
    .sort((a, b) => b[1] - a[1])
    .forEach(([env, count]) => {
      const percentage = ((count / allTraces.length) * 100).toFixed(1)
      console.log(`   ${env}: ${count} (${percentage}%)`)
    })

  // 6. Status code breakdown
  const statusCodes = await prisma.apiTrace.groupBy({
    by: ['statusCode'],
    where: { projectId },
    _count: true,
    orderBy: { statusCode: 'asc' }
  })

  console.log(`\n📈 Status Code Breakdown:`)
  statusCodes.forEach(({ statusCode, _count }) => {
    const emoji = statusCode >= 200 && statusCode < 300 ? '✅' :
                 statusCode >= 400 || statusCode === 0 ? '❌' : '⚠️'
    const statusName = getStatusName(statusCode)
    const percentage = ((_count / totalTraces) * 100).toFixed(1)
    console.log(`   ${emoji} ${statusCode} ${statusName}: ${_count} (${percentage}%)`)
  })

  // 7. Recent traces (with filters)
  const traceWhere: any = { projectId }
  if (options.errorsOnly) {
    traceWhere.OR = [
      { statusCode: 0 },
      { statusCode: { gte: 400 } }
    ]
  }
  if (options.noScreenOnly) {
    traceWhere.screenName = null
  }

  const recentTraces = await prisma.apiTrace.findMany({
    where: traceWhere,
    select: {
      id: true,
      url: true,
      method: true,
      statusCode: true,
      screenName: true,
      sessionId: true,
      deviceId: true,
      timestamp: true,
      error: true,
      device: options.showDevices ? {
        select: {
          deviceId: true,
          platform: true,
          model: true,
          appVersion: true
        }
      } : false
    },
    orderBy: { timestamp: 'desc' },
    take: options.limit
  })

  const filterDesc = options.errorsOnly ? ' (errors only)' : options.noScreenOnly ? ' (no screenName only)' : ''
  console.log(`\n🌐 Recent Traces${filterDesc} (limit: ${options.limit}):`)

  if (recentTraces.length === 0) {
    console.log(`   No traces found matching filters`)
  } else {
    recentTraces.forEach(trace => {
      const status = trace.statusCode >= 200 && trace.statusCode < 300 ? '✅' :
                    trace.statusCode >= 400 || trace.statusCode === 0 ? '❌' : '⚠️'
      const hasScreen = trace.screenName ? '✅' : '❌'
      const hasSession = trace.sessionId ? '✅' : '❌'
      const hasDevice = trace.deviceId ? '✅' : '❌'

      console.log(`\n   ${status} ${trace.method} ${trace.statusCode} - ${trace.url.slice(0, 60)}`)
      console.log(`      Time: ${trace.timestamp.toISOString()}`)
      console.log(`      ${hasScreen} Screen: ${trace.screenName || 'NULL'}`)
      console.log(`      ${hasSession} Session: ${trace.sessionId ? trace.sessionId.slice(0, 12) + '...' : 'NULL'}`)
      console.log(`      ${hasDevice} Device: ${trace.deviceId ? trace.deviceId.slice(0, 12) + '...' : 'NULL'}`)

      if (trace.error) {
        console.log(`      ⚠️  Error: ${trace.error}`)
      }

      if (options.showDevices && trace.device) {
        console.log(`      📱 ${trace.device.platform} ${trace.device.model} (${trace.device.appVersion})`)
      }
    })
  }

  // 8. Issue detection
  console.log(`\n🔍 Issue Detection:`)

  const issues: string[] = []

  if (tracesWithoutScreen > totalTraces * 0.3) {
    issues.push(`⚠️  ${((tracesWithoutScreen/totalTraces)*100).toFixed(1)}% of traces missing screenName`)
    issues.push(`   → Check if trackScreen() is called before API calls`)
    issues.push(`   → Check if Fix #11 (screenName in interceptor) is deployed`)
  }

  if (orphanTraces > 0) {
    issues.push(`⚠️  ${orphanTraces} orphan traces (screenName but no sessionId)`)
    issues.push(`   → Traces captured before session started`)
    issues.push(`   → SDK v1.0.1 fixes this issue`)
  }

  if (tracesWithoutSession > totalTraces * 0.5) {
    issues.push(`⚠️  ${((tracesWithoutSession/totalTraces)*100).toFixed(1)}% of traces missing sessionId`)
    issues.push(`   → Session tracking might be failing`)
    issues.push(`   → Check if sessionToken is being sent with traces`)
  }

  if (errorTraces > totalTraces * 0.2) {
    issues.push(`⚠️  ${((errorTraces/totalTraces)*100).toFixed(1)}% of traces are errors`)
    issues.push(`   → High error rate detected`)
    issues.push(`   → Check backend logs and API health`)
  }

  if (issues.length === 0) {
    console.log(`   ✅ No issues detected!`)
  } else {
    issues.forEach(issue => console.log(`   ${issue}`))
  }

  console.log(`\n`)
}

function getStatusName(code: number): string {
  const names: Record<number, string> = {
    0: 'Network Error',
    200: 'OK',
    201: 'Created',
    204: 'No Content',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    417: 'Expectation Failed',
    500: 'Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable'
  }
  return names[code] || ''
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
