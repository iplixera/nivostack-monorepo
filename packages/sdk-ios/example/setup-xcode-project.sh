#!/bin/bash

# Script to set up Xcode project for NivoStack Example App
# This script creates a basic Xcode project structure

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXAMPLE_DIR="$SCRIPT_DIR/NivoStackExample"
PROJECT_NAME="NivoStackExample"
BUNDLE_ID="com.nivostack.example"

echo "🚀 Setting up Xcode project for NivoStack Example App"
echo ""

# Check if Xcode is installed
if ! command -v xcodebuild &> /dev/null; then
    echo "❌ Xcode is not installed. Please install Xcode from the App Store."
    exit 1
fi

# Create project directory if it doesn't exist
mkdir -p "$EXAMPLE_DIR"

echo "📁 Project directory: $EXAMPLE_DIR"
echo ""

# Instructions for manual setup
cat > "$SCRIPT_DIR/SETUP_INSTRUCTIONS.md" << 'EOF'
# Xcode Project Setup Instructions

Since Xcode projects are complex binary/XML files, please follow these steps to create the project:

## Option 1: Create Project Manually (Recommended)

1. **Open Xcode**
   ```bash
   open -a Xcode
   ```

2. **Create New Project**
   - File → New → Project
   - Select "iOS" → "App"
   - Click "Next"

3. **Configure Project**
   - Product Name: `NivoStackExample`
   - Team: Select your team (or None)
   - Organization Identifier: `com.nivostack`
   - Bundle Identifier: `com.nivostack.example`
   - Interface: Storyboard (or SwiftUI)
   - Language: Swift
   - Storage: None
   - Include Tests: Optional
   - Click "Next"

4. **Save Location**
   - Navigate to: `packages/sdk-ios/example/`
   - Click "Create"

5. **Add SDK Dependency**
   - File → Add Packages...
   - Click "Add Local..."
   - Navigate to: `packages/sdk-ios` (parent directory)
   - Select the directory and click "Add Package"
   - Select "NivoStack" library and add to target

6. **Replace Default Files**
   - Replace `AppDelegate.swift` with the one from `NivoStackExample/AppDelegate.swift`
   - Replace `ViewController.swift` with the one from `NivoStackExample/ViewController.swift`
   - Update `Info.plist` if needed

7. **Configure Build Settings**
   - Select project in navigator
   - Select target "NivoStackExample"
   - General tab:
     - Minimum Deployments: iOS 13.0
   - Build Settings:
     - Swift Language Version: Swift 5

8. **Build and Run**
   - Select a simulator (e.g., iPhone 14)
   - Press ⌘R to build and run

## Option 2: Use xcodegen (Advanced)

If you have `xcodegen` installed:

```bash
cd packages/sdk-ios/example
xcodegen generate
open NivoStackExample.xcodeproj
```

Then add the SDK as a local package dependency in Xcode.

## Option 3: Use Swift Package Manager (Alternative)

You can also create a simple Swift Package that includes the example:

```bash
cd packages/sdk-ios/example
swift package init --type executable
# Then configure Package.swift to depend on the SDK
```

## Troubleshooting

- **SDK Not Found**: Make sure you added the SDK as a local package dependency
- **Build Errors**: Clean build folder (⌘⇧K) and rebuild
- **iOS Version**: Ensure deployment target is iOS 13.0+
EOF

echo "✅ Setup instructions created: SETUP_INSTRUCTIONS.md"
echo ""
echo "📝 Next steps:"
echo "   1. Open SETUP_INSTRUCTIONS.md for detailed setup guide"
echo "   2. Or manually create Xcode project following the instructions"
echo ""
echo "💡 Quick start:"
echo "   open -a Xcode"
echo "   # Then: File → New → Project → iOS App"
echo ""

# Create a basic project.yml for xcodegen (if user has it)
cat > "$SCRIPT_DIR/project.yml" << EOF
name: $PROJECT_NAME
options:
  bundleIdPrefix: com.nivostack
  deploymentTarget:
    iOS: "13.0"
  developmentLanguage: en
targets:
  $PROJECT_NAME:
    type: application
    platform: iOS
    sources:
      - path: $PROJECT_NAME
    settings:
      PRODUCT_BUNDLE_IDENTIFIER: $BUNDLE_ID
      IPHONEOS_DEPLOYMENT_TARGET: "13.0"
      SWIFT_VERSION: "5.5"
    dependencies:
      - package:
          path: ../  # NivoStack SDK
          product: NivoStack
          linking: dynamic
packages:
  NivoStack:
    path: ../
EOF

echo "✅ Created project.yml for xcodegen (optional)"
echo ""
echo "✨ Setup complete! Follow SETUP_INSTRUCTIONS.md to create the Xcode project."
echo ""

