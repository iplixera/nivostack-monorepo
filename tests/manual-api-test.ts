#!/usr/bin/env tsx
/**
 * Manual API Test Script
 * Simulates API calls to test admin plan and subscription management
 * 
 * Usage:
 *   1. Start Next.js dev server: pnpm dev
 *   2. Run this script: tsx tests/manual-api-test.ts
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

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

async function printSection(title: string) {
  console.log('\n' + '═'.repeat(60))
  console.log(`  ${title}`)
  console.log('═'.repeat(60))
}

async function printTest(name: string) {
  console.log(`\n🧪 ${name}`)
  console.log('─'.repeat(60))
}

async function printResult(success: boolean, message: string, data?: any) {
  if (success) {
    console.log(`✅ ${message}`)
  } else {
    console.log(`❌ ${message}`)
  }
  if (data) {
    console.log('   Response:', JSON.stringify(data, null, 2))
  }
}

async function main() {
  console.log('🚀 Manual API Test Suite')
  console.log('This script tests admin plan and subscription management APIs')
  console.log(`API Base URL: ${API_BASE}`)
  console.log('\n⚠️  Make sure Next.js dev server is running (pnpm dev)')

  try {
    // Setup
    await printSection('SETUP')
    await setupTestDB()
    console.log('✅ Database connected')

    const adminUser = await createTestAdmin()
    const adminToken = await generateTestToken(adminUser.id)
    console.log(`✅ Admin user created: ${adminUser.email}`)
    console.log(`✅ Admin token generated`)

    const regularUser = await createTestUser('regular@test.devbridge.com')
    const regularToken = await generateTestToken(regularUser.id)
    console.log(`✅ Regular user created: ${regularUser.email}`)

    // ========================================================================
    // PLAN MANAGEMENT TESTS
    // ========================================================================
    await printSection('PLAN MANAGEMENT TESTS')

    // Test 1: Get all plans
    await printTest('GET /api/admin/plans - List all plans')
    try {
      const { status, data } = await makeApiRequest('/api/admin/plans', {
        token: adminToken,
      })
      printResult(status === 200, `Status: ${status}`, {
        planCount: data.plans?.length || 0,
      })
    } catch (error) {
      printResult(false, `Error: ${error instanceof Error ? error.message : 'Unknown'}`)
    }

    // Test 2: Create plan
    await printTest('POST /api/admin/plans - Create new plan')
    const testPlanData = {
      name: 'test_manual_plan',
      displayName: 'Manual Test Plan',
      description: 'Plan created by manual test script',
      price: 149.99,
      currency: 'USD',
      interval: 'month',
      isActive: true,
      isPublic: true,
      maxSessions: 75000,
      maxDevices: 750,
      maxApiTraces: 37500,
      maxApiEndpoints: 75,
      maxApiRequests: 750000,
      maxLogs: 375000,
      maxCrashes: 7500,
      maxBusinessConfigKeys: 375,
      maxLocalizationLanguages: 7,
      maxLocalizationKeys: 1500,
      retentionDays: 60,
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

    let createdPlan: any = null
    try {
      const { status, data } = await makeApiRequest('/api/admin/plans', {
        method: 'POST',
        body: testPlanData,
        token: adminToken,
      })
      printResult(status === 201, `Status: ${status}`, {
        planId: data.plan?.id,
        planName: data.plan?.name,
      })
      createdPlan = data.plan
    } catch (error) {
      printResult(false, `Error: ${error instanceof Error ? error.message : 'Unknown'}`)
    }

    // Test 3: Get plan by ID
    if (createdPlan) {
      await printTest(`GET /api/admin/plans/${createdPlan.id} - Get plan by ID`)
      try {
        const { status, data } = await makeApiRequest(`/api/admin/plans/${createdPlan.id}`, {
          token: adminToken,
        })
        printResult(status === 200, `Status: ${status}`, {
          planName: data.plan?.name,
          price: data.plan?.price,
        })
      } catch (error) {
        printResult(false, `Error: ${error instanceof Error ? error.message : 'Unknown'}`)
      }
    }

    // Test 4: Update plan
    if (createdPlan) {
      await printTest(`PATCH /api/admin/plans/${createdPlan.id} - Update plan`)
      try {
        const { status, data } = await makeApiRequest(`/api/admin/plans/${createdPlan.id}`, {
          method: 'PATCH',
          body: {
            displayName: 'Updated Manual Test Plan',
            price: 199.99,
            maxSessions: 100000,
          },
          token: adminToken,
        })
        printResult(status === 200, `Status: ${status}`, {
          updatedName: data.plan?.displayName,
          updatedPrice: data.plan?.price,
          updatedSessions: data.plan?.maxSessions,
        })
      } catch (error) {
        printResult(false, `Error: ${error instanceof Error ? error.message : 'Unknown'}`)
      }
    }

    // Test 5: Test duplicate name rejection
    await printTest('POST /api/admin/plans - Reject duplicate name')
    try {
      const { status, data } = await makeApiRequest('/api/admin/plans', {
        method: 'POST',
        body: {
          name: 'test_manual_plan', // Duplicate
          displayName: 'Another Plan',
          price: 50,
        },
        token: adminToken,
      })
      printResult(status === 409, `Status: ${status} (should be 409)`, {
        error: data.error,
      })
    } catch (error) {
      printResult(false, `Error: ${error instanceof Error ? error.message : 'Unknown'}`)
    }

    // Test 6: Test missing required fields
    await printTest('POST /api/admin/plans - Reject missing required fields')
    try {
      const { status, data } = await makeApiRequest('/api/admin/plans', {
        method: 'POST',
        body: {
          name: 'test_incomplete',
          // Missing displayName and price
        },
        token: adminToken,
      })
      printResult(status === 400, `Status: ${status} (should be 400)`, {
        error: data.error,
      })
    } catch (error) {
      printResult(false, `Error: ${error instanceof Error ? error.message : 'Unknown'}`)
    }

    // ========================================================================
    // SUBSCRIPTION MANAGEMENT TESTS
    // ========================================================================
    await printSection('SUBSCRIPTION MANAGEMENT TESTS')

    // Create test plans and subscription
    const freePlan = await createTestPlan({
      name: 'test_manual_free',
      displayName: 'Manual Test Free Plan',
      price: 0,
      maxSessions: 10000,
      maxDevices: 100,
    })

    const proPlan = await createTestPlan({
      name: 'test_manual_pro',
      displayName: 'Manual Test Pro Plan',
      price: 199,
      maxSessions: 100000,
      maxDevices: 1000,
    })

    const testUser = await createTestUser('subscriber@test.devbridge.com')
    const subscription = await createTestSubscription(testUser.id, freePlan.id)
    console.log(`✅ Test subscription created: ${subscription.id}`)

    // Test 1: Get subscription
    await printTest(`GET /api/admin/subscriptions/${subscription.id} - Get subscription`)
    try {
      const { status, data } = await makeApiRequest(
        `/api/admin/subscriptions/${subscription.id}`,
        { token: adminToken }
      )
      printResult(status === 200, `Status: ${status}`, {
        userId: data.subscription?.user?.email,
        planName: data.subscription?.plan?.name,
        status: data.subscription?.status,
      })
    } catch (error) {
      printResult(false, `Error: ${error instanceof Error ? error.message : 'Unknown'}`)
    }

    // Test 2: Change plan
    await printTest(`PATCH /api/admin/subscriptions/${subscription.id}/plan - Change plan`)
    try {
      const { status, data } = await makeApiRequest(
        `/api/admin/subscriptions/${subscription.id}/plan`,
        {
          method: 'PATCH',
          body: { planId: proPlan.id },
          token: adminToken,
        }
      )
      printResult(status === 200, `Status: ${status}`, {
        newPlanName: data.subscription?.plan?.name,
        newPlanPrice: data.subscription?.plan?.price,
      })
    } catch (error) {
      printResult(false, `Error: ${error instanceof Error ? error.message : 'Unknown'}`)
    }

    // Test 3: Update quotas
    await printTest(`PATCH /api/admin/subscriptions/${subscription.id}/quotas - Update quotas`)
    try {
      const { status, data } = await makeApiRequest(
        `/api/admin/subscriptions/${subscription.id}/quotas`,
        {
          method: 'PATCH',
          body: {
            maxDevices: 2000,
            maxSessions: 150000,
            maxApiTraces: 75000,
            maxLogs: null, // Use plan default
          },
          token: adminToken,
        }
      )
      printResult(status === 200, `Status: ${status}`, {
        quotaMaxDevices: data.subscription?.quotaMaxDevices,
        quotaMaxSessions: data.subscription?.quotaMaxSessions,
        quotaMaxApiTraces: data.subscription?.quotaMaxApiTraces,
        quotaMaxLogs: data.subscription?.quotaMaxLogs,
      })
    } catch (error) {
      printResult(false, `Error: ${error instanceof Error ? error.message : 'Unknown'}`)
    }

    // Test 4: Update status
    await printTest(`PATCH /api/admin/subscriptions/${subscription.id}/status - Update status`)
    try {
      const { status, data } = await makeApiRequest(
        `/api/admin/subscriptions/${subscription.id}/status`,
        {
          method: 'PATCH',
          body: { status: 'expired' },
          token: adminToken,
        }
      )
      printResult(status === 200, `Status: ${status}`, {
        newStatus: data.subscription?.status,
      })
    } catch (error) {
      printResult(false, `Error: ${error instanceof Error ? error.message : 'Unknown'}`)
    }

    // Test 5: Disable subscription
    await printTest(`PATCH /api/admin/subscriptions/${subscription.id}/disable - Disable`)
    try {
      const { status, data } = await makeApiRequest(
        `/api/admin/subscriptions/${subscription.id}/disable`,
        {
          method: 'PATCH',
          token: adminToken,
        }
      )
      printResult(status === 200, `Status: ${status}`, {
        enabled: data.subscription?.enabled,
        status: data.subscription?.status,
      })
    } catch (error) {
      printResult(false, `Error: ${error instanceof Error ? error.message : 'Unknown'}`)
    }

    // Test 6: Enable subscription
    await printTest(`PATCH /api/admin/subscriptions/${subscription.id}/enable - Enable`)
    try {
      const { status, data } = await makeApiRequest(
        `/api/admin/subscriptions/${subscription.id}/enable`,
        {
          method: 'PATCH',
          token: adminToken,
        }
      )
      printResult(status === 200, `Status: ${status}`, {
        enabled: data.subscription?.enabled,
        status: data.subscription?.status,
      })
    } catch (error) {
      printResult(false, `Error: ${error instanceof Error ? error.message : 'Unknown'}`)
    }

    // Test 7: Test invalid status
    await printTest(`PATCH /api/admin/subscriptions/${subscription.id}/status - Reject invalid status`)
    try {
      const { status, data } = await makeApiRequest(
        `/api/admin/subscriptions/${subscription.id}/status`,
        {
          method: 'PATCH',
          body: { status: 'invalid_status' },
          token: adminToken,
        }
      )
      printResult(status === 400, `Status: ${status} (should be 400)`, {
        error: data.error,
      })
    } catch (error) {
      printResult(false, `Error: ${error instanceof Error ? error.message : 'Unknown'}`)
    }

    // Test 8: Test authentication
    await printTest('GET /api/admin/plans - Reject non-admin user')
    try {
      const { status, data } = await makeApiRequest('/api/admin/plans', {
        token: regularToken,
      })
      printResult(status === 403, `Status: ${status} (should be 403)`, {
        error: data.error,
      })
    } catch (error) {
      printResult(false, `Error: ${error instanceof Error ? error.message : 'Unknown'}`)
    }

    // ========================================================================
    // INTEGRATION TEST
    // ========================================================================
    await printSection('INTEGRATION TEST - Complete Lifecycle')

    const lifecycleUser = await createTestUser('lifecycle@test.devbridge.com')
    const lifecyclePlan1 = await createTestPlan({
      name: 'test_lifecycle_1',
      displayName: 'Lifecycle Plan 1',
      price: 50,
      maxSessions: 50000,
    })
    const lifecyclePlan2 = await createTestPlan({
      name: 'test_lifecycle_2',
      displayName: 'Lifecycle Plan 2',
      price: 100,
      maxSessions: 100000,
    })

    const lifecycleSub = await createTestSubscription(lifecycleUser.id, lifecyclePlan1.id)
    console.log(`✅ Created subscription: ${lifecycleSub.id}`)

    // Step 1: Override quotas
    await printTest('Step 1: Override quotas')
    await makeApiRequest(`/api/admin/subscriptions/${lifecycleSub.id}/quotas`, {
      method: 'PATCH',
      body: { maxSessions: 75000 },
      token: adminToken,
    })
    console.log('✅ Quotas overridden')

    // Step 2: Change plan
    await printTest('Step 2: Change plan')
    await makeApiRequest(`/api/admin/subscriptions/${lifecycleSub.id}/plan`, {
      method: 'PATCH',
      body: { planId: lifecyclePlan2.id },
      token: adminToken,
    })
    console.log('✅ Plan changed')

    // Step 3: Verify quota override persists
    await printTest('Step 3: Verify quota override persists')
    const final = await prisma.subscription.findUnique({
      where: { id: lifecycleSub.id },
      include: { plan: true },
    })
    console.log(`✅ Plan ID: ${final?.planId} (should be ${lifecyclePlan2.id})`)
    console.log(`✅ Quota Override: ${final?.quotaMaxSessions} (should be 75000)`)
    console.log(`✅ Plan Default: ${final?.plan.maxSessions} (should be 100000)`)

    // ========================================================================
    // SUMMARY
    // ========================================================================
    await printSection('TEST SUMMARY')
    console.log('✅ All test scenarios executed')
    console.log('📊 Check results above for any failures')
    console.log('\n💡 Tips:')
    console.log('   - Green ✅ means test passed')
    console.log('   - Red ❌ means test failed (check error message)')
    console.log('   - Verify database state manually if needed')

    // Cleanup
    await cleanupTestDB()
    console.log('\n🧹 Test data cleaned up')

  } catch (error) {
    console.error('\n💥 Fatal error:', error)
    await cleanupTestDB()
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(console.error)

