# Fix Tracker - Device ID & Debug Mode Issues

**Date:** 2026-01-18
**Session:** Advanced Logs Branch Bug Fixes

---

## 🔴 CRITICAL BACKEND FIXES

### Fix 1: Device ID Query Bug in `/api/sdk-init`
**Type:** 🌐 **BACKEND FIX**
**File:** `dashboard/src/app/api/sdk-init/route.ts`
**Line:** 220
**Commit:** `490b98c`

**Problem:**
- Backend was querying `deviceId: deviceId` (platform UUID field)
- SDK sends database ID (cuid format)

**Solution:**
```typescript
// BEFORE:
deviceId: deviceId  // ❌ Wrong column

// AFTER:
id: deviceId  // ✅ Correct column
```

**Impact:**
- Debug mode configuration now works correctly
- Device lookup succeeds

**Status:** ✅ Deployed to production

---

### Fix 2: Device ID Query Bug in `/api/traces` (2 locations)
**Type:** 🌐 **BACKEND FIX**
**File:** `dashboard/src/app/api/traces/route.ts`
**Lines:** 32, 417
**Commit:** `490b98c`

**Problem:**
- Backend was querying `deviceId: deviceId` (platform UUID field)
- SDK sends database ID (cuid format)
- API traces linking to wrong device

**Solution:**
```typescript
// Location 1: Line 32 (isTrackingEnabled helper)
// BEFORE:
where: { projectId, deviceId }

// AFTER:
where: { projectId, id: deviceId } // Query by database ID

// Location 2: Line 417 (device lookup)
// BEFORE:
where: {
  projectId: project.id,
  deviceId: deviceId,
  status: 'active'
}

// AFTER:
where: {
  projectId: project.id,
  id: deviceId, // Query by database ID, not platform deviceId field
  status: 'active'
}
```

**Impact:**
- API traces now link to correct devices
- No more "Unknown Device" entries
- Traces appear in dashboard correctly

**Status:** ✅ Deployed to production

---

### Fix 3: Device ID Query Bug in `/api/logs` (2 locations)
**Type:** 🌐 **BACKEND FIX**
**File:** `dashboard/src/app/api/logs/route.ts`
**Lines:** 31, 155
**Commit:** `490b98c`

**Problem:**
- Backend was querying `deviceId: deviceId` (platform UUID field)
- SDK sends database ID (cuid format)
- Logs linking to wrong device

**Solution:**
```typescript
// Location 1: Line 31 (isTrackingEnabled helper)
// BEFORE:
where: { projectId, deviceId }

// AFTER:
where: { projectId, id: deviceId } // Query by database ID

// Location 2: Line 155 (device lookup)
// BEFORE:
where: {
  projectId: project.id,
  deviceId: deviceId,
  status: 'active'
}

// AFTER:
where: {
  projectId: project.id,
  id: deviceId, // Query by database ID, not platform deviceId field
  status: 'active'
}
```

**Impact:**
- Logs now link to correct devices
- No more "Unknown Device" entries

**Status:** ✅ Deployed to production

---

## 📱 CRITICAL SDK FIXES (ANDROID)

### Fix 4: Android Secure ID for Stable Device Identification
**Type:** 📱 **SDK FIX - ANDROID**
**File:** `packages/sdk-android/nivostack-core/src/main/java/com/plixera/nivostack/NivoStack.kt`
**Lines:** 156-178
**Commit:** `490b98c`

**Problem:**
- SDK was using random UUID for device ID
- Device ID changed on every app reinstall
- Created duplicate devices in database

**Solution:**
```kotlin
// BEFORE:
val deviceId = UUID.randomUUID().toString()

// AFTER:
val androidId = android.provider.Settings.Secure.getString(
    context.contentResolver,
    android.provider.Settings.Secure.ANDROID_ID
)

val stableDeviceId = if (!androidId.isNullOrEmpty() && androidId != "9774d56d682e549c") {
    "android_$androidId"  // ✅ Stable across reinstalls
} else {
    UUID.randomUUID().toString()  // Fallback only
}
```

**Impact:**
- Same device gets same ID after uninstall/reinstall
- No duplicate devices in database
- Device data persists across reinstalls

**Status:** ✅ Implemented
**Replication Required:** 🔄 **YES - iOS, React Native, Flutter, Web SDKs**

**iOS Implementation:**
```swift
// Use identifierForVendor
let deviceId = UIDevice.current.identifierForVendor?.uuidString ?? UUID().uuidString
```

**React Native Implementation:**
```typescript
import DeviceInfo from 'react-native-device-info';
const deviceId = await DeviceInfo.getUniqueId(); // Uses ANDROID_ID on Android, identifierForVendor on iOS
```

**Flutter Implementation:**
```dart
import 'package:device_info_plus/device_info_plus.dart';
// Android: Use androidId
// iOS: Use identifierForVendor
```

**Web Implementation:**
```typescript
// Use localStorage + fingerprinting
const deviceId = localStorage.getItem('device_id') || generateFingerprint();
```

---

### Fix 5: Device Registration Retry with Exponential Backoff
**Type:** 📱 **SDK FIX - ANDROID**
**File:** `packages/sdk-android/nivostack-core/src/main/java/com/plixera/nivostack/NivoStack.kt`
**Lines:** 445-502
**Commit:** `490b98c`

**Problem:**
- Device registration failed silently on network issues
- No retry mechanism
- `registeredDeviceId` remained null

**Solution:**
```kotlin
// BEFORE:
try {
    val response = apiClient.registerDevice(...)
    registeredDeviceId = response["device"]["id"]
} catch (e: Exception) {
    // Silent failure
}

// AFTER:
var lastException: Exception? = null
val maxRetries = 3
var delayMs = 1000L

for (attempt in 1..maxRetries) {
    try {
        val response = apiClient.registerDevice(...)
        val deviceData = response["device"] as? Map<*, *>

        if (deviceData != null) {
            registeredDeviceId = deviceData["id"] as? String
            if (registeredDeviceId == null) {
                throw Exception("Device registration response missing 'id' field")
            }
            return // Success!
        }
    } catch (e: Exception) {
        lastException = e
        if (attempt < maxRetries) {
            delay(delayMs)
            delayMs *= 2 // Exponential backoff: 1s, 2s, 4s
        }
    }
}
```

**Impact:**
- Reliable device registration on poor networks
- 3 attempts with 1s, 2s, 4s delays
- Proper error logging

**Status:** ✅ Implemented
**Replication Required:** 🔄 **YES - iOS, React Native, Flutter, Web SDKs**

**Pseudo-code for all SDKs:**
```
maxRetries = 3
delays = [1000ms, 2000ms, 4000ms]

for attempt in 1..maxRetries:
    try:
        response = registerDevice(...)
        if response.device && response.device.id:
            registeredDeviceId = response.device.id
            return success
        else:
            throw error("Missing device.id in response")
    catch error:
        if attempt < maxRetries:
            sleep(delays[attempt-1])
        else:
            throw error
```

---

### Fix 6: HTTP Timeout Increase
**Type:** 📱 **SDK FIX - ANDROID**
**File:** `packages/sdk-android/nivostack-core/src/main/java/com/plixera/nivostack/clients/ApiClient.kt`
**Lines:** 24-26
**Commit:** `490b98c`

**Problem:**
- 3-second timeout too aggressive for mobile networks
- Requests failing on slow connections

**Solution:**
```kotlin
// BEFORE:
client = OkHttpClient.Builder()
    .connectTimeout(3, TimeUnit.SECONDS)
    .readTimeout(3, TimeUnit.SECONDS)
    .writeTimeout(3, TimeUnit.SECONDS)
    .build()

// AFTER:
client = OkHttpClient.Builder()
    .connectTimeout(10, TimeUnit.SECONDS)  // ✅ Increased to 10s
    .readTimeout(10, TimeUnit.SECONDS)     // ✅ Increased to 10s
    .writeTimeout(10, TimeUnit.SECONDS)    // ✅ Increased to 10s
    .build()
```

**Impact:**
- Better reliability on mobile networks
- Fewer timeout failures

**Status:** ✅ Implemented
**Replication Required:** 🔄 **YES - iOS, React Native, Flutter, Web SDKs**

**Recommendation for all SDKs:**
- Connect timeout: 10 seconds
- Read timeout: 10 seconds
- Write timeout: 10 seconds

---

### Fix 7: HTTP Response Validation
**Type:** 📱 **SDK FIX - ANDROID**
**File:** `packages/sdk-android/nivostack-core/src/main/java/com/plixera/nivostack/clients/ApiClient.kt`
**Lines:** 54-70
**Commit:** `490b98c`

**Problem:**
- No validation of HTTP response codes
- No validation of response structure
- Silent failures

**Solution:**
```kotlin
// AFTER:
val response = client.newCall(request).execute()

// Check if response is successful
if (!response.isSuccessful) {
    val errorBody = response.body?.string() ?: "Unknown error"
    throw IOException("Device registration failed with code ${response.code}: $errorBody")
}

val responseBody = response.body?.string() ?: "{}"

// Validate response has expected structure
val result = gson.fromJson(responseBody, Map::class.java) as Map<String, Any>
if (result["device"] == null) {
    throw IOException("Invalid response: missing 'device' field in response: $responseBody")
}

return result
```

**Impact:**
- Proper error reporting
- Better debugging
- Catches malformed responses

**Status:** ✅ Implemented
**Replication Required:** 🔄 **YES - iOS, React Native, Flutter, Web SDKs**

**Validation checklist for all SDKs:**
1. ✅ Check HTTP status code (200-299 = success)
2. ✅ Validate response is not empty
3. ✅ Validate response has expected fields
4. ✅ Throw descriptive errors with status code

---

### Fix 8: Flush Traces/Logs on App Background
**Type:** 📱 **SDK FIX - ANDROID**
**File:** `packages/sdk-android/nivostack-core/src/main/java/com/plixera/nivostack/NivoStack.kt`
**Lines:** 298-312
**Commit:** `d3fa71d`

**Problem:**
- Traces stuck in queue when app goes to background
- No automatic flushing
- Data loss risk

**Solution:**
```kotlin
// BEFORE:
internal fun onAppPaused() {
    isAppActive = false
    _stopSyncTimer()
}

// AFTER:
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

**Impact:**
- No data loss when app backgrounds
- All pending traces/logs sent before app suspends

**Status:** ✅ Implemented
**Replication Required:** 🔄 **YES - iOS, React Native, Flutter SDKs** (Web N/A - uses beforeunload)

**iOS Implementation:**
```swift
// In AppDelegate or SceneDelegate
func applicationDidEnterBackground(_ application: UIApplication) {
    NivoStack.shared.flush()
}
```

**React Native Implementation:**
```typescript
import { AppState } from 'react-native';

AppState.addEventListener('change', (nextAppState) => {
  if (nextAppState === 'background') {
    NivoStack.flush();
  }
});
```

**Flutter Implementation:**
```dart
class _AppLifecycleObserver extends WidgetsBindingObserver {
  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.paused) {
      NivoStack.flush();
    }
  }
}
```

---

### Fix 9: Periodic Flush for Debug Devices (5 seconds)
**Type:** 📱 **SDK FIX - ANDROID**
**File:** `packages/sdk-android/nivostack-core/src/main/java/com/plixera/nivostack/NivoStack.kt`
**Lines:** 83-85, 350-383
**Commit:** `d3fa71d`

**Problem:**
- Debug devices had to wait for queue full or app background
- Poor testing experience
- Traces took too long to appear

**Solution:**
```kotlin
// Add flush timer job
private var flushJob: Job? = null
private val debugFlushInterval = 5000L // 5 seconds

private fun _startFlushTimer() {
    _stopFlushTimer()

    if (!enabled || !isAppActive || !deviceConfig.debugModeEnabled) {
        return
    }

    flushJob = scope.launch {
        while (isAppActive && enabled && deviceConfig.debugModeEnabled) {
            delay(debugFlushInterval)
            if (isAppActive && enabled && deviceConfig.debugModeEnabled) {
                try {
                    _flushTraces()
                    _flushLogs()
                    log("Debug mode: Auto-flushed traces and logs")
                } catch (e: Exception) {
                    log("Debug mode: Auto-flush failed: ${e.message}")
                }
            }
        }
    }
}

private fun _stopFlushTimer() {
    flushJob?.cancel()
    flushJob = null
}
```

**When to start:**
- ✅ On SDK initialization (if debug mode enabled)
- ✅ On app resume (if debug mode enabled)
- ✅ When debug mode is enabled via config refresh

**When to stop:**
- ✅ On app pause/background
- ✅ When debug mode disabled
- ✅ When SDK disabled

**Impact:**
- Debug devices see traces in dashboard within 5 seconds
- Perfect for testing
- No impact on production (only runs if debugModeEnabled = true)

**Status:** ✅ Implemented
**Replication Required:** 🔄 **YES - iOS, React Native, Flutter SDKs** (Web N/A - different pattern)

**Pseudo-code for all SDKs:**
```
const DEBUG_FLUSH_INTERVAL = 5000 // 5 seconds

function startFlushTimer():
    stopFlushTimer()

    if !enabled || !isAppActive || !deviceConfig.debugModeEnabled:
        return

    flushTimer = setInterval(async () => {
        if enabled && isAppActive && deviceConfig.debugModeEnabled:
            try:
                await flushTraces()
                await flushLogs()
                log("Debug mode: Auto-flushed traces and logs")
            catch error:
                log("Debug mode: Auto-flush failed: " + error)
    }, DEBUG_FLUSH_INTERVAL)

function stopFlushTimer():
    if flushTimer:
        clearInterval(flushTimer)
        flushTimer = null
```

**iOS Implementation Pattern:**
```swift
private var flushTimer: Timer?
private let debugFlushInterval: TimeInterval = 5.0

func startFlushTimer() {
    stopFlushTimer()

    guard enabled && isAppActive && deviceConfig.debugModeEnabled else { return }

    flushTimer = Timer.scheduledTimer(withTimeInterval: debugFlushInterval, repeats: true) { [weak self] _ in
        guard let self = self,
              self.enabled,
              self.isAppActive,
              self.deviceConfig.debugModeEnabled else { return }

        Task {
            await self.flushTraces()
            await self.flushLogs()
        }
    }
}

func stopFlushTimer() {
    flushTimer?.invalidate()
    flushTimer = nil
}
```

---

### Fix 10: Dynamic Debug Mode Management
**Type:** 📱 **SDK FIX - ANDROID**
**File:** `packages/sdk-android/nivostack-core/src/main/java/com/plixera/nivostack/NivoStack.kt`
**Lines:** 453-456
**Commit:** `d3fa71d`

**Problem:**
- Debug mode changes required app restart
- Flush timer didn't respond to config changes

**Solution:**
```kotlin
// In _fetchSdkInitData, after parsing deviceConfig:
val oldDebugMode = deviceConfig.debugModeEnabled
deviceConfig = DeviceConfig.fromJson(deviceConfigMap as Map<String, Any>)

// Restart flush timer if debug mode changed
if (oldDebugMode != deviceConfig.debugModeEnabled && isAppActive) {
    _startFlushTimer()
}
```

**Impact:**
- Debug mode changes take effect immediately
- No app restart needed
- Flush timer starts/stops automatically

**Status:** ✅ Implemented
**Replication Required:** 🔄 **YES - iOS, React Native, Flutter, Web SDKs**

**Pattern for all SDKs:**
```
function updateDeviceConfig(newConfig):
    oldDebugMode = deviceConfig.debugModeEnabled
    deviceConfig = newConfig

    if oldDebugMode != deviceConfig.debugModeEnabled && isAppActive:
        startFlushTimer() // Will start or stop based on new value
```

---

## 📊 Summary

### Backend Fixes (3)
- ✅ Fix 1: `/api/sdk-init` device query - **DEPLOYED**
- ✅ Fix 2: `/api/traces` device query (2 locations) - **DEPLOYED**
- ✅ Fix 3: `/api/logs` device query (2 locations) - **DEPLOYED**

### SDK Fixes - Android (7)
- ✅ Fix 4: Android Secure ID - **IMPLEMENTED** - 🔄 **NEEDS REPLICATION**
- ✅ Fix 5: Registration retry + exponential backoff - **IMPLEMENTED** - 🔄 **NEEDS REPLICATION**
- ✅ Fix 6: HTTP timeout increase (10s) - **IMPLEMENTED** - 🔄 **NEEDS REPLICATION**
- ✅ Fix 7: HTTP response validation - **IMPLEMENTED** - 🔄 **NEEDS REPLICATION**
- ✅ Fix 8: Flush on app background - **IMPLEMENTED** - 🔄 **NEEDS REPLICATION**
- ✅ Fix 9: Periodic flush for debug devices (5s) - **IMPLEMENTED** - 🔄 **NEEDS REPLICATION**
- ✅ Fix 10: Dynamic debug mode management - **IMPLEMENTED** - 🔄 **NEEDS REPLICATION**

### Total Fixes: 10
- Backend: 3 (all deployed)
- Android SDK: 7 (all implemented)
- **Replication Required:** 7 SDK fixes → iOS, React Native, Flutter, Web

---

## 🔄 Replication Checklist

### iOS SDK
- [ ] Fix 4: Use identifierForVendor for stable device ID
- [ ] Fix 5: Implement retry with exponential backoff
- [ ] Fix 6: Increase timeout to 10 seconds
- [ ] Fix 7: Add HTTP response validation
- [ ] Fix 8: Flush on applicationDidEnterBackground
- [ ] Fix 9: Add 5-second flush timer for debug mode
- [ ] Fix 10: Restart flush timer on debug mode change

### React Native SDK
- [ ] Fix 4: Use device-info library for stable device ID
- [ ] Fix 5: Implement retry with exponential backoff
- [ ] Fix 6: Increase timeout to 10 seconds
- [ ] Fix 7: Add HTTP response validation
- [ ] Fix 8: Flush on AppState 'background'
- [ ] Fix 9: Add 5-second flush timer for debug mode
- [ ] Fix 10: Restart flush timer on debug mode change

### Flutter SDK
- [ ] Fix 4: Use device_info_plus for stable device ID
- [ ] Fix 5: Implement retry with exponential backoff
- [ ] Fix 6: Increase timeout to 10 seconds
- [ ] Fix 7: Add HTTP response validation
- [ ] Fix 8: Flush on AppLifecycleState.paused
- [ ] Fix 9: Add 5-second flush timer for debug mode
- [ ] Fix 10: Restart flush timer on debug mode change

### Web SDK
- [ ] Fix 4: Use localStorage + fingerprinting for stable device ID
- [ ] Fix 5: Implement retry with exponential backoff
- [ ] Fix 6: Increase timeout to 10 seconds
- [ ] Fix 7: Add HTTP response validation
- [ ] Fix 8: N/A (use beforeunload event instead)
- [ ] Fix 9: N/A (web uses different pattern - visibility API)
- [ ] Fix 10: Restart flush timer on debug mode change

---

**Last Updated:** 2026-01-18 16:45 UTC
**Session:** Advanced Logs Branch - Device ID & Debug Mode Fixes

---

## 📱 SDK Fix 11: Include screenName in API Traces

### Fix 11: Add screenName to NivoStackInterceptor
**Type:** 📱 **SDK FIX - ANDROID**
**Files:** 
- `packages/sdk-android/nivostack-core/src/main/java/com/plixera/nivostack/NivoStack.kt:838-841`
- `packages/sdk-android/nivostack-core/src/main/java/com/plixera/nivostack/interceptors/NivoStackInterceptor.kt:71-106`
**Commit:** TBD

**Problem:**
- Screen flow visualization queries `ApiTrace.screenName` field
- API interceptor was NOT including `screenName` in trace data
- All traces had `screenName = NULL`
- Screen flow dashboard showed empty (no data)

**Solution:**

**Part 1: Add getCurrentScreen() getter**
```kotlin
// File: NivoStack.kt:838-841
/**
 * Get current screen name
 */
fun getCurrentScreen(): String? = currentScreen
```

**Part 2: Include screenName in success traces**
```kotlin
// File: NivoStackInterceptor.kt:71-84
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
    // ✅ ADD: Include current screen name for flow visualization
    instance.getCurrentScreen()?.let { put("screenName", it) }
}
```

**Part 3: Include screenName in error traces**
```kotlin
// File: NivoStackInterceptor.kt:94-106
// Create error trace
val trace = buildMap<String, Any> {
    put("url", requestUrl)
    put("method", requestMethod)
    put("statusCode", 0)
    put("statusMessage", "Error")
    put("duration", requestDuration)
    put("error", error)
    requestHeaders.let { put("requestHeaders", it) }
    requestBody?.let { put("requestBody", it) }
    // ✅ ADD: Include current screen name for flow visualization
    instance.getCurrentScreen()?.let { put("screenName", it) }
}
```

**Impact:**
- ✅ API traces now include screen where request was made
- ✅ Screen flow visualization shows screens with API activity
- ✅ Screen transitions are visible in dashboard
- ✅ Flow metrics (request count, cost, success rate) per screen

**Status:** ✅ Tracked - Ready for testing
**Replication Required:** 🔄 **YES - iOS, React Native, Flutter, Web SDKs**

**iOS Implementation:**
```swift
// In API interceptor/session configuration
trace["screenName"] = NivoStack.shared.getCurrentScreen()
```

**React Native Implementation:**
```typescript
// In API interceptor
trace.screenName = NivoStack.getCurrentScreen();
```

**Flutter Implementation:**
```dart
// In API interceptor
trace['screenName'] = NivoStack.instance.getCurrentScreen();
```

**Web Implementation:**
```typescript
// In fetch/axios interceptor
trace.screenName = NivoStack.getCurrentScreen();
```

---

## 📊 Updated Summary

### Backend Fixes (3)
- ✅ Fix 1: `/api/sdk-init` device query - **DEPLOYED**
- ✅ Fix 2: `/api/traces` device query (2 locations) - **DEPLOYED**
- ✅ Fix 3: `/api/logs` device query (2 locations) - **DEPLOYED**

### SDK Fixes - Android (8)
- ✅ Fix 4: Android Secure ID - **IMPLEMENTED** - 🔄 **NEEDS REPLICATION**
- ✅ Fix 5: Registration retry + exponential backoff - **IMPLEMENTED** - 🔄 **NEEDS REPLICATION**
- ✅ Fix 6: HTTP timeout increase (10s) - **IMPLEMENTED** - 🔄 **NEEDS REPLICATION**
- ✅ Fix 7: HTTP response validation - **IMPLEMENTED** - 🔄 **NEEDS REPLICATION**
- ✅ Fix 8: Flush on app background - **IMPLEMENTED** - 🔄 **NEEDS REPLICATION**
- ✅ Fix 9: Periodic flush for debug devices (5s) - **IMPLEMENTED** - 🔄 **NEEDS REPLICATION**
- ✅ Fix 10: Dynamic debug mode management - **IMPLEMENTED** - 🔄 **NEEDS REPLICATION**
- ✅ Fix 11: Include screenName in API traces - **TRACKED** - 🔄 **NEEDS REPLICATION**

### Total Fixes: 11
- Backend: 3 (all deployed)
- Android SDK: 8 (7 implemented, 1 tracked)
- **Replication Required:** 8 SDK fixes → iOS, React Native, Flutter, Web

---

## 🔄 Updated Replication Checklist

### iOS SDK
- [ ] Fix 4: Use identifierForVendor for stable device ID
- [ ] Fix 5: Implement retry with exponential backoff
- [ ] Fix 6: Increase timeout to 10 seconds
- [ ] Fix 7: Add HTTP response validation
- [ ] Fix 8: Flush on applicationDidEnterBackground
- [ ] Fix 9: Add 5-second flush timer for debug mode
- [ ] Fix 10: Restart flush timer on debug mode change
- [ ] Fix 11: Include getCurrentScreen() in API traces

### React Native SDK
- [ ] Fix 4: Use device-info library for stable device ID
- [ ] Fix 5: Implement retry with exponential backoff
- [ ] Fix 6: Increase timeout to 10 seconds
- [ ] Fix 7: Add HTTP response validation
- [ ] Fix 8: Flush on AppState 'background'
- [ ] Fix 9: Add 5-second flush timer for debug mode
- [ ] Fix 10: Restart flush timer on debug mode change
- [ ] Fix 11: Include getCurrentScreen() in API traces

### Flutter SDK
- [ ] Fix 4: Use device_info_plus for stable device ID
- [ ] Fix 5: Implement retry with exponential backoff
- [ ] Fix 6: Increase timeout to 10 seconds
- [ ] Fix 7: Add HTTP response validation
- [ ] Fix 8: Flush on AppLifecycleState.paused
- [ ] Fix 9: Add 5-second flush timer for debug mode
- [ ] Fix 10: Restart flush timer on debug mode change
- [ ] Fix 11: Include getCurrentScreen() in API traces

### Web SDK
- [ ] Fix 4: Use localStorage + fingerprinting for stable device ID
- [ ] Fix 5: Implement retry with exponential backoff
- [ ] Fix 6: Increase timeout to 10 seconds
- [ ] Fix 7: Add HTTP response validation
- [ ] Fix 8: N/A (use beforeunload event instead)
- [ ] Fix 9: N/A (web uses different pattern - visibility API)
- [ ] Fix 10: Restart flush timer on debug mode change
- [ ] Fix 11: Include getCurrentScreen() in API traces

---

**Last Updated:** 2026-01-18 17:15 UTC
**Session:** Advanced Logs Branch - Device ID, Debug Mode, & Screen Flow Fixes
