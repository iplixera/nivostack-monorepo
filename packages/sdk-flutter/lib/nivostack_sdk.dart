/// NivoStack SDK for Flutter
///
/// A comprehensive SDK for integrating NivoStack features into Flutter applications:
/// - API Tracing: Automatic network request/response tracking
/// - Screen Tracking: Navigation and screen flow monitoring
/// - Business Configuration: Remote configuration management
/// - Localization: Multi-language support with remote translations
///
/// ## Quick Start
///
/// ```dart
/// import 'package:nivostack_sdk/nivostack_sdk.dart';
///
/// void main() async {
///   // Initialize SDK
///   // baseUrl defaults to https://ingest.nivostack.com (no need to specify)
///   // projectId is automatically derived from apiKey
///   await NivoStack.init(
///     apiKey: 'your-project-api-key',
///   );
///
///   // Add Dio interceptor for API tracing
///   final dio = Dio();
///   dio.interceptors.add(NivoStackDioInterceptor());
///
///   // Use GoRouter with screen tracking
///   final router = GoRouter(
///     observers: [NivoStackRouteObserver()],
///     // ...
///   );
///
///   runApp(MyApp());
/// }
/// ```
library nivostack_sdk;

// Core
export 'src/nivostack.dart';

// API Tracing
export 'src/dio_interceptor.dart';

// Screen Tracking
export 'src/route_observer.dart';

// Business Configuration
export 'src/business_config.dart';

// Localization
export 'src/localization.dart';

// Models
export 'src/models/device_info.dart';
export 'src/models/device_config.dart';
export 'src/models/feature_flags.dart';
export 'src/models/app_blocking_config.dart';

// Widgets
export 'src/widgets/force_update_page.dart';
export 'src/widgets/maintenance_page.dart';

