#!/bin/bash

# Script to create Xcode project using command line
# This is a helper script - full project creation is best done in Xcode

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "📦 Creating Xcode Project for NivoStack Example"
echo ""

# Check Xcode
if [ ! -d "/Applications/Xcode.app" ]; then
    echo "❌ Xcode is not installed"
    exit 1
fi

# Check developer directory
CURRENT_DEV_DIR=$(xcode-select -p)
if [[ "$CURRENT_DEV_DIR" != *"Xcode.app"* ]]; then
    echo "⚠️  Please set Xcode developer directory first:"
    echo "   sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer"
    exit 1
fi

echo "⚠️  Automatic project creation is complex."
echo ""
echo "📝 Recommended: Create project manually in Xcode"
echo ""
echo "Steps:"
echo "1. Open Xcode"
echo "2. File → New → Project → iOS → App"
echo "3. Configure:"
echo "   - Name: NivoStackExample"
echo "   - Location: $SCRIPT_DIR"
echo "   - Interface: Storyboard"
echo "   - Language: Swift"
echo "4. Add SDK: File → Add Packages... → Add Local... → packages/sdk-ios"
echo "5. Add files: AppDelegate.swift, ViewController.swift from NivoStackExample/"
echo ""
echo "See SETUP_INSTRUCTIONS.md for detailed guide."
echo ""
echo "Alternatively, install xcodegen and run:"
echo "   brew install xcodegen"
echo "   xcodegen generate"
echo ""

