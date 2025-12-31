# iOS SDK Integration Guide

Complete guide for integrating NivoStack iOS SDK into your iOS application.

## Overview

NivoStack iOS SDK provides:
- **API Tracing**: Automatic network request/response tracking
- **Screen Tracking**: View controller navigation monitoring
- **Business Configuration**: Remote configuration management
- **Localization**: Multi-language support with remote translations
- **Device Registration**: Automatic device identification
- **Session Tracking**: User session context and metrics
- **Logging**: Structured logging with levels
- **Crash Reporting**: Automatic crash detection
- **User Management**: Associate users with devices

## Installation

### Option 1: Swift Package Manager (Recommended)

Add to your `Package.swift` or Xcode:

```
https://github.com/iplixera/nivostack-ios-sdk
```

### Option 2: CocoaPods

Add to your `Podfile`:

```ruby
pod 'NivoStack', :git => 'https://github.com/iplixera/nivostack-ios-sdk.git'
```

### Option 3: Manual Integration

1. Clone the SDK repository
2. Add `NivoStack.xcframework` to your project
3. Link in Build Phases

## Quick Start

### 1. Initialize SDK

In your `AppDelegate.swift` or `@main` App file:

```swift
import NivoStack

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
    func application(_ application: UIApplication, 
                     didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        
        // Initialize NivoStack SDK
        NivoStack.shared.configure(
            ingestUrl: "https://ingest.nivostack.com",  // For sending data
            controlUrl: "https://api.nivostack.com",    // For fetching config
            apiKey: "your-project-api-key",            // Get from dashboard
            projectId: "your-project-id"               // Get from dashboard
        )
        
        return true
    }
}
```

**Get API Credentials:**
1. Go to: https://studio.nivostack.com
2. Create or select a project
3. Go to Project Settings
4. Copy **API Key** and **Project ID**

### 2. Add API Tracing

#### Using URLSession

```swift
import NivoStack

// Wrap your network calls
let request = URLRequest(url: URL(string: "https://api.example.com/users")!)
let startTime = Date()

URLSession.shared.dataTask(with: request) { data, response, error in
    let duration = Int(Date().timeIntervalSince(startTime) * 1000)
    
    // Trace the API call
    NivoStack.shared.trace(
        request: request,
        response: response as? HTTPURLResponse,
        data: data,
        duration: duration,
        error: error
    )
    
    // Handle response...
}.resume()
```

#### Using Alamofire

```swift
import Alamofire
import NivoStack

// Create interceptor
class NivoStackInterceptor: RequestInterceptor {
    func adapt(_ urlRequest: URLRequest, for session: Session, completion: @escaping (Result<URLRequest, Error>) -> Void) {
        completion(.success(urlRequest))
    }
    
    func retry(_ request: Request, for session: Session, dueTo error: Error, completion: @escaping (RetryResult) -> Void) {
        completion(.doNotRetry)
    }
}

// Use with Alamofire
let session = Session(interceptor: NivoStackInterceptor())

session.request("https://api.example.com/users").response { response in
    // Request is automatically traced
}
```

### 3. Enable Screen Tracking

Track view controller navigation:

```swift
import NivoStack

class ViewController: UIViewController {
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        
        // Track screen view
        NivoStack.shared.trackScreen(name: "HomeScreen")
    }
}
```

Or use a navigation delegate:

```swift
extension AppDelegate: UINavigationControllerDelegate {
    func navigationController(_ navigationController: UINavigationController, 
                            didShow viewController: UIViewController, 
                            animated: Bool) {
        let screenName = String(describing: type(of: viewController))
        NivoStack.shared.trackScreen(name: screenName)
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

## Features

### API Tracing

Automatic or manual API request tracking:

```swift
import NivoStack

// Manual tracing
let request = URLRequest(url: url)
let startTime = Date()

URLSession.shared.dataTask(with: request) { data, response, error in
    let duration = Int(Date().timeIntervalSince(startTime) * 1000)
    
    NivoStack.shared.trace(
        request: request,
        response: response as? HTTPURLResponse,
        data: data,
        duration: duration,
        error: error
    )
}.resume()
```

### Screen Tracking

Track screen navigation:

```swift
import NivoStack

// In viewDidAppear
override func viewDidAppear(_ animated: Bool) {
    super.viewDidAppear(animated)
    NivoStack.shared.trackScreen(name: "ProductDetail")
}
```

### Business Configuration

Fetch and cache remote configuration:

```swift
import NivoStack

// Get configuration value
let config = NivoStack.shared.businessConfig

// Get string value
let apiUrl = config.getString(key: "api_url", defaultValue: "https://api.example.com")

// Get boolean value
let isFeatureEnabled = config.getBoolean(key: "feature_enabled", defaultValue: false)

// Get integer value
let maxRetries = config.getInt(key: "max_retries", defaultValue: 3)

// Get double value
let price = config.getDouble(key: "product_price", defaultValue: 0.0)

// Refresh configuration
config.refresh { success in
    if success {
        print("Configuration updated")
    }
}
```

### Localization

Manage translations remotely:

```swift
import NivoStack

let localization = NivoStack.shared.localization

// Set language
localization.setLanguage("en")

// Get translation
let welcomeText = localization.translate(key: "welcome_message", defaultValue: "Welcome")

// Refresh translations
localization.refresh { success in
    if success {
        print("Translations updated")
    }
}
```

### User Management

Associate users with devices:

```swift
import NivoStack

// Set user
NivoStack.shared.setUser(
    userId: "user123",
    email: "user@example.com",
    name: "John Doe"
)

// Clear user
NivoStack.shared.clearUser()
```

### Logging

Send structured logs:

```swift
import NivoStack

// Send log
NivoStack.shared.log(
    message: "User logged in",
    level: "info",
    tags: ["auth", "user"]
)
```

### Crash Reporting

Report crashes:

```swift
import NivoStack

// In your error handler
func handleError(_ error: Error) {
    NivoStack.shared.crash(
        message: error.localizedDescription,
        stackTrace: Thread.callStackSymbols.joined(separator: "\n")
    )
}
```

## Complete Example

```swift
import UIKit
import NivoStack

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
    func application(_ application: UIApplication, 
                     didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        
        // Initialize SDK
        NivoStack.shared.configure(
            ingestUrl: "https://ingest.nivostack.com",
            controlUrl: "https://api.nivostack.com",
            apiKey: "your-api-key",
            projectId: "your-project-id"
        )
        
        return true
    }
}

// In your ViewController
class HomeViewController: UIViewController {
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        
        // Track screen
        NivoStack.shared.trackScreen(name: "Home")
        
        // Use business config
        let config = NivoStack.shared.businessConfig
        let apiUrl = config.getString(key: "api_url", defaultValue: "https://api.example.com")
        
        // Use localization
        let localization = NivoStack.shared.localization
        let welcomeText = localization.translate(key: "welcome", defaultValue: "Welcome")
        
        // Make API call (will be traced)
        makeAPICall(url: apiUrl)
    }
    
    func makeAPICall(url: String) {
        let request = URLRequest(url: URL(string: url)!)
        let startTime = Date()
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            let duration = Int(Date().timeIntervalSince(startTime) * 1000)
            
            NivoStack.shared.trace(
                request: request,
                response: response as? HTTPURLResponse,
                data: data,
                duration: duration,
                error: error
            )
        }.resume()
    }
}
```

## Testing

### Test in Simulator

1. Update API credentials in `AppDelegate`
2. Run the app
3. Check dashboard for events

### Test on Device

1. Update API credentials
2. Build and install on device
3. Test features
4. Check dashboard

## Troubleshooting

### SDK Not Initializing
- Verify API key and project ID are correct
- Check network connectivity
- Verify URLs are accessible
- Check console logs for errors

### Events Not Appearing
- Check feature flags are enabled in dashboard
- Verify device is registered
- Check tracking mode settings
- Ensure tracing is called

### Build Errors
- Clean build folder: `Cmd+Shift+K`
- Check Swift version (requires Swift 5.9+)
- Verify iOS deployment target (requires iOS 13.0+)

## API Reference

### NivoStack.shared.configure()

Initialize the SDK.

**Parameters:**
- `ingestUrl`: URL for sending data (default: `https://ingest.nivostack.com`)
- `controlUrl`: URL for fetching config (default: `https://api.nivostack.com`)
- `apiKey`: Project API key
- `projectId`: Project ID

### NivoStack.shared

Access the SDK singleton.

**Properties:**
- `businessConfig`: Business configuration client
- `localization`: Localization client

**Methods:**
- `trace(request:response:data:duration:error:)`: Trace API call
- `trackScreen(name:)`: Track screen view
- `setUser(userId:email:name:)`: Associate user
- `clearUser()`: Remove user association
- `log(message:level:tags:)`: Send log
- `crash(message:stackTrace:)`: Report crash

## Next Steps

1. ✅ Initialize SDK in AppDelegate
2. ✅ Add API tracing to network calls
3. ✅ Track screen views
4. ✅ Test with your app
5. ✅ Configure in dashboard

## Related Documentation

- [Flutter SDK Integration](./FLUTTER_SDK_INTEGRATION.md) (works on iOS)
- [Android SDK Integration](./ANDROID_SDK_INTEGRATION.md)


