# NivoStack Core SDK for Android - v1.0.0 Release Notes

**Release Date**: December 29, 2024  
**Package**: `com.plixera.nivostack`  
**Maven Coordinates**: `com.plixera.nivostack:core:1.0.0`  
**Maven Central**: [Coming Soon]

---

## 🎉 Initial Public Release

We're excited to announce the first public release of **NivoStack Core SDK for Android**! This SDK provides comprehensive mobile app monitoring, remote configuration, and localization features for Android applications.

---

## ✨ Features

### 🔍 API Tracing
Automatically track HTTP requests and responses made through OkHttp:
- Request/response capture with headers and bodies
- Timing information for performance monitoring
- Error tracking and categorization
- Automatic integration via `NivoStackInterceptor`

### 📱 Screen Tracking
Monitor user navigation and screen flow:
- Automatic Activity lifecycle tracking
- Navigation flow analysis
- Time spent on each screen
- Session context and metrics

### 📝 Logging
Structured logging with multiple levels:
- Log levels: debug, info, warn, error
- Tag-based organization
- Structured data support
- Automatic log batching

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

### Gradle (Kotlin DSL)

Add to your `build.gradle.kts`:

```kotlin
dependencies {
    implementation("com.plixera.nivostack:core:1.0.0")
}
```

### Gradle (Groovy)

Add to your `build.gradle`:

```groovy
dependencies {
    implementation 'com.plixera.nivostack:core:1.0.0'
}
```

---

## 🚀 Quick Start

### 1. Initialize the SDK

In your `Application` class:

```kotlin
import com.plixera.nivostack.NivoStack

class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        
        NivoStack.init(
            context = this,
            baseUrl = "https://ingest.nivostack.com",
            apiKey = "your-project-api-key",
            projectId = "your-project-id"
        )
    }
}
```

Don't forget to register your Application class in `AndroidManifest.xml`:

```xml
<application
    android:name=".MyApplication"
    ...>
</application>
```

### 2. Add API Tracing

Add the NivoStack interceptor to your OkHttp client:

```kotlin
import com.plixera.nivostack.interceptors.NivoStackInterceptor
import okhttp3.OkHttpClient

val client = OkHttpClient.Builder()
    .addInterceptor(NivoStackInterceptor())
    .build()
```

### 3. Enable Screen Tracking

Register the lifecycle observer in your `Application`:

```kotlin
import com.plixera.nivostack.NivoStackLifecycleObserver

class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        
        // Initialize SDK
        NivoStack.init(...)
        
        // Register lifecycle observer for screen tracking
        registerActivityLifecycleCallbacks(NivoStackLifecycleObserver())
    }
}
```

### 4. Use Business Configuration

```kotlin
import com.plixera.nivostack.NivoStack

val config = NivoStack.instance.businessConfig

// Get a string value
val apiUrl = config.getString("api_url", defaultValue = "https://api.example.com")

// Get a boolean value
val isFeatureEnabled = config.getBoolean("feature_enabled", defaultValue = false)

// Get an integer value
val maxRetries = config.getInt("max_retries", defaultValue = 3)

// Refresh configuration from server
config.refresh()
```

### 5. Use Localization

```kotlin
import com.plixera.nivostack.NivoStack

val localization = NivoStack.instance.localization

// Set language
localization.setLanguage("en")

// Get translation
val welcomeText = localization.translate("welcome_message", defaultValue = "Welcome")

// Refresh translations from server
localization.refresh()
```

---

## 📋 Requirements

- **Minimum SDK**: API 21 (Android 5.0 Lollipop)
- **Target SDK**: API 34 (Android 14)
- **Kotlin**: 1.9+
- **Java**: 17+

---

## 🔗 Documentation

- [Full Documentation](https://github.com/nivostack/nivostack-monorepo/tree/main/packages/sdk-android/nivostack-core)
- [API Reference](https://javadoc.io/doc/com.plixera.nivostack/core/latest/)
- [Example App](https://github.com/nivostack/nivostack-monorepo/tree/main/packages/sdk-android/example)

---

## 🛠️ Dependencies

- `androidx.core:core-ktx:1.13.1`
- `androidx.appcompat:appcompat:1.6.1`
- `com.google.android.material:material:1.11.0`
- `com.squareup.okhttp3:okhttp:4.12.0`
- `com.squareup.okhttp3:logging-interceptor:4.12.0`
- `com.squareup.retrofit2:retrofit:2.9.0`
- `com.squareup.retrofit2:converter-gson:2.9.0`
- `com.google.code.gson:gson:2.10.1`
- `com.google.guava:guava:32.1.3-jre`
- `androidx.lifecycle:lifecycle-process:2.7.0`

---

## 🐛 Known Issues

None at this time. Please report any issues on [GitHub Issues](https://github.com/nivostack/nivostack-monorepo/issues).

---

## 🔄 ProGuard/R8 Rules

If you're using ProGuard or R8, add these rules to your `proguard-rules.pro`:

```proguard
# NivoStack Core SDK
-keep class com.plixera.nivostack.** { *; }
-dontwarn com.plixera.nivostack.**

# Gson
-keepattributes Signature
-keepattributes *Annotation*
-keep class sun.misc.Unsafe { *; }
-keep class com.google.gson.** { *; }
```

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

