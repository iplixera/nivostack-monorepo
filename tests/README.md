# API Testing Guide

Comprehensive test suite for Admin Plan and Subscription Management APIs.

## 📋 Overview

This test suite validates:
- ✅ Plan CRUD operations
- ✅ Subscription management operations
- ✅ Authentication and authorization
- ✅ Database constraints and validations
- ✅ Edge cases and error handling
- ✅ Integration scenarios

## 🚀 Quick Start

### Prerequisites

1. **Test Database**: Set up a separate test database or use your local database
2. **Environment Variables**: Create `.env.test` with:
   ```bash
   POSTGRES_PRISMA_URL="postgresql://user:password@localhost:5432/devbridge_test"
   POSTGRES_URL_NON_POOLING="postgresql://user:password@localhost:5432/devbridge_test"
   JWT_SECRET="test-secret-key"
   NEXT_PUBLIC_API_URL="http://localhost:3000"
   TEST_DB=true
   ```

### Install Dependencies

```bash
pnpm install
```

### Run Tests

```bash
# Run all tests
pnpm test

# Run specific test file
tsx tests/admin-plans.test.ts
tsx tests/admin-subscriptions.test.ts

# Run with test runner
tsx tests/test-runner.ts
```

## 📝 Test Cases

### Admin Plan Management Tests

#### GET /api/admin/plans
- ✅ Returns all plans for admin
- ✅ Requires admin authentication
- ✅ Rejects non-admin users

#### POST /api/admin/plans
- ✅ Creates plan with all fields
- ✅ Rejects missing required fields
- ✅ Rejects duplicate plan names
- ✅ Creates plan with null limits (unlimited)

#### GET /api/admin/plans/[id]
- ✅ Returns plan by ID
- ✅ Returns 404 for non-existent plan

#### PATCH /api/admin/plans/[id]
- ✅ Updates plan fields
- ✅ Updates plan status
- ✅ Rejects duplicate name on update

#### DELETE /api/admin/plans/[id]
- ✅ Deletes plan with no subscriptions
- ✅ Rejects deletion of plan with active subscriptions

### Admin Subscription Management Tests

#### GET /api/admin/subscriptions/[id]
- ✅ Returns subscription details
- ✅ Requires admin authentication

#### PATCH /api/admin/subscriptions/[id]/plan
- ✅ Changes subscription plan
- ✅ Resets trial dates when moving to free plan
- ✅ Rejects invalid plan ID
- ✅ Requires planId in request body

#### PATCH /api/admin/subscriptions/[id]/quotas
- ✅ Updates subscription quotas
- ✅ Allows setting quotas to null (use plan default)
- ✅ Updates all quota fields

#### PATCH /api/admin/subscriptions/[id]/status
- ✅ Updates subscription status to expired
- ✅ Updates subscription status to cancelled
- ✅ Disables subscription when status is disabled
- ✅ Enables subscription when status is active
- ✅ Rejects invalid status
- ✅ Requires status in request body

#### PATCH /api/admin/subscriptions/[id]/enable
- ✅ Enables disabled subscription

#### PATCH /api/admin/subscriptions/[id]/disable
- ✅ Disables active subscription

#### Integration Tests
- ✅ Complete subscription lifecycle management

## 🧪 Test Utilities

### Setup Functions

```typescript
// Create test admin user
const admin = await createTestAdmin()

// Create test regular user
const user = await createTestUser('user@test.devbridge.com')

// Create test plan
const plan = await createTestPlan({
  name: 'test_plan',
  displayName: 'Test Plan',
  price: 99.99,
  maxSessions: 100000,
})

// Create test subscription
const subscription = await createTestSubscription(userId, planId)

// Generate JWT token
const token = await generateTestToken(userId)

// Make API request
const { status, data } = await makeApiRequest('/api/admin/plans', {
  method: 'POST',
  body: planData,
  token: adminToken,
})
```

## 📊 Test Scenarios

### Scenario 1: Create and Configure Plan
1. Admin creates a new plan with custom limits
2. Verify plan is created with correct values
3. Update plan limits
4. Verify updates are saved

### Scenario 2: Manage User Subscription
1. User has free plan subscription
2. Admin changes user to pro plan
3. Admin overrides quotas for user
4. Admin disables subscription
5. Admin re-enables subscription
6. Verify all changes persist correctly

### Scenario 3: Plan Deletion Safety
1. Create plan
2. Assign plan to user subscription
3. Attempt to delete plan (should fail)
4. Remove subscription
5. Delete plan (should succeed)

### Scenario 4: Quota Override Logic
1. User has plan with maxSessions: 10000
2. Admin overrides to maxSessions: 50000
3. Verify override is used
4. Admin sets override to null
5. Verify plan default is used

## 🔍 Validation Checks

### Plan Validation
- ✅ Name uniqueness
- ✅ Required fields (name, displayName, price)
- ✅ Price must be number
- ✅ Limits can be null (unlimited)
- ✅ Feature flags are boolean

### Subscription Validation
- ✅ Plan must exist
- ✅ User must exist
- ✅ Status must be valid enum
- ✅ Quotas can be null or number
- ✅ Cannot delete plan with active subscriptions

## 🐛 Error Scenarios Tested

1. **Authentication Errors**
   - Missing token
   - Invalid token
   - Non-admin user

2. **Validation Errors**
   - Missing required fields
   - Invalid data types
   - Duplicate names
   - Invalid status values

3. **Business Logic Errors**
   - Deleting plan with subscriptions
   - Changing to non-existent plan
   - Invalid quota values

## 📈 Coverage Goals

- ✅ All API endpoints covered
- ✅ All error cases tested
- ✅ Edge cases validated
- ✅ Integration scenarios verified
- ✅ Database constraints tested

## 🔧 Running Tests in CI/CD

Add to your CI pipeline:

```yaml
# Example GitHub Actions
- name: Run API Tests
  run: |
    pnpm test
  env:
    POSTGRES_PRISMA_URL: ${{ secrets.TEST_DATABASE_URL }}
    JWT_SECRET: ${{ secrets.JWT_SECRET }}
    TEST_DB: true
```

## 📝 Writing New Tests

1. Import test utilities:
```typescript
import {
  setupTestDB,
  cleanupTestDB,
  createTestAdmin,
  createTestPlan,
  generateTestToken,
  makeApiRequest,
} from './setup'
```

2. Set up test environment:
```typescript
beforeAll(async () => {
  await setupTestDB()
  adminUser = await createTestAdmin()
  adminToken = await generateTestToken(adminUser.id)
})

afterAll(async () => {
  await cleanupTestDB()
})
```

3. Write test cases:
```typescript
test('should create plan', async () => {
  const { status, data } = await makeApiRequest('/api/admin/plans', {
    method: 'POST',
    body: planData,
    token: adminToken,
  })
  
  expect(status).toBe(201)
  expect(data.plan).toBeDefined()
})
```

## 🚨 Important Notes

1. **Test Database**: Always use a separate test database
2. **Cleanup**: Tests clean up after themselves
3. **Isolation**: Each test should be independent
4. **Data**: Test data uses `@test.` email domain and `test_` plan prefix
5. **Safety**: Cleanup only runs in test environment

## 📚 Related Documentation

- [Admin Plan & Subscription Management](./../docs/features/ADMIN_PLAN_SUBSCRIPTION_MANAGEMENT.md)
- [Subscription Billing Gap Analysis](./../docs/features/SUBSCRIPTION_BILLING_GAP_ANALYSIS.md)

---

**Last Updated**: December 25, 2025

