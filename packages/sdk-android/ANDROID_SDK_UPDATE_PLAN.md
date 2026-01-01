# Android SDK Update Plan

## Goal
Update Android SDK to match Flutter SDK features and functionality, then publish to JitPack/Maven.

## Current Status
- ✅ Basic SDK initialization
- ✅ Device registration
- ✅ Session tracking
- ✅ API tracing interceptor
- ✅ Business config client
- ✅ Localization client
- ✅ User management (setUser/clearUser)

## Missing Features (from Flutter SDK)

### 1. Device Code Generation
- [ ] Create `DeviceCodeGenerator` class
- [ ] Generate human-readable codes (format: XXXX-XXXX)
- [ ] Store in SharedPreferences
- [ ] Use in device registration

### 2. Config Refresh & Sync
- [ ] Add `refreshConfig(forceRefresh: Boolean)` method
- [ ] Add lifecycle-based sync (app foreground/background)
- [ ] Add periodic sync with configurable interval
- [ ] Add ETag support for efficient updates
- [ ] Add config cache with TTL

### 3. Build Mode Support
- [ ] Detect debug vs release build
- [ ] Pass `buildMode` to SDK init API
- [ ] Support preview/production builds

### 4. SDK Init API Updates
- [ ] Update to use combined `/api/sdk-init` endpoint
- [ ] Parse localization data from init response
- [ ] Parse deviceConfig with deviceCode
- [ ] Handle ETag/304 Not Modified responses

### 5. Public API Methods
- [ ] Add `trackApiTrace()` method
- [ ] Add `log()` method with levels
- [ ] Add `reportCrash()` method
- [ ] Add `refreshConfig()` method
- [ ] Add `deviceCode` getter

### 6. Lifecycle Observer
- [ ] Update `NivoStackLifecycleObserver` to trigger config sync
- [ ] Handle app foreground/background events
- [ ] Start/stop periodic sync based on app state

### 7. Localization from Init
- [ ] Parse localization data from SDK init response
- [ ] Apply localization data to LocalizationClient
- [ ] Support default language translations

### 8. Example App Updates
- [ ] Update example app to test all features
- [ ] Add UI for testing each feature
- [ ] Add status display

### 9. Publishing Setup
- [ ] Configure JitPack publishing
- [ ] Add version management
- [ ] Create README with usage instructions
- [ ] Add CHANGELOG

## Implementation Order

1. **Device Code Generator** (foundation)
2. **SDK Init API Updates** (core functionality)
3. **Config Refresh & Sync** (important feature)
4. **Public API Methods** (user-facing)
5. **Lifecycle Observer Updates** (automatic sync)
6. **Example App** (testing)
7. **Publishing** (distribution)

## Testing Checklist

- [ ] SDK initialization
- [ ] Device registration with device code
- [ ] Config refresh (force and normal)
- [ ] Lifecycle sync (foreground/background)
- [ ] Periodic sync
- [ ] API tracing
- [ ] Logging
- [ ] Crash reporting
- [ ] Business config fetching
- [ ] Localization fetching
- [ ] User management
- [ ] Build mode detection

## Publishing Targets

1. **JitPack** (easiest, GitHub-based)
2. **Maven Central** (official, requires setup)
3. **Local Maven** (for testing)

