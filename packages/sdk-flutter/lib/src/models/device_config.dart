/// Device-specific configuration from the server
///
/// Contains debug mode status and computed tracking enabled flag
class NivoStackDeviceConfig {
  /// Device ID from server (internal use)
  final String? deviceId;

  /// Short device code for support identification (e.g., "A7B3-X9K2")
  final String? deviceCode;

  /// Whether debug mode is enabled for this device
  final bool debugModeEnabled;

  /// When debug mode expires (null = no expiry)
  final DateTime? debugModeExpiresAt;

  /// Whether tracking is enabled for this device
  /// Computed based on tracking mode and debug status
  final bool trackingEnabled;

  const NivoStackDeviceConfig({
    this.deviceId,
    this.deviceCode,
    this.debugModeEnabled = false,
    this.debugModeExpiresAt,
    this.trackingEnabled = true,
  });

  /// Create from JSON response
  factory NivoStackDeviceConfig.fromJson(Map<String, dynamic> json) {
    DateTime? expiresAt;
    if (json['debugModeExpiresAt'] != null) {
      expiresAt = DateTime.tryParse(json['debugModeExpiresAt']);
    }

    return NivoStackDeviceConfig(
      deviceId: json['deviceId'] as String?,
      deviceCode: json['deviceCode'] as String?,
      debugModeEnabled: json['debugModeEnabled'] as bool? ?? false,
      debugModeExpiresAt: expiresAt,
      trackingEnabled: json['trackingEnabled'] as bool? ?? true,
    );
  }

  /// Create default config (tracking enabled)
  factory NivoStackDeviceConfig.defaults() {
    return const NivoStackDeviceConfig(
      debugModeEnabled: false,
      trackingEnabled: true,
    );
  }

  /// Convert to JSON
  Map<String, dynamic> toJson() {
    return {
      'deviceId': deviceId,
      'deviceCode': deviceCode,
      'debugModeEnabled': debugModeEnabled,
      'debugModeExpiresAt': debugModeExpiresAt?.toIso8601String(),
      'trackingEnabled': trackingEnabled,
    };
  }

  @override
  String toString() {
    return 'NivoStackDeviceConfig(code: $deviceCode, debug: $debugModeEnabled, tracking: $trackingEnabled)';
  }
}
