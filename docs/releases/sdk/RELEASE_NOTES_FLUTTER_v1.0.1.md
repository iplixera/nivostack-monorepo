# NivoStack SDK for Flutter - v1.0.1 Release Notes

**Release Date**: December 29, 2024  
**Package**: `nivostack_sdk`  
**Pub.dev**: [https://pub.dev/packages/nivostack_sdk](https://pub.dev/packages/nivostack_sdk)

---

## 📦 Installation

Add the SDK to your `pubspec.yaml`:

```yaml
dependencies:
  nivostack_sdk: ^1.0.1
```

Then run:

```bash
flutter pub get
```

---

## 🚀 Quick Start

### 1. Initialize the SDK

```dart
import 'package:nivostack_sdk/nivostack_sdk.dart';
import 'package:flutter/material.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize NivoStack SDK
  // baseUrl defaults to https://ingest.nivostack.com (no need to specify)
  await NivoStack.init(
    apiKey: 'your-project-api-key',
  );

  runApp(MyApp());
}
```

**Note**: 
- The `baseUrl` parameter is optional and defaults to the production endpoint (`https://ingest.nivostack.com`)
- Only specify `baseUrl` if you're testing against a local development server
- The `projectId` parameter is not required - it's automatically derived from your API key

### 2. Add API Tracing

```dart
import 'package:dio/dio.dart';
import 'package:nivostack_sdk/nivostack_sdk.dart';

final dio = Dio();
dio.interceptors.add(NivoStackDioInterceptor());
```

### 3. Track Screens

```dart
import 'package:flutter/material.dart';
import 'package:nivostack_sdk/nivostack_sdk.dart';

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      navigatorObservers: [
        NivoStackRouteObserver(),
      ],
      home: HomeScreen(),
    );
  }
}
```

### 4. Use Business Configuration

```dart
final config = NivoStack.instance.businessConfig;

// Get a string value
final apiUrl = config?.getString('api_url', defaultValue: 'https://api.example.com');

// Get a boolean value
final isFeatureEnabled = config?.getBoolean('feature_enabled', defaultValue: false);

// Get an integer value
final maxRetries = config?.getInt('max_retries', defaultValue: 3);

// Get a double value
final timeout = config?.getDouble('timeout', defaultValue: 30.0);

// Refresh configuration
final result = await config?.fetchAll(forceRefresh: true);
if (result?.hasChanges == true) {
  print('Configuration updated');
}
```

### 5. Use Localization

```dart
final localization = NivoStack.instance.localization;

// Fetch available languages
await localization?.fetchLanguages();

// Set language
await localization?.setLanguage('en');

// Get translation
final welcomeText = localization?.translate('welcome_message', defaultValue: 'Welcome');

// Refresh translations
final translations = await localization?.fetchTranslations(
  languageCode: 'en',
  forceRefresh: true,
);
```

### 6. Log Events

```dart
// Log with different levels
await NivoStack.instance.log(
  level: 'info',
  tag: 'MyApp',
  message: 'User logged in',
);

// Log with data
await NivoStack.instance.log(
  level: 'debug',
  tag: 'API',
  message: 'Request completed',
  data: {'endpoint': '/api/users', 'duration': 150},
);
```

### 7. Report Crashes

```dart
try {
  // Your code
} catch (e, stackTrace) {
  await NivoStack.instance.reportCrash(
    message: e.toString(),
    stackTrace: stackTrace.toString(),
  );
}
```

### 8. Track Custom Events

```dart
await NivoStack.instance.trackEvent(
  'button_clicked',
  data: {
    'button_id': 'login',
    'timestamp': DateTime.now().toIso8601String(),
  },
);
```

### 9. Manage User Identity

```dart
// Set user
await NivoStack.instance.setUser(
  userId: 'user_123',
  email: 'user@example.com',
  name: 'John Doe',
);

// Set user properties
await NivoStack.instance.setUserProperties({
  'subscription_tier': 'premium',
  'account_age_days': 365,
});

// Clear user
await NivoStack.instance.clearUser();
```

### 10. Track Screens Manually

```dart
await NivoStack.instance.trackScreen('HomeScreen');
```

---

## 🔧 Configuration

### Feature Flags

Check if features are enabled:

```dart
final flags = NivoStack.instance.featureFlags;

if (flags.apiTracking) {
  // API tracking is enabled
}

if (flags.screenTracking) {
  // Screen tracking is enabled
}

if (flags.logging) {
  // Logging is enabled
}
```

### SDK Settings

Access SDK settings:

```dart
final settings = NivoStack.instance.sdkSettings;

print('Batch size: ${settings.batchSize}');
print('Flush interval: ${settings.flushInterval}');
```

### Device Information

```dart
final deviceInfo = NivoStack.instance.deviceInfo;

print('Platform: ${deviceInfo.platform}');
print('OS Version: ${deviceInfo.osVersion}');
print('App Version: ${deviceInfo.appVersion}');
print('Device Code: ${NivoStack.instance.deviceCode}');
```

---

## 📋 Requirements

- **Flutter**: >=3.0.0
- **Dart**: >=3.0.0 <4.0.0
- **Platforms**: iOS, Android

---

## 🔗 Documentation

- [Full Documentation](https://github.com/nivostack/nivostack-monorepo/tree/main/packages/sdk-flutter)
- [API Reference](https://pub.dev/documentation/nivostack_sdk/latest/)
- [Example App](https://github.com/nivostack/nivostack-monorepo/tree/main/packages/sdk-flutter/example)

---

## 🛠️ Dependencies

The SDK includes the following dependencies:

- `dio`: ^5.7.0 - HTTP client for API calls
- `uuid`: ^4.5.1 - UUID generation
- `device_info_plus`: ^10.1.2 - Device information
- `package_info_plus`: ^8.0.3 - App version information
- `connectivity_plus`: ^6.0.5 - Network connectivity
- `shared_preferences`: ^2.3.2 - Local storage
- `url_launcher`: ^6.3.1 - For opening URLs (e.g., force update links)

---

## 📞 Support

- **Documentation**: [docs.nivostack.com](https://docs.nivostack.com)
- **GitHub**: [github.com/nivostack/nivostack-monorepo](https://github.com/nivostack/nivostack-monorepo)
- **Issues**: [GitHub Issues](https://github.com/nivostack/nivostack-monorepo/issues)
- **Email**: support@nivostack.com

---

## 📄 License

Copyright (c) 2024 NivoStack. All rights reserved.

---

## 🙏 Acknowledgments

Thank you for using NivoStack SDK! We're committed to providing the best mobile app monitoring and configuration experience.
