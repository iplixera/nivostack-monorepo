# Plan Throttling & Performance Test Guide

**Date**: December 25, 2025  
**Purpose**: Test plan throttling, upgrades, and performance with large data volumes

---

## 🎯 Test Objectives

1. **Throttling Behavior**: Verify plans throttle correctly when limits are exceeded
2. **Plan Upgrades**: Test upgrading from Free → Pro → Team and verify limits increase
3. **Performance**: Test system performance with large data volumes
4. **Multiple Meters**: Test all quota meters independently

---

## 🚀 Quick Start

### Prerequisites
```bash
# Terminal 1: Start Next.js server
pnpm dev

# Terminal 2: Run throttling tests
TEST_DB=true pnpm test:throttling
```

### Generate Test Data
```bash
# Generate data for Free plan (1x scale)
pnpm test:generate-data free 1

# Generate data for Pro plan (10x scale)
pnpm test:generate-data pro 10

# Generate data for Team plan (100x scale)
pnpm test:generate-data team 100
```

---

## 📊 Test Scenarios

### Test 1: Free Plan Throttling
**Objective**: Verify Free Plan throttles at limits

**Steps**:
1. Create Free Plan user
2. Generate data up to Free Plan limits:
   - 100 devices
   - 1,000 sessions
   - 1,000 API traces
   - 10,000 logs
   - 100 crashes
3. Attempt to exceed limits
4. Verify throttling occurs

**Expected Results**:
- ✅ Data generation succeeds up to limits
- ✅ Attempts to exceed limits are throttled
- ✅ Throttling status correctly reported

---

### Test 2: Pro Plan Throttling
**Objective**: Verify Pro Plan handles higher volumes

**Steps**:
1. Create Pro Plan user
2. Generate data up to Pro Plan limits:
   - 1,000 devices
   - 100,000 sessions
   - 100,000 API traces
   - 500,000 logs
   - 10,000 crashes
3. Verify Pro Plan can handle more than Free Plan

**Expected Results**:
- ✅ Pro Plan handles 10x more data than Free Plan
- ✅ All limits correctly enforced
- ✅ No throttling until limits reached

---

### Test 3: Team Plan (Unlimited)
**Objective**: Verify Team Plan supports unlimited features

**Steps**:
1. Create Team Plan user
2. Generate large volume of data:
   - 5,000 devices
   - 500,000 sessions
   - 500,000 API traces
   - 2,000,000 logs
   - 50,000 crashes
3. Verify unlimited features work

**Expected Results**:
- ✅ Devices: Unlimited (null limit)
- ✅ Logs: Unlimited (null limit)
- ✅ Other features: High limits (500K+)

---

### Test 4: Plan Upgrade (Free → Pro)
**Objective**: Test upgrading from Free to Pro Plan

**Steps**:
1. Create Free Plan user
2. Generate data at Free Plan limits
3. Upgrade to Pro Plan via admin API
4. Verify limits increased
5. Generate more data (within new limits)
6. Verify no throttling

**Expected Results**:
- ✅ Upgrade successful
- ✅ Limits increase from Free to Pro
- ✅ Existing data preserved
- ✅ Can generate more data after upgrade

---

### Test 5: Plan Upgrade (Pro → Team)
**Objective**: Test upgrading from Pro to Team Plan

**Steps**:
1. Create Pro Plan user
2. Generate data at Pro Plan limits
3. Upgrade to Team Plan via admin API
4. Verify unlimited features enabled
5. Generate large volume after upgrade
6. Verify unlimited features work

**Expected Results**:
- ✅ Upgrade successful
- ✅ Unlimited features enabled (null limits)
- ✅ Can generate unlimited data
- ✅ Performance remains good

---

### Test 6: Performance Test
**Objective**: Test system performance with large data volumes

**Steps**:
1. Create Team Plan user
2. Generate large volume:
   - 10,000 devices
   - 100,000 sessions
   - 100,000 API traces
   - 500,000 logs
   - 10,000 crashes
3. Measure:
   - Data generation time
   - Usage stats query time
   - API endpoint response time

**Expected Results**:
- ✅ Data generation completes in reasonable time
- ✅ Usage stats query < 1 second
- ✅ API endpoints respond < 500ms

---

### Test 7: Multiple Meters Test
**Objective**: Test all quota meters independently

**Steps**:
1. Create Free Plan user
2. Generate data for each meter:
   - Devices: 50 (half of limit)
   - Sessions: 500 (half of limit)
   - API Traces: 500 (half of limit)
   - Logs: 5,000 (half of limit)
   - Crashes: 50 (half of limit)
3. Verify each meter tracked independently
4. Exceed one meter and verify throttling

**Expected Results**:
- ✅ All meters tracked correctly
- ✅ Each meter throttles independently
- ✅ Exceeding one meter doesn't affect others

---

## 📈 Data Generation

### Free Plan (1x scale)
```bash
pnpm test:generate-data free 1
```
- Devices: 100
- Sessions: 1,000
- API Traces: 1,000
- Logs: 10,000
- Crashes: 100

### Pro Plan (10x scale)
```bash
pnpm test:generate-data pro 10
```
- Devices: 10,000
- Sessions: 1,000,000
- API Traces: 1,000,000
- Logs: 5,000,000
- Crashes: 100,000

### Team Plan (100x scale)
```bash
pnpm test:generate-data team 100
```
- Devices: 1,000,000
- Sessions: 50,000,000
- API Traces: 50,000,000
- Logs: 200,000,000
- Crashes: 5,000,000

---

## 🔍 Understanding Test Output

### Successful Test
```
🧪 Step 1: Generate data up to Free Plan limits
────────────────────────────────────────────────────────────
✅ Free Plan Usage: {"devices":100,"sessions":1000,...}
✅ Free Plan Limits: {"devices":100,"sessions":1000,...}
```

### Throttling Detected
```
🧪 Step 2: Attempt to exceed Free Plan limits
────────────────────────────────────────────────────────────
✅ Device creation throttled (expected)
✅ Devices throttled: true
```

### Plan Upgrade
```
🧪 Step 2: Upgrade to Pro Plan
────────────────────────────────────────────────────────────
✅ Upgrade successful: test_pro_throttle
✅ After Upgrade - Plan: test_pro_throttle, Devices Limit: 1000
```

---

## 📊 Performance Benchmarks

### Expected Performance

| Operation | Free Plan | Pro Plan | Team Plan |
|-----------|-----------|----------|-----------|
| Data Generation (100K items) | < 30s | < 30s | < 30s |
| Usage Stats Query | < 500ms | < 1s | < 2s |
| API Endpoint Response | < 200ms | < 200ms | < 200ms |

### Scale Factors

| Scale | Devices | Sessions | API Traces | Logs |
|-------|---------|----------|------------|------|
| 1x | 100 | 1K | 1K | 10K |
| 10x | 1K | 100K | 100K | 500K |
| 100x | 10K | 10M | 10M | 50M |

---

## 🐛 Troubleshooting

### Issue: Tests taking too long
**Solution**: Reduce scale factor or use smaller data volumes

### Issue: Database connection errors
**Solution**: Check database is running and connection string is correct

### Issue: Throttling not detected
**Solution**: Verify limits are set correctly and usage is calculated properly

### Issue: Plan upgrade not working
**Solution**: Check admin token is valid and API endpoint is accessible

---

## 📝 Test Data Cleanup

All test data is automatically cleaned up after tests complete. Test data uses:
- Email pattern: `*@test.devbridge.com`
- Plan name pattern: `test_*_throttle` or `test_*_perf`

To manually clean up:
```bash
# Connect to database and delete test data
# Or run cleanup function in test script
```

---

## ✅ Test Checklist

Before running tests:
- [ ] Next.js server is running
- [ ] Database is accessible
- [ ] Environment variables are set
- [ ] TEST_DB=true is set

After tests:
- [ ] All tests passed
- [ ] Performance benchmarks met
- [ ] Test data cleaned up
- [ ] No errors in logs

---

## 📚 Related Documentation

- [API Testing Guide](./../docs/features/API_TESTING_GUIDE.md)
- [Test Cases](./TEST_CASES.md)
- [How to Run Tests](./RUN_TESTS.md)

---

**Last Updated**: December 25, 2025

