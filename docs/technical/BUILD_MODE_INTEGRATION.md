# Build Mode Integration - Complete

**Date**: December 31, 2024  
**Status**: ✅ Implemented

---

## Overview

The SDK now automatically fetches the appropriate build snapshot (preview for debug builds, production for release builds) based on the app's build type. This ensures that:

- **Debug builds** fetch the latest **preview build** snapshot
- **Release builds** fetch the latest **production build** snapshot
- If no active build exists, falls back to live data (backward compatible)

---

## How It Works

### 1. Build Creation (Dashboard)

1. User creates a build snapshot in the dashboard
2. Build captures current state of:
   - Business Configuration
   - Localization
3. User marks build as **Preview** (for debug/testing) or **Production** (for release)
4. Only one build can be active per mode at a time

### 2. SDK Detection

**Flutter SDK** automatically detects build type:
```dart
// SDK automatically detects build mode
final buildMode = kDebugMode ? 'preview' : 'production';
```

- `kDebugMode = true` → Debug build → `buildMode = 'preview'`
- `kDebugMode = false` → Release build → `buildMode = 'production'`

### 3. API Request

SDK sends `buildMode` parameter to API:
```
GET /api/sdk-init?buildMode=preview&deviceId=...
GET /api/sdk-init?buildMode=production&deviceId=...
```

### 4. API Response

**If active build exists:**
- Returns build snapshot data (immutable, cached)
- Includes build metadata (version, name, createdAt)
- Faster response (no database queries for configs)

**If no active build:**
- Falls back to live data (current behavior)
- Backward compatible

---

## API Endpoints Updated

### `/api/sdk-init`

**Query Parameters:**
- `buildMode` (optional): `'preview'` | `'production'`
- `deviceId` (optional): Platform device ID

**Response:**
```json
{
  "featureFlags": {...},
  "sdkSettings": {...},
  "businessConfig": {
    "configs": {...},
    "meta": {...}
  },
  "localization": {...},  // If included in build
  "deviceConfig": {...},
  "build": {              // Only if using build snapshot
    "version": 1,
    "name": "Production Release v1.0",
    "mode": "production",
    "createdAt": "2024-12-31T..."
  },
  "timestamp": "..."
}
```

### `/api/business-config`

**Query Parameters:**
- `buildMode` (optional): `'preview'` | `'production'`
- `category` (optional): Filter by category
- `key` (optional): Filter by key

**Response:**
```json
{
  "configs": {...},
  "meta": {...},
  "build": {              // Only if using build snapshot
    "version": 1,
    "name": "Production Release v1.0",
    "mode": "production",
    "createdAt": "..."
  }
}
```

### `/api/localization/translations`

**Query Parameters:**
- `buildMode` (optional): `'preview'` | `'production'`
- `lang` (optional): Language code

**Response:**
```json
{
  "translations": {...},
  "language": {...},
  "build": {              // Only if using build snapshot
    "version": 1,
    "name": "Production Release v1.0",
    "mode": "production",
    "createdAt": "..."
  }
}
```

---

## SDK Implementation

### Flutter SDK

**Automatic Build Mode Detection:**
```dart
// In nivostack.dart
import 'package:flutter/foundation.dart' show kDebugMode;

Future<void> _fetchSdkInitDataBackground() async {
  // Determine build mode automatically
  final buildMode = kDebugMode ? 'preview' : 'production';
  
  final response = await _apiClient.getSdkInit(
    etag: cached?.etag,
    deviceId: _registeredDeviceId,
    buildMode: buildMode, // Automatically sent
  );
}
```

**No Code Changes Required:**
- SDK automatically detects build type
- Automatically sends correct buildMode
- Works transparently for developers

---

## Workflow

### For Developers

1. **Create Build Snapshot** (Dashboard):
   - Go to Builds tab
   - Click "Create Build"
   - Select feature type (Business Config, Localization)
   - Build captures current state

2. **Set Build Mode** (Dashboard):
   - Select build
   - Mark as "Preview" (for debug builds)
   - OR mark as "Production" (for release builds)
   - Only one build active per mode

3. **SDK Automatically Uses Correct Build**:
   - Debug builds → Preview build snapshot
   - Release builds → Production build snapshot
   - No code changes needed!

### For Testing

**Test Preview Build:**
1. Create build snapshot
2. Mark as "Preview"
3. Run app in debug mode
4. SDK fetches preview build automatically

**Test Production Build:**
1. Create build snapshot
2. Mark as "Production"
3. Build release APK/IPA
4. SDK fetches production build automatically

---

## Benefits

### 1. **Consistent Configurations**
- Preview builds always get preview configs
- Production builds always get production configs
- No accidental config changes in production

### 2. **Faster Performance**
- Build snapshots are cached (no database queries)
- Faster API responses
- Better edge caching

### 3. **Version Control**
- Track which configs were deployed
- Rollback to previous builds
- Change tracking and history

### 4. **Backward Compatible**
- If no active build exists, uses live data
- Existing apps continue to work
- Gradual migration possible

---

## Fallback Behavior

**If no active build found:**
- API returns live data (current behavior)
- No errors thrown
- App continues to work normally

**This ensures:**
- Backward compatibility
- No breaking changes
- Gradual adoption

---

## Database Schema

**Build Model:**
```prisma
model Build {
  id                    String   @id
  projectId             String
  version               Int      // Auto-increment
  name                  String?
  mode                  String?  // "preview" | "production" | null
  isActive              Boolean  @default(false)
  businessConfigSnapshot Json?   // Cached snapshot
  localizationSnapshot   Json?   // Cached snapshot
  createdAt             DateTime
}
```

**BuildMode Model:**
```prisma
model BuildMode {
  id                String   @id
  projectId         String   @unique
  previewBuildId    String?  // Active preview build
  productionBuildId String?  // Active production build
}
```

---

## Testing Checklist

- [ ] Create preview build snapshot
- [ ] Mark build as "Preview"
- [ ] Run app in debug mode
- [ ] Verify SDK fetches preview build
- [ ] Create production build snapshot
- [ ] Mark build as "Production"
- [ ] Build release APK/IPA
- [ ] Verify SDK fetches production build
- [ ] Test fallback (no active build)
- [ ] Verify backward compatibility

---

## Files Changed

1. **`dashboard/src/app/api/sdk-init/route.ts`**
   - Added `buildMode` query parameter support
   - Integrated `getActiveBuild()` function
   - Returns build snapshot when available

2. **`dashboard/src/app/api/business-config/route.ts`**
   - Added `buildMode` query parameter support
   - Returns build snapshot when available

3. **`dashboard/src/app/api/localization/translations/route.ts`**
   - Added `buildMode` query parameter support
   - Returns build snapshot when available

4. **`packages/sdk-flutter/lib/src/nivostack.dart`**
   - Added `kDebugMode` import
   - Automatic build mode detection
   - Passes buildMode to API client

5. **`packages/sdk-flutter/lib/src/api_client.dart`**
   - Added `buildMode` parameter to `getSdkInit()`
   - Sends buildMode as query parameter

---

## Next Steps

1. ✅ **Deploy changes** to production
2. ⏳ **Test** with debug and release builds
3. ⏳ **Create builds** in dashboard
4. ⏳ **Verify** SDK fetches correct builds
5. ⏳ **Monitor** performance improvements

---

**Last Updated**: December 31, 2024  
**Status**: ✅ Ready for Testing

