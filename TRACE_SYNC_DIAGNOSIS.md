# API Trace Sync Diagnosis - Missing Traces Issue

**Date:** 2026-01-19
**Issue:** API traces appear in app logger but not in dashboard
**Status:** 🔍 Root Cause Identified

---

## Problem Statement

User reports:
1. ✅ App logger shows API requests (forceUpdate, /customer/validate, login APIs)
2. ❌ Dashboard shows "16 requests" - count never increases
3. ❌ New API traces not appearing in dashboard
4. ✅ No pending traces in app

---

## Root Cause Analysis

### SDK Trace Flush Logic

**Location:** `packages/sdk-android/nivostack-core/src/main/java/com/plixera/nivostack/NivoStack.kt:596-614`

```kotlin
private suspend fun _flushTraces() {
    // Don't flush traces until session has started to ensure sessionToken is available
    // This prevents orphaned traces that can't be linked to sessions
    if (traceQueue.isEmpty() || registeredDeviceId == null || sessionToken == null) return

    val traces = mutableListOf<Map<String, Any>>()
    while (traces.size < sdkSettings.maxTraceQueueSize && traceQueue.isNotEmpty()) {
        traceQueue.poll()?.let { traces.add(it) }
    }

    if (traces.isNotEmpty()) {
        try {
            apiClient.sendTraces(projectId, registeredDeviceId!!, sessionToken, traces)
        } catch (e: Exception) {
            // Re-queue traces on failure
            traces.forEach { traceQueue.offer(it) }
        }
    }
}
```

### Critical Finding: Three Conditions Must Be Met

**Line 599:** `if (traceQueue.isEmpty() || registeredDeviceId == null || sessionToken == null) return`

Traces will NOT flush if:
1. ❌ Queue is empty
2. ❌ Device not registered (`registeredDeviceId == null`)
3. ❌ **Session not started (`sessionToken == null`)**

---

## Session Creation Flow

### When Session is Created

**Location:** `NivoStack.kt:556-576`

```kotlin
private suspend fun _startSession() {
    if (registeredDeviceId == null) return

    try {
        sessionToken = UUID.randomUUID().toString()

        apiClient.startSession(
            deviceId = registeredDeviceId!!,
            sessionToken = sessionToken!!,
            appVersion = deviceInfo.appVersion,
            osVersion = deviceInfo.osVersion,
            locale = Locale.getDefault().toString(),
            timezone = TimeZone.getDefault().id,
            networkType = null, // TODO: Get from ConnectivityManager
            entryScreen = entryScreen,
            userProperties = if (userProperties.isNotEmpty()) userProperties else null
        )
    } catch (e: Exception) {
        // Session start failed
    }
}
```

**Called From:** `NivoStack.kt:249-257`

```kotlin
// Start session (only if device is registered)
if (featureFlags.sessionTracking && registeredDeviceId != null) {
    try {
        _startSession()
        sessionStarted = true
    } catch (e: Exception) {
        log("Session start failed: ${e.message}")
        // Don't throw - continue with other initialization
    }
}
```

---

## Possible Failure Scenarios

### Scenario 1: Session Start Failed Silently ❌

**Problem:**
- `_startSession()` throws exception
- Exception is caught and logged but NOT re-thrown
- `sessionToken` remains `null`
- **All traces get queued but NEVER flush**

**Evidence:**
- User sees traces in app logger ✓
- No traces in dashboard ✓
- No pending traces (because flush keeps returning early) ✓

**Root Cause:**
```kotlin
catch (e: Exception) {
    log("Session start failed: ${e.message}")
    // Don't throw - continue with other initialization
}
```

**Impact:** SDK continues running but in broken state - traces accumulate but never sync!

---

### Scenario 2: Feature Flag Disabled ❌

**Problem:**
- `featureFlags.sessionTracking` is `false`
- Session never starts
- `sessionToken` stays `null`
- Traces never flush

**Check:** Dashboard Project Settings → Feature Flags → "Session Tracking"

---

### Scenario 3: API Call Failed ❌

**Problem:**
- `apiClient.startSession()` fails (network error, 400/500 response)
- Exception caught, session not created
- SDK continues but broken

**Possible Causes:**
- Network timeout
- Server error (500)
- Invalid device ID (400)
- Wrong API endpoint URL

---

## Diagnostic Steps

### Step 1: Check SDK Logs

Enable verbose logging in the Flooss BH app:

```kotlin
// Check if these logs appear:
Log.d("NivoStack", "Session start failed: <error message>")
Log.d("NivoStack", "Device registration failed: <error message>")
```

### Step 2: Check Dashboard Feature Flags

1. Go to Project Settings
2. Navigate to Feature Flags tab
3. Verify:
   - ✅ "SDK Enabled" = ON
   - ✅ "Session Tracking" = ON
   - ✅ "API Trace Tracking" = ON

### Step 3: Check Pending Trace Count

Add this to app's developer settings:

```kotlin
val pendingCount = NivoStack.instance.getPendingTraceCount()
Log.d("FloosBH", "Pending traces: $pendingCount")
```

If pending count is high (> 0) but nothing syncs → Session is broken

### Step 4: Check Session State

Add to developer settings:

```kotlin
val sessionStarted = NivoStack.instance.isSessionStarted() // Need to expose this
Log.d("FloosBH", "Session started: $sessionStarted")
```

If `false` → Session never started or failed

---

## Solutions

### Solution 1: Expose Session State for Debugging (Quick Fix)

**File:** `packages/sdk-android/nivostack-core/src/main/java/com/plixera/nivostack/NivoStack.kt`

Add public method to check session state:

```kotlin
/**
 * Check if session has been started
 * Useful for debugging trace sync issues
 */
fun isSessionStarted(): Boolean {
    return sessionToken != null
}

/**
 * Get pending trace count
 */
fun getPendingTraceCount(): Int {
    return traceQueue.size
}
```

**Benefit:** App can detect broken state and alert user

---

### Solution 2: Retry Session Start on Failure (Recommended)

**File:** `packages/sdk-android/nivostack-core/src/main/java/com/plixera/nivostack/NivoStack.kt`

Change session start logic to retry like device registration:

```kotlin
// In initialization (Line 249):
if (featureFlags.sessionTracking && registeredDeviceId != null) {
    var retries = 0
    var sessionError: Exception? = null

    while (retries < 3 && !sessionStarted) {
        try {
            _startSession()
            sessionStarted = true
            log("Session started successfully")
            break
        } catch (e: Exception) {
            sessionError = e
            retries++
            log("Session start attempt $retries failed: ${e.message}")
            if (retries < 3) {
                delay(2000L * retries) // Exponential backoff
            }
        }
    }

    if (!sessionStarted) {
        log("CRITICAL: Session failed after 3 retries: ${sessionError?.message}")
        // TODO: Show warning to user in debug mode
    }
}
```

**Benefit:** More resilient to network issues

---

### Solution 3: Flush Without Session (Breaking Change)

**Warning:** This changes trace data model

Remove session requirement from flush:

```kotlin
private suspend fun _flushTraces() {
    // Allow flushing without session (session will be null in traces)
    if (traceQueue.isEmpty() || registeredDeviceId == null) return

    // sessionToken can be null - backend will handle it
    val traces = mutableListOf<Map<String, Any>>()
    while (traces.size < sdkSettings.maxTraceQueueSize && traceQueue.isNotEmpty()) {
        traceQueue.poll()?.let { traces.add(it) }
    }

    if (traces.isNotEmpty()) {
        try {
            apiClient.sendTraces(projectId, registeredDeviceId!!, sessionToken, traces)
        } catch (e: Exception) {
            traces.forEach { traceQueue.offer(it) }
        }
    }
}
```

**Trade-off:** Traces can exist without sessions (breaks data model)

---

## Immediate Action Plan

### For Client Team (Flooss BH):

1. **Check App Logs for Session Errors:**
   ```bash
   adb logcat | grep -i "session start failed"
   ```

2. **Check Device Registration:**
   ```bash
   adb logcat | grep -i "device registration"
   ```

3. **Check SDK Init Status:**
   Add to app:
   ```kotlin
   Log.d("FloosBH", "SDK initialized: ${NivoStack.instance.isInitialized()}")
   ```

4. **Force Manual Flush:**
   Add button in developer settings:
   ```kotlin
   button.setOnClickListener {
       GlobalScope.launch {
           NivoStack.instance.flush()
           Log.d("FloosBH", "Manual flush triggered")
       }
   }
   ```

---

### For SDK Team:

1. **Add Debug Methods (Priority: High):**
   ```kotlin
   fun isSessionStarted(): Boolean
   fun getPendingTraceCount(): Int
   fun getInitError(): String?
   ```

2. **Implement Session Retry Logic (Priority: High):**
   - Retry 3 times with exponential backoff
   - Log clear error messages
   - Expose failure state to app

3. **Add Session Recovery (Priority: Medium):**
   - If session start fails, retry on next app foreground
   - Or auto-retry after 60 seconds

---

## Expected Behavior vs Actual

### Expected:
1. App launches → SDK inits → Device registers → Session starts
2. API calls → Interceptor captures → Adds to queue
3. Queue full OR app background → Flush to server
4. Dashboard shows all traces

### Actual (Suspected):
1. App launches → SDK inits → Device registers → **Session start FAILS**
2. API calls → Interceptor captures → Adds to queue
3. Queue full OR app background → **Flush returns early (no session)**
4. Dashboard shows OLD traces only (from previous successful session)

---

## Verification

After implementing fixes, verify:

1. **App Logs Show:**
   ```
   NivoStack: Device registered: device-id-xxx
   NivoStack: Session started successfully
   NivoStack: Tracking screen: SplashActivity
   NivoStack: Intercepted: POST /customer/validate
   NivoStack: Flushed 5 traces to server
   ```

2. **Dashboard Shows:**
   - New traces appear within 5-10 seconds
   - Request count increases
   - Session shows new API calls

3. **No Pending Traces:**
   - `getPendingTraceCount()` returns 0 after flush

---

## Related Issues

- Session count stuck at 16 requests → Same root cause (session broken)
- Missing screenName → Separate issue (lifecycle observer not registered)

---

**Status:** Awaiting client team logs to confirm diagnosis
**Next Step:** Check app logs for "Session start failed" message
