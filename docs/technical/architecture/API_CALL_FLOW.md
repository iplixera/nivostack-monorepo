# API Call Flow Analysis

## Current Flow (On Page Load)

```
Page Load
  │
  ├─→ Initial Fetch (8 API calls in parallel)
  │   ├─→ api.devices.list()          [~200-500ms]
  │   ├─→ api.logs.list()             [~200-500ms]
  │   ├─→ api.crashes.list()          [~200-500ms]
  │   ├─→ api.traces.list()           [~200-500ms]
  │   ├─→ api.projects.list()         [~50-100ms]
  │   ├─→ api.alerts.list()           [~50-100ms]
  │   ├─→ /api/sdk-settings           [~50-100ms]
  │   └─→ api.subscription.getUsage() [~100-200ms]
  │
  ├─→ BusinessConfigTab mounts (if visible)
  │   ├─→ api.businessConfig.list()   [~100-200ms]
  │   ├─→ /api/config-categories      [~50-100ms]
  │   └─→ api.subscription.getUsage() [~100-200ms] ⚠️ DUPLICATE
  │
  └─→ LocalizationTab mounts (if visible)
      ├─→ api.localization.getLanguages() [~100-200ms]
      ├─→ api.localization.getKeys()      [~100-200ms]
      └─→ api.subscription.getUsage()      [~100-200ms] ⚠️ DUPLICATE

Total: 11-13 API calls on initial load
```

## When User Switches Tabs

```
User clicks "Devices" tab
  │
  └─→ useEffect triggers
      ├─→ api.subscription.getEnforcement() [~100-200ms] ⚠️ DUPLICATE
      └─→ api.subscription.getUsage()        [~100-200ms] ⚠️ DUPLICATE

User clicks "Logs" tab
  │
  └─→ useEffect triggers
      ├─→ api.subscription.getEnforcement() [~100-200ms] ⚠️ DUPLICATE
      └─→ api.subscription.getUsage()        [~100-200ms] ⚠️ DUPLICATE

User clicks "Crashes" tab
  │
  └─→ useEffect triggers
      ├─→ api.subscription.getEnforcement() [~100-200ms] ⚠️ DUPLICATE
      └─→ api.subscription.getUsage()        [~100-200ms] ⚠️ DUPLICATE
```

## Optimized Flow (Option 1: Lazy Loading)

```
Page Load
  │
  └─→ Initial Fetch (2-3 API calls)
      ├─→ api.projects.list()         [~50-100ms] (for project name/apiKey)
      ├─→ api.traces.list()           [~200-500ms] (default tab)
      └─→ api.subscription.getUsage() [~100-200ms] (shared, fetch once)

User clicks "Devices" tab
  │
  └─→ Tab-specific fetch (only if not cached)
      └─→ api.devices.list()          [~200-500ms]

User clicks "Logs" tab
  │
  └─→ Tab-specific fetch (only if not cached)
      └─→ api.logs.list()             [~200-500ms]

Total: 2-3 calls on initial load, 1 call per tab switch
```

## Optimized Flow (Option 5: Hybrid)

```
Page Load
  │
  └─→ Initial Fetch (2 API calls)
      ├─→ api.projects.list()         [~50-100ms]
      └─→ api.subscription.getUsage() [~100-200ms] (shared, cached for 5min)

User clicks "Traces" tab (default)
  │
  └─→ api.traces.list()               [~200-500ms] (cached for 5min)

User clicks "Devices" tab
  │
  └─→ Check cache → Cache miss
      └─→ api.devices.list()          [~200-500ms] (then cached)

User clicks "Logs" tab (second time)
  │
  └─→ Check cache → Cache hit ✅
      └─→ Return cached data (instant)

Total: 2 calls on initial load, 0-1 calls per tab switch (cached)
```

## Cost Analysis

### Current (Per Page Load)
- **API Calls**: 11-13 calls
- **Estimated Cost**: $0.0011 - $0.0013 per page load
- **Per 1000 users/day**: $1.10 - $1.30/day = **$33-39/month**

### Option 1: Lazy Loading
- **API Calls**: 2-3 calls initially, +1 per tab switch
- **Estimated Cost**: $0.0002 - $0.0005 per page load
- **Per 1000 users/day**: $0.20 - $0.50/day = **$6-15/month**
- **Savings**: **~70%** ($23-24/month)

### Option 5: Hybrid
- **API Calls**: 2 calls initially, 0-1 per tab switch (cached)
- **Estimated Cost**: $0.0002 - $0.0003 per page load
- **Per 1000 users/day**: $0.20 - $0.30/day = **$6-9/month**
- **Savings**: **~75%** ($24-30/month)

## Key Issues Identified

1. **Duplicate Usage Calls**: `getUsage()` called 6-8 times (once per tab)
2. **Unnecessary Initial Loads**: Loading all tabs even if never visited
3. **No Caching**: Refetching same data on tab switches
4. **Component-Level Fetching**: BusinessConfigTab and LocalizationTab fetch on mount regardless of visibility

## Recommendations

1. **Immediate**: Implement lazy loading (Option 1)
2. **Short-term**: Add shared usage cache
3. **Long-term**: Implement SWR/React Query for automatic caching

