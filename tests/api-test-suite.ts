#!/usr/bin/env tsx
/**
 * Comprehensive API Test Suite
 * Tests all admin plan and subscription management APIs
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
  runTestSuite,
  TestSuite,
  assertEquals,
  assertDefined,
  assertNull,
  assertTrue,
  assertFalse,
  assertContains,
} from './test-helpers'

// Test data
let adminUser: any
let adminToken: string
let regularUser: any
let regularToken: string

async function setupTests() {
  await setupTestDB()
  adminUser = await createTestAdmin()
  adminToken = await generateTestToken(adminUser.id)
  regularUser = await createTestUser('regular@test.devbridge.com')
  regularToken = await generateTestToken(regularUser.id)
}

async function cleanupTests() {
  await cleanupTestDB()
  await prisma.$disconnect()
}

// ============================================================================
// PLAN MANAGEMENT TESTS
// ============================================================================

function createPlanManagementTests(): TestSuite {
  const tests: Array<{ name: string; fn: () => Promise<void> | void }> = []

  tests.push({
    name: 'GET /api/admin/plans - should return all plans for admin',
    fn: async () => {
      await prisma.plan.deleteMany({ where: { name: { startsWith: 'test_' } } })
      await createTestPlan({ name: 'test_plan_1', displayName: 'Test Plan 1', price: 10 })
      await createTestPlan({ name: 'test_plan_2', displayName: 'Test Plan 2', price: 20 })

      const { status, data } = await makeApiRequest('/api/admin/plans', {
        token: adminToken,
      })

      assertEquals(status, 200)
      assertDefined(data.plans)
      assertTrue(Array.isArray(data.plans))
      assertTrue(data.plans.length >= 2)
    },
  })

  tests.push({
    name: 'GET /api/admin/plans - should require admin authentication',
    fn: async () => {
      const { status, data } = await makeApiRequest('/api/admin/plans')

      // Note: Next.js might return 403 instead of 401 for missing auth
      assertTrue(status === 401 || status === 403)
      assertContains(data.error, 'Unauthorized')
    },
  })

  tests.push(async () => {
    const { status, data } = await makeApiRequest('/api/admin/plans', {
      token: regularToken,
    })

    assertEquals(status, 403)
    assertContains(data.error, 'Admin access required')
  })

  tests.push(async () => {
    const planData = {
      name: 'test_premium',
      displayName: 'Test Premium Plan',
      description: 'A premium test plan',
      price: 99.99,
      currency: 'USD',
      interval: 'month',
      isActive: true,
      isPublic: true,
      maxSessions: 100000,
      maxDevices: 1000,
      maxApiTraces: 50000,
      retentionDays: 90,
      allowApiTracking: true,
      allowCustomDomains: true,
    }

    const { status, data } = await makeApiRequest('/api/admin/plans', {
      method: 'POST',
      body: planData,
      token: adminToken,
    })

    assertEquals(status, 201)
    assertDefined(data.plan)
    assertEquals(data.plan.name, 'test_premium')
    assertEquals(data.plan.displayName, 'Test Premium Plan')
    assertEquals(data.plan.price, 99.99)
    assertEquals(data.plan.maxSessions, 100000)
    assertTrue(data.plan.allowCustomDomains)
  })

  tests.push(async () => {
    const { status, data } = await makeApiRequest('/api/admin/plans', {
      method: 'POST',
      body: { name: 'test_incomplete' },
      token: adminToken,
    })

    assertEquals(status, 400)
    assertContains(data.error, 'required fields')
  })

  tests.push(async () => {
    await createTestPlan({ name: 'test_duplicate', displayName: 'Duplicate Plan', price: 10 })

    const { status, data } = await makeApiRequest('/api/admin/plans', {
      method: 'POST',
      body: {
        name: 'test_duplicate',
        displayName: 'Another Plan',
        price: 20,
      },
      token: adminToken,
    })

    assertEquals(status, 409)
    assertContains(data.error, 'already exists')
  })

  tests.push(async () => {
    const planData = {
      name: 'test_unlimited',
      displayName: 'Unlimited Plan',
      price: 199.99,
      maxSessions: null,
      maxDevices: null,
      maxApiTraces: null,
    }

    const { status, data } = await makeApiRequest('/api/admin/plans', {
      method: 'POST',
      body: planData,
      token: adminToken,
    })

    assertEquals(status, 201)
    assertNull(data.plan.maxSessions)
    assertNull(data.plan.maxDevices)
    assertNull(data.plan.maxApiTraces)
  })

  tests.push(async () => {
    const plan = await createTestPlan({
      name: 'test_get_by_id',
      displayName: 'Get By ID Plan',
      price: 50,
    })

    const { status, data } = await makeApiRequest(`/api/admin/plans/${plan.id}`, {
      token: adminToken,
    })

    assertEquals(status, 200)
    assertEquals(data.plan.id, plan.id)
    assertEquals(data.plan.name, 'test_get_by_id')
  })

  tests.push(async () => {
    const fakeId = 'clx1234567890abcdefghijklm'

    const { status, data } = await makeApiRequest(`/api/admin/plans/${fakeId}`, {
      token: adminToken,
    })

    assertEquals(status, 404)
    assertContains(data.error, 'not found')
  })

  tests.push(async () => {
    const plan = await createTestPlan({
      name: 'test_update',
      displayName: 'Original Name',
      price: 10,
      maxSessions: 1000,
    })

    const { status, data } = await makeApiRequest(`/api/admin/plans/${plan.id}`, {
      method: 'PATCH',
      body: {
        displayName: 'Updated Name',
        price: 25,
        maxSessions: 5000,
      },
      token: adminToken,
    })

    assertEquals(status, 200)
    assertEquals(data.plan.displayName, 'Updated Name')
    assertEquals(data.plan.price, 25)
    assertEquals(data.plan.maxSessions, 5000)
    assertEquals(data.plan.name, 'test_update')
  })

  tests.push(async () => {
    const plan = await createTestPlan({
      name: 'test_delete',
      displayName: 'Delete Plan',
      price: 10,
    })

    const { status, data } = await makeApiRequest(`/api/admin/plans/${plan.id}`, {
      method: 'DELETE',
      token: adminToken,
    })

    assertEquals(status, 200)
    assertTrue(data.success)

    const deletedPlan = await prisma.plan.findUnique({ where: { id: plan.id } })
    assertNull(deletedPlan)
  })

  tests.push(async () => {
    const plan = await createTestPlan({
      name: 'test_with_sub',
      displayName: 'Plan With Subscription',
      price: 10,
    })
    const user = await createTestUser('subscriber@test.devbridge.com')
    await createTestSubscription(user.id, plan.id)

    const { status, data } = await makeApiRequest(`/api/admin/plans/${plan.id}`, {
      method: 'DELETE',
      token: adminToken,
    })

    assertEquals(status, 500)
    assertContains(data.error, 'active subscription')

    const existingPlan = await prisma.plan.findUnique({ where: { id: plan.id } })
    assertDefined(existingPlan)
  })

  return { name: 'Admin Plan Management API', tests }
}

// ============================================================================
// SUBSCRIPTION MANAGEMENT TESTS
// ============================================================================

function createSubscriptionManagementTests(): TestSuite {
  const tests: Array<() => Promise<void> | void> = []

  let testUser: any
  let freePlan: any
  let proPlan: any
  let subscription: any

  // Setup function that runs before each test
  async function setupSubscriptionTest() {
    // Delete subscriptions for non-admin test users only
    await prisma.subscription.deleteMany({ 
      where: { 
        user: { 
          email: { contains: '@test.' },
          isAdmin: false 
        } 
      } 
    })
    // Delete non-admin test users only (preserve admin)
    await prisma.user.deleteMany({ 
      where: { 
        email: { contains: '@test.' },
        isAdmin: false 
      } 
    })
    await prisma.plan.deleteMany({ where: { name: { startsWith: 'test_' } } })

    testUser = await createTestUser('subscriber@test.devbridge.com')
    freePlan = await createTestPlan({
      name: 'test_free',
      displayName: 'Test Free Plan',
      price: 0,
      maxSessions: 10000,
      maxDevices: 100,
    })
    proPlan = await createTestPlan({
      name: 'test_pro',
      displayName: 'Test Pro Plan',
      price: 199,
      maxSessions: 100000,
      maxDevices: 1000,
    })
    subscription = await createTestSubscription(testUser.id, freePlan.id)
  }

  tests.push(async () => {
    await setupSubscriptionTest()

    const { status, data } = await makeApiRequest(
      `/api/admin/subscriptions/${subscription.id}`,
      { token: adminToken }
    )

    assertEquals(status, 200)
    assertDefined(data.subscription)
    assertEquals(data.subscription.id, subscription.id)
    assertEquals(data.subscription.user.email, 'subscriber@test.devbridge.com')
    assertEquals(data.subscription.plan.id, freePlan.id)
  })

  tests.push(async () => {
    await setupSubscriptionTest()

    const { status, data } = await makeApiRequest(
      `/api/admin/subscriptions/${subscription.id}/plan`,
      {
        method: 'PATCH',
        body: { planId: proPlan.id },
        token: adminToken,
      }
    )

    assertEquals(status, 200)
    assertTrue(data.success)
    assertEquals(data.subscription.plan.id, proPlan.id)
    assertEquals(data.subscription.plan.name, 'test_pro')
  })

  tests.push(async () => {
    await setupSubscriptionTest()

    const quotas = {
      maxDevices: 2000,
      maxSessions: 150000,
      maxApiTraces: 75000,
      maxLogs: null,
    }

    const { status, data } = await makeApiRequest(
      `/api/admin/subscriptions/${subscription.id}/quotas`,
      {
        method: 'PATCH',
        body: quotas,
        token: adminToken,
      }
    )

    assertEquals(status, 200)
    assertTrue(data.success)

    const updated = await prisma.subscription.findUnique({
      where: { id: subscription.id },
    })
    assertEquals(updated?.quotaMaxDevices, 2000)
    assertEquals(updated?.quotaMaxSessions, 150000)
    assertEquals(updated?.quotaMaxApiTraces, 75000)
    assertNull(updated?.quotaMaxLogs)
  })

  tests.push(async () => {
    await setupSubscriptionTest()

    const { status, data } = await makeApiRequest(
      `/api/admin/subscriptions/${subscription.id}/status`,
      {
        method: 'PATCH',
        body: { status: 'expired' },
        token: adminToken,
      }
    )

    assertEquals(status, 200)
    assertTrue(data.success)
    assertEquals(data.subscription.status, 'expired')
  })

  tests.push(async () => {
    await setupSubscriptionTest()

    const { status, data } = await makeApiRequest(
      `/api/admin/subscriptions/${subscription.id}/status`,
      {
        method: 'PATCH',
        body: { status: 'disabled' },
        token: adminToken,
      }
    )

    assertEquals(status, 200)
    assertEquals(data.subscription.status, 'disabled')
    assertFalse(data.subscription.enabled)
    assertDefined(data.subscription.disabledBy)
    assertDefined(data.subscription.disabledAt)
  })

  tests.push(async () => {
    await setupSubscriptionTest()

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { enabled: false, status: 'disabled' },
    })

    const { status, data } = await makeApiRequest(
      `/api/admin/subscriptions/${subscription.id}/enable`,
      {
        method: 'PATCH',
        token: adminToken,
      }
    )

    assertEquals(status, 200)
    assertTrue(data.success)

    const updated = await prisma.subscription.findUnique({
      where: { id: subscription.id },
    })
    assertTrue(updated?.enabled)
    assertEquals(updated?.status, 'active')
  })

  tests.push(async () => {
    await setupSubscriptionTest()

    const { status, data } = await makeApiRequest(
      `/api/admin/subscriptions/${subscription.id}/disable`,
      {
        method: 'PATCH',
        token: adminToken,
      }
    )

    assertEquals(status, 200)
    assertTrue(data.success)

    const updated = await prisma.subscription.findUnique({
      where: { id: subscription.id },
    })
    assertFalse(updated?.enabled)
    assertEquals(updated?.status, 'disabled')
    assertDefined(updated?.disabledBy)
    assertDefined(updated?.disabledAt)
  })

  tests.push(async () => {
    await setupSubscriptionTest()

    const user = await createTestUser('lifecycle@test.devbridge.com')
    const plan1 = await createTestPlan({
      name: 'test_lifecycle_1',
      displayName: 'Lifecycle Plan 1',
      price: 50,
      maxSessions: 50000,
    })
    const plan2 = await createTestPlan({
      name: 'test_lifecycle_2',
      displayName: 'Lifecycle Plan 2',
      price: 100,
      maxSessions: 100000,
    })

    // 1. Create subscription
    const sub = await createTestSubscription(user.id, plan1.id)
    assertEquals(sub.planId, plan1.id)

    // 2. Override quotas
    await makeApiRequest(`/api/admin/subscriptions/${sub.id}/quotas`, {
      method: 'PATCH',
      body: { maxSessions: 75000 },
      token: adminToken,
    })

    // 3. Change plan
    await makeApiRequest(`/api/admin/subscriptions/${sub.id}/plan`, {
      method: 'PATCH',
      body: { planId: plan2.id },
      token: adminToken,
    })

    // 4. Verify plan changed but quota override persists
    const updated = await prisma.subscription.findUnique({
      where: { id: sub.id },
      include: { plan: true },
    })
    assertEquals(updated?.planId, plan2.id)
    assertEquals(updated?.quotaMaxSessions, 75000)

    // 5. Disable and re-enable
    await makeApiRequest(`/api/admin/subscriptions/${sub.id}/disable`, {
      method: 'PATCH',
      token: adminToken,
    })

    await makeApiRequest(`/api/admin/subscriptions/${sub.id}/enable`, {
      method: 'PATCH',
      token: adminToken,
    })

    // 6. Final verification
    const final = await prisma.subscription.findUnique({
      where: { id: sub.id },
    })
    assertTrue(final?.enabled)
    assertEquals(final?.status, 'active')
    assertEquals(final?.planId, plan2.id)
  })

  return { name: 'Admin Subscription Management API', tests }
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

async function main() {
  console.log('🚀 Starting Comprehensive API Test Suite')
  console.log('═'.repeat(60))
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`Database: ${process.env.POSTGRES_PRISMA_URL ? 'Connected' : 'Not configured'}`)
  console.log(`API URL: ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}`)
  console.log('═'.repeat(60))

  const startTime = Date.now()
  let allPassed = true

  try {
    await setupTests()
    console.log('✅ Test environment setup complete\n')

    // Run test suites
    const planResults = await runTestSuite(createPlanManagementTests())
    const subscriptionResults = await runTestSuite(createSubscriptionManagementTests())

    // Summary
    const duration = Date.now() - startTime
    const allResults = [...planResults.results, ...subscriptionResults.results]
    const passed = allResults.filter(r => r.passed).length
    const failed = allResults.filter(r => !r.passed).length

    console.log('\n' + '═'.repeat(60))
    console.log('📊 Test Results Summary')
    console.log('═'.repeat(60))
    console.log(`Total Tests: ${allResults.length}`)
    console.log(`✅ Passed: ${passed}`)
    console.log(`❌ Failed: ${failed}`)
    console.log(`⏱️  Duration: ${(duration / 1000).toFixed(2)}s`)
    console.log('═'.repeat(60))

    if (failed > 0) {
      console.log('\n❌ Failed Tests:')
      allResults
        .filter(r => !r.passed)
        .forEach(r => {
          console.log(`  • ${r.name}`)
          if (r.error) {
            console.log(`    Error: ${r.error}`)
          }
        })
      allPassed = false
    } else {
      console.log('\n🎉 All tests passed!')
    }

    await cleanupTests()
    console.log('\n🧹 Test cleanup completed')

    process.exit(allPassed ? 0 : 1)
  } catch (error) {
    console.error('💥 Fatal error:', error)
    await cleanupTests()
    process.exit(1)
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error)
}

export { createPlanManagementTests, createSubscriptionManagementTests }
