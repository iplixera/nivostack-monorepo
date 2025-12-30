import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:nivostack_sdk/nivostack_sdk.dart';
import 'package:dio/dio.dart';

/// Get the appropriate base URL based on the platform
/// - Android emulator: http://10.0.2.2:3000 (maps to host's localhost:3000)
/// - iOS simulator: http://localhost:3000
/// - Physical device: Use your computer's IP address (e.g., http://192.168.1.100:3000)
/// - Production: https://ingest.nivostack.com
String getBaseUrl() {
  if (kDebugMode) {
    if (Platform.isAndroid) {
      // Android emulator uses 10.0.2.2 to access host's localhost
      return 'http://10.0.2.2:3000';
    } else if (Platform.isIOS) {
      // iOS simulator can use localhost directly
      return 'http://localhost:3000';
    }
  }
  // Production URL
  return 'https://ingest.nivostack.com';
}

// Global variable to store initialization error
String? _initError;

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize NivoStack SDK with error handling
  try {
    print('Initializing NivoStack SDK...');
    
    // For local development/testing, you can optionally specify baseUrl
    // In production, baseUrl defaults to https://ingest.nivostack.com
    await NivoStack.init(
      apiKey: 'cmjoin79y00069z09upepkf11', // Project ID is derived from API key
      // baseUrl: getBaseUrl(), // Optional: only for local development/testing
      enabled: true,
    );
    
    print('SDK initialized successfully');
    print('Device Code: ${NivoStack.instance.deviceCode ?? "Not assigned yet"}');
    print('Device Registered: ${NivoStack.instance.isDeviceRegistered}');
    print('Tracking Enabled: ${NivoStack.instance.isTrackingEnabled}');
  } catch (e, stackTrace) {
    print('ERROR: Failed to initialize SDK: $e');
    print('STACK TRACE: $stackTrace');
    // Store error to show in UI
    _initError = 'SDK Init Failed: $e';
  }

  // Add Dio interceptor for automatic API tracing
  final dio = Dio();
  dio.interceptors.add(NivoStackDioInterceptor());

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'NivoStack SDK Example',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
        useMaterial3: true,
      ),
      home: const HomeScreen(),
    );
  }
}

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String _statusMessage = 'Ready';
  bool _isLoading = false;
  final Dio _dio = Dio();

  void _showMessage(String message, {bool isError = false}) {
    setState(() {
      _statusMessage = message;
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: isError ? Colors.red : null,
        duration: isError ? const Duration(seconds: 8) : const Duration(seconds: 2),
        action: isError
            ? SnackBarAction(
                label: 'Dismiss',
                textColor: Colors.white,
                onPressed: () {},
              )
            : null,
      ),
    );
  }

  String _extractErrorMessage(dynamic error) {
    if (error is DioException) {
      final statusCode = error.response?.statusCode;
      final statusMessage = error.response?.statusMessage;
      final errorData = error.response?.data;
      
      String message = 'HTTP ${statusCode ?? 'Unknown'}';
      if (statusMessage != null) {
        message += ': $statusMessage';
      }
      
      // Extract error message from response body
      if (errorData is Map) {
        final apiError = errorData['error'] ?? errorData['message'];
        if (apiError != null) {
          message += '\n\nError: $apiError';
        }
        
        // Include usage/quota info if present
        if (errorData['usage'] != null) {
          final usage = errorData['usage'];
          message += '\n\nUsage: ${usage['used']}/${usage['limit']} (${usage['percentage']}%)';
        }
        
        if (errorData['retryAfter'] != null) {
          message += '\nRetry After: ${errorData['retryAfter']}s';
        }
      } else if (errorData is String) {
        message += '\n\n$errorData';
      }
      
      return message;
    }
    return error.toString();
  }

  void _showError(String error, [Object? details]) {
    String message = error;
    
    // If details is a DioException, extract HTTP info
    if (details is DioException) {
      message = _extractErrorMessage(details);
    } else if (details != null) {
      message = '$error\n\nDetails: $details';
    }
    
    _showMessage(message, isError: true);
    print('ERROR: $error');
    if (details != null) print('ERROR DETAILS: $details');
  }

  Future<void> _testApiCall() async {
    setState(() => _isLoading = true);
    try {
      // Test external API call (will be automatically traced by SDK)
      // NOTE: This calls an external API (jsonplaceholder.typicode.com) which is NOT
      // affected by NivoStack rate limits. It will always return 200 if the external
      // service is available, regardless of NivoStack quotas.
      final response = await _dio.get('https://jsonplaceholder.typicode.com/posts/1');
      _showMessage('External API call successful: HTTP ${response.statusCode} ${response.statusMessage}\n\nNote: External APIs are not affected by NivoStack rate limits.');
    } on DioException catch (e) {
      _showError('External API call failed', e);
    } catch (e, stackTrace) {
      _showError('External API call failed: $e', stackTrace);
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _testNivoStackApiCall() async {
    setState(() => _isLoading = true);
    try {
      if (!NivoStack.isInitialized) {
        _showError('SDK not initialized');
        return;
      }

      final instance = NivoStack.instance;
      
      // Make a direct API call to NivoStack to test rate limiting
      // This endpoint has rate limits/quota enforcement and will return HTTP 429
      // if the device registration quota is exceeded
      final dio = Dio(BaseOptions(
        baseUrl: getBaseUrl(),
        headers: {
          'X-API-Key': 'cmjoin79y00069z09upepkf11',
          'Content-Type': 'application/json',
        },
      ));

      // Try to register a NEW device (this will hit rate limits if quota is exceeded)
      // Using a unique deviceId each time to ensure it's treated as a new device
      final deviceInfo = instance.deviceInfo;
      final uniqueDeviceId = 'test-rate-limit-${DateTime.now().millisecondsSinceEpoch}';
      
      final response = await dio.post(
        '/api/devices',
        data: {
          'deviceId': uniqueDeviceId,
          'platform': deviceInfo.platform,
          'osVersion': deviceInfo.osVersion,
          'appVersion': deviceInfo.appVersion,
          'model': deviceInfo.model,
          'manufacturer': deviceInfo.manufacturer,
        },
      );

      final deviceData = response.data['device'];
      if (deviceData != null) {
        _showMessage('NivoStack API call successful: HTTP ${response.statusCode} ${response.statusMessage}\nDevice Code: ${deviceData['deviceCode'] ?? 'N/A'}\nResponse: ${response.data}');
      } else {
        _showMessage('NivoStack API call successful: HTTP ${response.statusCode} ${response.statusMessage}\nResponse: ${response.data}');
      }
    } on DioException catch (e) {
      // This will show HTTP 429 with detailed quota information if rate limit is hit
      _showError('NivoStack API call failed', e);
    } catch (e, stackTrace) {
      _showError('NivoStack API call failed: $e', stackTrace);
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _testLogging() async {
    setState(() => _isLoading = true);
    try {
      // Make direct API call to see actual HTTP response
      final dio = Dio(BaseOptions(
        baseUrl: getBaseUrl(),
        headers: {
          'X-API-Key': 'cmjoin79y00069z09upepkf11',
          'Content-Type': 'application/json',
        },
      ));

      final instance = NivoStack.instance;
      final deviceInfo = instance.deviceInfo;
      
      final response = await dio.post(
        '/api/logs',
        data: {
          'deviceId': deviceInfo.deviceId,
          'level': 'info',
          'tag': 'ExampleApp',
          'message': 'Test log message from example app',
          'data': {'timestamp': DateTime.now().toIso8601String()},
        },
      );

      _showMessage('Log sent successfully: HTTP ${response.statusCode} ${response.statusMessage}\nResponse: ${response.data}');
    } on DioException catch (e) {
      _showError('Log failed', e);
    } catch (e, stackTrace) {
      _showError('Log failed: $e', stackTrace);
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _testCrashReport() async {
    setState(() => _isLoading = true);
    try {
      // Make direct API call to see actual HTTP response
      final dio = Dio(BaseOptions(
        baseUrl: getBaseUrl(),
        headers: {
          'X-API-Key': 'cmjoin79y00069z09upepkf11',
          'Content-Type': 'application/json',
        },
      ));

      final instance = NivoStack.instance;
      final deviceInfo = instance.deviceInfo;
      
      final response = await dio.post(
        '/api/crashes',
        data: {
          'deviceId': deviceInfo.deviceId,
          'message': 'Test crash from example app',
          'stackTrace': StackTrace.current.toString(),
        },
      );

      _showMessage('Crash report sent successfully: HTTP ${response.statusCode} ${response.statusMessage}\nResponse: ${response.data}');
    } on DioException catch (e) {
      _showError('Crash report failed', e);
    } catch (e, stackTrace) {
      _showError('Crash report failed: $e', stackTrace);
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _testBusinessConfig() async {
    setState(() => _isLoading = true);
    try {
      // Make direct API call to see actual HTTP response
      final dio = Dio(BaseOptions(
        baseUrl: getBaseUrl(),
        headers: {
          'X-API-Key': 'cmjoin79y00069z09upepkf11',
          'Content-Type': 'application/json',
        },
      ));

      final response = await dio.get('/api/business-config');
      
      _showMessage('Business config refreshed: HTTP ${response.statusCode} ${response.statusMessage}\nResponse: ${response.data}');
    } on DioException catch (e) {
      _showError('Business config failed', e);
    } catch (e, stackTrace) {
      _showError('Business config failed: $e', stackTrace);
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _testLocalization() async {
    setState(() => _isLoading = true);
    try {
      // Make direct API call to see actual HTTP response
      final dio = Dio(BaseOptions(
        baseUrl: getBaseUrl(),
        headers: {
          'X-API-Key': 'cmjoin79y00069z09upepkf11',
          'Content-Type': 'application/json',
        },
      ));

      // Project ID is derived from API key - no need to pass it
      final response = await dio.get(
        '/api/localization/translations',
      );
      
      _showMessage('Localization refreshed: HTTP ${response.statusCode} ${response.statusMessage}\nResponse: ${response.data}');
    } on DioException catch (e) {
      _showError('Localization failed', e);
    } catch (e, stackTrace) {
      _showError('Localization failed: $e', stackTrace);
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _testSetUser() async {
    setState(() => _isLoading = true);
    try {
      if (!NivoStack.isInitialized) {
        _showError('SDK not initialized');
        return;
      }

      final instance = NivoStack.instance;
      if (!instance.isDeviceRegistered) {
        _showError('Device not registered. Please register device first.');
        return;
      }

      // Make direct API call to see actual HTTP response
      // We need the registered device ID (not deviceCode, but the actual device ID from registration)
      final dio = Dio(BaseOptions(
        baseUrl: getBaseUrl(),
        headers: {
          'X-API-Key': 'cmjoin79y00069z09upepkf11',
          'Content-Type': 'application/json',
        },
      ));

      // First, try to get the device ID by looking up the device
      // We'll use the deviceCode to find the device, but the API needs the device ID (UUID)
      // Let's try using deviceCode as the ID (it might be the same)
      final deviceCode = instance.deviceCode;
      if (deviceCode == null) {
        _showError('Device not registered. Please register device first.');
        return;
      }

      // The API endpoint uses the device ID (UUID), not deviceCode
      // We need to find the device first or use a different approach
      // For now, let's try the SDK method and catch the error to see what happens
      try {
        await instance.setUser(
          userId: 'test_user_${DateTime.now().millisecondsSinceEpoch}',
          email: 'test@example.com',
          name: 'Test User',
        );
        _showMessage('User set successfully (via SDK)');
      } on DioException catch (e) {
        _showError('Set user failed', e);
      } catch (e) {
        _showError('Set user failed: $e');
      }
    } on DioException catch (e) {
      _showError('Set user failed', e);
    } catch (e, stackTrace) {
      _showError('Set user failed: $e', stackTrace);
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _testClearUser() async {
    setState(() => _isLoading = true);
    try {
      await NivoStack.instance.clearUser();
      _showMessage('User cleared successfully');
    } on DioException catch (e) {
      _showError('Clear user failed', e);
    } catch (e, stackTrace) {
      _showError('Clear user failed: $e', stackTrace);
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _testFlush() async {
    setState(() => _isLoading = true);
    try {
      await NivoStack.instance.flush();
      _showMessage('Events flushed successfully');
    } on DioException catch (e) {
      _showError('Flush failed', e);
    } catch (e, stackTrace) {
      _showError('Flush failed: $e', stackTrace);
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _testRefreshConfig() async {
    setState(() => _isLoading = true);
    try {
      final result = await NivoStack.instance.refreshConfig(forceRefresh: true);
      if (result.hasChanges) {
        _showMessage('Config refreshed successfully');
      } else if (result.error != null) {
        _showError('Config refresh error: ${result.error}');
      } else {
        _showMessage('Config already up to date');
      }
    } on DioException catch (e) {
      _showError('Refresh config failed', e);
    } catch (e, stackTrace) {
      _showError('Refresh config failed: $e', stackTrace);
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _testScreenTracking() async {
    setState(() => _isLoading = true);
    try {
      if (!NivoStack.isInitialized) {
        _showError('SDK not initialized');
        return;
      }

      final instance = NivoStack.instance;
      
      // Check if session tracking is enabled
      if (!instance.featureFlags.sessionTracking) {
        _showError('Session tracking is disabled (check feature flags)');
        return;
      }

      // Make direct API call to see actual HTTP response
      final dio = Dio(BaseOptions(
        baseUrl: getBaseUrl(),
        headers: {
          'X-API-Key': 'cmjoin79y00069z09upepkf11',
          'Content-Type': 'application/json',
        },
      ));

      // Get session token from SDK
      final sessionToken = instance.sessionToken;
      if (sessionToken == null) {
        _showError('No active session. Please start a session first.');
        return;
      }

      // Update session with screen name
      final response = await dio.patch(
        '/api/sessions',
        data: {
          'sessionToken': sessionToken,
          'screenName': 'TestScreen',
        },
      );

      _showMessage('Screen tracked successfully: HTTP ${response.statusCode} ${response.statusMessage}\nScreen: TestScreen\nResponse: ${response.data}');
      
      // Also call SDK method for consistency
      await instance.trackScreen('TestScreen');
    } on DioException catch (e) {
      _showError('Screen tracking failed', e);
    } catch (e, stackTrace) {
      _showError('Screen tracking failed: $e', stackTrace);
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _testPrintCapture() {
    print('This is a test print statement that should be captured by SDK');
    _showMessage('Print statement executed (check if capture is enabled)');
  }

  Future<void> _testTrackEvent() async {
    setState(() => _isLoading = true);
    try {
      await NivoStack.instance.trackEvent(
        'test_event',
        data: {
          'button': 'Track Event',
          'timestamp': DateTime.now().toIso8601String(),
        },
      );
      _showMessage('Custom event tracked successfully');
    } on DioException catch (e) {
      _showError('Track event failed', e);
    } catch (e, stackTrace) {
      _showError('Track event failed: $e', stackTrace);
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _testSetUserProperties() async {
    setState(() => _isLoading = true);
    try {
      await NivoStack.instance.setUserProperties({
        'test_property': 'test_value',
        'test_number': 123,
        'test_bool': true,
      });
      _showMessage('User properties set successfully');
    } on DioException catch (e) {
      _showError('Set user properties failed', e);
    } catch (e, stackTrace) {
      _showError('Set user properties failed: $e', stackTrace);
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _testManualApiTrace() async {
    setState(() => _isLoading = true);
    try {
      await NivoStack.instance.trackApiTrace(
        url: 'https://jsonplaceholder.typicode.com/posts/1',
        method: 'GET',
        statusCode: 200,
        duration: 150,
        requestHeaders: {'Content-Type': 'application/json'},
        responseHeaders: {'Content-Type': 'application/json'},
        requestBody: null,
        responseBody: '{"test": "response"}',
      );
      _showMessage('Manual API trace sent successfully');
    } on DioException catch (e) {
      _showError('Manual API trace failed', e);
    } catch (e, stackTrace) {
      _showError('Manual API trace failed: $e', stackTrace);
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _testDifferentLogLevels() async {
    setState(() => _isLoading = true);
    try {
      await Future.wait([
        NivoStack.instance.log(level: 'verbose', tag: 'Test', message: 'Verbose log'),
        NivoStack.instance.log(level: 'debug', tag: 'Test', message: 'Debug log'),
        NivoStack.instance.log(level: 'info', tag: 'Test', message: 'Info log'),
        NivoStack.instance.log(level: 'warn', tag: 'Test', message: 'Warning log'),
        NivoStack.instance.log(level: 'error', tag: 'Test', message: 'Error log'),
      ]);
      _showMessage('All log levels sent');
    } on DioException catch (e) {
      _showError('Log levels failed', e);
    } catch (e, stackTrace) {
      _showError('Log levels failed: $e', stackTrace);
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _testDeviceRegistration() async {
    setState(() => _isLoading = true);
    try {
      _showMessage('Attempting device registration...');
      
      if (!NivoStack.isInitialized) {
        _showError('SDK not initialized');
        return;
      }
      
      final instance = NivoStack.instance;
      
      // Check if device tracking is enabled
      if (!instance.featureFlags.deviceTracking) {
        _showError('Device tracking is disabled in feature flags');
        return;
      }
      
      // Try to register device directly via API to get detailed error
      try {
        final dio = Dio(BaseOptions(
          baseUrl: getBaseUrl(),
          headers: {
            'X-API-Key': 'cmjoin79y00069z09upepkf11',
            'Content-Type': 'application/json',
          },
        ));
        
        final deviceInfo = instance.deviceInfo;
        final response = await dio.post(
          '/api/devices',
          data: {
            'deviceId': deviceInfo.deviceId,
            'platform': deviceInfo.platform,
            'osVersion': deviceInfo.osVersion,
            'appVersion': deviceInfo.appVersion,
            'model': deviceInfo.model,
            'manufacturer': deviceInfo.manufacturer,
            'metadata': deviceInfo.metadata,
            if (instance.deviceCode != null) 'deviceCode': instance.deviceCode,
          },
        );
        
        final deviceData = response.data['device'];
        if (deviceData != null) {
          final deviceCode = deviceData['deviceCode'];
          _showMessage('Device registered successfully!\nDevice Code: ${deviceCode ?? "N/A"}\nDevice ID: ${deviceData['id']}');
        } else {
          _showError('Device registration response missing device data', response.data);
        }
      } on DioException catch (e) {
        _showError('Device registration API error', e);
      }
      
      // Also try SDK method
      await instance.refreshConfig(forceRefresh: true);
      await Future.delayed(const Duration(seconds: 1));
      
      if (instance.isDeviceRegistered) {
        final code = instance.deviceCode ?? 'N/A';
        if (code == 'N/A') {
          _showError('Device registered but no device code received. Check server logs.');
        }
      }
    } on DioException catch (e) {
      _showError('Device registration error', e);
    } catch (e, stackTrace) {
      _showError('Device registration error: $e', stackTrace);
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _showSDKStatus() {
    try {
      final instance = NivoStack.instance;
      final statusText = StringBuffer();
      
      // Add initialization error if any
      if (_initError != null) {
        statusText.writeln('⚠️ INIT ERROR: $_initError');
        statusText.writeln('');
      }
      
      statusText.writeln('Initialized: ${NivoStack.isInitialized}');
      statusText.writeln('Fully Initialized: ${instance.isFullyInitialized}');
      statusText.writeln('Config Fetched: ${instance.isConfigFetched}');
      statusText.writeln('Device Registered: ${instance.isDeviceRegistered}');
      statusText.writeln('Session Started: ${instance.isSessionStarted}');
      statusText.writeln('Device Code: ${instance.deviceCode ?? "N/A"}');
      statusText.writeln('Tracking Enabled: ${instance.isTrackingEnabled}');
      statusText.writeln('Event Count: ${instance.eventCount}');
      statusText.writeln('Error Count: ${instance.errorCount}');
      statusText.writeln('Pending Traces: ${instance.pendingTraceCount}');
      statusText.writeln('Pending Logs: ${instance.pendingLogCount}');
      statusText.writeln('');
      statusText.writeln('Feature Flags:');
      statusText.writeln('  SDK Enabled: ${instance.featureFlags.sdkEnabled}');
      statusText.writeln('  Device Tracking: ${instance.featureFlags.deviceTracking}');
      statusText.writeln('  API Tracking: ${instance.featureFlags.apiTracking}');
      statusText.writeln('  Screen Tracking: ${instance.featureFlags.screenTracking}');
      statusText.writeln('  Logging: ${instance.featureFlags.logging}');
      statusText.writeln('  Crash Reporting: ${instance.featureFlags.crashReporting}');
      
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('SDK Status'),
          content: SingleChildScrollView(
            child: Text(
              statusText.toString(),
              style: const TextStyle(fontFamily: 'monospace', fontSize: 12),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Close'),
            ),
            if (!instance.isDeviceRegistered)
              TextButton(
                onPressed: () {
                  Navigator.of(context).pop();
                  _testDeviceRegistration();
                },
                child: const Text('Retry Registration'),
              ),
          ],
        ),
      );
    } on DioException catch (e) {
      _showError('Failed to get SDK status', e);
    } catch (e, stackTrace) {
      _showError('Failed to get SDK status: $e', stackTrace);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('NivoStack SDK Example'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Status Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Status',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                    Text(_statusMessage),
                    if (_isLoading) const LinearProgressIndicator(),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // SDK Status Button
            ElevatedButton.icon(
              onPressed: _showSDKStatus,
              icon: const Icon(Icons.info),
              label: const Text('Show SDK Status'),
            ),
            const SizedBox(height: 8),
            
            // Device Registration Test Button
            ElevatedButton.icon(
              onPressed: _isLoading ? null : _testDeviceRegistration,
              icon: const Icon(Icons.phone_android),
              label: const Text('Test Device Registration'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.orange,
                foregroundColor: Colors.white,
              ),
            ),
            const SizedBox(height: 8),
            
            // Show initialization error if any
            if (_initError != null)
              Container(
                padding: const EdgeInsets.all(12),
                margin: const EdgeInsets.only(bottom: 8),
                decoration: BoxDecoration(
                  color: Colors.red.shade50,
                  border: Border.all(color: Colors.red),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.error, color: Colors.red),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _initError!,
                        style: const TextStyle(color: Colors.red),
                      ),
                    ),
                  ],
                ),
              ),

            const Divider(),
            const Text(
              'API & Network',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),

            // API Tracing
            ElevatedButton.icon(
              onPressed: _isLoading ? null : _testNivoStackApiCall,
              icon: const Icon(Icons.api),
              label: const Text('Test NivoStack API (Rate Limit)'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.purple,
                foregroundColor: Colors.white,
              ),
            ),
            const SizedBox(height: 8),
            
            ElevatedButton.icon(
              onPressed: _isLoading ? null : _testApiCall,
              icon: const Icon(Icons.network_check),
              label: const Text('Test External API (Not Rate Limited)'),
            ),
            const SizedBox(height: 8),

            // Logging
            ElevatedButton.icon(
              onPressed: _isLoading ? null : _testLogging,
              icon: const Icon(Icons.description),
              label: const Text('Send Test Log'),
            ),
            const SizedBox(height: 8),

            // Crash Reporting
            ElevatedButton.icon(
              onPressed: _isLoading ? null : _testCrashReport,
              icon: const Icon(Icons.bug_report),
              label: const Text('Send Crash Report'),
            ),
            const SizedBox(height: 8),

            // Flush Events
            ElevatedButton.icon(
              onPressed: _isLoading ? null : _testFlush,
              icon: const Icon(Icons.upload),
              label: const Text('Flush Pending Events'),
            ),
            const SizedBox(height: 16),

            const Divider(),
            const Text(
              'Configuration',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),

            // Business Config
            ElevatedButton.icon(
              onPressed: _isLoading ? null : _testBusinessConfig,
              icon: const Icon(Icons.settings),
              label: const Text('Refresh Business Config'),
            ),
            const SizedBox(height: 8),

            // Localization
            ElevatedButton.icon(
              onPressed: _isLoading ? null : _testLocalization,
              icon: const Icon(Icons.language),
              label: const Text('Refresh Localization'),
            ),
            const SizedBox(height: 8),

            // Refresh Config
            ElevatedButton.icon(
              onPressed: _isLoading ? null : _testRefreshConfig,
              icon: const Icon(Icons.refresh),
              label: const Text('Refresh All Config'),
            ),
            const SizedBox(height: 16),

            const Divider(),
            const Text(
              'User Management',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),

            // Set User
            ElevatedButton.icon(
              onPressed: _isLoading ? null : _testSetUser,
              icon: const Icon(Icons.person_add),
              label: const Text('Set User'),
            ),
            const SizedBox(height: 8),

            // Clear User
            ElevatedButton.icon(
              onPressed: _isLoading ? null : _testClearUser,
              icon: const Icon(Icons.person_remove),
              label: const Text('Clear User'),
            ),
            const SizedBox(height: 16),

            const Divider(),
            const Text(
              'Screen Tracking',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),

            // Screen Tracking
            ElevatedButton.icon(
              onPressed: _testScreenTracking,
              icon: const Icon(Icons.screen_share),
              label: const Text('Track Screen'),
            ),
            const SizedBox(height: 8),

            // Print Capture
            ElevatedButton.icon(
              onPressed: _testPrintCapture,
              icon: const Icon(Icons.print),
              label: const Text('Test Print Capture'),
            ),
            const SizedBox(height: 8),

            // Track Custom Event
            ElevatedButton.icon(
              onPressed: _isLoading ? null : _testTrackEvent,
              icon: const Icon(Icons.event),
              label: const Text('Track Custom Event'),
            ),
            const SizedBox(height: 8),

            // Set User Properties
            ElevatedButton.icon(
              onPressed: _isLoading ? null : _testSetUserProperties,
              icon: const Icon(Icons.person_pin),
              label: const Text('Set User Properties'),
            ),
            const SizedBox(height: 8),

            // Manual API Trace
            ElevatedButton.icon(
              onPressed: _isLoading ? null : _testManualApiTrace,
              icon: const Icon(Icons.api),
              label: const Text('Manual API Trace'),
            ),
            const SizedBox(height: 8),

            // Test All Log Levels
            ElevatedButton.icon(
              onPressed: _isLoading ? null : _testDifferentLogLevels,
              icon: const Icon(Icons.list),
              label: const Text('Test All Log Levels'),
            ),
            const SizedBox(height: 16),

            // Navigation to Second Screen
            ElevatedButton.icon(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const SecondScreen()),
                );
              },
              icon: const Icon(Icons.arrow_forward),
              label: const Text('Navigate to Second Screen'),
            ),
          ],
        ),
      ),
    );
  }
}

class SecondScreen extends StatelessWidget {
  const SecondScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Screen will be automatically tracked if RouteObserver is set up
    return Scaffold(
      appBar: AppBar(
        title: const Text('Second Screen'),
      ),
      body: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('This is the second screen'),
            SizedBox(height: 16),
            Text('Screen navigation should be tracked automatically'),
          ],
        ),
      ),
    );
  }
}

