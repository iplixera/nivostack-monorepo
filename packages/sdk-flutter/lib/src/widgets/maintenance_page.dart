import 'dart:async';
import 'package:flutter/material.dart';

/// Default Maintenance Page widget provided by NivoStack SDK
///
/// A full-screen page that displays a maintenance message with optional countdown.
///
/// Example:
/// ```dart
/// Navigator.of(context).pushReplacement(
///   MaterialPageRoute(
///     builder: (_) => NivoStackMaintenancePage(
///       title: 'Under Maintenance',
///       message: 'We are performing scheduled maintenance.',
///       endTime: DateTime.now().add(Duration(hours: 2)),
///       onRetryPressed: () => _checkMaintenanceStatus(),
///     ),
///   ),
/// );
/// ```
class NivoStackMaintenancePage extends StatefulWidget {
  /// Title displayed at the top
  final String title;

  /// Message explaining the maintenance
  final String message;

  /// Optional: Estimated end time for maintenance
  final DateTime? endTime;

  /// Primary color for accents
  final Color? primaryColor;

  /// Background color for the page
  final Color? backgroundColor;

  /// Custom logo widget to display at the top
  final Widget? logo;

  /// Custom icon widget (defaults to maintenance icon)
  final Widget? icon;

  /// Whether to show countdown timer (if endTime is set)
  final bool showCountdown;

  /// Whether to show retry button
  final bool showRetryButton;

  /// Callback when retry button is pressed
  final VoidCallback? onRetryPressed;

  /// Text for the retry button
  final String retryButtonText;

  const NivoStackMaintenancePage({
    super.key,
    this.title = 'Under Maintenance',
    this.message =
        "We're currently performing scheduled maintenance. We'll be back shortly.",
    this.endTime,
    this.primaryColor,
    this.backgroundColor,
    this.logo,
    this.icon,
    this.showCountdown = true,
    this.showRetryButton = true,
    this.onRetryPressed,
    this.retryButtonText = 'Retry',
  });

  @override
  State<NivoStackMaintenancePage> createState() =>
      _NivoStackMaintenancePageState();
}

class _NivoStackMaintenancePageState extends State<NivoStackMaintenancePage> {
  Timer? _countdownTimer;
  Duration _remainingTime = Duration.zero;

  @override
  void initState() {
    super.initState();
    _updateRemainingTime();
    if (widget.endTime != null && widget.showCountdown) {
      _startCountdown();
    }
  }

  @override
  void dispose() {
    _countdownTimer?.cancel();
    super.dispose();
  }

  void _startCountdown() {
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      _updateRemainingTime();
    });
  }

  void _updateRemainingTime() {
    if (widget.endTime == null) return;

    final remaining = widget.endTime!.difference(DateTime.now());
    setState(() {
      _remainingTime = remaining.isNegative ? Duration.zero : remaining;
    });
  }

  String _formatDuration(Duration duration) {
    final hours = duration.inHours;
    final minutes = duration.inMinutes.remainder(60);
    final seconds = duration.inSeconds.remainder(60);

    if (hours > 0) {
      return '${hours.toString().padLeft(2, '0')}:${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
    }
    return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final effectivePrimaryColor = widget.primaryColor ?? theme.primaryColor;
    final effectiveBackgroundColor =
        widget.backgroundColor ?? theme.scaffoldBackgroundColor;

    final hasValidEndTime =
        widget.endTime != null && _remainingTime > Duration.zero;

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
                if (widget.logo != null) ...[
                  widget.logo!,
                  const SizedBox(height: 48),
                ],

                // Icon
                widget.icon ??
                    Container(
                      width: 120,
                      height: 120,
                      decoration: BoxDecoration(
                        color: Colors.orange.withOpacity(0.1),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.build_outlined,
                        size: 64,
                        color: Colors.orange,
                      ),
                    ),

                const SizedBox(height: 32),

                // Title
                Text(
                  widget.title,
                  style: theme.textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),

                const SizedBox(height: 16),

                // Message
                Text(
                  widget.message,
                  style: theme.textTheme.bodyLarge?.copyWith(
                    color: theme.textTheme.bodyLarge?.color?.withOpacity(0.7),
                  ),
                  textAlign: TextAlign.center,
                ),

                // Countdown timer
                if (widget.showCountdown && hasValidEndTime) ...[
                  const SizedBox(height: 32),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 24,
                      vertical: 16,
                    ),
                    decoration: BoxDecoration(
                      color: theme.cardColor,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: theme.dividerColor,
                      ),
                    ),
                    child: Column(
                      children: [
                        Text(
                          'Estimated Time Remaining',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: theme.textTheme.bodySmall?.color
                                ?.withOpacity(0.6),
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          _formatDuration(_remainingTime),
                          style: theme.textTheme.headlineLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                            fontFeatures: const [
                              FontFeature.tabularFigures(),
                            ],
                            color: effectivePrimaryColor,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],

                // End time passed message
                if (widget.showCountdown &&
                    widget.endTime != null &&
                    _remainingTime == Duration.zero) ...[
                  const SizedBox(height: 32),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 24,
                      vertical: 16,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.green.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(
                          Icons.check_circle_outline,
                          color: Colors.green,
                        ),
                        const SizedBox(width: 12),
                        Text(
                          'Maintenance should be complete',
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: Colors.green,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],

                const Spacer(),

                // Retry Button
                if (widget.showRetryButton && widget.onRetryPressed != null) ...[
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: OutlinedButton(
                      onPressed: widget.onRetryPressed,
                      style: OutlinedButton.styleFrom(
                        foregroundColor: effectivePrimaryColor,
                        side: BorderSide(
                          color: effectivePrimaryColor,
                          width: 2,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.refresh),
                          const SizedBox(width: 8),
                          Text(
                            widget.retryButtonText,
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}
