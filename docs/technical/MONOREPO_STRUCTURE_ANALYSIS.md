# DevBridge Monorepo Structure Analysis

**Date**: December 2024  
**Status**: Analysis Complete

---

## Executive Summary

Based on the documentation review, DevBridge is planned to be a **monorepo** containing multiple SDK packages and the dashboard. Currently, the workspace only contains the **Dashboard (Next.js)** project. The **Flutter SDK** exists but is located outside this workspace.

---

## Current State

### ✅ What Exists in This Workspace

```
/Users/karim-f/Code/devbridge/
├── src/                    # Dashboard Next.js app (at root)
├── prisma/                 # Database schema
├── docs/                   # Documentation
├── scripts/                # Utility scripts
├── package.json            # Root package.json
├── pnpm-workspace.yaml     # Workspace config (minimal)
└── ... (other config files)
```

**Current Structure**: Single Next.js project at root level

### ❌ What's Missing

1. **`packages/` directory** - Should contain all SDK packages
2. **`dashboard/` directory** - Dashboard should be moved here
3. **Flutter SDK** - Currently at `/Users/karim-f/Code/merchant-mobile-app/packages/devbridge_sdk` (outside workspace)
4. **All other SDKs** - iOS, Android, Web, React Native, Unity (not created yet)

---

## Desired Monorepo Structure

According to `docs/SDK_DEVELOPMENT_PLAN.md`, the structure should be:

```
devbridge/
├── packages/                    # ⚠️ MISSING
│   ├── sdk-ios/                # 🔴 Not Started
│   │   ├── DevBridgeSDK/
│   │   ├── DevBridgeSDK.podspec
│   │   ├── Tests/
│   │   └── SampleApp/
│   │
│   ├── sdk-android/            # 🔴 Not Started
│   │   ├── devbridge-sdk/
│   │   ├── build.gradle
│   │   ├── src/
│   │   └── sample-app/
│   │
│   ├── sdk-web/                # 🔴 Not Started
│   │   ├── src/
│   │   ├── dist/
│   │   ├── package.json
│   │   └── examples/
│   │
│   ├── sdk-react-native/       # 🔴 Not Started
│   │   ├── src/
│   │   ├── ios/
│   │   ├── android/
│   │   ├── package.json
│   │   └── example/
│   │
│   ├── sdk-flutter/            # 🟡 Exists but in wrong location
│   │   ├── lib/
│   │   ├── pubspec.yaml
│   │   └── example/
│   │
│   └── sdk-unity/              # 🔴 Not Started
│       ├── Runtime/
│       ├── package.json
│       └── Samples/
│
├── dashboard/                  # ⚠️ Should be moved here
│   ├── src/                    # Currently at root
│   ├── prisma/                 # Currently at root
│   ├── package.json
│   └── ...
│
├── docs/                       # ✅ Exists
│   ├── sdk/                    # ⚠️ Should have platform-specific docs
│   │   ├── ios/
│   │   ├── android/
│   │   ├── web/
│   │   └── flutter/
│   └── ...
│
├── scripts/                    # ✅ Exists
│   ├── build-all.sh            # ⚠️ Missing
│   ├── release.sh              # ⚠️ Missing
│   └── version-bump.sh        # ⚠️ Missing
│
├── .github/
│   └── workflows/              # ⚠️ Missing CI/CD workflows
│       ├── build-ios.yml
│       ├── build-android.yml
│       ├── build-web.yml
│       └── release.yml
│
├── package.json                # ✅ Exists (needs workspace config)
├── pnpm-workspace.yaml         # ✅ Exists (needs proper config)
└── README.md                   # ✅ Exists
```

---

## Detailed Breakdown

### 1. Packages Directory (`packages/`)

**Status**: ❌ **MISSING**

**Should Contain**:
- `sdk-ios/` - iOS SDK (Swift)
- `sdk-android/` - Android SDK (Kotlin)
- `sdk-web/` - Web SDK (TypeScript)
- `sdk-react-native/` - React Native SDK (TypeScript)
- `sdk-flutter/` - Flutter SDK (Dart) - **Currently at**: `/Users/karim-f/Code/merchant-mobile-app/packages/devbridge_sdk`
- `sdk-unity/` - Unity SDK (C#)

**Action Required**: Create `packages/` directory and move/migrate SDKs

---

### 2. Dashboard Directory (`dashboard/`)

**Status**: ⚠️ **NEEDS REORGANIZATION**

**Current Location**: Root of workspace (`/Users/karim-f/Code/devbridge/src/`)

**Should Be**: `/Users/karim-f/Code/devbridge/dashboard/`

**Files to Move**:
- `src/` → `dashboard/src/`
- `prisma/` → `dashboard/prisma/`
- `package.json` → `dashboard/package.json`
- `next.config.ts` → `dashboard/next.config.ts`
- `tsconfig.json` → `dashboard/tsconfig.json`
- Other Next.js config files

**Action Required**: Reorganize dashboard into `dashboard/` directory

---

### 3. Flutter SDK

**Status**: 🟡 **EXISTS BUT IN WRONG LOCATION**

**Current Location**: `/Users/karim-f/Code/merchant-mobile-app/packages/devbridge_sdk`

**Should Be**: `/Users/karim-f/Code/devbridge/packages/sdk-flutter/`

**Action Required**: 
- Option A: Move Flutter SDK to monorepo
- Option B: Keep separate but add as workspace reference (not recommended for monorepo)

---

### 4. Workspace Configuration

**Current `pnpm-workspace.yaml`**:
```yaml
ignoredBuiltDependencies:
  - '@prisma/engines'
  - bufferutil
  - prisma
```

**Should Be**:
```yaml
packages:
  - 'dashboard'
  - 'packages/*'

ignoredBuiltDependencies:
  - '@prisma/engines'
  - bufferutil
  - prisma
```

**Action Required**: Update `pnpm-workspace.yaml` to include workspace packages

---

### 5. Root Package.json

**Current**: Contains dashboard scripts and dependencies

**Should Include**:
- Workspace management scripts
- Shared dev dependencies
- Version management scripts

**Action Required**: Update root `package.json` for monorepo structure

---

### 6. CI/CD Workflows

**Status**: ❌ **MISSING**

**Should Have**:
- `.github/workflows/build-ios.yml`
- `.github/workflows/build-android.yml`
- `.github/workflows/build-web.yml`
- `.github/workflows/release.yml`

**Action Required**: Create GitHub Actions workflows for each SDK

---

### 7. Shared Scripts

**Status**: ⚠️ **PARTIAL**

**Exists**: `scripts/` directory with various utility scripts

**Missing**:
- `scripts/build-all.sh` - Build all SDKs
- `scripts/release.sh` - Release all SDKs
- `scripts/version-bump.sh` - Bump version across all packages

**Action Required**: Create shared build/release scripts

---

### 8. Documentation Structure

**Status**: ⚠️ **NEEDS REORGANIZATION**

**Current**: `docs/` contains general documentation

**Should Have**:
```
docs/
├── sdk/
│   ├── overview.md
│   ├── getting-started.md
│   ├── api-reference.md
│   ├── ios/
│   ├── android/
│   ├── web/
│   ├── react-native/
│   └── flutter/
└── architecture/
```

**Action Required**: Reorganize docs to include platform-specific SDK documentation

---

## Platform Status Matrix

| Platform | Language | Status | Location |
|----------|----------|--------|----------|
| **Dashboard** | TypeScript/Next.js | ✅ Exists | Root (should be `dashboard/`) |
| **Flutter SDK** | Dart | 🟡 Exists | External (`/Users/karim-f/Code/merchant-mobile-app/packages/devbridge_sdk`) |
| **iOS SDK** | Swift | 🔴 Not Started | Missing |
| **Android SDK** | Kotlin | 🔴 Not Started | Missing |
| **Web SDK** | TypeScript | 🔴 Not Started | Missing |
| **React Native SDK** | TypeScript | 🔴 Not Started | Missing |
| **Unity SDK** | C# | 🔴 Not Started | Missing |

---

## Recommended Next Steps

### Phase 1: Reorganize Existing Code (Week 1)

1. **Create `packages/` directory**
   ```bash
   mkdir -p packages
   ```

2. **Move Dashboard to `dashboard/`**
   ```bash
   # Create dashboard directory structure
   mkdir -p dashboard
   
   # Move files (carefully!)
   mv src dashboard/src
   mv prisma dashboard/prisma
   mv package.json dashboard/package.json
   mv next.config.ts dashboard/next.config.ts
   mv tsconfig.json dashboard/tsconfig.json
   # ... move other Next.js config files
   ```

3. **Update `pnpm-workspace.yaml`**
   ```yaml
   packages:
     - 'dashboard'
     - 'packages/*'
   ```

4. **Update root `package.json`**
   - Add workspace scripts
   - Add shared dev dependencies

### Phase 2: Migrate Flutter SDK (Week 1-2)

1. **Copy Flutter SDK to monorepo**
   ```bash
   cp -r /Users/karim-f/Code/merchant-mobile-app/packages/devbridge_sdk packages/sdk-flutter
   ```

2. **Update Flutter SDK paths**
   - Update any hardcoded paths
   - Update documentation references

3. **Test Flutter SDK in new location**
   ```bash
   cd packages/sdk-flutter
   flutter pub get
   flutter test
   ```

### Phase 3: Set Up New SDKs (Week 2+)

1. **Create iOS SDK** (`packages/sdk-ios/`)
2. **Create Android SDK** (`packages/sdk-android/`)
3. **Create Web SDK** (`packages/sdk-web/`)
4. **Create React Native SDK** (`packages/sdk-react-native/`)
5. **Create Unity SDK** (`packages/sdk-unity/`) (optional)

### Phase 4: Infrastructure (Week 2-3)

1. **Create shared scripts**
   - `scripts/build-all.sh`
   - `scripts/release.sh`
   - `scripts/version-bump.sh`

2. **Set up CI/CD**
   - Create `.github/workflows/` directory
   - Add build workflows for each platform
   - Add release workflow

3. **Update documentation**
   - Reorganize `docs/sdk/` structure
   - Add platform-specific guides

---

## Migration Checklist

### Immediate Actions
- [ ] Create `packages/` directory
- [ ] Create `dashboard/` directory
- [ ] Move dashboard code to `dashboard/`
- [ ] Update `pnpm-workspace.yaml`
- [ ] Update root `package.json`
- [ ] Test dashboard still works after move

### Flutter SDK Migration
- [ ] Copy Flutter SDK to `packages/sdk-flutter/`
- [ ] Update Flutter SDK paths
- [ ] Test Flutter SDK in new location
- [ ] Update documentation references

### Infrastructure Setup
- [ ] Create shared build scripts
- [ ] Create version management script
- [ ] Set up GitHub Actions workflows
- [ ] Reorganize documentation structure

### Future SDKs
- [ ] Create iOS SDK structure
- [ ] Create Android SDK structure
- [ ] Create Web SDK structure
- [ ] Create React Native SDK structure

---

## Key Decisions Needed

1. **Flutter SDK Location**
   - Move to monorepo? (Recommended)
   - Keep separate? (Not recommended for monorepo)

2. **Migration Strategy**
   - Big bang migration? (Move everything at once)
   - Incremental migration? (Move one package at a time)

3. **Version Management**
   - Unified versioning? (All SDKs share version)
   - Independent versioning? (Each SDK has own version)

4. **CI/CD Strategy**
   - Build all SDKs on every commit?
   - Build only changed SDKs?

---

## References

- **SDK Development Plan**: `docs/SDK_DEVELOPMENT_PLAN.md`
- **Developer Guide**: `docs/DEVELOPER_GUIDE.md`
- **PRD**: `docs/PRD.md`
- **Current Flutter SDK**: `/Users/karim-f/Code/merchant-mobile-app/packages/devbridge_sdk`

---

## Questions?

If you need help with:
- Creating the monorepo structure
- Migrating the Flutter SDK
- Setting up workspace configuration
- Creating new SDK packages

Let me know and I can help implement these changes!

