# Merchant App SDK Integration - Quick Start

**SDK Version**: 1.0.0  
**SDK Location**: `packages/sdk-flutter/` in NivoStack monorepo

---

## 🚀 Quick Integration (5 Steps)

### Step 1: Add SDK to `pubspec.yaml`

```yaml
dependencies:
  nivostack_sdk:
    path: ../nivostack-monorepo-checkout/packages/sdk-flutter
```

**Note**: Adjust path based on your directory structure. If Merchant App is at `/Users/karim-f/Code/merchant-mobile-app` and NivoStack is at `/Users/karim-f/Code/nivostack-monorepo-checkout`, use the path above.

### Step 2: Install Dependencies

```bash
flutter pub get
```

### Step 3: Initialize SDK in `main.dart`

```dart
import 'package:nivostack_sdk/nivostack_sdk.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize SDK - API key only (URLs are automatic)
  await NivoStack.init(
    apiKey: 'your-project-api-key',  // Get from studio.nivostack.com
  );
  
  runApp(MyApp());
}
```

**Get API Key**: https://studio.nivostack.com → Project Settings → Project tab → Copy API Key

### Step 4: Add API Tracing (Dio)

```dart
import 'package:dio/dio.dart';
import 'package:nivostack_sdk/nivostack_sdk.dart';

final dio = Dio();
dio.interceptors.add(NivoStackDioInterceptor());  // Automatic API tracing
```

### Step 5: Add Screen Tracking (GoRouter)

```dart
import 'package:go_router/go_router.dart';
import 'package:nivostack_sdk/nivostack_sdk.dart';

final router = GoRouter(
  observers: [NivoStackRouteObserver()],  // Automatic screen tracking
  routes: [
    // ... your routes
  ],
);
```

---

## ✅ That's It!

Your Merchant App is now integrated with NivoStack SDK. All HTTP requests and screen navigations will be automatically tracked.

---

## 📋 What Changed from Old SDK?

**Before:**
```dart
await NivoStack.init(
  apiKey: 'key',
  ingestUrl: 'https://ingest.nivostack.com',  // ❌ Removed
  controlUrl: 'https://api.nivostack.com',     // ❌ Removed
);
```

**After:**
```dart
await NivoStack.init(
  apiKey: 'key',  // ✅ Only this needed
);
```

**Everything else stays the same!**

---

## 📖 Full Documentation

For detailed instructions, see: `docs/guides/MERCHANT_APP_SDK_INTEGRATION.md`

---

**Last Updated**: December 31, 2024

