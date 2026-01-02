# ✅ Next Steps - Complete the Setup

Great! The project is created and SDK package is added. Now complete these final steps:

## Step 1: Add Files in Xcode

The source files have been copied to your project folder. Now add them in Xcode:

1. **Open Xcode Project** (if not already open):
   ```bash
   open NivoStackExample/NivoStackExample.xcodeproj
   ```

2. **Remove Default Files** (if Xcode created them):
   - In Project Navigator, find `AppDelegate.swift` and `ViewController.swift`
   - Right-click each → **Delete** → **Move to Trash**

3. **Add Example Files**:
   - Right-click on **NivoStackExample** (blue project icon) → **Add Files to "NivoStackExample"...**
   - Navigate to: `NivoStackExample/NivoStackExample/` folder
   - Select:
     - ✅ `AppDelegate.swift`
     - ✅ `ViewController.swift`
   - **Important**:
     - ❌ **Uncheck** "Copy items if needed"
     - ✅ **Check** "Add to targets: NivoStackExample"
   - Click **Add**

## Step 2: Configure Project Settings

1. **Set iOS Deployment Target**:
   - Select **NivoStackExample** project (blue icon)
   - Select **NivoStackExample** target
   - **General** tab → **iOS Deployment Target**: **13.0**

2. **Update API Key**:
   - Open `AppDelegate.swift`
   - Find line: `let apiKey = "cmjvwzx140003og8t37yd6kor"`
   - Replace with your actual API key from NivoStack Studio

## Step 3: Verify Setup

1. **Check SDK Import**:
   - Open `AppDelegate.swift`
   - Should see: `import NivoStack` at the top
   - No red errors

2. **Build Project**:
   - Press **⌘B** to build
   - Should build successfully

## Step 4: Run the App! 🚀

1. **Select Simulator**:
   - Choose iPhone simulator (e.g., iPhone 14, iPhone 15)

2. **Run**:
   - Press **⌘R** to build and run
   - App should launch in simulator!

3. **Test Features**:
   - Check SDK status at the top
   - Device code will appear once initialized
   - Tap buttons to test SDK features

## Troubleshooting

### Files Not Showing in Xcode
- Make sure you added them to the target
- Check File Inspector → Target Membership → NivoStackExample should be checked

### Build Errors
- **"No such module 'NivoStack'"**:
  - Verify SDK package is added: File → Packages → Show Package Dependencies
  - Clean build: **Product** → **Clean Build Folder** (⌘⇧K)
  - Rebuild: **Product** → **Build** (⌘B)

- **Other errors**:
  - Check iOS deployment target is 13.0+
  - Verify Swift version is 5.5+

### App Crashes or SDK Not Initializing
- Check console logs for error messages
- Verify API key is correct
- Check network connectivity

## Quick Checklist

- [ ] Files added to Xcode project
- [ ] Files added to target
- [ ] iOS Deployment Target: 13.0
- [ ] API key updated
- [ ] Project builds (⌘B)
- [ ] App runs (⌘R)
- [ ] SDK initializes (check console)
- [ ] Device code appears in app

## Need Help?

- See `ADD_FILES_GUIDE.md` for detailed file addition steps
- See `SETUP_INSTRUCTIONS.md` for complete setup guide
- Check console logs for detailed error messages

