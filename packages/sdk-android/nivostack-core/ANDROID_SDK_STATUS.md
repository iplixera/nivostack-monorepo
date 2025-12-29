# Android SDK Status

## Overview

Android SDK for NivoStack Core has been created with the same behavior as the Flutter SDK.

## Structure

```
packages/sdk-android/nivostack-core/
├── build.gradle.kts          # Gradle build configuration
├── settings.gradle.kts        # Gradle settings
├── gradle.properties          # Gradle properties
├── README.md                  # SDK documentation
├── src/main/
│   ├── AndroidManifest.xml    # Android manifest
│   └── java/com/nivostack/core/
│       ├── NivoStack.kt                    # Main SDK class
│       ├── NivoStackLifecycleObserver.kt   # Screen tracking observer
│       ├── models/
│       │   ├── DeviceInfo.kt               # Device information model
│       │   ├── FeatureFlags.kt              # Feature flags model
│       │   └── SdkSettings.kt               # SDK settings model
│       ├── clients/
│       │   ├── ApiClient.kt                 # API client (OkHttp)
│       │   ├── BusinessConfigClient.kt      # Business config client
│       │   └── LocalizationClient.kt        # Localization client
│       └── interceptors/
│           └── NivoStackInterceptor.kt     # OkHttp interceptor for API tracing
```

## Features Implemented

### ✅ Core SDK
- [x] SDK initialization with context, baseUrl, apiKey, projectId
- [x] Singleton pattern
- [x] Background initialization (non-blocking)
- [x] Cached config loading
- [x] Device registration
- [x] Session tracking
- [x] Feature flags support
- [x] SDK settings support

### ✅ API Tracing
- [x] OkHttp interceptor for automatic API tracing
- [x] Request/response capture
- [x] Error tracking
- [x] Timing information
- [x] Queue-based batching
- [x] Automatic flushing

### ✅ Screen Tracking
- [x] Activity lifecycle observer
- [x] Automatic screen name detection
- [x] Screen flow tracking
- [x] Session updates

### ✅ Business Configuration
- [x] Remote config fetching
- [x] Caching with TTL
- [x] Type-safe getters (String, Int, Boolean, Double, JSON)
- [x] Category filtering
- [x] Refresh functionality

### ✅ Localization
- [x] Translation fetching
- [x] Language management
- [x] Caching
- [x] Refresh functionality

### ✅ User Management
- [x] setUser() method
- [x] clearUser() method
- [x] User properties tracking

### ✅ Device Management
- [x] Device ID generation and persistence
- [x] Device code support
- [x] Device info collection

## Usage Example

```kotlin
// 1. Initialize SDK in Application class
class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        
        NivoStack.init(
            context = this,
            baseUrl = "https://ingest.nivostack.com",
            apiKey = "your-api-key",
            projectId = "your-project-id"
        )
        
        // Register lifecycle observer for screen tracking
        registerActivityLifecycleCallbacks(NivoStackLifecycleObserver())
    }
}

// 2. Add API tracing interceptor
val client = OkHttpClient.Builder()
    .addInterceptor(NivoStackInterceptor())
    .build()

// 3. Use business config
val config = NivoStack.getInstance().businessConfig
val apiUrl = config?.getString("api_url", "https://api.example.com")

// 4. Use localization
val localization = NivoStack.getInstance().localization
localization?.setLanguage("en")
val welcomeText = localization?.translate("welcome_message", "Welcome")
```

## Dependencies

- OkHttp 4.12.0 - HTTP client
- Gson 2.10.1 - JSON parsing
- Kotlin Coroutines - Async operations
- AndroidX Core - Android support

## Next Steps

1. Create example Android app
2. Add unit tests
3. Add ProGuard rules
4. Publish to Maven repository
5. Add Javadoc/KDoc documentation

## Differences from Flutter SDK

1. **Language**: Kotlin instead of Dart
2. **HTTP Client**: OkHttp instead of Dio
3. **Screen Tracking**: Activity lifecycle callbacks instead of route observer
4. **Storage**: SharedPreferences instead of SharedPreferences (Flutter)
5. **Async**: Coroutines instead of Futures

## Compatibility

- Minimum SDK: 21 (Android 5.0)
- Target SDK: 34 (Android 14)
- Kotlin: 1.9+
- Java: 17

