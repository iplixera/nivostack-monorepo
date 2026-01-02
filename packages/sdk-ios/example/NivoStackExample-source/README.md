# NivoStack iOS SDK Example App

Example iOS app demonstrating how to integrate and use the NivoStack SDK.

## Setup

1. **Open in Xcode**
   ```bash
   open NivoStackExample.xcodeproj
   ```

2. **Add SDK Dependency**
   - In Xcode, go to File → Add Packages...
   - Add the NivoStack SDK package:
     - URL: `file:///path/to/nivostack-monorepo/packages/sdk-ios`
     - Or use the local path: `../..` (relative to example directory)

3. **Configure API Key**
   - Open `AppDelegate.swift`
   - Replace `"cmjvwzx140003og8t37yd6kor"` with your actual API key from NivoStack Studio

4. **Build and Run**
   - Select a simulator or device
   - Press ⌘R to build and run

## Features Demonstrated

The example app includes buttons to test:

- ✅ **Track API Trace** - Simulates API call tracking
- ✅ **Log Message** - Sends log messages at different levels
- ✅ **Track Screen View** - Tracks screen navigation
- ✅ **Report Crash** - Reports a test crash
- ✅ **Refresh Config** - Fetches latest configuration from server
- ✅ **Flush Events** - Manually flushes pending events
- ✅ **Set User** - Associates user with device
- ✅ **Clear User** - Removes user association
- ✅ **Fetch Business Config** - Fetches remote configuration
- ✅ **Fetch Localization** - Fetches translations

## Project Structure

```
NivoStackExample/
├── AppDelegate.swift      # SDK initialization
├── ViewController.swift   # Main UI and SDK usage examples
├── Info.plist            # App configuration
└── README.md             # This file
```

## Notes

- The SDK initializes automatically when the app launches
- All SDK operations run asynchronously and don't block the UI
- Check the console for SDK logs and status updates
- Device code is displayed at the top of the screen once initialized

## Troubleshooting

### SDK Not Initializing
- Check that the API key is correct
- Verify network connectivity
- Check console logs for error messages

### Events Not Appearing in Dashboard
- Ensure the device is registered (check device code)
- Verify feature flags are enabled in NivoStack Studio
- Check that tracking is enabled for the device

### Build Errors
- Ensure the SDK package is properly added
- Clean build folder (⌘⇧K) and rebuild
- Check that iOS deployment target is 13.0+

