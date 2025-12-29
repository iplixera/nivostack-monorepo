import 'package:flutter/material.dart';

import 'nivostack.dart';

/// Navigator observer for tracking screen views with NivoStack
///
/// Usage with GoRouter:
/// ```dart
/// GoRouter(
///   observers: [NivoStackRouteObserver()],
///   // ...
/// )
/// ```
///
/// Usage with Navigator:
/// ```dart
/// MaterialApp(
///   navigatorObservers: [NivoStackRouteObserver()],
///   // ...
/// )
/// ```
class NivoStackRouteObserver extends NavigatorObserver {
  /// Optional callback to get custom screen name from route
  final String Function(Route<dynamic>? route)? screenNameExtractor;

  NivoStackRouteObserver({
    this.screenNameExtractor,
  });

  @override
  void didPush(Route<dynamic> route, Route<dynamic>? previousRoute) {
    super.didPush(route, previousRoute);
    _trackScreen(route);
  }

  @override
  void didPop(Route<dynamic> route, Route<dynamic>? previousRoute) {
    super.didPop(route, previousRoute);
    if (previousRoute != null) {
      _trackScreen(previousRoute);
    }
  }

  @override
  void didReplace({Route<dynamic>? newRoute, Route<dynamic>? oldRoute}) {
    super.didReplace(newRoute: newRoute, oldRoute: oldRoute);
    if (newRoute != null) {
      _trackScreen(newRoute);
    }
  }

  void _trackScreen(Route<dynamic> route) {
    if (!NivoStack.isInitialized) return;

    final screenName = _extractScreenName(route);
    if (screenName != null && screenName.isNotEmpty) {
      NivoStack.instance.trackScreen(
        screenName,
        parameters: _extractParameters(route),
      );
    }
  }

  String? _extractScreenName(Route<dynamic> route) {
    // Use custom extractor if provided
    if (screenNameExtractor != null) {
      return screenNameExtractor!(route);
    }

    // Try to get route name
    if (route.settings.name != null && route.settings.name!.isNotEmpty) {
      return _formatRouteName(route.settings.name!);
    }

    // Try to get from route type
    final routeType = route.runtimeType.toString();
    if (routeType.contains('MaterialPageRoute') ||
        routeType.contains('CupertinoPageRoute')) {
      // Try to get from page widget type
      if (route is ModalRoute) {
        final builder = (route as dynamic).builder;
        if (builder != null) {
          try {
            final widget = builder(null);
            if (widget != null) {
              return widget.runtimeType.toString();
            }
          } catch (_) {}
        }
      }
    }

    return routeType;
  }

  String _formatRouteName(String name) {
    // Remove leading slash
    if (name.startsWith('/')) {
      name = name.substring(1);
    }

    // Handle empty (root) route
    if (name.isEmpty) {
      return 'Home';
    }

    // Convert path to readable name (e.g., /user/profile -> User Profile)
    return name
        .split('/')
        .where((s) => s.isNotEmpty && !_isParameter(s))
        .map((s) => _capitalize(s.replaceAll('-', ' ').replaceAll('_', ' ')))
        .join(' > ');
  }

  bool _isParameter(String segment) {
    // Check if segment looks like a parameter (UUID, number, etc.)
    if (segment.isEmpty) return true;

    // Check if it's a UUID-like string
    if (RegExp(r'^[0-9a-f-]{20,}$', caseSensitive: false).hasMatch(segment)) {
      return true;
    }

    // Check if it's a number
    if (int.tryParse(segment) != null) {
      return true;
    }

    return false;
  }

  String _capitalize(String s) {
    if (s.isEmpty) return s;
    return s[0].toUpperCase() + s.substring(1);
  }

  Map<String, dynamic>? _extractParameters(Route<dynamic> route) {
    final args = route.settings.arguments;
    if (args == null) return null;

    if (args is Map<String, dynamic>) {
      return args;
    }

    if (args is Map) {
      return Map<String, dynamic>.from(args);
    }

    return {'arguments': args.toString()};
  }
}
