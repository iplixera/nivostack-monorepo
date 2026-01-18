# Screen Flow "Unknown" Sessions - Root Cause & Fix

**Date:** 2026-01-19 03:35 AM
**Issue:** Screen Flow shows "Unknown" for all sessions or no data at all
**Root Cause:** Traces have `screenName = null` and API filters them out

---

## The Problem

### Issue 1: API Filter Excludes Null Screen Names

**File:** `dashboard/src/app/api/flow/route.ts` Line 90

```typescript
const whereClause: Record<string, unknown> = {
  projectId,
  screenName: { not: null }  // ← This filters out traces with null screenName
}
```

**Impact:** If all traces have `screenName = null`, the Screen Flow API returns **0 traces**.

### Issue 2: Fallback Logic Never Executes

**File:** `dashboard/src/app/api/flow/route.ts` Line 164

```typescript
const screenName = trace.screenName || 'Unknown'  // ← This fallback never runs
```

**Why:** Because traces with null screenName are already filtered out by line 90, this fallback logic never gets a chance to execute!

---

## Why Your Traces Have Null Screen Names

### Scenario 1: Old SDK (Before Our Changes)

**Before commit `9fba252`:**
- Interceptor didn't set a default screenName
- If no Activity was tracked, screenName stayed null
- All traces stored with `screenName = null` in database

**After commit `9fba252`:**
- Interceptor sets `screenName = "AppLaunch"` as default
- Even if no Activity tracked, screenName is set
- New traces will have screenName

### Scenario 2: SDK Not Updated in App

Even after rebuilding the SDK, if you haven't:
1. Rebuilt the Flooss BH app with the new SDK
2. Installed the new app on your Pixel phone
3. Generated new traces by using the app

Then all existing traces still have `screenName = null`.

---

## The Fix

### Option 1: Quick Fix - Remove Filter (Recommended)

**File:** `dashboard/src/app/api/flow/route.ts`

**Change line 90 from:**
```typescript
const whereClause: Record<string, unknown> = {
  projectId,
  screenName: { not: null }
}
```

**To:**
```typescript
const whereClause: Record<string, unknown> = {
  projectId
  // Remove the screenName filter - let fallback handle it
}
```

**Why this works:**
- Fetches ALL traces (including those with null screenName)
- Line 164's fallback `trace.screenName || 'Unknown'` will work correctly
- Screen Flow will show "Unknown" for traces without screenName
- Better than showing NO data at all

### Option 2: Better Default - Change Filter

**Change line 90 to:**
```typescript
const whereClause: Record<string, unknown> = {
  projectId
  // Don't filter by screenName - we'll handle nulls with fallback
}
```

**And update line 164 to:**
```typescript
const screenName = trace.screenName || 'AppLaunch'  // More descriptive than "Unknown"
```

**Why this is better:**
- Shows "AppLaunch" instead of "Unknown" (matches SDK behavior)
- Consistent with SDK default screen name
- More meaningful to developers

---

## Implementation Steps

### Step 1: Update Screen Flow API

```bash
cd /Users/karim-f/Code/nivostack-monorepo-checkout
```

Edit `dashboard/src/app/api/flow/route.ts`:

**Line 88-91, change from:**
```typescript
const whereClause: Record<string, unknown> = {
  projectId,
  screenName: { not: null }
}
```

**To:**
```typescript
const whereClause: Record<string, unknown> = {
  projectId
  // Fetch all traces - we'll handle null screenName with fallback
}
```

**Line 164, change from:**
```typescript
const screenName = trace.screenName || 'Unknown'
```

**To:**
```typescript
const screenName = trace.screenName || 'AppLaunch'
```

### Step 2: Commit and Deploy

```bash
git add dashboard/src/app/api/flow/route.ts
git commit -m "fix(screen-flow): show traces with null screenName as AppLaunch

- Remove screenName NOT NULL filter from query
- Change fallback from 'Unknown' to 'AppLaunch' to match SDK default
- Allows Screen Flow to show data even for old traces without screenName"

git push origin main
```

### Step 3: Verify in Dashboard

After Vercel deploys:
1. Hard refresh browser (Cmd+Shift+R)
2. Navigate to Screen Flow tab
3. Should now see sessions with "AppLaunch" screen

---

## Long-Term Solution: Regenerate Traces

After deploying the fix above, you'll see data. But for better data:

### Step 1: Rebuild SDK (Already Done)

✅ SDK already built with automatic screen tracking

### Step 2: Rebuild Flooss BH App

```bash
# In Flooss BH project directory
./gradlew clean build
./gradlew installDebug
```

### Step 3: Test with Your Pixel Phone

1. Open app
2. Navigate through screens (Splash → Login → Main → etc.)
3. Make API calls
4. Wait 30 seconds for traces to sync

### Step 4: Check Dashboard

New traces will have actual Activity names:
- SplashActivity
- LoginActivity
- MainActivity
- TransactionActivity
- etc.

Instead of just "AppLaunch"

---

## Diagnostic Commands

### Check Current Trace Status

```bash
cd /Users/karim-f/Code/nivostack-monorepo-checkout

# Set your database credentials
export SUPABASE_URL="your-postgres-url"
export SUPABASE_SERVICE_ROLE_KEY="your-key"

# Run diagnostic
npx tsx scripts/diagnostics/check-screen-flow-traces.ts <your-project-id>
```

**This will show:**
- Total traces in project
- How many have screenName vs null
- Distribution of screen names
- Recent 20 traces with screenName status
- What Screen Flow API currently sees

### Example Output

```
Total traces in project: 1065

Traces WITH screenName: 0
Traces WITHOUT screenName (null): 1065

❌ PROBLEM: Screen Flow API filters for screenName NOT NULL
   All traces have NULL screenName, so Screen Flow sees 0 traces!

✅ SOLUTION:
   1. Rebuild app with latest SDK (has "AppLaunch" default)
   2. Generate new traces by using the app
   3. New traces will have screenName set
   4. Screen Flow will show data
```

---

## Why This Issue Happened

1. **Initial SDK Implementation:**
   - Didn't set default screenName
   - Relied on manual `trackScreen()` calls
   - If not called, screenName stayed null

2. **Screen Flow Implementation:**
   - Added `screenName: { not: null }` filter
   - Intended to hide incomplete data
   - But now prevents ALL data from showing

3. **Recent SDK Changes:**
   - Added "AppLaunch" default (commit `9fba252`)
   - Added automatic lifecycle observer (commit `d81e7a2`)
   - But old traces still have null values

4. **Current State:**
   - Database has 1000+ traces with null screenName
   - Screen Flow filters them out
   - Shows empty or "Unknown" sessions

---

## After the Fix

### Immediate (After Deploying API Fix)

**Screen Flow will show:**
```
Sessions:
├─ Session 1: d4df9d1e...
│  └─ Screens: AppLaunch
│      └─ 13 requests
├─ Session 2: 8dc0cde5...
│  └─ Screens: AppLaunch
│      └─ 16 requests
```

**Why "AppLaunch"?**
- Old traces have null screenName
- API fallback changes null to "AppLaunch"
- At least you see data now!

### Future (After Rebuilding App with New SDK)

**Screen Flow will show:**
```
Sessions:
├─ Session 1: 8dc0cde5...
│  └─ Screens: SplashActivity → HomeActivity → TransactionActivity → NotificationActivity
│      └─ 13 requests
├─ Session 2: d4df9d1e...
│  └─ Screens: HomeActivity → SplashActivity → AuthActivity → LoanInstallmentActivity
│      └─ 16 requests
```

**Why better?**
- New SDK automatically tracks Activity names
- Lifecycle observer registers on init
- Real screen names captured
- Meaningful flow visualization

---

## Testing Checklist

### After API Fix Deployed

- [ ] Hard refresh dashboard (Cmd+Shift+R)
- [ ] Navigate to Screen Flow tab
- [ ] Should see sessions (not empty)
- [ ] Sessions should show "AppLaunch" screen
- [ ] Can click on sessions to see traces
- [ ] Trace details show correctly

### After App Rebuild

- [ ] Install new app on Pixel phone
- [ ] Open app and navigate screens
- [ ] Make API calls (login, transactions, etc.)
- [ ] Wait 30 seconds for sync
- [ ] Check Screen Flow
- [ ] Should see actual Activity names
- [ ] Sessions show screen transitions

---

## Summary

**Root Cause:** Screen Flow API filters `screenName: { not: null }`, but all traces have null screenName

**Immediate Fix:** Remove the filter, let fallback handle nulls

**Long-Term Fix:** Rebuild app with new SDK to generate traces with actual screen names

**Files to Change:**
- `dashboard/src/app/api/flow/route.ts` (Line 90 and 164)

**Impact:**
- Screen Flow will start showing data immediately
- Will show "AppLaunch" for old traces
- New traces will show actual Activity names

---

**Status:** Root cause identified, fix ready to deploy
**Effort:** 5 minutes to change code, 3 minutes to deploy
**Priority:** HIGH - This blocks Screen Flow feature entirely
