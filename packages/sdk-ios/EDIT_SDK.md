# Editing NivoStack iOS SDK in Xcode

Guide to open and edit the SDK source code in Xcode.

## Method 1: Open Package Directly (Recommended)

### Step 1: Open Package.swift in Xcode

```bash
cd packages/sdk-ios
open Package.swift
```

This will open the Swift Package in Xcode with full editing capabilities.

### Step 2: Navigate Source Files

- **Project Navigator** (left sidebar) shows:
  - `Sources/NivoStack/` - All SDK source files
  - `Tests/NivoStackTests/` - Test files

### Step 3: Edit Files

- Click any `.swift` file to edit
- Xcode provides full syntax highlighting, autocomplete, and error checking
- Changes are saved automatically

## Method 2: Open from Example Project

If you have the example project open:

1. **In Xcode** (with example project open):
   - Look at **Package Dependencies** in Project Navigator
   - Find **NivoStack** package
   - Right-click → **Show in Finder**
   - Or double-click to navigate to source files

2. **Edit Package Files**:
   - Files are read-only when opened from package dependencies
   - To edit: Open `Package.swift` directly (Method 1)

## Method 3: Open Specific File

```bash
# Open specific file
open packages/sdk-ios/Sources/NivoStack/NivoStack.swift

# Or open entire Sources directory
open packages/sdk-ios/Sources
```

## Project Structure in Xcode

When you open `Package.swift`, you'll see:

```
NivoStack (Package)
├── Sources
│   └── NivoStack
│       ├── Models/
│       │   ├── DeviceInfo.swift
│       │   ├── DeviceConfig.swift
│       │   ├── FeatureFlags.swift
│       │   └── SdkSettings.swift
│       ├── Utils/
│       │   ├── DeviceCodeGenerator.swift
│       │   └── SdkConfigCache.swift
│       ├── NivoStack.swift (Main SDK class)
│       ├── NivoStackApiClient.swift
│       ├── NivoStackBusinessConfig.swift
│       └── NivoStackLocalization.swift
└── Tests
    └── NivoStackTests/
```

## Editing Workflow

### 1. Make Changes

- Edit any `.swift` file
- Xcode will show errors/warnings in real-time

### 2. Test Changes

**Option A: Build Package**
- In Xcode: **Product** → **Build** (⌘B)
- Checks for compilation errors

**Option B: Test in Example App**
- Changes are automatically reflected in example app
- Build example app: **Product** → **Build** (⌘B)
- Run example app: **Product** → **Run** (⌘R)

### 3. Verify Changes

- Build succeeds without errors
- Example app runs and uses updated SDK
- Check console logs for SDK behavior

## Quick Commands

```bash
# Open SDK package
cd packages/sdk-ios
open Package.swift

# Open specific file
open Sources/NivoStack/NivoStack.swift

# Open entire Sources directory
open Sources

# Build package (from terminal)
swift build

# Run tests (from terminal)
swift test
```

## Tips

1. **Dual Window Setup**:
   - Open SDK package in one Xcode window
   - Open example project in another window
   - Edit SDK → See changes in example app

2. **Quick Navigation**:
   - **⌘1**: Show/hide Project Navigator
   - **⌘⇧O**: Quick Open (search files)
   - **⌘B**: Build
   - **⌘R**: Run

3. **Live Changes**:
   - SDK changes are immediately available to example app
   - No need to re-add package dependency
   - Just rebuild example app

4. **Debugging**:
   - Set breakpoints in SDK code
   - Run example app with debugger
   - Step through SDK code

## Common Edits

### Add New Method

1. Open `NivoStack.swift`
2. Add method in appropriate section
3. Build to check for errors
4. Test in example app

### Modify API Client

1. Open `NivoStackApiClient.swift`
2. Edit HTTP methods
3. Build and test

### Update Models

1. Open model file (e.g., `FeatureFlags.swift`)
2. Add/modify properties
3. Update Codable implementation if needed
4. Build and test

## Troubleshooting

### Changes Not Reflecting

- Clean build: **Product** → **Clean Build Folder** (⌘⇧K)
- Rebuild: **Product** → **Build** (⌘B)

### Package Not Found

- Make sure you opened `Package.swift`, not just a file
- Verify package structure is correct

### Build Errors

- Check Swift version compatibility
- Verify all imports are correct
- Check for syntax errors

