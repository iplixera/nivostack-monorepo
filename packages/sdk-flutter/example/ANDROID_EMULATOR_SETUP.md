# Android Emulator Testing Setup

This guide explains how to test the NivoStack SDK example app on an Android emulator with your local dashboard.

## Prerequisites

1. **Dashboard running locally**
   ```bash
   cd dashboard
   pnpm dev
   ```
   The dashboard should be accessible at `http://localhost:3000`

2. **Android emulator running**
   ```bash
   # List available emulators
   flutter emulators
   
   # Launch an emulator (replace with your emulator name)
   flutter emulators --launch <emulator_name>
   ```

3. **Get API Key and Project ID**
   - Open `http://localhost:3000` in your browser
   - Register or login to the dashboard
   - Create a new project (or use an existing one)
   - Go to project settings and copy:
     - **API Key**: Found in project settings
     - **Project ID**: Found in project settings (usually a UUID)

## Configuration

The example app automatically detects Android emulator and uses `http://10.0.2.2:3000` which maps to your host's `localhost:3000`.

**Important**: Android emulators use `10.0.2.2` as a special IP address that maps to the host machine's `localhost`.

## Update API Credentials

Edit `lib/main.dart` and replace:
```dart
apiKey: 'your-api-key-here', // Replace with your API key
projectId: 'your-project-id-here', // Replace with your project ID
```

## Run the App

```bash
cd packages/sdk-flutter/example

# Get dependencies
flutter pub get

# Run on Android emulator
flutter run
```

## Testing Features

The example app includes buttons to test:
- ✅ API Tracing (automatic and manual)
- ✅ Logging (all levels)
- ✅ Crash Reporting
- ✅ Business Config
- ✅ Localization
- ✅ User Management (set/clear user)
- ✅ Screen Tracking
- ✅ Custom Events
- ✅ User Properties

## Verify Data in Dashboard

After testing features in the app:
1. Open `http://localhost:3000` in your browser
2. Navigate to your project
3. Check:
   - **Devices**: Should show your emulator device
   - **Sessions**: Should show test sessions
   - **Logs**: Should show test log messages
   - **Traces**: Should show API traces
   - **Crashes**: Should show crash reports (if tested)

## Troubleshooting

### Connection Issues

If the app can't connect to the dashboard:

1. **Verify dashboard is running**
   ```bash
   curl http://localhost:3000/api/health
   ```

2. **Check emulator can access host**
   - The emulator should automatically use `10.0.2.2` for localhost
   - If issues persist, check your firewall settings

3. **Verify API key and project ID**
   - Make sure you copied the correct values from the dashboard
   - Check that the project exists and is active

### Build Issues

If you encounter build errors:

```bash
# Clean build
flutter clean
flutter pub get

# Check for issues
flutter doctor
flutter analyze
```

## Next Steps

- Test on iOS simulator (uses `http://localhost:3000` directly)
- Test on physical device (use your computer's IP address, e.g., `http://192.168.1.100:3000`)

