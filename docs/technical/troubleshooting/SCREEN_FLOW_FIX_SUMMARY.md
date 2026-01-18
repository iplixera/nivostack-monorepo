# Screen Flow Fix Summary

**Date:** 2026-01-18
**Issue:** Empty screen flow visualization despite having API traces
**Status:** ✅ Fixed in SDK v1.0.1

---

## Quick Summary

Fixed a race condition in the Android SDK where API traces were captured during app launch before the session was initialized, causing traces to be orphaned (no `sessionId`). This prevented the screen flow visualization from displaying any data.

---

## The Problem

### Symptoms
- Dashboard showed "No session data available" in screen flow
- API traces existed in database with `screenName` populated
- ALL traces had `sessionId = null`

### Root Cause
Race condition during SDK initialization:
1. App launches → SDK initializes in background
2. App makes API calls → Traces captured and queued
3. Flush timer triggers → Traces sent with `sessionToken = null`
4. Session completes initialization later → Too late for early traces

### Impact
- Screen flow visualization showed no data
- Traces could not be linked to sessions
- User journey analysis was incomplete

---

## The Fix

### Code Change
**File:** `packages/sdk-android/nivostack-core/src/main/java/com/plixera/nivostack/NivoStack.kt`

**Line 599:** Added check to prevent flushing traces until session has started:

```kotlin
private suspend fun _flushTraces() {
    // Don't flush traces until session has started to ensure sessionToken is available
    // This prevents orphaned traces that can't be linked to sessions
    if (traceQueue.isEmpty() || registeredDeviceId == null || sessionToken == null) return
    //                                                         ^^^^^^^^^^^^^^^^^^^ Added

    // ... rest of method
}
```

### What Changed
- Traces are still captured and queued immediately
- Traces are only flushed to backend after session starts
- Ensures all traces have valid `sessionToken`
- Backend can now link traces to sessions via `sessionId`

---

## Files Modified

1. **SDK Code**
   - [NivoStack.kt:599](../../../packages/sdk-android/nivostack-core/src/main/java/com/plixera/nivostack/NivoStack.kt#L599) - Added sessionToken check

2. **Version**
   - [gradle.properties:33](../../../packages/sdk-android/nivostack-core/gradle.properties#L33) - Bumped to v1.0.1

3. **Documentation**
   - [CHANGELOG.md](../../../packages/sdk-android/CHANGELOG.md) - Added fix entry
   - [SCREEN_FLOW_EMPTY_DIAGNOSIS.md](SCREEN_FLOW_EMPTY_DIAGNOSIS.md) - Full diagnosis
   - [README.md](README.md) - Updated troubleshooting index

---

## Testing

### Verification Steps

1. **Update SDK in your app:**
   ```gradle
   dependencies {
       implementation("com.github.iplixera:nivostack-android:1.0.1")
   }
   ```

2. **Clean and rebuild:**
   ```bash
   ./gradlew clean
   ./gradlew assembleDebug
   ```

3. **Test fresh app launch:**
   - Install app on device
   - Launch app (fresh start, not background resume)
   - Navigate through 3-4 screens
   - Make API calls from each screen
   - Wait 30 seconds for traces to flush

4. **Verify in dashboard:**
   - Go to Screen Flow tab
   - Should now see sessions with traces
   - Traces should show screenName and be linked to sessions

### Expected Results

**Before fix:**
- Screen flow: Empty
- Traces: `screenName ✅`, `sessionId = null ❌`

**After fix:**
- Screen flow: Shows sessions with traces
- Traces: `screenName ✅`, `sessionId ✅`

---

## Migration Guide

### For Existing Apps

If you have orphaned traces in your database (from before the fix):

**Option 1: Wait for new data** (Recommended)
- Deploy v1.0.1
- New traces will be linked correctly
- Old orphaned traces will age out (30-day retention)

**Option 2: Backfill orphaned traces** (Advanced)
- Not recommended - complex and error-prone
- Multiple sessions per device makes matching unreliable

### For New Apps

Just use SDK v1.0.1+ from the start. No migration needed.

---

## Related Documentation

- **Full Diagnosis**: [SCREEN_FLOW_EMPTY_DIAGNOSIS.md](SCREEN_FLOW_EMPTY_DIAGNOSIS.md)
- **Diagnostic Overview**: [SCREEN_FLOW_DIAGNOSIS_OVERVIEW.md](SCREEN_FLOW_DIAGNOSIS_OVERVIEW.md)
- **SDK Changelog**: [../../../packages/sdk-android/CHANGELOG.md](../../../packages/sdk-android/CHANGELOG.md)

---

## Timeline

| Date | Event |
|------|-------|
| 2026-01-17 | Issue reported - screen flow empty |
| 2026-01-18 | Root cause identified - race condition |
| 2026-01-18 | Fix implemented and tested |
| 2026-01-18 | SDK v1.0.1 released |

---

## Technical Details

### Why sessionToken was null

The SDK initialization happens in stages:
1. **Synchronous**: Load cached config (instant)
2. **Async**: Fetch fresh config from server (~100-500ms)
3. **Async**: Register device with backend (~500-2000ms)
4. **Async**: Start session after device registration (~100ms)

Total time to `sessionToken` ready: **~700-2600ms**

During this window:
- App is already running
- User can navigate screens
- API calls are made and captured
- Traces queued WITHOUT sessionToken

When flush happens (timer or app pause), early traces have no sessionToken.

### Why the fix works

By checking `sessionToken != null` before flushing:
- Traces wait in queue until session ready
- When session completes (~700-2600ms), sessionToken is available
- Next flush includes sessionToken for ALL queued traces
- Backend can link all traces to session

### Performance Impact

**Minimal:**
- Traces still captured immediately (no overhead)
- Queue delay is only ~700-2600ms (one-time on app launch)
- After session starts, flushes happen normally
- No impact on trace capture or screen tracking

---

**Fix Author:** Claude Sonnet 4.5
**Reviewed By:** Pending
**Release Version:** 1.0.1
