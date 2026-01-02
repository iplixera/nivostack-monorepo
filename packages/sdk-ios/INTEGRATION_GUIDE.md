# NivoStack iOS SDK Integration Guide

Complete guide for integrating the NivoStack iOS SDK into your app.

## Installation

### Swift Package Manager (Recommended)

1. **In Xcode:**
   - File → Add Packages...
   - Enter repository URL: `https://github.com/iplixera/nivostack-monorepo.git`
   - Select version: `1.0.0` or later
   - Add to your target

2. **Or add to Package.swift:**
   ```swift
   dependencies: [
       .package(url: "https://github.com/iplixera/nivostack-monorepo.git", from: "1.0.0")
   ]
   ```

### Local Development

For local development, add the SDK as a local package:

1. File → Add Packages... → Add Local...
2. Navigate to `packages/sdk-ios` directory
3. Select and add

## Quick Start

### 1. Initialize SDK

In your `AppDelegate.swift`:

```swift
import NivoStack

func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    
    NivoStack.initialize(
        apiKey: "your-project-api-key",
        enabled: true
    ) { result in
        switch result {
        case .success(let sdk):
            print("SDK initialized: \(sdk.getDeviceCode() ?? "N/A")")
        case .failure(let error):
            print("SDK init failed: \(error)")
        }
    }
    
    return true
}
```

### 2. Track API Calls

```swift
NivoStack.shared?.trackApiTrace(
    url: "https://api.example.com/users",
    method: "GET",
    statusCode: 200,
    duration: 0.5
)
```

### 3. Log Messages

```swift
NivoStack.shared?.log(
    level: "info",
    message: "User logged in",
    tag: "auth"
)
```

### 4. Track Screens

```swift
override func viewDidAppear(_ animated: Bool) {
    super.viewDidAppear(animated)
    NivoStack.shared?.trackScreen("HomeScreen")
}
```

## Configuration Options

### Sync Interval

```swift
// Only lifecycle sync (when app comes to foreground)
NivoStack.initialize(apiKey: "key", syncIntervalMinutes: nil)

// Periodic sync every 15 minutes
NivoStack.initialize(apiKey: "key", syncIntervalMinutes: 15)
```

### Custom URLs

```swift
NivoStack.initialize(
    apiKey: "key",
    ingestUrl: "https://custom-ingest.example.com",
    controlUrl: "https://custom-control.example.com"
)
```

### Enable/Disable

```swift
// Disable SDK in debug builds
#if DEBUG
let enabled = false
#else
let enabled = true
#endif

NivoStack.initialize(apiKey: "key", enabled: enabled)
```

## Advanced Usage

### User Association

```swift
// After user login
NivoStack.shared?.setUser(
    userId: "user123",
    email: "user@example.com",
    name: "John Doe"
)

// On logout
NivoStack.shared?.clearUser()
```

### Business Configuration

```swift
let config = NivoStack.shared?.getBusinessConfig()

config?.fetchAll { result in
    switch result {
    case .success:
        let apiUrl = config?.getString("api_url", defaultValue: "https://api.example.com")
        let isEnabled = config?.getBool("feature_enabled", defaultValue: false)
    case .failure(let error):
        print("Error: \(error)")
    }
}
```

### Localization

```swift
let localization = NivoStack.shared?.getLocalization()

localization?.setLanguage("en") { result in
    if case .success = result {
        let text = localization?.translate("welcome_message", defaultValue: "Welcome")
    }
}
```

### Manual Refresh

```swift
NivoStack.shared?.refreshConfig(forceRefresh: true) { result in
    // Handle result
}
```

### Flush Events

```swift
NivoStack.shared?.flush { result in
    // Events sent to server
}
```

## Error Handling

Always check if SDK is initialized:

```swift
guard let sdk = NivoStack.shared else {
    print("SDK not initialized")
    return
}

sdk.trackScreen("ScreenName")
```

## Best Practices

1. **Initialize Early**: Initialize SDK in `application(_:didFinishLaunchingWithOptions:)`

2. **Check Status**: Use `isFullyInitialized()` to check if SDK is ready

3. **Handle Errors**: Always handle completion callbacks for async operations

4. **Screen Tracking**: Track screens in `viewDidAppear(_:)` for accurate navigation flow

5. **User Association**: Call `setUser()` after login, `clearUser()` on logout

6. **Config Refresh**: Let SDK handle automatic refresh, use manual refresh sparingly

7. **Event Flushing**: SDK flushes automatically, manual flush only when needed (e.g., before app termination)

## Troubleshooting

### SDK Not Initializing
- Check API key is correct
- Verify network connectivity
- Check console logs for errors

### Events Not Appearing
- Ensure feature flags are enabled in NivoStack Studio
- Check device tracking is enabled
- Verify device is registered (check device code)

### Build Errors
- Ensure iOS deployment target is 13.0+
- Clean build folder (⌘⇧K)
- Verify SDK package is properly added

## Support

For issues and questions:
- GitHub: https://github.com/iplixera/nivostack-monorepo
- Documentation: See `README.md` in SDK package

