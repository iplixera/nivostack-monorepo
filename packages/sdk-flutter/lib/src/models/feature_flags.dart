/// Feature flags configuration fetched from NivoStack server
class NivoStackFeatureFlags {
  /// Master kill switch - disables entire SDK when false
  /// When this is false, ALL SDK functionality is disabled regardless of other flags
  final bool sdkEnabled;

  /// Track HTTP requests and responses
  final bool apiTracking;

  /// Track screen views and navigation flow
  final bool screenTracking;

  /// Capture and report app crashes
  final bool crashReporting;

  /// Send logs to dashboard
  final bool logging;

  /// Register and track devices
  final bool deviceTracking;

  /// Track user sessions
  final bool sessionTracking;

  /// Enable remote business configuration
  final bool businessConfig;

  /// Enable remote localization strings
  final bool localization;

  /// Queue events when offline and sync later
  final bool offlineSupport;

  /// Batch events before sending to reduce network calls
  final bool batchEvents;

  const NivoStackFeatureFlags({
    this.sdkEnabled = true,
    this.apiTracking = true,
    this.screenTracking = true,
    this.crashReporting = true,
    this.logging = true,
    this.deviceTracking = true,
    this.sessionTracking = true,
    this.businessConfig = true,
    this.localization = true,
    this.offlineSupport = false,
    this.batchEvents = true,
  });

  /// Default feature flags (all enabled except offline support)
  factory NivoStackFeatureFlags.defaults() => const NivoStackFeatureFlags();

  /// Create from JSON map
  factory NivoStackFeatureFlags.fromJson(Map<String, dynamic> json) {
    return NivoStackFeatureFlags(
      sdkEnabled: json['sdkEnabled'] as bool? ?? true,
      apiTracking: json['apiTracking'] as bool? ?? true,
      screenTracking: json['screenTracking'] as bool? ?? true,
      crashReporting: json['crashReporting'] as bool? ?? true,
      logging: json['logging'] as bool? ?? true,
      deviceTracking: json['deviceTracking'] as bool? ?? true,
      sessionTracking: json['sessionTracking'] as bool? ?? true,
      businessConfig: json['businessConfig'] as bool? ?? true,
      localization: json['localization'] as bool? ?? true,
      offlineSupport: json['offlineSupport'] as bool? ?? false,
      batchEvents: json['batchEvents'] as bool? ?? true,
    );
  }

  /// Convert to JSON map
  Map<String, dynamic> toJson() => {
        'sdkEnabled': sdkEnabled,
        'apiTracking': apiTracking,
        'screenTracking': screenTracking,
        'crashReporting': crashReporting,
        'logging': logging,
        'deviceTracking': deviceTracking,
        'sessionTracking': sessionTracking,
        'businessConfig': businessConfig,
        'localization': localization,
        'offlineSupport': offlineSupport,
        'batchEvents': batchEvents,
      };

  @override
  String toString() => 'NivoStackFeatureFlags(${toJson()})';
}
