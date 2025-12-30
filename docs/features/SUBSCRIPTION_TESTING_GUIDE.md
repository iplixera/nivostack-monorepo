# Multi-Tenant Subscription - Testing Guide

**Date**: December 23, 2025  
**Feature Branch**: `feature/multi-tenant-subscription`

---

## 🧪 Testing Overview

This guide provides step-by-step instructions for testing the multi-tenant subscription feature.

---

## 📋 Pre-Testing Setup

### 1. Environment Variables
Ensure the following are set in Vercel:
- ✅ `CRON_SECRET` - Secret token for cron authentication
- ✅ `POSTGRES_PRISMA_URL` - Database connection
- ✅ `POSTGRES_URL_NON_POOLING` - Direct database connection
- ✅ `JWT_SECRET` - JWT signing secret

### 2. Database Migration
The database migration will run automatically on deployment. Verify:
- ✅ `Plan` table exists with Free/Pro/Team plans
- ✅ `Subscription` table exists
- ✅ `Invoice` table exists
- ✅ `User` table has `subscription` relation

### 3. Seed Database (Optional)
```bash
pnpm db:seed
```
This will create:
- Free Plan (active)
- Pro Plan (inactive, placeholder)
- Team Plan (inactive, placeholder)
- Test user with subscription

---

## 🧪 Test Scenarios

### Test 1: User Registration & Subscription Creation

**Steps**:
1. Navigate to `/register`
2. Create a new user account
3. Complete registration

**Expected Results**:
- ✅ User is created successfully
- ✅ Subscription is automatically created
- ✅ Subscription has Free Plan
- ✅ Trial start date is registration date
- ✅ Trial end date is 30 days from registration
- ✅ Subscription status is 'active'

**Verification**:
```bash
# Check subscription was created
curl -H "Authorization: Bearer <token>" \
  https://your-app.vercel.app/api/subscription
```

---

### Test 2: Subscription Status Display

**Steps**:
1. Login with test user
2. Navigate to `/subscription`
3. View subscription details

**Expected Results**:
- ✅ Current plan displays: "Free Plan"
- ✅ Status shows: "Active"
- ✅ Trial start date displayed
- ✅ Trial end date displayed
- ✅ Days remaining calculated correctly
- ✅ Usage statistics displayed (all should be 0 or low)

**Verification**:
- Check days remaining matches: `(trialEndDate - today)`
- Verify usage stats show correct counts

---

### Test 3: Data Creation During Active Trial

**Steps**:
1. Ensure trial is active (just registered)
2. Send data via SDK endpoints:
   - `POST /api/logs`
   - `POST /api/traces`
   - `POST /api/sessions`
   - `POST /api/crashes`

**Expected Results**:
- ✅ All endpoints accept data (200/201 status)
- ✅ Data is created in database
- ✅ No subscription-related errors

**Verification**:
```bash
# Test log creation
curl -X POST https://your-app.vercel.app/api/logs \
  -H "X-API-Key: <api-key>" \
  -H "Content-Type: application/json" \
  -d '{"message": "Test log", "level": "info"}'

# Should return 200 OK with log ID
```

---

### Test 4: Data Creation After Trial Expires

**Steps**:
1. Manually expire a test subscription (update `trialEndDate` in database)
2. Try to send data via SDK endpoints

**Expected Results**:
- ✅ All endpoints return 403 Forbidden
- ✅ Error message: "Trial expired. Please upgrade to continue using DevBridge."
- ✅ No data is created

**Verification**:
```bash
# Test log creation with expired trial
curl -X POST https://your-app.vercel.app/api/logs \
  -H "X-API-Key: <api-key>" \
  -H "Content-Type: application/json" \
  -d '{"message": "Test log", "level": "info"}'

# Should return 403 Forbidden
```

---

### Test 5: SDK Initialization During Active Trial

**Steps**:
1. Ensure trial is active
2. Call `GET /api/sdk-init` with API key

**Expected Results**:
- ✅ Returns 200 OK
- ✅ Feature flags returned
- ✅ SDK settings returned
- ✅ `trackingEnabled` is `true`

**Verification**:
```bash
curl https://your-app.vercel.app/api/sdk-init \
  -H "X-API-Key: <api-key>"

# Should return full SDK config
```

---

### Test 6: SDK Initialization After Trial Expires

**Steps**:
1. Manually expire test subscription
2. Call `GET /api/sdk-init` with API key

**Expected Results**:
- ✅ Returns 403 Forbidden
- ✅ Error message: "Trial expired"
- ✅ `sdkEnabled: false` in response

**Verification**:
```bash
curl https://your-app.vercel.app/api/sdk-init \
  -H "X-API-Key: <api-key>"

# Should return 403 with error message
```

---

### Test 7: Trial Expiration Cron Job

**Steps**:
1. Create test subscriptions with expired trials
2. Manually trigger cron endpoint (or wait for scheduled run)

**Expected Results**:
- ✅ Expired subscriptions found
- ✅ Data deleted: API Traces, Logs, Sessions, Crashes
- ✅ Feature flags disabled for all projects
- ✅ Subscription status updated to 'expired'
- ✅ Response shows deletion counts

**Manual Trigger**:
```bash
curl -X POST https://your-app.vercel.app/api/cron/expire-trials \
  -H "Authorization: Bearer <CRON_SECRET>"

# Should return success with deletion counts
```

**Verification**:
- Check database: expired subscriptions have `status = 'expired'`
- Check feature flags: `sdkEnabled = false` for expired users
- Check data tables: old data deleted

---

### Test 8: Landing Page Pricing Section

**Steps**:
1. Navigate to `/` (landing page)
2. Scroll to pricing section

**Expected Results**:
- ✅ Pricing section displays
- ✅ Free Plan card shows prominently
- ✅ "30-day free trial" messaging visible
- ✅ Trial expiration warning displayed
- ✅ Pro/Team plans show "Coming Soon"
- ✅ CTA button says "Start 30-Day Free Trial"

**Verification**:
- Check browser console for errors
- Verify plans are fetched from `/api/plans`

---

### Test 9: Dashboard Navigation

**Steps**:
1. Login to dashboard
2. Check navigation bar

**Expected Results**:
- ✅ "Subscription" link visible
- ✅ "Billing" link visible
- ✅ "Invoices" link visible
- ✅ All links navigate correctly

**Verification**:
- Click each link and verify page loads
- Check URLs are correct

---

### Test 10: Subscription Banner

**Steps**:
1. Login with user whose trial expires in < 7 days
2. View dashboard

**Expected Results**:
- ✅ Yellow warning banner appears
- ✅ Shows days remaining
- ✅ "Upgrade Now" button links to `/subscription`

**Steps** (Expired Trial):
1. Login with user whose trial has expired
2. View dashboard

**Expected Results**:
- ✅ Red warning banner appears
- ✅ Shows "Trial Expired" message
- ✅ "View Subscription" button links to `/subscription`

---

### Test 11: Feature Flags Restrictions

**Steps**:
1. Login with expired trial user
2. Navigate to project → Settings → Features
3. Try to toggle feature flags

**Expected Results**:
- ✅ Warning banner appears at top
- ✅ All feature toggles are disabled
- ✅ Visual indicators show "Trial Expired"
- ✅ Toggles show disabled state (grayed out)
- ✅ Link to subscription page available

**Verification**:
- Try clicking toggles - they should not respond
- Check browser console for errors

---

### Test 12: Usage Statistics

**Steps**:
1. Login with active trial user
2. Create some test data (logs, traces, etc.)
3. Navigate to `/subscription`
4. View usage statistics

**Expected Results**:
- ✅ Usage statistics display correctly
- ✅ Progress bars show usage vs limits
- ✅ For Free Plan: limits show "Unlimited"
- ✅ Trial countdown shows correct days remaining

**Verification**:
- Check counts match actual data
- Verify progress bars render correctly

---

## 🐛 Common Issues & Solutions

### Issue: Subscription not created on registration
**Solution**: Check registration endpoint logs. Verify `createSubscription()` is called.

### Issue: Cron job not running
**Solution**: 
- Verify `CRON_SECRET` is set in Vercel
- Check Vercel cron logs
- Verify cron schedule in `vercel.json`

### Issue: Data not being deleted
**Solution**:
- Check cron job logs
- Verify subscription `trialEndDate` is in the past
- Check database permissions

### Issue: Feature flags not disabling
**Solution**:
- Verify cron job ran successfully
- Check `featureFlags` table for updates
- Verify subscription status is 'expired'

---

## 📊 Performance Testing

### Load Testing
- [ ] Test subscription endpoint with 100 concurrent requests
- [ ] Test data creation endpoints with subscription checks
- [ ] Verify response times < 100ms

### Database Performance
- [ ] Test subscription lookup performance
- [ ] Test usage statistics calculation
- [ ] Test cron job with 1000+ expired subscriptions

---

## ✅ Sign-Off Checklist

- [ ] All test scenarios pass
- [ ] No console errors in browser
- [ ] No server errors in logs
- [ ] Database queries perform well
- [ ] Cron job executes successfully
- [ ] UI displays correctly on mobile/desktop
- [ ] All links work correctly
- [ ] Error messages are clear and helpful

---

## 🚀 Ready for Production

Once all tests pass:
1. ✅ Create PR to `develop`
2. ✅ Deploy to staging
3. ✅ Run full test suite on staging
4. ✅ Create PR to `main`
5. ✅ Deploy to production
6. ✅ Monitor cron job execution
7. ✅ Monitor error logs

---

**Last Updated**: December 23, 2025

