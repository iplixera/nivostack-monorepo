# NivoStack Monorepo Structure - Complete Guide

## Overview

The NivoStack project has been reorganized into a **monorepo structure** to support multiple packages (dashboard and future SDKs) in a single repository. This allows for better code sharing, unified versioning, and easier development.

---

## 📁 Directory Structure

```
nivostack-monorepo/
│
├── 📦 dashboard/                    # NivoStack Studio (Main Application)
│   ├── src/                         # Source code
│   │   ├── app/                     # Next.js App Router
│   │   │   ├── (dashboard)/         # Dashboard pages (protected routes)
│   │   │   ├── api/                 # API endpoints (backend)
│   │   │   ├── login/               # Login page
│   │   │   ├── register/            # Registration page
│   │   │   └── layout.tsx           # Root layout
│   │   ├── components/              # React components
│   │   │   ├── Sidebar.tsx          # Navigation sidebar
│   │   │   ├── AuthProvider.tsx     # Authentication context
│   │   │   └── ...                  # Other UI components
│   │   ├── lib/                     # Utilities & helpers
│   │   │   ├── prisma.ts            # Database client
│   │   │   ├── auth.ts              # Authentication logic
│   │   │   ├── api.ts               # API client utilities
│   │   │   ├── branding.ts          # Branding constants (NEW)
│   │   │   └── ...                  # Other utilities
│   │   └── hooks/                   # React hooks
│   │       └── useDebounce.ts       # Custom hooks
│   ├── prisma/                      # Database schema
│   │   ├── schema.prisma            # Prisma schema definition
│   │   └── seed.ts                  # Database seeding script
│   ├── package.json                 # Dashboard dependencies
│   ├── next.config.ts               # Next.js configuration
│   ├── tsconfig.json                # TypeScript configuration
│   └── eslint.config.mjs            # ESLint configuration
│
├── 📦 packages/                     # SDK Packages (Future)
│   └── (empty - ready for SDKs)
│       # Future packages:
│       # ├── sdk-flutter/           # Flutter SDK
│       # ├── sdk-ios/               # iOS SDK
│       # ├── sdk-android/           # Android SDK
│       # ├── sdk-web/               # Web SDK
│       # └── sdk-react-native/      # React Native SDK
│
├── 📚 docs/                         # Documentation
│   ├── DEVELOPER_GUIDE.md
│   ├── PRD.md
│   ├── SDK_DEVELOPMENT_PLAN.md
│   ├── MONOREPO_STRUCTURE_ANALYSIS.md
│   └── ...                          # Other documentation
│
├── 🔧 scripts/                      # Utility scripts
│   ├── rebrand.ts                   # Rebranding script
│   ├── api-perf-test.py             # Performance tests
│   └── ...                          # Other utility scripts
│
├── tests/                           # Test files
│   ├── api-test-suite.ts
│   └── ...                          # Test suites
│
├── package.json                     # Root workspace config
├── pnpm-workspace.yaml              # pnpm workspace definition
└── devbridge.code-workspace         # VS Code/Cursor workspace config
```

---

## 📦 Package Breakdown

### 1. Dashboard (`dashboard/`)

**Purpose**: The main web application (NivoStack Studio) for monitoring and managing mobile apps.

**Technology Stack**:
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **Authentication**: JWT-based

**Key Components**:

#### `dashboard/src/app/` - Next.js App Router
- **`(dashboard)/`** - Protected dashboard pages
  - Projects management
  - Device monitoring
  - API traces viewing
  - Logs and crashes
  - Settings and configuration
- **`api/`** - Backend API endpoints
  - `/api/auth/*` - Authentication endpoints
  - `/api/devices/*` - Device management
  - `/api/traces/*` - API trace endpoints
  - `/api/logs/*` - Log endpoints
  - `/api/sessions/*` - Session management
  - `/api/sdk-init/*` - SDK initialization endpoint
  - `/api/business-config/*` - Configuration management
  - `/api/localization/*` - Translation management
- **`login/`** - Login page
- **`register/`** - Registration page

#### `dashboard/src/components/` - React Components
- **`Sidebar.tsx`** - Main navigation sidebar
- **`AuthProvider.tsx`** - Authentication context provider
- **`UserProfileDropdown.tsx`** - User menu dropdown
- **`SubscriptionBanner.tsx`** - Subscription status banner
- **`BusinessConfigTab.tsx`** - Business config UI
- **`LocalizationTab.tsx`** - Localization UI
- And many more...

#### `dashboard/src/lib/` - Utilities
- **`prisma.ts`** - Prisma database client
- **`auth.ts`** - JWT authentication utilities
- **`api.ts`** - API client helpers
- **`branding.ts`** - ✨ **NEW** - Centralized branding constants
- **`email.ts`** - Email template utilities
- **`stripe.ts`** - Stripe payment integration

#### `dashboard/prisma/` - Database
- **`schema.prisma`** - Database schema definition
  - Models: User, Project, Device, Session, Log, Crash, ApiTrace, etc.
- **`seed.ts`** - Database seeding script

**Package Name**: `@nivostack/studio`

---

### 2. Packages (`packages/`)

**Purpose**: Directory for all SDK packages (currently empty, ready for SDKs).

**Future Structure**:
```
packages/
├── sdk-flutter/          # Flutter/Dart SDK
│   ├── lib/
│   ├── pubspec.yaml
│   └── example/
│
├── sdk-ios/              # iOS/Swift SDK
│   ├── DevBridgeSDK/
│   ├── DevBridgeSDK.podspec
│   └── Tests/
│
├── sdk-android/          # Android/Kotlin SDK
│   ├── devbridge-sdk/
│   ├── build.gradle
│   └── src/
│
├── sdk-web/              # Web/TypeScript SDK
│   ├── src/
│   ├── dist/
│   └── package.json
│
└── sdk-react-native/     # React Native SDK
    ├── src/
    ├── ios/
    ├── android/
    └── package.json
```

**Current Status**: Empty directory, ready for SDK migration and creation.

---

### 3. Documentation (`docs/`)

**Purpose**: All project documentation.

**Key Documents**:
- **`DEVELOPER_GUIDE.md`** - Developer setup and guidelines
- **`PRD.md`** - Product Requirements Document
- **`SDK_DEVELOPMENT_PLAN.md`** - SDK development roadmap
- **`MONOREPO_STRUCTURE_ANALYSIS.md`** - Monorepo structure analysis
- **`PERFORMANCE_OPTIMIZATION.md`** - Performance optimization docs
- **`DEVICE_DEBUG_MODE.md`** - Device debug mode feature docs
- And many more feature-specific documents

---

### 4. Scripts (`scripts/`)

**Purpose**: Utility scripts for development, testing, and maintenance.

**Key Scripts**:
- **`rebrand.ts`** - Bulk rebranding script (DevBridge → NivoStack)
- **`api-perf-test.py`** - API performance testing
- **`api-concurrent-test.py`** - Concurrent request testing
- **`test-sdk-init.py`** - SDK initialization testing
- **`clean-test-data.ts`** - Test data cleanup
- And many more utility scripts

---

### 5. Tests (`tests/`)

**Purpose**: Test suites and test utilities.

**Key Tests**:
- **`api-test-suite.ts`** - API endpoint tests
- **`admin-plans.test.ts`** - Admin plan tests
- **`admin-subscriptions.test.ts`** - Subscription tests
- **`throttling-test.ts`** - Rate limiting tests
- And more...

---

## 🔧 Configuration Files

### Root Level

#### `package.json` (Root)
- **Purpose**: Workspace manager
- **Key Features**:
  - Defines workspace packages
  - Provides root-level scripts that delegate to workspace packages
  - Minimal dependencies (only shared dev dependencies)

**Example Scripts**:
```json
{
  "scripts": {
    "dev": "pnpm --filter @nivostack/studio dev",
    "build": "pnpm --filter @nivostack/studio build"
  }
}
```

#### `pnpm-workspace.yaml`
- **Purpose**: Defines pnpm workspace structure
- **Configuration**:
```yaml
packages:
  - 'dashboard'
  - 'packages/*'
```

#### `devbridge.code-workspace`
- **Purpose**: VS Code/Cursor workspace configuration
- **Features**:
  - Defines workspace folders
  - Configures file exclusions
  - Sets up editor settings

### Dashboard Level

#### `dashboard/package.json`
- **Package Name**: `@nivostack/studio`
- **Dependencies**: All Next.js, React, Prisma, and other dashboard dependencies
- **Scripts**: Dashboard-specific scripts (dev, build, test, etc.)

#### `dashboard/next.config.ts`
- Next.js configuration
- React strict mode enabled
- Vercel deployment settings

#### `dashboard/tsconfig.json`
- TypeScript configuration
- Path aliases: `@/*` → `./src/*`
- Next.js plugin configuration

---

## 🚀 Development Workflow

### Running the Dashboard

**From Root**:
```bash
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server
```

**From Dashboard Directory**:
```bash
cd dashboard
pnpm dev              # Start development server
pnpm build            # Build for production
```

### Adding a New SDK Package

1. **Create Package Directory**:
   ```bash
   mkdir -p packages/sdk-flutter
   cd packages/sdk-flutter
   ```

2. **Initialize Package**:
   - Create `package.json` or `pubspec.yaml`
   - Set package name (e.g., `@nivostack/core`)

3. **Install Dependencies**:
   ```bash
   pnpm install        # From root - installs all workspace packages
   ```

4. **Workspace Auto-Detection**:
   - `pnpm-workspace.yaml` automatically detects `packages/*`
   - No manual configuration needed

---

## 📊 Benefits of Monorepo Structure

### 1. **Code Sharing**
- Shared types and interfaces
- Common utilities
- Unified API contracts

### 2. **Unified Versioning**
- All packages can share version numbers
- Easier to track compatibility
- Simplified release process

### 3. **Easier Development**
- Single repository to clone
- Shared tooling and configuration
- Cross-package refactoring

### 4. **Better Testing**
- Integration tests across packages
- Shared test utilities
- Unified CI/CD pipeline

### 5. **Simplified Dependency Management**
- Single `pnpm install` for all packages
- Shared dependencies (if needed)
- Easier to manage versions

---

## 🔄 Migration Status

### ✅ Completed
- Dashboard moved to `dashboard/` directory
- Workspace configuration updated
- Package names updated to `@nivostack/*`
- Branding constants created
- UI components rebranded

### ⚠️ In Progress
- Complete rebranding (API routes, docs, scripts)
- Remove old root-level `src/` and `prisma/` directories

### 📋 Planned
- Migrate Flutter SDK to `packages/sdk-flutter/`
- Create iOS SDK (`packages/sdk-ios/`)
- Create Android SDK (`packages/sdk-android/`)
- Create Web SDK (`packages/sdk-web/`)
- Create React Native SDK (`packages/sdk-react-native/`)

---

## 🎯 Key Concepts

### Workspace Packages
- **Dashboard**: `@nivostack/studio` - The main web application
- **Future SDKs**: `@nivostack/core`, `@nivostack/observe`, etc.

### Path Aliases
- In dashboard: `@/*` refers to `dashboard/src/*`
- Example: `import { api } from '@/lib/api'`

### Shared vs Package-Specific
- **Shared**: Documentation, scripts, tests (at root)
- **Package-Specific**: Source code, dependencies (in packages)

---

## 📝 Quick Reference

### File Locations

| What | Where |
|------|-------|
| Dashboard source code | `dashboard/src/` |
| API endpoints | `dashboard/src/app/api/` |
| React components | `dashboard/src/components/` |
| Database schema | `dashboard/prisma/schema.prisma` |
| Branding constants | `dashboard/src/lib/branding.ts` |
| Documentation | `docs/` |
| Utility scripts | `scripts/` |
| SDK packages (future) | `packages/` |

### Common Commands

```bash
# Install all dependencies
pnpm install

# Run dashboard
pnpm dev

# Build dashboard
pnpm build

# Run tests
pnpm test

# Database operations
pnpm db:seed
pnpm db:health
```

---

## 🎨 Workspace View

In your IDE (Cursor/VS Code), you'll see:

```
NivoStack Monorepo
├── 📦 NivoStack Studio          (dashboard/)
│   ├── 💻 Source Code           (dashboard/src/)
│   ├── 🚀 App Routes & API      (dashboard/src/app/)
│   ├── 🧩 Components            (dashboard/src/components/)
│   └── 🗄️ Database              (dashboard/prisma/)
├── 📦 SDK Packages              (packages/)
├── 📚 Documentation             (docs/)
└── 🔧 Scripts                  (scripts/)
```

---

## 🔍 What Changed from Old Structure

### Before (Flat Structure)
```
devbridge/
├── src/              # Source code at root
├── prisma/           # Database at root
├── package.json      # Single package
└── ...
```

### After (Monorepo Structure)
```
nivostack-monorepo/
├── dashboard/        # Dashboard package
│   ├── src/         # Moved from root
│   └── prisma/      # Moved from root
├── packages/         # SDK packages (new)
├── package.json     # Workspace manager
└── ...
```

### Key Changes
1. ✅ Dashboard isolated in `dashboard/` package
2. ✅ Created `packages/` for future SDKs
3. ✅ Root `package.json` is now workspace manager
4. ✅ All paths updated to reflect new structure
5. ✅ Workspace configuration updated

---

This structure provides a solid foundation for scaling NivoStack with multiple SDKs while keeping everything organized and maintainable! 🚀

