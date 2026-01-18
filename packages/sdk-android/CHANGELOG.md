# Changelog - NivoStack Android SDK

All notable changes to the NivoStack Android SDK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.1] - 2026-01-18

### Fixed
- **Screen Flow Empty Issue**: Fixed race condition where API traces were captured before session initialization completed, causing traces to be orphaned (no `sessionId`). The SDK now waits for session to start before flushing traces to the backend.
  - Root cause: Traces were queued during app launch but flushed with `sessionToken = null` because session registration happened asynchronously
  - Impact: Screen flow visualization now correctly shows all API traces linked to their sessions
  - Files modified: `NivoStack.kt` (_flushTraces method)
  - Reference: [docs/technical/troubleshooting/SCREEN_FLOW_EMPTY_DIAGNOSIS.md](../../docs/technical/troubleshooting/SCREEN_FLOW_EMPTY_DIAGNOSIS.md)

## [1.0.0] - 2026-01-18

### Added
- Initial SDK release with core features
- API tracing with OkHttp interceptor
- Screen tracking
- Session management
- Device registration
- Feature flags support
- Crash reporting
- Event logging

### Features
- Automatic API request/response capture
- Screen flow tracking
- Session lifecycle management
- Device debug mode
- Configurable SDK settings
- Offline support with queue management
- Business configuration integration
- Localization support

## Version Format

Versions follow `MAJOR.MINOR.PATCH` format:
- **MAJOR**: Breaking changes to public API
- **MINOR**: New features, backwards compatible
- **PATCH**: Bug fixes, backwards compatible

## Categories

- **Added**: New features
- **Changed**: Changes to existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security improvements
