# NivoStack Core SDK for Android

NivoStack Core SDK for Android provides comprehensive mobile app monitoring and configuration features:

- **API Tracing**: Automatic network request/response tracking
- **Screen Tracking**: Navigation and screen flow monitoring
- **Business Configuration**: Remote configuration management
- **Localization**: Multi-language support with remote translations
- **Device Registration**: Automatic device identification and registration
- **Session Tracking**: User session context and metrics
- **Logging**: Structured logging with levels and tags
- **Crash Reporting**: Automatic crash detection and reporting
- **User Management**: Associate users with devices for filtering

## Installation

Add to your `build.gradle.kts`:

```kotlin
dependencies {
    implementation("com.nivostack:core:1.0.0")
}
```

## Quick Start

### 1. Initialize SDK

In your `Application` class:

```kotlin
import com.nivostack.core.NivoStack

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

### 2. Add API Tracing Interceptor

Add the NivoStack interceptor to your OkHttp client:

```kotlin
import com.nivostack.core.NivoStackInterceptor
import okhttp3.OkHttpClient

val client = OkHttpClient.Builder()
    .addInterceptor(NivoStackInterceptor())
    .build()
```

### 3. Enable Screen Tracking

Register the lifecycle observer in your `Application`:

```kotlin
import com.nivostack.core.NivoStackLifecycleObserver

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
import com.nivostack.core.NivoStack

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
import com.nivostack.core.NivoStack

val localization = NivoStack.instance.localization

// Set language
localization.setLanguage("en")

// Get translation
val welcomeText = localization.translate("welcome_message", defaultValue = "Welcome")

// Refresh translations from server
localization.refresh()
```

## Features

### API Tracing

The SDK automatically tracks all HTTP requests made through OkHttp when you add the `NivoStackInterceptor`. It captures:
- Request URL, method, headers, body
- Response status, headers, body
- Timing information
- Error details

### Screen Tracking

Automatically tracks screen navigation when you register `NivoStackLifecycleObserver`. Captures:
- Screen names (Activity class names)
- Navigation flow
- Time spent on each screen
- Session context

### Business Configuration

Fetch and cache remote configuration values:
- String, integer, boolean, decimal, JSON types
- Categorized configurations
- Version tracking
- Automatic refresh

### Localization

Manage translations remotely:
- Multi-language support
- RTL language support
- Translation caching
- OTA updates

## License

Copyright (c) 2024 NivoStack

