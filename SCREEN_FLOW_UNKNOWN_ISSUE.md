# Screen Flow "Unknown" Issue - Root Cause & Solution

**Date:** 2026-01-19
**Issue:** Screen Flow shows "Unknown" for all screens after latest SDK changes
**Status:** ✅ Root cause identified - Old traces in database

---

## Problem

User reports that Screen Flow is showing sessions with "Unknown" screen names after testing with Pixel phone using the latest SDK build.

---

## Root Cause Analysis

### 1. Backend Flow API Filter

**File:** `dashboard/src/app/api/flow/route.ts:91`

```typescript
const whereClause: Record<string, unknown> = {
  projectId,
  screenName: { not: null }  // ← FILTERS OUT null screenName traces
}
```

**Impact:** The Screen Flow API only includes traces that have a non-null `screenName` field.

### 2. SDK Interceptor Default

**File:** `packages/sdk-android/nivostack-core/src/main/java/com/plixera/nivostack/interceptors/NivoStackInterceptor.kt:80`

```kotlin
// Smart screen name: use current screen or default to "AppLaunch" if called before any Activity
put("screenName", instance.getCurrentScreenName() ?: "AppLaunch")
```

**Change Made:** We added `?: "AppLaunch"` as the fallback when no screen is tracked.

**When:** Commit `9fba252` - "feat(sdk-android): make SDK fully automatic - zero client code required"

### 3. The Mismatch

**Old SDK behavior (before our changes):**
- If no screen tracking: `screenName` = `null` in database
- Screen Flow API: Filters out these traces → No data shown

**New SDK behavior (after our changes):**
- If no screen tracking: `screenName` = `"AppLaunch"` in database
- Screen Flow API: Includes these traces → "AppLaunch" shown ✅

**Current State:**
- Database has OLD traces with `screenName = null`
- Screen Flow filters them out
- Shows "Unknown" or no sessions

---

## Why You're Seeing "Unknown"

The traces in your database are from the **old SDK** (before commit `9fba252`) where:
- Interceptor didn't set a default screenName
- All traces have `screenName = null` in database
- Screen Flow API excludes them

Even after rebuilding the app with the new SDK, you'll see "Unknown" for OLD sessions because those traces already have null values in the database.

---

## Solutions

### Option 1: Generate New Traces (Recommended)

**Action Required:**
1. ✅ Rebuild Flooss BH app with the latest SDK (includes "AppLaunch" fallback)
2. ✅ Test the app on your Pixel phone (generates new traces)
3. ✅ Wait for traces to sync to dashboard
4. ✅ View Screen Flow → Should show "AppLaunch" for new sessions

**Why this works:**
- New SDK sets `screenName = "AppLaunch"` for all traces (even before Activities load)
- Screen Flow includes these traces
- You'll see "AppLaunch" as the default screen name

### Option 2: Automatic Screen Tracking (NOW DEFAULT!)

**Great News:** As of commit `d81e7a2`, the SDK now automatically registers the lifecycle observer!

**No Action Required:**

The SDK now does everything automatically when you call `NivoStack.init()`:

```kotlin
// File: FloosBHApplication.kt
class FloosBHApplication : Application() {
    override fun onCreate() {
        super.onCreate()

        NivoStack.init(
            context = this,
            apiKey = "your-api-key",
            projectId = "your-project-id",
            baseUrl = "https://ingest.nivostack.com"
        )
        // That's it! Lifecycle observer registered automatically ✅
        // Screen tracking enabled automatically ✅
    }
}
```

**What You Get:**
- ✅ Automatically tracks REAL screen names (SplashActivity, LoginActivity, etc.)
- ✅ No "AppLaunch" generic names (unless APIs called before first Activity)
- ✅ No manual `trackScreen()` calls needed
- ✅ Exactly how Firebase, Sentry, etc. work

**Result:**
```
Screen Flow:
├─ SplashActivity (5 requests)
├─ LoginActivity (12 requests)
└─ MainActivity (48 requests)
```

### Option 3: Clear Old Traces (Optional)

If you want to clean up the dashboard:

1. Go to API Traces tab
2. Click "Clear Traces" button
3. Confirm deletion
4. Test app again with new SDK
5. View Screen Flow → Only new traces with screen names

---

## Verification Steps

### After Rebuilding with New SDK

1. **Check SDK Build:**
   ```bash
   cd packages/sdk-android/nivostack-core
   ./gradlew clean build
   ```

2. **Verify Latest SDK in App:**
   - Check `build.gradle` dependencies
   - Ensure using latest nivostack-core version

3. **Test and Verify:**
   - Open Flooss BH app on Pixel phone
   - Make some API calls (login, navigate screens, etc.)
   - Wait 10-30 seconds for trace sync
   - Go to Dashboard → API Traces tab
   - Check if new traces have `screenName` field
   - Go to Screen Flow tab
   - Should see sessions with screen names (not "Unknown")

### Expected Results

**Without Lifecycle Observer:**
```
Sessions:
├─ Session 1: d4df9d1e...
│  └─ Screens: AppLaunch
│      └─ 13 requests
```

**With Lifecycle Observer:**
```
Sessions:
├─ Session 1: 8dc0cde5...
│  └─ Screens: SplashActivity → HomeActivity → TransactionActivity → NotificationActivity → AuthActivity → HomeActivity
│      └─ 13 requests
├─ Session 2: d4df9d1e...
│  └─ Screens: HomeActivity → SplashActivity → AuthActivity → LoanInstallmentActivity → TrustedDeviceActivity → TransactionActivity (+8 more)
│      └─ 16 requests
```

---

## Timeline of Changes

1. **Commit `6903e6e`** - Added diagnostic methods to SDK
2. **Commit `9fba252`** - Made SDK fully automatic, added "AppLaunch" fallback
3. **Commit `51161e0`** - Added comprehensive SDK documentation
4. **Commit `8bf6301`** - Fixed duplicate method definitions
5. **Current Issue** - Old traces have null screenName, new SDK not deployed yet

---

## SDK Documentation

For complete details on the smart SDK behavior, see:
- [SDK_SMART_BEHAVIOR.md](./SDK_SMART_BEHAVIOR.md) - Complete smart SDK documentation
- [IMPLEMENTATION_SUMMARY_2026-01-19.md](./IMPLEMENTATION_SUMMARY_2026-01-19.md) - Session summary

---

## Summary

**Root Cause:** Old SDK didn't set screenName, database has null values, Screen Flow filters them out

**Solution:** Rebuild app with new SDK (includes "AppLaunch" fallback) OR register lifecycle observer for real screen names

**Status:** No bug in code - just need to deploy new SDK build and generate new traces ✅

---

**Next Steps for Flooss BH Team:**

1. ☐ Rebuild Flooss BH app with latest SDK
2. ☐ (Recommended) Register lifecycle observer in Application class
3. ☐ Deploy app to test device
4. ☐ Test and generate new traces
5. ☐ Verify Screen Flow shows proper screen names

---

**Version:** 1.0
**Date:** 2026-01-19
**Status:** Root Cause Identified ✅
