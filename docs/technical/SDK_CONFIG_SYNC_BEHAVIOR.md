# SDK Config Sync Behavior

## Question: When Sync Data is Disabled

**Scenario**: SDK is initialized with `enabled: false` (sync disabled), and you change business config or SDK settings in the dashboard. **When will changes reflect in the app?**

## Answer: Config Changes Are NOT Automatic

### Current Behavior

The SDK does **NOT** automatically poll or sync configs. Config updates only happen when:

1. **SDK Initialization** (`NivoStack.init()`)
   - If `enabled: true`: Fetches config in background on init
   - If `enabled: false`: **NO config fetch** - uses cached data only (if available)

2. **Manual Refresh** (`refreshConfig()`)
   - Must be called explicitly by your app code
   - Works regardless of `enabled` flag (if SDK is initialized)

3. **App Restart**
   - Triggers SDK init again
   - If `enabled: true`: Fetches fresh config
   - If `enabled: false`: Uses cache only

## When Sync is Disabled (`enabled: false`)

### What Happens:

```dart
await NivoStack.init(
  apiKey: 'your-api-key',
  enabled: false, // ❌ Sync disabled
);
```

**Result**:
- ✅ SDK initializes (device info, etc.)
- ❌ **NO network requests** for config
- ✅ Uses cached config if available (from previous sessions)
- ❌ **NO automatic updates** from server

### How to Get Updates:

**Option 1: Manual Refresh**
```dart
// User taps "Sync" button or pull-to-refresh
final result = await NivoStack.instance.refreshConfig(forceRefresh: true);
if (result.hasChanges) {
  // Config updated - refresh UI
  setState(() {});
}
```

**Option 2: Re-enable SDK**
```dart
// Re-initialize with enabled: true
await NivoStack.init(
  apiKey: 'your-api-key',
  enabled: true, // ✅ Now syncs
);
```

**Option 3: App Restart**
- If `enabled: true` on restart, config will be fetched
- If `enabled: false` on restart, uses cache only

## Config Update Flow

### Dashboard Changes → App Reflection

```
1. You change config in dashboard
   ↓
2. Config saved to database
   ↓
3. App needs to fetch updates:
   a) Manual refresh: refreshConfig()
   b) App restart: NivoStack.init() (if enabled: true)
   c) Background init: Only if enabled: true on init
```

### Timeline Example

**Scenario**: You disable sync (`enabled: false`), then change business config in dashboard

| Time | Action | App State |
|------|--------|-----------|
| T0 | App starts with `enabled: false` | Uses cached config (if exists) |
| T1 | You change config in dashboard | ❌ App **doesn't know** - still using old cached config |
| T2 | User taps "Sync" button → `refreshConfig()` | ✅ App fetches new config |
| T3 | App restarts with `enabled: false` | ❌ Still uses old cache (no network fetch) |
| T4 | App restarts with `enabled: true` | ✅ Fetches fresh config on init |

## Best Practices

### For Production Apps

**Recommended**: Keep `enabled: true` and use manual refresh for critical updates:

```dart
// Always enable sync
await NivoStack.init(
  apiKey: 'your-api-key',
  enabled: true, // ✅ Always enabled
);

// Provide manual refresh option
void onSyncButtonPressed() async {
  final result = await NivoStack.instance.refreshConfig(forceRefresh: true);
  if (result.hasChanges) {
    showSnackBar('Config updated!');
    setState(() {}); // Refresh UI
  }
}
```

### For Debug/Development

**Option**: Disable sync to avoid network calls:

```dart
await NivoStack.init(
  apiKey: 'your-api-key',
  enabled: kDebugMode ? false : true, // Disable in debug
);
```

**But**: You'll need to manually refresh to get updates:
```dart
if (kDebugMode) {
  // Manual refresh in debug mode
  await NivoStack.instance.refreshConfig(forceRefresh: true);
}
```

## Summary

| Sync Status | Config Fetch on Init | Manual Refresh Works | Auto Updates |
|------------|---------------------|---------------------|--------------|
| `enabled: true` | ✅ Yes (background) | ✅ Yes | ❌ No (manual only) |
| `enabled: false` | ❌ No | ✅ Yes | ❌ No |

**Key Points**:
1. **No automatic polling** - SDK doesn't check for updates automatically
2. **Manual refresh always works** - `refreshConfig()` works regardless of `enabled` flag
3. **Cache is used** - When sync disabled, cached config is used (if available)
4. **App restart behavior** - Depends on `enabled` flag on restart

## Future Enhancement Ideas

Potential improvements:
- **Periodic sync**: Optional background polling (e.g., every 5 minutes)
- **Push notifications**: Server pushes config updates to app
- **SSE/WebSocket**: Real-time config updates via Server-Sent Events
- **App lifecycle hooks**: Auto-refresh on app foreground

