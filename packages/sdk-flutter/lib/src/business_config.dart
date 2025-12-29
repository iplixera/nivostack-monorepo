import 'dart:async';

import 'api_client.dart';

/// Business configuration value types
enum ConfigValueType {
  string,
  integer,
  boolean,
  decimal,
  json,
  image,
}

/// Represents a single business configuration
class BusinessConfig {
  final String key;
  final ConfigValueType valueType;
  final dynamic value;
  final String? category;
  final int version;

  BusinessConfig({
    required this.key,
    required this.valueType,
    this.value,
    this.category,
    this.version = 1,
  });

  /// Create from flat API format (key-value with meta)
  factory BusinessConfig.fromFlat(String key, dynamic value, Map<String, dynamic>? meta) {
    final metaInfo = meta ?? {};
    final type = metaInfo['type'] as String?;
    final category = metaInfo['category'] as String?;
    final version = metaInfo['version'] as int? ?? 1;

    return BusinessConfig(
      key: key,
      valueType: _parseValueType(type),
      value: value,
      category: category,
      version: version,
    );
  }

  static ConfigValueType _parseValueType(String? type) {
    switch (type) {
      case 'string':
        return ConfigValueType.string;
      case 'integer':
        return ConfigValueType.integer;
      case 'boolean':
        return ConfigValueType.boolean;
      case 'decimal':
        return ConfigValueType.decimal;
      case 'json':
        return ConfigValueType.json;
      case 'image':
        return ConfigValueType.image;
      default:
        return ConfigValueType.string;
    }
  }

  /// Get value as String
  String? get stringValue {
    if (value is String) return value as String;
    return value?.toString();
  }

  /// Get value as int
  int? get intValue {
    if (value is int) return value as int;
    if (value is num) return (value as num).toInt();
    return null;
  }

  /// Get value as bool
  bool? get boolValue {
    if (value is bool) return value as bool;
    return null;
  }

  /// Get value as double
  double? get doubleValue {
    if (value is double) return value as double;
    if (value is num) return (value as num).toDouble();
    return null;
  }

  /// Get value as Map (for JSON type)
  Map<String, dynamic>? get jsonValue {
    if (value is Map) {
      return Map<String, dynamic>.from(value as Map);
    }
    return null;
  }

  /// Get value as image URL
  String? get imageUrl => stringValue;
}

/// Client for fetching and caching business configurations from NivoStack
class NivoStackBusinessConfig {
  final NivoStackApiClient _apiClient;

  /// Cache of configurations
  final Map<String, BusinessConfig> _cache = {};

  /// Raw configs cache (flat key-value)
  Map<String, dynamic> _rawConfigs = {};

  /// Meta information cache
  Map<String, dynamic> _metaCache = {};

  /// Last fetch timestamp
  DateTime? _lastFetch;

  /// Cache duration (default: 5 minutes)
  final Duration cacheDuration;

  /// Listeners for config changes
  final List<void Function(Map<String, BusinessConfig>)> _listeners = [];

  NivoStackBusinessConfig({
    required NivoStackApiClient apiClient,
    this.cacheDuration = const Duration(minutes: 5),
  })  : _apiClient = apiClient;

  /// Fetch all configurations
  Future<Map<String, BusinessConfig>> fetchAll({bool forceRefresh = false}) async {
    if (!forceRefresh && _isCacheValid()) {
      return Map.unmodifiable(_cache);
    }

    final response = await _apiClient.getBusinessConfigs();

    // Extract configs and meta from flat response format
    final configs = response['configs'];
    final meta = response['meta'] as Map<String, dynamic>? ?? {};

    _cache.clear();
    _metaCache = meta;

    if (configs is Map<String, dynamic>) {
      _rawConfigs = configs;
      // Parse flat key-value configs with meta
      for (final entry in configs.entries) {
        final key = entry.key;
        final value = entry.value;
        final metaInfo = meta[key] as Map<String, dynamic>?;
        final config = BusinessConfig.fromFlat(key, value, metaInfo);
        _cache[key] = config;
      }
    }

    _lastFetch = DateTime.now();
    _notifyListeners();

    return Map.unmodifiable(_cache);
  }

  /// Fetch configurations by category
  Future<Map<String, BusinessConfig>> fetchByCategory(String category, {bool forceRefresh = false}) async {
    // First ensure we have all configs
    await fetchAll(forceRefresh: forceRefresh);

    return Map.unmodifiable(
      Map.fromEntries(_cache.entries.where((e) => e.value.category == category)),
    );
  }

  /// Get a single config value by key
  BusinessConfig? get(String key) {
    return _cache[key];
  }

  /// Get string value with default
  String getString(String key, {String defaultValue = ''}) {
    final config = _cache[key];
    return config?.stringValue ?? defaultValue;
  }

  /// Get int value with default
  int getInt(String key, {int defaultValue = 0}) {
    final config = _cache[key];
    return config?.intValue ?? defaultValue;
  }

  /// Get bool value with default
  bool getBool(String key, {bool defaultValue = false}) {
    final config = _cache[key];
    return config?.boolValue ?? defaultValue;
  }

  /// Get double value with default
  double getDouble(String key, {double defaultValue = 0.0}) {
    final config = _cache[key];
    return config?.doubleValue ?? defaultValue;
  }

  /// Get JSON value
  Map<String, dynamic>? getJson(String key) {
    return _cache[key]?.jsonValue;
  }

  /// Get image URL
  String? getImageUrl(String key) {
    return _cache[key]?.imageUrl;
  }

  /// Check if a feature is enabled (convenience for boolean configs)
  bool isFeatureEnabled(String key, {bool defaultValue = false}) {
    return getBool(key, defaultValue: defaultValue);
  }

  /// Add listener for config changes
  void addListener(void Function(Map<String, BusinessConfig>) listener) {
    _listeners.add(listener);
  }

  /// Remove listener
  void removeListener(void Function(Map<String, BusinessConfig>) listener) {
    _listeners.remove(listener);
  }

  bool _isCacheValid() {
    if (_lastFetch == null) return false;
    return DateTime.now().difference(_lastFetch!) < cacheDuration;
  }

  void _notifyListeners() {
    final configs = Map<String, BusinessConfig>.unmodifiable(_cache);
    for (final listener in _listeners) {
      listener(configs);
    }
  }

  /// Clear cache
  void clearCache() {
    _cache.clear();
    _rawConfigs = {};
    _metaCache = {};
    _lastFetch = null;
  }

  /// Set configs from SDK init data (pre-populates cache without network request)
  ///
  /// This is called during SDK initialization when using the combined /api/sdk-init
  /// endpoint to avoid an additional network request for business configs.
  void setFromInitData({
    required Map<String, dynamic> configs,
    required Map<String, dynamic> meta,
  }) {
    _cache.clear();
    _rawConfigs = configs;
    _metaCache = meta;

    // Parse flat key-value configs with meta
    for (final entry in configs.entries) {
      final key = entry.key;
      final value = entry.value;
      final metaInfo = meta[key] as Map<String, dynamic>?;
      final config = BusinessConfig.fromFlat(key, value, metaInfo);
      _cache[key] = config;
    }

    _lastFetch = DateTime.now();
    _notifyListeners();
  }
}
