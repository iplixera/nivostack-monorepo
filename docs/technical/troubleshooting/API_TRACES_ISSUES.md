# API Traces Issues - Investigation

**Date:** 2026-01-18
**Status:** 🔍 Under Investigation

---

## Issues Reported

### 1. Some Traces Missing `screenName`
**Symptom:** Some API traces display device information but no `screenName` field.

**Possible Causes:**

#### A. Trace Captured Before Screen Tracking Initialized
If API calls happen before the first `trackScreen()` call, traces won't have screenName.

**Timeline:**
```
T=0ms:    App launches
T=50ms:   NivoStack.init() called
T=100ms:  First API call made (no screen tracked yet) ❌
T=200ms:  SplashActivity calls trackScreen("SplashActivity")
T=300ms:  Second API call made (has screenName) ✅
```

**Solution:** Ensure `trackScreen()` is called in Activity `onCreate()` or `onResume()` before any API calls.

#### B. Interceptor Not Capturing `screenName`
The interceptor should call `instance.getCurrentScreen()` to get the current screen.

**Check:** [NivoStackInterceptor.kt:83](../../../packages/sdk-android/nivostack-core/src/main/java/com/plixera/nivostack/interceptors/NivoStackInterceptor.kt#L83)

```kotlin
// Include current screen name for flow visualization
instance.getCurrentScreen()?.let { put("screenName", it) }
```

**If this line is missing** → screenName won't be captured → Fix #11 not deployed

**If this line exists** → Check if `getCurrentScreen()` returns null

#### C. Activity Lifecycle Issues
Some activities might not call `trackScreen()` properly.

**Check:**
1. Does every Activity call `trackScreen()`?
2. Is it called in `onCreate()` or `onResume()`?
3. Are background activities being tracked when they shouldn't be?

**Example Flooss Activities:**
- ✅ `SplashActivity` - Should track
- ✅ `AuthActivity` - Should track
- ✅ `HomeActivity` - Should track
- ❓ `MainActivity` - Check if it calls trackScreen
- ❓ Background services - Should NOT track

---

### 2. 404/417 Errors Not Captured in Backend

**Symptom:** Local logger shows 404 and 417 errors, but they don't appear in dashboard traces.

**Possible Causes:**

#### A. Traces Not Being Flushed
Errors captured but not sent to backend.

**Check SDK Logs:**
```kotlin
// Look for these messages
"Debug mode: Auto-flushed traces and logs"
"Failed to flush traces"
"Trace flush failed: [error]"
```

**Reasons traces might not flush:**
1. **Session not started yet** (FIXED in v1.0.1) ✅
2. **Device not registered** → `registeredDeviceId = null`
3. **Debug mode not enabled** → Auto-flush only works in debug mode
4. **Network error** → Flush fails silently

**Verification:**
```kotlin
// In DeveloperSettingsActivity
Log.d("NivoStack", "Pending traces: ${NivoStack.instance.getPendingTraceCount()}")
```

If pending count increases but never decreases → **Flush is failing**

#### B. Backend Rejecting Error Traces
Backend might be filtering out certain status codes.

**Check Backend:** [route.ts:340-345](../../../dashboard/src/app/api/traces/route.ts#L340-L345)

```typescript
if (!url || !method) {
  return NextResponse.json(
    { error: 'url and method are required' },
    { status: 400 }
  )
}
```

**Backend accepts all status codes** - no filtering by statusCode in validation.

#### C. Interceptor Not Capturing Errors
Check if interceptor properly handles HTTP errors.

**Interceptor Error Handling:** [NivoStackInterceptor.kt:88-112](../../../packages/sdk-android/nivostack-core/src/main/java/com/plixera/nivostack/interceptors/NivoStackInterceptor.kt#L88-L112)

```kotlin
} catch (e: Exception) {
    error = e.message ?: "Unknown error"
    val requestDuration = TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - requestStartTime)

    // Create error trace
    val trace = buildMap<String, Any> {
        put("url", requestUrl)
        put("method", requestMethod)
        put("statusCode", 0)  // Network errors get 0
        put("statusMessage", "Error")
        put("duration", requestDuration)
        put("error", error)
        // ...
    }

    // Queue trace for sending
    instance.queueTrace(trace)

    throw e  // Re-throw to preserve app behavior
}
```

**Verification:**
- 404/417 are HTTP responses, NOT exceptions → Should go through normal path (line 53-89)
- Network errors (no internet) → Exception path (line 90-112)

**If 404/417 not captured** → Check if OkHttp response is successful but statusCode is 404/417

#### D. Manual Flush Not Working
Even with auto-flush disabled, app pause should flush traces.

**Check:** [NivoStack.kt:298-312](../../../packages/sdk-android/nivostack-core/src/main/java/com/plixera/nivostack/NivoStack.kt#L298-L312)

```kotlin
internal fun onAppPaused() {
    isAppActive = false
    _stopSyncTimer()
    _stopFlushTimer()

    // Flush traces and logs when app goes to background
    scope.launch {
        try {
            _flushTraces()
            _flushLogs()
        } catch (e: Exception) {
            log("Failed to flush on app background: ${e.message}")
        }
    }
}
```

**If traces not flushing on app pause:**
1. Check if `onAppPaused()` is being called
2. Check if `_flushTraces()` returns early due to null checks
3. Check network logs for failed requests

---

## Diagnostic Steps

### Step 1: Check SDK Status in App

Open app → Developer Settings → SDK Status

Look for:
- ✅ **Device Registered**: Should be "Yes"
- ✅ **Session Started**: Should be "Yes"
- ✅ **Current Screen**: Should show current activity name
- ⚠️ **Pending Traces**: If > 0 and not decreasing → Flush failing

### Step 2: Check Logs for Flush Activity

```bash
# Filter for NivoStack logs
adb logcat | grep -i nivostack

# Look for:
# - "Auto-flushed traces and logs"
# - "Trace flush failed"
# - "Session start failed"
# - "Device registration failed"
```

### Step 3: Verify Interceptor is Active

Make a test API call and check logs:
```kotlin
// In interceptor
Log.d("NivoStack", "Intercepting: ${request.url}")
Log.d("NivoStack", "Current screen: ${instance.getCurrentScreen()}")
Log.d("NivoStack", "Queuing trace for: $requestUrl")
```

### Step 4: Manual Flush Test

```kotlin
// Force flush
NivoStack.instance.flushTraces()

// Check pending count before and after
Log.d("Test", "Before: ${NivoStack.instance.getPendingTraceCount()}")
delay(2000)
Log.d("Test", "After: ${NivoStack.instance.getPendingTraceCount()}")
```

### Step 5: Check Backend Logs

Look for trace creation requests:
```bash
# In dashboard logs
grep "POST /api/traces" logs.txt

# Look for:
# - Success responses (200)
# - Error responses (400, 500)
# - Missing sessionToken
```

---

## Recommended Fixes

### Fix 1: Ensure Screen Tracking in All Activities

Add to Activity base class or Application:

```kotlin
abstract class BaseActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // Track screen BEFORE any API calls
        NivoStack.instance.trackScreen(this::class.java.simpleName)
    }
}
```

### Fix 2: Add Debug Logging to Interceptor

Temporarily add logs to see what's happening:

```kotlin
override fun intercept(chain: Interceptor.Chain): Response {
    val instance = NivoStack.instanceOrNull()
    if (instance == null) {
        Log.w("NivoStack", "Interceptor: Instance null, skipping trace")
        return chain.proceed(chain.request())
    }

    Log.d("NivoStack", "Interceptor: Capturing ${request.url}")
    Log.d("NivoStack", "Interceptor: Current screen = ${instance.getCurrentScreen()}")

    // ... rest of method

    Log.d("NivoStack", "Interceptor: Queued trace, pending count = ${instance.getPendingTraceCount()}")
}
```

### Fix 3: Enable Debug Mode for Auto-Flush

In app, enable debug mode for the test device:
1. Go to Developer Settings
2. Enable Debug Mode
3. This activates auto-flush every 30 seconds

---

## Status

- [x] Filter enhancements added (Environment, Status Code)
- [ ] Missing screenName investigation ongoing
- [ ] Error capture investigation ongoing

---

**Next Steps:**
1. Add debug logging to interceptor
2. Test with known 404/417 scenarios
3. Check SDK status during error scenarios
4. Verify flush is being called
