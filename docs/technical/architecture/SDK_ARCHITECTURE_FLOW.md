# DevBridge SDK Architecture & Flow Diagrams

This document explains how the DevBridge SDK initializes, fetches configuration, and starts tracking based on the actual code implementation.

---

## Table of Contents

1. [SDK Initialization Flow](#1-sdk-initialization-flow)
2. [Configuration Fetching Flow](#2-configuration-fetching-flow)
3. [Device Registration Flow](#3-device-registration-flow)
4. [API Tracking Flow](#4-api-tracking-flow)
5. [Logs Flow](#5-logs-flow)
6. [Crashes Flow](#6-crashes-flow)
7. [Business Configuration Flow](#7-business-configuration-flow)
8. [Localization Flow](#8-localization-flow)
9. [Session Tracking Flow](#9-session-tracking-flow)
10. [Complete Architecture Overview](#10-complete-architecture-overview)

---

## 1. SDK Initialization Flow

### Overview
When the mobile app starts, the SDK calls `/api/sdk-init` to fetch all configuration in a single request.

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Mobile App Startup                              │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  DevBridge.init(apiKey: "xxx")                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ 1. Store API Key                                              │  │
│  │ 2. Get Device ID (Android ID / iOS IDFV)                     │  │
│  │ 3. Generate Device Code (if not exists)                      │  │
│  │ 4. Call /api/sdk-init                                        │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            │ GET /api/sdk-init
                            │ Headers: X-API-Key: xxx
                            │ Query: ?deviceId=abc123
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│              Backend: /api/sdk-init/route.ts                       │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ 1. Validate API Key                                          │  │
│  │ 2. Validate Subscription                                      │  │
│  │ 3. Fetch ALL data in PARALLEL:                                │  │
│  │    • FeatureFlags (sdkEnabled, apiTracking, etc.)           │  │
│  │    • SdkSettings (trackingMode, capture settings)            │  │
│  │    • BusinessConfig (enabled configs)                        │  │
│  │    • ApiConfigs (per-endpoint settings)                       │  │
│  │    • Device (if deviceId provided)                           │  │
│  │ 4. Compute deviceConfig.trackingEnabled:                      │  │
│  │    • Check sdkEnabled (master kill switch)                   │  │
│  │    • Check trackingMode:                                     │  │
│  │      - "all" → trackingEnabled = true                        │  │
│  │      - "debug_only" → check device.debugModeEnabled          │  │
│  │      - "none" → trackingEnabled = false                      │  │
│  │ 5. Generate ETag for caching                                 │  │
│  │ 6. Return combined response                                   │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            │ Response (200 OK)
                            │ {
                            │   featureFlags: {...},
                            │   sdkSettings: {...},
                            │   businessConfig: {...},
                            │   deviceConfig: {
                            │     trackingEnabled: true/false,
                            │     debugModeEnabled: true/false
                            │   },
                            │   timestamp: "..."
                            │ }
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│              SDK: Process Response                                 │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ 1. Store featureFlags                                        │  │
│  │ 2. Store sdkSettings                                         │  │
│  │ 3. Store businessConfig                                      │  │
│  │ 4. Store deviceConfig.trackingEnabled                         │  │
│  │ 5. Check if trackingEnabled:                                  │  │
│  │    • If false → Stop here (no tracking)                      │  │
│  │    • If true → Continue initialization                       │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│              SDK: Start Tracking (if enabled)                       │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ 1. Register Device (POST /api/devices)                       │  │
│  │ 2. Start Session (POST /api/sessions)                        │  │
│  │ 3. Setup Interceptors:                                        │  │
│  │    • Dio Interceptor (for API tracking)                       │  │
│  │    • Route Observer (for screen tracking)                     │  │
│  │    • Error Handler (for crash reporting)                      │  │
│  │ 4. Setup Periodic Tasks:                                      │  │
│  │    • Flush logs queue (every flushIntervalSeconds)            │  │
│  │    • Flush traces queue (every flushIntervalSeconds)          │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Code Reference

**SDK Init Endpoint**: `src/app/api/sdk-init/route.ts`
- Fetches all config in parallel using `Promise.all()`
- Computes `trackingEnabled` based on feature flags and tracking mode
- Returns ETag for caching (304 Not Modified support)

**Key Logic**:
```typescript
// Compute trackingEnabled
let trackingEnabled = effectiveFlags.sdkEnabled

if (trackingEnabled) {
  if (trackingMode === 'none') {
    trackingEnabled = false
  } else if (trackingMode === 'debug_only') {
    trackingEnabled = !!effectiveDebugMode
  }
  // trackingMode === 'all' → keep true
}
```

---

## 2. Configuration Fetching Flow

### Overview
The SDK fetches configuration once on initialization. Subsequent requests use ETag for conditional requests (304 Not Modified).

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│              SDK: Fetch Configuration                                │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  First Request (No Cache)                                           │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ GET /api/sdk-init                                              │  │
│  │ Headers:                                                       │  │
│  │   X-API-Key: xxx                                               │  │
│  │   (No If-None-Match header)                                    │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Backend: Generate Response                                         │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ 1. Fetch config from database                                  │  │
│  │ 2. Generate ETag (MD5 hash of config)                         │  │
│  │ 3. Return 200 OK with:                                         │  │
│  │    • Config data                                               │  │
│  │    • ETag header                                               │  │
│  │    • Cache-Control: public, s-maxage=60, stale-while-revalidate=300 │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            │ Response (200 OK)
                            │ Headers:
                            │   ETag: "abc123..."
                            │   Cache-Control: public, s-maxage=60
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  SDK: Store ETag                                                    │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ 1. Save ETag to SharedPreferences                             │  │
│  │ 2. Save config data                                            │  │
│  │ 3. Use config immediately                                      │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            │ (After 60 seconds or on next app start)
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Subsequent Request (With Cache)                                    │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ GET /api/sdk-init                                              │  │
│  │ Headers:                                                       │  │
│  │   X-API-Key: xxx                                               │  │
│  │   If-None-Match: "abc123..." (stored ETag)                    │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Backend: Check ETag                                                │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ 1. Fetch config from database                                  │  │
│  │ 2. Generate new ETag                                           │  │
│  │ 3. Compare with If-None-Match                                  │  │
│  │    • If match → Return 304 Not Modified (no body)            │  │
│  │    • If different → Return 200 OK with new config            │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                            │
                    ┌───────┴───────┐
                    │               │
            ETag Match      ETag Different
                    │               │
                    ▼               ▼
         ┌──────────────┐   ┌──────────────┐
         │ 304 Not      │   │ 200 OK       │
         │ Modified     │   │ New Config   │
         │ (No body)    │   │ + New ETag   │
         └──────────────┘   └──────────────┘
```

### Performance Benefits

- **First Request**: ~300-500ms (database queries)
- **Subsequent Requests** (if unchanged): ~50ms (304 Not Modified)
- **Cache Duration**: 60 seconds (edge cache)
- **Stale-While-Revalidate**: 5 minutes (serve stale while fetching new)

---

## 3. Device Registration Flow

### Overview
After initialization, the SDK registers the device with the backend.

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│  SDK: Register Device                                               │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ Check: deviceTracking feature flag                            │  │
│  │ Check: deviceConfig.trackingEnabled                           │  │
│  │ If both enabled → Proceed                                     │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  POST /api/devices                                                  │
│  Headers:                                                           │
│    X-API-Key: xxx                                                   │
│  Body:                                                              │
│    {                                                                │
│      deviceId: "android-abc123",                                    │
│      platform: "android",                                           │
│      osVersion: "14.0",                                             │
│      appVersion: "2.1.0",                                           │
│      model: "Pixel 8",                                              │
│      deviceCode: "ABC123",                                          │
│      ... (metadata, battery, storage, etc.)                         │
│    }                                                                │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Backend: /api/devices/route.ts                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ 1. Validate API Key                                            │  │
│  │ 2. Validate Subscription (deviceTracking feature)             │  │
│  │ 3. Check Throttling (quota enforcement)                       │  │
│  │ 4. Check if device exists:                                     │  │
│  │    • If exists → Update device                                │  │
│  │    • If new → Create device (check quota)                     │  │
│  │ 5. Return device ID                                            │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            │ Response (200 OK)
                            │ { id: "device-123", ... }
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  SDK: Store Device ID                                               │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ 1. Save device ID to memory                                    │  │
│  │ 2. Use device ID for all subsequent requests                 │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Quota Enforcement

- **Check**: `checkThrottling(userId, 'devices')`
- **If quota exceeded**: Return `429 Too Many Requests` with `Retry-After` header
- **SDK Behavior**: Retry after `Retry-After` seconds or show error to user

---

## 4. API Tracking Flow

### Overview
The SDK intercepts all HTTP requests and sends traces to the backend.

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│  App: Make HTTP Request                                             │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ dio.get('/api/users')                                          │  │
│  │ or                                                             │  │
│  │ http.get('/api/users')                                         │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  SDK: Dio Interceptor (onRequest)                                  │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ 1. Check: apiTracking feature flag                            │  │
│  │ 2. Check: deviceConfig.trackingEnabled                        │  │
│  │ 3. If enabled:                                                 │  │
│  │    • Capture request: URL, method, headers, body              │  │
│  │    • Store in traces queue                                    │  │
│  │ 4. Continue request                                            │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            │ (Request continues to actual API)
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  SDK: Dio Interceptor (onResponse/onError)                         │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ 1. Capture response: status, headers, body                    │  │
│  │ 2. Calculate duration                                         │  │
│  │ 3. Update trace in queue with response data                   │  │
│  │ 4. Check queue size:                                          │  │
│  │    • If >= maxTraceQueueSize → Flush immediately             │  │
│  │    • Otherwise → Wait for flush interval                     │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            │ (Periodic flush or immediate flush)
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  SDK: Flush Traces Queue                                            │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ 1. Batch traces (if enableBatching)                            │  │
│  │ 2. POST /api/traces (single or batch)                         │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            │ POST /api/traces
                            │ Body: [{ url, method, status, ... }, ...]
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Backend: /api/traces/route.ts                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ 1. Validate API Key                                            │  │
│  │ 2. Validate Subscription (apiTracking feature)                │  │
│  │ 3. Check Throttling (quota enforcement)                        │  │
│  │ 4. Check isTrackingEnabled(projectId, deviceId):               │  │
│  │    • If false → Return 200 OK (silently reject)              │  │
│  │    • If true → Process traces                                │  │
│  │ 5. For each trace:                                            │  │
│  │    • Calculate cost (from ApiConfig)                          │  │
│  │    • Sanitize sensitive data (if enabled)                     │  │
│  │    • Store in database                                        │  │
│  │ 6. Return success                                             │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Tracking Mode Logic

**Backend Check** (`isTrackingEnabled`):
```typescript
// Check master kill switch
if (!sdkEnabled) return false

// Check feature flag
if (!apiTracking) return false

// Check tracking mode
if (trackingMode === 'none') return false
if (trackingMode === 'debug_only') {
  return device?.debugModeEnabled && !isExpired
}
// trackingMode === 'all'
return true
```

### Batching & Queue Management

- **Queue Size**: `maxTraceQueueSize` (default: 50)
- **Flush Interval**: `flushIntervalSeconds` (default: 30s)
- **Batching**: Enabled by default (`enableBatching: true`)

---

## 5. Logs Flow

### Overview
The SDK captures logs and sends them to the backend.

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│  App: Log Statement                                                 │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ DevBridgeLogger.d('Service', 'Message')                       │  │
│  │ or                                                             │  │
│  │ print('Message') (if capturePrintStatements enabled)          │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  SDK: Log Handler                                                   │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ 1. Check: logging feature flag                                │  │
│  │ 2. Check: deviceConfig.trackingEnabled                        │  │
│  │ 3. Check: minLogLevel (filter by level)                       │  │
│  │ 4. If enabled:                                                 │  │
│  │    • Create log entry: level, tag, message, screen, etc.     │  │
│  │    • Add to logs queue                                        │  │
│  │ 5. Check queue size:                                           │  │
│  │    • If >= maxLogQueueSize → Flush immediately               │  │
│  │    • Otherwise → Wait for flush interval                     │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            │ (Periodic flush or immediate flush)
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  SDK: Flush Logs Queue                                              │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ 1. Batch logs (if enableBatching)                              │  │
│  │ 2. POST /api/logs (single or batch)                           │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            │ POST /api/logs
                            │ Body: [{ level, tag, message, ... }, ...]
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Backend: /api/logs/route.ts                                        │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ 1. Validate API Key                                            │  │
│  │ 2. Validate Subscription (logging feature)                    │  │
│  │ 3. Check Throttling (quota enforcement)                       │  │
│  │ 4. Check isTrackingEnabled(projectId, deviceId):              │  │
│  │    • If false → Return 200 OK (silently reject)              │  │
│  │    • If true → Process logs                                  │  │
│  │ 5. For each log:                                              │  │
│  │    • Store in database                                        │  │
│  │ 6. Return success                                             │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Log Levels

- **minLogLevel**: Controls which logs are captured
- **Levels**: `verbose` < `debug` < `info` < `warn` < `error`
- **Example**: If `minLogLevel: 'info'`, only `info`, `warn`, and `error` are captured

---

## 6. Crashes Flow

### Overview
The SDK captures crashes and sends them to the backend.

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│  App: Unhandled Exception                                           │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ FlutterError.onError                                           │  │
│  │ or                                                             │  │
│  │ try/catch block                                                │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  SDK: Crash Handler                                                 │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ 1. Check: crashReporting feature flag                         │  │
│  │ 2. Check: deviceConfig.trackingEnabled                        │  │
│  │ 3. If enabled:                                                 │  │
│  │    • Capture crash: message, stackTrace, metadata            │  │
│  │    • POST /api/crashes (immediate, no queue)                 │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            │ POST /api/crashes
                            │ Body: { message, stackTrace, ... }
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Backend: /api/crashes/route.ts                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ 1. Validate API Key                                            │  │
│  │ 2. Validate Subscription (crashReporting feature)             │  │
│  │ 3. Check Throttling (quota enforcement)                       │  │
│  │ 4. Store crash in database                                     │  │
│  │ 5. Return success                                              │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Crash Handling

- **Immediate Send**: Crashes are sent immediately (not queued)
- **No Batching**: Critical data, must be sent right away
- **Offline Support**: If offline, queue for retry when online

---

## 7. Business Configuration Flow

### Overview
The SDK fetches business configuration from the backend.

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│  SDK: Fetch Business Config                                         │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ 1. Check: businessConfig feature flag                          │  │
│  │ 2. Check cache:                                                │  │
│  │    • If cached and fresh → Use cache                          │  │
│  │    • If stale or missing → Fetch from server                  │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            │ GET /api/business-config
                            │ Headers: X-API-Key: xxx
                            │ Query: ?category=app_blocking
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Backend: /api/business-config/route.ts                            │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ 1. Validate API Key                                            │  │
│  │ 2. Validate Subscription (businessConfig feature)             │  │
│  │ 3. Fetch enabled configs from database                        │  │
│  │ 4. Evaluate targeting rules (if any)                         │  │
│  │ 5. Return configs:                                             │  │
│  │    {                                                           │  │
│  │      configs: { key: value, ... },                            │  │
│  │      meta: { key: { type, category, version }, ... }         │  │
│  │    }                                                           │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            │ Response (200 OK)
                            │ { configs: {...}, meta: {...} }
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  SDK: Store & Use Config                                            │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ 1. Save to cache (SharedPreferences)                          │  │
│  │ 2. Store in memory                                             │  │
│  │ 3. App can access:                                             │  │
│  │    • getString('key')                                          │  │
│  │    • getInt('key')                                             │  │
│  │    • getBool('key')                                            │  │
│  │    • getJson('key')                                            │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Caching Strategy

- **Cache Duration**: 1 hour (configurable)
- **Cache Key**: `devbridge_config_cache`
- **Force Refresh**: `refresh()` method forces new fetch

### Config Types

- **string**: Text values
- **integer**: Numbers
- **boolean**: True/false
- **decimal**: Floating point numbers
- **json**: Complex objects
- **image**: Image URLs

---

## 8. Localization Flow

### Overview
The SDK fetches translations for the app's current language.

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│  SDK: Fetch Localization                                            │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ 1. Check: localization feature flag                            │  │
│  │ 2. Get current language code (from device locale)             │  │
│  │ 3. Check cache:                                                │  │
│  │    • If cached and fresh → Use cache                          │  │
│  │    • If stale or missing → Fetch from server                  │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            │ GET /api/localization/translations
                            │ Headers: X-API-Key: xxx
                            │ Query: ?projectId=xxx&lang=en
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Backend: /api/localization/translations/route.ts                  │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ 1. Validate API Key                                            │  │
│  │ 2. Validate Subscription (localization feature)               │  │
│  │ 3. Fetch translations from database:                          │  │
│  │    • Get Language by code                                      │  │
│  │    • Get all Translations for language                        │  │
│  │ 4. Return translations:                                        │  │
│  │    {                                                           │  │
│  │      translations: { key: value, ... }                        │  │
│  │    }                                                           │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            │ Response (200 OK)
                            │ { translations: { "welcome.title": "Hello", ... } }
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  SDK: Store & Use Translations                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ 1. Save to cache (SharedPreferences)                           │  │
│  │ 2. Store in memory                                             │  │
│  │ 3. App can access:                                             │  │
│  │    • translate('welcome.title') → "Hello"                    │  │
│  │    • Supports RTL languages                                    │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### RTL Support

- **RTL Detection**: Based on language code (e.g., `ar`, `he`, `fa`)
- **Text Direction**: SDK sets `dir="rtl"` for RTL languages
- **UI Adaptation**: App should respect text direction

---

## 9. Session Tracking Flow

### Overview
The SDK tracks user sessions (app opens/closes, screen views).

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│  App: Opens                                                          │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  SDK: Start Session                                                  │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ 1. Check: sessionTracking feature flag                        │  │
│  │ 2. Check: deviceConfig.trackingEnabled                         │  │
│  │ 3. Generate sessionToken (UUID)                                │  │
│  │ 4. POST /api/sessions                                          │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            │ POST /api/sessions
                            │ Body: { deviceId, sessionToken, startTime, ... }
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Backend: /api/sessions/route.ts                                    │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ 1. Validate API Key                                            │  │
│  │ 2. Validate Subscription (sessionTracking feature)            │  │
│  │ 3. Create session in database                                  │  │
│  │ 4. Return session ID                                           │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            │ (User navigates screens)
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  SDK: Track Screen View                                             │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ 1. Route Observer detects screen change                        │  │
│  │ 2. Update currentScreen in memory                              │  │
│  │ 3. (Optional) Send screen view event                           │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            │ (App closes or goes to background)
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  SDK: End Session                                                    │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ 1. PUT /api/sessions                                           │  │
│  │ 2. Send: endTime, duration, screenCount, etc.                 │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Session Data

- **Start**: `startTime`, `deviceId`, `sessionToken`
- **During**: Screen views, API calls, logs (linked via `sessionToken`)
- **End**: `endTime`, `duration`, `screenCount`, `metrics`

---

## 10. Complete Architecture Overview

### High-Level Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Mobile App (Flutter SDK)                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │   Init       │  │   Tracking   │  │   Config     │            │
│  │              │  │              │  │              │            │
│  │ • SDK Init   │  │ • API Traces │  │ • Business   │            │
│  │ • Device Reg │  │ • Logs       │  │   Config      │            │
│  │ • Session    │  │ • Crashes    │  │ • Localization│            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS
                            │ X-API-Key Header
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│              DevBridge Backend (Next.js API Routes)                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │   Auth       │  │   Validation │  │   Storage    │            │
│  │              │  │              │  │              │            │
│  │ • API Key    │  │ • Feature    │  │ • Devices    │            │
│  │ • JWT Token  │  │   Flags      │  │ • Traces     │            │
│  │              │  │ • Quota      │  │ • Logs       │            │
│  │              │  │ • Tracking   │  │ • Crashes    │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            │ Prisma ORM
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│              PostgreSQL Database (Supabase)                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  • Projects                                                         │
│  • FeatureFlags                                                     │
│  • SdkSettings                                                      │
│  • Devices                                                          │
│  • Sessions                                                         │
│  • ApiTraces                                                        │
│  • Logs                                                             │
│  • Crashes                                                          │
│  • BusinessConfig                                                   │
│  • Languages / Translations                                         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Key Components

1. **SDK Initialization** (`/api/sdk-init`)
   - Single endpoint for all config
   - Returns: featureFlags, sdkSettings, businessConfig, deviceConfig
   - Uses ETag for caching

2. **Device Registration** (`/api/devices`)
   - Registers device on first launch
   - Updates device on subsequent launches
   - Quota enforcement

3. **API Tracking** (`/api/traces`)
   - Intercepts HTTP requests
   - Batches and queues traces
   - Quota enforcement

4. **Logs** (`/api/logs`)
   - Captures app logs
   - Batches and queues logs
   - Quota enforcement

5. **Crashes** (`/api/crashes`)
   - Captures unhandled exceptions
   - Immediate send (no queue)
   - Quota enforcement

6. **Business Config** (`/api/business-config`)
   - Fetches remote configs
   - Client-side caching
   - Targeting rules support

7. **Localization** (`/api/localization/translations`)
   - Fetches translations
   - Client-side caching
   - RTL support

8. **Sessions** (`/api/sessions`)
   - Tracks app sessions
   - Links all events to session
   - Session timeline view

### Tracking Mode Logic

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Tracking Mode Decision Tree                      │
└─────────────────────────────────────────────────────────────────────┘

                    SDK Initialization
                            │
                            ▼
                    sdkEnabled?
                            │
                    ┌───────┴───────┐
                    │               │
                  false            true
                    │               │
                    ▼               ▼
              No Tracking    apiTracking?
                                    │
                            ┌───────┴───────┐
                            │               │
                          false            true
                            │               │
                            ▼               ▼
                      No Tracking    trackingMode?
                                            │
                                    ┌───────┴───────────┐
                                    │                   │
                                  "none"            "debug_only"
                                    │                   │
                                    ▼                   ▼
                              No Tracking    debugModeEnabled?
                                                    │
                                            ┌───────┴───────┐
                                            │               │
                                          false            true
                                            │               │
                                            ▼               ▼
                                      No Tracking    Track Everything
                                                          │
                                                          ▼
                                                    "all" (default)
                                                          │
                                                          ▼
                                                    Track Everything
```

### Feature Flag Hierarchy

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Feature Flag Hierarchy                          │
└─────────────────────────────────────────────────────────────────────┘

Level 1: Master Kill Switch
    │
    └── sdkEnabled = false → ENTIRE SDK DISABLED
    └── sdkEnabled = true
        │
        └── Level 2: Feature Flags
            │
            ├── apiTracking = false → No API tracking
            ├── logging = false → No logs
            ├── crashReporting = false → No crashes
            ├── deviceTracking = false → No device registration
            ├── sessionTracking = false → No sessions
            ├── businessConfig = false → No config fetching
            └── localization = false → No translations
```

---

## Summary

### Initialization Sequence

1. **App Starts** → `DevBridge.init(apiKey)`
2. **Fetch Config** → `GET /api/sdk-init`
3. **Check Tracking** → `deviceConfig.trackingEnabled`
4. **If Enabled**:
   - Register Device → `POST /api/devices`
   - Start Session → `POST /api/sessions`
   - Setup Interceptors (API, Screen, Error)
   - Start Periodic Flush Tasks

### Tracking Flow

1. **Event Occurs** (API call, log, crash, screen view)
2. **Check Feature Flag** (apiTracking, logging, etc.)
3. **Check Tracking Enabled** (deviceConfig.trackingEnabled)
4. **If Both Enabled**:
   - Capture event
   - Add to queue (or send immediately for crashes)
   - Flush queue periodically or when full

### Configuration Flow

1. **Fetch on Init** → `/api/sdk-init` (includes business config)
2. **Cache Locally** → SharedPreferences
3. **Use ETag** → Conditional requests (304 Not Modified)
4. **Refresh** → When cache expires or manually

This architecture ensures:
- ✅ **Performance**: Single init request, caching, batching
- ✅ **Cost Efficiency**: Quota enforcement, conditional requests
- ✅ **Flexibility**: Feature flags, tracking modes, per-endpoint config
- ✅ **Reliability**: Offline support, retry logic, error handling

