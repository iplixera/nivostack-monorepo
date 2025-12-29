#!/usr/bin/env tsx
/**
 * Comprehensive Test Runner
 * Runs all test suites and generates test report
 */

import 'dotenv/config'
import { execSync } from 'child_process'
import fs from 'fs'

interface TestResult {
  suite: string
  passed: number
  failed: number
  duration: number
  errors: string[]
}

const results: TestResult[] = []

function runTestSuite(name: string, command: string): TestResult {
  console.log(`\n${'='.repeat(70)}`)
  console.log(`🧪 Running: ${name}`)
  console.log('='.repeat(70))
  
  const startTime = Date.now()
  let passed = 0
  let failed = 0
  const errors: string[] = []

  try {
    const output = execSync(command, { 
      encoding: 'utf-8',
      stdio: 'pipe',
      cwd: process.cwd()
    })
    
    // Parse output for test results
    const lines = output.split('\n')
    lines.forEach(line => {
      if (line.includes('✅') || line.includes('PASS')) {
        passed++
      }
      if (line.includes('❌') || line.includes('FAIL')) {
        failed++
        errors.push(line)
      }
    })

    console.log(output)
    console.log(`\n✅ ${name}: ${passed} passed, ${failed} failed`)
  } catch (error: any) {
    failed++
    const errorOutput = error.stdout || error.message || String(error)
    errors.push(errorOutput)
    console.error(`\n❌ ${name} failed:`)
    console.error(errorOutput)
  }

  const duration = Date.now() - startTime

  return {
    suite: name,
    passed,
    failed,
    duration,
    errors
  }
}

async function main() {
  console.log('🚀 DevBridge Comprehensive Test Suite')
  console.log('═'.repeat(70))
  console.log(`Started: ${new Date().toISOString()}`)
  console.log('═'.repeat(70))

  // Check database health first
  console.log('\n📊 Checking database health...')
  try {
    execSync('pnpm db:health', { stdio: 'inherit' })
  } catch (error) {
    console.error('❌ Database health check failed. Please ensure database is running.')
    process.exit(1)
  }

  // Run test suites
  results.push(runTestSuite(
    'API Test Suite',
    'tsx tests/api-test-suite.ts'
  ))

  results.push(runTestSuite(
    'Admin Plans Test',
    'tsx tests/admin-plans.test.ts'
  ))

  results.push(runTestSuite(
    'Admin Subscriptions Test',
    'tsx tests/admin-subscriptions.test.ts'
  ))

  // Generate summary
  console.log('\n' + '═'.repeat(70))
  console.log('📊 Test Summary')
  console.log('═'.repeat(70))

  const totalPassed = results.reduce((sum, r) => sum + r.passed, 0)
  const totalFailed = results.reduce((sum, r) => sum + r.failed, 0)
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0)

  results.forEach(result => {
    const status = result.failed === 0 ? '✅' : '❌'
    console.log(`${status} ${result.suite.padEnd(30)} | Passed: ${result.passed.toString().padStart(3)} | Failed: ${result.failed.toString().padStart(3)} | Duration: ${(result.duration / 1000).toFixed(2)}s`)
  })

  console.log('─'.repeat(70))
  console.log(`Total: ${totalPassed} passed, ${totalFailed} failed | Duration: ${(totalDuration / 1000).toFixed(2)}s`)

  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalPassed,
      totalFailed,
      totalDuration,
      successRate: totalPassed / (totalPassed + totalFailed) * 100
    },
    suites: results
  }

  fs.writeFileSync(
    'tests/TEST_RESULTS.json',
    JSON.stringify(report, null, 2)
  )

  console.log('\n✅ Test report saved to: tests/TEST_RESULTS.json')

  // Exit with appropriate code
  process.exit(totalFailed > 0 ? 1 : 0)
}

main().catch(console.error)

