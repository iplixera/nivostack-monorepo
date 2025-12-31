# Flutter SDK Integration Guide

Complete guide for integrating NivoStack Flutter SDK into your Flutter application (works on both iOS and Android).

## Overview

NivoStack Flutter SDK provides:
- **API Tracing**: Automatic network request/response tracking via Dio interceptor
- **Screen Tracking**: Navigation and screen flow monitoring
- **Business Configuration**: Remote configuration management
- **Localization**: Multi-language support with remote translations
- **Device Registration**: Automatic device identification
- **Session Tracking**: User session context and metrics
- **Logging**: Structured logging with levels
- **Crash Reporting**: Automatic crash detection
- **User Management**: Associate users with devices

## Installation

### Add Dependency

Add to your `pubspec.yaml`:

```yaml
dependencies:
  nivostack_sdk:
    git:
      url: https://github.com/iplixera/nivostack-flutter-sdk.git
      ref: main
```

Or when published to pub.dev:

```yaml
dependencies:
  nivostack_sdk: ^1.0.0
```

### Install

```bash
flutter pub get
```

## Quick Start

### 1. Initialize SDK

In your `main.dart`:

```dart
import 'package:nivostack_sdk/nivostack_sdk.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize NivoStack SDK
  await NivoStack.init(
    ingestUrl: 'https://ingest.nivostack.com',  // For sending data
    controlUrl: 'https://api.nivostack.com',    // For fetching config
    apiKey: 'your-project-api-key',             // Get from dashboard
    projectId: 'your-project-id'                 // Get from dashboard
  );
  
  runApp(MyApp());
}
```

**Get API Credentials:**
1. Go to: https://studio.nivostack.com
2. Create or select a project
3. Go to Project Settings
4. Copy **API Key** and **Project ID**

### 2. Add API Tracing

Add Dio interceptor for automatic API tracing:

```dart
import 'package:dio/dio.dart';
import 'package:nivostack_sdk/nivostack_sdk.dart';

final dio = Dio();
dio.interceptors.add(NivoStackDioInterceptor());

// All requests are automatically traced
final response = await dio.get('https://api.example.com/users');
```

### 3. Enable Screen Tracking

Add route observer for automatic screen tracking:

```dart
import 'package:go_router/go_router.dart';
import 'package:nivostack_sdk/nivostack_sdk.dart';

final router = GoRouter(
  observers: [NivoStackRouteObserver()],
  routes: [
    // Your routes...
  ],
);
```

Or with Navigator 2.0:

```dart
import 'package:flutter/material.dart';
import 'package:nivostack_sdk/nivostack_sdk.dart';

MaterialApp(
  navigatorObservers: [NivoStackRouteObserver()],
  // ...
)
```

## API Endpoints

The SDK uses separate endpoints:

- **Ingest API** (`https://ingest.nivostack.com`): For sending data
  - Device registration
  - API traces
  - Logs
  - Crashes
  - Sessions

- **Control API** (`https://api.nivostack.com`): For fetching configuration
  - Business configuration
  - Localization
  - Feature flags
  - SDK settings

## Features

### API Tracing

Automatic tracking via Dio interceptor:

```dart
import 'package:dio/dio.dart';
import 'package:nivostack_sdk/nivostack_sdk.dart';

final dio = Dio();
dio.interceptors.add(NivoStackDioInterceptor());

// All requests are automatically traced
await dio.get('https://api.example.com/users');
await dio.post('https://api.example.com/login', data: {...});
```

### Screen Tracking

Automatic tracking via route observer:

```dart
import 'package:go_router/go_router.dart';
import 'package:nivostack_sdk/nivostack_sdk.dart';

final router = GoRouter(
  observers: [NivoStackRouteObserver()],
  routes: [
    GoRoute(path: '/', builder: (context, state) => HomePage()),
    GoRoute(path: '/profile', builder: (context, state) => ProfilePage()),
  ],
);
```

### Business Configuration

Fetch and cache remote configuration:

```dart
import 'package:nivostack_sdk/nivostack_sdk.dart';

// Get configuration value
final config = NivoStack.instance.businessConfig;

// Get string value
final apiUrl = await config.getString('api_url', defaultValue: 'https://api.example.com');

// Get boolean value
final isFeatureEnabled = await config.getBoolean('feature_enabled', defaultValue: false);

// Get integer value
final maxRetries = await config.getInt('max_retries', defaultValue: 3);

// Get double value
final price = await config.getDouble('product_price', defaultValue: 0.0);

// Get JSON object
final jsonConfig = await config.getJson('complex_config', defaultValue: {});

// Refresh configuration
await config.refresh();
```

### Localization

Manage translations remotely:

```dart
import 'package:nivostack_sdk/nivostack_sdk.dart';

final localization = NivoStack.instance.localization;

// Set language
await localization.setLanguage('en');

// Get translation
final welcomeText = await localization.translate('welcome_message', defaultValue: 'Welcome');

// Refresh translations
await localization.refresh();
```

### User Management

Associate users with devices:

```dart
import 'package:nivostack_sdk/nivostack_sdk.dart';

// Set user
await NivoStack.instance.setUser(
  userId: 'user123',
  email: 'user@example.com',
  name: 'John Doe',
);

// Clear user
await NivoStack.instance.clearUser();
```

### Logging

Send structured logs:

```dart
import 'package:nivostack_sdk/nivostack_sdk.dart';

// Send log
await NivoStack.instance.log(
  message: 'User logged in',
  level: 'info',
  tags: ['auth', 'user'],
);
```

### Crash Reporting

Report crashes:

```dart
import 'package:nivostack_sdk/nivostack_sdk.dart';

try {
  // Your code
} catch (e, stackTrace) {
  await NivoStack.instance.crash(
    message: e.toString(),
    stackTrace: stackTrace.toString(),
  );
  rethrow;
}
```

## Complete Example

```dart
import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import 'package:go_router/go_router.dart';
import 'package:nivostack_sdk/nivostack_sdk.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize SDK
  await NivoStack.init(
    ingestUrl: 'https://ingest.nivostack.com',
    controlUrl: 'https://api.nivostack.com',
    apiKey: 'your-api-key',
    projectId: 'your-project-id',
  );
  
  // Setup Dio with interceptor
  final dio = Dio();
  dio.interceptors.add(NivoStackDioInterceptor());
  
  // Setup router with observer
  final router = GoRouter(
    observers: [NivoStackRouteObserver()],
    routes: [
      GoRoute(path: '/', builder: (context, state) => HomePage()),
    ],
  );
  
  runApp(MyApp(router: router));
}

class HomePage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Home')),
      body: Center(
        child: ElevatedButton(
          onPressed: () async {
            // Use business config
            final config = NivoStack.instance.businessConfig;
            final apiUrl = await config.getString('api_url', defaultValue: 'https://api.example.com');
            
            // Make API call (automatically traced)
            final dio = Dio();
            dio.interceptors.add(NivoStackDioInterceptor());
            final response = await dio.get(apiUrl);
            
            // Use localization
            final localization = NivoStack.instance.localization;
            final welcomeText = await localization.translate('welcome', defaultValue: 'Welcome');
          },
          child: Text('Test'),
        ),
      ),
    );
  }
}
```

## Testing

### Example App

A complete example app is available at:
```
packages/sdk-flutter/example/
```

**To run:**
```bash
cd packages/sdk-flutter/example
flutter pub get
flutter run
```

## Troubleshooting

### SDK Not Initializing
- Verify API key and project ID are correct
- Check network connectivity
- Verify URLs are accessible
- Check console logs for errors

### Events Not Appearing
- Check feature flags are enabled in dashboard
- Verify device is registered
- Check tracking mode settings
- Ensure interceptor is added to Dio

### Build Errors
- Run `flutter clean`
- Run `flutter pub get`
- Check Flutter version: `flutter --version` (requires >=3.0.0)

## API Reference

### NivoStack.init()

Initialize the SDK.

**Parameters:**
- `ingestUrl`: URL for sending data (default: `https://ingest.nivostack.com`)
- `controlUrl`: URL for fetching config (default: `https://api.nivostack.com`)
- `apiKey`: Project API key (required)
- `projectId`: Project ID (required)

### NivoStack.instance

Access the SDK singleton.

**Properties:**
- `businessConfig`: Business configuration client
- `localization`: Localization client
- `featureFlags`: Current feature flags
- `deviceCode`: Device code for support

**Methods:**
- `setUser(userId, email?, name?)`: Associate user with device
- `clearUser()`: Remove user association
- `log(message, level, tags?)`: Send log
- `crash(message, stackTrace?)`: Report crash
- `flushEvents()`: Manually flush pending events

## Next Steps

1. ✅ Initialize SDK in main()
2. ✅ Add Dio interceptor for API tracing
3. ✅ Add route observer for screen tracking
4. ✅ Test with example app
5. ✅ Integrate into your app
6. ✅ Configure in dashboard

## Related Documentation

- [Example App README](../../packages/sdk-flutter/example/README.md)
- [Setup Instructions](../../packages/sdk-flutter/example/SETUP_INSTRUCTIONS.md)
- [Android SDK Integration](./ANDROID_SDK_INTEGRATION.md)
- [iOS SDK Integration](./IOS_SDK_INTEGRATION.md)


