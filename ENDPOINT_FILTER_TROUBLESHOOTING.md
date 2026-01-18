# Endpoint Filter Troubleshooting Guide

**Date:** 2026-01-19
**Issue:** Endpoint filter not appearing in dashboard

---

## Quick Diagnosis

### Step 1: Open Browser Console

1. Navigate to API Traces tab in dashboard
2. Open browser developer tools (F12 or Cmd+Option+I)
3. Go to Console tab
4. Look for this message:

```
Fetched environments and endpoints: {
  environments: 2,
  endpoints: X,
  tracesFetched: 1065
}
```

**If you see this:**
- ✅ `endpoints: 0` → Problem: No endpoints extracted from traces
- ✅ `endpoints: 6` → Endpoints fetched, filter should be visible

### Step 2: Check Network Tab

1. Go to Network tab in developer tools
2. Filter by "traces"
3. Find the request to `/api/traces?projectId=...&limit=5000`
4. Check response:
   - How many traces returned?
   - Do traces have valid URLs?

### Step 3: Check React State

In browser console, run:
```javascript
// This won't work directly, but you can add a temporary debug button
```

---

## Common Issues & Fixes

### Issue 1: `allEndpoints` Array is Empty

**Symptom:** Console shows `endpoints: 0`

**Possible Causes:**

1. **No traces in database**
   - Solution: Generate some traces by using the app

2. **Traces have invalid URLs**
   - Check: Do traces have properly formatted URLs?
   - Solution: Verify interceptor is capturing full URLs with protocol

3. **`fetchAllEnvironmentsAndEndpoints` not called**
   - Check: Is the function being triggered?
   - Solution: Verify useEffect dependencies

**Debug Code to Add:**

Add this temporarily to page.tsx around line 700:

```typescript
console.log('allEndpoints state:', allEndpoints)
console.log('allEnvironments state:', allEnvironments)
```

### Issue 2: Filter Rendering but Empty

**Symptom:** Dropdown visible but no options

**Check:**
```typescript
// In browser console (if you expose state)
allEndpoints.length  // Should be > 0
```

**Fix:** Clear browser cache and reload

### Issue 3: Deployment Not Live

**Symptom:** Changes not reflected after Vercel deployment

**Check:**
1. Vercel deployment succeeded?
2. Correct branch deployed?
3. Browser cache cleared?

**Fix:**
```bash
# Hard refresh browser
Cmd+Shift+R (Mac)
Ctrl+Shift+R (Windows/Linux)
```

---

## Manual Debug Steps

### Step 1: Add Console Logging

Edit `dashboard/src/app/(dashboard)/projects/[id]/page.tsx`:

```typescript
// After line 699 (in fetchAllEnvironmentsAndEndpoints)
console.log('Fetched environments and endpoints:', {
  environments: envSet.size,
  endpoints: endpointSet.size,
  tracesFetched: allTracesRes.traces.length
})

// Add after setting state
console.log('State updated:', {
  allEnvironments,
  allEndpoints
})
```

### Step 2: Check useEffect Trigger

Add logging to verify useEffect is running:

```typescript
// Around line 1389
useEffect(() => {
  console.log('useEffect triggered: fetchAllEnvironmentsAndEndpoints')
  if (!loading && activeTab === 'traces') {
    fetchAllEnvironmentsAndEndpoints()
  }
}, [activeTab, loading, selectedBaseUrl, fetchAllEnvironmentsAndEndpoints])
```

### Step 3: Verify Filter Rendering

Add logging before the filter:

```typescript
// Around line 3487
console.log('Rendering endpoint filter, allEndpoints:', allEndpoints)

{/* API Endpoint Filter */}
<div className="flex items-center gap-2">
```

---

## Expected Console Output

When everything works correctly, you should see:

```
useEffect triggered: fetchAllEnvironmentsAndEndpoints
Fetching traces with limit: 5000
Fetched environments and endpoints: {
  environments: 2,
  endpoints: 6,
  tracesFetched: 1065
}
State updated: {
  allEnvironments: ['flooss-backend.uat', 'salaf-backend.uat.flooss.com'],
  allEndpoints: ['/api/accounts', '/api/transfer', '/api/balance', ...]
}
Rendering endpoint filter, allEndpoints: (6) ['/api/accounts', ...]
```

---

## Vercel Deployment Check

### Check Deployment Status

1. Go to [Vercel Dashboard](https://vercel.com)
2. Find your project
3. Check latest deployment:
   - Status: Should be "Ready"
   - Commit: Should be `123d4fb`
   - Branch: Should be `main`

### Check Build Logs

If deployment failed:
1. Click on failed deployment
2. Check "Building" logs
3. Look for errors in compilation

### Force Redeploy

If needed:
```bash
# Trigger redeploy with empty commit
git commit --allow-empty -m "trigger redeploy"
git push origin main
```

---

## Quick Test in Development

If you want to test locally before deployment:

```bash
cd /Users/karim-f/Code/nivostack-monorepo-checkout/dashboard
npm run dev
```

Then navigate to `http://localhost:3000` and test the API Traces tab.

---

## Current Code Status

### Files Changed in Commit 123d4fb

1. **dashboard/src/app/(dashboard)/projects/[id]/page.tsx**
   - Lines 668-709: `fetchAllEnvironmentsAndEndpoints` with limit 5000
   - Lines 1874-1932: Statistics using `tracesPagination.total`, `allEnvironments`, `allEndpoints`
   - Line 3492: Endpoint filter rendering `allEndpoints.map()`

2. **dashboard/src/app/(dashboard)/projects/[id]/logs/page.tsx**
   - Replaced with placeholder to fix build error

### State Variables

```typescript
const [allEnvironments, setAllEnvironments] = useState<string[]>([])  // Line 569
const [allEndpoints, setAllEndpoints] = useState<string[]>([])        // Line 570
```

### Dependencies

```typescript
}, [traces, tracesPagination.total, allEnvironments, allEndpoints])  // Line 1932
```

---

## If Filter Still Not Appearing

### Option 1: Check if Rendering is Conditional

Search for any conditional rendering around line 3487:
```typescript
{someCondition && (
  <div className="flex items-center gap-2">
    <label className="text-gray-400 text-sm">API:</label>
    ...
  </div>
)}
```

If found, the condition might be false.

### Option 2: Check CSS Display

The filter might be hidden by CSS:
```css
.some-parent-class {
  display: none;  /* This would hide the filter */
}
```

Use browser DevTools Inspector to check computed styles.

### Option 3: Check Array Population Timing

The `allEndpoints` might be set after render. Add this:

```typescript
useEffect(() => {
  console.log('allEndpoints changed:', allEndpoints)
}, [allEndpoints])
```

---

## Contact Points

If none of these work, the issue might be:

1. **Caching**: Browser or CDN caching old version
2. **Build**: Vercel build using wrong branch
3. **State**: React state not updating correctly

**Solution:** Add explicit logging and share console output.

---

**Status:** Troubleshooting Guide
**Last Updated:** 2026-01-19
