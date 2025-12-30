# Quick Start Guide - Android Emulator Testing

## Step 1: Get API Credentials

1. **Ensure dashboard is running** (should already be running on `http://localhost:3000`)

2. **Open dashboard in browser**: `http://localhost:3000`

3. **Login or Register**:
   - If you don't have an account, register a new one
   - If you have an account, login

4. **Create a Project**:
   - Click "Create Project" or navigate to Projects page
   - Enter a project name (e.g., "Test Project")
   - Click "Create"

5. **Get API Key and Project ID**:
   - Click on your project to open project details
   - Find the **API Key** (looks like: `clxxxxxxxxxxxxx`)
   - Find the **Project ID** (looks like: `clxxxxxxxxxxxxx` or UUID)
   - Copy both values

## Step 2: Update Example App

Edit `lib/main.dart` and replace:
```dart
apiKey: 'your-api-key-here',        // Paste your API key here
projectId: 'your-project-id-here',  // Paste your project ID here
```

## Step 3: Run on Android Emulator

```bash
cd packages/sdk-flutter/example
flutter pub get
flutter run
```

The app will automatically use `http://10.0.2.2:3000` for Android emulator (which maps to your host's `localhost:3000`).

## Step 4: Test Features

Use the buttons in the app to test:
- API Tracing
- Logging
- Crash Reporting
- Business Config
- Localization
- User Management
- Screen Tracking

## Step 5: Verify in Dashboard

After testing, check the dashboard:
- **Devices**: Should show your emulator device
- **Sessions**: Should show test sessions
- **Logs**: Should show test log messages
- **Traces**: Should show API traces

## Troubleshooting

**Can't connect?**
- Verify dashboard is running: `curl http://localhost:3000/api/health`
- Check emulator is running: `adb devices`
- Verify API key and project ID are correct

**Build errors?**
```bash
flutter clean
flutter pub get
flutter doctor
```

