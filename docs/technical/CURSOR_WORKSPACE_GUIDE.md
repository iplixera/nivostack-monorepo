# Cursor Workspace Guide for DevBridge Monorepo

## What is a Cursor Workspace?

A **Cursor workspace** is a configuration file that tells Cursor which folders to include, what settings to use, and how to organize your project. It's similar to VS Code workspaces but optimized for Cursor's AI features.

---

## Quick Start

### Option 1: Create Workspace File (Recommended)

1. **Create workspace file**:
   ```bash
   cd /Users/karim-f/Code/devbridge
   touch devbridge.code-workspace
   ```

2. **Open in Cursor**:
   - `File → Open Workspace from File...`
   - Select `devbridge.code-workspace`

### Option 2: Open Folder Directly

1. **Open folder**:
   - `File → Open Folder...`
   - Select `/Users/karim-f/Code/devbridge`

2. **Cursor automatically creates workspace**:
   - Cursor will detect the monorepo structure
   - You can save it later as a workspace file

---

## Workspace Configuration

### Basic Workspace File

Create `devbridge.code-workspace` in the root:

```json
{
  "folders": [
    {
      "path": ".",
      "name": "DevBridge Monorepo"
    }
  ],
  "settings": {
    "files.exclude": {
      "**/node_modules": true,
      "**/build": true,
      "**/.gradle": true,
      "**/DerivedData": true,
      "**/.dart_tool": true
    },
    "search.exclude": {
      "**/node_modules": true,
      "**/build": true,
      "**/dist": true
    }
  }
}
```

### Advanced Workspace File (Multi-Folder)

For better organization, you can add multiple folders:

```json
{
  "folders": [
    {
      "path": ".",
      "name": "📦 DevBridge Root"
    },
    {
      "path": "./packages/sdk-ios",
      "name": "🍎 iOS SDK"
    },
    {
      "path": "./packages/sdk-android",
      "name": "🤖 Android SDK"
    },
    {
      "path": "./packages/sdk-web",
      "name": "🌐 Web SDK"
    },
    {
      "path": "./packages/sdk-flutter",
      "name": "📱 Flutter SDK"
    },
    {
      "path": "./dashboard",
      "name": "🎛️ Dashboard"
    },
    {
      "path": "./docs",
      "name": "📚 Documentation"
    }
  ],
  "settings": {
    "files.exclude": {
      "**/node_modules": true,
      "**/build": true,
      "**/.gradle": true,
      "**/DerivedData": true,
      "**/.dart_tool": true,
      "**/coverage": true,
      "**/.next": true
    },
    "search.exclude": {
      "**/node_modules": true,
      "**/build": true,
      "**/dist": true,
      "**/.next": true,
      "**/coverage": true
    },
    "files.watcherExclude": {
      "**/node_modules/**": true,
      "**/build/**": true,
      "**/.gradle/**": true
    }
  },
  "extensions": {
    "recommendations": [
      "dart-code.dart-code",
      "ms-vscode.vscode-typescript-next",
      "swiftlang.swift"
    ]
  }
}
```

---

## Step-by-Step Setup

### Step 1: Create Workspace File

```bash
cd /Users/karim-f/Code/devbridge

# Create workspace file
cat > devbridge.code-workspace << 'EOF'
{
  "folders": [
    {
      "path": ".",
      "name": "DevBridge Monorepo"
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
EOF
```

### Step 2: Open Workspace in Cursor

1. **Open Cursor**
2. **File → Open Workspace from File...**
3. **Select** `devbridge.code-workspace`
4. **Done!** Cursor will load the entire monorepo

### Step 3: Verify Setup

Check the Explorer sidebar:
- ✅ You should see all folders
- ✅ File search works across all packages
- ✅ Cursor AI understands the full context

---

## Using Cursor Workspace Features

### 1. File Navigation

#### Quick File Search
- **Mac**: `Cmd + P`
- **Windows/Linux**: `Ctrl + P`
- Type filename to jump to any file across all SDKs

#### Go to Symbol
- **Mac**: `Cmd + Shift + O`
- **Windows/Linux**: `Ctrl + Shift + O`
- Jump to functions/classes across all packages

#### Go to File in Workspace
- **Mac**: `Cmd + P` then type `@filename`
- Search across all folders

---

### 2. Search Across Workspace

#### Find in Files
- **Mac**: `Cmd + Shift + F`
- **Windows/Linux**: `Ctrl + Shift + F`
- Search across all SDKs simultaneously

#### Search with Filters
```
# Search only in iOS SDK
packages/sdk-ios/ DevBridge

# Search only TypeScript files
*.ts DevBridge

# Search excluding node_modules
!**/node_modules DevBridge
```

---

### 3. Multi-Cursor Editing

#### Select All Occurrences
- **Mac**: `Cmd + Shift + L`
- **Windows/Linux**: `Ctrl + Shift + L`
- Edit same code across multiple files

#### Add Cursor Above/Below
- **Mac**: `Cmd + Option + Up/Down`
- **Windows/Linux**: `Ctrl + Alt + Up/Down`

---

### 4. Terminal Management

#### Open Terminal
- **Mac**: `` Ctrl + ` ``
- **Windows/Linux**: `` Ctrl + ` ``

#### Multiple Terminals
- Click `+` button in terminal panel
- Each terminal can be in different directories

#### Terminal Per Package
```bash
# Terminal 1: iOS SDK
cd packages/sdk-ios
pod install

# Terminal 2: Android SDK
cd packages/sdk-android
./gradlew build

# Terminal 3: Web SDK
cd packages/sdk-web
npm install
```

---

### 5. Cursor AI Features

#### Composer (Multi-File Editing)
- **Mac**: `Cmd + I`
- **Windows/Linux**: `Ctrl + I`
- Ask Cursor to make changes across multiple files

**Example**:
```
"Add API tracking to iOS SDK, similar to Android SDK implementation"
```

Cursor will:
- ✅ Read Android SDK code
- ✅ Understand the pattern
- ✅ Apply to iOS SDK
- ✅ Maintain consistency

#### Chat (Context-Aware)
- **Mac**: `Cmd + L`
- **Windows/Linux**: `Ctrl + L`
- Chat with AI about your codebase

**Example**:
```
"How does device registration work across all SDKs?"
```

Cursor will:
- ✅ Search all SDK implementations
- ✅ Explain differences
- ✅ Suggest improvements

#### Inline Suggestions
- Cursor automatically suggests code as you type
- Understands context across all SDKs
- Maintains consistency

---

## Workspace Organization Tips

### 1. Folder Structure

**Recommended**:
```
devbridge.code-workspace
├── Root (.)
├── iOS SDK (packages/sdk-ios)
├── Android SDK (packages/sdk-android)
├── Web SDK (packages/sdk-web)
├── Flutter SDK (packages/sdk-flutter)
└── Dashboard (dashboard)
```

**Benefits**:
- ✅ Easy navigation
- ✅ Clear separation
- ✅ Quick switching

---

### 2. Exclude Unnecessary Files

**Add to `files.exclude`**:
```json
{
  "files.exclude": {
    "**/node_modules": true,
    "**/build": true,
    "**/dist": true,
    "**/.gradle": true,
    "**/DerivedData": true,
    "**/.dart_tool": true,
    "**/coverage": true,
    "**/.next": true,
    "**/Pods": true
  }
}
```

**Benefits**:
- ✅ Faster file search
- ✅ Cleaner explorer
- ✅ Better performance

---

### 3. Search Exclusions

**Add to `search.exclude`**:
```json
{
  "search.exclude": {
    "**/node_modules": true,
    "**/build": true,
    "**/dist": true,
    "**/coverage": true,
    "**/.next": true
  }
}
```

**Benefits**:
- ✅ Faster search
- ✅ Relevant results only
- ✅ Better AI context

---

## Advanced Features

### 1. Workspace-Specific Settings

**Per-folder settings**:
```json
{
  "folders": [
    {
      "path": "./packages/sdk-ios",
      "name": "iOS SDK",
      "settings": {
        "files.associations": {
          "*.swift": "swift"
        }
      }
    },
    {
      "path": "./packages/sdk-web",
      "name": "Web SDK",
      "settings": {
        "typescript.tsdk": "node_modules/typescript/lib"
      }
    }
  ]
}
```

---

### 2. Task Configuration

**Add tasks to workspace**:
```json
{
  "tasks": {
    "version": "2.0.0",
    "tasks": [
      {
        "label": "Build iOS SDK",
        "type": "shell",
        "command": "cd packages/sdk-ios && xcodebuild",
        "group": "build"
      },
      {
        "label": "Build Android SDK",
        "type": "shell",
        "command": "cd packages/sdk-android && ./gradlew build",
        "group": "build"
      },
      {
        "label": "Build All SDKs",
        "dependsOn": ["Build iOS SDK", "Build Android SDK"],
        "group": "build"
      }
    ]
  }
}
```

**Run tasks**:
- **Mac**: `Cmd + Shift + P` → "Tasks: Run Task"
- **Windows/Linux**: `Ctrl + Shift + P` → "Tasks: Run Task"

---

### 3. Launch Configuration

**For debugging**:
```json
{
  "launch": {
    "version": "0.2.0",
    "configurations": [
      {
        "name": "Debug iOS Sample App",
        "type": "lldb",
        "request": "launch",
        "program": "${workspaceFolder}/packages/sdk-ios/SampleApp/build/Debug/SampleApp"
      }
    ]
  }
}
```

---

## Best Practices

### 1. Single Workspace vs Multiple Workspaces

**Single Workspace** (Recommended):
- ✅ One Cursor window
- ✅ Shared context across SDKs
- ✅ Easy navigation
- ✅ Better AI suggestions

**Multiple Workspaces** (If Needed):
- Use when:
  - Very large codebase (>100K files)
  - Working on completely separate features
  - Need to isolate builds

---

### 2. Cursor Agent Strategy

**Single Agent** (Recommended):
- ✅ Understands all SDKs
- ✅ Maintains consistency
- ✅ Better cross-platform suggestions

**How to Use**:
- Open entire monorepo in one workspace
- Cursor AI automatically understands context
- Ask questions about any SDK

**Example**:
```
"Show me how API tracking is implemented in all SDKs"
```

Cursor will:
- ✅ Search all SDK implementations
- ✅ Show differences
- ✅ Suggest improvements

---

### 3. File Organization

**Keep Related Files Together**:
- SDK code in `packages/sdk-*/`
- Documentation in `docs/`
- Scripts in `scripts/`

**Use Workspace Folders**:
- Add folders to workspace for quick access
- Name them clearly (use emojis for visual distinction)

---

## Troubleshooting

### Issue: Workspace Not Loading

**Solution**:
1. Check workspace file syntax (valid JSON)
2. Verify folder paths exist
3. Try opening folder directly first

### Issue: Search Too Slow

**Solution**:
1. Add more exclusions to `search.exclude`
2. Use file filters (`*.ts`, `packages/sdk-ios/**`)
3. Limit search scope

### Issue: Cursor AI Not Understanding Context

**Solution**:
1. Ensure all relevant folders are in workspace
2. Check `files.exclude` isn't hiding important files
3. Use Composer (`Cmd + I`) for multi-file operations

### Issue: Too Many Files in Explorer

**Solution**:
1. Add build folders to `files.exclude`
2. Use `files.maxFilesToWatch` setting
3. Collapse folders you don't need

---

## Quick Reference

### Keyboard Shortcuts

| Action | Mac | Windows/Linux |
|--------|-----|---------------|
| **Open File** | `Cmd + P` | `Ctrl + P` |
| **Search in Files** | `Cmd + Shift + F` | `Ctrl + Shift + F` |
| **Go to Symbol** | `Cmd + Shift + O` | `Ctrl + Shift + O` |
| **Composer** | `Cmd + I` | `Ctrl + I` |
| **Chat** | `Cmd + L` | `Ctrl + L` |
| **Terminal** | `` Ctrl + ` `` | `` Ctrl + ` `` |
| **Command Palette** | `Cmd + Shift + P` | `Ctrl + Shift + P` |

### Workspace File Location

**Save workspace file**:
- Location: `/Users/karim-f/Code/devbridge/devbridge.code-workspace`
- Name: `devbridge.code-workspace` (or any `.code-workspace`)

**Open workspace**:
- `File → Open Workspace from File...`
- Or double-click `.code-workspace` file

---

## Example: Complete Workspace File

Save this as `devbridge.code-workspace`:

```json
{
  "folders": [
    {
      "path": ".",
      "name": "📦 DevBridge Root"
    },
    {
      "path": "./packages/sdk-ios",
      "name": "🍎 iOS SDK"
    },
    {
      "path": "./packages/sdk-android",
      "name": "🤖 Android SDK"
    },
    {
      "path": "./packages/sdk-web",
      "name": "🌐 Web SDK"
    },
    {
      "path": "./packages/sdk-flutter",
      "name": "📱 Flutter SDK"
    },
    {
      "path": "./dashboard",
      "name": "🎛️ Dashboard"
    },
    {
      "path": "./docs",
      "name": "📚 Documentation"
    }
  ],
  "settings": {
    "files.exclude": {
      "**/node_modules": true,
      "**/build": true,
      "**/.gradle": true,
      "**/DerivedData": true,
      "**/.dart_tool": true,
      "**/coverage": true,
      "**/.next": true,
      "**/Pods": true,
      "**/dist": true
    },
    "search.exclude": {
      "**/node_modules": true,
      "**/build": true,
      "**/dist": true,
      "**/coverage": true,
      "**/.next": true,
      "**/Pods": true
    },
    "files.watcherExclude": {
      "**/node_modules/**": true,
      "**/build/**": true,
      "**/.gradle/**": true,
      "**/.next/**": true
    },
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
      "source.fixAll": true
    }
  },
  "extensions": {
    "recommendations": [
      "dart-code.dart-code",
      "ms-vscode.vscode-typescript-next",
      "swiftlang.swift"
    ]
  }
}
```

---

## Next Steps

1. ✅ **Create workspace file** (`devbridge.code-workspace`)
2. ✅ **Open in Cursor** (`File → Open Workspace from File...`)
3. ✅ **Verify setup** (check Explorer sidebar)
4. ✅ **Try features** (search, Composer, Chat)
5. ✅ **Customize** (add folders, adjust settings)

---

## Tips & Tricks

### Tip 1: Use Composer for Cross-SDK Changes

**Example**: "Add device registration to iOS SDK, matching Android SDK implementation"

Cursor will:
- ✅ Read Android SDK code
- ✅ Understand the pattern
- ✅ Apply to iOS SDK
- ✅ Maintain consistency

### Tip 2: Use Chat for Architecture Questions

**Example**: "How should we structure the SDK initialization flow?"

Cursor will:
- ✅ Analyze existing Flutter SDK
- ✅ Suggest consistent patterns
- ✅ Consider platform differences

### Tip 3: Use Multi-File Search

**Example**: Search for `DevBridge.init` across all SDKs to see implementations

### Tip 4: Use Workspace Folders for Quick Access

Add frequently used folders to workspace for one-click access.

---

## Summary

**Cursor Workspace** = Configuration file that tells Cursor:
- Which folders to include
- What settings to use
- How to organize your project

**Benefits**:
- ✅ Better navigation
- ✅ Faster search
- ✅ Shared AI context
- ✅ Consistent settings
- ✅ Multi-file editing

**Start Now**:
1. Create `devbridge.code-workspace`
2. Open in Cursor
3. Start coding!

