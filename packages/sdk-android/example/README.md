# NivoStack Android Example App

Example Android application demonstrating NivoStack Core SDK integration.

## Features Tested

- ✅ SDK Initialization
- ✅ API Tracing (via OkHttp interceptor)
- ✅ Screen Tracking (via lifecycle observer)
- ✅ Logging
- ✅ Crash Reporting
- ✅ Business Configuration
- ✅ Localization
- ✅ User Management (setUser/clearUser)
- ✅ Device Registration

## Setup

1. Make sure the dashboard is running on `localhost:3000`
2. Update API key and project ID in `NivoStackExampleApplication.kt` if needed
3. Build and run on Android emulator or device

## Running the App

### Using Android Studio

1. Open `packages/sdk-android/example` in Android Studio
2. Sync Gradle files
3. Run on emulator or device

### Using Command Line

```bash
cd packages/sdk-android/example
./gradlew assembleDebug
./gradlew installDebug
```

Or use ADB:

```bash
adb install app/build/outputs/apk/debug/app-debug.apk
```

## Testing

The app provides buttons to test each SDK feature:

- **Show SDK Status** - Display current SDK state
- **Test External API** - Test API tracing with external API
- **Test NivoStack API** - Test device registration (rate limiting)
- **Send Test Log** - Send a log message
- **Send Test Crash** - Report a test crash
- **Refresh Business Config** - Fetch business configurations
- **Refresh Localization** - Fetch translations
- **Set User** - Associate user with device
- **Clear User** - Remove user association
- **Track Screen** - Manually track a screen view

## Notes

- For Android emulator, the app uses `http://10.0.2.2:3000` to access the host's localhost
- For physical devices, update the baseUrl to use your computer's IP address
- Make sure the dashboard is running before testing

