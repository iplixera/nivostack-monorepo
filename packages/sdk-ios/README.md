# NivoStack iOS SDK

iOS SDK for NivoStack - Mobile app monitoring and configuration platform.

## Features

- ✅ **API Tracking** - Automatically track HTTP requests and responses
- ✅ **Logging** - Send logs to dashboard with configurable levels
- ✅ **Crash Reporting** - Capture and report app crashes
- ✅ **Session Tracking** - Track user sessions with context and metrics
- ✅ **Screen Tracking** - Track screen views and navigation flow
- ✅ **Business Configuration** - Remote key-value configuration
- ✅ **Localization** - Remote translation strings
- ✅ **Device Debug Mode** - Selective tracking for specific devices
- ✅ **Offline Support** - Queue events when offline
- ✅ **Config Caching** - Instant app startup with cached configs

## Requirements

- iOS 13.0+
- Swift 5.5+
- Xcode 14.0+

## Installation

### Swift Package Manager

Add the following to your `Package.swift`:

```swift
dependencies: [
    .package(url: "https://github.com/iplixera/nivostack-monorepo.git", from: "1.0.0")
]
```

Or add via Xcode:
1. File → Add Packages...
2. Enter repository URL: `https://github.com/iplixera/nivostack-monorepo.git`
3. Select version: `1.0.0` or later
4. Add to your target

## Quick Start

### 1. Initialize SDK

In your `AppDelegate.swift` or `@main` app file:

```swift
import NivoStack

func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    
    // Initialize NivoStack SDK
    NivoStack.initialize(
        apiKey: "your-project-api-key",
        enabled: true,
        syncIntervalMinutes: 15 // Optional: sync every 15 minutes (nil = only lifecycle sync)
    ) { result in
        switch result {
        case .success(let sdk):
            print("NivoStack initialized successfully")
            print("Device Code: \(sdk.getDeviceCode() ?? "N/A")")
        case .failure(let error):
            print("NivoStack initialization failed: \(error)")
        }
    }
    
    return true
}
```

### 2. Track API Calls

```swift
import NivoStack

// Track API request
NivoStack.shared?.trackApiTrace(
    url: "https://api.example.com/users",
    method: "GET",
    statusCode: 200,
    duration: 0.5
)
```

### 3. Log Messages

```swift
import NivoStack

// Log with level
NivoStack.shared?.log(
    level: "info",
    message: "User logged in",
    tag: "auth"
)

// Log with metadata
NivoStack.shared?.log(
    level: "error",
    message: "Failed to load data",
    tag: "network",
    metadata: ["endpoint": "/api/data", "retryCount": 3]
)
```

### 4. Track Screens

```swift
import NivoStack

override func viewDidAppear(_ animated: Bool) {
    super.viewDidAppear(animated)
    
    // Track screen view
    NivoStack.shared?.trackScreen("HomeScreen")
}
```

### 5. Report Crashes

```swift
import NivoStack

// Report crash
NivoStack.shared?.reportCrash(
    message: "Unexpected error occurred",
    stackTrace: stackTrace,
    metadata: ["userId": "123", "action": "checkout"]
)
```

### 6. Business Configuration

```swift
import NivoStack

// Get business config
let businessConfig = NivoStack.shared?.getBusinessConfig()

// Fetch configs
businessConfig?.fetchAll { result in
    switch result {
    case .success(let configs):
        // Get string value
        let apiUrl = businessConfig.getString("api_url", defaultValue: "https://api.example.com")
        
        // Get boolean value
        let isFeatureEnabled = businessConfig.getBool("enable_new_feature", defaultValue: false)
        
        // Get JSON value
        if let config = businessConfig.getJson("app_settings") {
            // Use config
        }
    case .failure(let error):
        print("Failed to fetch configs: \(error)")
    }
}
```

### 7. Localization

```swift
import NivoStack

// Get localization
let localization = NivoStack.shared?.getLocalization()

// Set language
localization?.setLanguage("en") { result in
    switch result {
    case .success:
        // Get translation
        let welcomeText = localization?.translate("welcome_message", defaultValue: "Welcome")
    case .failure(let error):
        print("Failed to set language: \(error)")
    }
}

// Shorthand
let text = localization?.t("button_submit", defaultValue: "Submit")
```

### 8. User Association

```swift
import NivoStack

// Associate user with device (after login)
NivoStack.shared?.setUser(
    userId: "user123",
    email: "user@example.com",
    name: "John Doe"
) { result in
    switch result {
    case .success:
        print("User associated successfully")
    case .failure(let error):
        print("Failed to associate user: \(error)")
    }
}

// Clear user (on logout)
NivoStack.shared?.clearUser { result in
    // Handle result
}
```

### 9. Refresh Configuration

```swift
import NivoStack

// Refresh config from server
NivoStack.shared?.refreshConfig(forceRefresh: true) { result in
    switch result {
    case .success:
        print("Config refreshed successfully")
    case .failure(let error):
        print("Failed to refresh config: \(error)")
    }
}
```

### 10. Flush Events

```swift
import NivoStack

// Manually flush pending traces and logs
NivoStack.shared?.flush { result in
    switch result {
    case .success:
        print("Events flushed successfully")
    case .failure(let error):
        print("Failed to flush events: \(error)")
    }
}
```

## Async/Await Support (iOS 15+)

For iOS 15+, you can use async/await:

```swift
import NivoStack

@available(iOS 15.0, *)
func initializeSDK() async throws {
    let sdk = try await NivoStack.initialize(
        apiKey: "your-api-key",
        enabled: true
    )
    print("SDK initialized: \(sdk.getDeviceCode() ?? "N/A")")
}
```

## Configuration

### Sync Interval

- `nil` (default): Only syncs when app comes to foreground (lifecycle sync)
- `TimeInterval`: Syncs periodically while app is active (e.g., `15 * 60` for 15 minutes)

### Build Mode

The SDK automatically detects build mode:
- **Debug builds**: Uses `"preview"` build mode
- **Release builds**: Uses `"production"` build mode

This allows you to have separate configurations for debug and release builds.

## Architecture

- **Pure Foundation**: No external dependencies, uses only Apple's built-in frameworks
- **Hybrid Async Pattern**: Supports both completion handlers (iOS 13+) and async/await (iOS 15+)
- **Dual API Endpoints**: Separate ingest and control URLs for optimal performance
- **Config Caching**: Instant startup with cached configurations
- **ETag Support**: Efficient conditional requests for config updates

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please visit: https://github.com/iplixera/nivostack-monorepo

