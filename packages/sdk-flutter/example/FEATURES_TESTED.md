# SDK Features Tested in Example App

This document lists all SDK features that can be tested using the example app buttons.

## ✅ Features with Test Buttons

### 1. SDK Status & Initialization
- **Show SDK Status** - Displays:
  - Initialization status
  - Feature flags (API tracking, screen tracking, logging, etc.)
  - Device code
  - Tracking enabled status
  - Event counts
  - Pending queue sizes

### 2. API Tracing
- **Test API Call (Auto-traced)** - Makes HTTP GET request, automatically traced by Dio interceptor
- **Manual API Trace** - Manually sends API trace with custom data

### 3. Logging
- **Send Test Log** - Sends a single info-level log
- **Test All Log Levels** - Sends logs at all levels:
  - Verbose
  - Debug
  - Info
  - Warn
  - Error

### 4. Crash Reporting
- **Send Crash Report** - Sends a test crash report with stack trace

### 5. Business Configuration
- **Refresh Business Config** - Fetches remote business configuration
- **Refresh All Config** - Forces refresh of all configuration (feature flags, settings, config)

### 6. Localization
- **Refresh Localization** - Fetches translations from server

### 7. User Management
- **Set User** - Associates device with user account (userId, email, name)
- **Clear User** - Removes user association from device

### 8. Screen Tracking
- **Track Screen** - Manually tracks a screen view
- **Navigate to Second Screen** - Tests automatic screen tracking via navigation

### 9. Event Tracking
- **Track Custom Event** - Sends custom analytics event with data
- **Set User Properties** - Sets user metadata/properties

### 10. Utilities
- **Flush Pending Events** - Manually flushes queued traces and logs
- **Test Print Capture** - Tests automatic capture of print() statements

## 📋 Testing Checklist

Use this checklist to verify each feature:

### Initialization
- [ ] SDK initializes without errors
- [ ] SDK status shows initialized = true
- [ ] Device code is displayed (or "N/A" if not assigned yet)
- [ ] Feature flags are loaded

### API Tracing
- [ ] Test API call button works
- [ ] API trace appears in dashboard → API Traces
- [ ] Manual API trace button works
- [ ] Manual trace appears in dashboard

### Logging
- [ ] Send test log button works
- [ ] Log appears in dashboard → Logs
- [ ] Test all log levels button works
- [ ] All log levels appear in dashboard

### Crash Reporting
- [ ] Send crash report button works
- [ ] Crash appears in dashboard → Crashes

### Configuration
- [ ] Refresh business config button works
- [ ] Refresh localization button works
- [ ] Refresh all config button works
- [ ] Config values update in SDK

### User Management
- [ ] Set user button works
- [ ] User appears in dashboard → Devices (user column)
- [ ] Clear user button works
- [ ] User removed from device in dashboard

### Screen Tracking
- [ ] Track screen button works
- [ ] Screen appears in dashboard → Sessions → Timeline
- [ ] Navigate to second screen works
- [ ] Screen navigation tracked automatically

### Events
- [ ] Track custom event button works
- [ ] Set user properties button works
- [ ] Properties appear in session data

### Utilities
- [ ] Flush events button works
- [ ] Pending queue sizes decrease
- [ ] Print capture test works (if enabled)

## 🎯 Expected Dashboard Views

After testing, check these dashboard sections:

1. **Devices** - Should show your test device
2. **API Traces** - Should show test API calls
3. **Logs** - Should show test logs
4. **Crashes** - Should show test crash reports
5. **Sessions** - Should show session with screen flow
6. **Business Config** - Should show fetched configs
7. **Localization** - Should show fetched translations

## 🔍 Debugging Tips

1. **Check SDK Status** - Tap "Show SDK Status" to see initialization state
2. **Check Console** - Look for "NivoStack:" logs in console
3. **Check Network** - Verify network requests in network inspector
4. **Check Dashboard** - Verify events appear in dashboard
5. **Check Feature Flags** - Ensure features are enabled in dashboard

## 📱 Platform-Specific Testing

### iOS
- Test on iOS Simulator
- Test on physical iOS device
- Verify device registration works
- Verify API tracing works
- Verify screen tracking works

### Android
- Test on Android Emulator
- Test on physical Android device
- Verify device registration works
- Verify API tracing works
- Verify screen tracking works

## 🚀 Next Steps

1. Run example app on iOS
2. Run example app on Android
3. Test each button
4. Verify events in dashboard
5. Test edge cases (offline, slow network, etc.)

