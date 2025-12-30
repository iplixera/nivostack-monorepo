# Example App Setup Instructions

## Quick Start

1. **Update API Credentials**
   
   Open `lib/main.dart` and update:
   ```dart
   await NivoStack.init(
     baseUrl: 'https://ingest.nivostack.com', // Or your dev server
     apiKey: 'your-api-key-here',            // Get from dashboard
     projectId: 'your-project-id-here',       // Get from dashboard
   );
   ```

2. **Install Dependencies**
   ```bash
   cd example
   flutter pub get
   ```

3. **Run on iOS**
   ```bash
   flutter run -d ios
   ```

4. **Run on Android**
   ```bash
   flutter run -d android
   ```

## Getting Your API Credentials

1. Go to NivoStack Studio dashboard
2. Create or select a project
3. Go to Project Settings
4. Copy the **API Key** and **Project ID**

## Testing Features

### Basic Tests
- **Show SDK Status** - View initialization status and feature flags
- **Test API Call** - Make HTTP request (auto-traced by SDK)
- **Send Test Log** - Send a log message to dashboard
- **Send Crash Report** - Send a crash report to dashboard

### Advanced Tests
- **Track Custom Event** - Send custom analytics event
- **Set User Properties** - Set user metadata
- **Manual API Trace** - Manually send API trace
- **Test All Log Levels** - Send logs at all severity levels

### Configuration Tests
- **Refresh Business Config** - Fetch remote configuration
- **Refresh Localization** - Fetch translations
- **Refresh All Config** - Force refresh all configuration

### User Management
- **Set User** - Associate device with user account
- **Clear User** - Remove user association

### Screen Tracking
- **Track Screen** - Manually track screen view
- **Navigate to Second Screen** - Test automatic screen tracking
- **Test Print Capture** - Test automatic print() capture

## Expected Behavior

After tapping each button:
1. Status message updates at top of screen
2. Snackbar notification appears
3. Event appears in dashboard (check corresponding tab)

## Troubleshooting

### SDK Not Initializing
- Verify API key and project ID are correct
- Check baseUrl is accessible
- Check network connectivity
- Look for errors in console

### Events Not Appearing in Dashboard
- Check feature flags are enabled in dashboard
- Verify device is registered
- Check tracking mode settings
- Try flushing events manually

### Build Errors
```bash
flutter clean
flutter pub get
flutter run
```

## Platform-Specific Notes

### iOS
- Requires iOS 13.0+
- No additional permissions needed
- Works on simulator and physical device

### Android
- Requires Android API 21+ (Android 5.0+)
- Internet permission already added
- Works on emulator and physical device

## Next Steps

1. Test each button
2. Verify events in dashboard
3. Test on both platforms
4. Test offline/online scenarios
5. Test with different network conditions

