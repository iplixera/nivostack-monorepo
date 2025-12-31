# Changelog

All notable changes to the NivoStack Flutter SDK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-12-31

### Added
- Initial release of NivoStack Flutter SDK
- **API Tracing**: Automatic network request/response tracking with Dio interceptor
- **Screen Tracking**: Navigation and screen flow monitoring with route observer
- **Business Configuration**: Remote configuration management with caching
- **Localization**: Multi-language support with remote translations
- **Device Registration**: Automatic device registration with device code generation
- **Session Tracking**: Comprehensive session management with context and metrics
- **Logging**: Structured logging with levels, tags, and context
- **Crash Reporting**: Automatic crash detection and reporting
- **Feature Flags**: Remote feature flag management
- **SDK Settings**: Configurable SDK behavior (tracking mode, queue sizes, etc.)
- **Device Debug Mode**: Selective API/session tracking for specific devices
- **User Management**: User association and identification
- **Force Update**: App version enforcement with blocking UI
- **Maintenance Mode**: Server-controlled maintenance mode with blocking UI
- **Offline Support**: Queue events when offline, flush when online
- **Batch Events**: Batch API traces and logs before sending
- **Caching**: Client-side caching for SDK configuration and business config
- **ETag Support**: Conditional requests for efficient data fetching

### Features
- Separate ingest and control API endpoints
- Device code generation for support identification
- Configurable tracking modes (all, debug-only, off)
- Automatic SDK initialization with API key
- Comprehensive error handling and retry logic
- Thread-safe operations
- Memory-efficient queue management

### Technical Details
- Flutter 3.0+ compatible
- Dart 3.0+ compatible
- Supports Android and iOS
- Uses Dio for HTTP requests
- Uses SharedPreferences for local storage
- Uses device_info_plus for device information

### Documentation
- Complete API documentation
- Integration guide
- Example app included
- Usage examples

## [Unreleased]

### Planned
- Web platform support
- Desktop platform support (Windows, macOS, Linux)
- Enhanced analytics features
- Custom event tracking
- Performance monitoring
- Network quality monitoring

