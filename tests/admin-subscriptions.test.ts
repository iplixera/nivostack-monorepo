/**
 * Admin Subscription Management API Tests
 * Tests subscription management operations and edge cases
 */

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

describe('Admin Subscription Management API', () => {
  let adminUser: any
  let adminToken: string
  let testUser: any
  let freePlan: any
  let proPlan: any
  let subscription: any

  beforeAll(async () => {
    await setupTestDB()
    adminUser = await createTestAdmin()
    adminToken = await generateTestToken(adminUser.id)
  })

  beforeEach(async () => {
    // Clean up test data
    await prisma.subscription.deleteMany({ where: { user: { email: { contains: '@test.' } } } })
    await prisma.user.deleteMany({ where: { email: { contains: '@test.' } } })
    await prisma.plan.deleteMany({ where: { name: { startsWith: 'test_' } } })

    // Create test data
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
  })

  afterAll(async () => {
    await cleanupTestDB()
    await prisma.$disconnect()
  })

  describe('GET /api/admin/subscriptions/[id]', () => {
    test('should return subscription details', async () => {
      const { status, data } = await makeApiRequest(
        `/api/admin/subscriptions/${subscription.id}`,
        { token: adminToken }
      )

      expect(status).toBe(200)
      expect(data.subscription).toBeDefined()
      expect(data.subscription.id).toBe(subscription.id)
      expect(data.subscription.user.email).toBe('subscriber@test.devbridge.com')
      expect(data.subscription.plan.id).toBe(freePlan.id)
    })

    test('should require admin authentication', async () => {
      const { status, data } = await makeApiRequest(
        `/api/admin/subscriptions/${subscription.id}`
      )

      expect(status).toBe(401)
      expect(data.error).toContain('Unauthorized')
    })
  })

  describe('PATCH /api/admin/subscriptions/[id]/plan', () => {
    test('should change subscription plan', async () => {
      const { status, data } = await makeApiRequest(
        `/api/admin/subscriptions/${subscription.id}/plan`,
        {
          method: 'PATCH',
          body: { planId: proPlan.id },
          token: adminToken,
        }
      )

      expect(status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.subscription.plan.id).toBe(proPlan.id)
      expect(data.subscription.plan.name).toBe('test_pro')
    })

    test('should reset trial dates when moving to free plan', async () => {
      // First move to pro plan
      await makeApiRequest(`/api/admin/subscriptions/${subscription.id}/plan`, {
        method: 'PATCH',
        body: { planId: proPlan.id },
        token: adminToken,
      })

      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 100))

      // Move back to free plan
      const { status, data } = await makeApiRequest(
        `/api/admin/subscriptions/${subscription.id}/plan`,
        {
          method: 'PATCH',
          body: { planId: freePlan.id },
          token: adminToken,
        }
      )

      expect(status).toBe(200)
      const newTrialEnd = new Date(data.subscription.trialEndDate)
      const now = new Date()
      const daysDiff = Math.ceil((newTrialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      // Should be approximately 30 days (or plan retentionDays)
      expect(daysDiff).toBeGreaterThan(25)
      expect(daysDiff).toBeLessThan(35)
    })

    test('should reject invalid plan ID', async () => {
      const fakePlanId = 'clx1234567890abcdefghijklm'

      const { status, data } = await makeApiRequest(
        `/api/admin/subscriptions/${subscription.id}/plan`,
        {
          method: 'PATCH',
          body: { planId: fakePlanId },
          token: adminToken,
        }
      )

      expect(status).toBe(500)
      expect(data.error).toContain('not found')
    })

    test('should require planId in request body', async () => {
      const { status, data } = await makeApiRequest(
        `/api/admin/subscriptions/${subscription.id}/plan`,
        {
          method: 'PATCH',
          body: {},
          token: adminToken,
        }
      )

      expect(status).toBe(400)
      expect(data.error).toContain('planId is required')
    })
  })

  describe('PATCH /api/admin/subscriptions/[id]/quotas', () => {
    test('should update subscription quotas', async () => {
      const quotas = {
        maxDevices: 2000,
        maxSessions: 150000,
        maxApiTraces: 75000,
        maxLogs: null, // Use plan default
      }

      const { status, data } = await makeApiRequest(
        `/api/admin/subscriptions/${subscription.id}/quotas`,
        {
          method: 'PATCH',
          body: quotas,
          token: adminToken,
        }
      )

      expect(status).toBe(200)
      expect(data.success).toBe(true)
      
      // Verify quotas were updated
      const updated = await prisma.subscription.findUnique({
        where: { id: subscription.id },
      })
      expect(updated?.quotaMaxDevices).toBe(2000)
      expect(updated?.quotaMaxSessions).toBe(150000)
      expect(updated?.quotaMaxApiTraces).toBe(75000)
      expect(updated?.quotaMaxLogs).toBeNull()
    })

    test('should allow setting quotas to null (use plan default)', async () => {
      // First set some quotas
      await makeApiRequest(`/api/admin/subscriptions/${subscription.id}/quotas`, {
        method: 'PATCH',
        body: { maxDevices: 5000, maxSessions: 200000 },
        token: adminToken,
      })

      // Then reset to null
      const { status, data } = await makeApiRequest(
        `/api/admin/subscriptions/${subscription.id}/quotas`,
        {
          method: 'PATCH',
          body: { maxDevices: null, maxSessions: null },
          token: adminToken,
        }
      )

      expect(status).toBe(200)
      const updated = await prisma.subscription.findUnique({
        where: { id: subscription.id },
      })
      expect(updated?.quotaMaxDevices).toBeNull()
      expect(updated?.quotaMaxSessions).toBeNull()
    })

    test('should update all quota fields', async () => {
      const quotas = {
        maxDevices: 100,
        maxApiTraces: 1000,
        maxApiEndpoints: 20,
        maxApiRequests: 5000,
        maxLogs: 10000,
        maxSessions: 1000,
        maxCrashes: 100,
        maxBusinessConfigKeys: 50,
        maxLocalizationLanguages: 5,
        maxLocalizationKeys: 200,
      }

      const { status } = await makeApiRequest(
        `/api/admin/subscriptions/${subscription.id}/quotas`,
        {
          method: 'PATCH',
          body: quotas,
          token: adminToken,
        }
      )

      expect(status).toBe(200)
      
      const updated = await prisma.subscription.findUnique({
        where: { id: subscription.id },
      })
      expect(updated?.quotaMaxDevices).toBe(100)
      expect(updated?.quotaMaxApiTraces).toBe(1000)
      expect(updated?.quotaMaxBusinessConfigKeys).toBe(50)
      expect(updated?.quotaMaxLocalizationKeys).toBe(200)
    })
  })

  describe('PATCH /api/admin/subscriptions/[id]/status', () => {
    test('should update subscription status to expired', async () => {
      const { status, data } = await makeApiRequest(
        `/api/admin/subscriptions/${subscription.id}/status`,
        {
          method: 'PATCH',
          body: { status: 'expired' },
          token: adminToken,
        }
      )

      expect(status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.subscription.status).toBe('expired')
    })

    test('should update subscription status to cancelled', async () => {
      const { status, data } = await makeApiRequest(
        `/api/admin/subscriptions/${subscription.id}/status`,
        {
          method: 'PATCH',
          body: { status: 'cancelled' },
          token: adminToken,
        }
      )

      expect(status).toBe(200)
      expect(data.subscription.status).toBe('cancelled')
    })

    test('should disable subscription when status is disabled', async () => {
      const { status, data } = await makeApiRequest(
        `/api/admin/subscriptions/${subscription.id}/status`,
        {
          method: 'PATCH',
          body: { status: 'disabled' },
          token: adminToken,
        }
      )

      expect(status).toBe(200)
      expect(data.subscription.status).toBe('disabled')
      expect(data.subscription.enabled).toBe(false)
      expect(data.subscription.disabledBy).toBe(adminUser.id)
      expect(data.subscription.disabledAt).toBeDefined()
    })

    test('should enable subscription when status is active', async () => {
      // First disable it
      await makeApiRequest(`/api/admin/subscriptions/${subscription.id}/status`, {
        method: 'PATCH',
        body: { status: 'disabled' },
        token: adminToken,
      })

      // Then enable it
      const { status, data } = await makeApiRequest(
        `/api/admin/subscriptions/${subscription.id}/status`,
        {
          method: 'PATCH',
          body: { status: 'active' },
          token: adminToken,
        }
      )

      expect(status).toBe(200)
      expect(data.subscription.status).toBe('active')
      expect(data.subscription.enabled).toBe(true)
      expect(data.subscription.enabledBy).toBe(adminUser.id)
      expect(data.subscription.enabledAt).toBeDefined()
    })

    test('should reject invalid status', async () => {
      const { status, data } = await makeApiRequest(
        `/api/admin/subscriptions/${subscription.id}/status`,
        {
          method: 'PATCH',
          body: { status: 'invalid_status' },
          token: adminToken,
        }
      )

      expect(status).toBe(400)
      expect(data.error).toContain('Invalid status')
    })

    test('should require status in request body', async () => {
      const { status, data } = await makeApiRequest(
        `/api/admin/subscriptions/${subscription.id}/status`,
        {
          method: 'PATCH',
          body: {},
          token: adminToken,
        }
      )

      expect(status).toBe(400)
      expect(data.error).toContain('status is required')
    })
  })

  describe('PATCH /api/admin/subscriptions/[id]/enable', () => {
    test('should enable disabled subscription', async () => {
      // First disable it
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

      expect(status).toBe(200)
      expect(data.success).toBe(true)

      const updated = await prisma.subscription.findUnique({
        where: { id: subscription.id },
      })
      expect(updated?.enabled).toBe(true)
      expect(updated?.status).toBe('active')
    })
  })

  describe('PATCH /api/admin/subscriptions/[id]/disable', () => {
    test('should disable active subscription', async () => {
      const { status, data } = await makeApiRequest(
        `/api/admin/subscriptions/${subscription.id}/disable`,
        {
          method: 'PATCH',
          token: adminToken,
        }
      )

      expect(status).toBe(200)
      expect(data.success).toBe(true)

      const updated = await prisma.subscription.findUnique({
        where: { id: subscription.id },
      })
      expect(updated?.enabled).toBe(false)
      expect(updated?.status).toBe('disabled')
      expect(updated?.disabledBy).toBe(adminUser.id)
      expect(updated?.disabledAt).toBeDefined()
    })
  })

  describe('Integration: Complete Subscription Lifecycle', () => {
    test('should handle complete subscription management flow', async () => {
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
      expect(sub.planId).toBe(plan1.id)

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
      expect(updated?.planId).toBe(plan2.id)
      expect(updated?.quotaMaxSessions).toBe(75000) // Override should persist

      // 5. Disable subscription
      await makeApiRequest(`/api/admin/subscriptions/${sub.id}/disable`, {
        method: 'PATCH',
        token: adminToken,
      })

      // 6. Re-enable subscription
      await makeApiRequest(`/api/admin/subscriptions/${sub.id}/enable`, {
        method: 'PATCH',
        token: adminToken,
      })

      // 7. Final verification
      const final = await prisma.subscription.findUnique({
        where: { id: sub.id },
      })
      expect(final?.enabled).toBe(true)
      expect(final?.status).toBe('active')
      expect(final?.planId).toBe(plan2.id)
    })
  })
})

