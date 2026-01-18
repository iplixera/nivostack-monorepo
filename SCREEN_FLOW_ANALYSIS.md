# Screen Flow Implementation Analysis

**Date:** 2026-01-18
**Issue:** Screen flow appears empty in dashboard

---

## Root Cause Found

### ❌ CRITICAL BUG: API Interceptor Missing screenName

**File:** `packages/sdk-android/nivostack-core/src/main/java/com/plixera/nivostack/interceptors/NivoStackInterceptor.kt:71-84`

```kotlin
// Create trace
val trace = buildMap<String, Any> {
    put("url", requestUrl)
    put("method", requestMethod)
    put("statusCode", responseCode)
    put("statusMessage", responseMessage)
    put("duration", requestDuration)
    requestHeaders.let { put("requestHeaders", it) }
    responseHeaders.let { put("responseHeaders", it) }
    requestBody?.let { put("requestBody", it) }
    responseBody?.let { put("responseBody", it) }
    // ❌ MISSING: screenName not included!
}
```

**The Problem:**
1. ✅ SDK tracks screens via `trackScreen()` and stores in `Session.screenFlow`
2. ✅ Backend correctly appends screens to session
3. ❌ **BUT**: API traces don't include `screenName` field
4. ❌ Flow visualization API queries `ApiTrace.screenName` which is always NULL
5. ❌ **RESULT**: Empty screen flow in dashboard

---

## Solution

### Fix 1: Add screenName to API Interceptor ✅

**File:** `packages/sdk-android/nivostack-core/src/main/java/com/plixera/nivostack/interceptors/NivoStackInterceptor.kt`

Add `screenName` to trace map:

```kotlin
val trace = buildMap<String, Any> {
    put("url", requestUrl)
    put("method", requestMethod)
    put("statusCode", responseCode)
    put("statusMessage", responseMessage)
    put("duration", requestDuration)
    requestHeaders.let { put("requestHeaders", it) }
    responseHeaders.let { put("responseHeaders", it) }
    requestBody?.let { put("requestBody", it) }
    responseBody?.let { put("responseBody", it) }

    // ✅ ADD: Include current screen name
    instance.currentScreen?.let { put("screenName", it) }
}
```

**Impact:**
- API traces will include screen name
- Flow visualization will show screens with API activity
- Screen transitions will be visible

---

## Architecture Summary

### Complete Data Flow

1. **Screen Navigation**
   - User navigates to MainActivity
   - `NivoStackLifecycleObserver.onActivityCreated()` calls `trackScreen("MainActivity")`

2. **SDK Tracking**
   - `NivoStack.trackScreen()` adds to local `screenFlow` array
   - Sends `PATCH /api/sessions` with `screenName: "MainActivity"`
   - Stores `currentScreen = "MainActivity"`

3. **Backend Session Update**
   - Receives `screenName` from SDK
   - Appends to `Session.screenFlow` array
   - Updates `Session.screenCount`

4. **API Request (with fix)**
   - User makes API call from MainActivity
   - `NivoStackInterceptor.intercept()` captures request
   - ✅ **NEW**: Includes `currentScreen` in trace
   - Sends `POST /api/traces` with `screenName: "MainActivity"`

5. **Flow Visualization**
   - Dashboard calls `GET /api/flow`
   - Flow API queries `ApiTrace.screenName`
   - Builds screen nodes and edges
   - Displays flow with metrics

---

## Testing Checklist

After fix is deployed:

1. **Rebuild Flooss App**
   - SDK changes require app rebuild
   - New interceptor includes screen name

2. **Fresh Session**
   - Delete existing devices/sessions
   - Launch app fresh

3. **Navigate Screens**
   - Open MainActivity
   - Navigate to DeveloperSettingsActivity
   - Make some API calls

4. **Verify Dashboard**
   - Go to Dashboard → Screen Flow tab
   - Should see: MainActivity → DeveloperSettingsActivity
   - Should show API request metrics per screen

---

## Related Files

**SDK:**
- `NivoStackInterceptor.kt` - API interceptor (NEEDS FIX)
- `NivoStack.kt:617-632` - trackScreen() method
- `NivoStackLifecycleObserver.kt:23-28` - Automatic tracking

**Backend:**
- `api/sessions/route.ts:354-456` - Session update (PATCH)
- `api/traces/route.ts:327-458` - Trace creation (POST)
- `api/flow/route.ts:56-340` - Flow visualization (GET)

**Database:**
- `Session.screenFlow` - Array of screens visited
- `ApiTrace.screenName` - Screen where request was made

---

## Status

- ❌ Bug found: Interceptor missing screenName
- 🔄 Fix in progress
- ⏳ Awaiting deployment and testing
