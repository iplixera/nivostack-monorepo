/// Configuration for force update display
class ForceUpdateConfig {
  /// Whether force update is enabled
  final bool enabled;

  /// Minimum required app version (semver format)
  final String minVersion;

  /// Title for force update dialog/page
  final String title;

  /// Message for force update
  final String message;

  /// Button text for update action
  final String buttonText;

  /// Store URL for the current platform
  final String storeUrl;

  const ForceUpdateConfig({
    required this.enabled,
    required this.minVersion,
    required this.title,
    required this.message,
    required this.buttonText,
    required this.storeUrl,
  });

  /// Create default configuration
  factory ForceUpdateConfig.defaults() => const ForceUpdateConfig(
        enabled: false,
        minVersion: '1.0.0',
        title: 'Update Required',
        message:
            'A new version is available. Please update to continue using the app.',
        buttonText: 'Update Now',
        storeUrl: '',
      );

  @override
  String toString() {
    return 'ForceUpdateConfig(enabled: $enabled, minVersion: $minVersion, title: $title, storeUrl: $storeUrl)';
  }
}

/// Configuration for maintenance mode display
class MaintenanceConfig {
  /// Whether maintenance mode is enabled
  final bool enabled;

  /// Title for maintenance page
  final String title;

  /// Message for maintenance
  final String message;

  /// Optional: Estimated end time for maintenance
  final DateTime? endTime;

  const MaintenanceConfig({
    required this.enabled,
    required this.title,
    required this.message,
    this.endTime,
  });

  /// Create default configuration
  factory MaintenanceConfig.defaults() => const MaintenanceConfig(
        enabled: false,
        title: 'Under Maintenance',
        message:
            "We're currently performing scheduled maintenance. We'll be back shortly.",
        endTime: null,
      );

  /// Check if maintenance has a known end time
  bool get hasEndTime => endTime != null;

  /// Get remaining time until maintenance ends
  /// Returns null if no end time or already passed
  Duration? get remainingTime {
    if (endTime == null) return null;
    final remaining = endTime!.difference(DateTime.now());
    return remaining.isNegative ? null : remaining;
  }

  @override
  String toString() {
    return 'MaintenanceConfig(enabled: $enabled, title: $title, endTime: $endTime)';
  }
}

/// Callback type for force update required event
typedef ForceUpdateCallback = void Function(
    String currentVersion, String minVersion);

/// Callback type for maintenance mode enabled event
typedef MaintenanceCallback = void Function(String message, DateTime? endTime);

/// Callback type for blocking cleared event
typedef BlockingClearedCallback = void Function();

/// Listener for app blocking events
class AppBlockingListener {
  /// Called when force update is required
  final ForceUpdateCallback? onForceUpdateRequired;

  /// Called when maintenance mode is enabled
  final MaintenanceCallback? onMaintenanceEnabled;

  /// Called when blocking conditions are cleared
  final BlockingClearedCallback? onBlockingCleared;

  const AppBlockingListener({
    this.onForceUpdateRequired,
    this.onMaintenanceEnabled,
    this.onBlockingCleared,
  });
}
