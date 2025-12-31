# Flutter SDK Review & Testing Guide

**Date**: December 31, 2024  
**Version**: 1.0.0  
**Status**: Ready for Review & Testing

## SDK Overview

### Version: 1.0.0

**Package Name**: `nivostack_sdk`  
**Description**: NivoStack SDK for Flutter - Comprehensive monitoring, configuration, and analytics SDK  
**Homepage**: https://nivostack.com  
**Repository**: https://github.com/iplixera/nivostack-monorepo

### Key Features

✅ **API Tracing** - Automatic network request/response tracking  
✅ **Screen Tracking** - Navigation and screen flow monitoring  
✅ **Business Configuration** - Remote configuration management  
✅ **Localization** - Multi-language support  
✅ **Device Registration** - Automatic device registration  
✅ **Session Tracking** - Comprehensive session management  
✅ **Logging** - Structured logging  
✅ **Crash Reporting** - Automatic crash detection  
✅ **Feature Flags** - Remote feature flag management  
✅ **Device Debug Mode** - Selective tracking for specific devices  
✅ **User Management** - User association  
✅ **Force Update** - App version enforcement  
✅ **Maintenance Mode** - Server-controlled maintenance  
✅ **Offline Support** - Queue events when offline  
✅ **Batch Events** - Batch API traces and logs  

## SDK Structure

```
packages/sdk-flutter/
├── lib/
│   ├── nivostack_sdk.dart          # Main export file
│   └── src/
│       ├── nivostack.dart          # Main SDK class
│       ├── api_client.dart          # HTTP client
│       ├── business_config.dart     # Business config client
│       ├── localization.dart       # Localization client
│       ├── dio_interceptor.dart    # Dio interceptor for API tracing
│       ├── route_observer.dart     # Route observer for screen tracking
│       ├── device_code_generator.dart
│       ├── sdk_config_cache.dart
│       ├── models/
│       │   ├── device_info.dart
│       │   ├── device_config.dart
│       │   ├── feature_flags.dart
│       │   ├── sdk_settings.dart
│       │   └── app_blocking_config.dart
│       └── widgets/
│           ├── force_update_page.dart
│           └── maintenance_page.dart
├── example/                         # Example app
├── pubspec.yaml                     # Package configuration
└── CHANGELOG.md                     # Version history
```

## API Endpoints

### Ingest API (`https://ingest.nivostack.com`)
- `POST /api/devices` - Device registration
- `POST /api/traces` - API trace ingestion
- `POST /api/logs` - Log ingestion
- `POST /api/crashes` - Crash report ingestion
- `POST /api/sessions` - Start session
- `PUT /api/sessions` - Update session
- `PATCH /api/sessions` - End session

### Control API (`https://api.nivostack.com`)
- `GET /api/sdk-init` - SDK initialization
- `GET /api/business-config` - Business configuration
- `GET /api/localization/translations` - Localization data
- `GET /api/feature-flags` - Feature flags
- `GET /api/sdk-settings` - SDK settings

## Testing Options for Merchant App

Since Merchant App and NivoStack are in different repositories, here are the testing options:

### Option 1: Path Dependency (Recommended for Local Development)

**Best for:** Local development and testing

**Steps:**

1. **In Merchant App's `pubspec.yaml`:**
   ```yaml
   dependencies:
     nivostack_sdk:
       path: ../nivostack-monorepo-checkout/packages/sdk-flutter
   ```

2. **Or use absolute path:**
   ```yaml
   dependencies:
     nivostack_sdk:
       path: /Users/karim-f/Code/nivostack-monorepo-checkout/packages/sdk-flutter
   ```

3. **Run:**
   ```bash
   cd merchant-app
   flutter pub get
   ```

**Pros:**
- ✅ Instant updates (no need to republish)
- ✅ Easy to debug
- ✅ Works offline
- ✅ No version conflicts

**Cons:**
- ❌ Requires both repos on same machine
- ❌ Path must be correct

### Option 2: Git Dependency (Good for Testing)

**Best for:** Testing specific commits or branches

**Steps:**

1. **In Merchant App's `pubspec.yaml`:**
   ```yaml
   dependencies:
     nivostack_sdk:
       git:
         url: https://github.com/iplixera/nivostack-monorepo.git
         path: packages/sdk-flutter
         ref: main  # or specific branch/commit
   ```

2. **Run:**
   ```bash
   cd merchant-app
   flutter pub get
   ```

**Pros:**
- ✅ Works across machines
- ✅ Can test specific branches/commits
- ✅ No local path needed

**Cons:**
- ❌ Requires internet connection
- ❌ Slower than path dependency
- ❌ Need to commit changes to test

### Option 3: Local Pub Server (Advanced)

**Best for:** Simulating pub.dev without publishing

**Steps:**

1. **Publish to local pub server:**
   ```bash
   cd packages/sdk-flutter
   flutter pub publish --dry-run  # Test first
   # Then publish to local server
   ```

2. **In Merchant App's `pubspec.yaml`:**
   ```yaml
   dependencies:
     nivostack_sdk:
       hosted:
         name: nivostack_sdk
         url: http://localhost:8080  # Your local pub server
       version: 1.0.0
   ```

**Pros:**
- ✅ Simulates production setup
- ✅ Tests publishing process

**Cons:**
- ❌ More complex setup
- ❌ Requires local pub server

### Option 4: Publish to pub.dev (For Release)

**Best for:** Production releases

**Steps:**

1. **Prepare for publishing:**
   ```bash
   cd packages/sdk-flutter
   flutter pub publish --dry-run
   ```

2. **Publish:**
   ```bash
   flutter pub publish
   ```

3. **In Merchant App's `pubspec.yaml`:**
   ```yaml
   dependencies:
     nivostack_sdk: ^1.0.0
   ```

**Pros:**
- ✅ Production-ready
- ✅ Version management
- ✅ Easy for team to use

**Cons:**
- ❌ Requires publishing process
- ❌ Slower iteration cycle

## Recommended Testing Workflow

### Phase 1: Local Development (Path Dependency)

1. Use **Option 1** (Path Dependency) for active development
2. Make changes in SDK
3. Test immediately in Merchant App
4. Iterate quickly

### Phase 2: Pre-Release Testing (Git Dependency)

1. Commit SDK changes to a feature branch
2. Use **Option 2** (Git Dependency) in Merchant App
3. Test with specific branch/commit
4. Verify everything works

### Phase 3: Release (pub.dev)

1. Publish to pub.dev using **Option 4**
2. Update Merchant App to use published version
3. Deploy to production

## SDK Review Checklist

### Code Quality
- [ ] Code follows Dart/Flutter best practices
- [ ] Proper error handling
- [ ] Comprehensive documentation
- [ ] No memory leaks
- [ ] Thread-safe operations

### Features
- [ ] All features implemented
- [ ] Feature flags working
- [ ] Offline support working
- [ ] Batch events working
- [ ] Caching working

### Integration
- [ ] Easy to integrate
- [ ] Clear documentation
- [ ] Example app works
- [ ] No breaking changes

### Testing
- [ ] Unit tests (if any)
- [ ] Integration tests
- [ ] Manual testing completed
- [ ] Edge cases handled

## Quick Start for Merchant App Testing

### Step 1: Add SDK Dependency

**Option A: Path Dependency (Recommended)**
```yaml
# merchant-app/pubspec.yaml
dependencies:
  nivostack_sdk:
    path: ../nivostack-monorepo-checkout/packages/sdk-flutter
```

**Option B: Git Dependency**
```yaml
dependencies:
  nivostack_sdk:
    git:
      url: https://github.com/iplixera/nivostack-monorepo.git
      path: packages/sdk-flutter
      ref: main
```

### Step 2: Initialize SDK

```dart
import 'package:nivostack_sdk/nivostack_sdk.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  await NivoStack.init(
    apiKey: 'your-api-key',
    ingestUrl: 'https://ingest.nivostack.com',
    controlUrl: 'https://api.nivostack.com',
  );
  
  runApp(MyApp());
}
```

### Step 3: Add API Tracing

```dart
import 'package:dio/dio.dart';
import 'package:nivostack_sdk/nivostack_sdk.dart';

final dio = Dio();
dio.interceptors.add(NivoStackDioInterceptor());
```

### Step 4: Add Screen Tracking

```dart
import 'package:go_router/go_router.dart';
import 'package:nivostack_sdk/nivostack_sdk.dart';

final router = GoRouter(
  observers: [NivoStackRouteObserver()],
  // ... routes
);
```

## Testing Checklist

- [ ] SDK initializes correctly
- [ ] API tracing works
- [ ] Screen tracking works
- [ ] Business config loads
- [ ] Localization works
- [ ] Device registration works
- [ ] Sessions tracked
- [ ] Logs sent
- [ ] Feature flags work
- [ ] Offline mode works
- [ ] Batch events work

## Next Steps

1. ✅ SDK version set to 1.0.0
2. ⏳ Review SDK code
3. ⏳ Test with Merchant App
4. ⏳ Fix any issues
5. ⏳ Publish to pub.dev (when ready)

---

**Last Updated**: December 31, 2024

