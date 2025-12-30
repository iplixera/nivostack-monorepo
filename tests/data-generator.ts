#!/usr/bin/env tsx
/**
 * Data Generator for Performance Testing
 * Generates large volumes of test data to test plan throttling and performance
 */

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import {
  setupTestDB,
  createTestUser,
  createTestPlan,
  createTestSubscription,
  prisma,
} from './setup'

const BATCH_SIZE = 1000

async function generateDevices(projectId: string, count: number) {
  console.log(`  Generating ${count} devices...`)
  const batches = Math.ceil(count / BATCH_SIZE)
  
  for (let batch = 0; batch < batches; batch++) {
    const batchSize = Math.min(BATCH_SIZE, count - batch * BATCH_SIZE)
    const deviceData = Array.from({ length: batchSize }, (_, i) => ({
      projectId,
      deviceId: `device-${batch * BATCH_SIZE + i}-${Date.now()}`,
      platform: (batch * BATCH_SIZE + i) % 2 === 0 ? 'ios' : 'android',
      osVersion: '15.0',
      appVersion: '1.0.0',
      model: `Device Model ${batch * BATCH_SIZE + i}`,
      deviceCode: `DEV-${batch * BATCH_SIZE + i}-${Date.now()}`,
    }))
    
    await prisma.device.createMany({ data: deviceData })
    if ((batch + 1) % 10 === 0) {
      console.log(`    Generated ${(batch + 1) * BATCH_SIZE} devices...`)
    }
  }
  console.log(`  ✅ Generated ${count} devices`)
}

async function generateSessions(projectId: string, count: number) {
  console.log(`  Generating ${count} sessions...`)
  const batches = Math.ceil(count / BATCH_SIZE)
  
  for (let batch = 0; batch < batches; batch++) {
    const batchSize = Math.min(BATCH_SIZE, count - batch * BATCH_SIZE)
    const sessionData = Array.from({ length: batchSize }, (_, i) => ({
      projectId,
      sessionId: `session-${batch * BATCH_SIZE + i}-${Date.now()}`,
      deviceId: `device-${(batch * BATCH_SIZE + i) % 100}`,
      startedAt: new Date(Date.now() - (batch * BATCH_SIZE + i) * 60000),
      endedAt: (batch * BATCH_SIZE + i) % 2 === 0 
        ? new Date(Date.now() - (batch * BATCH_SIZE + i - 1) * 60000)
        : null,
      duration: (batch * BATCH_SIZE + i) % 2 === 0 ? 60000 : null,
      screenCount: Math.floor(Math.random() * 10),
      context: {},
      screenFlow: [],
    }))
    
    await prisma.session.createMany({ data: sessionData })
    if ((batch + 1) % 10 === 0) {
      console.log(`    Generated ${(batch + 1) * BATCH_SIZE} sessions...`)
    }
  }
  console.log(`  ✅ Generated ${count} sessions`)
}

async function generateApiTraces(projectId: string, count: number) {
  console.log(`  Generating ${count} API traces...`)
  const endpoints = [
    '/api/users',
    '/api/products',
    '/api/orders',
    '/api/cart',
    '/api/checkout',
    '/api/payments',
    '/api/shipping',
    '/api/reviews',
    '/api/search',
    '/api/recommendations',
  ]
  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  const batches = Math.ceil(count / BATCH_SIZE)
  
  for (let batch = 0; batch < batches; batch++) {
    const batchSize = Math.min(BATCH_SIZE, count - batch * BATCH_SIZE)
    const traceData = Array.from({ length: batchSize }, (_, i) => ({
      projectId,
      endpoint: endpoints[(batch * BATCH_SIZE + i) % endpoints.length],
      method: methods[(batch * BATCH_SIZE + i) % methods.length],
      statusCode: (batch * BATCH_SIZE + i) % 10 === 0 ? 500 
        : (batch * BATCH_SIZE + i) % 10 === 1 ? 404 
        : 200,
      duration: Math.floor(Math.random() * 1000),
      timestamp: new Date(Date.now() - (batch * BATCH_SIZE + i) * 1000),
      requestHeaders: {},
      responseHeaders: {},
    }))
    
    await prisma.apiTrace.createMany({ data: traceData })
    if ((batch + 1) % 10 === 0) {
      console.log(`    Generated ${(batch + 1) * BATCH_SIZE} API traces...`)
    }
  }
  console.log(`  ✅ Generated ${count} API traces`)
}

async function generateLogs(projectId: string, count: number) {
  console.log(`  Generating ${count} logs...`)
  const levels = ['info', 'warning', 'error', 'debug']
  const batches = Math.ceil(count / BATCH_SIZE)
  
  for (let batch = 0; batch < batches; batch++) {
    const batchSize = Math.min(BATCH_SIZE, count - batch * BATCH_SIZE)
    const logData = Array.from({ length: batchSize }, (_, i) => ({
      projectId,
      level: levels[(batch * BATCH_SIZE + i) % levels.length] as any,
      message: `Log message ${batch * BATCH_SIZE + i}`,
      tag: `tag-${(batch * BATCH_SIZE + i) % 10}`,
      timestamp: new Date(Date.now() - (batch * BATCH_SIZE + i) * 1000),
      metadata: {},
    }))
    
    await prisma.log.createMany({ data: logData })
    if ((batch + 1) % 10 === 0) {
      console.log(`    Generated ${(batch + 1) * BATCH_SIZE} logs...`)
    }
  }
  console.log(`  ✅ Generated ${count} logs`)
}

async function generateCrashes(projectId: string, count: number) {
  console.log(`  Generating ${count} crashes...`)
  const batches = Math.ceil(count / BATCH_SIZE)
  
  for (let batch = 0; batch < batches; batch++) {
    const batchSize = Math.min(BATCH_SIZE, count - batch * BATCH_SIZE)
    const crashData = Array.from({ length: batchSize }, (_, i) => ({
      projectId,
      deviceId: `device-${(batch * BATCH_SIZE + i) % 100}`,
      errorType: `ErrorType${(batch * BATCH_SIZE + i) % 5}`,
      errorMessage: `Crash error ${batch * BATCH_SIZE + i}`,
      stackTrace: `Error: Crash ${batch * BATCH_SIZE + i}\n    at test.js:${i}`,
      timestamp: new Date(Date.now() - (batch * BATCH_SIZE + i) * 60000),
      metadata: {},
    }))
    
    await prisma.crash.createMany({ data: crashData })
    if ((batch + 1) % 10 === 0) {
      console.log(`    Generated ${(batch + 1) * BATCH_SIZE} crashes...`)
    }
  }
  console.log(`  ✅ Generated ${count} crashes`)
}

async function main() {
  const args = process.argv.slice(2)
  const planType = args[0] || 'free' // free, pro, team
  const scale = parseInt(args[1] || '1', 10) // Scale factor (1x, 10x, 100x)

  console.log('🚀 Data Generator for Performance Testing')
  console.log(`Plan Type: ${planType}`)
  console.log(`Scale: ${scale}x`)
  console.log('═'.repeat(70))

  try {
    await setupTestDB()

    // Create plan based on type
    let plan
    if (planType === 'free') {
      plan = await createTestPlan({
        name: 'test_free_perf',
        displayName: 'Free Plan (Performance Test)',
        price: 0,
        maxDevices: 100 * scale,
        maxSessions: 1000 * scale,
        maxApiTraces: 1000 * scale,
        maxApiEndpoints: 20,
        maxApiRequests: 1000 * scale,
        maxLogs: 10000 * scale,
        maxCrashes: 100 * scale,
      })
    } else if (planType === 'pro') {
      plan = await createTestPlan({
        name: 'test_pro_perf',
        displayName: 'Pro Plan (Performance Test)',
        price: 199,
        maxDevices: 1000 * scale,
        maxSessions: 100000 * scale,
        maxApiTraces: 100000 * scale,
        maxApiEndpoints: 200,
        maxApiRequests: 100000 * scale,
        maxLogs: 500000 * scale,
        maxCrashes: 10000 * scale,
      })
    } else {
      plan = await createTestPlan({
        name: 'test_team_perf',
        displayName: 'Team Plan (Performance Test)',
        price: 499,
        maxDevices: null,
        maxSessions: 500000 * scale,
        maxApiTraces: 500000 * scale,
        maxApiEndpoints: null,
        maxApiRequests: 500000 * scale,
        maxLogs: null,
        maxCrashes: null,
      })
    }

    const user = await createTestUser(`perf-${planType}-${scale}x@test.devbridge.com`)
    const subscription = await createTestSubscription(user.id, plan.id)
    const project = await prisma.project.create({
      data: {
        userId: user.id,
        name: `${planType.toUpperCase()} Plan Performance Test`,
        apiKey: `test-perf-${planType}-${scale}x-${Date.now()}`,
      },
    })

    console.log(`\n✅ Created user: ${user.email}`)
    console.log(`✅ Created plan: ${plan.displayName}`)
    console.log(`✅ Created project: ${project.name}`)

    const startTime = Date.now()

    // Generate data based on plan limits
    if (planType === 'free') {
      await generateDevices(project.id, 100 * scale)
      await generateSessions(project.id, 1000 * scale)
      await generateApiTraces(project.id, 1000 * scale)
      await generateLogs(project.id, 10000 * scale)
      await generateCrashes(project.id, 100 * scale)
    } else if (planType === 'pro') {
      await generateDevices(project.id, 1000 * scale)
      await generateSessions(project.id, 100000 * scale)
      await generateApiTraces(project.id, 100000 * scale)
      await generateLogs(project.id, 500000 * scale)
      await generateCrashes(project.id, 10000 * scale)
    } else {
      await generateDevices(project.id, 10000 * scale)
      await generateSessions(project.id, 500000 * scale)
      await generateApiTraces(project.id, 500000 * scale)
      await generateLogs(project.id, 2000000 * scale)
      await generateCrashes(project.id, 50000 * scale)
    }

    const duration = Date.now() - startTime

    console.log('\n' + '═'.repeat(70))
    console.log('📊 Generation Summary')
    console.log('═'.repeat(70))
    console.log(`Plan: ${plan.displayName}`)
    console.log(`Scale: ${scale}x`)
    console.log(`Duration: ${(duration / 1000).toFixed(2)}s`)
    console.log(`User: ${user.email}`)
    console.log(`Project: ${project.name}`)
    console.log('═'.repeat(70))

    await prisma.$disconnect()
  } catch (error) {
    console.error('💥 Error:', error)
    await prisma.$disconnect()
    process.exit(1)
  }
}

main().catch(console.error)

