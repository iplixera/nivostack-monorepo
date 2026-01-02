# Adding Example Files to Xcode Project

Follow these steps to add the example source files to your Xcode project:

## Step 1: Copy Files (Optional - for easier access)

The files are in `NivoStackExample-source/`. You can copy them to the project folder:

```bash
cd packages/sdk-ios/example
cp NivoStackExample-source/AppDelegate.swift NivoStackExample/
cp NivoStackExample-source/ViewController.swift NivoStackExample/
```

## Step 2: Add Files in Xcode

1. **Remove Default Files** (if Xcode created them):
   - In Xcode, find `AppDelegate.swift` and `ViewController.swift` in the project navigator
   - Right-click → Delete → Move to Trash

2. **Add Example Files**:
   - Right-click on the project (blue icon) → **Add Files to "NivoStackExample"...**
   - Navigate to: `NivoStackExample-source/` folder
   - Select:
     - ✅ `AppDelegate.swift`
     - ✅ `ViewController.swift`
   - **Important Options**:
     - ❌ **Uncheck** "Copy items if needed" (we want to reference existing files)
     - ✅ **Check** "Add to targets: NivoStackExample"
   - Click **Add**

3. **Verify**:
   - Check that both files appear in the project navigator
   - Check that they're added to the target (select file → File Inspector → Target Membership)

## Step 3: Configure Project

1. **Set iOS Deployment Target**:
   - Select project (blue icon) → Select target "NivoStackExample"
   - General tab → **iOS Deployment Target**: **13.0**

2. **Update API Key**:
   - Open `AppDelegate.swift`
   - Find: `let apiKey = "cmjvwzx140003og8t37yd6kor"`
   - Replace with your actual API key from NivoStack Studio

3. **Verify SDK Import**:
   - Open `AppDelegate.swift`
   - Should see: `import NivoStack` at the top
   - No red errors

## Step 4: Build and Run

1. **Select Simulator**:
   - Choose iPhone simulator from device menu (e.g., iPhone 14)

2. **Build**:
   - Press **⌘B** to build
   - Fix any errors if they occur

3. **Run**:
   - Press **⌘R** to run
   - App should launch in simulator

## Troubleshooting

### Files Not Showing
- Make sure files are added to the target
- Check File Inspector → Target Membership

### Build Errors
- Clean build: **Product** → **Clean Build Folder** (⌘⇧K)
- Rebuild: **Product** → **Build** (⌘B)

### SDK Not Found
- Verify SDK package is added: File → Packages → Show Package Dependencies
- Check it's added to target
- Clean and rebuild

## Quick Checklist

- [ ] Files copied or added from NivoStackExample-source/
- [ ] Files added to target in Xcode
- [ ] iOS Deployment Target set to 13.0
- [ ] API key updated in AppDelegate.swift
- [ ] Project builds without errors (⌘B)
- [ ] App runs on simulator (⌘R)

