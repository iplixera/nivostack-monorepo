# Workspace Structure: Actual Folders vs Display Names

This document explains the difference between **actual folder names** (on disk) and **workspace display names** (shown in IDE).

---

## Configuration File

**Location:** `devbridge.code-workspace` (root of repository)

This file configures how folders appear in your IDE workspace. Each folder entry has:
- `path` - The actual folder path on disk
- `name` - The display name shown in the IDE (optional)

---

## Comparison Table

| Actual Folder Path (on disk) | Workspace Display Name (in IDE) | Purpose |
|-------------------------------|----------------------------------|---------|
| `.` (root) | **NivoStack Monorepo** | Root directory |
| `dashboard/` | **📦 NivoStack Studio** | Dashboard application |
| `dashboard/src/` | **💻 Source Code** | Dashboard source code |
| `dashboard/src/app/` | **🚀 App Routes & API** | API routes and app pages |
| `dashboard/src/components/` | **🧩 Components** | React components |
| `dashboard/prisma/` | **🗄️ Database** | Database schema |
| `packages/` | **📦 SDK Packages** | Flutter & Android SDKs |
| `docs/` | **📚 Documentation** | All documentation |
| `scripts/` | **🔧 Scripts** | Development scripts |

---

## Actual Folder Structure (on disk)

```
nivostack-monorepo-checkout/
├── dashboard/          ← Actual folder name
├── docs/               ← Actual folder name (NOT "documentation")
├── packages/           ← Actual folder name
├── prisma/              ← Actual folder name
├── public/              ← Actual folder name
├── scripts/             ← Actual folder name
├── src/                 ← Actual folder name
├── tests/               ← Actual folder name
└── devbridge.code-workspace  ← Configuration file
```

---

## Workspace Configuration (devbridge.code-workspace)

```json
{
  "folders": [
    {
      "path": ".",
      "name": "NivoStack Monorepo"          ← Display name for root
    },
    {
      "path": "./dashboard",
      "name": "📦 NivoStack Studio"         ← Display name (actual: dashboard/)
    },
    {
      "path": "./dashboard/src",
      "name": "💻 Source Code"              ← Display name (actual: dashboard/src/)
    },
    {
      "path": "./dashboard/src/app",
      "name": "🚀 App Routes & API"         ← Display name (actual: dashboard/src/app/)
    },
    {
      "path": "./dashboard/src/components",
      "name": "🧩 Components"               ← Display name (actual: dashboard/src/components/)
    },
    {
      "path": "./dashboard/prisma",
      "name": "🗄️ Database"                 ← Display name (actual: dashboard/prisma/)
    },
    {
      "path": "./packages",
      "name": "📦 SDK Packages"             ← Display name (actual: packages/)
    },
    {
      "path": "./docs",
      "name": "📚 Documentation"            ← Display name (actual: docs/)
    },
    {
      "path": "./scripts",
      "name": "🔧 Scripts"                   ← Display name (actual: scripts/)
    }
  ]
}
```

---

## Key Points

### 1. Actual Folder Names (on disk)
- **`docs/`** - This is the actual folder name
- **NOT** `documentation/` - This doesn't exist on disk
- The IDE may show "Documentation" but the actual folder is `docs/`

### 2. Workspace Display Names (in IDE)
- These are **custom labels** shown in the IDE sidebar
- They make navigation easier with emojis and descriptive names
- They don't change the actual folder names on disk

### 3. File Paths
When referencing files, always use the **actual folder names**:

```bash
# ✅ CORRECT - Use actual folder name
docs/DEVELOPER_GUIDE.md
dashboard/src/app/api/route.ts
packages/sdk-flutter/lib/nivostack.dart

# ❌ WRONG - Don't use display names
documentation/DEVELOPER_GUIDE.md  # Wrong! Folder is "docs", not "documentation"
```

---

## How to Find Files

### In Terminal/Command Line
Always use actual folder names:
```bash
cd docs/                    # ✅ Correct
cd documentation/            # ❌ Wrong - folder doesn't exist

ls docs/DEVELOPER_GUIDE.md  # ✅ Correct
```

### In IDE (Cursor/VS Code)
- The sidebar shows **display names** (e.g., "📚 Documentation")
- But when you open a file, the path bar shows **actual path** (e.g., `docs/DEVELOPER_GUIDE.md`)
- File paths in code use **actual folder names**

---

## Modifying Workspace Names

To change how folders appear in your IDE:

1. **Open:** `devbridge.code-workspace`
2. **Edit:** The `name` field for any folder
3. **Save:** The workspace file
4. **Reload:** Your IDE window to see changes

Example:
```json
{
  "path": "./docs",
  "name": "📚 Documentation"  ← Change this to whatever you want
}
```

---

## Complete File Path Reference

| File | Actual Path | Workspace Display |
|------|-------------|-------------------|
| Developer Guide | `docs/DEVELOPER_GUIDE.md` | 📚 Documentation → DEVELOPER_GUIDE.md |
| Dashboard API Route | `dashboard/src/app/api/devices/route.ts` | 🚀 App Routes & API → devices → route.ts |
| Flutter SDK | `packages/sdk-flutter/lib/nivostack.dart` | 📦 SDK Packages → sdk-flutter → lib → nivostack.dart |
| Database Schema | `dashboard/prisma/schema.prisma` | 🗄️ Database → schema.prisma |
| Script | `scripts/db-health-check.ts` | 🔧 Scripts → db-health-check.ts |

---

## Summary

- **Actual folders:** `dashboard/`, `docs/`, `packages/`, `scripts/`, etc.
- **Display names:** "📦 NivoStack Studio", "📚 Documentation", "📦 SDK Packages", "🔧 Scripts"
- **Configuration:** `devbridge.code-workspace` (root directory)
- **File paths:** Always use actual folder names (`docs/`, not `documentation/`)

---

*Last Updated: December 2025*

