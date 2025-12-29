import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

/// Local cache for SDK configuration data
///
/// Caches the SDK init response (feature flags, SDK settings, business config)
/// to enable instant app startup for returning users.
///
/// Cache strategy:
/// 1. On SDK init, load cached data immediately (non-blocking)
/// 2. Fetch fresh data from server in background
/// 3. Update cache when new data arrives
/// 4. Returning users see instant startup (~0ms) instead of network wait (~300ms+)
/// 5. ETag support for conditional requests (304 Not Modified)
class SdkConfigCache {
  static const String _cacheKey = 'devbridge_sdk_config_cache';
  static const String _timestampKey = 'devbridge_sdk_config_timestamp';
  static const String _versionKey = 'devbridge_sdk_config_version';
  static const String _etagKey = 'devbridge_sdk_config_etag';

  /// Current cache version - increment when cache format changes
  /// v2: Added deviceConfig field
  static const int _currentVersion = 2;

  /// Default cache duration (1 hour)
  /// After this, cached data is considered stale but still usable
  final Duration cacheDuration;

  /// Maximum cache age before it's considered invalid (24 hours)
  /// Cache older than this will be ignored completely
  final Duration maxCacheAge;

  SdkConfigCache({
    this.cacheDuration = const Duration(hours: 1),
    this.maxCacheAge = const Duration(hours: 24),
  });

  /// Load cached SDK config data
  ///
  /// Returns null if:
  /// - No cached data exists
  /// - Cache version mismatch
  /// - Cache is older than maxCacheAge
  /// - Cache data is corrupted
  Future<CachedSdkConfig?> load() async {
    try {
      final prefs = await SharedPreferences.getInstance();

      // Check cache version
      final version = prefs.getInt(_versionKey);
      if (version != _currentVersion) {
        // Cache format changed, invalidate
        await clear();
        return null;
      }

      // Check if cache exists
      final cached = prefs.getString(_cacheKey);
      if (cached == null) {
        return null;
      }

      // Check cache age
      final timestamp = prefs.getInt(_timestampKey);
      if (timestamp == null) {
        return null;
      }

      final cachedAt = DateTime.fromMillisecondsSinceEpoch(timestamp);
      final age = DateTime.now().difference(cachedAt);

      // If cache is too old, ignore it completely
      if (age > maxCacheAge) {
        await clear();
        return null;
      }

      // Parse cached data
      final data = jsonDecode(cached) as Map<String, dynamic>;

      // Get stored ETag
      final etag = prefs.getString(_etagKey);

      return CachedSdkConfig(
        featureFlags: data['featureFlags'] as Map<String, dynamic>?,
        sdkSettings: data['sdkSettings'] as Map<String, dynamic>?,
        businessConfig: data['businessConfig'] as Map<String, dynamic>?,
        deviceConfig: data['deviceConfig'] as Map<String, dynamic>?,
        cachedAt: cachedAt,
        isStale: age > cacheDuration,
        etag: etag,
      );
    } catch (e) {
      // Cache corrupted, clear it
      await clear();
      return null;
    }
  }

  /// Save SDK config data to cache
  ///
  /// [data] - The SDK init response data to cache
  /// [etag] - Optional ETag from server response for conditional requests
  Future<void> save(Map<String, dynamic> data, {String? etag}) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_cacheKey, jsonEncode(data));
      await prefs.setInt(_timestampKey, DateTime.now().millisecondsSinceEpoch);
      await prefs.setInt(_versionKey, _currentVersion);
      if (etag != null) {
        await prefs.setString(_etagKey, etag);
      }
    } catch (e) {
      // Silently fail - caching is not critical
    }
  }

  /// Clear cached data
  Future<void> clear() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_cacheKey);
      await prefs.remove(_timestampKey);
      await prefs.remove(_versionKey);
      await prefs.remove(_etagKey);
    } catch (e) {
      // Silently fail
    }
  }

  /// Check if cache is stale (older than cacheDuration but still valid)
  Future<bool> isStale() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final timestamp = prefs.getInt(_timestampKey);
      if (timestamp == null) return true;

      final cachedAt = DateTime.fromMillisecondsSinceEpoch(timestamp);
      return DateTime.now().difference(cachedAt) > cacheDuration;
    } catch (e) {
      return true;
    }
  }

  /// Check if cache exists and is valid
  Future<bool> hasValidCache() async {
    final cached = await load();
    return cached != null;
  }
}

/// Represents cached SDK configuration data
class CachedSdkConfig {
  /// Feature flags from cache
  final Map<String, dynamic>? featureFlags;

  /// SDK settings from cache
  final Map<String, dynamic>? sdkSettings;

  /// Business config from cache
  final Map<String, dynamic>? businessConfig;

  /// Device config from cache (tracking status, debug mode)
  final Map<String, dynamic>? deviceConfig;

  /// When the cache was created
  final DateTime cachedAt;

  /// Whether the cache is stale (older than cacheDuration but still usable)
  final bool isStale;

  /// ETag from server for conditional requests
  final String? etag;

  CachedSdkConfig({
    this.featureFlags,
    this.sdkSettings,
    this.businessConfig,
    this.deviceConfig,
    required this.cachedAt,
    required this.isStale,
    this.etag,
  });

  /// Check if cache has usable data
  bool get hasData =>
      featureFlags != null || sdkSettings != null || businessConfig != null || deviceConfig != null;

  /// Age of the cache
  Duration get age => DateTime.now().difference(cachedAt);

  @override
  String toString() =>
      'CachedSdkConfig(age: ${age.inSeconds}s, isStale: $isStale, hasData: $hasData)';
}
