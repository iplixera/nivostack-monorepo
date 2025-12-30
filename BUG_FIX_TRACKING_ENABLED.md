# 🐛 Bug Fix: API Traces & Logs Captured Despite Feature Flags Disabled

**Date:** December 21, 2025  
**Severity:** HIGH  
**Status:** ✅ FIXED

---

## Problem

API traces and logs were being captured **even when feature flags were disabled** in the dashboard settings.

**User Report:**
> "I disabled device logs in settings, but I can still see API traces and logs being captured"

---

## Root Cause Analysis

### Investigation Trail

1. ✅ **Flutter SDK Code** - Correctly checks feature flags:
   - `log()` method checks `_featureFlags.logging` (line 1193)
   - `trackApiTrace()` method checks `_featureFlags.apiTracking` (line 1094)
   - Both also check `isTrackingEnabled` property (lines 1049, 1093)

2. ✅ **Backend API Endpoints** - No validation issues (they just accept data sent by SDK)

3. ✅ **Dashboard Settings UI** - Updates save correctly to database

4. ❌ **`/api/sdk-init` Endpoint** - **FOUND THE BUG!**

### The Bug

**File:** `src/app/api/sdk-init/route.ts`  
**Line:** 228 (before fix)

```typescript
const deviceConfig = device ? {
  deviceId: device.id,
  deviceCode: device.deviceCode,
  debugModeEnabled: effectiveDebugMode,
  debugModeExpiresAt: device.debugModeExpiresAt?.toISOString() || null,
  trackingEnabled: true, // ❌ ALWAYS TRUE!
} : {
  deviceCode: null,
  debugModeEnabled: false,
  debugModeExpiresAt: null,
  trackingEnabled: true, // ❌ ALWAYS TRUE!
}
```

**The server was ALWAYS returning `trackingEnabled: true` regardless of:**
- Feature flag settings (`logging`, `apiTracking`, `sdkEnabled`)
- Tracking mode (`all`, `debug_only`, `none`)
- Debug mode status

**Impact:**
- SDK reads `deviceConfig.trackingEnabled` from server
- SDK checks `if (!isTrackingEnabled) return;` before tracking
- Since server always returned `true`, SDK always tracked

---

## The Fix

### Changes Made

**File:** `src/app/api/sdk-init/route.ts`

#### 1. Include `trackingMode` in SDK Settings Query (line 136)

```typescript
// SDK Settings (including trackingMode)
prisma.sdkSettings.findUnique({
  where: { projectId },
  select: {
    trackingMode: true,  // ✅ Added
    captureRequestBodies: true,
    // ... rest of fields
  }
}),
```

#### 2. Compute `trackingEnabled` Based on Rules (lines 214-256)

```typescript
// Compute device config
const effectiveSettings = sdkSettings || DEFAULT_SDK_SETTINGS
const effectiveFlags = featureFlags || DEFAULT_FEATURE_FLAGS

// Get tracking mode (defaults to 'all' if not set)
const trackingMode = effectiveSettings.trackingMode || 'all'

// Check if debug mode is expired
const now = new Date()
const isDebugExpired = device?.debugModeExpiresAt && device.debugModeExpiresAt < now
const effectiveDebugMode = device?.debugModeEnabled && !isDebugExpired

// Compute trackingEnabled based on:
// 1. SDK enabled flag (master kill switch)
// 2. Tracking mode setting
// 3. Device debug mode status
let trackingEnabled = effectiveFlags.sdkEnabled

if (trackingEnabled) {
  // Check tracking mode
  if (trackingMode === 'none') {
    trackingEnabled = false
  } else if (trackingMode === 'debug_only') {
    // Only track if device has debug mode enabled
    trackingEnabled = !!effectiveDebugMode
  }
  // trackingMode === 'all' -> keep trackingEnabled = true
}

const deviceConfig = device ? {
  deviceId: device.id,
  deviceCode: device.deviceCode,
  debugModeEnabled: effectiveDebugMode,
  debugModeExpiresAt: device.debugModeExpiresAt?.toISOString() || null,
  trackingEnabled, // ✅ Now computed correctly
} : {
  deviceCode: null,
  debugModeEnabled: false,
  debugModeExpiresAt: null,
  trackingEnabled, // ✅ Now computed correctly
}
```

---

## Tracking Logic Hierarchy

The new logic implements the correct hierarchy:

```
┌─────────────────────────────────────────────────┐
│ 1. SDK Enabled Flag (Master Kill Switch)       │
│    If sdkEnabled = false → trackingEnabled = false │
└────────────────┬────────────────────────────────┘
                 │
                 ↓ sdkEnabled = true
┌─────────────────────────────────────────────────┐
│ 2. Tracking Mode (SDK Settings)                │
│    - 'all' → Track all devices                 │
│    - 'debug_only' → Track only debug devices   │
│    - 'none' → Track no devices                 │
└────────────────┬────────────────────────────────┘
                 │
                 ↓ (if debug_only)
┌─────────────────────────────────────────────────┐
│ 3. Device Debug Mode                           │
│    debugModeEnabled AND not expired            │
│    → trackingEnabled = true/false              │
└─────────────────────────────────────────────────┘
```

---

## Testing

### Manual Test Scenarios

#### Scenario 1: Disable SDK Completely
1. Dashboard → Settings → Feature Flags
2. Toggle `sdkEnabled` to **OFF**
3. **Expected:** `trackingEnabled = false`
4. **SDK behavior:** No API traces or logs sent

#### Scenario 2: Set Tracking Mode to "None"
1. Dashboard → Settings → SDK Settings
2. Set "Tracking Mode" to **None**
3. **Expected:** `trackingEnabled = false`
4. **SDK behavior:** No API traces or logs sent

#### Scenario 3: Set Tracking Mode to "Debug Only"
1. Dashboard → Settings → SDK Settings
2. Set "Tracking Mode" to **Debug Devices Only**
3. Device A: Debug mode **OFF** → `trackingEnabled = false`
4. Device B: Debug mode **ON** → `trackingEnabled = true`

#### Scenario 4: Disable Individual Features
1. Dashboard → Settings → Feature Flags
2. Toggle `logging` to **OFF**
3. **Expected:** SDK still gets `trackingEnabled = true` (unless tracking mode is "none")
4. **SDK behavior:** SDK's `log()` method checks `_featureFlags.logging` and returns early

**Note:** Individual feature flags (`logging`, `apiTracking`) are checked **in the SDK code**, not server-side. The server only controls the global `trackingEnabled` flag based on `sdkEnabled` and tracking mode.

---

## Deployment

### Steps

1. ✅ Fix applied to `src/app/api/sdk-init/route.ts`
2. ⚠️ Deploy to production (Vercel)
3. ⚠️ Users need to **restart their apps** to fetch new config
4. ⚠️ Clear config cache if using client-side caching

### Verification

After deployment, verify with:

```bash
# Test the endpoint directly
curl -H "X-API-Key: YOUR_API_KEY" \
  "https://devbridge-eta.vercel.app/api/sdk-init?deviceId=DEVICE_ID"

# Check response
{
  "featureFlags": {
    "sdkEnabled": true,
    ...
  },
  "deviceConfig": {
    "trackingEnabled": true/false  // ✅ Should reflect actual settings
  }
}
```

---

## Related Files

- `src/app/api/sdk-init/route.ts` - Fixed endpoint
- `packages/devbridge_sdk/lib/src/devbridge.dart` - SDK tracking logic (lines 1046-1094, 1180-1236)
- `packages/devbridge_sdk/lib/src/models/device_config.dart` - DeviceConfig model
- `packages/devbridge_sdk/lib/src/dio_interceptor.dart` - Dio interceptor (calls trackApiTrace)

---

## Lessons Learned

1. **Always validate assumptions** - The comment "SDK will handle trackingMode logic" was incorrect
2. **Backend controls global tracking** - Server should compute `trackingEnabled` based on settings
3. **SDK controls feature-specific logic** - SDK checks individual feature flags (`logging`, `apiTracking`)
4. **Test the full flow** - Unit testing each component wasn't enough; integration testing would have caught this

---

## Version

- **Dashboard:** v1.4.0 → v1.4.1 (hotfix)
- **Flutter SDK:** No changes needed (already correct)

---

**Fixed by:** Claude (AI Assistant)  
**Reviewed by:** _Pending_  
**Deployed:** _Pending_

