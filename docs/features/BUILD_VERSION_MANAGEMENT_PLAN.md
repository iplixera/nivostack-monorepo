# Build & Version Management System - Implementation Plan

**Feature**: Version Control for Consumer-Managed Features (Business Config & Localization)  
**Date**: December 23, 2025  
**Status**: Planning

---

## 📋 Understanding & Requirements

### Current State
- **Business Configuration**: Stored in `BusinessConfig` table, retrieved via `/api/business-config`
- **Localization**: Stored in `Language`/`Translation` tables, retrieved via `/api/localization/translations`
- Changes are saved immediately to database
- SDK fetches latest data directly from database

### Requirements
1. **Build Creation**: After changes (add/edit/remove), create a "Build" that:
   - Captures **ALL features** at once (Business Config + Localization)
   - Formats data as API response format
   - Assigns version number (auto-increment per project: v1, v2, v3...)
   - User can edit build name/description in the same row
   - Stores as cached JSON (immutable)

2. **Build Management**:
   - View all build versions in 3-column layout
   - Set each build to **Prod Mode** or **Preview Mode**
   - Only **ONE active build per mode** (Preview or Production)
   - Builds can be deleted
   - Build name/description can be edited inline

3. **SDK Behavior**:
   - **Debug builds** → Fetch from active Preview Mode build
   - **Release builds** → Fetch from active Production Mode build
   - Builds are immutable (cached), never change once created
   - SDK fetches entire build (all features together)

4. **Change Tracking**:
   - Logger service tracks all changes (added/deleted/changed)
   - Track which user made changes
   - Build comparison/diff view to show changes between builds

5. **Design**:
   - Generic system applicable to all consumer-managed features
   - Currently: Business Config & Localization
   - Future: Any feature requiring version control

---

## 🏗️ Architecture Overview

### Core Concepts

```
Project
  └── Builds (Version History)
       ├── Build v1 (Preview Mode)
       ├── Build v2 (Preview Mode) ← Active Preview
       ├── Build v3 (Production Mode) ← Active Production
       └── Build v4 (Preview Mode)
       
Each Build Contains:
  ├── BusinessConfig Snapshot (JSON)
  └── Localization Snapshot (JSON)
```

### Data Flow

```
1. Consumer makes changes → Saved to database (draft state)
2. Consumer clicks "Build" → Creates immutable snapshot
3. Consumer sets build mode → Prod or Preview
4. SDK requests data:
   - Debug build → GET /api/builds/preview
   - Release build → GET /api/builds/production
5. API returns cached build data (never changes)
```

---

## 📊 Database Schema

### New Models

```prisma
// Build - Version snapshot of consumer-managed features
model Build {
  id              String   @id @default(cuid())
  projectId      String
  project        Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  version        Int       // Auto-increment per project (v1, v2, v3...)
  mode           String    // "preview" | "production" | null (unassigned)
  isActive       Boolean   @default(false) // Active for its mode
  description    String?   // Optional build description/notes
  createdBy      String?   // User ID who created the build
  createdAt      DateTime  @default(now())
  
  // Snapshot data (immutable JSON)
  businessConfigSnapshot Json?  // Cached business config API response
  localizationSnapshot  Json?  // Cached localization API response
  
  // Metadata
  configCount    Int       @default(0) // Number of configs in snapshot
  translationCount Int     @default(0) // Number of translations in snapshot
  
  @@unique([projectId, version])
  @@index([projectId])
  @@index([projectId, mode, isActive])
  @@index([createdAt])
}

// Build Feature - Links builds to feature types (for extensibility)
model BuildFeature {
  id              String   @id @default(cuid())
  buildId         String
  build           Build     @relation(fields: [buildId], references: [id], onDelete: Cascade)
  featureType    String    // "business_config" | "localization" | future features
  snapshotData    Json      // Feature-specific snapshot data
  itemCount       Int       // Number of items in this feature snapshot
  createdAt       DateTime  @default(now())
  
  @@unique([buildId, featureType])
  @@index([buildId])
  @@index([featureType])
}
```

### Updated Models

```prisma
// Add build relation to Project
model Project {
  // ... existing fields
  builds          Build[]
}

// Optional: Track which build is currently active for each mode
// (Can be derived from Build.isActive, but this makes queries faster)
model BuildMode {
  id              String   @id @default(cuid())
  projectId       String   @unique
  project         Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  previewBuildId  String?   // Currently active preview build
  productionBuildId String? // Currently active production build
  updatedAt       DateTime  @updatedAt
  
  previewBuild    Build?    @relation("PreviewBuild", fields: [previewBuildId], references: [id])
  productionBuild Build?    @relation("ProductionBuild", fields: [productionBuildId], references: [id])
}

// Update Build model to add relations
model Build {
  // ... existing fields
  previewMode    BuildMode? @relation("PreviewBuild")
  productionMode BuildMode? @relation("ProductionBuild")
  features       BuildFeature[]
}
```

---

## 🔧 Implementation Plan

### Phase 1: Database Schema & Service Layer

**Task 1.1**: Create database models
- Add `Build` model
- Add `BuildFeature` model (for extensibility)
- Add `BuildMode` model (for quick lookups)
- Update `Project` model with relations
- Run migration

**Task 1.2**: Create build service utilities
- `src/lib/build.ts`:
  - `createBuild(projectId, description?)` - Create new build snapshot
  - `getBuild(projectId, version)` - Get specific build
  - `getActiveBuild(projectId, mode)` - Get active build for mode
  - `setBuildMode(projectId, buildId, mode)` - Set build to prod/preview
  - `getBuildHistory(projectId)` - List all builds
  - `snapshotBusinessConfig(projectId)` - Capture business config state
  - `snapshotLocalization(projectId)` - Capture localization state

**Task 1.3**: Build snapshot logic
- Capture current state of BusinessConfig (all enabled configs)
- Capture current state of Localization (all languages/translations)
- Format as API response format (same as SDK receives)
- Store as immutable JSON

---

### Phase 2: API Endpoints

**Task 2.1**: Build Management API
- `POST /api/builds` - Create new build
  - Body: `{ projectId, description? }`
  - Creates snapshot of current state
  - Returns: `{ build: { id, version, createdAt, ... } }`

- `GET /api/builds?projectId=X` - List all builds
  - Returns: `{ builds: [...] }` sorted by version desc

- `GET /api/builds/[id]` - Get specific build details
  - Returns: `{ build: { ...full details... } }`

- `PATCH /api/builds/[id]/mode` - Set build mode
  - Body: `{ mode: "preview" | "production" }`
  - Sets build as active for that mode
  - Deactivates previous build in same mode

**Task 2.2**: SDK Build Retrieval API
- `GET /api/builds/preview?x-api-key=XXX` - Get active preview build
  - Returns cached business config + localization data
  - Used by debug builds

- `GET /api/builds/production?x-api-key=XXX` - Get active production build
  - Returns cached business config + localization data
  - Used by release builds

- `GET /api/builds/[version]?x-api-key=XXX` - Get specific build version
  - Optional: Allow fetching specific version for testing

**Task 2.3**: Backward Compatibility
- Keep existing `/api/business-config` and `/api/localization/translations` endpoints
- They continue to work (fetch from database)
- New SDK can use build endpoints for versioned data

---

### Phase 3: UI Components

**Task 3.1**: Build Button & Status
- Add "Build Changes" button to Business Config tab
- Add "Build Changes" button to Localization tab
- Show current active builds (Preview: v2, Production: v3)
- Show pending changes indicator (unsaved changes exist)

**Task 3.2**: Build Management Page
- Route: `/projects/[id]/builds`
- 3-column layout:
  - **Left**: Build History (list of all builds)
  - **Middle**: Build Details (selected build info)
  - **Right**: Mode Assignment (set to Preview/Production)

**Task 3.3**: Build History View
- Table/list of all builds:
  - Version number
  - Created date/time
  - Description
  - Mode (Preview/Production/Unassigned)
  - Active status
  - Config count, Translation count
  - Created by user

**Task 3.4**: Build Details View
- Show build metadata
- Show snapshot summary (configs, translations)
- Show mode assignment controls
- Show "View Data" button (preview JSON)

**Task 3.5**: Mode Assignment UI
- Radio buttons or toggle: Preview / Production
- "Set as Active" button
- Confirmation dialog
- Visual indicators (badges) for active builds

**Task 3.6**: Generic Feature Support
- Design UI to be extensible
- Use feature type constants: `["business_config", "localization"]`
- Future features can be added without UI changes

---

### Phase 4: Integration & Updates

**Task 4.1**: Update Business Config Tab
- Add "Build Changes" button (top right)
- Show build status indicator
- Disable build button if no changes since last build
- Show success message after build creation

**Task 4.2**: Update Localization Tab
- Add "Build Changes" button
- Same behavior as Business Config

**Task 4.3**: Update SDK Init Endpoint
- Add build mode detection (debug vs release)
- Optionally return build version info
- Keep backward compatibility

**Task 4.4**: Navigation Updates
- Add "Builds" link to project detail page
- Add to project tabs/sidebar

---

### Phase 5: Caching & Performance

**Task 5.1**: Build Data Caching
- Build snapshots stored as JSON in database
- No recalculation needed
- Fast retrieval for SDK

**Task 5.2**: API Response Caching
- Cache build API responses (Vercel Edge Cache)
- Set long cache headers for build endpoints
- Invalidate only when new build is created

**Task 5.3**: Database Indexes
- Index on `[projectId, mode, isActive]` for fast lookups
- Index on `[projectId, version]` for build history

---

## 🎨 UI/UX Design

### Build Management Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Build Management                    [Create New Build]     │
├──────────────┬──────────────────────┬──────────────────────┤
│              │                      │                      │
│  Build       │   Build Details      │   Mode Assignment   │
│  History     │                      │                      │
│              │   Version: v3        │   [ ] Preview       │
│  v4 (Preview)│   Created: ...       │   [✓] Production    │
│  v3 (Prod) ✓ │   Configs: 15        │                      │
│  v2 (Preview)│   Translations: 45  │   [Set as Active]   │
│  v1          │                      │                      │
│              │   [View Data]        │                      │
│              │                      │                      │
└──────────────┴──────────────────────┴──────────────────────┘
```

### Build Button States

- **No Changes**: Button disabled, "No changes to build"
- **Has Changes**: Button enabled, "Build Changes (2 configs, 5 translations)"
- **Building**: Button disabled, "Creating build..."
- **Success**: Show toast, "Build v5 created successfully"

---

## 🔄 Workflow

### Creating a Build

1. User makes changes in Business Config or Localization
2. Changes saved to database (draft state)
3. User clicks "Build Changes"
4. System:
   - Gets next version number for project
   - Captures current state of all features
   - Formats as API response format
   - Creates Build record with snapshots
   - Returns build info
5. User sees success message
6. User navigates to Builds page to assign mode

### Setting Build Mode

1. User goes to Builds page
2. Selects a build from history
3. Chooses mode (Preview or Production)
4. Clicks "Set as Active"
5. System:
   - Sets build.mode = selected mode
   - Sets build.isActive = true
   - Deactivates previous build in same mode
   - Updates BuildMode record
6. SDK now fetches from this build

### SDK Fetching Data

1. SDK determines build type (debug/release)
2. Debug → `GET /api/builds/preview?x-api-key=XXX`
3. Release → `GET /api/builds/production?x-api-key=XXX`
4. API returns cached build data (never changes)
5. SDK caches response locally

---

## 📝 API Response Formats

### Build Creation Response
```json
{
  "build": {
    "id": "build_xxx",
    "version": 5,
    "projectId": "proj_xxx",
    "mode": null,
    "isActive": false,
    "description": "Added new feature flags",
    "configCount": 15,
    "translationCount": 45,
    "createdAt": "2025-12-23T10:30:00Z",
    "createdBy": "user_xxx"
  }
}
```

### Build List Response
```json
{
  "builds": [
    {
      "id": "build_xxx",
      "version": 5,
      "mode": "production",
      "isActive": true,
      "configCount": 15,
      "translationCount": 45,
      "createdAt": "2025-12-23T10:30:00Z"
    },
    ...
  ]
}
```

### SDK Build Response (Preview/Production)
```json
{
  "build": {
    "version": 5,
    "mode": "preview",
    "createdAt": "2025-12-23T10:30:00Z"
  },
  "businessConfig": {
    "configs": { ... },
    "meta": { ... }
  },
  "localization": {
    "translations": { ... },
    "languages": [...]
  }
}
```

---

## 🚀 Future Extensibility

### Adding New Features

To add a new feature (e.g., "Feature Flags"):

1. Add feature type constant: `"feature_flags"`
2. Create snapshot function: `snapshotFeatureFlags(projectId)`
3. Update build creation to include new feature
4. UI automatically supports it (generic design)
5. No API changes needed (uses BuildFeature model)

### Feature Registry Pattern

```typescript
const FEATURE_REGISTRY = {
  business_config: {
    snapshot: snapshotBusinessConfig,
    apiEndpoint: '/api/business-config'
  },
  localization: {
    snapshot: snapshotLocalization,
    apiEndpoint: '/api/localization/translations'
  },
  // Future features...
}
```

---

## ✅ Definition of Done

- [ ] Database schema created and migrated
- [ ] Build service layer implemented
- [ ] Build creation API working
- [ ] Build management API working
- [ ] SDK build retrieval API working
- [ ] Build Management UI page created
- [ ] Build buttons added to feature tabs
- [ ] Mode assignment working
- [ ] Build history display working
- [ ] Caching implemented
- [ ] Backward compatibility maintained
- [ ] Documentation updated
- [ ] Testing completed

---

## 📊 Estimated Implementation

**Phases**: 5 phases  
**Estimated Time**: 8-10 hours  
**Complexity**: Medium-High

---

**Last Updated**: December 23, 2025

