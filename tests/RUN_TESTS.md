# How to Run API Tests

## 🚀 Quick Start

### Prerequisites

1. **Start Next.js Dev Server** (in one terminal):
   ```bash
   pnpm dev
   ```

2. **Set Environment Variables**:
   ```bash
   # In .env.local or .env.test
   POSTGRES_PRISMA_URL="postgresql://user:password@localhost:5432/devbridge"
   POSTGRES_URL_NON_POOLING="postgresql://user:password@localhost:5432/devbridge"
   JWT_SECRET="your-jwt-secret"
   NEXT_PUBLIC_API_URL="http://localhost:3000"
   TEST_DB=true  # Allows test cleanup
   ```

### Run Tests

#### Option 1: Manual Test Script (Recommended for First Time)
```bash
# This script simulates API calls and shows detailed output
pnpm test:manual
```

#### Option 2: Automated Test Suite
```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test:plans
pnpm test:subscriptions
```

## 📋 Test Scenarios Covered

### Plan Management
1. ✅ List all plans
2. ✅ Create new plan
3. ✅ Get plan by ID
4. ✅ Update plan
5. ✅ Delete plan
6. ✅ Reject duplicate names
7. ✅ Reject missing fields
8. ✅ Reject deletion with active subscriptions

### Subscription Management
1. ✅ Get subscription details
2. ✅ Change subscription plan
3. ✅ Update quota overrides
4. ✅ Update subscription status
5. ✅ Enable/disable subscription
6. ✅ Reject invalid inputs
7. ✅ Require admin authentication

### Integration Tests
1. ✅ Complete plan lifecycle
2. ✅ Complete subscription lifecycle
3. ✅ Quota override persistence
4. ✅ Plan change with quota overrides

## 🔍 Understanding Test Output

### Successful Test
```
🧪 GET /api/admin/plans - should return all plans
────────────────────────────────────────────────────────────
✅ Status: 200
   Response: { "plans": [...] }
```

### Failed Test
```
🧪 POST /api/admin/plans - Reject duplicate name
────────────────────────────────────────────────────────────
❌ Status: 200 (should be 409)
   Response: { "error": "..." }
```

## 🐛 Troubleshooting

### Error: "Database connection failed"
- Check `POSTGRES_PRISMA_URL` is set correctly
- Ensure PostgreSQL is running
- Verify database exists

### Error: "Unauthorized" or "Admin access required"
- Check admin user was created correctly
- Verify JWT_SECRET is set
- Check token generation

### Error: "Plan not found" or "Subscription not found"
- Test data may have been cleaned up
- Re-run test setup
- Check database state manually

### Error: "Cannot delete plan with active subscriptions"
- This is expected behavior
- Test is validating business logic
- Remove subscriptions first

## 📊 Test Data

### Test Users Created
- `admin@test.devbridge.com` (Admin)
- `user@test.devbridge.com` (Regular)
- `regular@test.devbridge.com` (Regular)
- `subscriber@test.devbridge.com` (Regular)
- `lifecycle@test.devbridge.com` (Regular)

### Test Plans Created
- `test_manual_plan`
- `test_manual_free`
- `test_manual_pro`
- `test_lifecycle_1`
- `test_lifecycle_2`

### Cleanup
All test data is automatically cleaned up after tests complete.
Test data uses `@test.devbridge.com` email domain and `test_` plan prefix.

## 🔄 Continuous Testing

### Watch Mode (Future Enhancement)
```bash
# Run tests on file changes
pnpm test:watch
```

### CI/CD Integration
```yaml
# Example GitHub Actions
- name: Run API Tests
  run: pnpm test
  env:
    POSTGRES_PRISMA_URL: ${{ secrets.TEST_DATABASE_URL }}
    JWT_SECRET: ${{ secrets.JWT_SECRET }}
    TEST_DB: true
```

## 📝 Writing New Tests

1. Add test case to `tests/api-test-suite.ts`
2. Use test helpers from `tests/test-helpers.ts`
3. Use setup utilities from `tests/setup.ts`
4. Run test: `pnpm test`

Example:
```typescript
test('should do something', async () => {
  const { status, data } = await makeApiRequest('/api/endpoint', {
    method: 'POST',
    body: { ... },
    token: adminToken,
  })
  
  assertEquals(status, 200)
  assertDefined(data.result)
})
```

---

**Last Updated**: December 25, 2025

