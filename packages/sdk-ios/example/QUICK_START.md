# Quick Start Guide

Get the NivoStack Example app running in 5 minutes!

## Prerequisites

- ✅ Xcode 14.0+
- ✅ macOS 12.0+
- ✅ NivoStack API key (from Studio dashboard)

## Steps

### 1. Create Xcode Project (2 minutes)

```bash
# Open Xcode
open -a Xcode

# Then:
# File → New → Project → iOS → App
# Name: NivoStackExample
# Location: packages/sdk-ios/example/
# Interface: Storyboard
# Language: Swift
```

### 2. Add SDK Dependency (1 minute)

```
File → Add Packages... → Add Local...
Navigate to: packages/sdk-ios
Select folder → Add Package
Select "NivoStack" → Add to Target
```

### 3. Add Example Files (1 minute)

```
Right-click project → Add Files to "NivoStackExample"...
Select: NivoStackExample/AppDelegate.swift
Select: NivoStackExample/ViewController.swift
Uncheck "Copy items if needed"
Check "Add to targets: NivoStackExample"
```

### 4. Configure (30 seconds)

- **General Tab**: Set iOS Deployment Target to **13.0**
- **AppDelegate.swift**: Replace API key with yours

### 5. Run! (30 seconds)

```
Select iPhone simulator
Press ⌘R
```

## That's It! 🎉

The app should launch and you'll see:
- SDK status at the top
- Device code (once initialized)
- 10 demo buttons to test SDK features

## Need Help?

See `SETUP_INSTRUCTIONS.md` for detailed instructions.

## What's Next?

1. **Test Features**: Tap buttons to test SDK functionality
2. **Check Dashboard**: View events in NivoStack Studio
3. **Customize**: Modify code for your needs

