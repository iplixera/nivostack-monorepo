#!/bin/bash

# Script to build and run NivoStack Example app on iOS Simulator
# This script will:
# 1. Set up Xcode developer directory (if needed)
# 2. Create Xcode project (if needed)
# 3. Build the app
# 4. Run on simulator

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🚀 NivoStack Example App - Build & Run"
echo ""

# Check if Xcode is installed
if [ ! -d "/Applications/Xcode.app" ]; then
    echo "❌ Xcode is not installed. Please install Xcode from the App Store."
    exit 1
fi

# Check if developer directory is set correctly
CURRENT_DEV_DIR=$(xcode-select -p)
if [[ "$CURRENT_DEV_DIR" != *"Xcode.app"* ]]; then
    echo "⚠️  Xcode developer directory needs to be set."
    echo "   Current: $CURRENT_DEV_DIR"
    echo "   Required: /Applications/Xcode.app/Contents/Developer"
    echo ""
    echo "Please run:"
    echo "   sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer"
    echo ""
    read -p "Would you like to set it now? (requires password) [y/N]: " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
        echo "✅ Developer directory set"
    else
        echo "❌ Cannot proceed without setting developer directory"
        exit 1
    fi
fi

# Check if project exists
if [ ! -d "NivoStackExample.xcodeproj" ]; then
    echo "📦 Xcode project not found. Creating project..."
    echo ""
    echo "Please create the project manually in Xcode:"
    echo "   1. Open Xcode"
    echo "   2. File → New → Project → iOS → App"
    echo "   3. Name: NivoStackExample"
    echo "   4. Location: $SCRIPT_DIR"
    echo "   5. Add SDK as local package dependency"
    echo "   6. Add example files (AppDelegate.swift, ViewController.swift)"
    echo ""
    echo "Or use xcodegen (if installed):"
    echo "   brew install xcodegen"
    echo "   xcodegen generate"
    echo ""
    echo "See SETUP_INSTRUCTIONS.md for detailed steps."
    exit 1
fi

# Get available simulators
echo "📱 Available iOS Simulators:"
xcrun simctl list devices available | grep -i "iphone" | head -10
echo ""

# Get default simulator (latest iPhone)
DEFAULT_SIMULATOR=$(xcrun simctl list devices available | grep -i "iphone" | grep -i "booted" | head -1 | sed 's/.*(\([^)]*\)).*/\1/' || \
    xcrun simctl list devices available | grep -i "iphone" | head -1 | sed 's/.*(\([^)]*\)).*/\1/')

if [ -z "$DEFAULT_SIMULATOR" ]; then
    echo "❌ No available iPhone simulators found"
    echo "   Please create a simulator in Xcode:"
    echo "   Xcode → Window → Devices and Simulators → Simulators → +"
    exit 1
fi

echo "🎯 Using simulator: $DEFAULT_SIMULATOR"
echo ""

# Build the project
echo "🔨 Building project..."
xcodebuild -project NivoStackExample.xcodeproj \
    -scheme NivoStackExample \
    -sdk iphonesimulator \
    -destination "platform=iOS Simulator,id=$DEFAULT_SIMULATOR" \
    clean build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please check errors above."
    exit 1
fi

echo "✅ Build successful!"
echo ""

# Install and run on simulator
echo "🚀 Installing and running on simulator..."
xcrun simctl boot "$DEFAULT_SIMULATOR" 2>/dev/null || true

# Find the built app
APP_PATH=$(find ~/Library/Developer/Xcode/DerivedData -name "NivoStackExample.app" -type d | head -1)

if [ -z "$APP_PATH" ]; then
    echo "❌ Could not find built app. Building with install..."
    xcodebuild -project NivoStackExample.xcodeproj \
        -scheme NivoStackExample \
        -sdk iphonesimulator \
        -destination "platform=iOS Simulator,id=$DEFAULT_SIMULATOR" \
        install
    APP_PATH=$(find ~/Library/Developer/Xcode/DerivedData -name "NivoStackExample.app" -type d | head -1)
fi

if [ -z "$APP_PATH" ]; then
    echo "❌ Could not find app. Please build and run from Xcode:"
    echo "   open NivoStackExample.xcodeproj"
    echo "   Then press ⌘R to run"
    exit 1
fi

# Install app on simulator
echo "📲 Installing app..."
xcrun simctl install "$DEFAULT_SIMULATOR" "$APP_PATH"

# Launch app
echo "🎬 Launching app..."
xcrun simctl launch "$DEFAULT_SIMULATOR" com.nivostack.example

echo ""
echo "✅ App launched on simulator!"
echo "   Check the simulator window to see the app running."
echo ""

