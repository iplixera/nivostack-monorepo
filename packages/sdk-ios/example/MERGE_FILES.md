# Merging Example Files into Xcode Project

After creating the Xcode project, follow these steps to add the example source files:

## Steps

1. **Xcode Project Created**
   - Xcode will create a new `NivoStackExample` folder with default files

2. **Replace Default Files**
   - In Xcode, delete the default `AppDelegate.swift` and `ViewController.swift`
   - Right-click on the project → **Add Files to "NivoStackExample"...**
   - Navigate to: `NivoStackExample-source/`
   - Select:
     - `AppDelegate.swift`
     - `ViewController.swift`
   - **Important**: 
     - ✅ Check "Add to targets: NivoStackExample"
     - ❌ Uncheck "Copy items if needed" (we want to reference the existing files)
   - Click **Add**

3. **Update Info.plist** (Optional)
   - You can use the one from `NivoStackExample-source/Info.plist` or keep the default

4. **Clean Up**
   - After everything works, you can delete `NivoStackExample-source` folder if you want
   - Or keep it as a backup

## Quick Command

If you prefer command line:

```bash
cd packages/sdk-ios/example

# Copy files into the Xcode project folder
cp NivoStackExample-source/AppDelegate.swift NivoStackExample/
cp NivoStackExample-source/ViewController.swift NivoStackExample/

# Then in Xcode, remove the old files and add the new ones
```

