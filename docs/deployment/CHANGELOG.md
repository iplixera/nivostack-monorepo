# Changelog

All notable changes to the DevBridge project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- Real-time WebSocket updates
- Time-series analytics charts
- Export functionality (CSV, JSON)
- Retention policies configuration

---

## [1.5.1] - 2025-12-21

### Fixed

#### Server-Side Tracking Validation
- **Added tracking validation to `/api/logs` endpoint** - Server now validates before accepting logs
  - Checks `sdkEnabled` flag (master kill switch)
  - Validates `logging` feature flag
  - Respects `trackingMode` setting
  - Verifies device debug mode status for `debug_only` mode
- **Added tracking validation to `/api/traces` endpoint** - Server now validates before accepting traces
  - Checks `sdkEnabled` flag (master kill switch)
  - Validates `apiTracking` feature flag
  - Respects `trackingMode` setting
  - Verifies device debug mode status for `debug_only` mode
- **Impact**: Prevents server from accepting data when tracking is disabled in settings
- **Behavior**: Returns 200 OK with empty result and "Tracking disabled" message

#### Debug Button Visibility
- **Fixed debug mode button visibility** in device list
  - Now only shows when `trackingMode` is set to `debug_only`
  - Also shows if device already has debug mode enabled (for management)
  - Hidden when tracking mode is `all` or `none` (button not needed)
- **Improved UX**: Clearer indication of when debug mode is relevant

#### SDK Settings Initialization
- **Fixed SDK settings not loading on initial page load**
  - SDK settings now fetched in initial `fetchData()` call
  - Debug button visibility correct from first render
  - No need to visit Settings tab first to populate settings

**Why These Fixes Matter:**
- **Double validation**: SDK checks client-side, server validates server-side
- **Security**: Prevents malicious clients from bypassing SDK settings
- **Consistency**: Ensures settings are respected at all layers
- **Better UX**: Debug button only appears when it's functionally relevant
- **Immediate availability**: All data loaded on page initialization

---

## [1.5.0] - 2025-12-21

### Added

#### Data Cleanup Feature
- **New "Data Cleanup" tab in Settings** - Comprehensive data management interface
  - Delete individual data types: Devices, API Traces, Logs, Sessions, Crashes, Screens
  - Nuclear option: Delete ALL data at once
  - Double confirmation prompts to prevent accidental deletions
  - Real-time feedback with deletion counts
- **New `/api/cleanup` endpoint** - Backend API for data deletion
  - Supports selective deletion by data type
  - Respects foreign key constraints with proper transaction handling
  - Returns detailed deletion statistics
  - User authentication and project ownership validation

**Security Features:**
- Multi-level confirmation (dialog + typed confirmation)
- Authorization checks on all delete operations
- Transaction-based deletions to ensure data consistency
- Audit trail in server logs

---

## [1.4.1] - 2025-12-21

### Fixed

#### Critical Bug: Tracking Enabled Always True
- **Fixed `/api/sdk-init` endpoint** - `trackingEnabled` was hardcoded to `true`
- Server now correctly computes `trackingEnabled` based on:
  - `sdkEnabled` flag (master kill switch)
  - `trackingMode` setting (`all`, `debug_only`, `none`)
  - Device `debugModeEnabled` status (for `debug_only` mode)
- **Impact**: Before this fix, API traces and logs were captured even when:
  - Feature flags were disabled in dashboard
  - Tracking mode was set to `none` or `debug_only` (without debug enabled)
- **Breaking Change**: None - this is a bug fix restoring intended behavior

**For users experiencing unwanted tracking:**
1. Verify your SDK Settings → Tracking Mode is set correctly
2. Restart your mobile app to fetch updated config
3. Clear config cache if needed: `DevBridge.instance.clearConfigCache()`

---

## [1.4.0] - 2025-12-20

### Added

#### SDK Performance Optimization
- **New `/api/sdk-init` combined endpoint** - Single request returns all SDK configuration
  - Feature Flags
  - SDK Settings + API Configs
  - Business Config
- **Edge caching** - 60s cache with stale-while-revalidate for global CDN performance
- **Parallel database queries** - All data fetched simultaneously using `Promise.all()`
- **Client-side caching** - Local SharedPreferences cache for instant startup
  - Cache duration: 1 hour (fresh), 24 hours (max age)
  - Cache versioning for format changes
  - Stale-while-revalidate pattern (use cache immediately, fetch fresh in background)
  - New methods: `clearConfigCache()`, `hasValidConfigCache()`
- **ETag/Conditional requests** - Skip downloading unchanged config
  - Server generates MD5 hash-based ETag from config data
  - SDK sends `If-None-Match` header with cached ETag
  - Server returns 304 Not Modified if config unchanged
  - Saves bandwidth and reduces response time for unchanged configs
- **Database query optimization** - Composite indexes for SDK init queries
  - Added composite index on `ApiConfig(projectId, isEnabled)`
  - Added composite index on `BusinessConfig(projectId, isEnabled)`
  - Improves query performance for filtered lookups

### Changed
- Flutter SDK now uses combined endpoint for initialization (93% faster)
- SDK init reduced from ~5s to ~300ms (server cache hit: ~67ms)
- Returning users now see near-instant startup (~0ms with local cache)

### Performance Results
| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Mean SDK Init | 4,367ms | 290ms | 93.4% faster |
| Server Cache Hit | 3,907ms | 67ms | 98.3% faster |
| Local Cache Hit | 3,907ms | ~0ms | 99.9% faster |
| Cache Hit Rate | N/A | 90%+ | - |

---

## [1.3.0] - 2025-12-20

### Added

#### Global SDK Kill Switch
- New `sdkEnabled` feature flag - master switch to disable entire SDK remotely
- When disabled, ALL SDK functionality is turned off regardless of other feature flags
- Dashboard UI with prominent toggle and warning message
- SDK checks `sdkEnabled` at the top of all operations (trackScreen, trackApiTrace, log, reportCrash, etc.)
- Other feature flag toggles are visually disabled when SDK is disabled

#### SDK Settings System
- New `SdkSettings` model for controlling SDK behavior per project
- Security settings: `captureRequestBodies`, `captureResponseBodies`, `sanitizeSensitiveData`
- Performance settings: `maxLogQueueSize`, `maxTraceQueueSize`, `flushIntervalSeconds`, `enableBatching`
- Log control settings: `minLogLevel`, `verboseErrors`
- Custom sensitive field patterns for data sanitization
- Per-endpoint configuration overrides (`ApiConfig` enhanced)
- New `/api/sdk-settings` endpoint (GET/PUT)
- SDK Settings tab in Dashboard Settings page

#### Configuration Categories
- `ConfigCategory` model for organizing business configs
- Category management UI in Business Configuration tab

#### Session Timeline View
- New `/api/sessions/[id]/timeline` endpoint
- Chronological view of all session events (screens, requests, logs)
- Timeline/Flow view toggle in Flow tab
- Expandable event details (request/response bodies, log data)
- Session stats display (requests, logs, costs)

#### Force Update & Maintenance Mode
- `ForceUpdateConfig` and `MaintenanceConfig` models in SDK
- `isForceUpdateRequired()` and `isMaintenanceEnabled()` methods
- Default UI widgets: `DevBridgeForceUpdatePage`, `DevBridgeMaintenancePage`
- Countdown timer for maintenance end time
- Platform-specific store URL support (iOS/Android)
- App blocking listener callbacks
- `checkBlockingStatus()` helper method

### Changed
- Enhanced `ApiConfig` model with `enableLogs`, `captureRequestBody`, `captureResponseBody` fields
- SDK now fetches and applies SDK settings during initialization
- Improved configuration hierarchy (Feature Flags > SDK Settings > Per-Endpoint)

### Fixed
- Database migration environment variable handling

---

## [1.2.0] - 2025-12-19

### Added

#### Localization System
- `Language` model with RTL support
- `LocalizationKey` model with categories and platform targeting
- `Translation` model with review workflow
- New endpoints: `/api/localization/languages`, `/api/localization/keys`, `/api/localization/translations`
- `DevBridgeLocalization` class in SDK
- Full localization tab in Dashboard

#### Feature Flags
- `FeatureFlags` model for per-project feature toggles
- New `/api/feature-flags` endpoint (GET/PUT)
- `DevBridgeFeatureFlags` class in SDK
- Feature Flags tab in Dashboard Settings
- Support for 10 feature flags (apiTracking, screenTracking, etc.)

### Changed
- SDK now checks feature flags before each operation
- Dashboard displays feature flag status in Settings

---

## [1.1.0] - 2025-12-18

### Added

#### Business Configuration
- `BusinessConfig` model with multiple value types
- Support for: string, integer, boolean, decimal, json, image
- Category organization for configs
- Version tracking for change history
- New `/api/business-config` endpoint (GET/POST/PUT/DELETE)
- `DevBridgeBusinessConfig` class in SDK with type-safe getters
- Business Configuration tab in Dashboard

#### File Upload
- `UploadedFile` model for tracking uploads
- Image upload support for business configs
- `/api/upload` endpoint (POST/DELETE/GET)

### Changed
- Dashboard UI updated with vertical tab navigation
- Improved responsive design

---

## [1.0.0] - 2025-12-16

### Added

#### Core Platform
- Project management with API key generation
- User authentication (JWT-based)
- Multi-tenant architecture

#### Device Management
- Automatic device registration
- Platform detection (iOS/Android)
- Device metadata tracking (OS, app version, model)
- Last seen timestamps

#### API Tracing
- Full HTTP request/response capture
- Headers and body storage
- Status code and duration tracking
- Screen context tracking
- Network type and geo-location metadata
- Trace filtering and search
- Clear traces functionality

#### Session Tracking
- Automatic session creation on app launch
- Session end on app background/close
- Screen flow tracking
- Session duration calculation
- Request and cost association

#### Console Logging
- Six log levels: verbose, debug, info, warn, error, assert
- Tag-based organization
- Source code location tracking
- Screen and thread context
- Full-text search
- Batch submission support

#### Error Monitoring
- Alert rule creation for endpoints
- HTTP status code monitoring (4xx, 5xx)
- Body-based error detection
- One-click monitoring from traces
- Occurrence tracking
- Resolution workflow

#### Cost Analytics
- Cost configuration per endpoint
- Wildcard pattern support
- Cost breakdown by endpoint, device, session
- Average cost calculations

#### User Flow Visualization
- Interactive flow diagram
- Screen-to-screen navigation
- API calls between screens
- Success/error rates
- Cost per journey

#### Notification Settings
- Email configuration
- Push notification support
- SMS alerts
- Webhook integration

#### Flutter SDK
- `DevBridge` core class
- `DevBridgeDioInterceptor` for API tracing
- `DevBridgeRouteObserver` for screen tracking
- Batch event support
- Offline queue (optional)

---

## Version History Summary

| Version | Date | Highlights |
|---------|------|------------|
| 1.3.0 | 2025-12-20 | SDK Settings, Timeline View, Force Update/Maintenance |
| 1.2.0 | 2025-12-19 | Feature Flags, Localization |
| 1.1.0 | 2025-12-18 | Business Configuration, File Upload |
| 1.0.0 | 2025-12-16 | Initial Release |

---

## Migration Notes

### Upgrading to 1.3.0

#### Database Migration
Run Prisma migration to add new models:
```bash
pnpm prisma db push
```

#### SDK Update
Update Flutter SDK to fetch new settings:
```dart
// SDK now automatically fetches settings during init
await DevBridge.init(...);

// Access settings
final settings = DevBridge.instance.sdkSettings;
print('Capture request bodies: ${settings.captureRequestBodies}');
```

### Upgrading to 1.2.0

#### New Tables Required
- `FeatureFlags`
- `Language`
- `LocalizationKey`
- `Translation`

#### SDK Changes
```dart
// Check feature flags before operations
if (DevBridge.instance.featureFlags.apiTracking) {
  // API tracking is enabled
}
```

---

## Links

- [Live Demo](https://devbridge-eta.vercel.app)
- [Developer Guide](docs/DEVELOPER_GUIDE.md)
- [PRD](docs/PRD.md)
- [SDK Documentation](../merchant-mobile-app/packages/devbridge_sdk/README.md)

---

*Maintained by the DevBridge Team*
