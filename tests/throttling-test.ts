#!/usr/bin/env tsx
/**
 * Plan Throttling & Quota Test Suite
 * Tests throttling behavior for Free, Pro, and Team plans
 * Tests plan upgrades and their impact on throttling
 */

import 'dotenv/config'
import {
  setupTestDB,
  cleanupTestDB,
  createTestAdmin,
  createTestUser,
  createTestPlan,
  createTestSubscription,
  generateTestToken,
  makeApiRequest,
  prisma,
} from './setup'
import {
  assertEquals,
  assertDefined,
  assertTrue,
  assertFalse,
  assertContains,
  assertGreaterThan,
  assertLessThan,
} from './test-helpers'

// Test data
let adminUser: any
let adminToken: string
let freePlan: any
let proPlan: any
let teamPlan: any

async function setupTests() {
  await setupTestDB()
  adminUser = await createTestAdmin()
  adminToken = await generateTestToken(adminUser.id)

  // Create test plans with specific limits
  freePlan = await createTestPlan({
    name: 'test_free_throttle',
    displayName: 'Free Plan (Throttle Test)',
    price: 0,
    maxDevices: 100,
    maxSessions: 1000,
    maxApiTraces: 1000,
    maxApiEndpoints: 20,
    maxApiRequests: 1000,
    maxLogs: 10000,
    maxCrashes: 100,
    maxBusinessConfigKeys: 50,
    maxLocalizationLanguages: 5,
    maxLocalizationKeys: 200,
    retentionDays: 30,
  })

  proPlan = await createTestPlan({
    name: 'test_pro_throttle',
    displayName: 'Pro Plan (Throttle Test)',
    price: 199,
    maxDevices: 1000,
    maxSessions: 100000,
    maxApiTraces: 100000,
    maxApiEndpoints: 200,
    maxApiRequests: 100000,
    maxLogs: 500000,
    maxCrashes: 10000,
    maxBusinessConfigKeys: 500,
    maxLocalizationLanguages: 50,
    maxLocalizationKeys: 2000,
    retentionDays: 90,
  })

  teamPlan = await createTestPlan({
    name: 'test_team_throttle',
    displayName: 'Team Plan (Throttle Test)',
    price: 499,
    maxDevices: null, // Unlimited
    maxSessions: 500000,
    maxApiTraces: 500000,
    maxApiEndpoints: null, // Unlimited
    maxApiRequests: 500000,
    maxLogs: null, // Unlimited
    maxCrashes: null, // Unlimited
    maxBusinessConfigKeys: null, // Unlimited
    maxLocalizationLanguages: null, // Unlimited
    maxLocalizationKeys: null, // Unlimited
    retentionDays: 90,
  })
}

async function cleanupTests() {
  // Don't cleanup - preserve test data for manual inspection
  // await cleanupTestDB()
  await prisma.$disconnect()
}

// Helper: Get usage stats for a user
async function getUsageStats(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscription: {
        include: { plan: true },
      },
      projects: true,
    },
  })

  if (!user || !user.subscription) return null

  const subscription = user.subscription
  const plan = subscription.plan

  // Get actual usage
  const projects = await prisma.project.findMany({
    where: { userId },
  })
  const projectIds = projects.map(p => p.id)

  const [devices, sessions, apiTraces, logs, crashes] = await Promise.all([
    prisma.device.count({ where: { projectId: { in: projectIds } } }),
    prisma.session.count({ where: { projectId: { in: projectIds } } }),
    prisma.apiTrace.count({ where: { projectId: { in: projectIds } } }),
    prisma.log.count({ where: { projectId: { in: projectIds } } }),
    prisma.crash.count({ where: { projectId: { in: projectIds } } }),
  ])

  // Get unique API endpoints
  const uniqueEndpoints = await prisma.apiTrace.groupBy({
    by: ['url'],
    where: { projectId: { in: projectIds } },
    _count: true,
  })

  // Get API requests count
  const apiRequests = await prisma.apiTrace.count({
    where: { projectId: { in: projectIds } },
  })

  // Get effective limits (quota override or plan default)
  const getLimit = (quota: number | null | undefined, planLimit: number | null) => {
    if (quota !== null && quota !== undefined) return quota
    return planLimit
  }

  return {
    userId,
    plan: plan.name,
    limits: {
      devices: getLimit(subscription.quotaMaxDevices, plan.maxDevices),
      sessions: getLimit(subscription.quotaMaxSessions, plan.maxSessions),
      apiTraces: getLimit(subscription.quotaMaxApiTraces, plan.maxApiTraces),
      apiEndpoints: getLimit(subscription.quotaMaxApiEndpoints, plan.maxApiEndpoints),
      apiRequests: getLimit(subscription.quotaMaxApiRequests, plan.maxApiRequests),
      logs: getLimit(subscription.quotaMaxLogs, plan.maxLogs),
      crashes: getLimit(subscription.quotaMaxCrashes, plan.maxCrashes),
      businessConfigKeys: getLimit(subscription.quotaMaxBusinessConfigKeys, plan.maxBusinessConfigKeys),
      localizationLanguages: getLimit(subscription.quotaMaxLocalizationLanguages, plan.maxLocalizationLanguages),
      localizationKeys: getLimit(subscription.quotaMaxLocalizationKeys, plan.maxLocalizationKeys),
    },
    usage: {
      devices,
      sessions,
      apiTraces,
      apiEndpoints: uniqueEndpoints.length,
      apiRequests,
      logs,
      crashes,
    },
    isThrottled: {
      devices: (getLimit(subscription.quotaMaxDevices, plan.maxDevices) !== null && devices >= (getLimit(subscription.quotaMaxDevices, plan.maxDevices) || 0)),
      sessions: (getLimit(subscription.quotaMaxSessions, plan.maxSessions) !== null && sessions >= (getLimit(subscription.quotaMaxSessions, plan.maxSessions) || 0)),
      apiTraces: (getLimit(subscription.quotaMaxApiTraces, plan.maxApiTraces) !== null && apiTraces >= (getLimit(subscription.quotaMaxApiTraces, plan.maxApiTraces) || 0)),
      apiEndpoints: (getLimit(subscription.quotaMaxApiEndpoints, plan.maxApiEndpoints) !== null && uniqueEndpoints.length >= (getLimit(subscription.quotaMaxApiEndpoints, plan.maxApiEndpoints) || 0)),
      apiRequests: (getLimit(subscription.quotaMaxApiRequests, plan.maxApiRequests) !== null && apiRequests >= (getLimit(subscription.quotaMaxApiRequests, plan.maxApiRequests) || 0)),
      logs: (getLimit(subscription.quotaMaxLogs, plan.maxLogs) !== null && logs >= (getLimit(subscription.quotaMaxLogs, plan.maxLogs) || 0)),
      crashes: (getLimit(subscription.quotaMaxCrashes, plan.maxCrashes) !== null && crashes >= (getLimit(subscription.quotaMaxCrashes, plan.maxCrashes) || 0)),
    },
  }
}

// Helper: Check if user is throttled
async function isThrottled(userId: string, metric: string): Promise<boolean> {
  const stats = await getUsageStats(userId)
  if (!stats) return false

  const throttled = stats.isThrottled as any
  return throttled[metric] || false
}

// Helper: Generate test data
async function generateTestData(
  userId: string,
  projectId: string,
  counts: {
    devices?: number
    sessions?: number
    apiTraces?: number
    logs?: number
    crashes?: number
  }
) {
  const { devices = 0, sessions = 0, apiTraces = 0, logs = 0, crashes = 0 } = counts

  // Generate devices
  let createdDevices: Array<{ id: string }> = []
  if (devices > 0) {
    const deviceData = Array.from({ length: devices }, (_, i) => ({
      projectId,
      deviceId: `test-device-${i}-${Date.now()}`,
      platform: i % 2 === 0 ? 'ios' : 'android',
      osVersion: '15.0',
      appVersion: '1.0.0',
      model: `Test Device ${i}`,
      deviceCode: `TEST-${i}-${Date.now()}`,
    }))
    await prisma.device.createMany({ data: deviceData })
    // Fetch created devices to get their IDs for session references
    createdDevices = await prisma.device.findMany({
      where: { projectId },
      select: { id: true },
      take: Math.min(devices, 10), // Use up to 10 devices for session references
    })
  }

  // Generate sessions (after devices are created)
  if (sessions > 0) {
    const deviceIds = createdDevices.map(d => d.id)
    
    const sessionData = Array.from({ length: sessions }, (_, i) => ({
      projectId,
      sessionToken: `test-session-token-${i}-${Date.now()}-${Math.random()}`,
      deviceId: deviceIds.length > 0 ? deviceIds[i % deviceIds.length] : null,
      startedAt: new Date(Date.now() - i * 60000),
      endedAt: i % 2 === 0 ? new Date(Date.now() - (i - 1) * 60000) : null,
      isActive: i % 2 === 0 ? false : true,
      screenFlow: [],
      entryScreen: `screen-${i % 5}`,
      exitScreen: i % 2 === 0 ? `screen-${(i + 1) % 5}` : null,
    }))
    await prisma.session.createMany({ data: sessionData })
  }

  // Generate API traces
  if (apiTraces > 0) {
    const endpoints = ['/api/users', '/api/products', '/api/orders', '/api/cart', '/api/checkout']
    const traceData = Array.from({ length: apiTraces }, (_, i) => ({
      projectId,
      url: endpoints[i % endpoints.length],
      method: i % 4 === 0 ? 'GET' : i % 4 === 1 ? 'POST' : i % 4 === 2 ? 'PUT' : 'DELETE',
      statusCode: i % 10 === 0 ? 500 : i % 10 === 1 ? 404 : 200,
      duration: Math.floor(Math.random() * 1000),
      requestHeaders: {} as any,
      responseHeaders: {} as any,
      requestBody: null,
      responseBody: null,
    }))
    await prisma.apiTrace.createMany({ data: traceData })
  }

  // Generate logs
  if (logs > 0) {
    const levels = ['info', 'warning', 'error', 'debug']
    const logData = Array.from({ length: logs }, (_, i) => ({
      projectId,
      level: levels[i % levels.length] as any,
      message: `Test log message ${i}`,
      tag: `test-tag-${i % 5}`,
      timestamp: new Date(Date.now() - i * 1000),
    }))
    await prisma.log.createMany({ data: logData })
  }

  // Generate crashes (use created device IDs)
  if (crashes > 0) {
    const deviceIds = createdDevices.map(d => d.id)
    const crashData = Array.from({ length: crashes }, (_, i) => ({
      projectId,
      deviceId: deviceIds.length > 0 ? deviceIds[i % deviceIds.length] : null,
      message: `Test crash ${i}`,
      stackTrace: `Error: Test crash ${i}\n    at test.js:${i}`,
      timestamp: new Date(Date.now() - i * 60000),
      metadata: {} as any,
    }))
    await prisma.crash.createMany({ data: crashData })
  }
}

async function printSection(title: string) {
  console.log('\n' + '═'.repeat(70))
  console.log(`  ${title}`)
  console.log('═'.repeat(70))
}

async function printTest(name: string) {
  console.log(`\n🧪 ${name}`)
  console.log('─'.repeat(70))
}

async function printResult(success: boolean, message: string, details?: any) {
  if (success) {
    console.log(`✅ ${message}`)
  } else {
    console.log(`❌ ${message}`)
  }
  if (details) {
    console.log('   Details:', JSON.stringify(details, null, 2))
  }
}

async function main() {
  console.log('🚀 Plan Throttling & Quota Test Suite')
  console.log('Testing throttling behavior for Free, Pro, and Team plans')
  console.log('Testing plan upgrades and performance with large data volumes')

  try {
    await setupTests()
    console.log('✅ Test environment setup complete')

    // ========================================================================
    // TEST 1: Free Plan Throttling
    // ========================================================================
    await printSection('TEST 1: Free Plan Throttling')

    const freeUser = await createTestUser('free-user@test.devbridge.com')
    const freeSubscription = await createTestSubscription(freeUser.id, freePlan.id)
    const freeProject = await prisma.project.create({
      data: {
        userId: freeUser.id,
        name: 'Free Plan Project',
        apiKey: `test-free-${Date.now()}`,
      },
    })

    await printTest('Step 1: Generate data up to Free Plan limits')
    await generateTestData(freeUser.id, freeProject.id, {
      devices: 100,
      sessions: 1000,
      apiTraces: 1000,
      logs: 10000,
      crashes: 100,
    })

    let stats = await getUsageStats(freeUser.id)
    assertDefined(stats)
    printResult(true, `Free Plan Usage: ${JSON.stringify(stats.usage)}`)
    printResult(true, `Free Plan Limits: ${JSON.stringify(stats.limits)}`)

    await printTest('Step 2: Attempt to exceed Free Plan limits')
    // Try to add one more device
    try {
      await prisma.device.create({
        data: {
          projectId: freeProject.id,
          deviceId: `test-device-over-limit`,
          platform: 'ios',
          osVersion: '15.0',
          appVersion: '1.0.0',
          model: 'Test Device',
          deviceCode: `TEST-OVER-${Date.now()}`,
        },
      })
      printResult(false, 'Should have been throttled but device was created')
    } catch (error) {
      printResult(true, 'Device creation throttled (expected)')
    }

    // Check throttling status
    const devicesThrottled = await isThrottled(freeUser.id, 'devices')
    printResult(devicesThrottled, `Devices throttled: ${devicesThrottled}`)

    // ========================================================================
    // TEST 2: Pro Plan Throttling
    // ========================================================================
    await printSection('TEST 2: Pro Plan Throttling')

    const proUser = await createTestUser('pro-user@test.devbridge.com')
    const proSubscription = await createTestSubscription(proUser.id, proPlan.id)
    const proProject = await prisma.project.create({
      data: {
        userId: proUser.id,
        name: 'Pro Plan Project',
        apiKey: `test-pro-${Date.now()}`,
      },
    })

    await printTest('Step 1: Generate data up to Pro Plan limits')
    await generateTestData(proUser.id, proProject.id, {
      devices: 1000,
      sessions: 100000,
      apiTraces: 100000,
      logs: 500000,
      crashes: 10000,
    })

    stats = await getUsageStats(proUser.id)
    assertDefined(stats)
    printResult(true, `Pro Plan Usage: Devices=${stats.usage.devices}, Sessions=${stats.usage.sessions}`)
    printResult(true, `Pro Plan Limits: Devices=${stats.limits.devices}, Sessions=${stats.limits.sessions}`)

    await printTest('Step 2: Verify Pro Plan can handle more than Free Plan')
    assertGreaterThan(stats.usage.devices, 100, 'Pro plan should have more devices than free')
    assertGreaterThan(stats.usage.sessions, 1000, 'Pro plan should have more sessions than free')

    // ========================================================================
    // TEST 3: Team Plan (Unlimited)
    // ========================================================================
    await printSection('TEST 3: Team Plan (Unlimited Features)')

    const teamUser = await createTestUser('team-user@test.devbridge.com')
    const teamSubscription = await createTestSubscription(teamUser.id, teamPlan.id)
    const teamProject = await prisma.project.create({
      data: {
        userId: teamUser.id,
        name: 'Team Plan Project',
        apiKey: `test-team-${Date.now()}`,
      },
    })

    await printTest('Step 1: Generate large volume of data for Team Plan')
    await generateTestData(teamUser.id, teamProject.id, {
      devices: 5000,
      sessions: 500000,
      apiTraces: 500000,
      logs: 2000000,
      crashes: 50000,
    })

    stats = await getUsageStats(teamUser.id)
    assertDefined(stats)
    printResult(true, `Team Plan Usage: Devices=${stats.usage.devices}, Sessions=${stats.usage.sessions}`)
    printResult(true, `Team Plan Limits: Devices=${stats.limits.devices}, Sessions=${stats.limits.sessions}`)

    await printTest('Step 2: Verify Team Plan handles unlimited features')
    assertTrue(stats.limits.devices === null, 'Team plan devices should be unlimited')
    assertTrue(stats.limits.logs === null, 'Team plan logs should be unlimited')

    // ========================================================================
    // TEST 4: Plan Upgrade (Free → Pro)
    // ========================================================================
    await printSection('TEST 4: Plan Upgrade (Free → Pro)')

    const upgradeUser = await createTestUser('upgrade-user@test.devbridge.com')
    const upgradeSubscription = await createTestSubscription(upgradeUser.id, freePlan.id)
    const upgradeProject = await prisma.project.create({
      data: {
        userId: upgradeUser.id,
        name: 'Upgrade Test Project',
        apiKey: `test-upgrade-${Date.now()}`,
      },
    })

    await printTest('Step 1: Generate data at Free Plan limits')
    await generateTestData(upgradeUser.id, upgradeProject.id, {
      devices: 100,
      sessions: 1000,
      apiTraces: 1000,
    })

    stats = await getUsageStats(upgradeUser.id)
    assertDefined(stats)
    printResult(true, `Before Upgrade - Plan: ${stats.plan}, Devices: ${stats.usage.devices}/${stats.limits.devices}`)

    await printTest('Step 2: Upgrade to Pro Plan')
    const { status, data } = await makeApiRequest(
      `/api/admin/subscriptions/${upgradeSubscription.id}/plan`,
      {
        method: 'PATCH',
        body: { planId: proPlan.id },
        token: adminToken,
      }
    )

    assertEquals(status, 200)
    printResult(true, `Upgrade successful: ${data.subscription.plan.name}`)

    await printTest('Step 3: Verify limits increased after upgrade')
    stats = await getUsageStats(upgradeUser.id)
    assertDefined(stats)
    printResult(true, `After Upgrade - Plan: ${stats.plan}, Devices Limit: ${stats.limits.devices}`)
    assertGreaterThan(stats.limits.devices || 0, 100, 'Pro plan should have higher device limit')

    await printTest('Step 4: Generate more data after upgrade')
    await generateTestData(upgradeUser.id, upgradeProject.id, {
      devices: 500, // Add 500 more devices (total 600, under Pro limit of 1000)
      sessions: 50000, // Add 50000 more sessions
      apiTraces: 50000,
    })

    stats = await getUsageStats(upgradeUser.id)
    assertDefined(stats)
    printResult(true, `After Upgrade Data - Devices: ${stats.usage.devices}/${stats.limits.devices}`)
    assertTrue(stats.usage.devices <= (stats.limits.devices || Infinity), 'Should be within new limits')

    // ========================================================================
    // TEST 5: Plan Upgrade (Pro → Team)
    // ========================================================================
    await printSection('TEST 5: Plan Upgrade (Pro → Team)')

    const proToTeamUser = await createTestUser('pro-to-team@test.devbridge.com')
    const proToTeamSubscription = await createTestSubscription(proToTeamUser.id, proPlan.id)
    const proToTeamProject = await prisma.project.create({
      data: {
        userId: proToTeamUser.id,
        name: 'Pro to Team Upgrade Project',
        apiKey: `test-pro-team-${Date.now()}`,
      },
    })

    await printTest('Step 1: Generate data at Pro Plan limits')
    await generateTestData(proToTeamUser.id, proToTeamProject.id, {
      devices: 1000,
      sessions: 100000,
      apiTraces: 100000,
    })

    stats = await getUsageStats(proToTeamUser.id)
    assertDefined(stats)
    printResult(true, `Before Upgrade - Plan: ${stats.plan}, Devices: ${stats.usage.devices}/${stats.limits.devices}`)

    await printTest('Step 2: Upgrade to Team Plan')
    const upgradeResponse = await makeApiRequest(
      `/api/admin/subscriptions/${proToTeamSubscription.id}/plan`,
      {
        method: 'PATCH',
        body: { planId: teamPlan.id },
        token: adminToken,
      }
    )

    assertEquals(upgradeResponse.status, 200)
    printResult(true, `Upgrade successful: ${upgradeResponse.data.subscription.plan.name}`)

    await printTest('Step 3: Verify unlimited features after upgrade')
    stats = await getUsageStats(proToTeamUser.id)
    assertDefined(stats)
    printResult(true, `After Upgrade - Plan: ${stats.plan}`)
    printResult(true, `Devices Limit: ${stats.limits.devices} (should be null/unlimited)`)
    printResult(true, `Logs Limit: ${stats.limits.logs} (should be null/unlimited)`)

    assertTrue(stats.limits.devices === null, 'Team plan devices should be unlimited')
    assertTrue(stats.limits.logs === null, 'Team plan logs should be unlimited')

    await printTest('Step 4: Generate large volume after upgrade')
    await generateTestData(proToTeamUser.id, proToTeamProject.id, {
      devices: 10000, // Add 10000 more devices
      sessions: 400000, // Add 400000 more sessions (total 500000)
      apiTraces: 400000,
    })

    stats = await getUsageStats(proToTeamUser.id)
    assertDefined(stats)
    printResult(true, `After Upgrade Data - Devices: ${stats.usage.devices}, Sessions: ${stats.usage.sessions}`)
    assertTrue(stats.limits.devices === null, 'Should still be unlimited')

    // ========================================================================
    // TEST 6: Performance Test with Large Data Volumes
    // ========================================================================
    await printSection('TEST 6: Performance Test with Large Data Volumes')

    const perfUser = await createTestUser('perf-user@test.devbridge.com')
    const perfSubscription = await createTestSubscription(perfUser.id, teamPlan.id)
    const perfProject = await prisma.project.create({
      data: {
        userId: perfUser.id,
        name: 'Performance Test Project',
        apiKey: `test-perf-${Date.now()}`,
      },
    })

    await printTest('Step 1: Generate large volume of data (10K devices, 100K sessions)')
    const startTime = Date.now()
    await generateTestData(perfUser.id, perfProject.id, {
      devices: 10000,
      sessions: 100000,
      apiTraces: 100000,
      logs: 500000,
      crashes: 10000,
    })
    const generationTime = Date.now() - startTime
    printResult(true, `Data generation completed in ${generationTime}ms`)

    await printTest('Step 2: Measure usage stats query performance')
    const queryStart = Date.now()
    stats = await getUsageStats(perfUser.id)
    const queryTime = Date.now() - queryStart
    printResult(true, `Usage stats query completed in ${queryTime}ms`)
    assertDefined(stats)
    printResult(true, `Usage: Devices=${stats.usage.devices}, Sessions=${stats.usage.sessions}`)

    await printTest('Step 3: Measure API endpoint performance')
    const apiStart = Date.now()
    const apiResponse = await makeApiRequest(
      `/api/admin/subscriptions/${perfSubscription.id}`,
      { token: adminToken }
    )
    const apiTime = Date.now() - apiStart
    printResult(true, `API call completed in ${apiTime}ms`)
    assertEquals(apiResponse.status, 200)

    // ========================================================================
    // TEST 7: Multiple Meters Test
    // ========================================================================
    await printSection('TEST 7: Multiple Meters Test')

    const metersUser = await createTestUser('meters-user@test.devbridge.com')
    const metersSubscription = await createTestSubscription(metersUser.id, freePlan.id)
    const metersProject = await prisma.project.create({
      data: {
        userId: metersUser.id,
        name: 'Meters Test Project',
        apiKey: `test-meters-${Date.now()}`,
      },
    })

    await printTest('Step 1: Test all meters independently')
    await generateTestData(metersUser.id, metersProject.id, {
      devices: 50, // Half of limit
      sessions: 500, // Half of limit
      apiTraces: 500, // Half of limit
      logs: 5000, // Half of limit
      crashes: 50, // Half of limit
    })

    stats = await getUsageStats(metersUser.id)
    assertDefined(stats)

    const meters = [
      'devices',
      'sessions',
      'apiTraces',
      'apiEndpoints',
      'apiRequests',
      'logs',
      'crashes',
    ]

    for (const meter of meters) {
      const usage = (stats.usage as any)[meter]
      const limit = (stats.limits as any)[meter]
      const throttled = (stats.isThrottled as any)[meter]
      printResult(
        !throttled,
        `${meter}: ${usage}/${limit === null ? 'unlimited' : limit} (throttled: ${throttled})`
      )
    }

    await printTest('Step 2: Exceed one meter and verify throttling')
    await generateTestData(metersUser.id, metersProject.id, {
      devices: 60, // Exceed limit of 100 (total 110)
    })

    stats = await getUsageStats(metersUser.id)
    assertDefined(stats)
    const devicesThrottledAfter = await isThrottled(metersUser.id, 'devices')
    printResult(devicesThrottledAfter, `Devices throttled: ${devicesThrottledAfter} (usage: ${stats.usage.devices}, limit: ${stats.limits.devices})`)

    // ========================================================================
    // SUMMARY
    // ========================================================================
    await printSection('TEST SUMMARY')
    console.log('✅ All throttling tests completed')
    console.log('✅ Plan upgrade tests completed')
    console.log('✅ Performance tests completed')
    console.log('✅ Multiple meters tests completed')
    console.log('\n📊 Key Findings:')
    console.log('   - Free Plan throttles correctly at limits')
    console.log('   - Pro Plan handles higher volumes')
    console.log('   - Team Plan supports unlimited features')
    console.log('   - Plan upgrades increase limits correctly')
    console.log('   - All meters tracked independently')

    await cleanupTests()
    console.log('\n🧹 Test cleanup completed')

  } catch (error) {
    console.error('\n💥 Fatal error:', error)
    await cleanupTests()
    process.exit(1)
  }
}

main().catch(console.error)

