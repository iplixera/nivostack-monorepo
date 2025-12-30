# Performance Optimization Options - Project Detail Page

## Current State Analysis

### API Calls on Page Load (Initial Mount)

When the project detail page loads, it immediately fetches **ALL** tab data regardless of which tab is active:

```typescript
// Line 1225-1236: Initial data fetch
const [devicesRes, logsRes, crashesRes, tracesRes, projectsRes, alertsRes, sdkSettingsRes, usageRes] = await Promise.all([
  api.devices.list(projectId, token),           // ~200-500ms
  api.logs.list(projectId, token),              // ~200-500ms
  api.crashes.list(projectId, token),            // ~200-500ms
  api.traces.list(projectId, token),             // ~200-500ms
  api.projects.list(token),                      // ~50-100ms
  api.alerts.list(projectId, token),             // ~50-100ms
  fetch('/api/sdk-settings'),                    // ~50-100ms
  api.subscription.getUsage(token)               // ~100-200ms
])
```

**Total API Calls on Load: 8**
**Estimated Total Time: ~1.2-2.5 seconds**
**Cost: High (all endpoints hit on every page refresh)**

### Additional API Calls by Tab Components

#### BusinessConfigTab (loads immediately on mount)
- `api.businessConfig.list()` - Fetches all configs
- `api.config-categories` - Fetches categories
- `api.subscription.getUsage()` - Fetches usage stats

#### LocalizationTab (loads immediately on mount)
- `api.localization.getLanguages()` - Fetches all languages
- `api.localization.getKeys()` - Fetches all keys
- `api.subscription.getUsage()` - Fetches usage stats

#### BuildsSubTab (loads when Builds tab is active)
- `api.builds.list()` - Fetches builds
- `api.subscription.getUsage()` - Fetches usage stats

### Enforcement/Usage API Calls

Each tab makes separate enforcement/usage API calls:
- Devices tab: `getEnforcement()` + `getUsage()`
- Traces tab: `getEnforcement()` + `getUsage()`
- Logs tab: `getEnforcement()` + `getUsage()`
- Crashes tab: `getEnforcement()` + `getUsage()`
- Business Config: `getUsage()` (in component)
- Localization: `getUsage()` (in component)

**Total Enforcement Calls: 6-8 per page load**

---

## Performance Optimization Options

### Option 1: Lazy Loading by Tab (Recommended - Best Balance)

**Strategy**: Only fetch data when a tab becomes active (on-demand loading)

**Implementation**:
- Remove initial data fetch for non-active tabs
- Add `useEffect` hooks that trigger when `activeTab` changes
- Show loading skeletons while data loads
- Cache data per tab to avoid refetching when switching back

**Benefits**:
- ✅ Reduces initial load from 8 API calls to ~2-3
- ✅ Faster initial page load (~300-500ms vs ~1.2-2.5s)
- ✅ Lower API costs (only fetch what's needed)
- ✅ Better user experience (faster perceived load time)

**Drawbacks**:
- ⚠️ Slight delay when switching tabs (but acceptable with loading states)
- ⚠️ Need to manage tab-level caching

**Estimated Savings**: 
- Initial load: **~70% reduction** (8 calls → 2-3 calls)
- API costs: **~60-70% reduction** (users typically only visit 1-2 tabs per session)

**Code Changes**:
```typescript
// Remove from initial fetch:
// - devices, logs, crashes (keep only traces as default tab)
// - alerts, sdkSettings (only needed for settings tab)

// Add tab-specific loading:
useEffect(() => {
  if (activeTab === 'devices' && !devices.length) {
    fetchDevices()
  }
}, [activeTab])

useEffect(() => {
  if (activeTab === 'logs' && !logs.length) {
    fetchLogs()
  }
}, [activeTab])
```

---

### Option 2: Aggressive Caching with SWR/React Query

**Strategy**: Use a data fetching library (SWR or React Query) with aggressive caching

**Implementation**:
- Install `swr` or `@tanstack/react-query`
- Configure cache with 5-10 minute TTL
- Use stale-while-revalidate pattern
- Cache enforcement/usage data globally (shared across tabs)

**Benefits**:
- ✅ Automatic caching and deduplication
- ✅ Background refetching
- ✅ Shared cache for usage/enforcement (one call instead of 6-8)
- ✅ Optimistic updates

**Drawbacks**:
- ⚠️ Requires adding a new dependency
- ⚠️ More complex setup
- ⚠️ May show stale data briefly

**Estimated Savings**:
- Initial load: **~50% reduction** (caching reduces redundant calls)
- Subsequent navigations: **~80% reduction** (served from cache)
- Enforcement calls: **~85% reduction** (1 call instead of 6-8)

**Code Changes**:
```typescript
import useSWR from 'swr'

// Shared usage data (fetched once, used everywhere)
const { data: usage } = useSWR(
  token ? ['usage', token] : null,
  () => api.subscription.getUsage(token),
  { revalidateOnFocus: false, dedupingInterval: 60000 }
)

// Tab-specific data
const { data: devices } = useSWR(
  activeTab === 'devices' ? ['devices', projectId, token] : null,
  () => api.devices.list(projectId, token)
)
```

---

### Option 3: Server-Side Rendering (SSR) with Next.js

**Strategy**: Move data fetching to server-side (getServerSideProps or Server Components)

**Implementation**:
- Convert page to Server Component or use `getServerSideProps`
- Fetch only essential data server-side
- Pass initial data as props
- Use client components for interactive parts

**Benefits**:
- ✅ Faster initial render (no client-side API calls)
- ✅ Better SEO
- ✅ Reduced client-side JavaScript

**Drawbacks**:
- ⚠️ Requires significant refactoring (currently all client-side)
- ⚠️ Still need client-side fetching for tab switching
- ⚠️ May increase server load

**Estimated Savings**:
- Initial load: **~40% reduction** (server-side is faster)
- API costs: Similar to Option 1 (still need tab-specific fetching)

---

### Option 4: Combined Endpoint for Initial Load

**Strategy**: Create a single `/api/projects/[id]/overview` endpoint that returns minimal data for all tabs

**Implementation**:
- Create new endpoint that returns:
  - Device count (not full list)
  - Log count (not full list)
  - Crash count (not full list)
  - Trace count (not full list)
  - Basic project info
- Fetch full data only when tab is opened

**Benefits**:
- ✅ Single API call for initial load
- ✅ Faster initial render
- ✅ Lower latency (one round trip)

**Drawbacks**:
- ⚠️ Requires backend changes
- ⚠️ Still need individual endpoints for full data
- ⚠️ More complex backend logic

**Estimated Savings**:
- Initial load: **~75% reduction** (8 calls → 1 call)
- API costs: Similar to Option 1

---

### Option 5: Hybrid Approach (Recommended for Production)

**Strategy**: Combine Option 1 (Lazy Loading) + Option 2 (Caching) + Shared Usage Data

**Implementation**:
1. **Lazy Loading**: Only fetch data when tab is active
2. **Shared Usage Cache**: Fetch usage/enforcement once, share across all tabs
3. **Tab-Level Caching**: Cache tab data for 5 minutes
4. **Background Refresh**: Refresh data in background when tab is visible

**Benefits**:
- ✅ Best of all worlds
- ✅ Minimal initial load (2-3 calls)
- ✅ Fast tab switching (cached data)
- ✅ Shared enforcement data (1 call instead of 6-8)
- ✅ Lower API costs overall

**Drawbacks**:
- ⚠️ Requires implementing caching logic (or using SWR/React Query)
- ⚠️ More complex than Option 1 alone

**Estimated Savings**:
- Initial load: **~75% reduction** (8 calls → 2 calls)
- Tab switching: **~80% reduction** (cached)
- Enforcement calls: **~85% reduction** (1 call instead of 6-8)
- **Overall API costs: ~70-75% reduction**

---

## Detailed Comparison

| Option | Initial Load Time | API Calls (Initial) | API Calls (Tab Switch) | Implementation Effort | Cost Savings |
|-------|------------------|---------------------|------------------------|----------------------|--------------|
| **Current** | ~1.2-2.5s | 8+ | 0-2 | - | Baseline |
| **Option 1: Lazy Loading** | ~300-500ms | 2-3 | 1-2 | Medium | ~60-70% |
| **Option 2: SWR/React Query** | ~600-800ms | 4-5 | 0-1 (cached) | High | ~70-80% |
| **Option 3: SSR** | ~400-600ms | 2-3 | 1-2 | Very High | ~60-70% |
| **Option 4: Combined Endpoint** | ~200-400ms | 1 | 1-2 | Medium | ~70-75% |
| **Option 5: Hybrid** | ~300-500ms | 2 | 0-1 (cached) | High | **~70-75%** |

---

## Recommendations

### For Immediate Impact (Quick Win)
**Choose Option 1: Lazy Loading by Tab**
- Easiest to implement
- Significant cost savings (~60-70%)
- Faster initial load
- No new dependencies

### For Long-Term (Best Performance)
**Choose Option 5: Hybrid Approach**
- Best cost savings (~70-75%)
- Best user experience
- Requires SWR or React Query
- More complex but worth it

### For Maximum Cost Reduction
**Choose Option 5 + Option 4 Combined**
- Single overview endpoint for initial load
- Lazy loading for tabs
- Caching with SWR/React Query
- **Estimated savings: ~80-85%**

---

## Implementation Priority

1. **Phase 1 (Quick Win)**: Implement Option 1 - Lazy Loading
   - Remove non-active tab data from initial fetch
   - Add tab-specific `useEffect` hooks
   - Add loading states
   - **Time: 2-3 hours**
   - **Savings: ~60-70%**

2. **Phase 2 (Optimization)**: Add Shared Usage Cache
   - Fetch usage/enforcement once at top level
   - Pass down as props to tabs
   - **Time: 1-2 hours**
   - **Additional Savings: ~10-15%**

3. **Phase 3 (Advanced)**: Implement SWR/React Query
   - Install and configure
   - Migrate all API calls
   - Configure cache TTLs
   - **Time: 4-6 hours**
   - **Additional Savings: ~5-10%**

---

## Code Examples

### Option 1: Lazy Loading Implementation

```typescript
// Remove from initial fetch (line 1225)
// Keep only: projectsRes (for project name/apiKey), tracesRes (default tab)

// Add tab-specific fetching:
useEffect(() => {
  if (activeTab === 'devices' && devices.length === 0 && !devicesLoading) {
    fetchDevices(1)
  }
}, [activeTab, devices.length, devicesLoading])

useEffect(() => {
  if (activeTab === 'logs' && logs.length === 0 && !logsLoading) {
    fetchLogs(1)
  }
}, [activeTab, logs.length, logsLoading])

useEffect(() => {
  if (activeTab === 'crashes' && crashes.length === 0 && !crashesLoading) {
    fetchCrashes(1)
  }
}, [activeTab, crashes.length, crashesLoading])

// Only fetch alerts/settings when needed
useEffect(() => {
  if (activeTab === 'settings' && !alerts.length) {
    api.alerts.list(projectId, token).then(res => setAlerts(res.alerts))
    fetchSdkSettings()
  }
}, [activeTab])
```

### Option 2: Shared Usage Cache

```typescript
// At top level, fetch once
const [sharedUsage, setSharedUsage] = useState(null)
const [sharedEnforcement, setSharedEnforcement] = useState(null)

useEffect(() => {
  if (!token) return
  Promise.all([
    api.subscription.getUsage(token),
    api.subscription.getEnforcement(token).catch(() => null)
  ]).then(([usage, enforcement]) => {
    setSharedUsage(usage?.usage)
    setSharedEnforcement(enforcement)
  })
}, [token])

// Pass to tabs as props instead of fetching per tab
```

---

## Next Steps

1. **Review options** and select preferred approach
2. **Implement Phase 1** (Lazy Loading) for immediate savings
3. **Measure impact** (API call counts, load times)
4. **Iterate** with Phase 2/3 if needed

