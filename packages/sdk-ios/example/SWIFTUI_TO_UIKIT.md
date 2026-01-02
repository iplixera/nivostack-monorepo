# Converting SwiftUI Project to UIKit

Your Xcode project was created with SwiftUI, but the example uses UIKit. Here's how to convert it:

## Option 1: Replace SwiftUI Files (Recommended)

1. **Delete SwiftUI Files**:
   - In Xcode, delete:
     - `NivoStackExampleApp.swift`
     - `ContentView.swift`
   - Right-click → Delete → Move to Trash

2. **Add UIKit Files**:
   - Right-click project → **Add Files to "NivoStackExample"...**
   - Select from `NivoStackExample/NivoStackExample/`:
     - `AppDelegate.swift` (already copied)
     - `ViewController.swift` (already copied)
   - Make sure "Add to targets" is checked

3. **Update Info.plist**:
   - Delete the `@main` entry point (if any)
   - Or keep default Info.plist

4. **Set Entry Point**:
   - Select project → Target → Info tab
   - Remove "Main storyboard file base name" if present
   - Or add it if using Storyboard

## Option 2: Keep SwiftUI and Adapt Example

If you prefer SwiftUI, we can adapt the example. But UIKit is simpler for this demo.

## Quick Fix: Use AppDelegate Pattern

Since `AppDelegate.swift` uses `@main`, it will work as the entry point. Just:

1. Delete `NivoStackExampleApp.swift` (it conflicts with `@main`)
2. Add `AppDelegate.swift` and `ViewController.swift` to project
3. Build and run

The `@main` in `AppDelegate.swift` will be the entry point.

