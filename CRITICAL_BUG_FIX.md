# Critical Bug Fix: Device ID Mismatch in API Endpoints

**Date:** 2026-01-18
**Severity:** 🔴 **CRITICAL**
**Impact:** API traces and logs were not being linked to correct devices

## Root Cause

The SDK sends the **database device ID** (cuid format like `cmk1i8d8f001`) when creating API traces and logs, but multiple backend endpoints were querying the **platform device ID** field (which stores values like `android_3c3e...`).

This caused:
1. ❌ Device lookups to fail
2. ❌ API traces to be linked to wrong devices or no device
3. ❌ Logs to be linked to wrong devices or no device
4. ❌ Tracking mode (debug_only) to not work correctly
5. ❌ "Unknown Device" entries appearing in dashboard

## Files Fixed

### 1. `/dashboard/src/app/api/sdk-init/route.ts` ✅
**Line 220:** Changed `deviceId: deviceId` to `id: deviceId`

**Impact:** Debug mode configuration now works correctly

### 2. `/dashboard/src/app/api/traces/route.ts` ✅
**Lines 32 & 417:** Fixed two deviceId queries

**Before:**
```typescript
where: { projectId, deviceId }
```

**After:**
```typescript
where: { projectId, id: deviceId } // Query by database ID
```

**Impact:** API traces now correctly link to devices

### 3. `/dashboard/src/app/api/logs/route.ts` ✅
**Lines 31 & 155:** Fixed two deviceId queries

**Impact:** Logs now correctly link to devices

## Testing Required

After deploying these fixes:

1. **Delete all devices** from project
2. **Fresh app install**
3. **Verify:**
   - ✅ Only ONE device appears (no "Unknown Device")
   - ✅ Device has proper platform info (android, not unknown)
   - ✅ Device code is format `XXXX-XXXX` (not cuid)
   - ✅ API traces linked to correct device
   - ✅ Logs linked to correct device
   - ✅ Debug mode works correctly

## Related Issues

This same pattern might exist in other endpoints. Search for:
```bash
grep -rn "where.*deviceId" dashboard/src/app/api
```

And verify each usage is correct:
- ✅ If querying Device table directly → use `id: deviceId`
- ✅ If querying via foreign key (Session, etc.) → use `deviceId: deviceId` (already correct)

## Prevention

Added comments in fixed files:
```typescript
// Note: SDK sends database device ID (cuid), not platform device ID
// Query by database ID, not platform deviceId field
```

## Deploy Checklist

- [x] Fix sdk-init endpoint
- [x] Fix traces endpoint (2 locations)
- [x] Fix logs endpoint (2 locations)
- [ ] Deploy to production
- [ ] Clear test data
- [ ] Verify with fresh install
- [ ] Monitor for "Unknown Device" entries

## Expected Behavior After Fix

### Device Registration
- Device ID: `android_<ANDROID_SECURE_ID>` (platform ID)
- Database ID: `cmk...` (cuid)
- Device Code: `XXXX-XXXX` (human-readable)
- Platform: `android`
- Proper OS version, model, manufacturer

### API Traces
- Linked to correct device using database ID
- Visible in device detail page
- Correctly filtered by debug mode

### Logs
- Linked to correct device using database ID
- Visible in device logs page
- Correctly filtered by debug mode

---

**CRITICAL:** The "Unknown Device" issue was a symptom of this bug. API traces were being created with deviceId=NULL because the device lookup failed, which may have triggered automatic device creation somewhere in the flow.
