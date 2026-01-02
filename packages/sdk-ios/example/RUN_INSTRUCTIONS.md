# Running the NivoStack Example App

## Prerequisites

1. **Xcode Installed**: `/Applications/Xcode.app`
2. **Developer Directory Set**: Points to Xcode (not Command Line Tools)
3. **Xcode Project Created**: See `SETUP_INSTRUCTIONS.md`

## Quick Run (After Project Setup)

### Option 1: From Xcode (Easiest)

```bash
cd packages/sdk-ios/example
open NivoStackExample.xcodeproj
```

Then in Xcode:
- Select a simulator (e.g., iPhone 14)
- Press **⌘R** to build and run

### Option 2: Command Line

```bash
cd packages/sdk-ios/example

# Set developer directory (if needed, requires password)
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer

# Build and run
./build-and-run.sh
```

## Setting Up Developer Directory

If you see errors about "command line tools", set the developer directory:

```bash
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
```

Verify:
```bash
xcode-select -p
# Should show: /Applications/Xcode.app/Contents/Developer
```

## Creating the Project

If you haven't created the Xcode project yet:

### Manual (Recommended)

1. **Open Xcode**
   ```bash
   open -a Xcode
   ```

2. **Create Project**
   - File → New → Project
   - iOS → App
   - Name: `NivoStackExample`
   - Location: `packages/sdk-ios/example/`
   - Interface: Storyboard
   - Language: Swift

3. **Add SDK**
   - File → Add Packages... → Add Local...
   - Navigate to: `packages/sdk-ios`
   - Add Package → Select NivoStack → Add to Target

4. **Add Files**
   - Right-click project → Add Files...
   - Select `NivoStackExample/AppDelegate.swift`
   - Select `NivoStackExample/ViewController.swift`
   - Uncheck "Copy items"
   - Check "Add to targets"

5. **Configure**
   - General → iOS Deployment Target: 13.0
   - Update API key in `AppDelegate.swift`

6. **Run**
   - Select simulator
   - Press ⌘R

### Using xcodegen (Advanced)

```bash
# Install xcodegen
brew install xcodegen

# Generate project
cd packages/sdk-ios/example
xcodegen generate

# Open in Xcode
open NivoStackExample.xcodeproj

# Then add SDK as local package dependency
```

## Troubleshooting

### "xcode-select: error: tool 'xcodebuild' requires Xcode"

**Solution**: Set developer directory
```bash
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
```

### "No such module 'NivoStack'"

**Solution**:
1. Ensure SDK is added as package dependency
2. Clean build: ⌘⇧K
3. Rebuild: ⌘B

### "No available simulators"

**Solution**:
1. Open Xcode
2. Window → Devices and Simulators
3. Simulators → + (Add)
4. Create iPhone simulator

### Build Errors

**Solution**:
1. Clean build folder: ⌘⇧K
2. Delete DerivedData:
   ```bash
   rm -rf ~/Library/Developer/Xcode/DerivedData
   ```
3. Rebuild: ⌘B

## Verifying Setup

Check that everything is ready:

```bash
# Check Xcode
ls /Applications/Xcode.app && echo "✅ Xcode installed"

# Check developer directory
xcode-select -p | grep Xcode && echo "✅ Developer directory set"

# Check project exists
ls NivoStackExample.xcodeproj && echo "✅ Project exists"

# Check simulators
xcrun simctl list devices available | grep iPhone && echo "✅ Simulators available"
```

## Next Steps

Once running:
1. ✅ Check SDK initialization in console
2. ✅ See device code displayed in app
3. ✅ Test all 10 demo buttons
4. ✅ Check NivoStack Studio dashboard for events

