# Merchant App SDK Integration Guide

**Last Updated**: December 31, 2024  
**SDK Version**: 1.0.0  
**SDK Location**: `packages/sdk-flutter/` in NivoStack monorepo

## Overview

This guide provides step-by-step instructions for integrating the NivoStack Flutter SDK into the Merchant App. The SDK has been updated to:
- ✅ Simplified initialization (API key only)
- ✅ Automatic endpoint configuration
- ✅ Same features as before (API tracing, screen tracking, business config, localization)

---

## Prerequisites

1. **Merchant App Repository** - Your Flutter app
2. **NivoStack Monorepo** - Located at `/Users/karim-f/Code/nivostack-monorepo-checkout`
3. **API Key** - Get from https://studio.nivostack.com (Project Settings)

---

## Step 1: Add SDK Dependency

### Option A: Path Dependency (Recommended for Local Development)

Add the SDK as a local path dependency in your Merchant App's `pubspec.yaml`:

```yaml
dependencies:
  nivostack_sdk:
    path: ../nivostack-monorepo-checkout/packages/sdk-flutter
```

**Important**: Adjust the path based on your directory structure:
- If Merchant App is at `/Users/karim-f/Code/merchant-mobile-app`
- And NivoStack is at `/Users/karim-f/Code/nivostack-monorepo-checkout`
- Use: `path: ../nivostack-monorepo-checkout/packages/sdk-flutter`

### Option B: Git Dependency (For Testing)

```yaml
dependencies:
  nivostack_sdk:
    git:
      url: https://github.com/your-org/nivostack-monorepo.git
      path: packages/sdk-flutter
      ref: main  # or specific branch/tag
```

### Option C: Pub.dev (For Production Release)

```yaml
dependencies:
  nivostack_sdk: ^1.0.0
```

**Note**: SDK will be published to pub.dev in the future.

---

## Step 2: Install Dependencies

Run in your Merchant App directory:

```bash
cd /path/to/merchant-mobile-app
flutter pub get
```

---

## Step 3: Initialize SDK

### 3.1 Import the SDK

In your `main.dart` or app initialization file:

```dart
import 'package:nivostack_sdk/nivostack_sdk.dart';
```

### 3.2 Initialize Before `runApp()`

```dart
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize NivoStack SDK
  await NivoStack.init(
    apiKey: 'your-project-api-key',  // Get from studio.nivostack.com
  );
  
  // API endpoints are automatically configured:
  // - Ingest API: https://ingest.nivostack.com
  // - Control API: https://api.nivostack.com
  
  runApp(MyApp());
}
```

**Get Your API Key:**
1. Go to https://studio.nivostack.com
2. Login to your account
3. Select your project
4. Go to **Project Settings** → **Project** tab
5. Copy the **API Key**

---

## Step 4: Add API Tracing

### 4.1 Add Dio Dependency (if not already added)

```yaml
dependencies:
  dio: ^5.0.0  # or your current version
```

### 4.2 Add Dio Interceptor

```dart
import 'package:dio/dio.dart';
import 'package:nivostack_sdk/nivostack_sdk.dart';

// Create Dio instance
final dio = Dio();

// Add NivoStack interceptor for automatic API tracing
dio.interceptors.add(NivoStackDioInterceptor());

// All HTTP requests are now automatically traced
final response = await dio.get('https://api.example.com/users');
```

---

## Step 5: Enable Screen Tracking

### 5.1 If Using GoRouter

```dart
import 'package:go_router/go_router.dart';
import 'package:nivostack_sdk/nivostack_sdk.dart';

final router = GoRouter(
  observers: [
    NivoStackRouteObserver(),  // Add this observer
  ],
  routes: [
    // ... your routes
  ],
);
```

### 5.2 If Using Navigator 2.0

```dart
import 'package:flutter/material.dart';
import 'package:nivostack_sdk/nivostack_sdk.dart';

MaterialApp(
  navigatorObservers: [
    NivoStackRouteObserver(),  // Add this observer
  ],
  // ... rest of your app
);
```

---

## Step 6: Use Business Configuration

```dart
import 'package:nivostack_sdk/nivostack_sdk.dart';

// Get business config value
final config = NivoStack.instance.businessConfig;
final apiUrl = config.getString('api_url', defaultValue: 'https://api.example.com');
final featureEnabled = config.getBool('feature_enabled', defaultValue: false);

// Listen for config updates
config.addListener(() {
  // Config was updated from server
  final newValue = config.getString('api_url');
  // Update your app accordingly
});
```

---

## Step 7: Use Localization

```dart
import 'package:nivostack_sdk/nivostack_sdk.dart';

// Get localization instance
final localization = NivoStack.instance.localization;

// Get translation
final welcomeText = localization.getString('welcome', languageCode: 'en');

// Listen for language changes
localization.addListener(() {
  // Translations were updated
  setState(() {
    // Rebuild UI with new translations
  });
});
```

---

## Step 8: Manual Logging

```dart
import 'package:nivostack_sdk/nivostack_sdk.dart';

// Send logs
await NivoStack.instance.log(
  level: 'info',
  tag: 'UserAction',
  message: 'User clicked checkout button',
  data: {'buttonId': 'checkout', 'timestamp': DateTime.now().toIso8601String()},
);
```

---

## Step 9: Track Custom Events

```dart
import 'package:nivostack_sdk/nivostack_sdk.dart';

// Track custom events
await NivoStack.instance.trackEvent(
  'purchase_completed',
  data: {
    'productId': '123',
    'amount': 99.99,
    'currency': 'USD',
  },
);
```

---

## Step 10: User Management

```dart
import 'package:nivostack_sdk/nivostack_sdk.dart';

// Set user when user logs in
await NivoStack.instance.setUser(
  userId: 'user_123',
  email: 'user@example.com',
  name: 'John Doe',
);

// Clear user when user logs out
await NivoStack.instance.clearUser();
```

---

## Complete Example

Here's a complete `main.dart` example:

```dart
import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import 'package:go_router/go_router.dart';
import 'package:nivostack_sdk/nivostack_sdk.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize NivoStack SDK
  await NivoStack.init(
    apiKey: 'your-project-api-key',  // Replace with your API key
  );
  
  // Setup Dio with NivoStack interceptor
  final dio = Dio();
  dio.interceptors.add(NivoStackDioInterceptor());
  
  // Setup router with screen tracking
  final router = GoRouter(
    observers: [NivoStackRouteObserver()],
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) => const HomeScreen(),
      ),
      // ... more routes
    ],
  );
  
  runApp(MyApp(router: router));
}

class MyApp extends StatelessWidget {
  final GoRouter router;
  
  const MyApp({super.key, required this.router});
  
  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      routerConfig: router,
      title: 'Merchant App',
    );
  }
}
```

---

## Migration from Old SDK

If you were using the old SDK location, here are the key changes:

### Before (Old SDK)
```dart
await NivoStack.init(
  apiKey: 'your-api-key',
  ingestUrl: 'https://ingest.nivostack.com',  // ❌ Removed
  controlUrl: 'https://api.nivostack.com',     // ❌ Removed
);
```

### After (New SDK)
```dart
await NivoStack.init(
  apiKey: 'your-api-key',  // ✅ Only API key needed
);
// URLs are automatically configured
```

**What Changed:**
- ✅ Removed `ingestUrl` parameter (automatically set to `https://ingest.nivostack.com`)
- ✅ Removed `controlUrl` parameter (automatically set to `https://api.nivostack.com`)
- ✅ All other features remain the same

---

## Troubleshooting

### Issue: Package not found

**Solution**: Check the path in `pubspec.yaml` is correct relative to your Merchant App location.

### Issue: SDK not initializing

**Solution**: 
1. Verify API key is correct
2. Check internet connection
3. Ensure `WidgetsFlutterBinding.ensureInitialized()` is called before `NivoStack.init()`

### Issue: API traces not appearing

**Solution**:
1. Verify Dio interceptor is added: `dio.interceptors.add(NivoStackDioInterceptor())`
2. Check feature flags in Studio dashboard (API Tracking should be enabled)
3. Check device debug mode if tracking mode is set to "Debug Devices Only"

### Issue: Screen tracking not working

**Solution**:
1. Verify route observer is added to GoRouter or Navigator
2. Check feature flags in Studio dashboard (Screen Tracking should be enabled)

---

## Next Steps

1. ✅ Add SDK dependency to `pubspec.yaml`
2. ✅ Run `flutter pub get`
3. ✅ Initialize SDK in `main.dart`
4. ✅ Add Dio interceptor for API tracing
5. ✅ Add route observer for screen tracking
6. ✅ Test integration
7. ✅ Deploy to production

---

## Support

- **Documentation**: `docs/guides/FLUTTER_SDK_INTEGRATION.md`
- **SDK Location**: `packages/sdk-flutter/`
- **Studio Dashboard**: https://studio.nivostack.com

---

**Last Updated**: December 31, 2024  
**SDK Version**: 1.0.0

