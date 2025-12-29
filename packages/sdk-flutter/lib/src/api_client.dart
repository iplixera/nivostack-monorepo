import 'package:dio/dio.dart';

import 'models/device_info.dart';

/// Internal API client for communicating with NivoStack server
class NivoStackApiClient {
  final String ingestUrl;
  final String controlUrl;
  final String apiKey;
  late final Dio _ingestDio;
  late final Dio _controlDio;

  NivoStackApiClient({
    required this.ingestUrl,
    required this.controlUrl,
    required this.apiKey,
  }) {
    // Dio instance for ingest endpoints (traces, logs, crashes, sessions, devices)
    _ingestDio = Dio(BaseOptions(
      baseUrl: ingestUrl,
      connectTimeout: const Duration(seconds: 3),
      receiveTimeout: const Duration(seconds: 3),
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
    ));

    // Dio instance for control endpoints (config, localization, feature flags)
    _controlDio = Dio(BaseOptions(
      baseUrl: controlUrl,
      connectTimeout: const Duration(seconds: 3),
      receiveTimeout: const Duration(seconds: 3),
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
    ));
  }

  /// Register device with NivoStack server (INGEST endpoint)
  ///
  /// Returns device registration response including:
  /// - id: Server device ID
  /// - deviceCode: Short device code for support
  /// - debugModeEnabled: Whether debug mode is active
  /// - trackingEnabled: Whether tracking is enabled for this device
  ///
  /// Note: Project ID is derived from API key in the X-API-Key header
  Future<Map<String, dynamic>> registerDevice({
    required NivoStackDeviceInfo deviceInfo,
    String? deviceCode,
  }) async {
    final response = await _ingestDio.post(
      '/api/devices',
      data: {
        ...deviceInfo.toJson(),
        if (deviceCode != null) 'deviceCode': deviceCode,
      },
    );
    return Map<String, dynamic>.from(response.data);
  }

  /// Associate user with device (INGEST endpoint)
  ///
  /// Call this after user logs in to link their identity with the device.
  /// This enables filtering devices by user in the dashboard.
  Future<void> setUser({
    required String deviceId,
    required String userId,
    String? email,
    String? name,
  }) async {
    await _ingestDio.patch(
      '/api/devices/$deviceId/user',
      data: {
        'userId': userId,
        if (email != null) 'email': email,
        if (name != null) 'name': name,
      },
    );
  }

  /// Clear user from device (INGEST endpoint)
  ///
  /// Call this on user logout to unlink their identity from the device.
  Future<void> clearUser({
    required String deviceId,
  }) async {
    await _ingestDio.delete('/api/devices/$deviceId/user');
  }

  /// Send API traces to NivoStack server (INGEST endpoint)
  ///
  /// Note: Project ID is derived from API key in the X-API-Key header
  Future<void> sendTraces({
    required String deviceId,
    String? sessionToken,
    required List<Map<String, dynamic>> traces,
  }) async {
    // Send traces in batch
    for (final trace in traces) {
      await _ingestDio.post(
        '/api/traces',
        data: {
          'deviceId': deviceId,
          if (sessionToken != null) 'sessionToken': sessionToken,
          ...trace,
        },
      );
    }
  }

  /// Start a new session with context (INGEST endpoint)
  Future<Map<String, dynamic>> startSession({
    required String deviceId,
    required String sessionToken,
    String? appVersion,
    String? osVersion,
    String? locale,
    String? timezone,
    String? networkType,
    String? entryScreen,
    Map<String, dynamic>? userProperties,
    Map<String, dynamic>? metadata,
  }) async {
    final response = await _ingestDio.post(
      '/api/sessions',
      data: {
        'deviceId': deviceId,
        'sessionToken': sessionToken,
        if (appVersion != null) 'appVersion': appVersion,
        if (osVersion != null) 'osVersion': osVersion,
        if (locale != null) 'locale': locale,
        if (timezone != null) 'timezone': timezone,
        if (networkType != null) 'networkType': networkType,
        if (entryScreen != null) 'entryScreen': entryScreen,
        if (userProperties != null) 'userProperties': userProperties,
        if (metadata != null) 'metadata': metadata,
      },
    );
    return response.data;
  }

  /// End current session with final metrics (INGEST endpoint)
  Future<Map<String, dynamic>> endSession({
    required String sessionToken,
    String? exitScreen,
    List<String>? screenFlow,
    int? eventCount,
    int? errorCount,
    Map<String, dynamic>? userProperties,
  }) async {
    final response = await _ingestDio.put(
      '/api/sessions',
      data: {
        'sessionToken': sessionToken,
        if (exitScreen != null) 'exitScreen': exitScreen,
        if (screenFlow != null) 'screenFlow': screenFlow,
        if (eventCount != null) 'eventCount': eventCount,
        if (errorCount != null) 'errorCount': errorCount,
        if (userProperties != null) 'userProperties': userProperties,
      },
    );
    return response.data;
  }

  /// Update session (add screen to flow, increment counters) (INGEST endpoint)
  Future<Map<String, dynamic>> updateSession({
    required String sessionToken,
    String? screenName,
    bool? incrementEventCount,
    bool? incrementErrorCount,
    Map<String, dynamic>? userProperties,
    Map<String, dynamic>? metadata,
  }) async {
    final response = await _ingestDio.patch(
      '/api/sessions',
      data: {
        'sessionToken': sessionToken,
        if (screenName != null) 'screenName': screenName,
        if (incrementEventCount == true) 'incrementEventCount': true,
        if (incrementErrorCount == true) 'incrementErrorCount': true,
        if (userProperties != null) 'userProperties': userProperties,
        if (metadata != null) 'metadata': metadata,
      },
    );
    return response.data;
  }

  /// Fetch business configurations (CONTROL endpoint)
  /// Returns a map with 'configs' (flat key-value map) and 'meta' (type info)
  ///
  /// Note: Project ID is derived from API key in the X-API-Key header
  Future<Map<String, dynamic>> getBusinessConfigs({
    String? category,
  }) async {
    final queryParams = <String, dynamic>{
      if (category != null) 'category': category,
    };

    final response = await _controlDio.get(
      '/api/business-config',
      queryParameters: queryParams.isEmpty ? null : queryParams,
    );

    final data = response.data;
    if (data is Map) {
      return Map<String, dynamic>.from(data);
    }
    return {'configs': {}, 'meta': {}};
  }

  /// Fetch translations for a language (CONTROL endpoint)
  ///
  /// Note: Project ID is derived from API key in the X-API-Key header
  Future<Map<String, dynamic>> getTranslations({
    String? languageCode,
  }) async {
    final queryParams = <String, dynamic>{
      if (languageCode != null) 'lang': languageCode,
    };

    final response = await _controlDio.get(
      '/api/localization/translations',
      queryParameters: queryParams.isEmpty ? null : queryParams,
    );

    return Map<String, dynamic>.from(response.data);
  }

  /// Fetch available languages (CONTROL endpoint)
  ///
  /// Note: Project ID is derived from API key in the X-API-Key header
  Future<List<Map<String, dynamic>>> getLanguages() async {
    final response = await _controlDio.get(
      '/api/localization/languages',
    );

    final data = response.data;
    if (data is Map && data['languages'] is List) {
      return List<Map<String, dynamic>>.from(data['languages']);
    }
    return [];
  }

  /// Fetch feature flags for the project (CONTROL endpoint)
  Future<Map<String, dynamic>> getFeatureFlags() async {
    final response = await _controlDio.get('/api/feature-flags');
    return Map<String, dynamic>.from(response.data);
  }

  /// Fetch SDK settings for the project (CONTROL endpoint)
  Future<Map<String, dynamic>> getSdkSettings() async {
    final response = await _controlDio.get('/api/sdk-settings');
    return Map<String, dynamic>.from(response.data);
  }

  /// Fetch all SDK initialization data in a single request (CONTROL endpoint)
  ///
  /// Returns combined response with:
  /// - featureFlags: Feature flag settings
  /// - sdkSettings: SDK configuration (settings + apiConfigs)
  /// - businessConfig: Business configuration (configs + meta)
  /// - timestamp: Server timestamp
  ///
  /// This is the optimized endpoint that replaces separate calls to:
  /// - getFeatureFlags()
  /// - getSdkSettings()
  /// - getBusinessConfigs()
  ///
  /// Supports conditional requests with ETag:
  /// - Pass [etag] to enable 304 Not Modified responses
  /// - Pass [deviceId] to get device-specific config (debug mode, tracking)
  /// - Returns [SdkInitResponse] with data, etag, and notModified flag
  Future<SdkInitResponse> getSdkInit({String? etag, String? deviceId}) async {
    final headers = <String, dynamic>{
      if (etag != null) 'If-None-Match': etag,
      if (deviceId != null) 'X-Device-Id': deviceId,
    };
    
    final response = await _controlDio.get(
      '/api/sdk-init',
      options: Options(
        headers: headers.isNotEmpty ? headers : null,
        // Don't throw on 304 - we want to handle it
        validateStatus: (status) => status != null && (status < 400 || status == 304),
      ),
    );

    // Handle 304 Not Modified
    if (response.statusCode == 304) {
      return SdkInitResponse(
        data: null,
        etag: response.headers.value('etag'),
        notModified: true,
      );
    }

    return SdkInitResponse(
      data: Map<String, dynamic>.from(response.data),
      etag: response.headers.value('etag'),
      notModified: false,
    );
  }

  /// Send logs to NivoStack server (supports batch) (INGEST endpoint)
  Future<void> sendLogs({
    required List<Map<String, dynamic>> logs,
  }) async {
    await _ingestDio.post(
      '/api/logs',
      data: logs,
    );
  }

  /// Send a crash report to NivoStack server (INGEST endpoint)
  ///
  /// Note: Project ID is derived from API key in the X-API-Key header
  Future<void> sendCrash({
    required String deviceId,
    required String message,
    String? stackTrace,
    Map<String, dynamic>? metadata,
  }) async {
    await _ingestDio.post(
      '/api/crashes',
      data: {
        'deviceId': deviceId,
        'message': message,
        if (stackTrace != null) 'stackTrace': stackTrace,
        if (metadata != null) 'metadata': metadata,
      },
    );
  }
}

/// Response from SDK init endpoint
///
/// Contains the initialization data along with ETag for conditional requests.
class SdkInitResponse {
  /// The SDK configuration data (null if 304 Not Modified)
  final Map<String, dynamic>? data;

  /// ETag from server for conditional requests
  final String? etag;

  /// True if server returned 304 Not Modified (config unchanged)
  final bool notModified;

  SdkInitResponse({
    this.data,
    this.etag,
    required this.notModified,
  });

  @override
  String toString() => 'SdkInitResponse(notModified: $notModified, etag: $etag, hasData: ${data != null})';
}
