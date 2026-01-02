<p align="center">
  <img src="docs/screenshots/logo.png" alt="DevBridge Logo" width="120" />
</p>

<h1 align="center">DevBridge</h1>

<p align="center">
  <strong>A powerful BFF (Backend For Frontend) monitoring and debugging platform for mobile applications</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#demo">Demo</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#sdk-integration">SDK Integration</a> •
  <a href="#api-reference">API Reference</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Prisma-5.22-2D3748?style=flat-square&logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-Latest-336791?style=flat-square&logo=postgresql" alt="PostgreSQL" />
</p>

---

## What is DevBridge?

DevBridge is a comprehensive monitoring solution designed specifically for mobile app developers. It acts as a bridge between your mobile applications and backend services, providing real-time visibility into:

- **API Traffic** - Every HTTP request/response with full headers and bodies
- **Device Information** - Track all connected devices and their metadata
- **Error Monitoring** - Automatic detection and alerting for API errors
- **Cost Analytics** - Track API costs per endpoint, device, or session
- **User Flows** - Visualize how users navigate through your app

Think of it as **Datadog + Sentry + Charles Proxy**, but specifically designed for mobile BFF monitoring.

---

## Features

### 📱 Device Management
Track all devices connecting to your backend with detailed metadata including platform, OS version, app version, and more.

### 🔍 API Traces
Capture every API request with full visibility into:
- Request/Response headers and bodies
- Status codes and response times
- Screen context (which screen triggered the request)
- Network type, carrier, and geo-location
- Configurable body capture (on/off per endpoint)

### 📊 Analytics Dashboard
Understand your API costs and usage patterns:
- Total cost tracking per endpoint
- Cost breakdown by device
- Session-based cost analysis
- Request volume trends

### 🔄 Session Timeline & Flow
**NEW in v1.3** - Chronological timeline view showing:
- Complete session history with all events
- Screen navigation with timestamps
- API requests with request/response details
- Logs with source location and data
- Expandable event details

Plus interactive flow diagrams:
- Screen-to-screen navigation patterns
- API calls between screens
- Success/error rates per transition

### 🚨 Smart Monitoring & Alerts
Proactive error detection with:
- One-click monitoring enable from any trace
- Auto-configured alerts based on error patterns
- Custom status code monitoring (4xx, 5xx)
- Body-based error detection (JSON field matching)
- Multi-channel notifications (Email, Push, SMS, Webhook)

### 🎛️ Remote Configuration
**NEW in v1.2+** - Control your SDK and app remotely:

#### Feature Flags
Global on/off switches for SDK features:
- `sdkEnabled` - Master kill switch (coming soon)
- `apiTracking` - Enable/disable API tracing
- `logging` - Enable/disable log sending
- `screenTracking`, `sessionTracking`, `crashReporting`
- `businessConfig`, `localization`, `offlineSupport`, `batchEvents`

#### SDK Settings
Fine-grained control over SDK behavior:
- **Security**: `captureRequestBodies`, `captureResponseBodies`, `sanitizeSensitiveData`
- **Performance**: `maxLogQueueSize`, `flushIntervalSeconds`, `enableBatching`
- **Log Control**: `minLogLevel`, `verboseErrors`
- **Per-Endpoint Overrides**: Configure settings for specific API endpoints

#### Business Configuration
Key-value store for app configuration:
- Multiple value types: string, integer, boolean, decimal, json, image
- Category organization
- Version tracking

### 🚫 App Lifecycle Control
**NEW in v1.3** - Control app access remotely:

#### Force Update
Block users with outdated app versions:
- Minimum version configuration
- Customizable messages and button text
- Platform-specific store URLs (iOS/Android)
- Default UI widget or custom handling

#### Maintenance Mode
Show maintenance screen when backend is down:
- Enable/disable remotely
- Customizable message
- Countdown timer to estimated end time
- Retry button with callback

### 🌐 Localization
Manage translations remotely:
- Multiple languages with RTL support
- Key-based translations with categories
- Translation review workflow
- SDK fetches and caches translations

### ⚙️ Flexible Configuration
- **API Cost Config** - Define costs per endpoint for usage tracking
- **Alert Rules** - Create custom monitoring rules
- **Notification Settings** - Configure how you want to be notified
- **SDK Settings** - Control SDK behavior remotely

---

## Demo

🌐 **Live Demo**: [https://devbridge-eta.vercel.app](https://devbridge-eta.vercel.app)

---

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database (or use Supabase/Neon)
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/pie-int/dev-bridge.git
cd dev-bridge

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Variables

```env
# Database
POSTGRES_PRISMA_URL="postgresql://..."
POSTGRES_URL_NON_POOLING="postgresql://..."

# Auth
JWT_SECRET="your-secret-key"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Database Setup

```bash
# Generate Prisma client
pnpm prisma generate

# Push schema to database
pnpm prisma db push
```

### Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to access the dashboard.

---

## SDK Integration

### iOS (Swift)

```swift
import Foundation

class DevBridge {
    static let shared = DevBridge()
    private let apiKey = "YOUR_API_KEY"
    private let endpoint = "https://your-devbridge.vercel.app"
    private var deviceId: String
    private var sessionToken: String?

    private init() {
        deviceId = UIDevice.current.identifierForVendor?.uuidString ?? UUID().uuidString
        registerDevice()
        startSession()
    }

    // Register device on app launch
    func registerDevice() {
        let payload: [String: Any] = [
            "deviceId": deviceId,
            "platform": "ios",
            "osVersion": UIDevice.current.systemVersion,
            "appVersion": Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "",
            "model": UIDevice.current.model
        ]
        send(to: "/api/devices", payload: payload)
    }

    // Track API requests
    func trace(request: URLRequest, response: HTTPURLResponse?, data: Data?, duration: Int, screenName: String? = nil) {
        let payload: [String: Any] = [
            "deviceId": deviceId,
            "sessionToken": sessionToken ?? "",
            "url": request.url?.absoluteString ?? "",
            "method": request.httpMethod ?? "GET",
            "statusCode": response?.statusCode ?? 0,
            "requestHeaders": request.allHTTPHeaderFields ?? [:],
            "requestBody": request.httpBody.flatMap { String(data: $0, encoding: .utf8) } ?? "",
            "responseBody": data.flatMap { String(data: $0, encoding: .utf8) } ?? "",
            "duration": duration,
            "screenName": screenName ?? "",
            "timestamp": ISO8601DateFormatter().string(from: Date())
        ]
        send(to: "/api/traces", payload: payload)
    }

    private func send(to path: String, payload: [String: Any]) {
        guard let url = URL(string: endpoint + path) else { return }
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(apiKey, forHTTPHeaderField: "X-API-Key")
        request.httpBody = try? JSONSerialization.data(withJSONObject: payload)
        URLSession.shared.dataTask(with: request).resume()
    }
}
```

### Android (Kotlin)

```kotlin
object DevBridge {
    private const val API_KEY = "YOUR_API_KEY"
    private const val ENDPOINT = "https://your-devbridge.vercel.app"
    private lateinit var deviceId: String
    private var sessionToken: String? = null

    fun initialize(context: Context) {
        deviceId = Settings.Secure.getString(context.contentResolver, Settings.Secure.ANDROID_ID)
        registerDevice(context)
        startSession()
    }

    fun trace(
        url: String,
        method: String,
        statusCode: Int,
        requestBody: String? = null,
        responseBody: String? = null,
        duration: Long,
        screenName: String? = null
    ) {
        val payload = JSONObject().apply {
            put("deviceId", deviceId)
            put("sessionToken", sessionToken)
            put("url", url)
            put("method", method)
            put("statusCode", statusCode)
            put("requestBody", requestBody)
            put("responseBody", responseBody)
            put("duration", duration)
            put("screenName", screenName)
            put("timestamp", Instant.now().toString())
        }
        send("/api/traces", payload)
    }

    private fun send(path: String, payload: JSONObject) {
        thread {
            val connection = URL(ENDPOINT + path).openConnection() as HttpURLConnection
            connection.requestMethod = "POST"
            connection.setRequestProperty("Content-Type", "application/json")
            connection.setRequestProperty("X-API-Key", API_KEY)
            connection.doOutput = true
            connection.outputStream.write(payload.toString().toByteArray())
            connection.responseCode // Execute request
        }
    }
}
```

### Flutter/Dart Integration

#### DevBridge Service

Create a DevBridge service class for device registration and API tracing:

```dart
import 'dart:convert';
import 'dart:io';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:http/http.dart' as http;

class DevBridgeService {
  static final DevBridgeService _instance = DevBridgeService._internal();
  factory DevBridgeService() => _instance;
  DevBridgeService._internal();

  static const String _apiKey = 'YOUR_API_KEY';
  static const String _endpoint = 'https://your-devbridge.vercel.app';

  String? _deviceId;
  String? _sessionToken;
  String? _currentScreen;

  Future<void> initialize() async {
    await _initDeviceId();
    await _registerDevice();
    await _startSession();
  }

  Future<void> _initDeviceId() async {
    final deviceInfo = DeviceInfoPlugin();
    if (Platform.isAndroid) {
      final androidInfo = await deviceInfo.androidInfo;
      _deviceId = androidInfo.id;
    } else if (Platform.isIOS) {
      final iosInfo = await deviceInfo.iosInfo;
      _deviceId = iosInfo.identifierForVendor;
    }
  }

  Future<void> _registerDevice() async {
    final deviceInfo = DeviceInfoPlugin();
    final packageInfo = await PackageInfo.fromPlatform();

    Map<String, dynamic> payload;

    if (Platform.isAndroid) {
      final info = await deviceInfo.androidInfo;
      payload = {
        'deviceId': _deviceId,
        'platform': 'android',
        'osVersion': info.version.release,
        'appVersion': packageInfo.version,
        'model': info.model,
        'manufacturer': info.manufacturer,
      };
    } else {
      final info = await deviceInfo.iosInfo;
      payload = {
        'deviceId': _deviceId,
        'platform': 'ios',
        'osVersion': info.systemVersion,
        'appVersion': packageInfo.version,
        'model': info.model,
        'manufacturer': 'Apple',
      };
    }

    await _send('/api/devices', payload);
  }

  Future<void> _startSession() async {
    _sessionToken = DateTime.now().millisecondsSinceEpoch.toString();
    await _send('/api/sessions', {
      'deviceId': _deviceId,
      'sessionToken': _sessionToken,
      'action': 'start',
    });
  }

  void setCurrentScreen(String screenName) {
    _currentScreen = screenName;
  }

  String? get deviceId => _deviceId;
  String? get sessionToken => _sessionToken;
  String? get currentScreen => _currentScreen;

  Future<void> trace({
    required String url,
    required String method,
    required int statusCode,
    String? requestBody,
    String? responseBody,
    Map<String, String>? requestHeaders,
    Map<String, String>? responseHeaders,
    required int durationMs,
  }) async {
    await _send('/api/traces', {
      'deviceId': _deviceId,
      'sessionToken': _sessionToken,
      'url': url,
      'method': method,
      'statusCode': statusCode,
      'requestBody': requestBody,
      'responseBody': responseBody,
      'requestHeaders': requestHeaders,
      'responseHeaders': responseHeaders,
      'duration': durationMs,
      'screenName': _currentScreen,
      'timestamp': DateTime.now().toUtc().toIso8601String(),
    });
  }

  Future<void> _send(String path, Map<String, dynamic> payload) async {
    try {
      await http.post(
        Uri.parse('$_endpoint$path'),
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': _apiKey,
        },
        body: jsonEncode(payload),
      );
    } catch (e) {
      // Silent fail - don't crash app for telemetry
      print('DevBridge: Failed to send data: $e');
    }
  }
}
```

#### Dio Interceptor

Automatically capture all HTTP requests with a Dio interceptor:

```dart
import 'package:dio/dio.dart';
import 'devbridge_service.dart';

class DevBridgeInterceptor extends Interceptor {
  final DevBridgeService _devBridge = DevBridgeService();
  final Map<RequestOptions, DateTime> _requestStartTimes = {};

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    _requestStartTimes[options] = DateTime.now();
    handler.next(options);
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    _traceRequest(response.requestOptions, response.statusCode ?? 0, response.data);
    handler.next(response);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    _traceRequest(
      err.requestOptions,
      err.response?.statusCode ?? 0,
      err.response?.data,
      error: err.message,
    );
    handler.next(err);
  }

  void _traceRequest(
    RequestOptions options,
    int statusCode,
    dynamic responseData, {
    String? error,
  }) {
    final startTime = _requestStartTimes.remove(options);
    final duration = startTime != null
        ? DateTime.now().difference(startTime).inMilliseconds
        : 0;

    _devBridge.trace(
      url: options.uri.toString(),
      method: options.method,
      statusCode: statusCode,
      requestBody: options.data?.toString(),
      responseBody: responseData?.toString(),
      requestHeaders: options.headers.map((k, v) => MapEntry(k, v.toString())),
      durationMs: duration,
    );
  }
}

// Usage: Add to your Dio instance
final dio = Dio();
dio.interceptors.add(DevBridgeInterceptor());
```

#### DevBridge Logger

Replace print statements with structured logging:

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'devbridge_service.dart';

enum LogLevel { verbose, debug, info, warn, error, assert_ }

class DevBridgeLogger {
  static final DevBridgeLogger _instance = DevBridgeLogger._internal();
  factory DevBridgeLogger() => _instance;
  DevBridgeLogger._internal();

  static const String _apiKey = 'YOUR_API_KEY';
  static const String _endpoint = 'https://your-devbridge.vercel.app';

  final DevBridgeService _devBridge = DevBridgeService();

  // Convenience methods
  static void v(String tag, String message, [Map<String, dynamic>? data]) =>
      _instance._log(LogLevel.verbose, tag, message, data);

  static void d(String tag, String message, [Map<String, dynamic>? data]) =>
      _instance._log(LogLevel.debug, tag, message, data);

  static void i(String tag, String message, [Map<String, dynamic>? data]) =>
      _instance._log(LogLevel.info, tag, message, data);

  static void w(String tag, String message, [Map<String, dynamic>? data]) =>
      _instance._log(LogLevel.warn, tag, message, data);

  static void e(String tag, String message, [Object? error, StackTrace? stackTrace, Map<String, dynamic>? data]) {
    final enrichedData = Map<String, dynamic>.from(data ?? {});
    if (error != null) enrichedData['error'] = error.toString();
    if (stackTrace != null) enrichedData['stackTrace'] = stackTrace.toString();
    _instance._log(LogLevel.error, tag, message, enrichedData);
  }

  void _log(LogLevel level, String tag, String message, Map<String, dynamic>? data) {
    // Also print to console for debugging
    final levelStr = level.name.toUpperCase();
    print('[$levelStr] $tag: $message');

    // Get caller info from stack trace
    final trace = StackTrace.current.toString().split('\n');
    String? fileName;
    int? lineNumber;
    String? functionName;
    String? className;

    // Parse the stack trace (skip internal frames)
    if (trace.length > 3) {
      final frame = trace[3]; // Skip _log, e/d/i/etc, and actual call site
      final match = RegExp(r'#\d+\s+(.+)\s+\((.+):(\d+):\d+\)').firstMatch(frame);
      if (match != null) {
        final fullMethod = match.group(1) ?? '';
        final parts = fullMethod.split('.');
        if (parts.length >= 2) {
          className = parts[0];
          functionName = parts.sublist(1).join('.');
        } else {
          functionName = fullMethod;
        }
        fileName = match.group(2)?.split('/').last;
        lineNumber = int.tryParse(match.group(3) ?? '');
      }
    }

    _send({
      'deviceId': _devBridge.deviceId,
      'sessionToken': _devBridge.sessionToken,
      'level': level == LogLevel.assert_ ? 'assert' : level.name,
      'tag': tag,
      'message': message,
      'screenName': _devBridge.currentScreen,
      'threadName': 'main', // Dart is single-threaded (isolates separate)
      'fileName': fileName,
      'lineNumber': lineNumber,
      'functionName': functionName,
      'className': className,
      'data': data,
      'timestamp': DateTime.now().toUtc().toIso8601String(),
    });
  }

  Future<void> _send(Map<String, dynamic> payload) async {
    try {
      await http.post(
        Uri.parse('$_endpoint/api/logs'),
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': _apiKey,
        },
        body: jsonEncode(payload),
      );
    } catch (e) {
      // Silent fail
    }
  }
}

// Usage - replace print() calls:
// print('Loading data...') -> DevBridgeLogger.d('DataService', 'Loading data...')
DevBridgeLogger.d('PaymentService', 'Processing payment', {'amount': 100.0});
DevBridgeLogger.e('AuthService', 'Login failed', error, stackTrace, {'userId': 'abc'});
```

#### Flutter App Initialization

Initialize DevBridge in your main.dart:

```dart
import 'package:flutter/material.dart';
import 'core/services/devbridge_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize DevBridge (registers device and starts session)
  await DevBridgeService().initialize();

  // Your other initialization (Firebase, GetIt, etc.)
  // ...

  runApp(MyApp());
}
```

#### Required Dependencies

Add these to your `pubspec.yaml`:

```yaml
dependencies:
  device_info_plus: ^10.1.0
  package_info_plus: ^8.0.0
  http: ^1.2.0
  shared_preferences: ^2.2.0  # For config caching
  # If using Dio interceptor:
  dio: ^5.7.0
```

---

### Business Configuration SDK

Fetch and cache remote configurations in your mobile app. Supports string, integer, boolean, decimal, JSON, and image URL values.

#### Flutter/Dart

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class DevBridgeConfig {
  static final DevBridgeConfig _instance = DevBridgeConfig._internal();
  factory DevBridgeConfig() => _instance;
  DevBridgeConfig._internal();

  static const String _apiKey = 'YOUR_API_KEY';
  static const String _endpoint = 'https://your-devbridge.vercel.app';
  static const String _cacheKey = 'devbridge_config_cache';
  static const String _cacheTimestampKey = 'devbridge_config_timestamp';
  static const Duration _cacheDuration = Duration(hours: 1);

  Map<String, dynamic> _configs = {};
  Map<String, dynamic> _meta = {};
  bool _initialized = false;

  /// Initialize and fetch configs. Call this on app startup.
  Future<void> initialize({bool forceRefresh = false}) async {
    if (_initialized && !forceRefresh) return;

    // Try to load from cache first
    await _loadFromCache();

    // Check if cache is stale or force refresh
    final shouldRefresh = forceRefresh || await _isCacheStale();
    if (shouldRefresh) {
      await _fetchFromServer();
    }

    _initialized = true;
  }

  Future<void> _loadFromCache() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final cached = prefs.getString(_cacheKey);
      if (cached != null) {
        final data = jsonDecode(cached);
        _configs = Map<String, dynamic>.from(data['configs'] ?? {});
        _meta = Map<String, dynamic>.from(data['meta'] ?? {});
      }
    } catch (e) {
      print('DevBridgeConfig: Failed to load cache: $e');
    }
  }

  Future<bool> _isCacheStale() async {
    final prefs = await SharedPreferences.getInstance();
    final timestamp = prefs.getInt(_cacheTimestampKey);
    if (timestamp == null) return true;
    final cachedAt = DateTime.fromMillisecondsSinceEpoch(timestamp);
    return DateTime.now().difference(cachedAt) > _cacheDuration;
  }

  Future<void> _fetchFromServer() async {
    try {
      final response = await http.get(
        Uri.parse('$_endpoint/api/business-config'),
        headers: {'X-API-Key': _apiKey},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        _configs = Map<String, dynamic>.from(data['configs'] ?? {});
        _meta = Map<String, dynamic>.from(data['meta'] ?? {});

        // Save to cache
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString(_cacheKey, jsonEncode({'configs': _configs, 'meta': _meta}));
        await prefs.setInt(_cacheTimestampKey, DateTime.now().millisecondsSinceEpoch);
      }
    } catch (e) {
      print('DevBridgeConfig: Failed to fetch configs: $e');
    }
  }

  /// Get a string config value
  String? getString(String key, [String? defaultValue]) {
    return _configs[key]?.toString() ?? defaultValue;
  }

  /// Get an integer config value
  int? getInt(String key, [int? defaultValue]) {
    final value = _configs[key];
    if (value is int) return value;
    if (value is String) return int.tryParse(value) ?? defaultValue;
    return defaultValue;
  }

  /// Get a boolean config value
  bool getBool(String key, [bool defaultValue = false]) {
    final value = _configs[key];
    if (value is bool) return value;
    if (value is String) return value.toLowerCase() == 'true';
    return defaultValue;
  }

  /// Get a decimal config value
  double? getDouble(String key, [double? defaultValue]) {
    final value = _configs[key];
    if (value is double) return value;
    if (value is int) return value.toDouble();
    if (value is String) return double.tryParse(value) ?? defaultValue;
    return defaultValue;
  }

  /// Get a JSON config value
  Map<String, dynamic>? getJson(String key) {
    final value = _configs[key];
    if (value is Map) return Map<String, dynamic>.from(value);
    return null;
  }

  /// Get an image URL config value
  String? getImageUrl(String key) => getString(key);

  /// Check if a config key exists
  bool hasKey(String key) => _configs.containsKey(key);

  /// Force refresh configs from server
  Future<void> refresh() => initialize(forceRefresh: true);
}

// Usage:
void main() async {
  // Initialize on app startup
  await DevBridgeConfig().initialize();

  // Use configs throughout your app
  final apiTimeout = DevBridgeConfig().getInt('api_timeout', 30000);
  final featureEnabled = DevBridgeConfig().getBool('new_feature_enabled');
  final welcomeMessage = DevBridgeConfig().getString('welcome_message', 'Hello!');
  final themeConfig = DevBridgeConfig().getJson('theme_config');
  final bannerUrl = DevBridgeConfig().getImageUrl('promo_banner');
}
```

#### Android (Kotlin)

```kotlin
object DevBridgeConfig {
    private const val API_KEY = "YOUR_API_KEY"
    private const val ENDPOINT = "https://your-devbridge.vercel.app"
    private const val PREFS_NAME = "devbridge_config"
    private const val CACHE_KEY = "config_cache"
    private const val TIMESTAMP_KEY = "cache_timestamp"
    private const val CACHE_DURATION_MS = 3600000L // 1 hour

    private var configs: MutableMap<String, Any?> = mutableMapOf()
    private var initialized = false

    fun initialize(context: Context, forceRefresh: Boolean = false, callback: (() -> Unit)? = null) {
        if (initialized && !forceRefresh) {
            callback?.invoke()
            return
        }

        loadFromCache(context)

        if (forceRefresh || isCacheStale(context)) {
            fetchFromServer(context, callback)
        } else {
            initialized = true
            callback?.invoke()
        }
    }

    private fun loadFromCache(context: Context) {
        try {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val cached = prefs.getString(CACHE_KEY, null)
            if (cached != null) {
                val json = JSONObject(cached)
                val configsObj = json.optJSONObject("configs") ?: return
                configsObj.keys().forEach { key ->
                    configs[key] = configsObj.opt(key)
                }
            }
        } catch (e: Exception) {
            Log.e("DevBridgeConfig", "Failed to load cache", e)
        }
    }

    private fun isCacheStale(context: Context): Boolean {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val timestamp = prefs.getLong(TIMESTAMP_KEY, 0)
        return System.currentTimeMillis() - timestamp > CACHE_DURATION_MS
    }

    private fun fetchFromServer(context: Context, callback: (() -> Unit)?) {
        thread {
            try {
                val connection = URL("$ENDPOINT/api/business-config").openConnection() as HttpURLConnection
                connection.setRequestProperty("X-API-Key", API_KEY)
                connection.requestMethod = "GET"

                if (connection.responseCode == 200) {
                    val response = connection.inputStream.bufferedReader().readText()
                    val json = JSONObject(response)
                    val configsObj = json.optJSONObject("configs")

                    configs.clear()
                    configsObj?.keys()?.forEach { key ->
                        configs[key] = configsObj.opt(key)
                    }

                    // Save to cache
                    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                    prefs.edit()
                        .putString(CACHE_KEY, json.toString())
                        .putLong(TIMESTAMP_KEY, System.currentTimeMillis())
                        .apply()
                }
                initialized = true
                android.os.Handler(android.os.Looper.getMainLooper()).post { callback?.invoke() }
            } catch (e: Exception) {
                Log.e("DevBridgeConfig", "Failed to fetch configs", e)
                initialized = true
                android.os.Handler(android.os.Looper.getMainLooper()).post { callback?.invoke() }
            }
        }
    }

    fun getString(key: String, default: String? = null): String? = configs[key]?.toString() ?: default
    fun getInt(key: String, default: Int = 0): Int = (configs[key] as? Number)?.toInt() ?: default
    fun getBool(key: String, default: Boolean = false): Boolean = configs[key] as? Boolean ?: default
    fun getDouble(key: String, default: Double = 0.0): Double = (configs[key] as? Number)?.toDouble() ?: default
    fun getJson(key: String): JSONObject? = configs[key] as? JSONObject
    fun getImageUrl(key: String): String? = getString(key)

    fun refresh(context: Context, callback: (() -> Unit)? = null) = initialize(context, true, callback)
}

// Usage in Application.onCreate():
DevBridgeConfig.initialize(this) {
    // Configs loaded, app ready
    val timeout = DevBridgeConfig.getInt("api_timeout", 30000)
    val featureEnabled = DevBridgeConfig.getBool("new_feature_enabled")
}
```

---

### Using with OkHttp Interceptor

```kotlin
class DevBridgeInterceptor : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request()
        val startTime = System.currentTimeMillis()

        val response = chain.proceed(request)

        val duration = System.currentTimeMillis() - startTime
        val responseBody = response.peekBody(Long.MAX_VALUE).string()

        DevBridge.trace(
            url = request.url.toString(),
            method = request.method,
            statusCode = response.code,
            requestBody = request.body?.let { buffer ->
                val buf = okio.Buffer()
                it.writeTo(buf)
                buf.readUtf8()
            },
            responseBody = responseBody,
            duration = duration
        )

        return response
    }
}

// Usage
val client = OkHttpClient.Builder()
    .addInterceptor(DevBridgeInterceptor())
    .build()
```

### Console Log Capture (Android)

Capture all `Log.d()`, `Log.e()`, etc. calls and send them to DevBridge:

```kotlin
object DevBridgeLogger {
    private const val API_KEY = "YOUR_API_KEY"
    private const val ENDPOINT = "https://your-devbridge.vercel.app"
    private lateinit var deviceId: String
    private var sessionToken: String? = null
    private var currentScreen: String? = null

    // Log levels matching Android's Log class
    enum class Level { VERBOSE, DEBUG, INFO, WARN, ERROR, ASSERT }

    fun initialize(context: Context, sessionToken: String? = null) {
        deviceId = Settings.Secure.getString(context.contentResolver, Settings.Secure.ANDROID_ID)
        this.sessionToken = sessionToken
    }

    fun setCurrentScreen(screenName: String) {
        currentScreen = screenName
    }

    // Wrapper functions matching Android's Log API
    fun v(tag: String, msg: String, data: Map<String, Any>? = null) = log(Level.VERBOSE, tag, msg, data)
    fun d(tag: String, msg: String, data: Map<String, Any>? = null) = log(Level.DEBUG, tag, msg, data)
    fun i(tag: String, msg: String, data: Map<String, Any>? = null) = log(Level.INFO, tag, msg, data)
    fun w(tag: String, msg: String, data: Map<String, Any>? = null) = log(Level.WARN, tag, msg, data)
    fun e(tag: String, msg: String, throwable: Throwable? = null, data: Map<String, Any>? = null) {
        val enrichedData = data?.toMutableMap() ?: mutableMapOf()
        throwable?.let { enrichedData["stackTrace"] = it.stackTraceToString() }
        log(Level.ERROR, tag, msg, enrichedData)
    }

    private fun log(level: Level, tag: String, message: String, data: Map<String, Any>? = null) {
        // Also log to standard Android logcat
        when (level) {
            Level.VERBOSE -> android.util.Log.v(tag, message)
            Level.DEBUG -> android.util.Log.d(tag, message)
            Level.INFO -> android.util.Log.i(tag, message)
            Level.WARN -> android.util.Log.w(tag, message)
            Level.ERROR -> android.util.Log.e(tag, message)
            Level.ASSERT -> android.util.Log.wtf(tag, message)
        }

        // Get caller info
        val stackTrace = Thread.currentThread().stackTrace
        val caller = stackTrace.getOrNull(4) // Skip internal frames

        val payload = JSONObject().apply {
            put("deviceId", deviceId)
            put("sessionToken", sessionToken)
            put("level", level.name.lowercase())
            put("tag", tag)
            put("message", message)
            put("screenName", currentScreen)
            put("threadName", Thread.currentThread().name)
            caller?.let {
                put("className", it.className.substringAfterLast('.'))
                put("functionName", it.methodName)
                put("fileName", it.fileName)
                put("lineNumber", it.lineNumber)
            }
            data?.let { put("data", JSONObject(it)) }
            put("timestamp", Instant.now().toString())
        }

        send("/api/logs", payload)
    }

    private fun send(path: String, payload: JSONObject) {
        thread {
            try {
                val connection = URL(ENDPOINT + path).openConnection() as HttpURLConnection
                connection.requestMethod = "POST"
                connection.setRequestProperty("Content-Type", "application/json")
                connection.setRequestProperty("X-API-Key", API_KEY)
                connection.doOutput = true
                connection.outputStream.write(payload.toString().toByteArray())
                connection.responseCode
            } catch (e: Exception) {
                android.util.Log.e("DevBridge", "Failed to send log", e)
            }
        }
    }
}

// Usage - replace your Log calls:
// Log.d("MyTag", "Hello") -> DevBridgeLogger.d("MyTag", "Hello")
DevBridgeLogger.d("NetworkManager", "API call started", mapOf("endpoint" to "/users"))
DevBridgeLogger.e("AuthService", "Login failed", exception, mapOf("userId" to "123"))
```

### Console Log Capture (iOS)

```swift
class DevBridgeLogger {
    static let shared = DevBridgeLogger()
    private let apiKey = "YOUR_API_KEY"
    private let endpoint = "https://your-devbridge.vercel.app"
    private var deviceId: String
    private var sessionToken: String?
    private var currentScreen: String?

    enum Level: String {
        case verbose, debug, info, warn, error, assert
    }

    private init() {
        deviceId = UIDevice.current.identifierForVendor?.uuidString ?? UUID().uuidString
    }

    func setSession(_ token: String) { sessionToken = token }
    func setScreen(_ name: String) { currentScreen = name }

    func v(_ tag: String, _ message: String, data: [String: Any]? = nil) { log(.verbose, tag, message, data: data) }
    func d(_ tag: String, _ message: String, data: [String: Any]? = nil) { log(.debug, tag, message, data: data) }
    func i(_ tag: String, _ message: String, data: [String: Any]? = nil) { log(.info, tag, message, data: data) }
    func w(_ tag: String, _ message: String, data: [String: Any]? = nil) { log(.warn, tag, message, data: data) }
    func e(_ tag: String, _ message: String, error: Error? = nil, data: [String: Any]? = nil) {
        var enrichedData = data ?? [:]
        if let error = error { enrichedData["error"] = String(describing: error) }
        log(.error, tag, message, data: enrichedData)
    }

    private func log(_ level: Level, _ tag: String, _ message: String,
                     data: [String: Any]? = nil, file: String = #file,
                     function: String = #function, line: Int = #line) {
        // Also print to Xcode console
        print("[\(level.rawValue.uppercased())] \(tag): \(message)")

        let payload: [String: Any] = [
            "deviceId": deviceId,
            "sessionToken": sessionToken ?? "",
            "level": level.rawValue,
            "tag": tag,
            "message": message,
            "screenName": currentScreen ?? "",
            "fileName": URL(fileURLWithPath: file).lastPathComponent,
            "functionName": function,
            "lineNumber": line,
            "threadName": Thread.isMainThread ? "main" : "background",
            "data": data ?? [:],
            "timestamp": ISO8601DateFormatter().string(from: Date())
        ]

        send(to: "/api/logs", payload: payload)
    }

    private func send(to path: String, payload: [String: Any]) {
        guard let url = URL(string: endpoint + path) else { return }
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(apiKey, forHTTPHeaderField: "X-API-Key")
        request.httpBody = try? JSONSerialization.data(withJSONObject: payload)
        URLSession.shared.dataTask(with: request).resume()
    }
}

// Usage
DevBridgeLogger.shared.d("ViewController", "View loaded")
DevBridgeLogger.shared.e("APIClient", "Request failed", error: error, data: ["url": requestUrl])
```

---

## API Reference

### Authentication

All SDK endpoints require an API key passed in the `X-API-Key` header.

Dashboard endpoints require a JWT token in the `Authorization: Bearer <token>` header.

### SDK Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/devices` | POST | Register a device |
| `/api/traces` | POST | Log an API trace |
| `/api/logs` | POST | Send log message(s) - supports single or batch |
| `/api/crashes` | POST | Report a crash |
| `/api/sessions` | POST | Start/end a session |
| `/api/business-config` | GET | Fetch business configurations (with caching support) |

### Dashboard Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/projects` | GET/POST | List/create projects |
| `/api/devices` | GET | List devices for a project |
| `/api/traces` | GET/DELETE | List/clear API traces |
| `/api/logs` | GET/DELETE | List/clear logs with search/filter |
| `/api/analytics` | GET | Get cost analytics |
| `/api/flow` | GET | Get user flow data |
| `/api/alerts` | GET/POST/PUT/DELETE | Manage alert rules |
| `/api/monitor` | GET/PUT | View/resolve monitored errors |
| `/api/settings` | GET/PUT | Manage notification settings |
| `/api/config` | GET/POST/PUT/DELETE | Manage API cost config |
| `/api/business-config` | GET/POST/PUT/DELETE | Manage business configurations |
| `/api/upload` | GET/POST/DELETE | Upload/manage images for configs |

---

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Mobile App    │────▶│   DevBridge     │────▶│   PostgreSQL    │
│(iOS/Android/    │     │   (Next.js)     │     │   Database      │
│    Flutter)     │     └─────────────────┘     └─────────────────┘
└─────────────────┘            │
                               ▼
                        ┌─────────────────┐
                        │   Dashboard     │
                        │   (React)       │
                        └─────────────────┘
```

### Tech Stack

- **Framework**: Next.js 16 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based auth
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

---

## Database Schema

```prisma
model Project {
  id        String   @id @default(cuid())
  name      String
  apiKey    String   @unique @default(cuid())
  userId    String
  devices   Device[]
  logs      Log[]
  crashes   Crash[]
  apiTraces ApiTrace[]
  configs   ApiConfig[]
  alerts    ApiAlert[]
  // ...
}

model Device {
  id         String   @id @default(cuid())
  deviceId   String
  platform   String
  osVersion  String
  appVersion String
  model      String
  // ...
}

model ApiTrace {
  id              String   @id @default(cuid())
  url             String
  method          String
  statusCode      Int?
  duration        Int?
  requestHeaders  Json?
  requestBody     String?
  responseHeaders Json?
  responseBody    String?
  screenName      String?
  cost            Float    @default(0)
  // ...
}

model ApiAlert {
  id                    String   @id @default(cuid())
  title                 String
  endpoint              String?
  method                String?
  standardErrorCodes    Int[]
  customStatusCodes     Int[]
  bodyErrorField        String?
  bodyErrorValues       String[]
  // ...
}
```

---

## Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/pie-int/dev-bridge)

1. Click the button above
2. Connect your GitHub account
3. Add environment variables
4. Deploy!

### Manual Deployment

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

---

## Documentation

All documentation is organized in the [`docs/`](./docs/) directory:

### Quick Links
- **[Setup Guide](./docs/setup/)** - Installation and environment setup
- **[Developer Guide](./docs/development/DEVELOPER_GUIDE.md)** - Development workflows and guidelines
- **[Deployment Guide](./docs/deployment/)** - Production deployment instructions
- **[Integration Guides](./docs/guides/)** - SDK integration and how-to guides

### Documentation Structure
- **[Setup Documentation](./docs/setup/)** - Setup, installation, and configuration guides
- **[Deployment Documentation](./docs/deployment/)** - Deployment, releases, and changelog
- **[Development Documentation](./docs/development/)** - Development workflows and technical docs
- **[Guides](./docs/guides/)** - User guides and integration instructions
- **[Features](./docs/features/)** - Feature documentation and planning
- **[PRDs](./docs/PRDs/)** - Product Requirements Documents
- **[Technical](./docs/technical/)** - Technical architecture and decisions

See [docs/README.md](./docs/README.md) for complete documentation index.

---

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Support

- 📧 Email: support@devbridge.dev
- 💬 Discord: [Join our community](https://discord.gg/devbridge)
- 📖 Docs: [docs.devbridge.dev](https://docs.devbridge.dev)

---

<p align="center">
  Made with ❤️ by the DevBridge Team
</p>
