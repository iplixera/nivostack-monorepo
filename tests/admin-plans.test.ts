/**
 * Admin Plan Management API Tests
 * Tests all plan CRUD operations and edge cases
 */

import {
  setupTestDB,
  cleanupTestDB,
  createTestAdmin,
  createTestPlan,
  generateTestToken,
  makeApiRequest,
  prisma,
} from './setup'

describe('Admin Plan Management API', () => {
  let adminUser: any
  let adminToken: string
  let testPlan: any

  beforeAll(async () => {
    await setupTestDB()
    adminUser = await createTestAdmin()
    adminToken = await generateTestToken(adminUser.id)
  })

  afterAll(async () => {
    await cleanupTestDB()
    await prisma.$disconnect()
  })

  beforeEach(async () => {
    // Clean up test plans before each test
    await prisma.plan.deleteMany({ where: { name: { startsWith: 'test_' } } })
  })

  describe('GET /api/admin/plans', () => {
    test('should return all plans for admin', async () => {
      // Create test plans
      await createTestPlan({ name: 'test_plan_1', displayName: 'Test Plan 1', price: 10 })
      await createTestPlan({ name: 'test_plan_2', displayName: 'Test Plan 2', price: 20 })

      const { status, data } = await makeApiRequest('/api/admin/plans', {
        token: adminToken,
      })

      expect(status).toBe(200)
      expect(data.plans).toBeInstanceOf(Array)
      expect(data.plans.length).toBeGreaterThanOrEqual(2)
      
      const testPlans = data.plans.filter((p: any) => p.name.startsWith('test_'))
      expect(testPlans.length).toBe(2)
    })

    test('should require admin authentication', async () => {
      const { status, data } = await makeApiRequest('/api/admin/plans')

      expect(status).toBe(401)
      expect(data.error).toContain('Unauthorized')
    })

    test('should reject non-admin users', async () => {
      const regularUser = await createTestUser('regular@test.devbridge.com')
      const regularToken = await generateTestToken(regularUser.id)

      const { status, data } = await makeApiRequest('/api/admin/plans', {
        token: regularToken,
      })

      expect(status).toBe(403)
      expect(data.error).toContain('Admin access required')
    })
  })

  describe('POST /api/admin/plans', () => {
    test('should create a new plan with all fields', async () => {
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
        maxApiEndpoints: 100,
        maxApiRequests: 1000000,
        maxLogs: 500000,
        maxCrashes: 10000,
        maxBusinessConfigKeys: 500,
        maxLocalizationLanguages: 10,
        maxLocalizationKeys: 2000,
        retentionDays: 90,
        allowApiTracking: true,
        allowScreenTracking: true,
        allowCrashReporting: true,
        allowLogging: true,
        allowBusinessConfig: true,
        allowLocalization: true,
        allowCustomDomains: true,
        allowWebhooks: true,
        allowTeamMembers: false,
        allowPrioritySupport: true,
      }

      const { status, data } = await makeApiRequest('/api/admin/plans', {
        method: 'POST',
        body: planData,
        token: adminToken,
      })

      expect(status).toBe(201)
      expect(data.plan).toBeDefined()
      expect(data.plan.name).toBe('test_premium')
      expect(data.plan.displayName).toBe('Test Premium Plan')
      expect(data.plan.price).toBe(99.99)
      expect(data.plan.maxSessions).toBe(100000)
      expect(data.plan.allowCustomDomains).toBe(true)
    })

    test('should reject plan with missing required fields', async () => {
      const { status, data } = await makeApiRequest('/api/admin/plans', {
        method: 'POST',
        body: { name: 'test_incomplete' }, // Missing displayName and price
        token: adminToken,
      })

      expect(status).toBe(400)
      expect(data.error).toContain('required fields')
    })

    test('should reject duplicate plan name', async () => {
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

      expect(status).toBe(409)
      expect(data.error).toContain('already exists')
    })

    test('should create plan with null limits (unlimited)', async () => {
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

      expect(status).toBe(201)
      expect(data.plan.maxSessions).toBeNull()
      expect(data.plan.maxDevices).toBeNull()
      expect(data.plan.maxApiTraces).toBeNull()
    })
  })

  describe('GET /api/admin/plans/[id]', () => {
    test('should return plan by ID', async () => {
      const plan = await createTestPlan({
        name: 'test_get_by_id',
        displayName: 'Get By ID Plan',
        price: 50,
      })

      const { status, data } = await makeApiRequest(`/api/admin/plans/${plan.id}`, {
        token: adminToken,
      })

      expect(status).toBe(200)
      expect(data.plan.id).toBe(plan.id)
      expect(data.plan.name).toBe('test_get_by_id')
    })

    test('should return 404 for non-existent plan', async () => {
      const fakeId = 'clx1234567890abcdefghijklm'

      const { status, data } = await makeApiRequest(`/api/admin/plans/${fakeId}`, {
        token: adminToken,
      })

      expect(status).toBe(404)
      expect(data.error).toContain('not found')
    })
  })

  describe('PATCH /api/admin/plans/[id]', () => {
    test('should update plan fields', async () => {
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

      expect(status).toBe(200)
      expect(data.plan.displayName).toBe('Updated Name')
      expect(data.plan.price).toBe(25)
      expect(data.plan.maxSessions).toBe(5000)
      // Name should not change
      expect(data.plan.name).toBe('test_update')
    })

    test('should update plan status', async () => {
      const plan = await createTestPlan({
        name: 'test_status',
        displayName: 'Status Plan',
        price: 10,
        isActive: true,
        isPublic: true,
      })

      const { status, data } = await makeApiRequest(`/api/admin/plans/${plan.id}`, {
        method: 'PATCH',
        body: {
          isActive: false,
          isPublic: false,
        },
        token: adminToken,
      })

      expect(status).toBe(200)
      expect(data.plan.isActive).toBe(false)
      expect(data.plan.isPublic).toBe(false)
    })

    test('should reject duplicate name on update', async () => {
      const plan1 = await createTestPlan({
        name: 'test_plan_a',
        displayName: 'Plan A',
        price: 10,
      })
      const plan2 = await createTestPlan({
        name: 'test_plan_b',
        displayName: 'Plan B',
        price: 20,
      })

      const { status, data } = await makeApiRequest(`/api/admin/plans/${plan2.id}`, {
        method: 'PATCH',
        body: {
          name: 'test_plan_a', // Try to use plan1's name
        },
        token: adminToken,
      })

      expect(status).toBe(409)
      expect(data.error).toContain('already exists')
    })
  })

  describe('DELETE /api/admin/plans/[id]', () => {
    test('should delete plan with no subscriptions', async () => {
      const plan = await createTestPlan({
        name: 'test_delete',
        displayName: 'Delete Plan',
        price: 10,
      })

      const { status, data } = await makeApiRequest(`/api/admin/plans/${plan.id}`, {
        method: 'DELETE',
        token: adminToken,
      })

      expect(status).toBe(200)
      expect(data.success).toBe(true)

      // Verify plan is deleted
      const deletedPlan = await prisma.plan.findUnique({ where: { id: plan.id } })
      expect(deletedPlan).toBeNull()
    })

    test('should reject deletion of plan with active subscriptions', async () => {
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

      expect(status).toBe(500)
      expect(data.error).toContain('active subscription')

      // Verify plan still exists
      const existingPlan = await prisma.plan.findUnique({ where: { id: plan.id } })
      expect(existingPlan).not.toBeNull()
    })
  })
})

