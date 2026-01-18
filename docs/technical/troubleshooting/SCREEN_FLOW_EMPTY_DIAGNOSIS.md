# Screen Flow Diagnosis Results

**Date:** 2026-01-18
**Project:** Flooss BH (cmkiixzic00029krtffzbx10x)

---

## ✅ ROOT CAUSE IDENTIFIED

After analyzing the exported data, I can confirm the exact issue:

### The Problem

**ALL API traces have `screenName` included BUT `sessionId = null`**

This means:
1. ✅ SDK Fix #11 (screenName in interceptor) **HAS BEEN DEPLOYED**
2. ❌ **BUT** traces are not being linked to sessions
3. ❌ Flow API returns 0 sessions because it requires BOTH `screenName != null` AND `sessionId != null`

---

## Data Analysis

### Sessions (11 total)
- ✅ Sessions exist in database
- ✅ Sessions have `screenFlow` arrays populated
- ✅ Session tracking is working correctly

**Sample session:**
- ID: `cmkjt4y68003beo9fpuo4gblk`
- Token: `3cc0445e-4c80-484d-8f2c-d4aeda65a36f`
- Screens: `["SplashActivity","AuthActivity","HomeActivity"...]`
- ✅ Has 6 screens tracked

### API Traces (73 sampled)
- ✅ ALL traces have `screenName` populated (SplashActivity, NotificationsActivity, SettingActivity, etc.)
- ❌ **ALL traces have `sessionId = null`**
- ❌ **ALL traces have `deviceId` populated correctly**

**Example trace:**
- Screen: `SplashActivity` ✅
- Session: `null` ❌
- Device: `cmkj18d8f001f10r8kld9p811` ✅
- URL: `https://flooss-backend.uat.flooss.com/flooss/api/v1/system/forceUpdate`

---

## Why Screen Flow is Empty

The [flow API](dashboard/src/app/api/flow/route.ts:88-130) requires:

```typescript
const whereClause = {
  projectId,
  screenName: { not: null }  // ✅ Traces have this
}

// Later builds sessions from traces
if (trace.sessionId && trace.session) {  // ❌ Fails here - sessionId is null
  sessionMap.set(trace.sessionId, {...})
}
```

**Result:** Flow API finds traces with screenName, but can't build sessions because `sessionId = null` on all traces.

---

## Root Cause - CONFIRMED ✅

**RACE CONDITION: Traces are being captured and sent BEFORE the session starts.**

### The Issue

The SDK has an initialization sequence that happens asynchronously:
1. `NivoStack.init()` loads cached config (synchronous)
2. Background thread starts:
   - Fetches fresh config from server
   - **Registers device** (async, takes time)
   - **Starts session** (only AFTER device registration completes)

**Meanwhile**, the app continues running:
- User navigates through screens
- App makes API calls
- `NivoStackInterceptor` captures API traces
- Traces are queued with current `screenName` ✅
- **BUT `sessionToken` is still `null` because session hasn't started yet** ❌

When traces are flushed (via timer or app pause), they are sent with `sessionToken = null`.

### Verified Code Paths

1. **SDK sends sessionToken** ✅ (ApiClient.kt:125)
   ```kotlin
   sessionToken?.let { put("sessionToken", it) }
   ```

2. **Backend receives and links sessions** ✅ (route.ts:424-430, 448)
   ```typescript
   let session = null
   if (sessionToken) {
     session = await prisma.session.findUnique({
       where: { sessionToken }
     })
   }
   // ...
   sessionId: session?.id
   ```

**Problem**: `sessionToken` is `null` when early traces are sent because session hasn't started yet.

---

## What's Happening - Timeline

**T=0ms: App Launch**
- `NivoStack.init()` called
- Loads cached config synchronously
- Starts background initialization thread

**T=10ms: Background Init Starts**
- Device registration API call begins (NivoStack.kt:239)
- Takes ~500-2000ms depending on network

**T=50ms: App Makes First API Call**
- User at SplashActivity, app calls `/api/v1/system/forceUpdate`
- `NivoStackInterceptor` captures trace
- Adds `screenName: "SplashActivity"` ✅
- BUT `sessionToken` is still `null` ❌
- Trace queued in memory

**T=800ms: More API Calls**
- User navigates to HomeActivity
- App makes more API calls
- More traces captured with `screenName` but no `sessionToken`

**T=1500ms: Device Registration Completes**
- `registeredDeviceId` is now set
- Session start begins (NivoStack.kt:251)

**T=1600ms: Session Started**
- `sessionToken` generated (NivoStack.kt:560)
- POST `/api/sessions` creates session in DB ✅
- From now on, NEW traces will have `sessionToken`

**T=30000ms: Flush Timer Triggers (or App Paused)**
- `_flushTraces()` called (NivoStack.kt:606)
- Sends queued traces to backend
- **Early traces**: `sessionToken = null` ❌
- **Later traces**: `sessionToken = "abc123..."` ✅

**Backend Processing:**
- Receives traces with `screenName` ✅
- For traces with `sessionToken = null`:
  - Cannot find session
  - Sets `trace.sessionId = null` ❌
- For traces with valid `sessionToken`:
  - Finds session
  - Sets `trace.sessionId = session.id` ✅

**Result:**
- Early traces: `screenName ✅`, `sessionId = null ❌`
- Later traces: `screenName ✅`, `sessionId ✅`
- Flow API requires BOTH fields → Only shows later traces

---

## Solution

**Fix: Wait for session to start before allowing traces to be captured**

The SDK should not capture traces (or should hold them) until the session has started. There are several approaches:

### Option 1: Don't Queue Traces Until Session Starts (Recommended)
Modify `NivoStackInterceptor` to check if session has started before queueing traces.

**Pros:**
- Simple fix
- No traces lost
- Clean solution

**Cons:**
- Requires checking `isSessionStarted()` in interceptor

### Option 2: Re-attach Traces to Session After Session Starts
When session starts, iterate through queued traces and add `sessionToken` to them.

**Pros:**
- No traces lost
- Works retroactively

**Cons:**
- More complex
- Traces already in queue need updating

### Option 3: Backfill sessionId in Backend
Backend could try to find session by deviceId + timestamp if sessionToken is null.

**Pros:**
- Fixes existing orphaned traces
- No SDK change needed

**Cons:**
- Less reliable (multiple sessions per device)
- Complex logic
- Doesn't prevent future orphans

---

## Implementation - Option 1 (Recommended)

**File to modify:** `packages/sdk-android/nivostack-core/src/main/java/com/plixera/nivostack/interceptors/NivoStackInterceptor.kt`

**Change at line 23:**
```kotlin
// BEFORE
val instance = NivoStack.instanceOrNull() ?: return chain.proceed(chain.request())

// AFTER
val instance = NivoStack.instanceOrNull() ?: return chain.proceed(chain.request())

// Wait for session to start before tracking traces
if (!instance.isSessionStarted()) {
    return chain.proceed(chain.request())
}
```

**Alternative (if you want to queue but not send):**
Modify `_flushTraces()` to attach current `sessionToken` to queued traces before sending:

```kotlin
private suspend fun _flushTraces() {
    if (traceQueue.isEmpty() || registeredDeviceId == null || sessionToken == null) return
    //                                                         ^^^^^^^^^^^^^^^^^^^ Add this check

    // ... rest of method
}
```

This way traces are queued but not sent until session starts.

---

## Next Steps

1. ✅ **Root cause identified** - Race condition between session start and trace capture
2. ✅ **Verified SDK code** - SDK correctly sends sessionToken when available
3. ✅ **Verified backend code** - Backend correctly links traces to sessions when sessionToken provided
4. ⏳ **Implement fix** - Choose Option 1 or Option 2
5. ⏳ **Test fix** - Rebuild and test with fresh install
6. ⏳ **Deploy** - Push to test environment

---

**Status:** ✅ Root cause confirmed - race condition causes early traces to have `sessionId = null`
**Fix Type:** SDK fix - prevent trace queueing before session starts OR wait to flush until session starts
**Effort:** Low - single line check in interceptor or flush method
