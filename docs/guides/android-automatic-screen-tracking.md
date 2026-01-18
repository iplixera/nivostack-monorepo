# Android Automatic Screen Tracking Setup

## Overview

The NivoStack Android SDK includes **automatic screen tracking** that requires only **ONE line of code** in your Application class. No manual calls needed in each Activity!

## Problem

Without automatic tracking, you would need to call `trackScreen()` manually in every Activity:

```kotlin
// ❌ Manual approach (don't do this)
class MyActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        NivoStack.instance.trackScreen("MyActivity") // Manual call
    }
}
```

This is tedious and error-prone.

## Solution: Automatic Lifecycle Observer

The SDK includes `NivoStackLifecycleObserver` that automatically tracks all Activities.

### Step 1: Register the Lifecycle Observer

In your Application class (e.g., `FloosBHApplication.kt`), add ONE line:

```kotlin
class FloosBHApplication : Application() {
    override fun onCreate() {
        super.onCreate()

        // Initialize NivoStack
        NivoStack.init(
            context = this,
            apiKey = "your-api-key",
            projectId = "your-project-id",
            baseUrl = "https://your-dashboard.com"
        )

        // ✅ ADD THIS LINE - enables automatic screen tracking
        registerActivityLifecycleCallbacks(NivoStackLifecycleObserver())
    }
}
```

### Step 2: That's It!

No other code needed. Every Activity will automatically call `trackScreen()` when created.

## How It Works

The `NivoStackLifecycleObserver` implements `Application.ActivityLifecycleCallbacks`:

```kotlin
override fun onActivityCreated(activity: Activity, savedInstanceState: Bundle?) {
    val instance = NivoStack.instanceOrNull() ?: return
    val screenName = activity.javaClass.simpleName  // Extracts Activity name
    instance.trackScreen(screenName)  // Automatically tracks!
}
```

**Screen names are automatically extracted from Activity class names:**
- `LoginActivity` → `"LoginActivity"`
- `HomeActivity` → `"HomeActivity"`
- `ProfileFragment` → Only Activities are tracked (Fragments not supported yet)

## Benefits

✅ **Zero boilerplate** - No manual calls in every Activity
✅ **Consistent tracking** - Never forget to call `trackScreen()`
✅ **Works everywhere** - Automatically tracks all Activities in your app
✅ **Session context** - API traces get screen names automatically
✅ **Screen flow** - Dashboard can visualize user journeys

## Verification

### Check in App

1. Launch your app
2. Navigate through different screens
3. Open Developer Settings (if available)
4. Check SDK Status → "Current Screen" should show the current Activity name

### Check in Dashboard

1. Open NivoStack dashboard
2. Go to your project
3. Navigate to "API Traces" tab
4. All traces should have "Screen" column populated
5. Navigate to "Screen Flow" tab
6. Should see screen transitions

## Troubleshooting

### Issue: Screen names not showing in traces

**Check 1:** Verify lifecycle observer is registered
```kotlin
// Make sure this line is in Application.onCreate()
registerActivityLifecycleCallbacks(NivoStackLifecycleObserver())
```

**Check 2:** Verify SDK is initialized before observer registration
```kotlin
// Correct order:
NivoStack.init(...)  // First
registerActivityLifecycleCallbacks(...)  // Second
```

**Check 3:** Check feature flags in dashboard
- Go to Project Settings → Feature Flags
- Ensure "Screen Tracking" is enabled

### Issue: Some screens not tracked

**Possible causes:**
- Screen is a Fragment (not yet supported - only Activities tracked)
- Activity not going through normal lifecycle (e.g., transparent activities)
- SDK init failed (check logs)

### Issue: Want custom screen names

If you want custom names instead of Activity class names, you can still call `trackScreen()` manually:

```kotlin
class HomeActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // Override automatic name with custom name
        NivoStack.instance.trackScreen("Home Screen")
    }
}
```

The manual call will override the automatic one.

## Advanced: Fragment Support (Coming Soon)

Currently, only Activities are tracked automatically. For Fragment tracking, you would need to:

```kotlin
// Manual Fragment tracking (if needed)
class MyFragment : Fragment() {
    override fun onResume() {
        super.onResume()
        NivoStack.instance.trackScreen("${requireActivity().javaClass.simpleName}/$javaClass.simpleName")
    }
}
```

Future SDK versions may include automatic Fragment tracking via `FragmentManager.FragmentLifecycleCallbacks`.

## Summary

**Before:**
- Manual `trackScreen()` in every Activity ❌
- Easy to forget ❌
- 100s of lines of boilerplate ❌

**After:**
- ONE line in Application class ✅
- Automatic tracking everywhere ✅
- Screen names in all API traces ✅

**The ONE Line:**
```kotlin
registerActivityLifecycleCallbacks(NivoStackLifecycleObserver())
```

Add this to your Application class and you're done!
