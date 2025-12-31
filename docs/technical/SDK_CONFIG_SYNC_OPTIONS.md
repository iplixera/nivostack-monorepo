# SDK Config Sync Options - Simple Implementation Guide

## Overview

Current SDK behavior: **No automatic config syncing**. Configs are only fetched on:
- SDK initialization (if `enabled: true`)
- Manual `refreshConfig()` call
- App restart

This document outlines **simple options** to implement automatic config syncing.

---

## Option 1: App Lifecycle Sync (Simplest) ⭐ RECOMMENDED

**Complexity**: ⭐ Very Simple  
**Battery Impact**: ✅ Low  
**Real-time**: ⚠️ Only on app foreground  
**Implementation Time**: ~30 minutes

### How It Works

Refresh config when app comes to foreground (user opens app).

### Implementation

**Step 1**: Add lifecycle observer to SDK

```dart
// In nivostack.dart
import 'package:flutter/widgets.dart';

class NivoStack {
  // ... existing code ...
  
  WidgetsBindingObserver? _lifecycleObserver;
  
  void _setupLifecycleObserver() {
    _lifecycleObserver = _NivoStackLifecycleObserver(this);
    WidgetsBinding.instance.addObserver(_lifecycleObserver!);
  }
  
  void _onAppResumed() {
    // Refresh config when app comes to foreground
    refreshConfig().catchError((e) {
      print('NivoStack: Auto-refresh failed: $e');
    });
  }
}

class _NivoStackLifecycleObserver extends WidgetsBindingObserver {
  final NivoStack _sdk;
  
  _NivoStackLifecycleObserver(this._sdk);
  
  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _sdk._onAppResumed();
    }
  }
}
```

**Step 2**: Initialize observer in `init()`

```dart
static Future<NivoStack> init({...}) async {
  // ... existing init code ...
  
  if (enabled) {
    _instance!._setupLifecycleObserver(); // Add this
  }
  
  return _instance!;
}
```

**Step 3**: Cleanup in `dispose()`

```dart
@override
void dispose() {
  if (_lifecycleObserver != null) {
    WidgetsBinding.instance.removeObserver(_lifecycleObserver!);
  }
  // ... existing cleanup ...
}
```

### Pros
- ✅ Very simple to implement
- ✅ Low battery impact (only syncs when user opens app)
- ✅ No additional dependencies
- ✅ Works offline → syncs when app opens

### Cons
- ⚠️ Not real-time (only syncs on app foreground)
- ⚠️ Won't sync if app stays in background

---

## Option 2: Periodic Polling (Simple)

**Complexity**: ⭐⭐ Simple  
**Battery Impact**: ⚠️ Medium (depends on interval)  
**Real-time**: ⚠️ Configurable (5min, 15min, etc.)  
**Implementation Time**: ~1 hour

### How It Works

Periodically check for config updates (e.g., every 5-15 minutes).

### Implementation

**Step 1**: Add polling timer

```dart
// In nivostack.dart
Timer? _syncTimer;
Duration _syncInterval = const Duration(minutes: 15); // Default 15 min

void _startSyncTimer() {
  _syncTimer?.cancel();
  
  if (!enabled) return; // Don't poll if disabled
  
  _syncTimer = Timer.periodic(_syncInterval, (_) {
    refreshConfig().catchError((e) {
      print('NivoStack: Periodic sync failed: $e');
    });
  });
  
  print('NivoStack: Started periodic sync (interval: ${_syncInterval.inMinutes}min)');
}

void _stopSyncTimer() {
  _syncTimer?.cancel();
  _syncTimer = null;
}
```

**Step 2**: Start timer after init

```dart
Future<void> _initializeInBackground() async {
  // ... existing code ...
  
  // Start periodic sync after initial config fetch
  _startSyncTimer();
}
```

**Step 3**: Add configurable interval

```dart
static Future<NivoStack> init({
  required String apiKey,
  bool enabled = true,
  Duration? syncInterval, // Add this
}) async {
  // ... existing init ...
  
  if (syncInterval != null) {
    _instance!._syncInterval = syncInterval;
  }
  
  // ... rest of init ...
}
```

**Step 4**: Cleanup in dispose

```dart
@override
void dispose() {
  _stopSyncTimer();
  // ... existing cleanup ...
}
```

### Usage

```dart
// Sync every 5 minutes
await NivoStack.init(
  apiKey: 'your-api-key',
  syncInterval: Duration(minutes: 5),
);

// Sync every 30 minutes (default)
await NivoStack.init(
  apiKey: 'your-api-key',
  syncInterval: Duration(minutes: 30),
);
```

### Pros
- ✅ Simple to implement
- ✅ Configurable interval
- ✅ Works in background (if app is active)
- ✅ Uses ETag (efficient - only downloads if changed)

### Cons
- ⚠️ Battery impact (more frequent = more battery)
- ⚠️ Not instant (depends on interval)
- ⚠️ May not work if app is backgrounded (platform dependent)

---

## Option 3: Hybrid Approach (Best Balance) ⭐⭐ RECOMMENDED

**Complexity**: ⭐⭐ Simple  
**Battery Impact**: ✅ Low  
**Real-time**: ✅ Good balance  
**Implementation Time**: ~1.5 hours

### How It Works

Combine **App Lifecycle** + **Periodic Polling** (only when app is active).

### Implementation

```dart
class NivoStack {
  Timer? _syncTimer;
  Duration _syncInterval = const Duration(minutes: 15);
  bool _isAppActive = true; // Track app state
  
  void _setupLifecycleObserver() {
    _lifecycleObserver = _NivoStackLifecycleObserver(this);
    WidgetsBinding.instance.addObserver(_lifecycleObserver!);
  }
  
  void _onAppResumed() {
    _isAppActive = true;
    // Immediate sync on foreground
    refreshConfig().catchError((e) {
      print('NivoStack: Foreground sync failed: $e');
    });
    // Restart periodic sync
    _startSyncTimer();
  }
  
  void _onAppPaused() {
    _isAppActive = false;
    // Stop periodic sync when backgrounded
    _stopSyncTimer();
  }
  
  void _startSyncTimer() {
    _syncTimer?.cancel();
    
    if (!enabled || !_isAppActive) return;
    
    _syncTimer = Timer.periodic(_syncInterval, (_) {
      if (_isAppActive) {
        refreshConfig().catchError((e) {
          print('NivoStack: Periodic sync failed: $e');
        });
      }
    });
  }
}
```

### Pros
- ✅ Best balance: immediate sync on foreground + periodic when active
- ✅ Battery efficient (stops when backgrounded)
- ✅ Good user experience (updates when they use app)

### Cons
- ⚠️ Slightly more complex
- ⚠️ Still not real-time (but close enough)

---

## Option 4: Server-Sent Events (SSE) - Advanced

**Complexity**: ⭐⭐⭐ Moderate  
**Battery Impact**: ✅ Low (push-based)  
**Real-time**: ✅ Instant  
**Implementation Time**: ~4-6 hours

### How It Works

Server pushes config updates to app via SSE (one-way stream).

### Implementation Overview

**Backend**: Add SSE endpoint `/api/config-stream`
**SDK**: Connect to SSE stream, listen for updates

### Pros
- ✅ Real-time updates
- ✅ Battery efficient (push-based)
- ✅ Works in background (if connection maintained)

### Cons
- ⚠️ More complex (requires backend + SDK changes)
- ⚠️ Connection management needed
- ⚠️ May need reconnection logic

**Note**: This is more advanced and requires significant backend work.

---

## Option 5: Push Notifications - Advanced

**Complexity**: ⭐⭐⭐⭐ Complex  
**Battery Impact**: ✅ Very Low  
**Real-time**: ✅ Instant  
**Implementation Time**: ~8+ hours

### How It Works

Send push notification when config changes, app refreshes on notification.

### Pros
- ✅ Real-time
- ✅ Battery efficient
- ✅ Works even when app is closed

### Cons
- ⚠️ Requires Firebase/APNs setup
- ⚠️ Complex implementation
- ⚠️ User permission needed

**Note**: This is the most complex option and requires external services.

---

## Recommendation Matrix

| Use Case | Recommended Option | Why |
|----------|-------------------|-----|
| **Most Apps** | **Option 3: Hybrid** | Best balance of simplicity and UX |
| **Simple Apps** | **Option 1: Lifecycle** | Easiest, good enough for most cases |
| **High-Frequency Updates** | **Option 2: Polling** | More frequent checks |
| **Real-Time Critical** | **Option 4: SSE** | Instant updates |
| **Enterprise Apps** | **Option 5: Push** | Most reliable, works offline |

---

## Implementation Priority

### Phase 1: Quick Win (Option 1)
- Implement app lifecycle sync
- ~30 minutes
- Immediate benefit

### Phase 2: Enhanced (Option 3)
- Add periodic polling when active
- ~1.5 hours total
- Better user experience

### Phase 3: Advanced (Optional)
- SSE or Push notifications
- Only if real-time is critical
- Significant development time

---

## Code Example: Option 3 (Hybrid) - Complete

```dart
// In nivostack.dart

import 'package:flutter/widgets.dart';
import 'dart:async';

class NivoStack {
  // ... existing fields ...
  
  Timer? _syncTimer;
  Duration _syncInterval = const Duration(minutes: 15);
  bool _isAppActive = true;
  WidgetsBindingObserver? _lifecycleObserver;
  
  static Future<NivoStack> init({
    required String apiKey,
    bool enabled = true,
    Duration? syncInterval,
  }) async {
    // ... existing init code ...
    
    if (enabled) {
      if (syncInterval != null) {
        _instance!._syncInterval = syncInterval;
      }
      _instance!._setupLifecycleObserver();
    }
    
    return _instance!;
  }
  
  void _setupLifecycleObserver() {
    _lifecycleObserver = _NivoStackLifecycleObserver(this);
    WidgetsBinding.instance.addObserver(_lifecycleObserver!);
  }
  
  void _onAppResumed() {
    _isAppActive = true;
    print('NivoStack: App resumed - syncing config...');
    refreshConfig().catchError((e) {
      print('NivoStack: Foreground sync failed: $e');
    });
    _startSyncTimer();
  }
  
  void _onAppPaused() {
    _isAppActive = false;
    print('NivoStack: App paused - stopping periodic sync');
    _stopSyncTimer();
  }
  
  void _startSyncTimer() {
    _syncTimer?.cancel();
    
    if (!enabled || !_isAppActive) return;
    
    _syncTimer = Timer.periodic(_syncInterval, (_) {
      if (_isAppActive && enabled) {
        print('NivoStack: Periodic config sync...');
        refreshConfig().catchError((e) {
          print('NivoStack: Periodic sync failed: $e');
        });
      }
    });
  }
  
  void _stopSyncTimer() {
    _syncTimer?.cancel();
    _syncTimer = null;
  }
  
  @override
  void dispose() {
    if (_lifecycleObserver != null) {
      WidgetsBinding.instance.removeObserver(_lifecycleObserver!);
    }
    _stopSyncTimer();
    // ... existing cleanup ...
  }
}

class _NivoStackLifecycleObserver extends WidgetsBindingObserver {
  final NivoStack _sdk;
  
  _NivoStackLifecycleObserver(this._sdk);
  
  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    switch (state) {
      case AppLifecycleState.resumed:
        _sdk._onAppResumed();
        break;
      case AppLifecycleState.paused:
      case AppLifecycleState.inactive:
        _sdk._onAppPaused();
        break;
      default:
        break;
    }
  }
}
```

---

## Testing

After implementing, test:

1. **Lifecycle Sync**:
   - Change config in dashboard
   - Background app
   - Foreground app
   - ✅ Config should update

2. **Periodic Sync**:
   - Change config in dashboard
   - Keep app active
   - Wait for sync interval
   - ✅ Config should update

3. **Battery Impact**:
   - Monitor battery usage
   - ✅ Should be minimal

---

## Next Steps

1. **Choose option** (recommend Option 3: Hybrid)
2. **Implement** in SDK
3. **Test** with real app
4. **Monitor** battery impact
5. **Adjust** interval if needed

