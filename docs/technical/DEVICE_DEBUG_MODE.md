# Device Debug Mode - Feature Specification

## Overview

Enable selective API and session tracking for specific devices in production. This allows debugging user issues without overwhelming the system with data from all devices.

## Problem Statement

Current tracking is **project-wide** - either all devices are tracked or none. In production:
- Tracking all devices generates too much data and costs
- But we need to debug specific user issues when reported
- Need a way to enable tracking for specific devices on-demand

## Solution

### 1. Device Code (Short Identifier)

SDK generates a **short, human-readable device code** for easy identification.

**Format:** `XXXX-XXXX` (8 alphanumeric characters)
- Example: `A7B3-X9K2`, `H4ND-P8LM`
- Excludes confusing characters: `0/O`, `1/l/I`
- Generated once on first SDK init, persisted locally
- Unique enough: 32^8 = 1.1 trillion combinations

**Use case:** User reads code to support team over phone/chat.

### 2. User Association

App can associate logged-in user with their device(s).

```dart
// After login
await DevBridge.instance.setUser(
  userId: "user_123",
  email: "john@example.com",
  name: "John Doe",
);

// On logout
await DevBridge.instance.clearUser();
```

**Use case:** Support can find all devices for a specific user.

### 3. Tracking Mode

Project-level setting that controls tracking behavior:

| Mode | Description |
|------|-------------|
| `all` | Track all devices (development/testing) |
| `debug_only` | Only track devices with debug mode enabled |
| `none` | Disable all tracking |

### 4. Per-Device Debug Mode

Enable/disable debug mode for individual devices from dashboard.

- Toggle from device list in dashboard
- Optional auto-expiry (1h, 4h, 24h, or manual)
- Device picks up change on next init or periodic refresh

---

## Database Schema Changes

```prisma
model Device {
  id                String    @id @default(cuid())
  projectId         String

  // Existing fields
  deviceId          String
  platform          String
  osVersion         String?
  appVersion        String?
  model             String?
  manufacturer      String?

  // NEW: Device identification
  deviceCode        String    @unique    // "A7B3-X9K2"

  // NEW: User association
  userId            String?              // App's user ID
  userEmail         String?              // For search
  userName          String?              // Display name

  // NEW: Debug mode
  debugModeEnabled    Boolean   @default(false)
  debugModeEnabledAt  DateTime?
  debugModeExpiresAt  DateTime?           // Auto-disable
  debugModeEnabledBy  String?             // Who enabled it

  // Timestamps
  createdAt         DateTime  @default(now())
  lastSeenAt        DateTime  @default(now())

  // Relations
  project           Project   @relation(fields: [projectId], references: [id])
  sessions          Session[]

  @@unique([projectId, deviceId])
  @@index([deviceCode])
  @@index([projectId, userId])
  @@index([projectId, userEmail])
  @@index([projectId, debugModeEnabled])
}

model SdkSettings {
  // ... existing fields

  // NEW: Tracking mode
  trackingMode      String    @default("all")  // "all" | "debug_only" | "none"
}
```

---

## API Changes

### 1. Device Registration (POST /api/devices)

**Request (updated):**
```json
{
  "deviceId": "platform-device-id",
  "platform": "ios",
  "osVersion": "17.0",
  "appVersion": "1.0.0",
  "model": "iPhone 14 Pro",
  "manufacturer": "Apple",
  "deviceCode": "A7B3-X9K2"    // NEW: SDK-generated code
}
```

**Response (updated):**
```json
{
  "id": "device_cuid",
  "deviceCode": "A7B3-X9K2",
  "debugModeEnabled": false,
  "trackingEnabled": true       // Computed based on mode + debug status
}
```

### 2. User Association (PATCH /api/devices/:id/user)

**Request:**
```json
{
  "userId": "user_123",
  "email": "john@example.com",
  "name": "John Doe"
}
```

### 3. Clear User (DELETE /api/devices/:id/user)

Clears user association on logout.

### 4. Toggle Debug Mode (PATCH /api/devices/:id/debug)

**Request:**
```json
{
  "enabled": true,
  "expiresIn": "4h"    // Optional: "1h", "4h", "24h", null (manual)
}
```

### 5. SDK Init Response (GET /api/sdk-init)

**Response (updated):**
```json
{
  "featureFlags": { ... },
  "sdkSettings": {
    "trackingMode": "debug_only",
    ...
  },
  "businessConfig": { ... },
  "deviceConfig": {                    // NEW section
    "deviceCode": "A7B3-X9K2",
    "debugModeEnabled": true,
    "trackingEnabled": true,           // Computed
    "debugModeExpiresAt": "2025-12-21T18:00:00Z"
  }
}
```

---

## SDK Changes (Flutter)

### New Device Code Generator

```dart
// lib/src/device_code_generator.dart
class DeviceCodeGenerator {
  static const String _chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  static String generate() {
    final random = Random.secure();
    final code = List.generate(8, (_) => _chars[random.nextInt(_chars.length)]).join();
    return '${code.substring(0, 4)}-${code.substring(4)}';
  }
}
```

### DevBridge Class Updates

```dart
class DevBridge {
  // NEW: Device code (for display in app)
  String get deviceCode => _deviceCode;

  // NEW: Check if tracking is enabled for this device
  bool get isTrackingEnabled => _deviceConfig?.trackingEnabled ?? false;

  // NEW: Associate user with device
  Future<void> setUser({
    required String userId,
    String? email,
    String? name,
  }) async {
    await _apiClient.setDeviceUser(
      deviceId: _registeredDeviceId,
      userId: userId,
      email: email,
      name: name,
    );
    _userId = userId;
  }

  // NEW: Clear user on logout
  Future<void> clearUser() async {
    await _apiClient.clearDeviceUser(deviceId: _registeredDeviceId);
    _userId = null;
  }
}
```

### Tracking Check Updates

```dart
// Before tracking API/session
Future<void> _trackApiTrace(...) async {
  if (!_featureFlags.apiTracking) return;     // Global flag
  if (!isTrackingEnabled) return;              // NEW: Device-specific check

  // ... proceed with tracking
}
```

---

## Dashboard UI Changes

### 1. Devices List (Updated)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Devices                                              [Search: ________] │
├─────────────────────────────────────────────────────────────────────────┤
│ Filter: [All Users ▼] [Platform ▼] [Debug: Any ▼]    Showing 3 of 150  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ Code       │ Device      │ User              │ Debug    │ Last Seen    │
│ ─────────────────────────────────────────────────────────────────────── │
│ A7B3-X9K2  │ iPhone 14   │ john@example.com  │ [ON]     │ 2 min ago  ● │
│ H4ND-P8LM  │ Samsung S24 │ jane@example.com  │ [OFF]    │ 1 hour ago ○ │
│ K9M2-T5RV  │ Pixel 8     │ —                 │ [OFF]    │ 5 min ago  ● │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2. Enable Debug Mode Modal

```
┌─────────────────────────────────────────────────────────────────┐
│ Enable Debug Mode                                         [X]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Device: A7B3-X9K2 (iPhone 14 Pro)                              │
│ User: john@example.com                                          │
│                                                                 │
│ This will enable full API and session tracking for this        │
│ device. Other devices will not be affected.                    │
│                                                                 │
│ Auto-disable after:                                             │
│   ○ 1 hour                                                      │
│   ● 4 hours                                                     │
│   ○ 24 hours                                                    │
│   ○ Never (manual disable)                                      │
│                                                                 │
│                          [Cancel]  [Enable Debug Mode]          │
└─────────────────────────────────────────────────────────────────┘
```

### 3. SDK Settings - Tracking Mode

```
┌─────────────────────────────────────────────────────────────────┐
│ SDK Settings > Tracking                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ API & Session Tracking Mode                                     │
│                                                                 │
│   ○ All Devices                                                 │
│     Track all devices. Best for development/testing.            │
│                                                                 │
│   ● Debug Devices Only (Recommended for Production)             │
│     Only track devices with debug mode enabled.                 │
│     Currently: 2 devices in debug mode                          │
│                                                                 │
│   ○ None                                                        │
│     Disable all API and session tracking.                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Support Workflow

### Scenario: User Reports Bug

```
1. User: "The app crashes when I tap checkout"

2. Support: "Can you share your device code?
   Go to Settings > About > Device Code"

3. User: "It says A7B3-X9K2"

4. Support: Searches "A7B3-X9K2" in DevBridge dashboard
   → Finds device
   → Clicks "Enable Debug Mode" (4 hours)

5. Support: "Please try the checkout again"

6. User tries again → SDK tracks all API calls and session data

7. Support: Views session timeline in DevBridge
   → Sees API trace with error response
   → Identifies the bug

8. After debugging: Debug mode auto-expires (or manually disabled)
```

### Scenario: Investigate Specific User

```
1. Backend team: "User user_456 is seeing slow performance"

2. DevOps: Searches "user_456" or email in DevBridge
   → Sees all 3 devices for this user
   → Enables debug mode on most recent device

3. Collects performance data from API traces

4. Disables debug mode when done
```

---

## Implementation Tasks

### Phase 1: Database & Backend
- [ ] TASK-101: Add new fields to Device model (schema.prisma)
- [ ] TASK-102: Add trackingMode to SdkSettings model
- [ ] TASK-103: Update device registration endpoint
- [ ] TASK-104: Create user association endpoints (PATCH/DELETE)
- [ ] TASK-105: Create debug mode toggle endpoint
- [ ] TASK-106: Update sdk-init to return deviceConfig
- [ ] TASK-107: Add cron job for debug mode auto-expiry

### Phase 2: Dashboard UI
- [ ] TASK-201: Update Devices list with new columns
- [ ] TASK-202: Add search by device code, user email
- [ ] TASK-203: Add debug mode toggle button + modal
- [ ] TASK-204: Add tracking mode selector in SDK Settings
- [ ] TASK-205: Show active debug devices count

### Phase 3: Flutter SDK
- [ ] TASK-301: Implement device code generator
- [ ] TASK-302: Store/retrieve device code from SharedPreferences
- [ ] TASK-303: Send device code in registration
- [ ] TASK-304: Add setUser() and clearUser() methods
- [ ] TASK-305: Parse deviceConfig from sdk-init response
- [ ] TASK-306: Add isTrackingEnabled check before tracking
- [ ] TASK-307: Expose deviceCode getter for app display

### Phase 4: Documentation & Testing
- [ ] TASK-401: Update SDK README with new methods
- [ ] TASK-402: Add example code for app integration
- [ ] TASK-403: Test end-to-end workflow
- [ ] TASK-404: Update CHANGELOG

---

## Version Targets

| Component | Version | Changes |
|-----------|---------|---------|
| Dashboard | 1.5.0 | Device debug mode, tracking mode |
| Flutter SDK | 1.2.0 | Device code, user association, tracking check |

---

## Security Considerations

1. **Device Code**: Not sensitive, just an identifier
2. **User Data**: Only store what app explicitly sends (userId, email, name)
3. **Debug Mode Access**: Only authenticated dashboard users can toggle
4. **Auto-Expiry**: Prevents accidentally leaving debug mode on indefinitely
5. **GDPR**: User can request data deletion (clears device + associated data)

---

## Future Enhancements

- Push notification to trigger SDK config refresh
- Real-time debug mode enable (WebSocket)
- Debug mode audit log
- Sampling mode (track X% of devices)
- Device groups for bulk debug enable
