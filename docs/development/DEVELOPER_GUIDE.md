# NivoStack Monorepo Developer Guide

Complete guide for setting up, running, and developing in the NivoStack monorepo.

---

## Table of Contents

1. [Repository Overview](#repository-overview)
2. [Git Remotes](#git-remotes)
3. [Monorepo Structure](#monorepo-structure)
4. [Prerequisites](#prerequisites)
5. [Initial Setup](#initial-setup)
6. [Running Projects](#running-projects)
7. [Development Workflow](#development-workflow)
8. [Project-Specific Commands](#project-specific-commands)
9. [Troubleshooting](#troubleshooting)

---

## Repository Overview

**Repository Name:** `nivostack-monorepo`  
**Primary Remote:** `https://github.com/iplixera/nivostack-monorepo.git`  
**Monorepo Manager:** pnpm workspaces

This monorepo contains:
- **NivoStack Studio** (Dashboard) - Next.js web application
- **Flutter SDK** - Mobile SDK for Flutter/Dart
- **Android SDK** - Mobile SDK for Android/Kotlin
- **Shared Documentation** - Technical docs, guides, and PRDs
- **Scripts** - Development and testing utilities

---

## Git Remotes

### Current Remotes

```bash
# Check current remotes
git remote -v
```

**Primary Remote:**
- `origin` → `https://github.com/iplixera/nivostack-monorepo.git`

### Remote Management

```bash
# View all remotes
git remote -v

# Add a new remote
git remote add <name> <url>

# Remove a remote
git remote remove <name>

# Fetch from remote
git fetch <remote-name>

# Push to specific remote
git push <remote-name> <branch>
```

---

## Monorepo Structure

```
nivostack-monorepo/
├── 📦 NivoStack Studio (dashboard/)
│   ├── Next.js 16 application
│   ├── Dashboard UI and API routes
│   ├── Database schema (Prisma)
│   └── Components and pages
│
├── 💻 Source Code (src/)
│   ├── Shared API routes
│   ├── Shared components
│   └── Shared utilities
│
├── 🚀 App Routes & API (dashboard/src/app/api/)
│   ├── Authentication endpoints
│   ├── Device management
│   ├── Session tracking
│   ├── API traces
│   ├── Logs and crashes
│   └── Business config & localization
│
├── 🧩 Components (src/components/ & dashboard/src/components/)
│   ├── React components
│   ├── UI components
│   └── Shared components
│
├── 🗄️ Database (prisma/ & dashboard/prisma/)
│   ├── schema.prisma - Database schema
│   └── seed.ts - Seed data
│
├── 📦 SDK Packages (packages/)
│   ├── sdk-flutter/ - Flutter/Dart SDK
│   │   ├── lib/ - SDK source code
│   │   └── example/ - Example Flutter app
│   │
│   └── sdk-android/ - Android/Kotlin SDK
│       ├── nivostack-core/ - SDK source code
│       └── example/ - Example Android app
│
├── 📚 Documentation (docs/)
│   ├── features/ - Feature documentation
│   ├── guides/ - Setup and development guides
│   ├── technical/ - Technical documentation
│   ├── PRDs/ - Product requirements
│   └── releases/ - Release notes
│
└── 🔧 Scripts (scripts/)
    ├── Testing scripts
    ├── Database utilities
    ├── Performance tests
    └── Deployment scripts
```

### Folder Purpose Summary

| Folder | Purpose | Tech Stack |
|--------|---------|------------|
| `dashboard/` | **NivoStack Studio** - Web dashboard for monitoring and configuration | Next.js 16, React, Tailwind CSS |
| `src/` | **Source Code** - Shared API routes and utilities | Next.js API Routes, TypeScript |
| `packages/sdk-flutter/` | **Flutter SDK** - Mobile SDK for Flutter/Dart apps | Dart, Flutter |
| `packages/sdk-android/` | **Android SDK** - Mobile SDK for Android/Kotlin apps | Kotlin, Gradle |
| `prisma/` | **Database** - Database schema and migrations | Prisma ORM, PostgreSQL |
| `docs/` | **Documentation** - All project documentation | Markdown |
| `scripts/` | **Scripts** - Development and testing utilities | TypeScript, Python, Shell |
| `tests/` | **Tests** - Test suites and utilities | TypeScript |

---

## Prerequisites

### Required Software

1. **Node.js** (v18+)
   ```bash
   node --version  # Should be v18 or higher
   ```

2. **pnpm** (v8+)
   ```bash
   npm install -g pnpm
   pnpm --version  # Should be v8 or higher
   ```

3. **PostgreSQL** (or Supabase account)
   - Local PostgreSQL installation, OR
   - Supabase cloud database

4. **Git**
   ```bash
   git --version
   ```

### Optional (for SDK development)

5. **Flutter** (for Flutter SDK)
   ```bash
   flutter --version
   ```

6. **Android Studio** (for Android SDK)
   - Android SDK
   - Gradle

---

## Initial Setup

### 1. Clone the Repository

```bash
# Clone the repository
git clone https://github.com/iplixera/nivostack-monorepo.git
cd nivostack-monorepo

# Or if you already have it cloned
cd /path/to/nivostack-monorepo-checkout
```

### 2. Install Dependencies

```bash
# Install all dependencies (root + all workspaces)
pnpm install

# This will install:
# - Root dependencies
# - Dashboard dependencies
# - SDK package dependencies
```

### 3. Environment Setup

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your database credentials
# Required variables:
# - POSTGRES_PRISMA_URL
# - POSTGRES_URL_NON_POOLING
# - JWT_SECRET
```

### 4. Database Setup

```bash
# Generate Prisma client
cd dashboard
pnpm prisma generate

# Run database migrations
pnpm prisma db push

# Seed the database (optional)
pnpm db:seed
```

### 5. Verify Setup

```bash
# Check environment variables
pnpm env:check

# Check database health
pnpm db:health
```

---

## Running Projects

### Quick Start Commands

All commands are run from the **root directory** of the monorepo.

#### Start Dashboard (NivoStack Studio)

```bash
# Development mode (with hot reload)
pnpm dev

# This runs: pnpm --filter @nivostack/studio dev
# Dashboard will be available at: http://localhost:3000
```

#### Build Dashboard

```bash
# Production build
pnpm build

# Start production server
pnpm start
```

#### Run Tests

```bash
# Run all tests
pnpm test

# Run manual API tests
pnpm test:manual

# Run throttling tests
pnpm test:throttling

# Create test users
pnpm test:create-users
```

---

## Development Workflow

### Working with Dashboard

```bash
# Navigate to dashboard
cd dashboard

# Run development server
pnpm dev

# Run linting
pnpm lint

# Check environment
pnpm env:check

# Database operations
pnpm prisma studio        # Open Prisma Studio (database GUI)
pnpm prisma db push       # Push schema changes
pnpm db:seed              # Seed database
pnpm db:health            # Check database connection
```

### Working with Flutter SDK

```bash
# Navigate to Flutter SDK
cd packages/sdk-flutter

# Get Flutter dependencies
flutter pub get

# Run example app
cd example
flutter run

# Analyze SDK code
flutter analyze

# Run tests
flutter test
```

### Working with Android SDK

```bash
# Navigate to Android SDK
cd packages/sdk-android

# Build SDK
cd nivostack-core
./gradlew build

# Run example app
cd example
./gradlew installDebug
```

### Working with Scripts

```bash
# Navigate to scripts directory
cd scripts

# Run specific scripts
tsx check-env.sh          # Check environment setup
tsx db-health-check.ts     # Check database health
python3 api-perf-test.py   # Performance testing
```

---

## Project-Specific Commands

### Root Level Commands

All commands use pnpm workspaces to run commands in specific packages.

```bash
# Dashboard commands (from root)
pnpm dev                  # Start dashboard dev server
pnpm build                # Build dashboard
pnpm start                # Start production server
pnpm lint                 # Lint dashboard code
pnpm test                 # Run dashboard tests
pnpm db:seed              # Seed database
pnpm db:health            # Check database health
pnpm env:check            # Check environment variables

# Test commands
pnpm test:manual          # Manual API tests
pnpm test:throttling      # Throttling tests
pnpm test:create-users    # Create test users
pnpm test:plans           # Test admin plans
pnpm test:subscriptions   # Test subscriptions
pnpm test:generate-data   # Generate test data

# Utility commands
pnpm create:expired-disabled  # Create expired subscriptions
pnpm clean:test-data          # Clean test data
```

### Dashboard Commands (from dashboard/)

```bash
cd dashboard

# Development
pnpm dev                  # Start Next.js dev server (port 3000)
pnpm build                # Build for production
pnpm start                # Start production server

# Database
pnpm prisma generate      # Generate Prisma client
pnpm prisma db push       # Push schema to database
pnpm prisma studio        # Open Prisma Studio GUI
pnpm db:seed              # Seed database
pnpm db:health            # Check database health

# Testing
pnpm test                 # Run test suite
pnpm test:manual          # Manual API tests
pnpm test:throttling      # Throttling tests

# Environment
pnpm env:check            # Check environment variables
```

### Flutter SDK Commands (from packages/sdk-flutter/)

```bash
cd packages/sdk-flutter

# Dependencies
flutter pub get           # Get dependencies
flutter pub upgrade       # Upgrade dependencies

# Development
flutter analyze          # Analyze code
flutter format           # Format code

# Example app
cd example
flutter run              # Run example app
flutter run -d <device>  # Run on specific device
flutter build apk        # Build Android APK
flutter build ios        # Build iOS app
```

### Android SDK Commands (from packages/sdk-android/)

```bash
cd packages/sdk-android

# Build SDK
cd nivostack-core
./gradlew build          # Build SDK
./gradlew clean          # Clean build

# Example app
cd example
./gradlew installDebug   # Install debug APK
./gradlew assembleDebug  # Build debug APK
```

---

## Cursor IDE Instructions

### Opening the Workspace

1. **Open Cursor IDE**
2. **File → Open Workspace**
3. **Select:** `devbridge.code-workspace` (or `nivostack-monorepo.code-workspace`)
4. **Click Open**

### Workspace Structure in Cursor

When you open the workspace file, you'll see organized folders:

- **NivoStack Monorepo** - Root directory
- **📦 NivoStack Studio** - Dashboard application
- **💻 Source Code** - Shared source code
- **🚀 App Routes & API** - API routes
- **🧩 Components** - React components
- **🗄️ Database** - Prisma schema
- **📦 SDK Packages** - Flutter & Android SDKs
- **📚 Documentation** - All documentation
- **🔧 Scripts** - Development scripts

### Running Commands in Cursor

#### Using Integrated Terminal

1. **Open Terminal:** `Ctrl + `` (backtick) or `View → Terminal`
2. **Run commands** from root directory:
   ```bash
   pnpm dev              # Start dashboard
   pnpm test             # Run tests
   ```

#### Using Cursor Command Palette

1. **Open Command Palette:** `Cmd + Shift + P` (Mac) or `Ctrl + Shift + P` (Windows/Linux)
2. **Type:** "Terminal: Create New Terminal"
3. **Run commands** in the terminal

### Recommended Cursor Extensions

The workspace file includes recommended extensions:
- `dart-code.dart-code` - Dart/Flutter support
- `ms-vscode.vscode-typescript-next` - TypeScript support

Install them when prompted or manually:
1. `Cmd + Shift + X` to open Extensions
2. Search and install recommended extensions

---

## Troubleshooting

### Common Issues

#### 1. Dependencies Not Installing

```bash
# Clear pnpm cache
pnpm store prune

# Remove node_modules and reinstall
rm -rf node_modules dashboard/node_modules packages/*/node_modules
pnpm install
```

#### 2. Database Connection Issues

```bash
# Check database health
pnpm db:health

# Verify environment variables
pnpm env:check

# Regenerate Prisma client
cd dashboard
pnpm prisma generate
```

#### 3. Port Already in Use

```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
kill -9 $(lsof -ti:3000)

# Or change port in dashboard/package.json
# "dev": "next dev -p 3001"
```

#### 4. Flutter SDK Issues

```bash
# Clean Flutter build
cd packages/sdk-flutter
flutter clean
flutter pub get

# Check Flutter doctor
flutter doctor
```

#### 5. Android SDK Build Issues

```bash
# Clean Gradle build
cd packages/sdk-android/nivostack-core
./gradlew clean

# Rebuild
./gradlew build
```

### Getting Help

1. **Check Documentation:** `docs/` directory
2. **Check Logs:** Console output in terminal
3. **Database Issues:** Use `pnpm db:health`
4. **Environment Issues:** Use `pnpm env:check`

---

## Quick Reference

### Most Common Commands

```bash
# Start development
pnpm dev

# Run tests
pnpm test

# Check database
pnpm db:health

# Check environment
pnpm env:check

# Build for production
pnpm build

# Start production server
pnpm start
```

### File Locations

- **Dashboard:** `dashboard/`
- **API Routes:** `dashboard/src/app/api/`
- **Components:** `dashboard/src/components/`
- **Database Schema:** `dashboard/prisma/schema.prisma`
- **Flutter SDK:** `packages/sdk-flutter/lib/`
- **Android SDK:** `packages/sdk-android/nivostack-core/src/`
- **Documentation:** `docs/`
- **Scripts:** `scripts/`

---

## Next Steps

1. ✅ **Setup Complete** - You've installed dependencies and configured the database
2. 🚀 **Start Development** - Run `pnpm dev` to start the dashboard
3. 📚 **Read Documentation** - Check `docs/` for feature-specific guides
4. 🧪 **Run Tests** - Use `pnpm test` to verify everything works
5. 💻 **Start Coding** - Make changes and see them hot-reload!

---

*Last Updated: December 2025*  
*For questions or issues, check the documentation in `docs/` or create an issue on GitHub.*
