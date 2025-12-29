# NivoStack Core SDK for Flutter - v1.0.0 Release Notes

**Release Date**: December 29, 2024  
**Package**: `nivostack_core`  
**Pub.dev**: [https://pub.dev/packages/nivostack_core](https://pub.dev/packages/nivostack_core)

---

## 🎉 Initial Public Release

We're excited to announce the first public release of **NivoStack Core SDK for Flutter**! This SDK provides comprehensive mobile app monitoring, remote configuration, and localization features for Flutter applications.

---

## ✨ Features

### 🔍 API Tracing
Automatically track HTTP requests and responses made through Dio:
- Request/response capture with headers and bodies
- Timing information for performance monitoring
- Error tracking and categorization
- Automatic integration via `DevBridgeDioInterceptor`

### 📱 Screen Tracking
Monitor user navigation and screen flow:
- Automatic screen view tracking
- Navigation flow analysis
- Time spent on each screen
- Session context and metrics

### 📝 Logging
Structured logging with multiple levels:
- `log()`, `debug()`, `info()`, `warn()`, `error()` methods
- Tag-based organization
- Automatic `print()` statement capture (optional)
- Log levels and filtering

### 💥 Crash Reporting
Automatic crash detection and reporting:
- Exception capture with stack traces
- Crash context and device information
- Automatic reporting to dashboard

### ⚙️ Business Configuration
Remote configuration management:
- String, integer, boolean, decimal, and JSON value types
- Categorized configurations
- Version tracking
- Automatic refresh and caching
- Type-safe getters with default values

### 🌍 Localization
Multi-language support with remote translations:
- Remote translation management
- Language switching
- RTL language support
- Translation caching
- OTA (Over-The-Air) updates

### 🎛️ Feature Flags
Server-controlled feature toggles:
- Enable/disable features remotely
- A/B testing support
- Gradual rollouts
- Feature flag evaluation

### 📊 Session Tracking
Comprehensive session management:
- Session context (app version, OS, locale, timezone)
- Network type detection
- User properties and metadata
- Screen flow tracking
- Event and error counting

### 🔧 SDK Settings
Remote SDK configuration:
- API endpoint cost configuration
- Rate limiting settings
- Tracking mode control
- Device debug mode support

### 🚀 Performance Features
- **Offline Support**: Queue events when offline, sync when online
- **Batch Events**: Reduce network calls by batching events
- **Client-Side Caching**: Fast initialization with cached config
- **ETag Support**: Skip downloading unchanged configuration

---

## 📦 Installation

Add to your `pubspec.yaml`:

```yaml
dependencies:
  nivostack_core: ^1.0.0
```

Then run:

```bash
flutter pub get
```

---

## 🚀 Quick Start

### 1. Initialize the SDK

```dart
import 'package:nivostack_core/nivostack_core.dart';
import 'package:dio/dio.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize NivoStack SDK
  await DevBridge.init(
    baseUrl: 'https://ingest.nivostack.com',
    apiKey: 'your-project-api-key',
    projectId: 'your-project-id',
  );

  runApp(MyApp());
}
```

### 2. Add API Tracing

```dart
import 'package:dio/dio.dart';
import 'package:nivostack_core/nivostack_core.dart';

final dio = Dio();
dio.interceptors.add(DevBridgeDioInterceptor());
```

### 3. Track Screens

```dart
import 'package:flutter/material.dart';
import 'package:nivostack_core/nivostack_core.dart';

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      navigatorObservers: [
        DevBridgeRouteObserver(),
      ],
      home: HomeScreen(),
    );
  }
}
```

### 4. Use Business Configuration

```dart
final config = DevBridge.instance.businessConfig;

// Get a string value
final apiUrl = config.getString('api_url', defaultValue: 'https://api.example.com');

// Get a boolean value
final isFeatureEnabled = config.getBoolean('feature_enabled', defaultValue: false);

// Get an integer value
final maxRetries = config.getInt('max_retries', defaultValue: 3);
```

### 5. Use Localization

```dart
final localization = DevBridge.instance.localization;

// Set language
await localization.setLanguage('en');

// Get translation
final welcomeText = localization.translate('welcome_message', defaultValue: 'Welcome');
```

---

## 📋 Requirements

- **Flutter**: >=3.0.0
- **Dart**: >=3.0.0 <4.0.0
- **Platforms**: iOS, Android

---

## 🔗 Documentation

- [Full Documentation](https://github.com/nivostack/nivostack-monorepo/tree/main/packages/sdk-flutter)
- [API Reference](https://pub.dev/documentation/nivostack_core/latest/)
- [Example App](https://github.com/nivostack/nivostack-monorepo/tree/main/packages/sdk-flutter/example)
- [Migration Guide](https://github.com/nivostack/nivostack-monorepo/blob/main/packages/sdk-flutter/MIGRATION_GUIDE.md)

---

## 🛠️ Dependencies

- `dio`: ^5.7.0 - HTTP client for API calls
- `uuid`: ^4.5.1 - UUID generation
- `device_info_plus`: ^10.1.2 - Device information
- `package_info_plus`: ^8.0.3 - App version information
- `connectivity_plus`: ^6.0.5 - Network connectivity
- `shared_preferences`: ^2.3.2 - Local storage

---

## 🐛 Known Issues

None at this time. Please report any issues on [GitHub Issues](https://github.com/nivostack/nivostack-monorepo/issues).

---

## 🔄 Migration from DevBridge SDK

If you're migrating from the old `devbridge_sdk` package, see our [Migration Guide](https://github.com/nivostack/nivostack-monorepo/blob/main/packages/sdk-flutter/MIGRATION_GUIDE.md).

**Key Changes**:
- Package name changed from `devbridge_sdk` to `nivostack_core`
- Default endpoint changed to `https://ingest.nivostack.com`
- Class names remain the same (`DevBridge`) for backward compatibility

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

Thank you for using NivoStack Core SDK! We're committed to providing the best mobile app monitoring and configuration experience.

