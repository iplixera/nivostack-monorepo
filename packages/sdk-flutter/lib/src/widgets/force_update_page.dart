import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

/// Default Force Update Page widget provided by NivoStack SDK
///
/// A full-screen, non-dismissible page that displays an update required message.
/// Can be customized with custom colors, text, and logo.
///
/// Example:
/// ```dart
/// Navigator.of(context).pushReplacement(
///   MaterialPageRoute(
///     builder: (_) => NivoStackForceUpdatePage(
///       title: 'Update Required',
///       message: 'Please update to continue.',
///       buttonText: 'Update Now',
///       storeUrl: 'https://play.google.com/store/apps/details?id=com.example',
///       currentVersion: '1.0.0',
///       minVersion: '1.2.0',
///     ),
///   ),
/// );
/// ```
class NivoStackForceUpdatePage extends StatelessWidget {
  /// Title displayed at the top
  final String title;

  /// Message explaining why update is required
  final String message;

  /// Text for the update button
  final String buttonText;

  /// URL to open when update button is pressed
  final String storeUrl;

  /// Current app version (optional, for display)
  final String? currentVersion;

  /// Minimum required version (optional, for display)
  final String? minVersion;

  /// Primary color for button and accents
  final Color? primaryColor;

  /// Background color for the page
  final Color? backgroundColor;

  /// Custom logo widget to display at the top
  final Widget? logo;

  /// Custom icon widget (defaults to download icon)
  final Widget? icon;

  /// Custom callback when update button is pressed
  /// If provided, overrides default store URL behavior
  final VoidCallback? onUpdatePressed;

  const NivoStackForceUpdatePage({
    super.key,
    this.title = 'Update Required',
    this.message =
        'A new version is available. Please update to continue using the app.',
    this.buttonText = 'Update Now',
    this.storeUrl = '',
    this.currentVersion,
    this.minVersion,
    this.primaryColor,
    this.backgroundColor,
    this.logo,
    this.icon,
    this.onUpdatePressed,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final effectivePrimaryColor = primaryColor ?? theme.primaryColor;
    final effectiveBackgroundColor =
        backgroundColor ?? theme.scaffoldBackgroundColor;

    return PopScope(
      canPop: false, // Prevent back navigation
      child: Scaffold(
        backgroundColor: effectiveBackgroundColor,
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(32.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Spacer(),

                // Logo
                if (logo != null) ...[
                  logo!,
                  const SizedBox(height: 48),
                ],

                // Icon
                icon ??
                    Container(
                      width: 120,
                      height: 120,
                      decoration: BoxDecoration(
                        color: effectivePrimaryColor.withOpacity(0.1),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        Icons.system_update_outlined,
                        size: 64,
                        color: effectivePrimaryColor,
                      ),
                    ),

                const SizedBox(height: 32),

                // Title
                Text(
                  title,
                  style: theme.textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),

                const SizedBox(height: 16),

                // Message
                Text(
                  message,
                  style: theme.textTheme.bodyLarge?.copyWith(
                    color: theme.textTheme.bodyLarge?.color?.withOpacity(0.7),
                  ),
                  textAlign: TextAlign.center,
                ),

                // Version info
                if (currentVersion != null || minVersion != null) ...[
                  const SizedBox(height: 24),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 20,
                      vertical: 12,
                    ),
                    decoration: BoxDecoration(
                      color: theme.cardColor,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: theme.dividerColor,
                      ),
                    ),
                    child: Column(
                      children: [
                        if (currentVersion != null)
                          _VersionRow(
                            label: 'Current Version',
                            version: currentVersion!,
                            color: Colors.orange,
                          ),
                        if (currentVersion != null && minVersion != null)
                          const SizedBox(height: 8),
                        if (minVersion != null)
                          _VersionRow(
                            label: 'Required Version',
                            version: minVersion!,
                            color: Colors.green,
                          ),
                      ],
                    ),
                  ),
                ],

                const Spacer(),

                // Update Button
                SizedBox(
                  width: double.infinity,
                  height: 56,
                  child: ElevatedButton(
                    onPressed: _canLaunchUpdate ? _handleUpdatePressed : null,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: effectivePrimaryColor,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                      elevation: 0,
                    ),
                    child: Text(
                      buttonText,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 16),
              ],
            ),
          ),
        ),
      ),
    );
  }

  bool get _canLaunchUpdate =>
      onUpdatePressed != null || storeUrl.isNotEmpty;

  Future<void> _handleUpdatePressed() async {
    if (onUpdatePressed != null) {
      onUpdatePressed!();
      return;
    }

    if (storeUrl.isNotEmpty) {
      final uri = Uri.parse(storeUrl);
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      }
    }
  }
}

class _VersionRow extends StatelessWidget {
  final String label;
  final String version;
  final Color color;

  const _VersionRow({
    required this.label,
    required this.version,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Theme.of(context)
                    .textTheme
                    .bodyMedium
                    ?.color
                    ?.withOpacity(0.6),
              ),
        ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
          decoration: BoxDecoration(
            color: color.withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Text(
            version,
            style: TextStyle(
              color: color,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ],
    );
  }
}
