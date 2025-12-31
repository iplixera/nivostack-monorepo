/// SDK Settings model for controlling API tracing and logging behavior
class NivoStackSdkSettings {
  // Security settings
  final bool captureRequestBodies;
  final bool captureResponseBodies;
  final bool capturePrintStatements;
  final bool sanitizeSensitiveData;
  final List<String> sensitiveFieldPatterns;

  // Performance settings
  final int maxLogQueueSize;
  final int maxTraceQueueSize;
  final int flushIntervalSeconds;
  final bool enableBatching;

  // Log control
  final String minLogLevel;
  final bool verboseErrors;

  const NivoStackSdkSettings({
    this.captureRequestBodies = true,
    this.captureResponseBodies = true,
    this.capturePrintStatements = false,
    this.sanitizeSensitiveData = true,
    this.sensitiveFieldPatterns = const ['password', 'token', 'secret', 'apiKey', 'api_key', 'authorization', 'cookie'],
    this.maxLogQueueSize = 100,
    this.maxTraceQueueSize = 50,
    this.flushIntervalSeconds = 30,
    this.enableBatching = true,
    this.minLogLevel = 'debug',
    this.verboseErrors = false,
  });

  /// Create default settings
  factory NivoStackSdkSettings.defaults() => const NivoStackSdkSettings();

  /// Create from JSON response
  factory NivoStackSdkSettings.fromJson(Map<String, dynamic> json) {
    return NivoStackSdkSettings(
      captureRequestBodies: json['captureRequestBodies'] ?? true,
      captureResponseBodies: json['captureResponseBodies'] ?? true,
      capturePrintStatements: json['capturePrintStatements'] ?? false,
      sanitizeSensitiveData: json['sanitizeSensitiveData'] ?? true,
      sensitiveFieldPatterns: json['sensitiveFieldPatterns'] != null
          ? List<String>.from(json['sensitiveFieldPatterns'])
          : const ['password', 'token', 'secret', 'apiKey', 'api_key', 'authorization', 'cookie'],
      maxLogQueueSize: json['maxLogQueueSize'] ?? 100,
      maxTraceQueueSize: json['maxTraceQueueSize'] ?? 50,
      flushIntervalSeconds: json['flushIntervalSeconds'] ?? 30,
      enableBatching: json['enableBatching'] ?? true,
      minLogLevel: json['minLogLevel'] ?? 'debug',
      verboseErrors: json['verboseErrors'] ?? false,
    );
  }

  /// Check if a log level should be captured based on minLogLevel
  bool shouldCaptureLogLevel(String level) {
    // If logging is disabled, don't capture any logs
    if (minLogLevel.toLowerCase() == 'disabled') {
      return false;
    }

    const levelOrder = ['verbose', 'debug', 'info', 'warn', 'error', 'assert'];
    final minIndex = levelOrder.indexOf(minLogLevel.toLowerCase());
    final levelIndex = levelOrder.indexOf(level.toLowerCase());

    // If either level is unknown, default to capturing (unless disabled)
    if (minIndex == -1 || levelIndex == -1) {
      return minLogLevel.toLowerCase() != 'disabled';
    }

    return levelIndex >= minIndex;
  }

  /// Sanitize a string value by redacting sensitive patterns
  String sanitizeValue(String key, String value) {
    if (!sanitizeSensitiveData) return value;

    final keyLower = key.toLowerCase();
    for (final pattern in sensitiveFieldPatterns) {
      if (keyLower.contains(pattern.toLowerCase())) {
        return '[REDACTED]';
      }
    }
    return value;
  }

  /// Sanitize a map by redacting sensitive fields
  Map<String, dynamic> sanitizeMap(Map<String, dynamic> data) {
    if (!sanitizeSensitiveData) return data;

    return data.map((key, value) {
      if (value is String) {
        return MapEntry(key, sanitizeValue(key, value));
      } else if (value is Map<String, dynamic>) {
        return MapEntry(key, sanitizeMap(value));
      }
      return MapEntry(key, value);
    });
  }

  @override
  String toString() {
    return 'NivoStackSdkSettings('
        'captureRequestBodies: $captureRequestBodies, '
        'captureResponseBodies: $captureResponseBodies, '
        'capturePrintStatements: $capturePrintStatements, '
        'sanitizeSensitiveData: $sanitizeSensitiveData, '
        'sensitiveFieldPatterns: $sensitiveFieldPatterns, '
        'maxLogQueueSize: $maxLogQueueSize, '
        'maxTraceQueueSize: $maxTraceQueueSize, '
        'flushIntervalSeconds: $flushIntervalSeconds, '
        'enableBatching: $enableBatching, '
        'minLogLevel: $minLogLevel, '
        'verboseErrors: $verboseErrors'
        ')';
  }
}

/// API endpoint configuration for per-endpoint settings
class NivoStackApiConfig {
  final String endpoint;
  final String? method;
  final bool enableLogs;
  final bool captureRequestBody;
  final bool captureResponseBody;
  final double? costPerRequest;

  const NivoStackApiConfig({
    required this.endpoint,
    this.method,
    this.enableLogs = true,
    this.captureRequestBody = true,
    this.captureResponseBody = true,
    this.costPerRequest,
  });

  factory NivoStackApiConfig.fromJson(Map<String, dynamic> json) {
    return NivoStackApiConfig(
      endpoint: json['endpoint'] ?? '',
      method: json['method'],
      enableLogs: json['enableLogs'] ?? true,
      captureRequestBody: json['captureRequestBody'] ?? true,
      captureResponseBody: json['captureResponseBody'] ?? true,
      costPerRequest: json['costPerRequest']?.toDouble(),
    );
  }

  /// Check if this config matches a given URL and method
  bool matches(String url, String requestMethod) {
    // Extract path from URL
    String path;
    try {
      final uri = Uri.parse(url);
      path = uri.path;
    } catch (e) {
      path = url;
    }

    // Check if path matches endpoint pattern
    if (!_pathMatches(path, endpoint)) return false;

    // Check method if specified
    if (method != null && method!.isNotEmpty && method!.toUpperCase() != requestMethod.toUpperCase()) {
      return false;
    }

    return true;
  }

  bool _pathMatches(String path, String pattern) {
    // Simple path matching - check if path starts with or equals pattern
    // Remove trailing slashes for comparison
    final normalizedPath = path.endsWith('/') ? path.substring(0, path.length - 1) : path;
    final normalizedPattern = pattern.endsWith('/') ? pattern.substring(0, pattern.length - 1) : pattern;

    return normalizedPath == normalizedPattern || normalizedPath.startsWith('$normalizedPattern/');
  }
}
