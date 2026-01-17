# Immediate Action Plan - Page Fixes

## Summary of Current State

### ✅ What's Working
1. **Backend Infrastructure**
   - All 6 project APIs returning 200 OK
   - Aggregation queue running (11 completed jobs, 0 failures)
   - Both workers running (aggregation-worker, data-seeder-worker)
   - Database schema complete with aggregate tables
   - Authentication temporarily disabled for development

2. **Frontend Structure**
   - Navigation menu complete with all 8 sections per mockup
   - All 21 page routes exist in file system
   - FilterBar component properly structured and reusable
   - Data fetching patterns established
   - Layout components (AppShell, PageHeader) functional

3. **Fixed Issues**
   - Sessions page `sessionToken` undefined error ✅
   - All API 403/500 errors resolved ✅
   - Device relations fixed (removed invalid `user` relation) ✅

### ❌ What's Broken / Missing

#### Critical Issues (Breaks User Experience)
1. **Filter Functionality**: Most filter dropdowns don't have `value` and `onChange` handlers
2. **Button Actions**: Many buttons are display-only (Export, More Filters, Saved Views, etc.)
3. **Row Actions**: Click handlers may be missing or non-functional
4. **Data Loading**: Some pages may not properly handle loading/error states

#### High Priority (Reduces Usability)
5. **Hard-coded Values**: Time ranges, filter options may not update actual queries
6. **Pagination**: Needs verification that it works with real backend data
7. **Sort Functionality**: Column sorting may not be wired to API calls

#### Medium Priority (UX Polish)
8. **Loading States**: Missing spinners/skeletons during data fetch
9. **Empty States**: No helpful messages when data is empty
10. **Error Messages**: Generic or missing error displays
11. **Confirmations**: Destructive actions need modals

---

## Phase 1: Critical Fixes (Current Priority)

### 1. Fix Devices Page Filters
**File**: `src/app/(dashboard)/projects/[id]/devices/page.tsx`

**Add state variables**:
```typescript
const [platformFilter, setPlatformFilter] = useState('all')
const [debugModeFilter, setDebugModeFilter] = useState('all')
const [lastSeenFilter, setLastSeenFilter] = useState('today')
```

**Update filters array** (lines 99-132):
```typescript
const filters: FilterItem[] = useMemo(() => [
  {
    type: 'search',
    placeholder: 'Search deviceId / deviceCode / user email / model / appVersion',
    value: searchQuery,
    onChange: setSearchQuery,
  },
  {
    type: 'select',
    options: [
      { value: 'all', label: 'Platform: All' },
      { value: 'ios', label: 'iOS' },
      { value: 'android', label: 'Android' },
    ],
    value: platformFilter,
    onChange: setPlatformFilter,
  },
  {
    type: 'select',
    options: [
      { value: 'all', label: 'Debug: All' },
      { value: 'enabled', label: 'Enabled' },
      { value: 'disabled', label: 'Disabled' },
    ],
    value: debugModeFilter,
    onChange: setDebugModeFilter,
  },
  {
    type: 'select',
    options: [
      { value: 'today', label: 'Last Seen: Today' },
      { value: 'week', label: 'This Week' },
      { value: 'month', label: 'This Month' },
    ],
    value: lastSeenFilter,
    onChange: setLastSeenFilter,
  },
  { 
    type: 'button', 
    label: 'More Filters', 
    className: 'secondary',
    onChange: () => setShowAdvancedFilters(!showAdvancedFilters)
  },
  { 
    type: 'button', 
    label: 'Export', 
    className: 'secondary',
    onChange: () => handleExport()
  },
  { 
    type: 'button', 
    label: 'Saved Views', 
    className: 'secondary',
    onChange: () => setShowSavedViews(!showSavedViews)
  },
], [searchQuery, platformFilter, debugModeFilter, lastSeenFilter])
```

**Update fetchDevices to use filters**:
```typescript
const fetchDevices = useCallback(async () => {
  if (!token) return
  setLoading(true)
  try {
    const params = new URLSearchParams({
      projectId,
      page: page.toString(),
      limit: limit.toString(),
      search: searchQuery || '',
      platform: platformFilter !== 'all' ? platformFilter : '',
      debugMode: debugModeFilter !== 'all' ? debugModeFilter : '',
      sortBy,
      sortOrder,
    })

    // Add date filter logic
    if (lastSeenFilter === 'today') {
      params.append('lastSeenAfter', new Date().setHours(0,0,0,0).toString())
    } else if (lastSeenFilter === 'week') {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      params.append('lastSeenAfter', weekAgo.toISOString())
    } else if (lastSeenFilter === 'month') {
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      params.append('lastSeenAfter', monthAgo.toISOString())
    }

    const response = await fetch(`/api/devices?${params}`)
    // ... rest of the logic
  } catch (error) {
    console.error('Failed to fetch devices:', error)
    setError('Failed to load devices')
  } finally {
    setLoading(false)
  }
}, [token, projectId, page, limit, searchQuery, platformFilter, debugModeFilter, lastSeenFilter, sortBy, sortOrder])
```

**Add useEffect to re-fetch when filters change**:
```typescript
useEffect(() => {
  fetchDevices()
}, [platformFilter, debugModeFilter, lastSeenFilter, page])
```

---

### 2. Update Devices API to Support New Filters
**File**: `src/app/api/devices/route.ts`

**Add filter handling** (after line 24):
```typescript
const lastSeenAfter = searchParams.get('lastSeenAfter')

// Build where clause
const where: any = { projectId }

if (search) {
  where.OR = [
    { deviceId: { contains: search, mode: 'insensitive' } },
    { deviceCode: { contains: search, mode: 'insensitive' } },
    { userEmail: { contains: search, mode: 'insensitive' } },
    { model: { contains: search, mode: 'insensitive' } },
    { appVersion: { contains: search, mode: 'insensitive' } },
  ]
}

if (platform && platform !== 'all') {
  where.platform = platform
}

if (debugMode === 'enabled') {
  where.debugModeEnabled = true
} else if (debugMode === 'disabled') {
  where.debugModeEnabled = false
}

if (lastSeenAfter) {
  where.lastSeenAt = {
    gte: new Date(lastSeenAfter)
  }
}
```

---

### 3. Repeat for Other Critical Pages

Apply the same pattern to:
- **Sessions** page (platform, duration filters)
- **API Traces** page (method, status code, duration filters)
- **Logs** page (level, platform filters)
- **Crashes** page (platform, date filters)

---

## Phase 2: Button Actions

### Common Button Handlers to Implement

#### Export Button
```typescript
const handleExport = useCallback(async () => {
  if (!token) return
  try {
    const params = new URLSearchParams({
      projectId,
      search: searchQuery || '',
      platform: platformFilter !== 'all' ? platformFilter : '',
      // ... all current filters
      format: 'csv'
    })
    
    const response = await fetch(`/api/devices/export?${params}`)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `devices-${projectId}-${Date.now()}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Export failed:', error)
    alert('Export failed. Please try again.')
  }
}, [token, projectId, searchQuery, platformFilter, /* all filters */])
```

#### More Filters Toggle
```typescript
const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

// In render:
{showAdvancedFilters && (
  <div className="advanced-filters">
    {/* Additional filter inputs */}
  </div>
)}
```

#### Saved Views
```typescript
const [savedViews, setSavedViews] = useState<SavedView[]>([])
const [showSavedViews, setShowSavedViews] = useState(false)

const saveCurrentView = useCallback(async () => {
  const viewName = prompt('Enter view name:')
  if (!viewName) return
  
  const view = {
    name: viewName,
    filters: {
      search: searchQuery,
      platform: platformFilter,
      debugMode: debugModeFilter,
      lastSeen: lastSeenFilter,
    },
    sort: { by: sortBy, order: sortOrder }
  }
  
  // Save to API or localStorage
  localStorage.setItem(`view-${projectId}-${viewName}`, JSON.stringify(view))
  setSavedViews([...savedViews, view])
  alert(`View "${viewName}" saved!`)
}, [searchQuery, platformFilter, debugModeFilter, lastSeenFilter, sortBy, sortOrder])
```

---

## Phase 3: Loading & Error States

### Add Loading Skeleton
```typescript
{loading && !devices.length && (
  <div className="card" style={{ marginTop: '14px', padding: '20px' }}>
    <div className="skeleton-row"></div>
    <div className="skeleton-row"></div>
    <div className="skeleton-row"></div>
  </div>
)}
```

### Add Error Display
```typescript
{error && (
  <div className="card dangerBox" style={{ marginTop: '14px' }}>
    <strong>⚠️ Error</strong>
    <p>{error}</p>
    <button className="btn secondary" onClick={() => fetchDevices()}>
      Retry
    </button>
  </div>
)}
```

### Add Empty State
```typescript
{!loading && devices.length === 0 && !error && (
  <div className="card" style={{ marginTop: '14px', padding: '40px', textAlign: 'center' }}>
    <div style={{ fontSize: '48px', opacity: 0.3 }}>📱</div>
    <h3>No devices found</h3>
    <p className="muted">
      {searchQuery || platformFilter !== 'all' 
        ? 'Try adjusting your filters' 
        : 'No devices have connected to this project yet'}
    </p>
    {(searchQuery || platformFilter !== 'all') && (
      <button 
        className="btn secondary" 
        onClick={() => {
          setSearchQuery('')
          setPlatformFilter('all')
          setDebugModeFilter('all')
          setLastSeenFilter('today')
        }}
      >
        Clear Filters
      </button>
    )}
  </div>
)}
```

---

## Phase 4: Row Actions

### Add Action Handlers
```typescript
const handleEnableDebugMode = useCallback(async (deviceId: string) => {
  if (!confirm('Enable debug mode for this device? This will expire in 24 hours.')) return
  
  try {
    const response = await fetch(`/api/devices/${deviceId}/debug-mode`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ enabled: true, durationHours: 24 })
    })
    
    if (!response.ok) throw new Error('Failed to enable debug mode')
    
    alert('Debug mode enabled for 24 hours')
    fetchDevices() // Refresh list
  } catch (error) {
    console.error('Failed to enable debug mode:', error)
    alert('Failed to enable debug mode. Please try again.')
  }
}, [token, fetchDevices])

const handleDeleteDevice = useCallback(async (deviceId: string) => {
  if (!confirm('Are you sure you want to delete this device? This action cannot be undone.')) return
  
  try {
    const response = await fetch(`/api/devices/${deviceId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) throw new Error('Failed to delete device')
    
    alert('Device deleted successfully')
    fetchDevices() // Refresh list
  } catch (error) {
    console.error('Failed to delete device:', error)
    alert('Failed to delete device. Please try again.')
  }
}, [token, fetchDevices])
```

---

## Testing Checklist

Before marking each page as "done":

### Filters
- [ ] Search input updates URL params
- [ ] All dropdowns have value/onChange
- [ ] Changing filter triggers new API call
- [ ] Filters persist on page reload (if desired)
- [ ] Clear filters button works

### Buttons
- [ ] Export downloads actual CSV
- [ ] More Filters shows/hides advanced panel
- [ ] Saved Views saves and loads correctly

### Data Display
- [ ] Shows loading skeleton on first load
- [ ] Shows error message on API failure
- [ ] Shows empty state when no data
- [ ] Shows actual data when loaded

### Row Actions
- [ ] Click row → navigate to detail page (if applicable)
- [ ] Action buttons work (edit, delete, etc.)
- [ ] Destructive actions show confirmation
- [ ] Actions refresh data after success

### Pagination
- [ ] First/prev/next/last buttons work
- [ ] Page numbers reflect actual data pages
- [ ] Changing page updates URL
- [ ] Page persists on browser back/forward

---

## Implementation Order

1. **Devices Page** (most critical, highest traffic)
2. **Sessions Page** (second most used)
3. **API Traces Page** (debugging tool)
4. **Logs Page** (debugging tool)
5. **Crashes Page** (monitoring)
6. **Dashboard** (summary view)
7. **All other pages** (features/settings)

---

## Quick Wins (Do First)

These can be done immediately with minimal risk:

1. Add loading states to all pages (30 min)
2. Add error displays to all pages (30 min)
3. Add empty states to all pages (30 min)
4. Wire up all filter `value` and `onChange` (2 hours)
5. Add confirmation dialogs for delete actions (1 hour)

**Total: ~5 hours for all quick wins across all pages**

---

## API Endpoints That May Need Updates

### Export Endpoints (New)
- `/api/devices/export` - CSV export for devices
- `/api/sessions/export` - CSV export for sessions
- `/api/traces/export` - CSV export for traces
- `/api/logs/export` - CSV export for logs
- `/api/crashes/export` - CSV export for crashes

### Row Action Endpoints (May exist)
- `/api/devices/[id]/debug-mode` - Toggle debug mode
- `/api/devices/[id]` - DELETE device
- `/api/sessions/[id]` - GET session details
- `/api/traces/[id]` - GET trace details with full headers/body
- `/api/crashes/[id]` - GET crash details with stack trace

---

## Questions for User

Before proceeding with large-scale changes:

1. **Priority**: Which pages are most critical to fix first?
2. **Saved Views**: Store in database or localStorage?
3. **Export Format**: CSV only, or also JSON/Excel?
4. **Confirmations**: Use native `confirm()` or custom modals?
5. **Time Range**: Should persist across sessions or reset?
6. **Pagination**: URL-based (shareable) or state-based?

---

## Estimated Time for Complete Fix

- **Phase 1** (Critical Filters): 8-12 hours
- **Phase 2** (Button Actions): 6-8 hours
- **Phase 3** (Loading/Errors): 4-6 hours
- **Phase 4** (Row Actions): 6-10 hours
- **Testing**: 4-8 hours

**Total**: 28-44 hours (4-6 working days for 1 developer)

---

## Recommendation

Given the scale of work, I recommend:

1. **Immediate** (today): Fix devices page completely as a reference implementation
2. **Next** (tomorrow): Apply same pattern to sessions and traces
3. **This week**: Complete all observe pages (devices, sessions, traces, logs, crashes)
4. **Next week**: Polish control plane pages (business config, localization, etc.)
5. **Following week**: Testing and final review

This ensures the most critical user-facing pages (observability tools) are functional ASAP, while less frequently used configuration pages can follow.

