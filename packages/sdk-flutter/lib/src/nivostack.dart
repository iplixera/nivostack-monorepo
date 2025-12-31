import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:ui';

import 'package:device_info_plus/device_info_plus.dart';
import 'package:flutter/foundation.dart' show kDebugMode;
import 'package:package_info_plus/package_info_plus.dart';
import 'package:uuid/uuid.dart';

import 'api_client.dart';
import 'business_config.dart';
import 'device_code_generator.dart';
import 'localization.dart';
import 'models/app_blocking_config.dart';
import 'models/device_config.dart';
import 'models/device_info.dart';
import 'models/feature_flags.dart';
import 'models/sdk_settings.dart';
import 'sdk_config_cache.dart';

/// Default NivoStack ingest API base URL (for sending data: traces, logs, crashes, sessions)
const String kDefaultNivoStackIngestUrl = 'https://ingest.nivostack.com';

/// Default NivoStack control API base URL (for fetching config: business config, localization, feature flags)
const String kDefaultNivoStackControlUrl = 'https://api.nivostack.com';

/// Main NivoStack SDK class for Flutter applications
///
/// Usage:
/// ```dart
/// await NivoStack.init(
///   apiKey: 'your-project-api-key',
/// );
///
/// // Check if feature is enabled before using
/// if (NivoStack.instance.featureFlags.apiTracking) {
///   // API tracking is enabled
/// }
/// ```
class NivoStack {
  static NivoStack? _instance;
  static NivoStack get instance {
    if (_instance == null) {
      throw StateError('NivoStack not initialized. Call NivoStack.init() first.');
    }
    return _instance!;
  }

  final String ingestUrl;
  final String controlUrl;
  final String apiKey;
  final bool enabled;

  late final NivoStackApiClient _apiClient;
  late final NivoStackDeviceInfo _deviceInfo;
  late final NivoStackBusinessConfig _businessConfig;
  late final NivoStackLocalization _localization;

  /// Feature flags controlling which SDK features are enabled
  NivoStackFeatureFlags _featureFlags = NivoStackFeatureFlags.defaults();

  /// SDK settings for controlling data capture and performance
  NivoStackSdkSettings _sdkSettings = NivoStackSdkSettings.defaults();

  /// API-specific configurations
  List<NivoStackApiConfig> _apiConfigs = [];

  /// Device-specific configuration from server
  NivoStackDeviceConfig _deviceConfig = NivoStackDeviceConfig.defaults();

  /// Short device code for support identification (e.g., "A7B3-X9K2")
  String? _deviceCode;

  /// Server-assigned device ID (needed for user association API calls)
  String? _registeredDeviceId;

  String? _sessionToken;
  String? _currentScreen;
  final _uuid = const Uuid();

  // Session context and metrics
  List<String> _screenFlow = [];
  int _eventCount = 0;
  int _errorCount = 0;
  Map<String, dynamic> _userProperties = {};
  String? _entryScreen;

  // Queue for batching traces
  final List<Map<String, dynamic>> _traceQueue = [];
  // Queue for batching logs
  final List<Map<String, dynamic>> _logQueue = [];
  Timer? _flushTimer;

  // These are now controlled by SDK settings
  Duration get _flushInterval => Duration(seconds: _sdkSettings.flushIntervalSeconds);
  int get _maxQueueSize => _sdkSettings.maxTraceQueueSize;
  int get _maxLogQueueSize => _sdkSettings.maxLogQueueSize;

  // Zone-based print interception
  bool _captureAllPrints = false;

  // App blocking listener
  AppBlockingListener? _appBlockingListener;

  // Local config cache for instant startup
  late final SdkConfigCache _configCache;

  NivoStack._({
    required this.ingestUrl,
    required this.controlUrl,
    required this.apiKey,
    required this.enabled,
  }) {
    _apiClient = NivoStackApiClient(
      ingestUrl: ingestUrl,
      controlUrl: controlUrl,
      apiKey: apiKey,
    );
    _businessConfig = NivoStackBusinessConfig(
      apiClient: _apiClient,
    );
    _localization = NivoStackLocalization(
      apiClient: _apiClient,
    );
    _configCache = SdkConfigCache();
    // Generate initial session token (will be registered with server after init)
    _sessionToken = _uuid.v4();
    _startFlushTimer();
  }

  // Track initialization status for debug UI
  bool _isFullyInitialized = false;
  bool _configFetched = false;
  bool _deviceRegistered = false;
  bool _sessionStarted = false;
  String? _initError;

  /// Check if SDK has completed full initialization (including background tasks)
  bool get isFullyInitialized => _isFullyInitialized;

  /// Check if config has been fetched from server
  bool get isConfigFetched => _configFetched;

  /// Check if device has been registered with server
  bool get isDeviceRegistered => _deviceRegistered;

  /// Check if session has started
  bool get isSessionStarted => _sessionStarted;

  /// Get any initialization error
  String? get initError => _initError;

  /// Initialize NivoStack SDK
  ///
  /// [apiKey] - Project API key from NivoStack Studio dashboard (project ID is derived from this)
  /// [enabled] - Enable/disable SDK (useful for debug vs release builds)
  ///
  /// API endpoints are automatically configured:
  /// - Ingest API: https://ingest.nivostack.com (for sending data)
  /// - Control API: https://api.nivostack.com (for fetching config)
  ///
  /// This method returns immediately after loading cached config (if available).
  /// Network operations (config fetch, device registration, session start) run
  /// in the background and do NOT block app startup.
  static Future<NivoStack> init({
    required String apiKey,
    bool enabled = true,
  }) async {
    if (_instance != null) {
      return _instance!;
    }

    final stopwatch = Stopwatch()..start();

    _instance = NivoStack._(
      ingestUrl: kDefaultNivoStackIngestUrl,
      controlUrl: kDefaultNivoStackControlUrl,
      apiKey: apiKey,
      enabled: enabled,
    );

    // Initialize device info (required for basic operation)
    await _instance!._initDeviceInfo();
    print('NivoStack: Device info initialized in ${stopwatch.elapsedMilliseconds}ms');

    if (enabled) {
      // Load cached config synchronously for instant startup
      final cached = await _instance!._configCache.load();
      if (cached != null && cached.hasData) {
        _instance!._applyCachedConfig(cached);
        _instance!._configFetched = true;
        print('NivoStack: Cached config loaded in ${stopwatch.elapsedMilliseconds}ms (age: ${cached.age.inSeconds}s)');
      }

      // Run network operations in background - DO NOT BLOCK app startup
      // ignore: unawaited_futures
      _instance!._initializeInBackground();
    }

    print('NivoStack: SDK init completed in ${stopwatch.elapsedMilliseconds}ms (background tasks running)');
    return _instance!;
  }

  /// Run network-dependent initialization in background
  ///
  /// This method runs after init() returns to avoid blocking app startup.
  /// It handles: config fetch, device registration, and session start.
  Future<void> _initializeInBackground() async {
    final stopwatch = Stopwatch()..start();

    try {
      // Fetch fresh config from server (will use ETag for efficient updates)
      await _fetchSdkInitDataBackground();
      _configFetched = true;
      print('NivoStack: Background config fetch completed in ${stopwatch.elapsedMilliseconds}ms');

      // Register device with server (if device tracking is enabled)
      if (_featureFlags.deviceTracking) {
        await _registerDevice();
        _deviceRegistered = true;
        print('NivoStack: Device registered in ${stopwatch.elapsedMilliseconds}ms');
      }

      // Start session with server (if session tracking is enabled)
      if (_featureFlags.sessionTracking) {
        await _startSession();
        _sessionStarted = true;
        print('NivoStack: Session started in ${stopwatch.elapsedMilliseconds}ms');
      }

      _isFullyInitialized = true;
      _initError = null;
      print('NivoStack: Full background initialization completed in ${stopwatch.elapsedMilliseconds}ms');
    } catch (e) {
      _initError = e.toString();
      print('NivoStack: Background initialization failed: $e');
      // Don't throw - background failures shouldn't crash the app
    }
  }

  /// Fetch SDK init data in background (doesn't load cache, just fetches fresh data)
  Future<void> _fetchSdkInitDataBackground() async {
    try {
      // Determine build mode: debug builds use 'preview', release builds use 'production'
      final buildMode = kDebugMode ? 'preview' : 'production';
      
      // Get cached ETag for conditional request
      final cached = await _configCache.load();
      final response = await _apiClient.getSdkInit(
        etag: cached?.etag,
        deviceId: _registeredDeviceId,
        buildMode: buildMode, // Pass build mode to fetch appropriate build snapshot
      );

      // Handle 304 Not Modified - config unchanged
      if (response.notModified) {
        print('NivoStack: Config unchanged (304 Not Modified)');
        return;
      }

      // New config received - parse and apply
      if (response.data != null) {
        _applyInitResponse(response.data!);
        await _configCache.save(response.data!, etag: response.etag);
        print('NivoStack: Fresh config applied and cached (etag: ${response.etag})');
      }
    } catch (e) {
      // Network failed - this is OK, we already have cached config
      print('NivoStack: Background config fetch failed (using cache): $e');
    }
  }

  /// Check if SDK is initialized
  static bool get isInitialized => _instance != null;

  /// Get current session token
  String? get sessionToken => _sessionToken;

  /// Get current screen name
  String? get currentScreen => _currentScreen;

  /// Get device info
  NivoStackDeviceInfo get deviceInfo => _deviceInfo;

  /// Get business config client (returns null if business config is disabled)
  NivoStackBusinessConfig? get businessConfig {
    if (!_featureFlags.businessConfig) return null;
    return _businessConfig;
  }

  /// Get localization client (returns null if localization is disabled)
  NivoStackLocalization? get localization {
    if (!_featureFlags.localization) return null;
    return _localization;
  }

  /// Get current feature flags
  NivoStackFeatureFlags get featureFlags => _featureFlags;

  /// Get current SDK settings
  NivoStackSdkSettings get sdkSettings => _sdkSettings;

  /// Get API-specific configurations
  List<NivoStackApiConfig> get apiConfigs => List.unmodifiable(_apiConfigs);

  /// Get device-specific configuration from server
  NivoStackDeviceConfig get deviceConfig => _deviceConfig;

  /// Get short device code for support identification
  ///
  /// Format: XXXX-XXXX (e.g., "A7B3-X9K2")
  /// Display this in your app's settings or support screen so users
  /// can provide it when contacting support.
  String? get deviceCode => _deviceCode;

  /// Check if tracking is enabled for this device
  ///
  /// Returns true if:
  /// - SDK is enabled AND
  /// - Tracking mode is 'all', OR
  /// - Tracking mode is 'debug_only' and device has debug mode enabled
  ///
  /// Returns false if:
  /// - SDK is disabled OR
  /// - Tracking mode is 'none' OR
  /// - Tracking mode is 'debug_only' and device doesn't have debug mode
  bool get isTrackingEnabled => _deviceConfig.trackingEnabled;

  /// Get current screen flow (list of screens visited in this session)
  List<String> get screenFlow => List.unmodifiable(_screenFlow);

  /// Get current event count for this session
  int get eventCount => _eventCount;

  /// Get current error count for this session
  int get errorCount => _errorCount;

  /// Get user properties set for this session
  Map<String, dynamic> get userProperties => Map.unmodifiable(_userProperties);

  /// Get pending trace count (traces waiting to be sent to server)
  int get pendingTraceCount => _traceQueue.length;

  /// Get pending log count (logs waiting to be sent to server)
  int get pendingLogCount => _logQueue.length;

  /// Check if a specific feature is enabled
  ///
  /// Note: If sdkEnabled is false, ALL features return false (master kill switch)
  bool isFeatureEnabled(String feature) {
    // Master kill switch - if SDK is disabled, no features are enabled
    if (!_featureFlags.sdkEnabled) return false;

    switch (feature) {
      case 'sdkEnabled':
        return _featureFlags.sdkEnabled;
      case 'apiTracking':
        return _featureFlags.apiTracking;
      case 'screenTracking':
        return _featureFlags.screenTracking;
      case 'crashReporting':
        return _featureFlags.crashReporting;
      case 'logging':
        return _featureFlags.logging;
      case 'deviceTracking':
        return _featureFlags.deviceTracking;
      case 'sessionTracking':
        return _featureFlags.sessionTracking;
      case 'businessConfig':
        return _featureFlags.businessConfig;
      case 'localization':
        return _featureFlags.localization;
      case 'offlineSupport':
        return _featureFlags.offlineSupport;
      case 'batchEvents':
        return _featureFlags.batchEvents;
      default:
        return false;
    }
  }

  /// Fetch all SDK init data in a single optimized request
  ///
  /// This method replaces separate calls to:
  /// - _fetchFeatureFlags()
  /// - _fetchSdkSettings()
  /// - businessConfig.fetch()
  ///
  /// Performance improvement: ~93% faster (from ~5s to ~300ms with caching)
  /// With local cache: Near-instant startup for returning users (~0ms)
  /// With ETag: Skip downloading unchanged config (304 Not Modified)
  ///
  /// Cache strategy:
  /// 1. Load cached data immediately (non-blocking for returning users)
  /// 2. Fetch fresh data from server with ETag for conditional request
  /// 3. If 304, config unchanged - keep using cached data
  /// 4. If 200, update cache with new data and ETag
  Future<void> _fetchSdkInitData() async {
    // 1. Try to load cached data first for instant startup
    final cached = await _configCache.load();
    if (cached != null && cached.hasData) {
      _applyCachedConfig(cached);
      print('NivoStack: Using cached config (age: ${cached.age.inSeconds}s, stale: ${cached.isStale})');
    }

    // 2. Fetch from server with ETag for conditional request
    try {
      final response = await _apiClient.getSdkInit(
        etag: cached?.etag,
        deviceId: _registeredDeviceId,
      );

      // 3. Handle 304 Not Modified - config unchanged, keep using cache
      if (response.notModified) {
        print('NivoStack: Config unchanged (304 Not Modified), using cached data');
        return;
      }

      // 4. New config received - parse and apply
      if (response.data != null) {
        _applyInitResponse(response.data!);

        // Save to cache with new ETag
        await _configCache.save(response.data!, etag: response.etag);
        print('NivoStack: SDK init data loaded and cached (etag: ${response.etag})');
      }
    } catch (e) {
      // If network fails but we have cache, that's OK
      if (cached != null && cached.hasData) {
        print('NivoStack: Network failed, continuing with cached config: $e');
        return;
      }

      // No cache and network failed - fall back to separate requests
      print('NivoStack: Combined init failed, falling back to separate requests: $e');
      await _fetchFeatureFlags();
      await _fetchSdkSettings();
    }
  }

  /// Apply cached configuration data
  void _applyCachedConfig(CachedSdkConfig cached) {
    // Apply cached feature flags
    if (cached.featureFlags != null) {
      _featureFlags = NivoStackFeatureFlags.fromJson(cached.featureFlags!);
    }

    // Apply cached SDK settings
    if (cached.sdkSettings != null) {
      final sdkSettingsData = cached.sdkSettings!;
      if (sdkSettingsData['settings'] != null) {
        _sdkSettings = NivoStackSdkSettings.fromJson(
          Map<String, dynamic>.from(sdkSettingsData['settings']),
        );
        if (_sdkSettings.capturePrintStatements) {
          _captureAllPrints = true;
        }
      }
      if (sdkSettingsData['apiConfigs'] != null) {
        _apiConfigs = (sdkSettingsData['apiConfigs'] as List)
            .map((c) => NivoStackApiConfig.fromJson(Map<String, dynamic>.from(c)))
            .toList();
      }
    }

    // Apply cached business config
    if (cached.businessConfig != null) {
      final businessConfigData = cached.businessConfig!;
      _businessConfig.setFromInitData(
        configs: businessConfigData['configs'] ?? {},
        meta: businessConfigData['meta'] ?? {},
      );
    }

    // Apply cached device config
    if (cached.deviceConfig != null) {
      _deviceConfig = NivoStackDeviceConfig.fromJson(cached.deviceConfig!);

      // Update registered device ID if available
      if (cached.deviceConfig!['deviceId'] != null) {
        _registeredDeviceId = cached.deviceConfig!['deviceId'] as String;
      }

      // Update device code if available
      if (cached.deviceConfig!['deviceCode'] != null) {
        _deviceCode = cached.deviceConfig!['deviceCode'] as String;
      }
    }
  }

  /// Apply fresh init response from server
  void _applyInitResponse(Map<String, dynamic> response) {
    // Parse feature flags
    if (response['featureFlags'] != null) {
      _featureFlags = NivoStackFeatureFlags.fromJson(
        Map<String, dynamic>.from(response['featureFlags']),
      );
      print('NivoStack: Feature flags loaded: $_featureFlags');
    }

    // Parse SDK settings
    final sdkSettingsData = response['sdkSettings'];
    if (sdkSettingsData != null) {
      if (sdkSettingsData['settings'] != null) {
        _sdkSettings = NivoStackSdkSettings.fromJson(
          Map<String, dynamic>.from(sdkSettingsData['settings']),
        );
        print('NivoStack: SDK settings loaded: $_sdkSettings');

        // Update capture all prints based on settings
        if (_sdkSettings.capturePrintStatements) {
          _captureAllPrints = true;
        }
      }

      // Parse API configs
      if (sdkSettingsData['apiConfigs'] != null) {
        _apiConfigs = (sdkSettingsData['apiConfigs'] as List)
            .map((c) => NivoStackApiConfig.fromJson(Map<String, dynamic>.from(c)))
            .toList();
        print('NivoStack: Loaded ${_apiConfigs.length} API configs');
      }
    }

    // Pre-populate business config cache
    final businessConfigData = response['businessConfig'];
    if (businessConfigData != null) {
      _businessConfig.setFromInitData(
        configs: businessConfigData['configs'] ?? {},
        meta: businessConfigData['meta'] ?? {},
      );
      print('NivoStack: Business config pre-loaded from init');
    }

    // Parse device config (tracking status, debug mode)
    final deviceConfigData = response['deviceConfig'];
    if (deviceConfigData != null) {
      // Log raw device config data for debugging
      print('NivoStack: Raw deviceConfig from server: $deviceConfigData');
      
      _deviceConfig = NivoStackDeviceConfig.fromJson(
        Map<String, dynamic>.from(deviceConfigData),
      );

      // Update registered device ID if available
      if (deviceConfigData['deviceId'] != null) {
        _registeredDeviceId = deviceConfigData['deviceId'] as String;
      }

      // Update device code if server returned one
      if (deviceConfigData['deviceCode'] != null) {
        _deviceCode = deviceConfigData['deviceCode'] as String;
      }

      print('NivoStack: Device config loaded (tracking: ${_deviceConfig.trackingEnabled}, debug: ${_deviceConfig.debugModeEnabled})');
    } else {
      print('NivoStack: WARNING - No deviceConfig in response!');
    }
  }

  Future<void> _fetchFeatureFlags() async {
    try {
      final response = await _apiClient.getFeatureFlags();
      if (response['flags'] != null) {
        _featureFlags = NivoStackFeatureFlags.fromJson(
          Map<String, dynamic>.from(response['flags']),
        );
        print('NivoStack: Feature flags loaded: $_featureFlags');
      }
    } catch (e) {
      // Silently fail - use default flags
      print('NivoStack: Failed to fetch feature flags, using defaults: $e');
      _featureFlags = NivoStackFeatureFlags.defaults();
    }
  }

  /// Refresh feature flags from server
  Future<void> refreshFeatureFlags() async {
    await _fetchFeatureFlags();
  }

  Future<void> _fetchSdkSettings() async {
    try {
      final response = await _apiClient.getSdkSettings();
      if (response['settings'] != null) {
        _sdkSettings = NivoStackSdkSettings.fromJson(
          Map<String, dynamic>.from(response['settings']),
        );
        print('NivoStack: SDK settings loaded: $_sdkSettings');

        // Update capture all prints based on settings
        if (_sdkSettings.capturePrintStatements) {
          _captureAllPrints = true;
        }
      }

      // Parse API configs
      if (response['apiConfigs'] != null) {
        _apiConfigs = (response['apiConfigs'] as List)
            .map((c) => NivoStackApiConfig.fromJson(Map<String, dynamic>.from(c)))
            .toList();
        print('NivoStack: Loaded ${_apiConfigs.length} API configs');
      }
    } catch (e) {
      print('NivoStack: Failed to fetch SDK settings, using defaults: $e');
      _sdkSettings = NivoStackSdkSettings.defaults();
    }
  }

  /// Refresh SDK settings from server
  Future<void> refreshSdkSettings() async {
    await _fetchSdkSettings();
    // Restart flush timer with new interval
    _startFlushTimer();
  }

  // Config change callback
  void Function(ConfigRefreshResult)? _onConfigRefreshed;

  /// Set a callback that will be triggered when config is refreshed
  ///
  /// Example:
  /// ```dart
  /// NivoStack.instance.setOnConfigRefreshed((result) {
  ///   if (result.hasChanges) {
  ///     setState(() {}); // Rebuild UI with new config
  ///   }
  /// });
  /// ```
  void setOnConfigRefreshed(void Function(ConfigRefreshResult)? callback) {
    _onConfigRefreshed = callback;
  }

  /// Manually refresh config from server
  ///
  /// Returns a [ConfigRefreshResult] indicating whether config was updated.
  /// Use this for "Sync Data" button or pull-to-refresh functionality.
  ///
  /// If [forceRefresh] is true, bypasses ETag cache and forces a full fetch.
  /// Use this when you know device config has changed on the server (e.g., debug mode enabled).
  ///
  /// Example:
  /// ```dart
  /// // Normal refresh (uses ETag cache)
  /// final result = await NivoStack.instance.refreshConfig();
  ///
  /// // Force refresh (bypass cache to get latest device config)
  /// final result = await NivoStack.instance.refreshConfig(forceRefresh: true);
  ///
  /// if (result.hasChanges) {
  ///   print('Config updated!');
  ///   setState(() {}); // Trigger UI rebuild
  /// } else if (result.error != null) {
  ///   print('Sync failed: ${result.error}');
  /// } else {
  ///   print('Already up to date');
  /// }
  /// ```
  Future<ConfigRefreshResult> refreshConfig({bool forceRefresh = false}) async {
    try {
      if (forceRefresh) {
        print('NivoStack: Force refresh requested - bypassing ETag cache and re-registering device');
      }
      
      // Get cached ETag for conditional request (skip if force refresh)
      final cached = forceRefresh ? null : await _configCache.load();
      
      if (cached != null && cached.etag != null) {
        print('NivoStack: Using cached ETag: ${cached.etag}');
      } else {
        print('NivoStack: No cached ETag - requesting full config');
      }
      
      print('NivoStack: Sending device ID to server: $_registeredDeviceId');
      print('NivoStack: Current device code: $_deviceCode');
      
      final response = await _apiClient.getSdkInit(
        etag: cached?.etag,
        deviceId: _registeredDeviceId,
      );

      // Handle 304 Not Modified - config unchanged
      if (response.notModified && !forceRefresh) {
        print('NivoStack: Config unchanged (304 Not Modified)');
        
        // Even if SDK config hasn't changed, refresh device config when force refreshing
        if (forceRefresh && _featureFlags.deviceTracking) {
          print('NivoStack: Force refreshing device config...');
          await _registerDevice();
        }
        
        final result = ConfigRefreshResult(
          hasChanges: false,
          message: 'Already up to date',
        );
        _onConfigRefreshed?.call(result);
        return result;
      }

      // New config received - parse and apply
      if (response.data != null) {
        _applyInitResponse(response.data!);
        await _configCache.save(response.data!, etag: response.etag);
        
        // If force refreshing, also re-register device to get latest device config
        if (forceRefresh && _featureFlags.deviceTracking) {
          print('NivoStack: Force refreshing device config...');
          await _registerDevice();
        }
        
        if (forceRefresh) {
          print('NivoStack: Config force refreshed and cached (etag: ${response.etag})');
        } else {
          print('NivoStack: Config refreshed and cached (etag: ${response.etag})');
        }

        // Check app blocking status after config refresh
        _checkAppBlockingStatus();

        final result = ConfigRefreshResult(
          hasChanges: true,
          message: 'Config updated successfully',
        );
        _onConfigRefreshed?.call(result);
        return result;
      }

      // No data in response
      final result = ConfigRefreshResult(
        hasChanges: false,
        message: 'No config data received',
      );
      _onConfigRefreshed?.call(result);
      return result;
    } catch (e) {
      print('NivoStack: Config refresh failed: $e');
      final result = ConfigRefreshResult(
        hasChanges: false,
        error: e.toString(),
        message: 'Sync failed',
      );
      _onConfigRefreshed?.call(result);
      return result;
    }
  }

  /// Get the API config for a specific URL and method, or null if none matches
  NivoStackApiConfig? getApiConfig(String url, String method) {
    for (final config in _apiConfigs) {
      if (config.matches(url, method)) {
        return config;
      }
    }
    return null;
  }

  /// Check if tracing should be enabled for a given endpoint
  bool shouldTraceEndpoint(String url, String method) {
    final config = getApiConfig(url, method);
    return config?.enableLogs ?? true;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // FORCE UPDATE & MAINTENANCE MODE METHODS
  // ══════════════════════════════════════════════════════════════════════════

  /// Compare semantic versions
  ///
  /// Returns:
  /// - -1 if current < min (update required)
  /// - 0 if current == min
  /// - 1 if current > min
  ///
  /// Supports formats: "1.0.0", "1.0", "1"
  int _compareVersions(String current, String min) {
    final currentParts =
        current.split('.').map((p) => int.tryParse(p) ?? 0).toList();
    final minParts = min.split('.').map((p) => int.tryParse(p) ?? 0).toList();

    // Pad to 3 parts (major.minor.patch)
    while (currentParts.length < 3) {
      currentParts.add(0);
    }
    while (minParts.length < 3) {
      minParts.add(0);
    }

    for (int i = 0; i < 3; i++) {
      if (currentParts[i] < minParts[i]) return -1;
      if (currentParts[i] > minParts[i]) return 1;
    }
    return 0;
  }

  /// Check if force update is required
  ///
  /// Compares [currentAppVersion] with `min_app_version` from business config.
  /// Returns true if currentAppVersion < min_app_version AND force_update_enabled is true.
  ///
  /// Example:
  /// ```dart
  /// final needsUpdate = NivoStack.instance.isForceUpdateRequired('1.0.0');
  /// if (needsUpdate) {
  ///   // Show update UI
  /// }
  /// ```
  bool isForceUpdateRequired(String currentAppVersion) {
    if (!_featureFlags.businessConfig) return false;

    final enabled =
        _businessConfig.getBool('force_update_enabled', defaultValue: false);
    if (!enabled) return false;

    final minVersion =
        _businessConfig.getString('min_app_version', defaultValue: '1.0.0');
    return _compareVersions(currentAppVersion, minVersion) < 0;
  }

  /// Get the minimum required app version from config
  String getMinAppVersion() {
    return _businessConfig.getString('min_app_version', defaultValue: '1.0.0');
  }

  /// Get the appropriate store URL based on current platform
  ///
  /// Returns `play_store_url` on Android, `app_store_url` on iOS.
  /// Returns empty string if not configured.
  String getStoreUrl() {
    if (Platform.isAndroid) {
      return _businessConfig.getString('play_store_url', defaultValue: '');
    } else if (Platform.isIOS) {
      return _businessConfig.getString('app_store_url', defaultValue: '');
    }
    return '';
  }

  /// Get force update display configuration
  ForceUpdateConfig getForceUpdateConfig() {
    return ForceUpdateConfig(
      enabled:
          _businessConfig.getBool('force_update_enabled', defaultValue: false),
      minVersion:
          _businessConfig.getString('min_app_version', defaultValue: '1.0.0'),
      title: _businessConfig.getString('force_update_title',
          defaultValue: 'Update Required'),
      message: _businessConfig.getString('force_update_message',
          defaultValue:
              'A new version is available. Please update to continue using the app.'),
      buttonText: _businessConfig.getString('force_update_button_text',
          defaultValue: 'Update Now'),
      storeUrl: getStoreUrl(),
    );
  }

  /// Check if maintenance mode is currently active
  bool isMaintenanceEnabled() {
    if (!_featureFlags.businessConfig) return false;
    return _businessConfig.getBool('maintenance_enabled', defaultValue: false);
  }

  /// Get maintenance end time if configured
  ///
  /// Returns null if `maintenance_end_time` is not set or invalid.
  /// Parses ISO 8601 format: "2025-12-20T14:00:00Z"
  DateTime? getMaintenanceEndTime() {
    final endTimeStr =
        _businessConfig.getString('maintenance_end_time', defaultValue: '');
    if (endTimeStr.isEmpty) return null;

    try {
      return DateTime.parse(endTimeStr);
    } catch (e) {
      return null;
    }
  }

  /// Get maintenance display configuration
  MaintenanceConfig getMaintenanceConfig() {
    return MaintenanceConfig(
      enabled:
          _businessConfig.getBool('maintenance_enabled', defaultValue: false),
      title: _businessConfig.getString('maintenance_title',
          defaultValue: 'Under Maintenance'),
      message: _businessConfig.getString('maintenance_message',
          defaultValue:
              "We're currently performing scheduled maintenance. We'll be back shortly."),
      endTime: getMaintenanceEndTime(),
    );
  }

  /// Register listener for app blocking events
  ///
  /// These callbacks are triggered when:
  /// - Config is fetched and blocking condition is detected
  /// - Config changes via remote update
  ///
  /// Example:
  /// ```dart
  /// NivoStack.instance.setAppBlockingListener(
  ///   onForceUpdateRequired: (currentVersion, minVersion) {
  ///     print('Update required: $currentVersion -> $minVersion');
  ///   },
  ///   onMaintenanceEnabled: (message, endTime) {
  ///     print('Maintenance: $message, ends: $endTime');
  ///   },
  ///   onBlockingCleared: () {
  ///     print('App is no longer blocked');
  ///   },
  /// );
  /// ```
  void setAppBlockingListener({
    ForceUpdateCallback? onForceUpdateRequired,
    MaintenanceCallback? onMaintenanceEnabled,
    BlockingClearedCallback? onBlockingCleared,
  }) {
    _appBlockingListener = AppBlockingListener(
      onForceUpdateRequired: onForceUpdateRequired,
      onMaintenanceEnabled: onMaintenanceEnabled,
      onBlockingCleared: onBlockingCleared,
    );
  }

  /// Remove the app blocking listener
  void removeAppBlockingListener() {
    _appBlockingListener = null;
  }

  /// Check app blocking status and notify listener
  ///
  /// Call this after business config is loaded to trigger callbacks
  /// if blocking conditions are met.
  void _checkAppBlockingStatus() {
    if (_appBlockingListener == null) return;

    // Check maintenance first (higher priority typically)
    if (isMaintenanceEnabled()) {
      final config = getMaintenanceConfig();
      _appBlockingListener!.onMaintenanceEnabled?.call(
        config.message,
        config.endTime,
      );
      return;
    }

    // Check force update
    final currentVersion = _deviceInfo.appVersion ?? '0.0.0';
    if (isForceUpdateRequired(currentVersion)) {
      _appBlockingListener!.onForceUpdateRequired?.call(
        currentVersion,
        getMinAppVersion(),
      );
      return;
    }

    // No blocking conditions
    _appBlockingListener!.onBlockingCleared?.call();
  }

  /// Check blocking status with a specific app version
  ///
  /// Returns a tuple-like map with blocking status info
  Map<String, dynamic> checkBlockingStatus(String currentAppVersion) {
    return {
      'isBlocked': isForceUpdateRequired(currentAppVersion) || isMaintenanceEnabled(),
      'requiresUpdate': isForceUpdateRequired(currentAppVersion),
      'inMaintenance': isMaintenanceEnabled(),
      'forceUpdateConfig': isForceUpdateRequired(currentAppVersion) ? getForceUpdateConfig() : null,
      'maintenanceConfig': isMaintenanceEnabled() ? getMaintenanceConfig() : null,
    };
  }

  Future<void> _initDeviceInfo() async {
    final deviceInfoPlugin = DeviceInfoPlugin();
    final packageInfo = await PackageInfo.fromPlatform();

    // Try to load previously server-assigned device code from cache
    // DO NOT generate a local code - let the server generate and assign it
    _deviceCode = await DeviceCodeGenerator.get();
    if (_deviceCode != null) {
      print('NivoStack: Using cached device code: $_deviceCode');
    } else {
      print('NivoStack: No cached device code - server will assign one');
    }

    String platform;
    String? osVersion;
    String? model;
    String? manufacturer;
    String deviceId;
    Map<String, dynamic>? metadata;

    if (Platform.isAndroid) {
      final androidInfo = await deviceInfoPlugin.androidInfo;
      platform = 'android';
      osVersion = androidInfo.version.release;
      model = androidInfo.model;
      manufacturer = androidInfo.manufacturer;
      deviceId = androidInfo.id;
      metadata = {
        'sdk': androidInfo.version.sdkInt,
        'device': androidInfo.device,
        'product': androidInfo.product,
        'brand': androidInfo.brand,
        'isPhysicalDevice': androidInfo.isPhysicalDevice,
      };
    } else if (Platform.isIOS) {
      final iosInfo = await deviceInfoPlugin.iosInfo;
      platform = 'ios';
      osVersion = iosInfo.systemVersion;
      model = iosInfo.model;
      manufacturer = 'Apple';
      deviceId = iosInfo.identifierForVendor ?? _uuid.v4();
      metadata = {
        'name': iosInfo.name,
        'systemName': iosInfo.systemName,
        'localizedModel': iosInfo.localizedModel,
        'isPhysicalDevice': iosInfo.isPhysicalDevice,
      };
    } else {
      platform = 'unknown';
      deviceId = _uuid.v4();
    }

    _deviceInfo = NivoStackDeviceInfo(
      deviceId: deviceId,
      platform: platform,
      osVersion: osVersion,
      appVersion: packageInfo.version,
      model: model,
      manufacturer: manufacturer,
      metadata: metadata,
    );
  }

  Future<void> _startSession({String? entryScreen}) async {
    _sessionToken = _uuid.v4();
    _screenFlow = [];
    _eventCount = 0;
    _errorCount = 0;
    _entryScreen = entryScreen;

    if (entryScreen != null) {
      _screenFlow.add(entryScreen);
      _currentScreen = entryScreen;
    }

    if (!_featureFlags.sdkEnabled) return;  // Master kill switch
    if (!_featureFlags.sessionTracking) return;

    try {
      // Get device locale and timezone
      final locale = PlatformDispatcher.instance.locale.toString();
      final timezone = DateTime.now().timeZoneName;

      await _apiClient.startSession(
        deviceId: _deviceInfo.deviceId,
        sessionToken: _sessionToken!,
        appVersion: _deviceInfo.appVersion,
        osVersion: _deviceInfo.osVersion,
        locale: locale,
        timezone: timezone,
        entryScreen: entryScreen,
        userProperties: _userProperties.isNotEmpty ? _userProperties : null,
      );
    } catch (e) {
      // Silently fail - session tracking is not critical
      print('NivoStack: Failed to start session: $e');
    }
  }

  void _startFlushTimer() {
    if (!_featureFlags.batchEvents) return;

    _flushTimer?.cancel();
    _flushTimer = Timer.periodic(_flushInterval, (_) {
      _flushTraceQueue();
      _flushLogQueue();
    });
  }

  Future<void> _registerDevice() async {
    if (!_featureFlags.sdkEnabled) return;  // Master kill switch
    if (!_featureFlags.deviceTracking) return;

    try {
      final response = await _apiClient.registerDevice(
        deviceInfo: _deviceInfo,
        deviceCode: _deviceCode,
      );

      // Extract device info from response
      final deviceData = response['device'] as Map<String, dynamic>?;
      if (deviceData != null) {
        _registeredDeviceId = deviceData['id'] as String?;
        print('NivoStack: Device ID from server: $_registeredDeviceId');
        print('NivoStack: Response deviceCode: ${deviceData['deviceCode']}');
        print('NivoStack: Current _deviceCode: $_deviceCode');

        // Update device code if server returned one (even if null, we should handle it)
        final serverCode = deviceData['deviceCode'] as String?;
        if (serverCode != null && serverCode.isNotEmpty) {
          if (_deviceCode != serverCode) {
            _deviceCode = serverCode;
            // Persist server-assigned code for future registrations
            await DeviceCodeGenerator.save(serverCode);
            print('NivoStack: Server assigned device code: $_deviceCode');
          } else {
            print('NivoStack: Device code unchanged: $_deviceCode');
          }
        } else {
          print('NivoStack: WARNING - Server did not return a device code! Response: ${response.toString()}');
        }

        // Update device config from registration response
        // This is the authoritative source for device-specific settings (debug mode, tracking)
        _deviceConfig = NivoStackDeviceConfig.fromJson(deviceData);
        print('NivoStack: Device registered (code: $_deviceCode, id: $_registeredDeviceId, tracking: ${_deviceConfig.trackingEnabled}, debug: ${_deviceConfig.debugModeEnabled})');
        
        // IMPORTANT: Device config from registration is authoritative
        // Don't let SDK init overwrite it during initial background fetch
        print('NivoStack: Device config now authoritative from registration');
      }
    } catch (e) {
      // Silently fail - device registration is not critical
      print('NivoStack: Failed to register device: $e');
    }
  }

  /// Track screen view
  ///
  /// [screenName] - Name of the screen being viewed
  /// [parameters] - Optional parameters associated with the screen
  Future<void> trackScreen(String screenName, {Map<String, dynamic>? parameters}) async {
    if (!enabled) return;
    if (!_featureFlags.sdkEnabled) return;  // Master kill switch
    if (!isTrackingEnabled) return;  // Device-level tracking check
    if (!_featureFlags.screenTracking) return;

    _currentScreen = screenName;

    // Track entry screen
    if (_entryScreen == null) {
      _entryScreen = screenName;
    }

    // Add to screen flow (avoid duplicates from re-renders)
    if (_screenFlow.isEmpty || _screenFlow.last != screenName) {
      _screenFlow.add(screenName);

      // Update session on server if session tracking is enabled
      if (_featureFlags.sessionTracking && _sessionToken != null) {
        try {
          await _apiClient.updateSession(
            sessionToken: _sessionToken!,
            screenName: screenName,
          );
        } catch (e) {
          // Silently fail - screen tracking is not critical
          print('NivoStack: Failed to update session screen: $e');
        }
      }
    }
  }

  /// Track API request/response (called by Dio interceptor)
  Future<void> trackApiTrace({
    required String url,
    required String method,
    int? statusCode,
    Map<String, dynamic>? requestHeaders,
    String? requestBody,
    Map<String, dynamic>? responseHeaders,
    String? responseBody,
    int? duration,
    String? error,
    String? networkType,
  }) async {
    if (!enabled) return;
    if (!_featureFlags.sdkEnabled) return;  // Master kill switch
    if (!isTrackingEnabled) return;  // Device-level tracking check
    if (!_featureFlags.apiTracking) return;

    // Check if tracing is enabled for this specific endpoint
    if (!shouldTraceEndpoint(url, method)) {
      return;
    }

    // Get API-specific config (if any) for capture settings
    final apiConfig = getApiConfig(url, method);

    // Determine what to capture based on settings hierarchy:
    // 1. API-specific config overrides global settings
    // 2. Fall back to global SDK settings
    final shouldCaptureRequest = apiConfig?.captureRequestBody ?? _sdkSettings.captureRequestBodies;
    final shouldCaptureResponse = apiConfig?.captureResponseBody ?? _sdkSettings.captureResponseBodies;

    // Sanitize headers if sanitization is enabled
    Map<String, dynamic>? sanitizedRequestHeaders = requestHeaders;
    Map<String, dynamic>? sanitizedResponseHeaders = responseHeaders;
    String? sanitizedRequestBody = requestBody;
    String? sanitizedResponseBody = responseBody;

    if (_sdkSettings.sanitizeSensitiveData) {
      if (requestHeaders != null) {
        sanitizedRequestHeaders = _sdkSettings.sanitizeMap(requestHeaders);
      }
      if (responseHeaders != null) {
        sanitizedResponseHeaders = _sdkSettings.sanitizeMap(responseHeaders);
      }
      // Sanitize body strings if they look like JSON
      if (requestBody != null) {
        sanitizedRequestBody = _sanitizeBodyString(requestBody);
      }
      if (responseBody != null) {
        sanitizedResponseBody = _sanitizeBodyString(responseBody);
      }
    }

    final trace = {
      'url': url,
      'method': method,
      'statusCode': statusCode,
      'requestHeaders': sanitizedRequestHeaders,
      'requestBody': shouldCaptureRequest ? sanitizedRequestBody : null,
      'responseHeaders': sanitizedResponseHeaders,
      'responseBody': shouldCaptureResponse ? sanitizedResponseBody : null,
      'duration': duration,
      'error': error,
      'screenName': _currentScreen,
      'networkType': networkType,
      'sessionToken': _featureFlags.sessionTracking ? _sessionToken : null,
      'timestamp': DateTime.now().toIso8601String(),
    };

    if (_featureFlags.batchEvents) {
      _traceQueue.add(trace);

      // Flush immediately if queue is full
      if (_traceQueue.length >= _maxQueueSize) {
        await _flushTraceQueue();
      }
    } else {
      // Send immediately without batching
      try {
        await _apiClient.sendTraces(
          deviceId: _deviceInfo.deviceId,
          sessionToken: _featureFlags.sessionTracking ? _sessionToken : null,
          traces: [trace],
        );
      } catch (e) {
        print('NivoStack: Failed to send trace: $e');
      }
    }
  }

  /// Send a log message to NivoStack
  ///
  /// [message] - The log message
  /// [level] - Log level: verbose, debug, info, warn, error, assert
  /// [tag] - Optional tag to categorize logs (e.g., "NetworkManager", "AuthService")
  /// [data] - Optional additional data to include with the log
  /// [fileName] - Optional source file name
  /// [lineNumber] - Optional line number in source
  /// [functionName] - Optional function/method name
  /// [className] - Optional class name
  Future<void> log({
    required String message,
    String level = 'info',
    String? tag,
    Map<String, dynamic>? data,
    String? fileName,
    int? lineNumber,
    String? functionName,
    String? className,
  }) async {
    if (!enabled) return;
    if (!_featureFlags.sdkEnabled) return;  // Master kill switch
    if (!isTrackingEnabled) return;  // Device-level tracking check
    if (!_featureFlags.logging) return;

    // Check if this log level should be captured based on minLogLevel setting
    if (!_sdkSettings.shouldCaptureLogLevel(level)) {
      return;
    }

    // Sanitize data if sanitization is enabled
    Map<String, dynamic>? sanitizedData = data;
    if (_sdkSettings.sanitizeSensitiveData && data != null) {
      sanitizedData = _sdkSettings.sanitizeMap(data);
    }

    final logEntry = {
      'deviceId': _deviceInfo.deviceId,
      'sessionToken': _featureFlags.sessionTracking ? _sessionToken : null,
      'level': level,
      'message': message,
      'tag': tag,
      'data': sanitizedData,
      'fileName': fileName,
      'lineNumber': lineNumber,
      'functionName': functionName,
      'className': className,
      'screenName': _currentScreen,
      'timestamp': DateTime.now().toIso8601String(),
    };

    if (_featureFlags.batchEvents) {
      _logQueue.add(logEntry);

      // Flush immediately if queue is full
      if (_logQueue.length >= _maxLogQueueSize) {
        await _flushLogQueue();
      }
    } else {
      // Send immediately without batching
      try {
        await _apiClient.sendLogs(logs: [logEntry]);
      } catch (e) {
        // Don't print to avoid potential infinite loop if captureAllPrints is on
      }
    }
  }

  /// Convenience methods for different log levels
  Future<void> verbose(String message, {String? tag, Map<String, dynamic>? data}) =>
      log(message: message, level: 'verbose', tag: tag, data: data);

  Future<void> debug(String message, {String? tag, Map<String, dynamic>? data}) =>
      log(message: message, level: 'debug', tag: tag, data: data);

  Future<void> info(String message, {String? tag, Map<String, dynamic>? data}) =>
      log(message: message, level: 'info', tag: tag, data: data);

  Future<void> warn(String message, {String? tag, Map<String, dynamic>? data}) =>
      log(message: message, level: 'warn', tag: tag, data: data);

  Future<void> error(String message, {String? tag, Map<String, dynamic>? data}) =>
      log(message: message, level: 'error', tag: tag, data: data);

  /// Report a crash or error
  ///
  /// [message] - Error message
  /// [stackTrace] - Stack trace string
  /// [metadata] - Additional metadata about the crash
  Future<void> reportCrash({
    required String message,
    String? stackTrace,
    Map<String, dynamic>? metadata,
  }) async {
    if (!enabled) return;
    if (!_featureFlags.sdkEnabled) return;  // Master kill switch
    if (!isTrackingEnabled) return;  // Device-level tracking check
    if (!_featureFlags.crashReporting) return;

    // Increment error count
    _errorCount++;

    // Update session error count on server
    if (_featureFlags.sessionTracking && _sessionToken != null) {
      try {
        await _apiClient.updateSession(
          sessionToken: _sessionToken!,
          incrementErrorCount: true,
        );
      } catch (e) {
        // Silently fail
      }
    }

    try {
      await _apiClient.sendCrash(
        deviceId: _deviceInfo.deviceId,
        message: message,
        stackTrace: stackTrace,
        metadata: {
          ...?metadata,
          'screenName': _currentScreen,
          'sessionToken': _featureFlags.sessionTracking ? _sessionToken : null,
        },
      );
    } catch (e) {
      // Silently fail - we don't want crash reporting to cause more issues
    }
  }

  /// Flush the log queue
  Future<void> _flushLogQueue() async {
    if (_logQueue.isEmpty) return;
    if (!_featureFlags.sdkEnabled) return;  // Master kill switch
    if (!_featureFlags.logging) return;

    final logs = List<Map<String, dynamic>>.from(_logQueue);
    _logQueue.clear();

    try {
      await _apiClient.sendLogs(logs: logs);
    } catch (e) {
      // Re-add failed logs to queue (up to max size) if offline support is enabled
      if (_featureFlags.offlineSupport) {
        final remainingCapacity = _maxLogQueueSize - _logQueue.length;
        if (remainingCapacity > 0) {
          _logQueue.addAll(logs.take(remainingCapacity));
        }
      }
    }
  }

  Future<void> _flushTraceQueue() async {
    if (_traceQueue.isEmpty) return;
    if (!_featureFlags.sdkEnabled) return;  // Master kill switch
    if (!_featureFlags.apiTracking) return;

    final traces = List<Map<String, dynamic>>.from(_traceQueue);
    _traceQueue.clear();

    try {
      await _apiClient.sendTraces(
        deviceId: _deviceInfo.deviceId,
        sessionToken: _featureFlags.sessionTracking ? _sessionToken : null,
        traces: traces,
      );
    } catch (e) {
      // Re-add failed traces to queue (up to max size) if offline support is enabled
      if (_featureFlags.offlineSupport) {
        final remainingCapacity = _maxQueueSize - _traceQueue.length;
        if (remainingCapacity > 0) {
          _traceQueue.addAll(traces.take(remainingCapacity));
        }
      }
      print('NivoStack: Failed to send traces: $e');
    }
  }

  /// Flush any pending traces and logs immediately
  Future<void> flush() async {
    await Future.wait([
      _flushTraceQueue(),
      _flushLogQueue(),
    ]);
  }

  /// End current session and start a new one
  ///
  /// [entryScreen] - Optional first screen name for the new session
  Future<void> startNewSession({String? entryScreen}) async {
    await _flushTraceQueue();
    await _flushLogQueue();

    // End current session on server
    await _endCurrentSession();

    // Start new session
    await _startSession(entryScreen: entryScreen);

    if (_featureFlags.deviceTracking) {
      await _registerDevice();
    }
  }

  /// End the current session on the server
  Future<void> _endCurrentSession() async {
    if (!_featureFlags.sessionTracking) return;
    if (_sessionToken == null) return;

    try {
      await _apiClient.endSession(
        sessionToken: _sessionToken!,
        exitScreen: _currentScreen,
        screenFlow: _screenFlow,
        eventCount: _eventCount,
        errorCount: _errorCount,
        userProperties: _userProperties.isNotEmpty ? _userProperties : null,
      );
    } catch (e) {
      // Silently fail - session end is not critical
      print('NivoStack: Failed to end session: $e');
    }
  }

  /// Track a custom event (increments event count)
  ///
  /// [eventName] - Name of the event
  /// [data] - Optional event data
  Future<void> trackEvent(String eventName, {Map<String, dynamic>? data}) async {
    if (!enabled) return;

    _eventCount++;

    // Optionally update server if session tracking is enabled
    if (_featureFlags.sessionTracking && _sessionToken != null) {
      try {
        await _apiClient.updateSession(
          sessionToken: _sessionToken!,
          incrementEventCount: true,
        );
      } catch (e) {
        // Silently fail
      }
    }
  }

  /// Set user properties for the session
  ///
  /// [properties] - User properties to set (merged with existing)
  Future<void> setUserProperties(Map<String, dynamic> properties) async {
    if (!enabled) return;

    _userProperties = {..._userProperties, ...properties};

    // Update server if session tracking is enabled
    if (_featureFlags.sessionTracking && _sessionToken != null) {
      try {
        await _apiClient.updateSession(
          sessionToken: _sessionToken!,
          userProperties: properties,
        );
      } catch (e) {
        // Silently fail
        print('NivoStack: Failed to update user properties: $e');
      }
    }
  }

  /// Clear user properties for the session
  void clearUserProperties() {
    _userProperties = {};
  }

  // ══════════════════════════════════════════════════════════════════════════
  // USER ASSOCIATION METHODS
  // ══════════════════════════════════════════════════════════════════════════

  /// Associate a user with this device
  ///
  /// Call this after user logs in to link their identity with the device.
  /// This enables filtering devices by user in the dashboard.
  ///
  /// [userId] - Required user identifier from your system
  /// [email] - Optional user email for display/search in dashboard
  /// [name] - Optional user name for display in dashboard
  ///
  /// Example:
  /// ```dart
  /// await NivoStack.instance.setUser(
  ///   userId: user.id,
  ///   email: user.email,
  ///   name: user.displayName,
  /// );
  /// ```
  Future<void> setUser({
    required String userId,
    String? email,
    String? name,
  }) async {
    if (!enabled) return;
    if (_registeredDeviceId == null) {
      print('NivoStack: Cannot set user - device not registered');
      return;
    }

    try {
      await _apiClient.setUser(
        deviceId: _registeredDeviceId!,
        userId: userId,
        email: email,
        name: name,
      );
      print('NivoStack: User associated with device (userId: $userId)');
    } catch (e) {
      print('NivoStack: Failed to set user: $e');
    }
  }

  /// Clear user from this device
  ///
  /// Call this on user logout to unlink their identity from the device.
  ///
  /// Example:
  /// ```dart
  /// // In your logout handler
  /// await NivoStack.instance.clearUser();
  /// ```
  Future<void> clearUser() async {
    if (!enabled) return;
    if (_registeredDeviceId == null) {
      print('NivoStack: Cannot clear user - device not registered');
      return;
    }

    try {
      await _apiClient.clearUser(deviceId: _registeredDeviceId!);
      print('NivoStack: User cleared from device');
    } catch (e) {
      print('NivoStack: Failed to clear user: $e');
    }
  }

  /// Dispose SDK resources
  Future<void> dispose() async {
    _flushTimer?.cancel();
    await _flushTraceQueue();
    await _flushLogQueue();
    await _endCurrentSession();
    _captureAllPrints = false;
    _instance = null;
  }

  /// Clear the local config cache
  ///
  /// Useful when:
  /// - User logs out
  /// - You want to force a fresh config fetch
  /// - Debugging cache-related issues
  Future<void> clearConfigCache() async {
    await _configCache.clear();
    print('NivoStack: Config cache cleared');
  }

  /// Check if there is valid cached config
  Future<bool> hasValidConfigCache() async {
    return await _configCache.hasValidCache();
  }

  /// Enable or disable automatic print() capture
  ///
  /// When enabled, all print() statements in the app will be automatically
  /// sent to NivoStack as logs with level 'debug'.
  ///
  /// Note: You must run your app inside [runWithNivoStack] for this to work.
  void setCaptureAllPrints(bool capture) {
    _captureAllPrints = capture;
  }

  /// Check if automatic print capture is enabled
  bool get captureAllPrints => _captureAllPrints;

  /// Internal method to handle captured print statements
  void _handleCapturedPrint(String line) {
    if (!_captureAllPrints) return;
    if (!enabled) return;
    if (!_featureFlags.logging) return;

    // Avoid capturing our own SDK logs
    if (line.startsWith('NivoStack:')) return;

    // Try to parse log level from common patterns
    String level = 'debug';
    String? tag;
    String message = line;

    // Parse common log patterns like "[INFO] tag: message" or "E/tag: message"
    final bracketMatch = RegExp(r'^\[(\w+)\]\s*(.*)$').firstMatch(line);
    if (bracketMatch != null) {
      level = _normalizeLogLevel(bracketMatch.group(1)!);
      message = bracketMatch.group(2)!;
    } else {
      final androidMatch = RegExp(r'^([VDIWEA])/(\w+):\s*(.*)$').firstMatch(line);
      if (androidMatch != null) {
        level = _androidLogLevelToString(androidMatch.group(1)!);
        tag = androidMatch.group(2);
        message = androidMatch.group(3)!;
      }
    }

    // Queue the log (don't await to avoid blocking)
    log(message: message, level: level, tag: tag);
  }

  String _normalizeLogLevel(String level) {
    switch (level.toLowerCase()) {
      case 'v':
      case 'verbose':
        return 'verbose';
      case 'd':
      case 'debug':
        return 'debug';
      case 'i':
      case 'info':
        return 'info';
      case 'w':
      case 'warn':
      case 'warning':
        return 'warn';
      case 'e':
      case 'error':
        return 'error';
      case 'a':
      case 'assert':
      case 'wtf':
        return 'assert';
      default:
        return 'debug';
    }
  }

  String _androidLogLevelToString(String level) {
    switch (level) {
      case 'V':
        return 'verbose';
      case 'D':
        return 'debug';
      case 'I':
        return 'info';
      case 'W':
        return 'warn';
      case 'E':
        return 'error';
      case 'A':
        return 'assert';
      default:
        return 'debug';
    }
  }

  /// Sanitize a body string by attempting to parse as JSON and sanitize fields
  String _sanitizeBodyString(String body) {
    try {
      // Try to parse as JSON using dart:convert
      final dynamic decoded = jsonDecode(body);
      if (decoded is Map<String, dynamic>) {
        final sanitized = _sdkSettings.sanitizeMap(decoded);
        return jsonEncode(sanitized);
      } else if (decoded is List) {
        final sanitized = decoded.map((item) {
          if (item is Map<String, dynamic>) {
            return _sdkSettings.sanitizeMap(item);
          }
          return item;
        }).toList();
        return jsonEncode(sanitized);
      }
    } catch (e) {
      // Not valid JSON, return as-is
    }
    return body;
  }

  /// Run the app with NivoStack Zone for automatic print/error capture
  ///
  /// This wraps your app in a custom Zone that intercepts:
  /// - All print() statements (if captureAllPrints is enabled)
  /// - Uncaught async errors
  ///
  /// Usage:
  /// ```dart
  /// void main() async {
  ///   await NivoStack.init(...);
  ///   NivoStack.instance.setCaptureAllPrints(true);
  ///   NivoStack.runWithNivoStack(() => runApp(MyApp()));
  /// }
  /// ```
  static R runWithNivoStack<R>(R Function() body) {
    return runZonedGuarded(
      body,
      (error, stackTrace) {
        // Report uncaught errors
        if (_instance != null && _instance!._featureFlags.crashReporting) {
          _instance!.reportCrash(
            message: error.toString(),
            stackTrace: stackTrace.toString(),
          );
        }
      },
      zoneSpecification: ZoneSpecification(
        print: (self, parent, zone, line) {
          // Always print to console
          parent.print(zone, line);
          // Capture if enabled
          if (_instance != null) {
            _instance!._handleCapturedPrint(line);
          }
        },
      ),
    ) as R;
  }
}

/// Result of a config refresh operation
///
/// Used by [NivoStack.refreshConfig] to indicate whether config was updated.
class ConfigRefreshResult {
  /// Whether the config was updated (false if 304 Not Modified or error)
  final bool hasChanges;

  /// Error message if refresh failed
  final String? error;

  /// Human-readable message describing the result
  final String message;

  const ConfigRefreshResult({
    required this.hasChanges,
    this.error,
    required this.message,
  });

  /// Check if refresh was successful (no error)
  bool get isSuccess => error == null;

  /// Check if refresh failed
  bool get isError => error != null;

  @override
  String toString() => 'ConfigRefreshResult(hasChanges: $hasChanges, message: $message, error: $error)';
}
