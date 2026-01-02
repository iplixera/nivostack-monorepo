# iOS SDK Development & Release Plan

## Overview

This document outlines the complete workflow for developing, testing, and releasing the NivoStack iOS SDK, from initial creation to production usage.

## Phase 1: SDK Creation & Structure

### 1.1 Create SDK Package Structure

```
packages/sdk-ios/
├── Sources/
│   └── NivoStack/
│       ├── NivoStack.swift              # Main SDK class
│       ├── NivoStackApiClient.swift      # HTTP client for API calls
│       ├── NivoStackBusinessConfig.swift # Business config client
│       ├── NivoStackLocalization.swift   # Localization client
│       ├── NivoStackDeviceCodeGenerator.swift
│       ├── Models/
│       │   ├── DeviceInfo.swift
│       │   ├── DeviceConfig.swift
│       │   ├── FeatureFlags.swift
│       │   ├── SdkSettings.swift
│       │   └── AppBlockingConfig.swift
│       └── Utils/
│           ├── SdkConfigCache.swift
│           └── Extensions.swift
├── Tests/
│   └── NivoStackTests/
│       └── NivoStackTests.swift
├── Package.swift                         # Swift Package Manager manifest
├── NivoStack.podspec                     # CocoaPods manifest (optional)
└── README.md
```

### 1.2 Core Features to Implement

Based on Flutter SDK parity:

- ✅ **SDK Initialization** (`init()`)
- ✅ **Device Registration** (with device code generation)
- ✅ **API Tracking** (`trackApiTrace()`)
- ✅ **Logging** (`log()`)
- ✅ **Crash Reporting** (`reportCrash()`)
- ✅ **Session Tracking** (`startSession()`, `endSession()`)
- ✅ **Screen Tracking** (`trackScreen()`)
- ✅ **Business Config** (`getBusinessConfig()`, `refreshConfig()`)
- ✅ **Localization** (`getLocalization()`, `getTranslation()`)
- ✅ **User Association** (`setUser()`, `clearUser()`)
- ✅ **Lifecycle Management** (app foreground/background sync)
- ✅ **Periodic Sync** (configurable interval)
- ✅ **Caching** (ETag support, local config cache)
- ✅ **Feature Flags** (check before operations)
- ✅ **Device Code** (short identifier for support)

### 1.3 Dependencies

- **URLSession** (native HTTP client)
- **Foundation** (UserDefaults for caching, Keychain for sensitive data)
- **Combine** (for async operations, optional)
- **UIKit/AppKit** (for lifecycle observation)

### 1.4 Package Manager Support

**Primary: Swift Package Manager (SPM)**
- Native iOS/macOS support
- Easy integration
- Version management via Git tags

**Optional: CocoaPods**
- For projects already using CocoaPods
- Requires `.podspec` file

---

## Phase 2: Sample App Setup

### 2.1 Create Sample App Structure

```
packages/sdk-ios/example/
├── NivoStackExample/
│   ├── App/
│   │   ├── NivoStackExampleApp.swift    # App entry point
│   │   └── ContentView.swift            # Main UI
│   ├── Views/
│   │   ├── HomeView.swift
│   │   ├── ConfigView.swift
│   │   ├── LogsView.swift
│   │   └── StatusView.swift
│   ├── ViewModels/
│   │   └── SdkStatusViewModel.swift
│   ├── Info.plist
│   └── Assets.xcassets/
├── NivoStackExample.xcodeproj/
└── README.md
```

### 2.2 Sample App Features

- SDK initialization UI
- Display SDK status (initialized, device code, etc.)
- Test API tracking
- Test logging
- Test crash reporting
- Test business config fetching
- Test localization
- Show current config values
- Refresh config button
- Flush events button

---

## Phase 3: Development Workflow (Local Reference)

### 3.1 Setup Local Development

**Option A: Swift Package Manager (Recommended)**

1. **Add SDK as Local Package**:
   ```swift
   // In Xcode: File → Add Package Dependencies
   // Select: Add Local...
   // Choose: packages/sdk-ios
   ```

2. **Or via Package.swift** (if using Swift Package Manager for the app):
   ```swift
   dependencies: [
       .package(path: "../sdk-ios")
   ]
   ```

**Option B: Xcode Workspace**

1. Create workspace including both SDK and Sample App
2. Add SDK project to workspace
3. Sample App references SDK project directly

### 3.2 Development Process

1. **Make changes** in `packages/sdk-ios/Sources/NivoStack/`
2. **Build SDK** (⌘+B in Xcode)
3. **Test in Sample App** (⌘+R)
4. **Iterate** until feature works
5. **Commit changes** to feature branch

### 3.3 Testing Strategy

- **Unit Tests**: Test individual components (models, utilities)
- **Integration Tests**: Test API client with mock server
- **Sample App Testing**: Manual testing in sample app
- **Real Device Testing**: Test on physical iOS device

---

## Phase 4: Release Workflow

### 4.1 Version Management

**Version Format**: `MAJOR.MINOR.PATCH` (e.g., `1.0.0`)

- **MAJOR**: Breaking API changes
- **MINOR**: New features, backward compatible
- **PATCH**: Bug fixes, backward compatible

**Version Storage**:
- `Package.swift`: `let version = "1.0.0"`
- `NivoStack.podspec`: `s.version = "1.0.0"`
- Git tags: `v1.0.0`

### 4.2 Pre-Release Checklist

- [ ] All features implemented and tested
- [ ] Unit tests passing
- [ ] Sample app tested on real device
- [ ] Documentation updated (README.md)
- [ ] CHANGELOG.md updated
- [ ] Version numbers updated
- [ ] Code reviewed

### 4.3 Release Process

1. **Update Version**:
   ```bash
   # Update Package.swift
   # Update NivoStack.podspec (if using CocoaPods)
   # Update README.md with version
   ```

2. **Commit Version Bump**:
   ```bash
   git add packages/sdk-ios/
   git commit -m "chore(ios-sdk): bump version to 1.0.0"
   ```

3. **Create Git Tag**:
   ```bash
   git tag -a v1.0.0-ios -m "iOS SDK v1.0.0"
   git push origin v1.0.0-ios
   ```

4. **Verify Tag**:
   ```bash
   git tag -l "v*-ios"
   ```

---

## Phase 5: Publishing

### 5.1 Swift Package Manager (SPM) Publishing

**SPM uses Git tags automatically** - no separate publishing step needed!

1. **Push tag to GitHub**:
   ```bash
   git push origin v1.0.0-ios
   ```

2. **Users add via Xcode**:
   - File → Add Package Dependencies
   - Enter: `https://github.com/iplixera/nivostack-monorepo`
   - Select version: `1.0.0` (or tag `v1.0.0-ios`)

3. **Or via Package.swift**:
   ```swift
   dependencies: [
       .package(
           url: "https://github.com/iplixera/nivostack-monorepo",
           from: "1.0.0"
       )
   ]
   ```

**Note**: SPM requires the package to be at the repository root or in a subdirectory. We'll need to configure `Package.swift` to point to the correct path.

### 5.2 CocoaPods Publishing (Optional)

1. **Create `.podspec` file**:
   ```ruby
   Pod::Spec.new do |s|
     s.name             = 'NivoStack'
     s.version          = '1.0.0'
     s.summary          = 'iOS SDK for NivoStack'
     s.homepage         = 'https://github.com/iplixera/nivostack-monorepo'
     s.license          = { :type => 'MIT' }
     s.author           = { 'NivoStack' => 'support@nivostack.com' }
     s.source           = { :git => 'https://github.com/iplixera/nivostack-monorepo.git', :tag => "v#{s.version}-ios" }
     s.ios.deployment_target = '13.0'
     s.source_files = 'packages/sdk-ios/Sources/**/*.swift'
   end
   ```

2. **Validate podspec**:
   ```bash
   pod lib lint NivoStack.podspec
   ```

3. **Publish to CocoaPods** (if creating public pod):
   ```bash
   pod trunk push NivoStack.podspec
   ```

### 5.3 GitHub Releases (Documentation)

Create a GitHub Release for each version:

1. Go to GitHub → Releases → Draft a new release
2. Tag: `v1.0.0-ios`
3. Title: `iOS SDK v1.0.0`
4. Description: Copy from CHANGELOG.md
5. Attach: Release notes, migration guide (if needed)

---

## Phase 6: Production Usage

### 6.1 Integration Steps

1. **Add SDK to Project**:
   - Via SPM: Add package dependency in Xcode
   - Via CocoaPods: Add to `Podfile` and run `pod install`

2. **Initialize SDK**:
   ```swift
   import NivoStack
   
   @main
   struct MyApp: App {
       init() {
           NivoStack.shared.initialize(
               apiKey: "your-api-key",
               ingestUrl: "https://ingest.nivostack.com",
               controlUrl: "https://api.nivostack.com"
           )
       }
   }
   ```

3. **Use SDK Features**:
   ```swift
   // Track API calls
   NivoStack.shared.trackApiTrace(url: url, method: "GET", statusCode: 200)
   
   // Log messages
   NivoStack.shared.log(level: .info, message: "User logged in")
   
   // Get business config
   let config = NivoStack.shared.getBusinessConfig(key: "feature_enabled")
   ```

### 6.2 Version Updates

**For SPM**:
- Xcode will show update notifications
- Update via: File → Packages → Update to Latest Package Versions

**For CocoaPods**:
- Update `Podfile`: `pod 'NivoStack', '~> 1.0'`
- Run: `pod update NivoStack`

### 6.3 Monitoring & Support

- Monitor SDK usage via Studio dashboard
- Track crashes and errors
- Collect user feedback
- Release patches as needed

---

## Implementation Steps Summary

### Step 1: Create SDK Structure
- [ ] Create `packages/sdk-ios/` directory
- [ ] Set up Swift Package structure
- [ ] Create `Package.swift`
- [ ] Create basic `NivoStack.swift` class

### Step 2: Implement Core Features
- [ ] Device code generation
- [ ] API client (URLSession-based)
- [ ] Device registration
- [ ] SDK initialization
- [ ] Config caching (UserDefaults)
- [ ] Feature flags parsing
- [ ] Business config client
- [ ] Localization client

### Step 3: Implement Tracking Features
- [ ] API tracking
- [ ] Logging
- [ ] Crash reporting
- [ ] Session tracking
- [ ] Screen tracking

### Step 4: Create Sample App
- [ ] Create Xcode project
- [ ] Add SDK as local package
- [ ] Create UI for testing features
- [ ] Test all SDK features

### Step 5: Testing & Documentation
- [ ] Write unit tests
- [ ] Test on real device
- [ ] Write README.md
- [ ] Write integration guide
- [ ] Create CHANGELOG.md

### Step 6: First Release
- [ ] Update version to 1.0.0
- [ ] Create git tag `v1.0.0-ios`
- [ ] Push tag to GitHub
- [ ] Create GitHub release
- [ ] Update documentation

### Step 7: Production Integration
- [ ] Test integration in real app
- [ ] Monitor usage
- [ ] Collect feedback
- [ ] Plan next version

---

## Key Decisions Needed

1. **Package Manager**: SPM only, or also CocoaPods?
2. **Minimum iOS Version**: iOS 13.0+ (recommended)
3. **Async/Await**: Use Swift 5.5+ async/await or completion handlers?
4. **Dependencies**: Any third-party dependencies, or pure Foundation?
5. **Architecture**: MVVM, or simple class-based?

---

## File Structure Reference

### Package.swift Template
```swift
// swift-tools-version:5.5
import PackageDescription

let package = Package(
    name: "NivoStack",
    platforms: [
        .iOS(.v13),
        .macOS(.v10_15)
    ],
    products: [
        .library(
            name: "NivoStack",
            targets: ["NivoStack"]
        ),
    ],
    dependencies: [],
    targets: [
        .target(
            name: "NivoStack",
            dependencies: [],
            path: "Sources/NivoStack"
        ),
        .testTarget(
            name: "NivoStackTests",
            dependencies: ["NivoStack"],
            path: "Tests/NivoStackTests"
        ),
    ]
)
```

---

## Next Steps

Once you approve this plan, I'll start with:
1. Creating the SDK structure
2. Implementing core initialization
3. Building out features incrementally
4. Creating the sample app
5. Setting up the release workflow

Let me know if you want any changes to this plan!

