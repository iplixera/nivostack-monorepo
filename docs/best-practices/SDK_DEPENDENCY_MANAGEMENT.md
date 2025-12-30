# SDK Dependency Management Strategy

**Last Updated**: December 29, 2024  
**Status**: Active

---

## Question: Should SDK Dependencies Be Hidden?

**Current State**: SDKs expose dependencies (Dio, OkHttp) that apps must configure.

**Question**: Should we hide these dependencies and make them internal to the SDK?

---

## Current Approach

### Flutter SDK
- **Internal Use**: SDK uses Dio internally for its own API calls
- **Exposed**: Apps must add `DevBridgeDioInterceptor` to their own Dio instance
- **Requirement**: Apps need Dio as a dependency

### Android SDK
- **Internal Use**: SDK uses OkHttp internally for its own API calls
- **Exposed**: Apps must add `NivoStackInterceptor` to their own OkHttpClient
- **Requirement**: Apps need OkHttp as a dependency

---

## Analysis: Hidden vs Exposed Dependencies

### Option 1: Hidden Dependencies (Fully Internal)

**Approach**: SDK manages its own HTTP client internally, no app configuration needed.

#### ✅ Pros

1. **Simpler Integration**
   ```dart
   // Flutter - Just initialize, no Dio setup needed
   await DevBridge.init(...);
   // That's it! SDK handles everything internally
   ```

2. **No Dependency Conflicts**
   - SDK controls its own dependency versions
   - No version conflicts with app dependencies
   - Apps don't need to add Dio/OkHttp if they don't use them

3. **Cleaner API Surface**
   - Fewer integration steps
   - Less configuration required
   - Better developer experience

4. **SDK Controls Configuration**
   - SDK can optimize HTTP client settings
   - Consistent behavior across all apps
   - Better error handling and retry logic

#### ❌ Cons

1. **Can't Reuse Existing HTTP Client**
   - Apps with existing Dio/OkHttp can't reuse them
   - Duplicate HTTP clients (SDK's + app's)
   - More memory usage

2. **Less Flexibility**
   - Apps can't customize SDK's HTTP client
   - Can't add custom interceptors to SDK's client
   - Can't share interceptors between SDK and app

3. **API Tracing Limitation**
   - SDK can't intercept app's HTTP calls automatically
   - Apps must manually call SDK methods to track APIs
   - Less automatic tracking

4. **Dependency Bloat**
   - SDK includes HTTP client even if app doesn't need it
   - Larger SDK size

---

### Option 2: Exposed Dependencies (Current Approach)

**Approach**: Apps configure their own HTTP clients and add SDK interceptors.

#### ✅ Pros

1. **Reuse Existing HTTP Clients**
   ```dart
   // Flutter - Reuse existing Dio instance
   final dio = Dio(); // App's existing client
   dio.interceptors.add(DevBridgeDioInterceptor());
   // SDK tracks all app API calls automatically
   ```

2. **Full Flexibility**
   - Apps control HTTP client configuration
   - Can add custom interceptors
   - Can share interceptors between SDK and app

3. **Automatic API Tracing**
   - SDK interceptor automatically tracks all app API calls
   - No manual tracking needed
   - Seamless integration

4. **No Duplicate Clients**
   - Single HTTP client instance
   - Better memory efficiency
   - Consistent configuration

#### ❌ Cons

1. **More Integration Steps**
   ```dart
   // Flutter - Multiple steps required
   await DevBridge.init(...);
   final dio = Dio();
   dio.interceptors.add(DevBridgeDioInterceptor());
   ```

2. **Dependency Requirements**
   - Apps must add Dio/OkHttp as dependencies
   - Potential version conflicts
   - More setup complexity

3. **Configuration Required**
   - Apps must configure HTTP clients
   - More room for errors
   - Less "plug and play"

---

## Recommendation: Hybrid Approach

**Best Practice**: Use a **hybrid approach** that combines both benefits.

### Strategy

1. **Internal HTTP Client** (Hidden)
   - SDK uses its own HTTP client for SDK operations
   - Device registration, config fetching, logging, crashes
   - Apps don't need to configure this

2. **Optional Interceptor** (Exposed)
   - SDK provides interceptor for app's HTTP client
   - Apps can optionally add it for automatic API tracing
   - If not added, SDK still works (just no API tracing)

### Implementation

#### Flutter SDK

```dart
// SDK internal client (hidden)
class DevBridgeApiClient {
  late final Dio _dio; // Internal, not exposed
  
  DevBridgeApiClient({required this.baseUrl, required this.apiKey}) {
    _dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: Duration(seconds: 3),
      // SDK-controlled configuration
    ));
  }
  
  // SDK uses _dio internally for its own API calls
}

// Optional interceptor (exposed)
class DevBridgeDioInterceptor extends Interceptor {
  // Apps can optionally add this to their Dio instance
  // If not added, SDK still works (just no API tracing)
}
```

#### Android SDK

```kotlin
// SDK internal client (hidden)
class ApiClient(
    private val baseUrl: String,
    private val apiKey: String
) {
    private val client: OkHttpClient // Internal, not exposed
    
    init {
        client = OkHttpClient.Builder()
            .connectTimeout(3, TimeUnit.SECONDS)
            // SDK-controlled configuration
            .build()
    }
    
    // SDK uses client internally for its own API calls
}

// Optional interceptor (exposed)
class NivoStackInterceptor : Interceptor {
    // Apps can optionally add this to their OkHttpClient
    // If not added, SDK still works (just no API tracing)
}
```

---

## Benefits of Hybrid Approach

### ✅ For Apps That Use Dio/OkHttp

```dart
// Flutter
final dio = Dio(); // App's existing client
dio.interceptors.add(DevBridgeDioInterceptor()); // Optional: automatic API tracing
// SDK works, API tracing enabled
```

### ✅ For Apps That Don't Use Dio/OkHttp

```dart
// Flutter
await DevBridge.init(...); // That's it!
// SDK works, no Dio needed
// API tracing disabled (but other features work)
```

### ✅ For Apps That Want Manual API Tracking

```dart
// Flutter
await DevBridge.init(...);
// Don't add interceptor
// Manually track APIs:
DevBridge.instance.logApiCall(url: '...', method: 'GET', statusCode: 200);
```

---

## Migration Path

### Current State → Hybrid Approach

**No Breaking Changes Required**:

1. **Keep Internal Clients** (Already Done ✅)
   - SDK already has internal HTTP clients
   - Used for SDK operations (device registration, config, etc.)

2. **Make Interceptors Optional** (Already Done ✅)
   - Interceptors are already optional
   - SDK works without them

3. **Update Documentation** (To Do)
   - Clarify that Dio/OkHttp are optional
   - Show both integration patterns:
     - With interceptor (automatic API tracing)
     - Without interceptor (manual tracking or no API tracing)

---

## Updated Integration Examples

### Flutter SDK - With Automatic API Tracing

```dart
import 'package:nivostack_core/nivostack_core.dart';
import 'package:dio/dio.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize SDK
  await DevBridge.init(
    baseUrl: 'https://ingest.nivostack.com',
    apiKey: 'your-api-key',
    projectId: 'your-project-id',
  );

  // Optional: Add interceptor for automatic API tracing
  final dio = Dio();
  dio.interceptors.add(DevBridgeDioInterceptor());
  
  runApp(MyApp());
}
```

### Flutter SDK - Without API Tracing

```dart
import 'package:nivostack_core/nivostack_core.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize SDK - that's it!
  await DevBridge.init(
    baseUrl: 'https://ingest.nivostack.com',
    apiKey: 'your-api-key',
    projectId: 'your-project-id',
  );
  
  // SDK works without Dio/OkHttp
  // Other features (logging, crashes, config, localization) still work
  // Just no automatic API tracing
  
  runApp(MyApp());
}
```

### Android SDK - With Automatic API Tracing

```kotlin
import com.plixera.nivostack.NivoStack
import com.plixera.nivostack.interceptors.NivoStackInterceptor
import okhttp3.OkHttpClient

class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        
        // Initialize SDK
        NivoStack.init(
            context = this,
            baseUrl = "https://ingest.nivostack.com",
            apiKey = "your-api-key",
            projectId = "your-project-id"
        )
        
        // Optional: Add interceptor for automatic API tracing
        val client = OkHttpClient.Builder()
            .addInterceptor(NivoStackInterceptor())
            .build()
    }
}
```

### Android SDK - Without API Tracing

```kotlin
import com.plixera.nivostack.NivoStack

class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        
        // Initialize SDK - that's it!
        NivoStack.init(
            context = this,
            baseUrl = "https://ingest.nivostack.com",
            apiKey = "your-api-key",
            projectId = "your-project-id"
        )
        
        // SDK works without OkHttp
        // Other features still work
        // Just no automatic API tracing
    }
}
```

---

## Dependency Declaration

### Flutter SDK (`pubspec.yaml`)

```yaml
dependencies:
  # SDK dependencies (required for SDK operations)
  dio: ^5.7.0  # Used internally by SDK
  # ... other SDK dependencies

# Note: Apps don't need to declare Dio if they don't use it
# SDK will use its own internal Dio instance
```

**Recommendation**: Keep Dio as a dependency, but document it as optional for apps.

### Android SDK (`build.gradle.kts`)

```kotlin
dependencies {
    // SDK dependencies (required for SDK operations)
    implementation("com.squareup.okhttp3:okhttp:4.12.0")  // Used internally
    // ... other SDK dependencies
}

// Note: Apps don't need to declare OkHttp if they don't use it
// SDK will use its own internal OkHttpClient instance
```

**Recommendation**: Keep OkHttp as a dependency, but document it as optional for apps.

---

## Best Practices Summary

### ✅ Do

1. **Keep Internal HTTP Clients**
   - SDK should have its own HTTP client for SDK operations
   - Don't require apps to configure HTTP clients for SDK to work

2. **Make Interceptors Optional**
   - Provide interceptors for automatic API tracing
   - But don't require them for SDK to function
   - Document both integration patterns

3. **Document Dependencies Clearly**
   - Explain which dependencies are required vs optional
   - Show integration patterns for different use cases
   - Clarify when Dio/OkHttp are needed

4. **Support Both Patterns**
   - With interceptor: Automatic API tracing
   - Without interceptor: Manual tracking or no API tracing

### ❌ Don't

1. **Don't Require Apps to Configure HTTP Clients**
   - SDK should work without app configuration
   - HTTP client configuration should be optional

2. **Don't Expose Internal HTTP Clients**
   - Keep SDK's internal clients private
   - Don't require apps to pass HTTP clients to SDK

3. **Don't Force Dependency Versions**
   - Use flexible version ranges
   - Allow apps to use their preferred versions

---

## Conclusion

**Answer**: **Yes, hide SDK dependencies** for SDK operations, but **keep interceptors optional** for app API tracing.

**Current State**: ✅ Already mostly correct!
- SDK has internal HTTP clients ✅
- Interceptors are optional ✅
- Just need to update documentation to clarify

**Action Items**:
1. Update README to clarify Dio/OkHttp are optional
2. Show both integration patterns (with/without interceptors)
3. Document that SDK works without app HTTP client configuration

---

## Related Documentation

- [SDK Publishing Guide](./SDK_PUBLISHING_GUIDE.md)
- [SDK Architecture Flow](../technical/architecture/SDK_ARCHITECTURE_FLOW.md)

---

**Last Updated**: December 29, 2024

