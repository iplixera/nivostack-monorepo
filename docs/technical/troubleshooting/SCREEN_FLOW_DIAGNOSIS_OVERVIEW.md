# Screen Flow Empty - Diagnosis

**Date:** 2026-01-18
**Status:** 🔍 Investigating

---

## Symptoms

- ✅ `screenName` appears in API traces (confirmed by user)
- ❌ Screen flow shows "No session data available"
- ❌ No sessions visible in session list
- ❌ Timeline view and Flow view not working

---

## Possible Causes

### 1. **Traces Missing sessionId** (Most Likely)
If API traces have `screenName` but NO `sessionId`, the flow API won't find any sessions.

**Why this happens:**
- Session creation might be failing silently
- `sessionToken` might not be included when sending traces
- Session tracking feature flag might be disabled

### 2. **No Sessions Created**
If no sessions exist in database, there's nothing to show.

**Why this happens:**
- `sessionTracking` feature flag disabled
- Session creation API failing
- SDK not calling `startSession`

### 3. **Feature Flag Disabled**
If `sessionTracking` or `screenTracking` is disabled, sessions won't be created.

---

## Diagnostic Script

Run this to identify the exact issue:

```bash
cd /Users/karim-f/Code/nivostack-monorepo-checkout
tsx scripts/diagnostics/check-screen-flow.ts cmkiixzic00039krtzw3ynm87
```

**What it checks:**
1. ✅ Project exists
2. ✅ Feature flags (sessionTracking, screenTracking, apiTracking)
3. ✅ Sessions in database
4. ✅ API traces with screenName
5. ✅ API traces with sessionId
6. ⚠️  Orphan traces (screenName but no sessionId)
7. 🎯 Simulates flow API query

**Example output:**
```
🔍 Screen Flow Diagnostics for Project: cmkiixzic00039krtzw3ynm87

✅ Project: Flooss

📋 Feature Flags:
   sessionTracking: true
   screenTracking: true
   apiTracking: true
   sdkEnabled: true

📊 Sessions (last 5):
   - abc12345... | Active: true | Screens: 3 | Started: 2026-01-18T10:30:00.000Z
     Screens: MainActivity → DeveloperSettingsActivity → MainActivity

🌐 API Traces (last 10):
   ✅ Screen: MainActivity | ✅ Session: abc12345...
      GET https://api.flooss.com/v1/posts
   ✅ Screen: MainActivity | ❌ Session: NULL
      GET https://api.flooss.com/v1/users

⚠️  Warning: 5 traces have screenName but NO sessionId!

📈 Summary:
   Total sessions: 1
   Total traces: 10
   Traces with screenName: 10
   Traces with sessionId: 5
   Orphan traces (screenName but no sessionId): 5

🎯 Flow API would show:
   Sessions with screenName traces: 1

❌ PROBLEM IDENTIFIED:
   → Traces have screenName but no sessionId!
   → This means traces are being created without a session.
   → Check if sessionToken is being sent with traces.
```

---

## Likely Issues & Fixes

### Issue 1: Session Creation Failing

**Check in Developer Settings:**
- Is "Session Started" showing ✅ Yes?
- If NO, session creation is failing

**Possible causes:**
- Device not registered (`registeredDeviceId` is null)
- Session tracking feature flag disabled
- API error (check backend logs)

**Fix:**
Check SDK initialization logs for "Session start failed" messages.

### Issue 2: sessionToken Not Being Sent with Traces

**SDK sends traces with:**
```kotlin
apiClient.sendTraces(projectId, registeredDeviceId!!, sessionToken, traces)
```

If `sessionToken` is null, traces won't be linked to sessions.

**Check:**
1. Is session started before traces are flushed?
2. Is `sessionToken` populated?

**Possible fix:**
Ensure session is created on SDK initialization, not just on app launch.

### Issue 3: Feature Flags Disabled

**Check:**
```bash
# In dashboard database
SELECT sessionTracking, screenTracking FROM FeatureFlag WHERE projectId = 'cmkiixzic00039krtzw3ynm87';
```

If `sessionTracking = false`, enable it:
```sql
UPDATE FeatureFlag SET sessionTracking = true WHERE projectId = 'cmkiixzic00039krtzw3ynm87';
```

---

## Expected Flow

**Correct sequence:**

1. **SDK Init**
   - `NivoStack.init()` called
   - Device registered → `registeredDeviceId` populated

2. **Session Start**
   - `_startSession()` called
   - POST `/api/sessions` with deviceId
   - `sessionToken` stored in SDK

3. **Screen Tracking**
   - User navigates to MainActivity
   - `trackScreen("MainActivity")` called
   - PATCH `/api/sessions` with screenName
   - Session.screenFlow updated: `["MainActivity"]`

4. **API Calls**
   - User triggers API call from MainActivity
   - `NivoStackInterceptor` captures request
   - Trace includes: `screenName: "MainActivity"`
   - Trace queued for sending

5. **Trace Flush**
   - `_flushTraces()` called
   - POST `/api/traces` with:
     - `screenName: "MainActivity"`
     - `sessionToken: "abc123..."` ✅ CRITICAL
     - Other trace data
   - Backend finds session by sessionToken
   - Sets `trace.sessionId = session.id`

6. **Flow Visualization**
   - Dashboard calls GET `/api/flow`
   - Flow API queries traces with `screenName != null`
   - For each trace:
     - If `trace.sessionId` exists → add to sessionMap
     - Build screen nodes and edges
   - Returns sessions with screen sequences

**If sessionToken is null in step 5, traces are orphaned (no sessionId).**

---

## Quick Fixes to Try

### Fix 1: Check Session Started Status

Open app → Developer Settings → SDK Status
- Look for "Session Started: ✅ Yes"
- If NO, check logs for "Session start failed"

### Fix 2: Verify Feature Flags

```bash
cd /Users/karim-f/Code/nivostack-monorepo-checkout/dashboard
tsx -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.featureFlag.findUnique({
  where: { projectId: 'cmkiixzic00039krtzw3ynm87' }
}).then(console.log).finally(() => prisma.\$disconnect());
"
```

Should show `sessionTracking: true`

### Fix 3: Check Latest Session

```bash
cd /Users/karim-f/Code/nivostack-monorepo-checkout/dashboard
tsx -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.session.findFirst({
  where: { projectId: 'cmkiixzic00039krtzw3ynm87' },
  orderBy: { startedAt: 'desc' },
  include: { device: { select: { deviceId: true } } }
}).then(console.log).finally(() => prisma.\$disconnect());
"
```

Should show recent session with screenFlow array.

---

## Next Steps

1. **Run diagnostic script** (see above)
2. **Check results** and identify the specific issue
3. **Apply appropriate fix** based on findings

---

**Status:** Waiting for diagnostic results
