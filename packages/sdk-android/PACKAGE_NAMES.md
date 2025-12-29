# Package Names Summary

## SDK Package Names

All SDKs use the package name: **`com.plixera.nivostack`**

### Android SDK
- **Package**: `com.plixera.nivostack`
- **Namespace**: `com.plixera.nivostack`
- **Location**: `packages/sdk-android/nivostack-core/src/main/java/com/plixera/nivostack/`

### Flutter SDK
- **Package**: `nivostack_core` (pub.dev package name)
- **Dart library**: `package:nivostack_core/nivostack_core.dart`
- **Location**: `packages/sdk-flutter/`

### iOS SDK (Future)
- **Bundle ID**: `com.plixera.nivostack`
- **Framework**: `NivoStackCore`

## Example App Package Names

### Android Example
- **Package**: `com.nivostack.android`
- **Application ID**: `com.nivostack.android`
- **Location**: `packages/sdk-android/example/app/src/main/java/com/nivostack/android/`

### Flutter Example
- **Package**: `nivostack_flutter_example` (pubspec.yaml)
- **Android Application ID**: `com.nivostack.flutter`
- **iOS Bundle ID**: `com.nivostack.flutter` (set in Xcode project)
- **Location**: `packages/sdk-flutter/example/`

### iOS Example (Future)
- **Bundle ID**: `com.nivostack.ios`

## Changes Made

### Android SDK
- ✅ Changed namespace from `com.nivostack.core` to `com.plixera.nivostack`
- ✅ Moved all source files to `com/plixera/nivostack/` directory
- ✅ Updated all package declarations
- ✅ Updated all imports

### Android Example
- ✅ Changed package from `com.nivostack.example` to `com.nivostack.android`
- ✅ Changed applicationId to `com.nivostack.android`
- ✅ Moved source files to `com/nivostack/android/` directory
- ✅ Renamed Application class to `NivoStackAndroidApplication`

### Flutter Example
- ✅ Changed Android applicationId to `com.nivostack.flutter`
- ✅ Changed namespace to `com.nivostack.flutter`
- ✅ Updated pubspec.yaml name to `nivostack_flutter_example`
- ✅ Moved Kotlin files to `com/nivostack/flutter/` directory

## Usage

### Android SDK Import
```kotlin
import com.plixera.nivostack.NivoStack
import com.plixera.nivostack.interceptors.NivoStackInterceptor
```

### Flutter SDK Import
```dart
import 'package:nivostack_core/nivostack_core.dart';
```

