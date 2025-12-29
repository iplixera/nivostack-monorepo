# Test Cases Documentation

Comprehensive test cases for Admin Plan and Subscription Management APIs.

## 📋 Test Coverage

### Plan Management API Tests

#### 1. GET /api/admin/plans
**Test Cases:**
- ✅ Returns all plans for admin user
- ✅ Requires admin authentication (401 if no token)
- ✅ Rejects non-admin users (403)
- ✅ Returns plans with subscription counts

**Edge Cases:**
- Empty plans list
- Plans with special characters in names
- Plans with very large numbers

#### 2. POST /api/admin/plans
**Test Cases:**
- ✅ Creates plan with all required fields
- ✅ Creates plan with all optional fields
- ✅ Creates plan with null limits (unlimited)
- ✅ Rejects missing required fields (name, displayName, price)
- ✅ Rejects duplicate plan names
- ✅ Validates price is a number
- ✅ Validates feature flags are boolean

**Edge Cases:**
- Plan with price = 0 (free plan)
- Plan with very high price
- Plan with negative price (should be rejected)
- Plan with empty string name
- Plan with special characters in name

#### 3. GET /api/admin/plans/[id]
**Test Cases:**
- ✅ Returns plan by valid ID
- ✅ Returns 404 for non-existent plan
- ✅ Returns plan with all fields

**Edge Cases:**
- Invalid ID format
- Deleted plan ID
- Very long ID string

#### 4. PATCH /api/admin/plans/[id]
**Test Cases:**
- ✅ Updates single field
- ✅ Updates multiple fields
- ✅ Updates plan status (isActive, isPublic)
- ✅ Updates all quota limits
- ✅ Updates all feature flags
- ✅ Rejects duplicate name on update
- ✅ Preserves unchanged fields

**Edge Cases:**
- Update with null values
- Update with empty strings
- Update with invalid data types
- Update non-existent plan

#### 5. DELETE /api/admin/plans/[id]
**Test Cases:**
- ✅ Deletes plan with no subscriptions
- ✅ Rejects deletion of plan with active subscriptions
- ✅ Returns 404 for non-existent plan

**Edge Cases:**
- Plan with expired subscriptions only
- Plan with cancelled subscriptions
- Cascading deletion behavior

---

### Subscription Management API Tests

#### 1. GET /api/admin/subscriptions/[id]
**Test Cases:**
- ✅ Returns subscription details
- ✅ Returns user information
- ✅ Returns plan information
- ✅ Returns invoice history
- ✅ Requires admin authentication

**Edge Cases:**
- Subscription with no invoices
- Subscription with many invoices
- Deleted user's subscription

#### 2. PATCH /api/admin/subscriptions/[id]/plan
**Test Cases:**
- ✅ Changes subscription to different plan
- ✅ Resets trial dates when moving to free plan
- ✅ Preserves quota overrides when changing plan
- ✅ Rejects invalid plan ID
- ✅ Requires planId in request body

**Edge Cases:**
- Change to same plan (should work but no-op)
- Change to inactive plan
- Change to deleted plan
- Change plan multiple times

#### 3. PATCH /api/admin/subscriptions/[id]/quotas
**Test Cases:**
- ✅ Updates single quota
- ✅ Updates multiple quotas
- ✅ Sets quota to null (use plan default)
- ✅ Updates all quota fields
- ✅ Preserves unchanged quotas

**Edge Cases:**
- Set quota to 0
- Set quota to negative (should be rejected)
- Set quota to very large number
- Set all quotas to null
- Quota override persists after plan change

#### 4. PATCH /api/admin/subscriptions/[id]/status
**Test Cases:**
- ✅ Updates status to 'active'
- ✅ Updates status to 'expired'
- ✅ Updates status to 'cancelled'
- ✅ Updates status to 'suspended'
- ✅ Updates status to 'disabled'
- ✅ Sets enabled=false when status='disabled'
- ✅ Sets enabled=true when status='active'
- ✅ Tracks admin user who made change
- ✅ Tracks timestamp of change
- ✅ Rejects invalid status values

**Edge Cases:**
- Status transition from active to expired
- Status transition from disabled to active
- Multiple status changes
- Status change with no admin user

#### 5. PATCH /api/admin/subscriptions/[id]/enable
**Test Cases:**
- ✅ Enables disabled subscription
- ✅ Sets status to 'active'
- ✅ Tracks admin user
- ✅ Tracks timestamp
- ✅ Re-enables feature flags

**Edge Cases:**
- Enable already enabled subscription
- Enable expired subscription
- Enable cancelled subscription

#### 6. PATCH /api/admin/subscriptions/[id]/disable
**Test Cases:**
- ✅ Disables active subscription
- ✅ Sets status to 'disabled'
- ✅ Tracks admin user
- ✅ Tracks timestamp
- ✅ Disables feature flags

**Edge Cases:**
- Disable already disabled subscription
- Disable expired subscription
- Multiple disable/enable cycles

---

## 🔄 Integration Test Scenarios

### Scenario 1: Complete Plan Lifecycle
1. Create new plan
2. Verify plan exists
3. Update plan limits
4. Create subscription with plan
5. Attempt to delete plan (should fail)
6. Remove subscription
7. Delete plan (should succeed)

### Scenario 2: Complete Subscription Lifecycle
1. User has free plan subscription
2. Admin overrides quotas
3. Admin changes to pro plan
4. Verify quotas persist
5. Admin disables subscription
6. Admin re-enables subscription
7. Admin changes status to expired
8. Admin changes back to active

### Scenario 3: Quota Override Logic
1. Plan has maxSessions: 10000
2. Admin overrides to maxSessions: 50000
3. Verify override is used
4. Admin changes plan (new plan has maxSessions: 20000)
5. Verify override persists (still 50000)
6. Admin sets override to null
7. Verify plan default is used (20000)

### Scenario 4: Plan Deletion Safety
1. Create plan A
2. Create plan B
3. Assign plan A to user subscription
4. Attempt to delete plan A (should fail)
5. Change subscription to plan B
6. Delete plan A (should succeed)
7. Verify subscription still works with plan B

---

## 🧪 Test Data Patterns

### Test Users
- Admin: `admin@test.devbridge.com`
- Regular: `user@test.devbridge.com`, `regular@test.devbridge.com`
- Pattern: `*@test.devbridge.com`

### Test Plans
- Pattern: `test_*` (e.g., `test_free`, `test_pro`, `test_premium`)
- All test plans are cleaned up after tests

### Test Subscriptions
- Created for test users only
- Linked to test plans
- All cleaned up after tests

---

## ✅ Validation Checklist

### Plan Validation
- [x] Name uniqueness enforced
- [x] Required fields validated
- [x] Price must be number
- [x] Limits can be null
- [x] Feature flags are boolean
- [x] Cannot delete with active subscriptions

### Subscription Validation
- [x] Plan must exist
- [x] User must exist
- [x] Status must be valid enum
- [x] Quotas can be null or number
- [x] Admin tracking works
- [x] Timestamp tracking works

### Authentication & Authorization
- [x] Admin endpoints require authentication
- [x] Admin endpoints require admin role
- [x] Regular users cannot access admin endpoints
- [x] Invalid tokens are rejected

---

## 🚀 Running Specific Test Cases

```bash
# Run all tests
pnpm test

# Run plan management tests only
pnpm test:plans

# Run subscription management tests only
pnpm test:subscriptions

# Run with verbose output
NODE_ENV=test tsx tests/api-test-suite.ts
```

---

## 📊 Expected Test Results

### Successful Run
```
🚀 Starting Comprehensive API Test Suite
════════════════════════════════════════════════════════════
✅ Test environment setup complete

🧪 Running Admin Plan Management API...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅ GET /api/admin/plans - should return all plans (45ms)
  ✅ POST /api/admin/plans - should create plan (52ms)
  ✅ PATCH /api/admin/plans/[id] - should update plan (38ms)
  ✅ DELETE /api/admin/plans/[id] - should delete plan (41ms)
  
  Summary: 10 passed, 0 failed

🧪 Running Admin Subscription Management API...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅ GET /api/admin/subscriptions/[id] (39ms)
  ✅ PATCH /api/admin/subscriptions/[id]/plan (47ms)
  ✅ PATCH /api/admin/subscriptions/[id]/quotas (43ms)
  ✅ PATCH /api/admin/subscriptions/[id]/status (41ms)
  
  Summary: 8 passed, 0 failed

════════════════════════════════════════════════════════════
📊 Test Results Summary
════════════════════════════════════════════════════════════
Total Tests: 18
✅ Passed: 18
❌ Failed: 0
⏱️  Duration: 2.34s
════════════════════════════════════════════════════════════

🎉 All tests passed!
```

---

## 🔍 Debugging Failed Tests

1. **Check database connection**: Ensure `POSTGRES_PRISMA_URL` is set
2. **Check test data**: Verify test users/plans are created
3. **Check API server**: Ensure Next.js dev server is running
4. **Check logs**: Look for error messages in test output
5. **Isolate test**: Run single test case to debug

---

**Last Updated**: December 25, 2025

