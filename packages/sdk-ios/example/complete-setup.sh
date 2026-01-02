#!/bin/bash

# Script to complete the Xcode project setup
# Run this after creating the project and adding the SDK package

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🔧 Completing NivoStack Example App Setup"
echo ""

# Check if project exists
if [ ! -d "NivoStackExample.xcodeproj" ]; then
    echo "❌ Xcode project not found!"
    echo "   Please create the project first in Xcode"
    exit 1
fi

# Check if source files exist
if [ ! -d "NivoStackExample-source" ]; then
    echo "❌ Source files not found!"
    exit 1
fi

echo "📁 Found project: NivoStackExample.xcodeproj"
echo "📁 Found source files: NivoStackExample-source/"
echo ""

# Check if NivoStackExample folder exists (created by Xcode)
if [ -d "NivoStackExample" ]; then
    echo "✅ Project folder exists"
    
    # Copy source files
    echo "📋 Copying source files..."
    cp NivoStackExample-source/AppDelegate.swift NivoStackExample/ 2>/dev/null || echo "⚠️  AppDelegate.swift already exists or error"
    cp NivoStackExample-source/ViewController.swift NivoStackExample/ 2>/dev/null || echo "⚠️  ViewController.swift already exists or error"
    cp NivoStackExample-source/Info.plist NivoStackExample/ 2>/dev/null || echo "⚠️  Info.plist already exists or error"
    
    echo "✅ Files copied"
else
    echo "⚠️  NivoStackExample folder not found"
    echo "   This is normal if you just created the project"
    echo "   Please add the files manually in Xcode:"
    echo ""
    echo "   1. Right-click on project → Add Files to 'NivoStackExample'..."
    echo "   2. Select files from NivoStackExample-source/:"
    echo "      - AppDelegate.swift"
    echo "      - ViewController.swift"
    echo "   3. Uncheck 'Copy items if needed'"
    echo "   4. Check 'Add to targets: NivoStackExample'"
    echo "   5. Click Add"
    exit 1
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps in Xcode:"
echo "   1. Remove default AppDelegate.swift and ViewController.swift (if Xcode created them)"
echo "   2. Add the copied files to the project:"
echo "      - Right-click project → Add Files..."
echo "      - Select AppDelegate.swift and ViewController.swift from NivoStackExample/"
echo "      - Make sure they're added to target"
echo "   3. Configure:"
echo "      - General → iOS Deployment Target: 13.0"
echo "      - Update API key in AppDelegate.swift"
echo "   4. Build and Run: ⌘R"
echo ""

