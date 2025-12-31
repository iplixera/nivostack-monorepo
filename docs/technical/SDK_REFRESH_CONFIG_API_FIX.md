# SDK refreshConfig API Fix

## Problem

`NivoStack.instance.refreshConfig(forceRefresh: true)` was causing server errors.

## Root Cause

The `/api/sdk-init` endpoint was using `prisma.device.findUnique()` with a compound unique constraint `projectId_deviceId` that **doesn't exist** in the Prisma schema.

**Schema Reality**:
- `projectId` is **nullable** (allows devices to exist after project deletion)
- Only **indexes** exist: `@@index([projectId, deviceId])`
- **No unique constraint** on `projectId + deviceId`

**Code Issue**:
```typescript
// ❌ WRONG - This unique constraint doesn't exist!
prisma.device.findUnique({
  where: {
    projectId_deviceId: {
      projectId,
      deviceId
    }
  }
})
```

## APIs Called by refreshConfig

When `refreshConfig(forceRefresh: true)` is called, it makes these API requests:

### 1. `GET /api/sdk-init` (Control API)
- **Purpose**: Fetch SDK configuration (feature flags, settings, business config, localization)
- **Headers**: 
  - `X-API-Key`: Project API key
  - `If-None-Match`: ETag (for conditional requests, skipped if `forceRefresh: true`)
- **Query Params**:
  - `deviceId`: Platform device ID (optional)
  - `buildMode`: `'preview'` or `'production'` (optional, auto-detected by SDK)
- **Response**: Full SDK configuration with ETag

### 2. `POST /api/devices` (Ingest API) - Only if `forceRefresh: true` AND `deviceTracking` enabled
- **Purpose**: Re-register device to get latest device config (deviceCode, debugMode, etc.)
- **Headers**: `X-API-Key`: Project API key
- **Body**: Device information (platform, OS version, app version, etc.)
- **Response**: Device registration data including `deviceCode` and `deviceConfig`

## Fix

Changed `findUnique` to `findFirst` with proper filtering:

```typescript
// ✅ CORRECT - Use findFirst with where clause
prisma.device.findFirst({
  where: {
    projectId,
    deviceId,
    status: 'active' // Only get active devices
  },
  select: {
    id: true,
    deviceCode: true,
    debugModeEnabled: true,
    debugModeExpiresAt: true
  }
})
```

**Why this works**:
- `findFirst` works with indexes (doesn't require unique constraint)
- Filters by `projectId` and `deviceId` (uses the index)
- Only returns active devices (excludes soft-deleted ones)

## Additional Improvements

1. **Better Error Handling**: Added detailed error messages in development mode
2. **Status Filtering**: Only fetch active devices (excludes soft-deleted)

## Testing

After fix, `refreshConfig(forceRefresh: true)` should:
1. ✅ Successfully call `/api/sdk-init` without errors
2. ✅ Return device config if device exists
3. ✅ Handle device registration if `forceRefresh: true`
4. ✅ Return proper error messages if something fails

## Related Files

- `dashboard/src/app/api/sdk-init/route.ts` - Fixed device lookup
- `packages/sdk-flutter/lib/src/nivostack.dart` - `refreshConfig()` implementation
- `packages/sdk-flutter/lib/src/api_client.dart` - API client methods
- `prisma/schema.prisma` - Device model schema

