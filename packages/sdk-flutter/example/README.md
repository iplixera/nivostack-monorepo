# NivoStack SDK Example App

A comprehensive example Flutter app for testing all NivoStack SDK features on both iOS and Android.

## Features Tested

### API & Network
- ✅ **API Tracing** - Automatic HTTP request/response tracking via Dio interceptor
- ✅ **Logging** - Send logs to dashboard
- ✅ **Crash Reporting** - Send crash reports
- ✅ **Flush Events** - Manually flush pending events

### Configuration
- ✅ **Business Config** - Fetch remote configuration
- ✅ **Localization** - Fetch translations
- ✅ **Refresh Config** - Force refresh all configuration

### User Management
- ✅ **Set User** - Associate device with user
- ✅ **Clear User** - Remove user association

### Screen Tracking
- ✅ **Screen Tracking** - Manual screen tracking
- ✅ **Print Capture** - Test print statement capture
- ✅ **Navigation** - Test automatic screen tracking

### SDK Status
- ✅ **SDK Status** - View initialization status, feature flags, and metrics

## Setup

1. **Update API credentials** in `lib/main.dart`:
   ```dart
   await NivoStack.init(
     baseUrl: 'https://ingest.nivostack.com', // Or your dev server
     apiKey: 'your-api-key-here',
     projectId: 'your-project-id-here',
   );
   ```

2. **Install dependencies**:
   ```bash
   cd example
   flutter pub get
   ```

3. **Run on iOS**:
   ```bash
   flutter run -d ios
   ```

4. **Run on Android**:
   ```bash
   flutter run -d android
   ```

## Testing Each Feature

### API Tracing
1. Tap "Test API Call (Auto-traced)"
2. Check dashboard → API Traces to see the request

### Logging
1. Tap "Send Test Log"
2. Check dashboard → Logs to see the log entry

### Crash Reporting
1. Tap "Send Crash Report"
2. Check dashboard → Crashes to see the crash report

### Business Config
1. Tap "Refresh Business Config"
2. Check dashboard → Business Config to verify fetch

### User Management
1. Tap "Set User" to associate device with user
2. Check dashboard → Devices to see user association
3. Tap "Clear User" to remove association

### Screen Tracking
1. Tap "Track Screen" for manual tracking
2. Navigate to "Second Screen" for automatic tracking
3. Check dashboard → Sessions → Timeline to see screen flow

### SDK Status
1. Tap "Show SDK Status" to view:
   - Initialization status
   - Feature flags
   - Event counts
   - Pending queue sizes

## Platform-Specific Setup

### iOS

No additional setup required. The SDK works out of the box on iOS.

### Android

No additional setup required. The SDK works out of the box on Android.

## Troubleshooting

### SDK Not Initializing
- Check API key and project ID are correct
- Verify baseUrl is accessible
- Check network connectivity

### Events Not Appearing
- Check feature flags are enabled in dashboard
- Verify device is registered
- Check tracking mode settings
- Try flushing events manually

### Build Errors
- Run `flutter clean`
- Run `flutter pub get`
- Check Flutter version: `flutter --version` (requires >=3.0.0)

## Next Steps

1. Test each feature button
2. Verify events appear in dashboard
3. Test on both iOS and Android
4. Test with different network conditions
5. Test offline/online scenarios

