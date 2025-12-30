# DevBridge Multi-Platform SDK Development Plan

## Executive Summary

This document outlines the complete plan for building, managing, and distributing DevBridge SDKs across multiple platforms: iOS, Android, Web, React Native, Flutter, and more.

**Key Decisions**:
- **Monorepo Structure**: Single repository with multiple SDK packages
- **Workspace Management**: Use Cursor workspaces for each SDK
- **Distribution**: Platform-native package managers (CocoaPods, Maven, npm)
- **Versioning**: Semantic versioning with unified version numbers
- **CI/CD**: GitHub Actions for automated builds and releases

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [Source Code Management](#2-source-code-management)
3. [SDK Platforms & Technologies](#3-sdk-platforms--technologies)
4. [Build & Distribution](#4-build--distribution)
5. [Versioning Strategy](#5-versioning-strategy)
6. [Sample Apps](#6-sample-apps)
7. [Development Workflow](#7-development-workflow)
8. [CI/CD Pipeline](#8-cicd-pipeline)
9. [Testing Strategy](#9-testing-strategy)
10. [Documentation](#10-documentation)
11. [Workspace Management](#11-workspace-management)

---

## 1. Project Structure

### Recommended: Monorepo Structure

```
devbridge/
├── packages/
│   ├── sdk-ios/              # iOS SDK (Swift)
│   │   ├── DevBridgeSDK/
│   │   ├── DevBridgeSDK.podspec
│   │   ├── Tests/
│   │   └── SampleApp/
│   │
│   ├── sdk-android/          # Android SDK (Kotlin)
│   │   ├── devbridge-sdk/
│   │   ├── build.gradle
│   │   ├── src/
│   │   └── sample-app/
│   │
│   ├── sdk-web/              # Web SDK (TypeScript)
│   │   ├── src/
│   │   ├── dist/
│   │   ├── package.json
│   │   └── examples/
│   │
│   ├── sdk-react-native/     # React Native SDK (TypeScript)
│   │   ├── src/
│   │   ├── ios/
│   │   ├── android/
│   │   ├── package.json
│   │   └── example/
│   │
│   ├── sdk-flutter/          # Flutter SDK (Dart) - EXISTING
│   │   ├── lib/
│   │   ├── pubspec.yaml
│   │   └── example/
│   │
│   └── sdk-unity/            # Unity SDK (C#)
│       ├── Runtime/
│       ├── package.json
│       └── Samples/
│
├── dashboard/                # Dashboard (Next.js) - EXISTING
│   └── ...
│
├── docs/                     # Documentation
│   ├── sdk/
│   │   ├── ios/
│   │   ├── android/
│   │   ├── web/
│   │   └── ...
│   └── ...
│
├── scripts/                  # Shared scripts
│   ├── build-all.sh
│   ├── release.sh
│   └── version-bump.sh
│
├── .github/
│   └── workflows/
│       ├── build-ios.yml
│       ├── build-android.yml
│       ├── build-web.yml
│       └── release.yml
│
├── package.json              # Root package.json (workspace config)
└── README.md
```

### Alternative: Separate Repositories

**Pros**:
- ✅ Independent versioning
- ✅ Platform-specific CI/CD
- ✅ Smaller repository size
- ✅ Platform-specific access control

**Cons**:
- ❌ Harder to share code
- ❌ More complex dependency management
- ❌ Harder to maintain consistency

**Recommendation**: **Monorepo** for better code sharing and consistency.

---

## 2. Source Code Management

### Git Strategy

**Branching Model**: Git Flow

```
main                    # Production releases
├── develop             # Development branch
│   ├── feature/ios-sdk
│   ├── feature/android-sdk
│   └── feature/web-sdk
├── release/v1.0.0      # Release candidates
└── hotfix/v1.0.1       # Hotfixes
```

### Repository Organization

**Option A: Single Monorepo** (Recommended)
```
devbridge/
├── packages/sdk-ios/
├── packages/sdk-android/
├── packages/sdk-web/
└── dashboard/
```

**Option B: Separate Repos** (If needed)
```
devbridge-dashboard/
devbridge-sdk-ios/
devbridge-sdk-android/
devbridge-sdk-web/
devbridge-sdk-flutter/
```

### Code Sharing Strategy

**Shared Code**:
- API client logic (HTTP requests)
- Configuration parsing
- Event queuing logic
- Error handling patterns

**Implementation**:
1. **Shared Documentation**: Common API reference, architecture docs
2. **Shared Tests**: Integration test scenarios
3. **Shared Scripts**: Build, release, versioning scripts
4. **Shared Types**: OpenAPI/Swagger spec for API contracts

---

## 3. SDK Platforms & Technologies

### Platform Matrix

| Platform | Language | Package Manager | Distribution | Status |
|----------|----------|-----------------|--------------|--------|
| **iOS** | Swift | CocoaPods, SPM | CocoaPods, GitHub Releases | 🔴 Not Started |
| **Android** | Kotlin | Maven, Gradle | Maven Central, JitPack | 🔴 Not Started |
| **Web** | TypeScript | npm | npm Registry | 🔴 Not Started |
| **React Native** | TypeScript | npm | npm Registry | 🔴 Not Started |
| **Flutter** | Dart | pub.dev | pub.dev | 🟢 Existing |
| **Unity** | C# | Unity Package Manager | GitHub Releases | 🔴 Not Started |

### Technology Stack per Platform

#### iOS SDK (Swift)
- **Language**: Swift 5.9+
- **Minimum iOS**: iOS 13.0+
- **Dependencies**:
  - `Foundation` (built-in)
  - `Network` (for HTTP)
  - `Combine` (for async operations)
- **Package Manager**: Swift Package Manager (SPM) + CocoaPods
- **Distribution**: CocoaPods, SPM, GitHub Releases

#### Android SDK (Kotlin)
- **Language**: Kotlin 1.9+
- **Minimum Android**: API 21 (Android 5.0)
- **Dependencies**:
  - `OkHttp` (HTTP client)
  - `Gson` (JSON parsing)
  - `Coroutines` (async operations)
- **Package Manager**: Maven, Gradle
- **Distribution**: Maven Central, JitPack

#### Web SDK (TypeScript)
- **Language**: TypeScript 5.0+
- **Target**: ES2020+
- **Dependencies**:
  - `fetch` API (built-in)
  - No external dependencies (or minimal)
- **Package Manager**: npm, yarn, pnpm
- **Distribution**: npm Registry

#### React Native SDK (TypeScript)
- **Language**: TypeScript 5.0+
- **RN Version**: 0.70+
- **Dependencies**:
  - `@react-native-async-storage/async-storage`
  - `@react-native-community/netinfo`
- **Package Manager**: npm
- **Distribution**: npm Registry

#### Flutter SDK (Dart) - Existing
- **Language**: Dart 3.0+
- **Flutter Version**: 3.0+
- **Dependencies**: `dio`, `shared_preferences`, etc.
- **Package Manager**: pub.dev
- **Distribution**: pub.dev

---

## 4. Build & Distribution

### Build Tools

#### iOS
```bash
# Build framework
xcodebuild -scheme DevBridgeSDK -configuration Release

# Create XCFramework
xcodebuild -create-xcframework \
  -framework build/Release-iphoneos/DevBridgeSDK.framework \
  -framework build/Release-iphonesimulator/DevBridgeSDK.framework \
  -output DevBridgeSDK.xcframework
```

#### Android
```bash
# Build AAR
./gradlew assembleRelease

# Publish to Maven Local
./gradlew publishToMavenLocal

# Publish to Maven Central
./gradlew publish
```

#### Web
```bash
# Build
npm run build

# Publish
npm publish
```

### Distribution Channels

#### iOS
1. **CocoaPods** (Primary)
   ```ruby
   pod 'DevBridgeSDK', '~> 1.0.0'
   ```

2. **Swift Package Manager** (SPM)
   ```swift
   dependencies: [
       .package(url: "https://github.com/yourorg/devbridge-sdk-ios", from: "1.0.0")
   ]
   ```

3. **Carthage** (Optional)
   ```json
   {
       "1.0.0": "https://github.com/yourorg/devbridge-sdk-ios/releases/download/1.0.0/DevBridgeSDK.framework.zip"
   }
   ```

#### Android
1. **Maven Central** (Primary)
   ```gradle
   implementation 'com.devbridge:sdk:1.0.0'
   ```

2. **JitPack** (Fallback)
   ```gradle
   implementation 'com.github.yourorg:devbridge-sdk-android:1.0.0'
   ```

#### Web
1. **npm Registry** (Primary)
   ```bash
   npm install @devbridge/sdk
   ```

2. **CDN** (Optional)
   ```html
   <script src="https://cdn.devbridge.com/sdk/v1.0.0/devbridge-sdk.min.js"></script>
   ```

---

## 5. Versioning Strategy

### Semantic Versioning (SemVer)

**Format**: `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking API changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Unified Versioning

**Strategy**: All SDKs share the same version number

```
v1.0.0 - All SDKs release together
├── iOS SDK v1.0.0
├── Android SDK v1.0.0
├── Web SDK v1.0.0
└── Flutter SDK v1.0.0
```

**Benefits**:
- ✅ Easier to track compatibility
- ✅ Consistent documentation
- ✅ Simplified support

**Exception**: Platform-specific hotfixes can use patch versions
```
v1.0.0 → v1.0.1 (iOS hotfix only)
v1.0.0 → v1.0.2 (Android hotfix only)
```

### Version File Structure

```
devbridge/
├── VERSION                    # Single source of truth
├── packages/sdk-ios/
│   └── DevBridgeSDK.podspec  # References VERSION
├── packages/sdk-android/
│   └── build.gradle          # References VERSION
└── packages/sdk-web/
    └── package.json          # References VERSION
```

### Version Bump Script

```bash
#!/bin/bash
# scripts/version-bump.sh

VERSION=$1
echo $VERSION > VERSION

# Update iOS
sed -i '' "s/s.version.*=.*/s.version = \"$VERSION\"/" packages/sdk-ios/DevBridgeSDK.podspec

# Update Android
sed -i '' "s/versionName.*/versionName \"$VERSION\"/" packages/sdk-android/build.gradle

# Update Web
npm version $VERSION --prefix packages/sdk-web

# Update Flutter
sed -i '' "s/version:.*/version: $VERSION/" packages/sdk-flutter/pubspec.yaml
```

---

## 6. Sample Apps

### Sample App Structure

Each SDK should include a sample app for testing:

```
packages/sdk-ios/
└── SampleApp/
    ├── SampleApp.xcodeproj
    ├── SampleApp/
    │   ├── AppDelegate.swift
    │   ├── ViewController.swift
    │   └── Info.plist
    └── README.md
```

### Sample App Features

**Minimum Features**:
1. ✅ SDK initialization
2. ✅ Device registration
3. ✅ API tracking (make test API calls)
4. ✅ Logging (send test logs)
5. ✅ Crash reporting (trigger test crash)
6. ✅ Business config (fetch and display)
7. ✅ Localization (switch languages)

**Advanced Features**:
- Session tracking visualization
- Real-time event stream
- Configuration UI
- Debug mode toggle

### Sample App Locations

| Platform | Location | Purpose |
|----------|----------|---------|
| iOS | `packages/sdk-ios/SampleApp/` | Manual testing, demos |
| Android | `packages/sdk-android/sample-app/` | Manual testing, demos |
| Web | `packages/sdk-web/examples/` | Interactive demos |
| React Native | `packages/sdk-react-native/example/` | Integration testing |
| Flutter | `packages/sdk-flutter/example/` | Integration testing |

---

## 7. Development Workflow

### Development Setup

#### Prerequisites
- **iOS**: Xcode 15+, CocoaPods
- **Android**: Android Studio, JDK 17+, Gradle
- **Web**: Node.js 18+, npm/yarn
- **Flutter**: Flutter 3.0+, Dart 3.0+

#### Initial Setup

```bash
# Clone repository
git clone https://github.com/yourorg/devbridge.git
cd devbridge

# Install dependencies
npm install                    # Root dependencies
cd packages/sdk-ios && pod install
cd packages/sdk-android && ./gradlew build
cd packages/sdk-web && npm install
cd packages/sdk-flutter && flutter pub get
```

### Development Process

#### 1. Feature Development

```bash
# Create feature branch
git checkout -b feature/ios-api-tracking

# Make changes
# ... edit code ...

# Test locally
cd packages/sdk-ios
xcodebuild test

# Commit
git commit -m "feat(ios): Add API tracking support"
```

#### 2. Cross-Platform Consistency

**Shared API Contract**:
- All SDKs must implement the same API methods
- Same initialization flow
- Same configuration options
- Same event structure

**API Reference** (Shared):
```typescript
// Shared API interface (documentation only)
interface DevBridgeSDK {
  init(apiKey: string, options?: InitOptions): Promise<void>
  trackApiTrace(trace: ApiTrace): void
  log(level: LogLevel, tag: string, message: string): void
  reportCrash(error: Error): void
  getBusinessConfig(key: string): any
  getTranslation(key: string): string
}
```

#### 3. Testing

**Unit Tests**: Platform-specific
**Integration Tests**: Against real backend
**E2E Tests**: Sample apps

---

## 8. CI/CD Pipeline

### GitHub Actions Workflows

#### Build Workflows (Per Platform)

**`.github/workflows/build-ios.yml`**:
```yaml
name: Build iOS SDK

on:
  push:
    branches: [main, develop]
    paths:
      - 'packages/sdk-ios/**'
  pull_request:
    paths:
      - 'packages/sdk-ios/**'

jobs:
  build:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build
        run: |
          cd packages/sdk-ios
          xcodebuild -scheme DevBridgeSDK -configuration Release
      - name: Run Tests
        run: |
          xcodebuild test -scheme DevBridgeSDK
```

**`.github/workflows/build-android.yml`**:
```yaml
name: Build Android SDK

on:
  push:
    branches: [main, develop]
    paths:
      - 'packages/sdk-android/**'
  pull_request:
    paths:
      - 'packages/sdk-android/**'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-java@v3
        with:
          java-version: '17'
      - name: Build
        run: |
          cd packages/sdk-android
          ./gradlew assembleRelease
      - name: Run Tests
        run: |
          ./gradlew test
```

**`.github/workflows/build-web.yml`**:
```yaml
name: Build Web SDK

on:
  push:
    branches: [main, develop]
    paths:
      - 'packages/sdk-web/**'
  pull_request:
    paths:
      - 'packages/sdk-web/**'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install
        run: |
          cd packages/sdk-web
          npm install
      - name: Build
        run: |
          npm run build
      - name: Test
        run: |
          npm test
```

### Release Workflow

**`.github/workflows/release.yml`**:
```yaml
name: Release SDKs

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Release iOS
        run: |
          cd packages/sdk-ios
          pod trunk push DevBridgeSDK.podspec
      
      - name: Release Android
        run: |
          cd packages/sdk-android
          ./gradlew publish
      
      - name: Release Web
        run: |
          cd packages/sdk-web
          npm publish
      
      - name: Release Flutter
        run: |
          cd packages/sdk-flutter
          flutter pub publish
```

---

## 9. Testing Strategy

### Test Types

#### 1. Unit Tests
- **Coverage**: >80% for core logic
- **Platform**: Platform-specific test frameworks
  - iOS: XCTest
  - Android: JUnit
  - Web: Jest/Vitest
  - Flutter: flutter_test

#### 2. Integration Tests
- **Purpose**: Test against real backend
- **Setup**: Test API key, test project
- **Scope**: End-to-end flows (init → track → send)

#### 3. Sample App Tests
- **Purpose**: Manual testing, demos
- **Scope**: All SDK features
- **Frequency**: Before each release

### Test Matrix

| Platform | Unit Tests | Integration Tests | E2E Tests |
|----------|------------|------------------|-----------|
| iOS | ✅ XCTest | ✅ XCUITest | ✅ Sample App |
| Android | ✅ JUnit | ✅ Espresso | ✅ Sample App |
| Web | ✅ Jest | ✅ Playwright | ✅ Examples |
| Flutter | ✅ flutter_test | ✅ Integration Test | ✅ Example App |

---

## 10. Documentation

### Documentation Structure

```
docs/
├── sdk/
│   ├── overview.md              # SDK overview
│   ├── getting-started.md       # Quick start guide
│   ├── api-reference.md         # API documentation
│   │
│   ├── ios/
│   │   ├── installation.md
│   │   ├── quick-start.md
│   │   ├── api-reference.md
│   │   └── examples.md
│   │
│   ├── android/
│   │   ├── installation.md
│   │   ├── quick-start.md
│   │   ├── api-reference.md
│   │   └── examples.md
│   │
│   ├── web/
│   │   ├── installation.md
│   │   ├── quick-start.md
│   │   ├── api-reference.md
│   │   └── examples.md
│   │
│   └── flutter/                 # Existing
│       └── ...
│
└── architecture/
    ├── SDK_ARCHITECTURE_FLOW.md  # Existing
    └── ...
```

### Documentation Requirements

**Per Platform**:
1. ✅ Installation guide
2. ✅ Quick start (5-minute setup)
3. ✅ API reference (all methods)
4. ✅ Examples (common use cases)
5. ✅ Troubleshooting guide
6. ✅ Migration guide (if applicable)

**Shared**:
1. ✅ Architecture overview
2. ✅ API contract (shared interface)
3. ✅ Best practices
4. ✅ Security guidelines

---

## 11. Workspace Management

### Cursor Workspace Setup

#### Option A: Single Workspace (Recommended)

**`.cursor/workspace.json`**:
```json
{
  "folders": [
    {
      "path": ".",
      "name": "DevBridge Monorepo"
    },
    {
      "path": "./packages/sdk-ios",
      "name": "iOS SDK"
    },
    {
      "path": "./packages/sdk-android",
      "name": "Android SDK"
    },
    {
      "path": "./packages/sdk-web",
      "name": "Web SDK"
    },
    {
      "path": "./packages/sdk-flutter",
      "name": "Flutter SDK"
    },
    {
      "path": "./dashboard",
      "name": "Dashboard"
    }
  ],
  "settings": {
    "files.exclude": {
      "**/node_modules": true,
      "**/build": true,
      "**/.gradle": true,
      "**/DerivedData": true
    }
  }
}
```

**Benefits**:
- ✅ Single Cursor window
- ✅ Easy code navigation across SDKs
- ✅ Shared search across all packages
- ✅ Consistent settings

#### Option B: Separate Workspaces (If Needed)

**`.cursor/workspaces/`**:
```
workspaces/
├── ios.code-workspace
├── android.code-workspace
├── web.code-workspace
└── flutter.code-workspace
```

**When to Use**:
- Very large codebase
- Platform-specific team members
- Need to isolate builds

**Recommendation**: **Start with Option A**, switch to Option B if needed.

### Development Workflow with Cursor

#### Single Window Workflow

1. **Open Monorepo**: `File → Open Folder → devbridge/`
2. **Navigate**: Use Cursor's file explorer or `Cmd+P` to jump between SDKs
3. **Search**: `Cmd+Shift+F` searches across all packages
4. **Terminal**: Use integrated terminal, `cd` to specific package

#### Multi-Window Workflow (If Needed)

1. **Open Main Window**: Dashboard + shared code
2. **Open iOS Window**: `File → New Window → Open Folder → packages/sdk-ios`
3. **Open Android Window**: `File → New Window → Open Folder → packages/sdk-android`
4. **Sync**: Changes sync automatically via git

### Cursor Agent Strategy

#### Single Agent (Recommended)

**Use one Cursor agent for the entire monorepo**:
- ✅ Context awareness across all SDKs
- ✅ Can suggest consistent patterns
- ✅ Understands shared code
- ✅ Better at cross-platform consistency

#### Multiple Agents (Not Recommended)

**Why not**:
- ❌ No shared context
- ❌ Harder to maintain consistency
- ❌ More complex setup
- ❌ Potential conflicts

**Exception**: If working on completely different features simultaneously, you might use separate Cursor windows, but still one agent per window.

---

## Implementation Roadmap

### Phase 1: Setup (Week 1)

- [ ] Create monorepo structure
- [ ] Set up Git repository
- [ ] Configure Cursor workspace
- [ ] Create shared documentation structure
- [ ] Set up CI/CD basics

### Phase 2: iOS SDK (Week 2-3)

- [ ] Create iOS SDK project structure
- [ ] Implement core features (init, device, traces)
- [ ] Add unit tests
- [ ] Create sample app
- [ ] Write documentation

### Phase 3: Android SDK (Week 4-5)

- [ ] Create Android SDK project structure
- [ ] Implement core features (init, device, traces)
- [ ] Add unit tests
- [ ] Create sample app
- [ ] Write documentation

### Phase 4: Web SDK (Week 6-7)

- [ ] Create Web SDK project structure
- [ ] Implement core features (init, device, traces)
- [ ] Add unit tests
- [ ] Create examples
- [ ] Write documentation

### Phase 5: React Native SDK (Week 8-9)

- [ ] Create React Native SDK project structure
- [ ] Implement core features
- [ ] Add unit tests
- [ ] Create example app
- [ ] Write documentation

### Phase 6: Polish & Release (Week 10)

- [ ] Cross-platform testing
- [ ] Documentation review
- [ ] Sample apps polish
- [ ] Release v1.0.0

---

## Key Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Repository Structure** | Monorepo | Better code sharing, consistency |
| **Workspace Management** | Single Cursor workspace | Easier navigation, shared context |
| **Versioning** | Unified versioning | Easier tracking, consistent docs |
| **Distribution** | Platform-native (CocoaPods, Maven, npm) | Standard practice, easier adoption |
| **CI/CD** | GitHub Actions | Free, integrated, flexible |
| **Testing** | Unit + Integration + E2E | Comprehensive coverage |

---

## Next Steps

1. **Review this plan** with the team
2. **Set up monorepo structure** (if not exists)
3. **Create Cursor workspace** configuration
4. **Start with iOS SDK** (most mature platform)
5. **Iterate and refine** based on learnings

---

## Questions?

- **Q: Should we use separate repos?**
  - A: Start with monorepo, split later if needed.

- **Q: How do we handle platform-specific bugs?**
  - A: Use patch versions (v1.0.1 for iOS only).

- **Q: Can we use one Cursor agent for all SDKs?**
  - A: Yes, recommended for consistency.

- **Q: How do we test cross-platform?**
  - A: Integration tests against shared backend, manual testing with sample apps.

