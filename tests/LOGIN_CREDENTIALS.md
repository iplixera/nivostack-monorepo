# 🔐 Test User Login Credentials

**Generated**: December 25, 2025  
**Status**: ✅ All users created with test data  
**Password for ALL users**: `Test123!@#`

---

## 🌐 Login URL

**http://localhost:3000/login**

---

## 📋 Quick Reference

| Plan | Users | Consumption Levels |
|------|-------|-------------------|
| **Free** | 5 users | New, 10%, 50%, 80%, 100% |
| **Pro** | 5 users | New, 10%, 50%, 80%, 100% |
| **Team** | 5 users | New, 10%, 50%, 80%, 100% |
| **Enterprise** | 2 users | New, High Usage |

**Total**: 17 test users

---

## 👥 All Test Users

### FREE PLAN USERS

| Email | Consumption | Usage Details |
|-------|-------------|---------------|
| `free-new@demo.devbridge.com` | **0% (New)** | No data generated - fresh subscription |
| `free-10@demo.devbridge.com` | **10%** | 10 devices, 100 sessions, 100 API traces, 1K logs, 10 crashes |
| `free-50@demo.devbridge.com` | **50%** | 50 devices, 500 sessions, 500 API traces, 5K logs, 50 crashes |
| `free-80@demo.devbridge.com` | **80%** | 80 devices, 800 sessions, 800 API traces, 8K logs, 80 crashes |
| `free-100@demo.devbridge.com` | **100% (At Limit)** | 100 devices, 1K sessions, 1K API traces, 10K logs, 100 crashes |

**Free Plan Limits**:
- Devices: 100
- Sessions: 1,000
- API Traces: 1,000
- API Endpoints: 20
- API Requests: 1,000
- Logs: 10,000
- Crashes: 100

---

### PRO PLAN USERS

| Email | Consumption | Usage Details |
|-------|-------------|---------------|
| `pro-new@demo.devbridge.com` | **0% (New)** | No data generated - fresh subscription |
| `pro-10@demo.devbridge.com` | **10%** | 100 devices, 10K sessions, 10K API traces, 50K logs, 1K crashes |
| `pro-50@demo.devbridge.com` | **50%** | 500 devices, 50K sessions, 50K API traces, 250K logs, 5K crashes |
| `pro-80@demo.devbridge.com` | **80%** | 800 devices, 80K sessions, 80K API traces, 400K logs, 8K crashes |
| `pro-100@demo.devbridge.com` | **100% (At Limit)** | 1K devices, 100K sessions, 100K API traces, 500K logs, 10K crashes |

**Pro Plan Limits**:
- Devices: 1,000
- Sessions: 100,000
- API Traces: 100,000
- API Endpoints: 200
- API Requests: 100,000
- Logs: 500,000
- Crashes: 10,000

---

### TEAM PLAN USERS

| Email | Consumption | Usage Details |
|-------|-------------|---------------|
| `team-new@demo.devbridge.com` | **0% (New)** | No data generated - fresh subscription |
| `team-10@demo.devbridge.com` | **10%** | Unlimited devices, 50K sessions, 50K API traces, Unlimited logs |
| `team-50@demo.devbridge.com` | **50%** | Unlimited devices, 250K sessions, 250K API traces, Unlimited logs |
| `team-80@demo.devbridge.com` | **80%** | Unlimited devices, 400K sessions, 400K API traces, Unlimited logs |
| `team-100@demo.devbridge.com` | **100% (At Limit)** | Unlimited devices, 500K sessions, 500K API traces, Unlimited logs |

**Team Plan Limits**:
- Devices: **Unlimited** ✨
- Sessions: 500,000
- API Traces: 500,000
- API Endpoints: **Unlimited** ✨
- API Requests: 500,000
- Logs: **Unlimited** ✨
- Crashes: **Unlimited** ✨

---

### ENTERPRISE PLAN USERS

| Email | Consumption | Usage Details |
|-------|-------------|---------------|
| `enterprise-new@demo.devbridge.com` | **0% (New)** | No data generated - fresh subscription |
| `enterprise-high@demo.devbridge.com` | **High Usage** | Large volume with unlimited features |

**Enterprise Plan Limits**:
- **All features: Unlimited** ✨

---

## 🔑 Login Instructions

1. **Navigate to**: http://localhost:3000/login
2. **Enter Email**: Use any email from the list above
3. **Enter Password**: `Test123!@#`
4. **Click Login**

---

## 📊 What to Check

### For Each User, Verify:

1. **Subscription Page** (`/subscription`)
   - Current plan displayed correctly
   - Usage bars showing correct percentages
   - Limits displayed correctly
   - Upgrade options available (if not at 100%)

2. **Dashboard** (`/projects/[id]`)
   - Device count matches usage
   - Session count matches usage
   - API trace count matches usage
   - Log count matches usage
   - Crash count matches usage

3. **Usage Details** (`/subscription?tab=usage`)
   - All meters showing correct usage
   - Progress bars accurate
   - Limits displayed correctly

4. **Throttling Behavior** (for 100% users)
   - Should show throttling warnings
   - Upgrade prompts visible
   - Limits clearly displayed

---

## 🎯 Recommended Test Flow

### 1. Test Free Plan Users
```
1. Login as free-new@demo.devbridge.com
   → Check: Empty dashboard, no usage

2. Login as free-10@demo.devbridge.com
   → Check: 10% usage bars, data visible

3. Login as free-50@demo.devbridge.com
   → Check: 50% usage bars, moderate data

4. Login as free-80@demo.devbridge.com
   → Check: 80% usage bars, high usage warning

5. Login as free-100@demo.devbridge.com
   → Check: 100% usage, throttling warnings, upgrade prompts
```

### 2. Test Pro Plan Users
```
1. Login as pro-new@demo.devbridge.com
   → Check: Empty dashboard, Pro plan limits

2. Login as pro-10@demo.devbridge.com
   → Check: 10% usage (but higher absolute numbers than Free)

3. Login as pro-50@demo.devbridge.com
   → Check: 50% usage with large data volumes

4. Login as pro-80@demo.devbridge.com
   → Check: 80% usage, approaching limits

5. Login as pro-100@demo.devbridge.com
   → Check: 100% usage, at Pro plan limits
```

### 3. Test Team Plan Users
```
1. Login as team-new@demo.devbridge.com
   → Check: Empty dashboard, Team plan limits

2. Login as team-10@demo.devbridge.com
   → Check: Unlimited devices/logs, 10% of session limits

3. Login as team-50@demo.devbridge.com
   → Check: Large data volumes, 50% of session limits

4. Login as team-80@demo.devbridge.com
   → Check: Very large data volumes, 80% of session limits

5. Login as team-100@demo.devbridge.com
   → Check: Maximum session usage, unlimited features still work
```

### 4. Test Enterprise Plan Users
```
1. Login as enterprise-new@demo.devbridge.com
   → Check: Empty dashboard, all unlimited

2. Login as enterprise-high@demo.devbridge.com
   → Check: Large data volumes, all unlimited features
```

---

## 📈 Expected Usage Display

### Free Plan - 10% User
- Devices: 10 / 100 (10%)
- Sessions: 100 / 1,000 (10%)
- API Traces: 100 / 1,000 (10%)
- Logs: 1,000 / 10,000 (10%)
- Crashes: 10 / 100 (10%)

### Free Plan - 100% User
- Devices: 100 / 100 (100%) ⚠️
- Sessions: 1,000 / 1,000 (100%) ⚠️
- API Traces: 1,000 / 1,000 (100%) ⚠️
- Logs: 10,000 / 10,000 (100%) ⚠️
- Crashes: 100 / 100 (100%) ⚠️

### Pro Plan - 50% User
- Devices: 500 / 1,000 (50%)
- Sessions: 50,000 / 100,000 (50%)
- API Traces: 50,000 / 100,000 (50%)
- Logs: 250,000 / 500,000 (50%)
- Crashes: 5,000 / 10,000 (50%)

### Team Plan - 100% User
- Devices: Unlimited ✨
- Sessions: 500,000 / 500,000 (100%) ⚠️
- API Traces: 500,000 / 500,000 (100%) ⚠️
- Logs: Unlimited ✨
- Crashes: Unlimited ✨

---

## ✅ Test Verification Checklist

For each user, verify:

- [ ] Login works with provided credentials
- [ ] Subscription page shows correct plan
- [ ] Usage percentages match expected values
- [ ] Progress bars display correctly
- [ ] Limits are shown correctly
- [ ] Data is visible in dashboard
- [ ] Throttling warnings appear for 100% users
- [ ] Upgrade prompts appear for lower plans
- [ ] Unlimited features show correctly for Team/Enterprise

---

## 🔍 Data Preservation

**Important**: All test data is preserved and will NOT be deleted automatically.

- Test users: `*@demo.devbridge.com`
- Test plans: `test_*_demo`
- Test projects: `* Demo Project`

To clean up manually, delete users with email pattern `*@demo.devbridge.com`.

---

## 📝 Notes

- All users have the same password: `Test123!@#`
- All users have active subscriptions
- All users have at least one project
- Data generation may take a few minutes for large volumes
- Performance may vary based on database size

---

**Last Updated**: December 25, 2025  
**Test Data Status**: ✅ Preserved for manual inspection

