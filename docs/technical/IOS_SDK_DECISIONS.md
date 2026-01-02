# iOS SDK Technical Decisions

## 1. Async Pattern: Swift 5.5+ async/await vs Completion Handlers

### Option A: Swift 5.5+ async/await (Modern Approach)

**What it is:**
- Introduced in Swift 5.5 (iOS 15.0+)
- Uses `async`/`await` keywords for asynchronous operations
- Similar to async/await in JavaScript/TypeScript

**Example:**
```swift
// Modern async/await
func fetchConfig() async throws -> Config {
    let url = URL(string: "https://api.example.com/config")!
    let (data, _) = try await URLSession.shared.data(from: url)
    return try JSONDecoder().decode(Config.self, from: data)
}

// Usage
Task {
    do {
        let config = try await fetchConfig()
        print(config)
    } catch {
        print("Error: \(error)")
    }
}
```

**Pros:**
- ✅ Cleaner, more readable code
- ✅ No callback hell (nested closures)
- ✅ Better error handling
- ✅ Modern Swift standard
- ✅ Easier to test
- ✅ Better performance (no closure overhead)

**Cons:**
- ❌ Requires iOS 15.0+ (if we want to support iOS 13.0+, we need completion handlers too)
- ❌ Newer feature (less widespread adoption)

---

### Option B: Completion Handlers (Traditional Approach)

**What it is:**
- Traditional Swift pattern using closures/callbacks
- Works on all iOS versions
- Similar to callbacks in JavaScript

**Example:**
```swift
// Traditional completion handlers
func fetchConfig(completion: @escaping (Result<Config, Error>) -> Void) {
    let url = URL(string: "https://api.example.com/config")!
    URLSession.shared.dataTask(with: url) { data, response, error in
        if let error = error {
            completion(.failure(error))
            return
        }
        guard let data = data else {
            completion(.failure(URLError(.badServerResponse)))
            return
        }
        do {
            let config = try JSONDecoder().decode(Config.self, from: data)
            completion(.success(config))
        } catch {
            completion(.failure(error))
        }
    }.resume()
}

// Usage
fetchConfig { result in
    switch result {
    case .success(let config):
        print(config)
    case .failure(let error):
        print("Error: \(error)")
    }
}
```

**Pros:**
- ✅ Works on iOS 13.0+ (all versions)
- ✅ Widely understood pattern
- ✅ More compatible with older codebases

**Cons:**
- ❌ More verbose code
- ❌ Callback hell with nested closures
- ❌ Harder to read and maintain
- ❌ More error-prone

---

### Option C: Hybrid Approach (Recommended)

**What it is:**
- Provide both async/await AND completion handlers
- Use `@available` to mark async/await for iOS 15+
- Use completion handlers for iOS 13-14

**Example:**
```swift
// Completion handler (iOS 13+)
func fetchConfig(completion: @escaping (Result<Config, Error>) -> Void) {
    // Implementation
}

// Async/await (iOS 15+)
@available(iOS 15.0, *)
func fetchConfig() async throws -> Config {
    return try await withCheckedThrowingContinuation { continuation in
        fetchConfig { result in
            continuation.resume(with: result)
        }
    }
}
```

**Pros:**
- ✅ Best of both worlds
- ✅ Supports iOS 13.0+ with completion handlers
- ✅ Modern API for iOS 15+ users
- ✅ Backward compatible

**Cons:**
- ❌ More code to maintain (two APIs)
- ❌ Slightly larger SDK size

---

## 2. Dependencies: Pure Foundation vs Third-Party Libraries

### Option A: Pure Foundation (No External Dependencies)

**What it is:**
- Use only Apple's built-in frameworks
- No CocoaPods/SPM dependencies
- Everything built from scratch

**What we'd use:**
- `Foundation` - URLSession, JSONDecoder, UserDefaults, etc.
- `UIKit` - For lifecycle observation
- `Combine` - For reactive programming (optional, iOS 13+)

**Example:**
```swift
import Foundation

// HTTP requests
URLSession.shared.dataTask(with: url) { ... }

// JSON parsing
JSONDecoder().decode(Model.self, from: data)

// Caching
UserDefaults.standard.set(data, forKey: "cache")
```

**Pros:**
- ✅ No external dependencies
- ✅ Smaller SDK size
- ✅ No version conflicts
- ✅ Faster build times
- ✅ More reliable (no breaking changes from dependencies)
- ✅ Easier to maintain
- ✅ Works offline (no dependency resolution)

**Cons:**
- ❌ More code to write ourselves
- ❌ Need to implement everything from scratch
- ❌ No battle-tested libraries (but Foundation is battle-tested)

**What we'd need to implement:**
- HTTP client (URLSession is fine)
- JSON parsing (JSONDecoder is fine)
- Caching (UserDefaults is fine)
- Device info (UIDevice is fine)
- Everything else is available in Foundation

---

### Option B: Third-Party Libraries

**What it is:**
- Use popular Swift packages
- Add dependencies via SPM

**Popular options:**
- **Alamofire** - HTTP networking (alternative to URLSession)
- **SwiftyJSON** - JSON parsing (alternative to JSONDecoder)
- **KeychainAccess** - Keychain wrapper (for secure storage)
- **Reachability** - Network status monitoring

**Example:**
```swift
import Alamofire
import SwiftyJSON

// HTTP requests
AF.request(url).responseJSON { response in
    // Handle response
}

// JSON parsing
let json = JSON(data: data)
let value = json["key"].string
```

**Pros:**
- ✅ Less code to write
- ✅ Battle-tested libraries
- ✅ More features out of the box
- ✅ Community support

**Cons:**
- ❌ Larger SDK size (dependencies included)
- ❌ Version conflicts possible
- ❌ Slower build times
- ❌ Dependency updates can break things
- ❌ License compliance needed
- ❌ More complex integration

---

## Recommendation

### For Async Pattern: **Hybrid Approach**

**Why:**
- Supports iOS 13.0+ (your requirement)
- Provides modern API for iOS 15+ users
- Best compatibility
- Not much extra code (can wrap completion handlers)

**Implementation:**
```swift
// Base implementation with completion handler
func fetchConfig(completion: @escaping (Result<Config, Error>) -> Void) {
    // Core implementation here
}

// Modern async/await wrapper
@available(iOS 15.0, *)
func fetchConfig() async throws -> Config {
    return try await withCheckedThrowingContinuation { continuation in
        fetchConfig { result in
            continuation.resume(with: result)
        }
    }
}
```

---

### For Dependencies: **Pure Foundation**

**Why:**
- Foundation has everything we need:
  - ✅ `URLSession` - HTTP client (excellent)
  - ✅ `JSONDecoder` - JSON parsing (excellent)
  - ✅ `UserDefaults` - Caching (perfect for our needs)
  - ✅ `UIDevice` - Device info
  - ✅ `Bundle` - App info
- No external dependencies = smaller, faster, more reliable
- Foundation is battle-tested and maintained by Apple
- Matches Flutter SDK approach (uses Dio, but we can use URLSession)

**What we get:**
- Smaller SDK size
- Faster builds
- No dependency conflicts
- More control over implementation
- Better for production use

**What we might add later (if needed):**
- `Combine` framework (built-in, iOS 13+) - for reactive programming
- But not required for MVP

---

## Comparison Table

| Feature | Pure Foundation | Third-Party Libraries |
|---------|----------------|----------------------|
| **SDK Size** | Smaller (~50KB) | Larger (~200KB+) |
| **Build Time** | Faster | Slower |
| **Dependencies** | None | Multiple |
| **Maintenance** | Easier | Harder |
| **Reliability** | High | Medium |
| **Features** | Basic but sufficient | More features |
| **License** | No issues | Need to check |

---

## Final Recommendation

1. **Async Pattern**: **Hybrid** (completion handlers + async/await wrapper)
   - Supports iOS 13.0+
   - Modern API for iOS 15+
   - Best compatibility

2. **Dependencies**: **Pure Foundation**
   - No external dependencies
   - Smaller, faster, more reliable
   - Foundation has everything we need

This matches the Flutter SDK approach (minimal dependencies) and Android SDK approach (pure Kotlin/OkHttp).

---

## Code Example: Hybrid Approach with Pure Foundation

```swift
import Foundation

public class NivoStackApiClient {
    private let baseURL: String
    private let apiKey: String
    
    // Completion handler version (iOS 13+)
    func getSdkInit(
        deviceId: String,
        completion: @escaping (Result<SdkInitResponse, Error>) -> Void
    ) {
        let url = URL(string: "\(baseURL)/api/sdk-init")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue(apiKey, forHTTPHeaderField: "X-API-Key")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body = ["deviceId": deviceId]
        request.httpBody = try? JSONEncoder().encode(body)
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            guard let data = data else {
                completion(.failure(URLError(.badServerResponse)))
                return
            }
            do {
                let response = try JSONDecoder().decode(SdkInitResponse.self, from: data)
                completion(.success(response))
            } catch {
                completion(.failure(error))
            }
        }.resume()
    }
    
    // Async/await version (iOS 15+)
    @available(iOS 15.0, *)
    func getSdkInit(deviceId: String) async throws -> SdkInitResponse {
        return try await withCheckedThrowingContinuation { continuation in
            getSdkInit(deviceId: deviceId) { result in
                continuation.resume(with: result)
            }
        }
    }
}
```

This gives us:
- ✅ iOS 13.0+ support (completion handlers)
- ✅ Modern API for iOS 15+ (async/await)
- ✅ No external dependencies (Pure Foundation)
- ✅ Clean, maintainable code

