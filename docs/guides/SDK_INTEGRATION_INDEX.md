# SDK Integration Guides - Index

Complete integration guides for all NivoStack SDKs.

## Available SDKs

| Platform | Language | Status | Integration Guide |
|----------|----------|--------|-------------------|
| **Flutter** | Dart | ✅ Available | [Flutter SDK Integration](./FLUTTER_SDK_INTEGRATION.md) |
| **Android** | Kotlin | ✅ Available | [Android SDK Integration](./ANDROID_SDK_INTEGRATION.md) |
| **iOS** | Swift | 📝 Guide Available | [iOS SDK Integration](./IOS_SDK_INTEGRATION.md) |

## Quick Links

### Flutter SDK
- **Guide**: [FLUTTER_SDK_INTEGRATION.md](./FLUTTER_SDK_INTEGRATION.md)
- **Example App**: `packages/sdk-flutter/example/`
- **Package**: `packages/sdk-flutter/`

### Android SDK
- **Guide**: [ANDROID_SDK_INTEGRATION.md](./ANDROID_SDK_INTEGRATION.md)
- **Example App**: `packages/sdk-android/example/`
- **Package**: `packages/sdk-android/nivostack-core/`

### iOS SDK
- **Guide**: [IOS_SDK_INTEGRATION.md](./IOS_SDK_INTEGRATION.md)
- **Status**: Native iOS SDK in development
- **Alternative**: Use Flutter SDK (works on iOS)

## Common Features

All SDKs support:
- ✅ API Tracing
- ✅ Screen Tracking
- ✅ Business Configuration
- ✅ Localization
- ✅ Device Registration
- ✅ Session Tracking
- ✅ Logging
- ✅ Crash Reporting
- ✅ User Management

## API Endpoints

All SDKs use:
- **Ingest API**: `https://ingest.nivostack.com` (for sending data)
- **Control API**: `https://api.nivostack.com` (for fetching config)

## Getting Started

1. **Get API Credentials**
   - Go to: https://studio.nivostack.com
   - Create or select a project
   - Copy API Key and Project ID

2. **Choose Your Platform**
   - Flutter: Use Flutter SDK (works on iOS and Android)
   - Android: Use Android SDK
   - iOS: Use Flutter SDK or wait for native iOS SDK

3. **Follow Integration Guide**
   - See platform-specific guide above

4. **Test**
   - Use example apps for testing
   - Verify events appear in dashboard

## Support

For issues or questions:
- Check platform-specific guide
- Review example apps
- Check dashboard for events
- Verify API credentials


