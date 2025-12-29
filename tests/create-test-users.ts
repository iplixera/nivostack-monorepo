#!/usr/bin/env tsx
/**
 * Create Test Users for Different Scenarios
 * Creates users with different plans and consumption levels for manual testing
 * Does NOT delete test data - preserves it for manual inspection
 */

import 'dotenv/config'
import {
  setupTestDB,
  createTestUser,
  createTestPlan,
  createTestSubscription,
  prisma,
} from './setup'

// Password for all test users (simple for testing)
const TEST_PASSWORD = 'Test123!@#'
const { hashPassword } = require('../src/lib/auth')

async function createUserWithPassword(email: string, name: string, isAdmin: boolean = false) {
  const hashedPassword = await hashPassword(TEST_PASSWORD)
  return await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: hashedPassword,
      name,
      isAdmin,
    },
  })
}

async function generateDataForUser(
  userId: string,
  projectId: string,
  percentages: {
    devices?: number
    sessions?: number
    apiTraces?: number
    logs?: number
    crashes?: number
  },
  limits: {
    devices: number | null
    sessions: number | null
    apiTraces: number | null
    logs: number | null
    crashes: number | null
  }
) {
  const { devices = 0, sessions = 0, apiTraces = 0, logs = 0, crashes = 0 } = percentages

  // Calculate actual counts based on percentages
  const deviceCount = limits.devices ? Math.floor((limits.devices * devices) / 100) : 0
  const sessionCount = limits.sessions ? Math.floor((limits.sessions * sessions) / 100) : 0
  const apiTraceCount = limits.apiTraces ? Math.floor((limits.apiTraces * apiTraces) / 100) : 0
  const logCount = limits.logs ? Math.floor((limits.logs * logs) / 100) : 0
  const crashCount = limits.crashes ? Math.floor((limits.crashes * crashes) / 100) : 0

  // Generate devices
  let createdDevices: Array<{ id: string }> = []
  if (deviceCount > 0) {
    const deviceData = Array.from({ length: deviceCount }, (_, i) => ({
      projectId,
      deviceId: `device-${i}-${Date.now()}`,
      platform: i % 2 === 0 ? 'ios' : 'android',
      osVersion: '15.0',
      appVersion: '1.0.0',
      model: `Device ${i}`,
      deviceCode: `DEV-${i}-${Date.now()}`,
    }))
    await prisma.device.createMany({ data: deviceData })
    createdDevices = await prisma.device.findMany({
      where: { projectId },
      select: { id: true },
      take: Math.min(deviceCount, 10),
    })
  }

  // Generate sessions
  if (sessionCount > 0) {
    const deviceIds = createdDevices.map(d => d.id)
    const batchSize = 1000
    const batches = Math.ceil(sessionCount / batchSize)
    
    for (let batch = 0; batch < batches; batch++) {
      const batchCount = Math.min(batchSize, sessionCount - batch * batchSize)
      const sessionData = Array.from({ length: batchCount }, (_, i) => ({
        projectId,
        sessionToken: `session-${batch * batchSize + i}-${Date.now()}-${Math.random()}`,
        deviceId: deviceIds.length > 0 ? deviceIds[(batch * batchSize + i) % deviceIds.length] : null,
        startedAt: new Date(Date.now() - (batch * batchSize + i) * 60000),
        endedAt: (batch * batchSize + i) % 2 === 0 ? new Date(Date.now() - (batch * batchSize + i - 1) * 60000) : null,
        isActive: (batch * batchSize + i) % 2 === 0 ? false : true,
        screenFlow: [],
        entryScreen: `screen-${(batch * batchSize + i) % 5}`,
        exitScreen: (batch * batchSize + i) % 2 === 0 ? `screen-${((batch * batchSize + i) + 1) % 5}` : null,
      }))
      await prisma.session.createMany({ data: sessionData })
      if ((batch + 1) % 10 === 0) {
        console.log(`    Generated ${(batch + 1) * batchSize} sessions...`)
      }
    }
  }

  // Generate API traces
  if (apiTraceCount > 0) {
    const endpoints = ['/api/users', '/api/products', '/api/orders', '/api/cart', '/api/checkout']
    const batchSize = 1000
    const batches = Math.ceil(apiTraceCount / batchSize)
    
    for (let batch = 0; batch < batches; batch++) {
      const batchCount = Math.min(batchSize, apiTraceCount - batch * batchSize)
      const traceData = Array.from({ length: batchCount }, (_, i) => ({
        projectId,
        url: endpoints[(batch * batchSize + i) % endpoints.length],
        method: (batch * batchSize + i) % 4 === 0 ? 'GET' : (batch * batchSize + i) % 4 === 1 ? 'POST' : (batch * batchSize + i) % 4 === 2 ? 'PUT' : 'DELETE',
        statusCode: (batch * batchSize + i) % 10 === 0 ? 500 : (batch * batchSize + i) % 10 === 1 ? 404 : 200,
        duration: Math.floor(Math.random() * 1000),
        requestHeaders: {} as any,
        responseHeaders: {} as any,
        requestBody: null,
        responseBody: null,
      }))
      await prisma.apiTrace.createMany({ data: traceData })
      if ((batch + 1) % 10 === 0) {
        console.log(`    Generated ${(batch + 1) * batchSize} API traces...`)
      }
    }
  }

  // Generate logs
  if (logCount > 0) {
    const levels = ['info', 'warning', 'error', 'debug']
    const batchSize = 1000
    const batches = Math.ceil(logCount / batchSize)
    
    for (let batch = 0; batch < batches; batch++) {
      const batchCount = Math.min(batchSize, logCount - batch * batchSize)
      const logData = Array.from({ length: batchCount }, (_, i) => ({
        projectId,
        level: levels[(batch * batchSize + i) % levels.length] as any,
        message: `Log message ${batch * batchSize + i}`,
        tag: `tag-${(batch * batchSize + i) % 5}`,
        timestamp: new Date(Date.now() - (batch * batchSize + i) * 1000),
      }))
      await prisma.log.createMany({ data: logData })
      if ((batch + 1) % 10 === 0) {
        console.log(`    Generated ${(batch + 1) * batchSize} logs...`)
      }
    }
  }

  // Generate crashes
  if (crashCount > 0) {
    const deviceIds = createdDevices.map(d => d.id)
    const crashData = Array.from({ length: crashCount }, (_, i) => ({
      projectId,
      deviceId: deviceIds.length > 0 ? deviceIds[i % deviceIds.length] : null,
      message: `Crash ${i}`,
      stackTrace: `Error: Crash ${i}\n    at test.js:${i}`,
      timestamp: new Date(Date.now() - i * 60000),
      metadata: {} as any,
    }))
    await prisma.crash.createMany({ data: crashData })
  }
}

async function main() {
  console.log('🚀 Creating Test Users for Manual Testing')
  console.log('═'.repeat(70))
  console.log('This script creates users with different plans and consumption levels')
  console.log('All users will have password: Test123!@#')
  console.log('═'.repeat(70))

  try {
    await setupTestDB()

    // Create plans
    console.log('\n📦 Creating test plans...')
    const freePlan = await createTestPlan({
      name: 'test_free_demo',
      displayName: 'Free Plan',
      price: 0,
      maxDevices: 100,
      maxSessions: 1000,
      maxApiTraces: 1000,
      maxLogs: 10000,
      maxCrashes: 100,
      retentionDays: 30,
    })

    const proPlan = await createTestPlan({
      name: 'test_pro_demo',
      displayName: 'Pro Plan',
      price: 199,
      maxDevices: 1000,
      maxSessions: 100000,
      maxApiTraces: 100000,
      maxLogs: 500000,
      maxCrashes: 10000,
      retentionDays: 90,
    })

    const teamPlan = await createTestPlan({
      name: 'test_team_demo',
      displayName: 'Team Plan',
      price: 499,
      maxDevices: null,
      maxSessions: 500000,
      maxApiTraces: 500000,
      maxLogs: null,
      maxCrashes: null,
      retentionDays: 90,
    })

    const enterprisePlan = await createTestPlan({
      name: 'test_enterprise_demo',
      displayName: 'Enterprise Plan',
      price: 2999,
      maxDevices: null,
      maxSessions: null,
      maxApiTraces: null,
      maxLogs: null,
      maxCrashes: null,
      retentionDays: null,
    })

    console.log('✅ Plans created')

    const users: Array<{ email: string; password: string; plan: string; consumption: string }> = []

    // ========================================================================
    // FREE PLAN USERS
    // ========================================================================
    console.log('\n👤 Creating Free Plan users...')

    // Free - New (0%)
    const freeNew = await createUserWithPassword('free-new@demo.devbridge.com', 'Free New User')
    const freeNewSub = await createTestSubscription(freeNew.id, freePlan.id)
    const freeNewProject = await prisma.project.create({
      data: {
        userId: freeNew.id,
        name: 'Free New Project',
        apiKey: `demo-free-new-${Date.now()}`,
      },
    })
    users.push({ email: freeNew.email, password: TEST_PASSWORD, plan: 'Free', consumption: '0% (New)' })

    // Free - 10%
    const free10 = await createUserWithPassword('free-10@demo.devbridge.com', 'Free 10% User')
    const free10Sub = await createTestSubscription(free10.id, freePlan.id)
    const free10Project = await prisma.project.create({
      data: {
        userId: free10.id,
        name: 'Free 10% Project',
        apiKey: `demo-free-10-${Date.now()}`,
      },
    })
    await generateDataForUser(free10.id, free10Project.id, { devices: 10, sessions: 10, apiTraces: 10, logs: 10, crashes: 10 }, {
      devices: 100,
      sessions: 1000,
      apiTraces: 1000,
      logs: 10000,
      crashes: 100,
    })
    users.push({ email: free10.email, password: TEST_PASSWORD, plan: 'Free', consumption: '10%' })

    // Free - 50%
    const free50 = await createUserWithPassword('free-50@demo.devbridge.com', 'Free 50% User')
    const free50Sub = await createTestSubscription(free50.id, freePlan.id)
    const free50Project = await prisma.project.create({
      data: {
        userId: free50.id,
        name: 'Free 50% Project',
        apiKey: `demo-free-50-${Date.now()}`,
      },
    })
    await generateDataForUser(free50.id, free50Project.id, { devices: 50, sessions: 50, apiTraces: 50, logs: 50, crashes: 50 }, {
      devices: 100,
      sessions: 1000,
      apiTraces: 1000,
      logs: 10000,
      crashes: 100,
    })
    users.push({ email: free50.email, password: TEST_PASSWORD, plan: 'Free', consumption: '50%' })

    // Free - 80%
    const free80 = await createUserWithPassword('free-80@demo.devbridge.com', 'Free 80% User')
    const free80Sub = await createTestSubscription(free80.id, freePlan.id)
    const free80Project = await prisma.project.create({
      data: {
        userId: free80.id,
        name: 'Free 80% Project',
        apiKey: `demo-free-80-${Date.now()}`,
      },
    })
    await generateDataForUser(free80.id, free80Project.id, { devices: 80, sessions: 80, apiTraces: 80, logs: 80, crashes: 80 }, {
      devices: 100,
      sessions: 1000,
      apiTraces: 1000,
      logs: 10000,
      crashes: 100,
    })
    users.push({ email: free80.email, password: TEST_PASSWORD, plan: 'Free', consumption: '80%' })

    // Free - 100%
    const free100 = await createUserWithPassword('free-100@demo.devbridge.com', 'Free 100% User')
    const free100Sub = await createTestSubscription(free100.id, freePlan.id)
    const free100Project = await prisma.project.create({
      data: {
        userId: free100.id,
        name: 'Free 100% Project',
        apiKey: `demo-free-100-${Date.now()}`,
      },
    })
    await generateDataForUser(free100.id, free100Project.id, { devices: 100, sessions: 100, apiTraces: 100, logs: 100, crashes: 100 }, {
      devices: 100,
      sessions: 1000,
      apiTraces: 1000,
      logs: 10000,
      crashes: 100,
    })
    users.push({ email: free100.email, password: TEST_PASSWORD, plan: 'Free', consumption: '100% (At Limit)' })

    // ========================================================================
    // PRO PLAN USERS
    // ========================================================================
    console.log('\n👤 Creating Pro Plan users...')

    // Pro - New (0%)
    const proNew = await createUserWithPassword('pro-new@demo.devbridge.com', 'Pro New User')
    const proNewSub = await createTestSubscription(proNew.id, proPlan.id)
    const proNewProject = await prisma.project.create({
      data: {
        userId: proNew.id,
        name: 'Pro New Project',
        apiKey: `demo-pro-new-${Date.now()}`,
      },
    })
    users.push({ email: proNew.email, password: TEST_PASSWORD, plan: 'Pro', consumption: '0% (New)' })

    // Pro - 10%
    const pro10 = await createUserWithPassword('pro-10@demo.devbridge.com', 'Pro 10% User')
    const pro10Sub = await createTestSubscription(pro10.id, proPlan.id)
    const pro10Project = await prisma.project.create({
      data: {
        userId: pro10.id,
        name: 'Pro 10% Project',
        apiKey: `demo-pro-10-${Date.now()}`,
      },
    })
    await generateDataForUser(pro10.id, pro10Project.id, { devices: 10, sessions: 10, apiTraces: 10, logs: 10, crashes: 10 }, {
      devices: 1000,
      sessions: 100000,
      apiTraces: 100000,
      logs: 500000,
      crashes: 10000,
    })
    users.push({ email: pro10.email, password: TEST_PASSWORD, plan: 'Pro', consumption: '10%' })

    // Pro - 50%
    const pro50 = await createUserWithPassword('pro-50@demo.devbridge.com', 'Pro 50% User')
    const pro50Sub = await createTestSubscription(pro50.id, proPlan.id)
    const pro50Project = await prisma.project.create({
      data: {
        userId: pro50.id,
        name: 'Pro 50% Project',
        apiKey: `demo-pro-50-${Date.now()}`,
      },
    })
    await generateDataForUser(pro50.id, pro50Project.id, { devices: 50, sessions: 50, apiTraces: 50, logs: 50, crashes: 50 }, {
      devices: 1000,
      sessions: 100000,
      apiTraces: 100000,
      logs: 500000,
      crashes: 10000,
    })
    users.push({ email: pro50.email, password: TEST_PASSWORD, plan: 'Pro', consumption: '50%' })

    // Pro - 80%
    const pro80 = await createUserWithPassword('pro-80@demo.devbridge.com', 'Pro 80% User')
    const pro80Sub = await createTestSubscription(pro80.id, proPlan.id)
    const pro80Project = await prisma.project.create({
      data: {
        userId: pro80.id,
        name: 'Pro 80% Project',
        apiKey: `demo-pro-80-${Date.now()}`,
      },
    })
    await generateDataForUser(pro80.id, pro80Project.id, { devices: 80, sessions: 80, apiTraces: 80, logs: 80, crashes: 80 }, {
      devices: 1000,
      sessions: 100000,
      apiTraces: 100000,
      logs: 500000,
      crashes: 10000,
    })
    users.push({ email: pro80.email, password: TEST_PASSWORD, plan: 'Pro', consumption: '80%' })

    // Pro - 100%
    const pro100 = await createUserWithPassword('pro-100@demo.devbridge.com', 'Pro 100% User')
    const pro100Sub = await createTestSubscription(pro100.id, proPlan.id)
    const pro100Project = await prisma.project.create({
      data: {
        userId: pro100.id,
        name: 'Pro 100% Project',
        apiKey: `demo-pro-100-${Date.now()}`,
      },
    })
    await generateDataForUser(pro100.id, pro100Project.id, { devices: 100, sessions: 100, apiTraces: 100, logs: 100, crashes: 100 }, {
      devices: 1000,
      sessions: 100000,
      apiTraces: 100000,
      logs: 500000,
      crashes: 10000,
    })
    users.push({ email: pro100.email, password: TEST_PASSWORD, plan: 'Pro', consumption: '100% (At Limit)' })

    // ========================================================================
    // TEAM PLAN USERS
    // ========================================================================
    console.log('\n👤 Creating Team Plan users...')

    // Team - New (0%)
    const teamNew = await createUserWithPassword('team-new@demo.devbridge.com', 'Team New User')
    const teamNewSub = await createTestSubscription(teamNew.id, teamPlan.id)
    const teamNewProject = await prisma.project.create({
      data: {
        userId: teamNew.id,
        name: 'Team New Project',
        apiKey: `demo-team-new-${Date.now()}`,
      },
    })
    users.push({ email: teamNew.email, password: TEST_PASSWORD, plan: 'Team', consumption: '0% (New)' })

    // Team - 10%
    const team10 = await createUserWithPassword('team-10@demo.devbridge.com', 'Team 10% User')
    const team10Sub = await createTestSubscription(team10.id, teamPlan.id)
    const team10Project = await prisma.project.create({
      data: {
        userId: team10.id,
        name: 'Team 10% Project',
        apiKey: `demo-team-10-${Date.now()}`,
      },
    })
    await generateDataForUser(team10.id, team10Project.id, { devices: 10, sessions: 10, apiTraces: 10, logs: 10, crashes: 10 }, {
      devices: null, // Unlimited
      sessions: 500000,
      apiTraces: 500000,
      logs: null, // Unlimited
      crashes: null, // Unlimited
    })
    users.push({ email: team10.email, password: TEST_PASSWORD, plan: 'Team', consumption: '10%' })

    // Team - 50%
    const team50 = await createUserWithPassword('team-50@demo.devbridge.com', 'Team 50% User')
    const team50Sub = await createTestSubscription(team50.id, teamPlan.id)
    const team50Project = await prisma.project.create({
      data: {
        userId: team50.id,
        name: 'Team 50% Project',
        apiKey: `demo-team-50-${Date.now()}`,
      },
    })
    await generateDataForUser(team50.id, team50Project.id, { devices: 50, sessions: 50, apiTraces: 50, logs: 50, crashes: 50 }, {
      devices: null,
      sessions: 500000,
      apiTraces: 500000,
      logs: null,
      crashes: null,
    })
    users.push({ email: team50.email, password: TEST_PASSWORD, plan: 'Team', consumption: '50%' })

    // Team - 80%
    const team80 = await createUserWithPassword('team-80@demo.devbridge.com', 'Team 80% User')
    const team80Sub = await createTestSubscription(team80.id, teamPlan.id)
    const team80Project = await prisma.project.create({
      data: {
        userId: team80.id,
        name: 'Team 80% Project',
        apiKey: `demo-team-80-${Date.now()}`,
      },
    })
    await generateDataForUser(team80.id, team80Project.id, { devices: 80, sessions: 80, apiTraces: 80, logs: 80, crashes: 80 }, {
      devices: null,
      sessions: 500000,
      apiTraces: 500000,
      logs: null,
      crashes: null,
    })
    users.push({ email: team80.email, password: TEST_PASSWORD, plan: 'Team', consumption: '80%' })

    // Team - 100%
    const team100 = await createUserWithPassword('team-100@demo.devbridge.com', 'Team 100% User')
    const team100Sub = await createTestSubscription(team100.id, teamPlan.id)
    const team100Project = await prisma.project.create({
      data: {
        userId: team100.id,
        name: 'Team 100% Project',
        apiKey: `demo-team-100-${Date.now()}`,
      },
    })
    await generateDataForUser(team100.id, team100Project.id, { devices: 100, sessions: 100, apiTraces: 100, logs: 100, crashes: 100 }, {
      devices: null,
      sessions: 500000,
      apiTraces: 500000,
      logs: null,
      crashes: null,
    })
    users.push({ email: team100.email, password: TEST_PASSWORD, plan: 'Team', consumption: '100% (At Limit)' })

    // ========================================================================
    // ENTERPRISE PLAN USERS
    // ========================================================================
    console.log('\n👤 Creating Enterprise Plan users...')

    // Enterprise - New (0%)
    const enterpriseNew = await createUserWithPassword('enterprise-new@demo.devbridge.com', 'Enterprise New User')
    const enterpriseNewSub = await createTestSubscription(enterpriseNew.id, enterprisePlan.id)
    const enterpriseNewProject = await prisma.project.create({
      data: {
        userId: enterpriseNew.id,
        name: 'Enterprise New Project',
        apiKey: `demo-enterprise-new-${Date.now()}`,
      },
    })
    users.push({ email: enterpriseNew.email, password: TEST_PASSWORD, plan: 'Enterprise', consumption: '0% (New)' })

    // Enterprise - High Usage
    const enterpriseHigh = await createUserWithPassword('enterprise-high@demo.devbridge.com', 'Enterprise High Usage User')
    const enterpriseHighSub = await createTestSubscription(enterpriseHigh.id, enterprisePlan.id)
    const enterpriseHighProject = await prisma.project.create({
      data: {
        userId: enterpriseHigh.id,
        name: 'Enterprise High Usage Project',
        apiKey: `demo-enterprise-high-${Date.now()}`,
      },
    })
    // Enterprise has unlimited, so generate large volume
    await generateDataForUser(enterpriseHigh.id, enterpriseHighProject.id, { devices: 50, sessions: 50, apiTraces: 50, logs: 50, crashes: 50 }, {
      devices: null,
      sessions: null,
      apiTraces: null,
      logs: null,
      crashes: null,
    })
    users.push({ email: enterpriseHigh.email, password: TEST_PASSWORD, plan: 'Enterprise', consumption: 'High Usage (Unlimited)' })

    // ========================================================================
    // SUMMARY
    // ========================================================================
    console.log('\n' + '═'.repeat(70))
    console.log('✅ Test Users Created Successfully!')
    console.log('═'.repeat(70))
    console.log(`\nTotal Users Created: ${users.length}`)
    console.log(`Password for all users: ${TEST_PASSWORD}`)
    console.log('\n📋 User List:')
    console.log('─'.repeat(70))
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email.padEnd(35)} | Plan: ${user.plan.padEnd(12)} | Usage: ${user.consumption}`)
    })

    console.log('\n' + '═'.repeat(70))
    console.log('📝 Login Credentials')
    console.log('═'.repeat(70))
    console.log('\nAll users can login at: http://localhost:3000/login')
    console.log(`Password: ${TEST_PASSWORD}`)
    console.log('\nUsers by Plan:')
    console.log('\nFREE PLAN:')
    users.filter(u => u.plan === 'Free').forEach(u => console.log(`  - ${u.email} (${u.consumption})`))
    console.log('\nPRO PLAN:')
    users.filter(u => u.plan === 'Pro').forEach(u => console.log(`  - ${u.email} (${u.consumption})`))
    console.log('\nTEAM PLAN:')
    users.filter(u => u.plan === 'Team').forEach(u => console.log(`  - ${u.email} (${u.consumption})`))
    console.log('\nENTERPRISE PLAN:')
    users.filter(u => u.plan === 'Enterprise').forEach(u => console.log(`  - ${u.email} (${u.consumption})`))

    // Save credentials to file
    const fs = require('fs')
    const credentialsFile = 'tests/TEST_USER_CREDENTIALS.md'
    const credentialsContent = `# Test User Credentials

**Generated**: ${new Date().toISOString()}
**Password for all users**: ${TEST_PASSWORD}

## Login URL
http://localhost:3000/login

## All Users

| # | Email | Plan | Consumption | Password |
|---|-------|-----|-------------|----------|
${users.map((u, i) => `| ${i + 1} | ${u.email} | ${u.plan} | ${u.consumption} | ${TEST_PASSWORD} |`).join('\n')}

## Users by Plan

### Free Plan Users
${users.filter(u => u.plan === 'Free').map(u => `- **${u.email}** - ${u.consumption}`).join('\n')}

### Pro Plan Users
${users.filter(u => u.plan === 'Pro').map(u => `- **${u.email}** - ${u.consumption}`).join('\n')}

### Team Plan Users
${users.filter(u => u.plan === 'Team').map(u => `- **${u.email}** - ${u.consumption}`).join('\n')}

### Enterprise Plan Users
${users.filter(u => u.plan === 'Enterprise').map(u => `- **${u.email}** - ${u.consumption}`).join('\n')}

## Usage Details

### Free Plan Limits
- Devices: 100
- Sessions: 1,000
- API Traces: 1,000
- API Endpoints: 20
- API Requests: 1,000
- Logs: 10,000
- Crashes: 100

### Pro Plan Limits
- Devices: 1,000
- Sessions: 100,000
- API Traces: 100,000
- API Endpoints: 200
- API Requests: 100,000
- Logs: 500,000
- Crashes: 10,000

### Team Plan Limits
- Devices: Unlimited
- Sessions: 500,000
- API Traces: 500,000
- API Endpoints: Unlimited
- API Requests: 500,000
- Logs: Unlimited
- Crashes: Unlimited

### Enterprise Plan Limits
- All features: Unlimited

---

**Note**: Test data is preserved and will not be deleted automatically.
`

    fs.writeFileSync(credentialsFile, credentialsContent)
    console.log(`\n✅ Credentials saved to: ${credentialsFile}`)

    await prisma.$disconnect()
  } catch (error) {
    console.error('\n💥 Error:', error)
    await prisma.$disconnect()
    process.exit(1)
  }
}

main().catch(console.error)

