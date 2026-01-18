#!/usr/bin/env tsx
/**
 * Diagnostic script to check API traces via the dashboard API
 * This doesn't require direct database access - uses the deployed API instead
 *
 * Usage:
 *   tsx scripts/diagnostics/check-traces-via-api.ts <dashboard-url> <project-id>
 *
 * Example:
 *   tsx scripts/diagnostics/check-traces-via-api.ts https://nivostack.vercel.app cmkiixzic00029krtffzbx10x
 */

interface Trace {
  id: string
  url: string
  method: string
  statusCode: number
  screenName: string | null
  deviceId: string | null
  sessionId: string | null
  duration: number
  timestamp: string
  error: string | null
}

async function checkTraces(dashboardUrl: string, projectId: string, sessionCookie: string) {
  console.log('🔍 API Traces Diagnostic Tool')
  console.log('━'.repeat(80))
  console.log(`Dashboard: ${dashboardUrl}`)
  console.log(`Project ID: ${projectId}`)
  console.log('')

  // Helper to fetch traces with filters
  async function fetchTraces(filters: Record<string, string> = {}) {
    const params = new URLSearchParams({
      projectId,
      limit: '1000', // Fetch many traces for analysis
      ...filters
    })

    const response = await fetch(`${dashboardUrl}/api/traces?${params}`, {
      headers: {
        'Cookie': sessionCookie
      }
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.traces as Trace[]
  }

  try {
    // 1. Fetch all traces
    console.log('📊 Fetching all traces...')
    const allTraces = await fetchTraces()
    console.log(`Found ${allTraces.length} total traces\n`)

    // 2. Analyze missing screenName
    const tracesWithoutScreen = allTraces.filter(t => !t.screenName)
    const tracesWithScreen = allTraces.filter(t => t.screenName)

    console.log('🔍 Screen Name Analysis:')
    console.log(`  ✅ With screenName: ${tracesWithScreen.length} (${(tracesWithScreen.length / allTraces.length * 100).toFixed(1)}%)`)
    console.log(`  ❌ Without screenName: ${tracesWithoutScreen.length} (${(tracesWithoutScreen.length / allTraces.length * 100).toFixed(1)}%)`)
    console.log('')

    // 3. Show sample traces without screenName
    if (tracesWithoutScreen.length > 0) {
      console.log('📋 Sample traces WITHOUT screenName:')
      tracesWithoutScreen.slice(0, 5).forEach(trace => {
        console.log(`  - ${trace.method} ${trace.url}`)
        console.log(`    Status: ${trace.statusCode}, Device: ${trace.deviceId || 'null'}, Session: ${trace.sessionId || 'null'}`)
        console.log(`    Timestamp: ${trace.timestamp}`)
      })
      console.log('')
    }

    // 4. Analyze error status codes
    const errorTraces = allTraces.filter(t => t.statusCode >= 400 || t.statusCode === 0)
    console.log('🚨 Error Traces Analysis:')
    console.log(`  Total errors: ${errorTraces.length} (${(errorTraces.length / allTraces.length * 100).toFixed(1)}%)`)

    // Group by status code
    const statusCodeGroups: Record<number, number> = {}
    errorTraces.forEach(trace => {
      statusCodeGroups[trace.statusCode] = (statusCodeGroups[trace.statusCode] || 0) + 1
    })

    console.log('  Breakdown by status code:')
    Object.entries(statusCodeGroups)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .forEach(([code, count]) => {
        console.log(`    ${code}: ${count} traces`)
      })
    console.log('')

    // 5. Show 404/417 examples
    const error404 = allTraces.filter(t => t.statusCode === 404)
    const error417 = allTraces.filter(t => t.statusCode === 417)

    if (error404.length > 0) {
      console.log(`📋 404 Errors (${error404.length} total):`)
      error404.slice(0, 3).forEach(trace => {
        console.log(`  - ${trace.method} ${trace.url}`)
        console.log(`    Screen: ${trace.screenName || 'null'}, Session: ${trace.sessionId || 'null'}`)
      })
      console.log('')
    }

    if (error417.length > 0) {
      console.log(`📋 417 Errors (${error417.length} total):`)
      error417.slice(0, 3).forEach(trace => {
        console.log(`  - ${trace.method} ${trace.url}`)
        console.log(`    Screen: ${trace.screenName || 'null'}, Session: ${trace.sessionId || 'null'}`)
      })
      console.log('')
    }

    // 6. Environment breakdown
    const environments: Record<string, number> = {}
    allTraces.forEach(trace => {
      try {
        const url = new URL(trace.url)
        const hostname = url.hostname
        environments[hostname] = (environments[hostname] || 0) + 1
      } catch {
        // Invalid URL
      }
    })

    console.log('🌍 Environment Breakdown:')
    Object.entries(environments)
      .sort(([, a], [, b]) => b - a)
      .forEach(([env, count]) => {
        console.log(`  ${env}: ${count} traces (${(count / allTraces.length * 100).toFixed(1)}%)`)
      })
    console.log('')

    // 7. Session analysis
    const tracesWithSession = allTraces.filter(t => t.sessionId)
    const tracesWithoutSession = allTraces.filter(t => !t.sessionId)

    console.log('🔗 Session Linking Analysis:')
    console.log(`  ✅ With sessionId: ${tracesWithSession.length} (${(tracesWithSession.length / allTraces.length * 100).toFixed(1)}%)`)
    console.log(`  ❌ Without sessionId: ${tracesWithoutSession.length} (${(tracesWithoutSession.length / allTraces.length * 100).toFixed(1)}%)`)
    console.log('')

    // 8. Recommendations
    console.log('💡 Recommendations:')

    if (tracesWithoutScreen.length > 0) {
      console.log('  ⚠️  Some traces missing screenName:')
      console.log('     - Check if API calls happen before trackScreen() is called')
      console.log('     - Verify interceptor is capturing screenName correctly')
      console.log('     - Ensure all activities call trackScreen() in onCreate()')
    }

    if (tracesWithoutSession.length > 0) {
      console.log('  ⚠️  Some traces missing sessionId:')
      console.log('     - These might be from older SDK versions (before v1.0.1 fix)')
      console.log('     - Verify app is using SDK v1.0.1 or later')
      console.log('     - Check if session is starting properly')
    }

    if (error404.length === 0 && error417.length === 0) {
      console.log('  ⚠️  No 404 or 417 errors found in dashboard:')
      console.log('     - If you see these in local logs, check:')
      console.log('       1. Is debug mode enabled on the device?')
      console.log('       2. Are traces being flushed? (check pending count)')
      console.log('       3. Is the app properly pausing to trigger flush?')
    }

    console.log('')
    console.log('✅ Analysis complete!')

  } catch (error) {
    console.error('❌ Error:', error)
    if (error instanceof Error) {
      console.error('   Stack:', error.stack)
    }
  }
}

// Main
const args = process.argv.slice(2)
if (args.length < 2) {
  console.error('Usage: tsx scripts/diagnostics/check-traces-via-api.ts <dashboard-url> <project-id>')
  console.error('')
  console.error('Example:')
  console.error('  tsx scripts/diagnostics/check-traces-via-api.ts https://nivostack.vercel.app cmkiixzic00029krtffzbx10x')
  console.error('')
  console.error('Note: You need to be logged in. Export your session cookie:')
  console.error('  1. Open the dashboard in your browser')
  console.error('  2. Open DevTools > Application > Cookies')
  console.error('  3. Find the session cookie (usually "next-auth.session-token")')
  console.error('  4. Set it as SESSION_COOKIE environment variable')
  console.error('')
  console.error('  SESSION_COOKIE="your-cookie-value" tsx scripts/diagnostics/check-traces-via-api.ts ...')
  process.exit(1)
}

const [dashboardUrl, projectId] = args
const sessionCookie = process.env.SESSION_COOKIE || ''

if (!sessionCookie) {
  console.error('❌ SESSION_COOKIE environment variable not set')
  console.error('   Export your session cookie from the dashboard')
  process.exit(1)
}

checkTraces(dashboardUrl, projectId, sessionCookie)
