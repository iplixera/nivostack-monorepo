# Quick Start: Edit SDK in Xcode

## 🚀 Fastest Way

```bash
cd packages/sdk-ios
open Package.swift
```

That's it! Xcode will open with the SDK ready to edit.

## 📁 What You'll See

- **Left Sidebar**: All SDK source files organized by folder
- **Editor**: Click any file to edit
- **Build**: Press ⌘B to build and check for errors

## ✏️ Common Edits

### Edit Main SDK Class
```
Sources/NivoStack/NivoStack.swift
```

### Edit API Client
```
Sources/NivoStack/NivoStackApiClient.swift
```

### Edit Models
```
Sources/NivoStack/Models/
```

### Edit Utilities
```
Sources/NivoStack/Utils/
```

## 🔄 Testing Changes

1. **Edit SDK file** in Xcode
2. **Build SDK**: ⌘B (optional, checks for errors)
3. **Switch to example app** (if open)
4. **Build example**: ⌘B
5. **Run example**: ⌘R
6. **See changes** in action!

## 💡 Pro Tip

Open two Xcode windows:
- **Window 1**: SDK package (`Package.swift`)
- **Window 2**: Example app (`NivoStackExample.xcodeproj`)

Edit SDK → Test in example app instantly!

