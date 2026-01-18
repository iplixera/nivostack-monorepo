#!/usr/bin/env tsx
/**
 * Diagnostic script to analyze API traces using Supabase API
 * This uses the Supabase service role key to directly query the database
 *
 * Usage:
 *   tsx scripts/diagnostics/analyze-traces-supabase.ts <project-id>
 *
 * Example:
 *   tsx scripts/diagnostics/analyze-traces-supabase.ts cmkiixzic00029krtffzbx10x
 */

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://pxtdfnwvixmyxhcdcgup.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

interface Trace {
  id: string
  projectId: string
  deviceId: string | null
  sessionId: string | null
  url: string
  method: string
  statusCode: number
  statusMessage: string | null
  duration: number
  requestHeaders: any
  requestBody: string | null
  responseHeaders: any
  responseBody: string | null
  error: string | null
  screenName: string | null
  networkType: string | null
  timestamp: string
  createdAt: string
}

async function analyzeTraces(projectId: string) {
  console.log('🔍 API Traces Analysis via Supabase')
  console.log('━'.repeat(80))
  console.log(`Project ID: ${projectId}`)
  console.log(`Supabase URL: ${SUPABASE_URL}`)
  console.log('')

  if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY not set')
    console.error('   Set it from .env.local.bak or environment')
    process.exit(1)
  }

  // Helper to query Supabase
  async function query<T>(table: string, params: Record<string, any> = {}): Promise<T[]> {
    const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`)

    // Add query parameters
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value))
    })

    const response = await fetch(url.toString(), {
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Supabase query failed: ${response.status} ${response.statusText}\n${error}`)
    }

    return await response.json()
  }

  try {
    // 1. Fetch all traces for this project (limit to recent 1000)
    console.log('📊 Fetching traces from database...')
    const traces = await query<Trace>('ApiTrace', {
      'projectId': `eq.${projectId}`,
      'order': 'createdAt.desc',
      'limit': 1000
    })

    console.log(`Found ${traces.length} traces\n`)

    if (traces.length === 0) {
      console.log('⚠️  No traces found for this project')
      return
    }

    // 2. Analyze missing screenName
    const tracesWithoutScreen = traces.filter(t => !t.screenName)
    const tracesWithScreen = traces.filter(t => t.screenName)

    console.log('🔍 Screen Name Analysis:')
    console.log(`  ✅ With screenName: ${tracesWithScreen.length} (${(tracesWithScreen.length / traces.length * 100).toFixed(1)}%)`)
    console.log(`  ❌ Without screenName: ${tracesWithoutScreen.length} (${(tracesWithoutScreen.length / traces.length * 100).toFixed(1)}%)`)
    console.log('')

    // 3. Show sample traces without screenName
    if (tracesWithoutScreen.length > 0) {
      console.log('📋 Sample traces WITHOUT screenName (most recent):')
      tracesWithoutScreen.slice(0, 10).forEach(trace => {
        console.log(`  - ${trace.method} ${trace.url}`)
        console.log(`    Status: ${trace.statusCode}`)
        console.log(`    Device: ${trace.deviceId || 'NULL'}`)
        console.log(`    Session: ${trace.sessionId || 'NULL'}`)
        console.log(`    Timestamp: ${trace.timestamp}`)
        console.log('')
      })
    }

    // 4. Analyze session linking
    const tracesWithSession = traces.filter(t => t.sessionId)
    const tracesWithoutSession = traces.filter(t => !t.sessionId)

    console.log('🔗 Session Linking Analysis:')
    console.log(`  ✅ With sessionId: ${tracesWithSession.length} (${(tracesWithSession.length / traces.length * 100).toFixed(1)}%)`)
    console.log(`  ❌ Without sessionId: ${tracesWithoutSession.length} (${(tracesWithoutSession.length / traces.length * 100).toFixed(1)}%)`)
    console.log('')

    if (tracesWithoutSession.length > 0) {
      console.log('  ⚠️  Orphaned traces (no sessionId):')
      console.log(`     These are from SDK versions before v1.0.1 fix`)
      console.log(`     They have screenName but can't be linked to sessions`)
      console.log('')
    }

    // 5. Analyze error status codes
    const errorTraces = traces.filter(t => t.statusCode >= 400 || t.statusCode === 0)
    console.log('🚨 Error Traces Analysis:')
    console.log(`  Total errors: ${errorTraces.length} (${(errorTraces.length / traces.length * 100).toFixed(1)}%)`)

    // Group by status code
    const statusCodeGroups: Record<number, number> = {}
    errorTraces.forEach(trace => {
      statusCodeGroups[trace.statusCode] = (statusCodeGroups[trace.statusCode] || 0) + 1
    })

    console.log('  Breakdown by status code:')
    Object.entries(statusCodeGroups)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .forEach(([code, count]) => {
        const percentage = (count / traces.length * 100).toFixed(1)
        console.log(`    ${code}: ${count} traces (${percentage}%)`)
      })
    console.log('')

    // 6. Show 404/417 examples
    const error404 = traces.filter(t => t.statusCode === 404)
    const error417 = traces.filter(t => t.statusCode === 417)

    if (error404.length > 0) {
      console.log(`📋 404 Errors (${error404.length} total):`)
      error404.slice(0, 5).forEach(trace => {
        console.log(`  - ${trace.method} ${trace.url}`)
        console.log(`    Screen: ${trace.screenName || 'NULL'}`)
        console.log(`    Session: ${trace.sessionId || 'NULL'}`)
        console.log(`    Device: ${trace.deviceId || 'NULL'}`)
        console.log(`    Timestamp: ${trace.timestamp}`)
        console.log('')
      })
    } else {
      console.log('📋 404 Errors: None found in database')
      console.log('   If you see 404s in local logs but not here:')
      console.log('   - Check if traces are being flushed')
      console.log('   - Enable debug mode on the device')
      console.log('   - Check pending trace count')
      console.log('')
    }

    if (error417.length > 0) {
      console.log(`📋 417 Errors (${error417.length} total):`)
      error417.slice(0, 5).forEach(trace => {
        console.log(`  - ${trace.method} ${trace.url}`)
        console.log(`    Screen: ${trace.screenName || 'NULL'}`)
        console.log(`    Session: ${trace.sessionId || 'NULL'}`)
        console.log(`    Device: ${trace.deviceId || 'NULL'}`)
        console.log(`    Timestamp: ${trace.timestamp}`)
        console.log('')
      })
    } else {
      console.log('📋 417 Errors: None found in database')
      console.log('   If you see 417s in local logs but not here:')
      console.log('   - Check if traces are being flushed')
      console.log('   - Enable debug mode on the device')
      console.log('   - Check pending trace count')
      console.log('')
    }

    // 7. Environment breakdown
    const environments: Record<string, number> = {}
    traces.forEach(trace => {
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
        console.log(`  ${env}: ${count} traces (${(count / traces.length * 100).toFixed(1)}%)`)
      })
    console.log('')

    // 8. Status code distribution (all)
    const allStatusCodes: Record<number, number> = {}
    traces.forEach(trace => {
      allStatusCodes[trace.statusCode] = (allStatusCodes[trace.statusCode] || 0) + 1
    })

    console.log('📊 All Status Codes:')
    Object.entries(allStatusCodes)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .forEach(([code, count]) => {
        const percentage = (count / traces.length * 100).toFixed(1)
        console.log(`  ${code}: ${count} traces (${percentage}%)`)
      })
    console.log('')

    // 9. Recommendations
    console.log('💡 Analysis & Recommendations:')
    console.log('')

    if (tracesWithoutScreen.length > 0) {
      const percentage = (tracesWithoutScreen.length / traces.length * 100).toFixed(1)
      console.log(`⚠️  ${percentage}% of traces missing screenName:`)

      // Check if they have sessionId
      const orphansWithoutScreen = tracesWithoutScreen.filter(t => !t.sessionId)
      if (orphansWithoutScreen.length > 0) {
        console.log(`   - ${orphansWithoutScreen.length} traces have neither screenName NOR sessionId`)
        console.log(`   - These are likely from SDK versions before v1.0.1`)
        console.log(`   - They'll age out naturally (30-day retention)`)
      }

      const recentWithoutScreen = tracesWithoutScreen.filter(t => t.sessionId)
      if (recentWithoutScreen.length > 0) {
        console.log(`   - ${recentWithoutScreen.length} traces have sessionId but no screenName`)
        console.log(`   - This means API calls are happening before trackScreen()`)
        console.log(`   - Solution: Call trackScreen() earlier in Activity lifecycle`)
        console.log(`   - Check: Does every Activity call trackScreen() in onCreate()?`)
      }
      console.log('')
    }

    if (error404.length === 0 && error417.length === 0) {
      console.log('⚠️  No 404 or 417 errors in database:')
      console.log('   If you see these errors in local logs:')
      console.log('   1. Check if SDK is flushing traces:')
      console.log('      - Is debug mode enabled on the test device?')
      console.log('      - Check pending trace count in SDK')
      console.log('      - Is app pausing/backgrounding to trigger flush?')
      console.log('   2. Check network connectivity')
      console.log('   3. Check backend logs for rejected traces')
      console.log('')
    } else {
      console.log('✅ Error traces are being captured successfully')
      console.log('')
    }

    if (tracesWithoutSession.length > 0 && tracesWithSession.length > 0) {
      const oldPercentage = (tracesWithoutSession.length / traces.length * 100).toFixed(1)
      console.log(`ℹ️  ${oldPercentage}% of traces are orphaned (no sessionId):`)
      console.log('   - These are from SDK versions before v1.0.1')
      console.log('   - New traces from v1.0.1+ have sessionId')
      console.log('   - Old traces will age out over 30 days')
      console.log('')
    }

    // 10. Time-based analysis
    const now = new Date()
    const last24h = traces.filter(t => {
      const traceTime = new Date(t.createdAt)
      return (now.getTime() - traceTime.getTime()) < 24 * 60 * 60 * 1000
    })

    console.log(`📅 Recent Activity (last 24 hours):`)
    console.log(`  ${last24h.length} traces`)

    if (last24h.length > 0) {
      const recentWithScreen = last24h.filter(t => t.screenName).length
      const recentWithSession = last24h.filter(t => t.sessionId).length
      const recentErrors = last24h.filter(t => t.statusCode >= 400).length

      console.log(`  - With screenName: ${recentWithScreen} (${(recentWithScreen / last24h.length * 100).toFixed(1)}%)`)
      console.log(`  - With sessionId: ${recentWithSession} (${(recentWithSession / last24h.length * 100).toFixed(1)}%)`)
      console.log(`  - Error responses: ${recentErrors} (${(recentErrors / last24h.length * 100).toFixed(1)}%)`)
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
if (args.length < 1) {
  console.error('Usage: tsx scripts/diagnostics/analyze-traces-supabase.ts <project-id>')
  console.error('')
  console.error('Example:')
  console.error('  tsx scripts/diagnostics/analyze-traces-supabase.ts cmkiixzic00029krtffzbx10x')
  console.error('')
  console.error('Environment variables needed:')
  console.error('  SUPABASE_URL (defaults to production URL)')
  console.error('  SUPABASE_SERVICE_ROLE_KEY (required)')
  console.error('')
  console.error('These are available in .env.local.bak')
  process.exit(1)
}

const [projectId] = args

analyzeTraces(projectId)
