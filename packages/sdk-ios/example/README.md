# NivoStack iOS SDK Example App

Complete example iOS app demonstrating all NivoStack SDK features.

## 📁 Project Structure

```
example/
├── NivoStackExample/          # Example app source files
│   ├── AppDelegate.swift      # SDK initialization
│   ├── ViewController.swift   # Main UI with demo buttons
│   ├── Info.plist            # App configuration
│   └── README.md             # Example app documentation
├── SETUP_INSTRUCTIONS.md     # Detailed setup guide
├── QUICK_START.md           # 5-minute quick start
├── setup-xcode-project.sh   # Setup script
├── project.yml              # xcodegen config (optional)
└── README.md                # This file
```

## 🚀 Quick Start

### Option 1: Manual Setup (Recommended)

1. **Open Xcode**
   ```bash
   open -a Xcode
   ```

2. **Create New Project**
   - File → New → Project → iOS → App
   - Name: `NivoStackExample`
   - Location: `packages/sdk-ios/example/`
   - Interface: Storyboard
   - Language: Swift

3. **Add SDK Dependency**
   - File → Add Packages... → Add Local...
   - Navigate to: `packages/sdk-ios`
   - Add Package → Select NivoStack → Add to Target

4. **Add Example Files**
   - Right-click project → Add Files...
   - Select `NivoStackExample/AppDelegate.swift`
   - Select `NivoStackExample/ViewController.swift`
   - Uncheck "Copy items"
   - Check "Add to targets"

5. **Configure & Run**
   - Set iOS Deployment Target to 13.0
   - Update API key in `AppDelegate.swift`
   - Press ⌘R to run

**See `QUICK_START.md` for detailed steps.**

### Option 2: Using xcodegen

```bash
# Install xcodegen (if needed)
brew install xcodegen

# Generate project
cd packages/sdk-ios/example
xcodegen generate

# Open in Xcode
open NivoStackExample.xcodeproj

# Then add SDK as local package dependency in Xcode
```

## ✨ Features Demonstrated

The example app includes 10 demo buttons:

1. **Track API Trace** - Simulates API call tracking
2. **Log Message** - Sends logs at different levels
3. **Track Screen View** - Tracks screen navigation
4. **Report Crash** - Reports a test crash
5. **Refresh Config** - Fetches latest configuration
6. **Flush Events** - Manually flushes pending events
7. **Set User** - Associates user with device
8. **Clear User** - Removes user association
9. **Fetch Business Config** - Fetches remote configuration
10. **Fetch Localization** - Fetches translations

## 📱 App Features

- **SDK Status Display** - Shows initialization status and device code
- **Interactive Buttons** - Test all SDK features with one tap
- **Error Handling** - Proper error handling and user feedback
- **Console Logging** - Detailed logs for debugging

## 🔧 Configuration

### Update API Key

Edit `NivoStackExample/AppDelegate.swift`:

```swift
let apiKey = "your-project-api-key" // Replace with your key
```

### Configure Sync Interval

```swift
NivoStack.initialize(
    apiKey: apiKey,
    enabled: true,
    syncIntervalMinutes: 15 // Sync every 15 minutes (nil = lifecycle only)
)
```

## 📚 Documentation

- **QUICK_START.md** - 5-minute setup guide
- **SETUP_INSTRUCTIONS.md** - Detailed setup instructions
- **NivoStackExample/README.md** - Example app documentation
- **../README.md** - SDK documentation
- **../INTEGRATION_GUIDE.md** - Integration guide

## 🐛 Troubleshooting

### SDK Not Found
- Ensure SDK is added as a package dependency
- Clean build folder (⌘⇧K) and rebuild

### Build Errors
- Check iOS deployment target is 13.0+
- Verify Swift version is 5.5+
- Clean DerivedData: `rm -rf ~/Library/Developer/Xcode/DerivedData`

### SDK Not Initializing
- Check API key is correct
- Verify network connectivity
- Check console logs for errors

## 📖 Next Steps

1. **Run the App** - Build and run to see SDK in action
2. **Check Dashboard** - View events in NivoStack Studio
3. **Customize** - Modify code for your needs
4. **Integrate** - Use SDK in your own app

## 💡 Tips

- Check console logs for SDK status and debug info
- Device code appears once SDK is initialized
- All SDK operations are asynchronous
- Events are batched and sent automatically

## 🆘 Support

For issues:
- Check `SETUP_INSTRUCTIONS.md` for detailed troubleshooting
- Review console logs for error messages
- See main SDK `README.md` for API documentation
