# Xcode Project Setup Instructions

Complete guide to set up the NivoStack Example iOS app in Xcode.

## Prerequisites

- Xcode 14.0 or later
- macOS 12.0 or later
- iOS 13.0+ deployment target

## Quick Setup (Recommended)

### Step 1: Create New Xcode Project

1. Open Xcode
   ```bash
   open -a Xcode
   ```

2. Create New Project
   - **File** → **New** → **Project** (or ⌘⇧N)
   - Select **iOS** → **App**
   - Click **Next**

3. Configure Project Details
   - **Product Name**: `NivoStackExample`
   - **Team**: Select your development team (or None)
   - **Organization Identifier**: `com.nivostack`
   - **Bundle Identifier**: `com.nivostack.example` (auto-filled)
   - **Interface**: **Storyboard** (or SwiftUI if preferred)
   - **Language**: **Swift**
   - **Storage**: None
   - **Include Tests**: Optional
   - Click **Next**

4. Choose Location
   - Navigate to: `packages/sdk-ios/example/`
   - **Important**: Make sure "Create Git repository" is unchecked (or checked if you want it)
   - Click **Create**

### Step 2: Add NivoStack SDK Dependency

1. **Add Local Package**
   - **File** → **Add Packages...** (or ⌘⌥⇧F)
   - Click **Add Local...** button (bottom left)
   - Navigate to: `packages/sdk-ios` directory (parent of example)
   - Select the `sdk-ios` folder
   - Click **Add Package**

2. **Select Package Product**
   - In the package dialog, select **NivoStack** library
   - Make sure it's added to the **NivoStackExample** target
   - Click **Add Package**

### Step 3: Replace Default Files

1. **Replace AppDelegate.swift**
   - Delete the default `AppDelegate.swift` from Xcode
   - Right-click on project → **Add Files to "NivoStackExample"...**
   - Select `NivoStackExample/AppDelegate.swift`
   - Make sure "Copy items if needed" is **unchecked**
   - Make sure "Add to targets: NivoStackExample" is **checked**
   - Click **Add**

2. **Replace ViewController.swift**
   - Delete the default `ViewController.swift` from Xcode
   - Right-click on project → **Add Files to "NivoStackExample"...**
   - Select `NivoStackExample/ViewController.swift`
   - Make sure "Copy items if needed" is **unchecked**
   - Make sure "Add to targets: NivoStackExample" is **checked**
   - Click **Add**

3. **Update Info.plist** (if needed)
   - The example `Info.plist` is already configured
   - You can use it or keep the default one

### Step 4: Configure Build Settings

1. **Select Project**
   - Click on **NivoStackExample** (blue icon) in the navigator

2. **Select Target**
   - Under **TARGETS**, select **NivoStackExample**

3. **General Tab**
   - **Minimum Deployments**: iOS **13.0**
   - **Supported Platforms**: iOS

4. **Build Settings Tab**
   - Search for "Swift Language Version"
   - Set to **Swift 5** (or Swift 5.5)

5. **Signing & Capabilities**
   - Select your **Team** (or enable "Automatically manage signing")
   - Xcode will generate a provisioning profile

### Step 5: Update API Key

1. **Open AppDelegate.swift**
   - Find the line: `let apiKey = "cmjvwzx140003og8t37yd6kor"`
   - Replace with your actual API key from NivoStack Studio

### Step 6: Build and Run

1. **Select Simulator**
   - Choose a simulator from the device menu (e.g., iPhone 14, iPhone 15)

2. **Build**
   - Press **⌘B** to build
   - Fix any errors if they occur

3. **Run**
   - Press **⌘R** to run
   - The app should launch in the simulator

## Alternative: Using xcodegen (Advanced)

If you have `xcodegen` installed:

```bash
# Install xcodegen (if not installed)
brew install xcodegen

# Generate project
cd packages/sdk-ios/example
xcodegen generate

# Open project
open NivoStackExample.xcodeproj
```

Then add the SDK as a local package dependency in Xcode (Step 2 above).

## Project Structure

After setup, your project should look like:

```
NivoStackExample.xcodeproj
NivoStackExample/
├── AppDelegate.swift      ✅ (from example)
├── ViewController.swift   ✅ (from example)
├── Info.plist            ✅ (from example or default)
└── Assets.xcassets       (default)
```

## Verifying Setup

1. **Check SDK Import**
   - Open `AppDelegate.swift`
   - Should see: `import NivoStack` at the top
   - No red errors

2. **Check Build**
   - Press ⌘B
   - Should build successfully with no errors

3. **Check Runtime**
   - Press ⌘R
   - App should launch
   - Check console for SDK initialization logs

## Troubleshooting

### SDK Not Found

**Error**: `No such module 'NivoStack'`

**Solution**:
1. Make sure SDK is added as a package dependency
2. Check that it's added to the correct target
3. Clean build folder: **Product** → **Clean Build Folder** (⌘⇧K)
4. Rebuild: **Product** → **Build** (⌘B)

### Build Errors

**Error**: Various Swift compilation errors

**Solution**:
1. Check iOS deployment target is 13.0+
2. Check Swift version is 5.5+
3. Clean build folder (⌘⇧K)
4. Delete DerivedData:
   ```bash
   rm -rf ~/Library/Developer/Xcode/DerivedData
   ```
5. Rebuild

### SDK Not Initializing

**Error**: SDK initialization fails

**Solution**:
1. Check API key is correct
2. Check network connectivity
3. Check console logs for detailed error messages
4. Verify device is registered (check device code)

### Package Dependency Issues

**Error**: Package dependency resolution fails

**Solution**:
1. **File** → **Packages** → **Reset Package Caches**
2. **File** → **Packages** → **Update to Latest Package Versions**
3. Remove and re-add the package dependency

## Next Steps

Once the project is set up:

1. **Test Features**: Use the buttons in the app to test SDK features
2. **Check Dashboard**: Verify events appear in NivoStack Studio
3. **Customize**: Modify the example code for your needs
4. **Integrate**: Use the SDK in your own app

## Support

For issues:
- Check console logs for detailed error messages
- Verify SDK package is properly added
- Ensure all build settings are correct
- See main SDK README.md for API documentation

