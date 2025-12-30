# DevBridge Developer Guide

This guide provides detailed technical documentation for developers integrating with DevBridge.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Configuration Hierarchy](#configuration-hierarchy)
3. [API Reference](#api-reference)
4. [SDK Integration](#sdk-integration)
5. [Feature Flags](#feature-flags)
6. [SDK Settings](#sdk-settings)
7. [Business Configuration](#business-configuration)
8. [Error Handling](#error-handling)
9. [Best Practices](#best-practices)

---

## Architecture Overview

DevBridge consists of three main components:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           DevBridge Platform                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────────────────┐  │
│  │   Mobile    │────▶│  DevBridge  │────▶│    DevBridge Dashboard  │  │
│  │    App      │     │    API      │     │       (Next.js)         │  │
│  │  + SDK      │◀────│  (Next.js)  │◀────│                         │  │
│  └─────────────┘     └─────────────┘     └─────────────────────────┘  │
│        │                    │                        │                 │
│        │                    ▼                        │                 │
│        │            ┌─────────────┐                  │                 │
│        │            │  PostgreSQL │                  │                 │
│        └───────────▶│  (Supabase) │◀─────────────────┘                 │
│                     └─────────────┘                                    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Components

| Component | Purpose | Tech Stack |
|-----------|---------|------------|
| **Dashboard** | Web UI for monitoring and configuration | Next.js 15, React, Tailwind CSS |
| **API** | REST endpoints for SDK and Dashboard | Next.js API Routes |
| **Database** | Persistent storage | PostgreSQL (Supabase), Prisma ORM |
| **Flutter SDK** | Client library for mobile apps | Dart/Flutter |

---

## Configuration Hierarchy

DevBridge uses a **three-level configuration hierarchy**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    LEVEL 1: Feature Flags                               │
│                    (Global On/Off Switches)                             │
│                                                                         │
│   sdkEnabled ──▶ Master kill switch for entire SDK                     │
│   apiTracking ──▶ Enable/disable all API tracing                       │
│   logging ──▶ Enable/disable all log sending                           │
│   ... (other feature toggles)                                           │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼ (if feature enabled)
┌─────────────────────────────────────────────────────────────────────────┐
│                    LEVEL 2: SDK Settings                                │
│                    (Global Behavior Configuration)                      │
│                                                                         │
│   captureRequestBodies ──▶ Capture request body for ALL endpoints      │
│   captureResponseBodies ──▶ Capture response body for ALL endpoints    │
│   sanitizeSensitiveData ──▶ Redact passwords, tokens globally          │
│   minLogLevel ──▶ Minimum log level to capture                         │
│   ... (other behavior settings)                                         │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼ (overrides global settings)
┌─────────────────────────────────────────────────────────────────────────┐
│                    LEVEL 3: Per-Endpoint Config                         │
│                    (Endpoint-Specific Overrides)                        │
│                                                                         │
│   /api/payments ──▶ captureRequestBody: false (sensitive)              │
│   /api/users ──▶ captureResponseBody: true                             │
│   /api/health ──▶ enableLogs: false (noisy)                            │
└─────────────────────────────────────────────────────────────────────────┘
```

### Decision Flow

```dart
// Pseudocode for SDK decision making
bool shouldCaptureRequestBody(String endpoint) {
  // Level 1: Feature Flag check
  if (!featureFlags.sdkEnabled) return false;
  if (!featureFlags.apiTracking) return false;

  // Level 3: Per-endpoint override (highest priority)
  final endpointConfig = getApiConfig(endpoint);
  if (endpointConfig != null) {
    return endpointConfig.captureRequestBody;
  }

  // Level 2: Global SDK setting (fallback)
  return sdkSettings.captureRequestBodies;
}
```

---

## API Reference

### Authentication

DevBridge supports two authentication methods:

#### 1. API Key Authentication (SDK)
```http
X-API-Key: your-project-api-key
```

#### 2. JWT Token Authentication (Dashboard)
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### SDK Endpoints

All SDK endpoints use `X-API-Key` header authentication.

#### GET /api/feature-flags
Returns feature flags for the project.

**Response:**
```json
{
  "flags": {
    "sdkEnabled": true,
    "apiTracking": true,
    "screenTracking": true,
    "crashReporting": true,
    "logging": true,
    "deviceTracking": true,
    "sessionTracking": true,
    "businessConfig": true,
    "localization": true,
    "offlineSupport": false,
    "batchEvents": true
  },
  "projectId": "clxxx..."
}
```

#### GET /api/sdk-settings
Returns SDK configuration settings.

**Response:**
```json
{
  "settings": {
    "captureRequestBodies": true,
    "captureResponseBodies": true,
    "capturePrintStatements": false,
    "sanitizeSensitiveData": true,
    "sensitiveFieldPatterns": ["password", "token", "secret"],
    "maxLogQueueSize": 100,
    "maxTraceQueueSize": 50,
    "flushIntervalSeconds": 30,
    "enableBatching": true,
    "minLogLevel": "debug",
    "verboseErrors": false
  },
  "apiConfigs": [
    {
      "endpoint": "/api/payments",
      "method": "POST",
      "enableLogs": true,
      "captureRequestBody": false,
      "captureResponseBody": true,
      "costPerRequest": 0.05
    }
  ]
}
```

#### GET /api/business-config
Returns business configuration key-value pairs.

**Response:**
```json
{
  "configs": {
    "force_update_enabled": false,
    "min_app_version": "1.2.0",
    "maintenance_enabled": false,
    "app_theme": "dark",
    "feature_x_enabled": true
  },
  "meta": {
    "force_update_enabled": {
      "type": "boolean",
      "category": "app_blocking",
      "version": 1,
      "updatedAt": "2025-12-20T10:00:00Z"
    }
  },
  "fetchedAt": "2025-12-20T12:00:00Z"
}
```

#### POST /api/devices
Register a device.

**Request:**
```json
{
  "deviceId": "unique-device-id",
  "platform": "android",
  "osVersion": "14.0",
  "appVersion": "2.1.0",
  "model": "Pixel 8",
  "manufacturer": "Google",
  "metadata": {
    "sdk": 34,
    "brand": "google"
  }
}
```

#### POST /api/sessions
Start a new session.

**Request:**
```json
{
  "deviceId": "unique-device-id",
  "sessionToken": "uuid-v4-token",
  "appVersion": "2.1.0",
  "osVersion": "14.0",
  "locale": "en_US",
  "timezone": "America/New_York",
  "entryScreen": "HomeScreen"
}
```

#### POST /api/traces
Send API traces (supports batch).

**Request:**
```json
{
  "deviceId": "unique-device-id",
  "sessionToken": "session-uuid",
  "traces": [
    {
      "url": "https://api.example.com/users",
      "method": "GET",
      "statusCode": 200,
      "duration": 150,
      "requestHeaders": {},
      "requestBody": null,
      "responseHeaders": {},
      "responseBody": "{...}",
      "screenName": "UserListScreen",
      "timestamp": "2025-12-20T12:00:00Z"
    }
  ]
}
```

#### POST /api/logs
Send logs (supports batch).

**Request:**
```json
{
  "deviceId": "unique-device-id",
  "sessionToken": "session-uuid",
  "logs": [
    {
      "level": "info",
      "message": "User logged in successfully",
      "tag": "AuthService",
      "data": { "userId": "123" },
      "fileName": "auth_service.dart",
      "lineNumber": 42,
      "functionName": "login",
      "screenName": "LoginScreen",
      "timestamp": "2025-12-20T12:00:00Z"
    }
  ]
}
```

---

## SDK Integration

### Flutter SDK

#### Installation

Add to `pubspec.yaml`:
```yaml
dependencies:
  devbridge_sdk:
    path: packages/devbridge_sdk
```

#### Initialization

```dart
import 'package:devbridge_sdk/devbridge_sdk.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize DevBridge
  await DevBridge.init(
    baseUrl: 'https://devbridge-eta.vercel.app',
    apiKey: 'your-project-api-key',
    projectId: 'your-project-id',
    enabled: !kDebugMode, // Disable in debug builds
  );

  runApp(MyApp());
}
```

#### Dio Interceptor Setup

```dart
final dio = Dio();

// Add DevBridge interceptor for automatic API tracing
dio.interceptors.add(DevBridgeDioInterceptor(
  excludeUrls: ['devbridge', 'analytics'], // URLs to exclude
  maxBodySize: 10000, // Max body size to capture
));
```

#### Screen Tracking with GoRouter

```dart
final router = GoRouter(
  observers: [DevBridgeRouteObserver()],
  routes: [
    GoRoute(
      path: '/',
      name: 'home',
      builder: (context, state) => HomeScreen(),
    ),
  ],
);
```

#### Manual Screen Tracking

```dart
// Track screen view manually
DevBridge.instance.trackScreen('ProfileScreen');
```

#### Logging

```dart
// Send logs to DevBridge
DevBridge.instance.log(
  level: 'info',
  message: 'Payment completed',
  tag: 'PaymentService',
  data: {'orderId': '12345', 'amount': 99.99},
);
```

#### Force Update & Maintenance Check

```dart
// Check if app needs update
final needsUpdate = DevBridge.instance.isForceUpdateRequired('1.0.0');
if (needsUpdate) {
  // Show update dialog
  Navigator.push(context, MaterialPageRoute(
    builder: (_) => DevBridgeForceUpdatePage(
      title: 'Update Required',
      storeUrl: DevBridge.instance.getStoreUrl(),
    ),
  ));
}

// Check maintenance mode
if (DevBridge.instance.isMaintenanceEnabled()) {
  final config = DevBridge.instance.getMaintenanceConfig();
  Navigator.push(context, MaterialPageRoute(
    builder: (_) => DevBridgeMaintenancePage(
      message: config.message,
      endTime: config.endTime,
    ),
  ));
}
```

---

## Feature Flags

Feature flags control which SDK features are enabled/disabled at a global level.

| Flag | Default | Description |
|------|---------|-------------|
| `sdkEnabled` | `true` | **Master switch** - Disables entire SDK when false |
| `apiTracking` | `true` | Enable API request/response tracing |
| `screenTracking` | `true` | Enable screen navigation tracking |
| `crashReporting` | `true` | Enable crash report sending |
| `logging` | `true` | Enable log sending to dashboard |
| `deviceTracking` | `true` | Enable device registration |
| `sessionTracking` | `true` | Enable session lifecycle tracking |
| `businessConfig` | `true` | Enable remote business configuration |
| `localization` | `true` | Enable remote translations |
| `offlineSupport` | `false` | Queue events when offline |
| `batchEvents` | `true` | Batch events before sending |

### Hierarchy Rules

1. If `sdkEnabled = false`, ALL SDK functionality is disabled
2. Individual feature flags only matter if `sdkEnabled = true`
3. SDK Settings are only relevant if the corresponding feature flag is enabled

---

## SDK Settings

SDK Settings provide fine-grained control over SDK behavior.

### Security Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `captureRequestBodies` | `true` | Capture HTTP request bodies |
| `captureResponseBodies` | `true` | Capture HTTP response bodies |
| `capturePrintStatements` | `false` | Auto-capture `print()` calls as logs |
| `sanitizeSensitiveData` | `true` | Redact sensitive fields |
| `sensitiveFieldPatterns` | `[...]` | Patterns to identify sensitive data |

### Performance Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `maxLogQueueSize` | `100` | Max logs to queue before flush |
| `maxTraceQueueSize` | `50` | Max traces to queue before flush |
| `flushIntervalSeconds` | `30` | Auto-flush interval |
| `enableBatching` | `true` | Batch events before sending |

### Log Control Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `minLogLevel` | `"debug"` | Minimum level: verbose, debug, info, warn, error |
| `verboseErrors` | `false` | Include stack traces in error logs |

---

## Business Configuration

Business Config provides a key-value store for app configuration.

### Value Types

| Type | Example |
|------|---------|
| `string` | `"dark"` |
| `integer` | `30` |
| `boolean` | `true` |
| `decimal` | `0.99` |
| `json` | `{"key": "value"}` |
| `image` | `"https://..."` (URL) |

### App Blocking Keys

| Key | Type | Description |
|-----|------|-------------|
| `force_update_enabled` | boolean | Enable force update check |
| `min_app_version` | string | Minimum required version |
| `force_update_title` | string | Update dialog title |
| `force_update_message` | string | Update dialog message |
| `force_update_button_text` | string | Update button text |
| `play_store_url` | string | Android store URL |
| `app_store_url` | string | iOS store URL |
| `maintenance_enabled` | boolean | Enable maintenance mode |
| `maintenance_title` | string | Maintenance dialog title |
| `maintenance_message` | string | Maintenance message |
| `maintenance_end_time` | string | ISO 8601 end time |

---

## Error Handling

### SDK Error Handling

The SDK gracefully handles errors without crashing the host app:

```dart
// SDK methods never throw - they fail silently
await DevBridge.instance.log(...); // Safe even if network fails

// Check SDK state if needed
if (DevBridge.isInitialized) {
  // SDK is ready
}
```

### API Error Responses

| Status | Meaning |
|--------|---------|
| `400` | Bad Request - Invalid parameters |
| `401` | Unauthorized - Invalid/missing auth |
| `403` | Forbidden - No access to resource |
| `404` | Not Found - Resource doesn't exist |
| `409` | Conflict - Duplicate key |
| `500` | Server Error - Contact support |

---

## Best Practices

### 1. Initialize Early
Initialize DevBridge before your app's UI loads:
```dart
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await DevBridge.init(...);
  runApp(MyApp());
}
```

### 2. Check Feature Flags
Before using features, check if they're enabled:
```dart
if (DevBridge.instance.featureFlags.apiTracking) {
  dio.interceptors.add(DevBridgeDioInterceptor());
}
```

### 3. Use Categories for Business Config
Organize configs by category:
- `app_blocking` - Force update, maintenance
- `features` - Feature toggles
- `branding` - Colors, logos
- `api` - API-related settings

### 4. Sanitize Sensitive Data
Enable sanitization and add custom patterns:
```json
{
  "sanitizeSensitiveData": true,
  "sensitiveFieldPatterns": [
    "password", "token", "secret", "apiKey",
    "credit_card", "ssn", "cvv"
  ]
}
```

### 5. Use Batching for Performance
Enable batching to reduce network calls:
```json
{
  "enableBatching": true,
  "maxTraceQueueSize": 50,
  "flushIntervalSeconds": 30
}
```

---

## Troubleshooting

### SDK Not Sending Data

1. Check `sdkEnabled` feature flag
2. Check individual feature flags (e.g., `apiTracking`)
3. Verify API key is correct
4. Check network connectivity
5. Review console for "DevBridge:" logs

### Data Not Appearing in Dashboard

1. Wait for batch flush (default 30 seconds)
2. Force flush: `DevBridge.instance.flush()`
3. Check project ID matches
4. Verify dashboard filters

### Feature Flag Changes Not Applied

Feature flags are fetched at SDK init. To refresh:
```dart
await DevBridge.instance.refreshFeatureFlags();
```

---

*Last Updated: December 2025*
