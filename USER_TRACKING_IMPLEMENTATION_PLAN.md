# User Tracking Implementation Plan

**Date:** 2026-01-19 03:25 AM
**Issues to Fix:**
1. User filter missing in API Traces
2. User info not displaying in Devices tab
3. Screen Flow showing "Unknown" sessions
4. Cannot identify Pixel phone in device list

---

## Issue 1: Database Schema Missing User Fields in ApiTrace

**Current State:** Device model has `userId`, `userEmail`, `userName` but ApiTrace doesn't

**Fix Applied:** Added user fields to ApiTrace model

```prisma
model ApiTrace {
  // ... existing fields

  // User tracking fields (enriched from SDK setUser)
  userId          String? // App's user ID who made this request
  userEmail       String? // User email for filtering
  userName        String? // User display name

  // ... rest of fields

  @@index([userId])  // Added index for filtering
}
```

**Migration Required:** Yes - need to run Prisma migration

---

## Issue 2: SDK Not Sending User Info in Traces

**Current State:** SDK enriches traces with user info in `queueTrace()`, but backend might not be storing it

**Check:** Verify the ingest API (`/api/sdk-init` or trace endpoint) accepts and stores userId/userEmail/userName

**Files to Check:**
- `dashboard/src/app/api/traces/route.ts` - POST endpoint
- Backend ingest endpoint

---

## Issue 3: Backend API Missing User Filter

**Current State:** `/api/traces` GET endpoint doesn't support userId filtering

**Fix Needed:** Add userId parameter to traces API

**File:** `dashboard/src/app/api/traces/route.ts`

**Changes:**

```typescript
// Around line 502 - Add userId parameter
const userId = searchParams.get('userId')

// Around line 537 - Add to where clause
if (userId) where.userId = userId

// Fetch unique users for filter dropdown
const users = await prisma.apiTrace.findMany({
  where: { projectId },
  select: {
    userId: true,
    userEmail: true,
    userName: true
  },
  distinct: ['userId'],
  orderBy: { userId: 'asc' }
})
```

---

## Issue 4: Frontend Missing User Filter

**Current State:** Dashboard doesn't have user filter dropdown

**Fix Needed:** Add user filter to API Traces tab

**File:** `dashboard/src/app/(dashboard)/projects/[id]/page.tsx`

**Changes:**

1. **Add State:**
```typescript
const [allUsers, setAllUsers] = useState<Array<{userId: string, userEmail?: string, userName?: string}>>([])
const [selectedUserId, setSelectedUserId] = useState<string>('')
```

2. **Update fetchAllEnvironmentsAndEndpoints:**
```typescript
// Extract unique users
const userSet = new Map<string, {userEmail?: string, userName?: string}>()
allTracesRes.traces.forEach(trace => {
  if (trace.userId) {
    userSet.set(trace.userId, {
      userEmail: trace.userEmail,
      userName: trace.userName
    })
  }
})
setAllUsers(Array.from(userSet.entries()).map(([userId, info]) => ({
  userId,
  ...info
})))
```

3. **Add User Filter UI:**
```tsx
{/* User Filter */}
<div className="flex items-center gap-2">
  <label className="text-gray-400 text-sm">User:</label>
  <select
    value={selectedUserId}
    onChange={(e) => setSelectedUserId(e.target.value)}
    className="bg-gray-800 text-gray-300 text-sm rounded px-3 py-1.5..."
  >
    <option value="">All Users</option>
    {allUsers.map((user) => (
      <option key={user.userId} value={user.userId}>
        {user.userName || user.userEmail || user.userId}
      </option>
    ))}
  </select>
</div>
```

4. **Pass to API:**
```typescript
const tracesRes = await api.traces.list(projectId, token, {
  // ... existing params
  userId: selectedUserId || undefined,
})
```

---

## Issue 5: User Info Not Showing in Devices Tab

**Current State:** Devices list shows device info but not associated user

**Fix Needed:** Display userId/userEmail/userName in Devices table

**File:** `dashboard/src/app/(dashboard)/projects/[id]/page.tsx`

**Changes:**

Around line 2500+ (Devices tab):

```tsx
{/* Add User column to devices table */}
<th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
  User
</th>

{/* In table body */}
<td className="px-4 py-3 whitespace-nowrap text-sm">
  {device.userName || device.userEmail || device.userId || (
    <span className="text-gray-500">No user</span>
  )}
</td>
```

---

## Issue 6: Screen Flow "Unknown" Sessions

**Possible Causes:**

1. **Old traces with null screenName**
   - Solution: Already fixed with "AppLaunch" default
   - Need to regenerate traces with new SDK

2. **SDK not sending screenName**
   - Solution: Lifecycle observer auto-registration
   - Already implemented in SDK

3. **Backend not storing screenName**
   - Check: Ingest API saves screenName field

**Diagnostic Steps:**

Run this to check traces:
```bash
npx tsx scripts/diagnostics/check-pixel-device.ts <project-id>
```

Then check if traces from that device have screenName:
```sql
SELECT screenName, COUNT(*)
FROM ApiTrace
WHERE deviceId = '<pixel-device-id>'
GROUP BY screenName;
```

---

## Issue 7: Cannot Identify Pixel Phone

**Possible Causes:**

1. **Device not sending model/manufacturer**
   - Check SDK initialization
   - Verify device registration endpoint

2. **Multiple devices in database**
   - Use diagnostic script to list all devices
   - Check lastSeenAt to find recent device

3. **Device registered under different project**
   - Check if using correct projectId in SDK init

**Diagnostic Command:**
```bash
export SUPABASE_URL="your-url"
export SUPABASE_SERVICE_ROLE_KEY="your-key"
npx tsx scripts/diagnostics/check-pixel-device.ts <project-id>
```

**What to Check:**
- Device model should contain "Pixel"
- Manufacturer should be "Google"
- lastSeenAt should be recent (within minutes of testing)

---

## Implementation Steps

### Step 1: Database Migration (CRITICAL)

```bash
cd /Users/karim-f/Code/nivostack-monorepo-checkout
npx prisma migrate dev --name add-user-fields-to-api-trace
```

This will:
- Add userId, userEmail, userName columns to ApiTrace table
- Add index on userId for faster filtering
- Allow null values (existing traces won't break)

### Step 2: Update Backend API

File: `dashboard/src/app/api/traces/route.ts`

1. Add userId parameter parsing
2. Add userId to where clause
3. Fetch unique users for dropdown
4. Return users in response

### Step 3: Update Frontend

File: `dashboard/src/app/(dashboard)/projects/[id]/page.tsx`

1. Add user state and filter
2. Update fetchAllEnvironmentsAndEndpoints to extract users
3. Add user filter UI
4. Pass userId to API calls
5. Add user column to Devices table

### Step 4: Test with Flooss BH App

1. Rebuild app with latest SDK
2. Call `setUser()` after login
3. Make API requests
4. Check dashboard:
   - User filter should appear
   - Traces should show user info
   - Devices should show user info

### Step 5: Verify Screen Names

1. Check traces have screenName (not null)
2. Check Screen Flow shows Activity names
3. If still "Unknown", clear old traces and regenerate

---

## Files to Modify

1. ✅ **prisma/schema.prisma** - Add user fields to ApiTrace
2. ⏳ **dashboard/src/app/api/traces/route.ts** - Backend user filtering
3. ⏳ **dashboard/src/app/(dashboard)/projects/[id]/page.tsx** - Frontend user filter
4. ✅ **scripts/diagnostics/check-pixel-device.ts** - Created diagnostic tool

---

## Testing Checklist

### Backend
- [ ] Prisma migration runs successfully
- [ ] `/api/traces?userId=xxx` filters correctly
- [ ] `/api/traces` returns users list
- [ ] Ingest API saves userId/userEmail/userName

### Frontend
- [ ] User filter dropdown appears
- [ ] User filter populated with unique users
- [ ] Selecting user filters traces
- [ ] Devices table shows user info
- [ ] Statistics update with user filter

### SDK
- [ ] `setUser()` enriches traces with user info
- [ ] User info persists in SharedPreferences
- [ ] Backend receives and stores user fields
- [ ] Lifecycle observer auto-registers
- [ ] Screen names tracked automatically

---

## Current Status

- ✅ Database schema updated (not migrated yet)
- ✅ Diagnostic script created
- ⏳ Backend API needs user filtering
- ⏳ Frontend needs user filter UI
- ⏳ Devices tab needs user column
- ⏳ Screen Flow issue needs diagnosis

**Next:** Run Prisma migration, then update backend and frontend

---

## Quick Commands

```bash
# Run migration
cd /Users/karim-f/Code/nivostack-monorepo-checkout
npx prisma migrate dev --name add-user-fields-to-api-trace

# Check Pixel device
export SUPABASE_URL="..."
export SUPABASE_SERVICE_ROLE_KEY="..."
npx tsx scripts/diagnostics/check-pixel-device.ts <project-id>

# Build SDK
cd packages/sdk-android/nivostack-core
./gradlew clean build

# Test locally
cd dashboard
npm run dev
```

---

**Created:** 2026-01-19 03:25 AM
**Status:** Schema updated, migration pending
