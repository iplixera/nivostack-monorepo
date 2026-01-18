# Flooss BH App - SDK Automatic Screen Tracking Setup

## Issue

Some API traces in the Flooss BH app don't have `screenName` populated, making it difficult to track user journeys.

## Root Cause

The app is not registering the `NivoStackLifecycleObserver` in the Application class. This observer is responsible for **automatically tracking screen names** for all Activities.

## Solution

Add **ONE LINE** to your Application class (e.g., `FloosBHApplication.kt`):

### Step 1: Find Your Application Class

Look for a class that extends `Application` in your app. It's usually named something like:
- `FloosBHApplication`
- `FloosBahrainApplication`
- `MainApplication`
- Or similar

If you don't have one, you'll need to create it (see below).

### Step 2: Add the Lifecycle Observer

In the `onCreate()` method of your Application class, add this line **after** `NivoStack.init()`:

```kotlin
class FloosBHApplication : Application() {
    override fun onCreate() {
        super.onCreate()

        // Initialize NivoStack
        NivoStack.init(
            context = this,
            apiKey = "your-api-key",
            projectId = "your-project-id",
            baseUrl = "https://nivostack.vercel.app"
        )

        // ✅ ADD THIS LINE - enables automatic screen tracking
        registerActivityLifecycleCallbacks(NivoStackLifecycleObserver())
    }
}
```

### Step 3: Verify Application Class is Registered in AndroidManifest.xml

Make sure your `AndroidManifest.xml` has the Application class registered:

```xml
<application
    android:name=".FloosBHApplication"
    android:allowBackup="true"
    android:icon="@mipmap/ic_launcher"
    ...>
```

### Step 4: Rebuild and Deploy

1. Clean and rebuild the project:
   ```bash
   ./gradlew clean
   ./gradlew assembleDebug  # or assembleRelease
   ```

2. Install on test device
3. Navigate through different screens
4. Check dashboard - all new traces should have screenName

## If You Don't Have an Application Class

If your app doesn't have an Application class, create one:

### 1. Create the File

Create `FloosBHApplication.kt` in your main package:

```kotlin
package com.flooss.bh  // Replace with your actual package name

import android.app.Application
import com.plixera.nivostack.NivoStack
import com.plixera.nivostack.NivoStackLifecycleObserver

class FloosBHApplication : Application() {
    override fun onCreate() {
        super.onCreate()

        // Initialize NivoStack
        NivoStack.init(
            context = this,
            apiKey = "your-api-key-here",
            projectId = "your-project-id-here",
            baseUrl = "https://nivostack.vercel.app"
        )

        // Enable automatic screen tracking
        registerActivityLifecycleCallbacks(NivoStackLifecycleObserver())
    }
}
```

### 2. Register in AndroidManifest.xml

Add the `android:name` attribute to the `<application>` tag:

```xml
<application
    android:name=".FloosBHApplication"
    android:allowBackup="true"
    ...>
```

### 3. Rebuild and test

## How It Works

The `NivoStackLifecycleObserver` automatically:

1. **Detects when any Activity is created** using `ActivityLifecycleCallbacks`
2. **Extracts the Activity name** from `activity.javaClass.simpleName`
3. **Calls `trackScreen()`** automatically
4. **Links API traces to screens** via the interceptor

**Before:**
- Manual `trackScreen()` in every Activity ❌
- Easy to forget ❌
- Inconsistent tracking ❌

**After:**
- Automatic tracking everywhere ✅
- No manual calls needed ✅
- Screen names in all API traces ✅

## Example Screen Names

The observer will automatically track:
- `LoginActivity` → Screen: "LoginActivity"
- `HomeActivity` → Screen: "HomeActivity"
- `ProfileActivity` → Screen: "ProfileActivity"
- `SettingsActivity` → Screen: "SettingsActivity"

## Verification

### In the App (If you have Developer Settings)

1. Open Developer Settings
2. Check "Current Screen" field
3. Navigate to different screens
4. Field should update with Activity names

### In the Dashboard

1. Open NivoStack dashboard
2. Go to Flooss BH project
3. Click "API Traces" tab
4. All new traces should have "Screen" column populated
5. Click "Screen Flow" tab
6. Should see screen transition graph

## What Gets Fixed

After adding the lifecycle observer:

✅ All API traces will have `screenName` populated
✅ Screen Flow visualization will work
✅ You can filter traces by screen
✅ You can see user journeys through the app
✅ No manual `trackScreen()` calls needed in Activities

## Troubleshooting

### Issue: Still no screen names after adding the line

**Check 1:** Verify the line is actually being executed
```kotlin
override fun onCreate() {
    super.onCreate()
    NivoStack.init(...)
    registerActivityLifecycleCallbacks(NivoStackLifecycleObserver()) // This line
    Log.d("FloosBH", "Lifecycle observer registered") // Add this to confirm
}
```

**Check 2:** Verify Application class is in manifest
- Open `AndroidManifest.xml`
- Check `<application android:name=".FloosBHApplication">`

**Check 3:** Rebuild from scratch
```bash
./gradlew clean
./gradlew assembleDebug
```

**Check 4:** Check SDK logs
```bash
adb logcat | grep NivoStack
# Look for "Tracking screen: ActivityName"
```

### Issue: Want custom screen names

If you want custom names instead of Activity class names:

```kotlin
class HomeActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // Manual call overrides automatic name
        NivoStack.instance.trackScreen("Home Dashboard")
    }
}
```

The manual call will override the automatic one.

## Summary

**What to add:** ONE line in Application.onCreate()

```kotlin
registerActivityLifecycleCallbacks(NivoStackLifecycleObserver())
```

**Where to add it:** After `NivoStack.init()`

**What it does:** Automatically tracks screen names for ALL Activities

**Result:** All API traces will have screenName populated without any manual calls

---

**Status:** Ready to implement
**Time Required:** 5 minutes (just add one line and rebuild)
**Impact:** HIGH (fixes all missing screenName issues)
