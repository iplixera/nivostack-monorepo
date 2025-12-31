# Android SDK Integration Guide

Complete guide for integrating NivoStack Android SDK into your Android application.

## Overview

NivoStack Android SDK provides:
- **API Tracing**: Automatic network request/response tracking
- **Screen Tracking**: Navigation and screen flow monitoring
- **Business Configuration**: Remote configuration management
- **Localization**: Multi-language support with remote translations
- **Device Registration**: Automatic device identification
- **Session Tracking**: User session context and metrics
- **Logging**: Structured logging with levels
- **Crash Reporting**: Automatic crash detection
- **User Management**: Associate users with devices

## Installation

### Option 1: Local Module (Development)

Add the SDK as a local module in your `settings.gradle.kts`:

```kotlin
include(":nivostack-core")
project(":nivostack-core").projectDir = File("../packages/sdk-android/nivostack-core")
```

Add dependency in your `app/build.gradle.kts`:

```kotlin
dependencies {
    implementation(project(":nivostack-core"))
}
```

### Option 2: Maven/Gradle (When Published)

```kotlin
dependencies {
    implementation("com.plixera.nivostack:core:1.0.0")
}
```

## Quick Start

### 1. Initialize SDK

In your `Application` class:

```kotlin
import com.plixera.nivostack.NivoStack

class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        
        NivoStack.init(
            context = this,
            baseUrl = "https://ingest.nivostack.com",  // Ingest API for sending data
            apiKey = "your-project-api-key",          // Get from dashboard
            projectId = "your-project-id"             // Get from dashboard
        )
    }
}
```

**Get API Credentials:**
1. Go to: https://studio.nivostack.com
2. Create or select a project
3. Go to Project Settings
4. Copy **API Key** and **Project ID**

### 2. Register Application Class

In `AndroidManifest.xml`:

```xml
<application
    android:name=".MyApplication"
    ...>
    <!-- ... -->
</application>
```

### 3. Add API Tracing Interceptor

Add the NivoStack interceptor to your OkHttp client:

```kotlin
import com.plixera.nivostack.NivoStackInterceptor
import okhttp3.OkHttpClient

val client = OkHttpClient.Builder()
    .addInterceptor(NivoStackInterceptor())
    .build()

// Use with Retrofit, etc.
val retrofit = Retrofit.Builder()
    .baseUrl("https://api.example.com")
    .client(client)
    .build()
```

### 4. Enable Screen Tracking

Register the lifecycle observer in your `Application`:

```kotlin
import com.plixera.nivostack.NivoStackLifecycleObserver

class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        
        NivoStack.init(...)
        
        // Register lifecycle observer for automatic screen tracking
        registerActivityLifecycleCallbacks(NivoStackLifecycleObserver())
    }
}
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

**Note:** Currently, Android SDK uses a single `baseUrl` for both. The SDK automatically routes requests to the correct endpoints.

## Features

### API Tracing

Automatic tracking of all HTTP requests through OkHttp:

```kotlin
// Just add the interceptor - all requests are automatically traced
val client = OkHttpClient.Builder()
    .addInterceptor(NivoStackInterceptor())
    .build()
```

**Captured Data:**
- Request URL, method, headers, body
- Response status, headers, body
- Timing information
- Error details

### Screen Tracking

Automatic screen tracking via lifecycle observer:

```kotlin
// Register in Application.onCreate()
registerActivityLifecycleCallbacks(NivoStackLifecycleObserver())
```

**Captured Data:**
- Screen names (Activity class names)
- Navigation flow
- Time spent on each screen
- Session context

### Business Configuration

Fetch and cache remote configuration:

```kotlin
import com.plixera.nivostack.NivoStack

val config = NivoStack.instance.businessConfig

// Get a string value
val apiUrl = config.getString("api_url", defaultValue = "https://api.example.com")

// Get a boolean value
val isFeatureEnabled = config.getBoolean("feature_enabled", defaultValue = false)

// Get an integer value
val maxRetries = config.getInt("max_retries", defaultValue = 3)

// Get a double value
val price = config.getDouble("product_price", defaultValue = 0.0)

// Get JSON object
val jsonConfig = config.getJson("complex_config", defaultValue = emptyMap())

// Refresh configuration from server
config.refresh { success ->
    if (success) {
        // Configuration updated
    }
}
```

### Localization

Manage translations remotely:

```kotlin
import com.plixera.nivostack.NivoStack

val localization = NivoStack.instance.localization

// Set language
localization.setLanguage("en")

// Get translation
val welcomeText = localization.translate("welcome_message", defaultValue = "Welcome")

// Refresh translations from server
localization.refresh { success ->
    if (success) {
        // Translations updated
    }
}
```

### User Management

Associate users with devices:

```kotlin
import com.plixera.nivostack.NivoStack

// Set user
NivoStack.instance.setUser(
    userId = "user123",
    email = "user@example.com",
    name = "John Doe"
)

// Clear user
NivoStack.instance.clearUser()
```

### Logging

Send structured logs:

```kotlin
import com.plixera.nivostack.NivoStack

// Send log
NivoStack.instance.log(
    message = "User logged in",
    level = "info",
    tags = listOf("auth", "user")
)
```

### Crash Reporting

Report crashes:

```kotlin
import com.plixera.nivostack.NivoStack

try {
    // Your code
} catch (e: Exception) {
    NivoStack.instance.crash(
        message = e.message ?: "Unknown error",
        stackTrace = e.stackTraceToString()
    )
    throw e
}
```

## Complete Example

```kotlin
import android.app.Application
import com.plixera.nivostack.NivoStack
import com.plixera.nivostack.NivoStackLifecycleObserver
import okhttp3.OkHttpClient
import com.plixera.nivostack.NivoStackInterceptor

class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        
        // 1. Initialize SDK
        NivoStack.init(
            context = this,
            baseUrl = "https://ingest.nivostack.com",
            apiKey = "your-api-key",
            projectId = "your-project-id"
        )
        
        // 2. Enable screen tracking
        registerActivityLifecycleCallbacks(NivoStackLifecycleObserver())
    }
}

// In your network setup
class NetworkModule {
    fun provideOkHttpClient(): OkHttpClient {
        return OkHttpClient.Builder()
            .addInterceptor(NivoStackInterceptor())  // API tracing
            .build()
    }
}

// In your Activity/Fragment
class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Use business config
        val config = NivoStack.instance.businessConfig
        val apiUrl = config.getString("api_url", "https://api.example.com")
        
        // Use localization
        val localization = NivoStack.instance.localization
        val welcomeText = localization.translate("welcome", "Welcome")
        
        // Set user when logged in
        NivoStack.instance.setUser(
            userId = "user123",
            email = "user@example.com"
        )
    }
}
```

## Testing

### Example App

A complete example app is available at:
```
packages/sdk-android/example/
```

**To run:**
```bash
cd packages/sdk-android/example
./gradlew assembleDebug
./gradlew installDebug
```

### Test Features

The example app includes buttons to test:
- SDK initialization
- API tracing
- Screen tracking
- Logging
- Crash reporting
- Business configuration
- Localization
- User management

## Troubleshooting

### SDK Not Initializing
- Verify API key and project ID are correct
- Check network connectivity
- Verify baseUrl is accessible
- Check logs for initialization errors

### Events Not Appearing
- Check feature flags are enabled in dashboard
- Verify device is registered
- Check tracking mode settings
- Ensure interceptor is added to OkHttp client

### Build Errors
- Sync Gradle files
- Clean and rebuild: `./gradlew clean build`
- Check Android SDK version (requires API 21+)

## API Reference

### NivoStack.init()

Initialize the SDK singleton.

**Parameters:**
- `context`: Application context
- `baseUrl`: Base URL for API (default: `https://ingest.nivostack.com`)
- `apiKey`: Project API key
- `projectId`: Project ID
- `enabled`: Enable/disable SDK (default: `true`)

### NivoStack.instance

Access the SDK singleton instance.

**Properties:**
- `businessConfig`: Business configuration client
- `localization`: Localization client
- `featureFlags`: Current feature flags
- `sdkSettings`: SDK settings

**Methods:**
- `setUser(userId, email?, name?)`: Associate user with device
- `clearUser()`: Remove user association
- `log(message, level, tags?)`: Send log
- `crash(message, stackTrace?)`: Report crash

## Next Steps

1. ✅ Initialize SDK in Application class
2. ✅ Add OkHttp interceptor for API tracing
3. ✅ Register lifecycle observer for screen tracking
4. ✅ Test with example app
5. ✅ Integrate into your app
6. ✅ Configure in dashboard

## Related Documentation

- [Android SDK README](../../packages/sdk-android/nivostack-core/README.md)
- [Example App README](../../packages/sdk-android/example/README.md)
- [Flutter SDK Integration](./FLUTTER_SDK_INTEGRATION.md)


