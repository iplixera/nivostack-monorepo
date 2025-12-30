# Subscription Lifecycle & Behavior

**Date**: January 27, 2025  
**Purpose**: Explain what happens after trial expiration (30 days) and when plan limits are throttled

---

## Table of Contents

1. [After 30 Days (Trial Expiration)](#after-30-days-trial-expiration)
2. [When Plan is Throttled](#when-plan-is-throttled)
3. [Monthly Renewal & Meter Reset](#monthly-renewal--meter-reset)
4. [Subscription States & SDK Access](#subscription-states--sdk-access)
5. [Data Retention & Deletion](#data-retention--deletion)

---

## After 30 Days (Trial Expiration)

### Free Plan with Trial Period

**Configuration:**
- `plan.price = 0` (Free Plan)
- `subscription.trialEndDate` = registration date + 30 days
- `subscription.currentPeriodEnd` = registration date + 30 days

**What Happens:**

#### 1. Daily Cron Job (`/api/cron/expire-trials`)

**Runs**: Daily at 2:00 AM UTC

**Process:**
```typescript
// Finds all active subscriptions with expired trials
where: {
  status: 'active',
  trialEndDate: { lte: now }
}

// For each expired subscription:
1. Disable all feature flags (SDK disabled):
   - sdkEnabled = false
   - apiTracking = false
   - screenTracking = false
   - crashReporting = false
   - logging = false

2. Expire subscription:
   - status = 'expired'

3. Send email notification:
   - Subject: "Your Free Trial Has Ended - Upgrade to Continue"
   - Message: SDK disabled, data preserved, upgrade to continue
```

**Result:**
- ✅ SDK completely disabled (all feature flags set to false)
- ✅ Subscription status: `expired`
- ✅ **Data preserved** (NOT deleted - API Traces, Logs, Sessions, Crashes kept)
- ✅ Email notification sent asking user to upgrade
- ✅ User can upgrade to regain access to all features and data

#### 2. Renewal Cron Job (`/api/cron/renew-subscriptions`)

**Runs**: Daily at 00:00 UTC

**Process:**
```typescript
// Checks if Free Plan should renew
function shouldRenewFreePlan(subscription, plan) {
  // If trial expired, don't renew
  if (subscription.trialEndDate <= new Date()) {
    return false // Don't renew
  }
  
  // If trial still active, renew
  return true
}
```

**Result:**
- ❌ Subscription NOT renewed (trial expired)
- ❌ Meters NOT reset
- ❌ No new billing period

#### 3. SDK Behavior After Expiration

**All SDK Endpoints Return 403 Forbidden:**

```typescript
// Example: POST /api/traces
const validation = await validateSubscription(project.userId)
if (!validation.valid) {
  return NextResponse.json(
    { error: 'Trial expired' },
    { status: 403 }
  )
}
```

**SDK Endpoints Affected:**
- `POST /api/devices` → 403 Forbidden
- `POST /api/traces` → 403 Forbidden
- `POST /api/logs` → 403 Forbidden
- `POST /api/sessions` → 403 Forbidden
- `POST /api/crashes` → 403 Forbidden
- `GET /api/feature-flags` → Returns all `false`
- `GET /api/sdk-init` → Returns error

**User Experience:**
- SDK stops collecting data (disabled)
- Dashboard shows "Trial Expired" banner with upgrade prompt
- Email sent: "Your Free Trial Has Ended - Upgrade to Continue"
- **Data is preserved** - user can upgrade to regain access
- User must upgrade to paid plan to continue using SDK and access data

---

## When Plan is Throttled

### Throttling Enforcement

**Throttling IS enforced** in all SDK endpoints.

### How Throttling Works

#### 1. Throttling Check

```typescript
// Example: POST /api/devices
const throttling = await checkThrottling(project.userId, 'devices')

if (throttling.throttled) {
  return NextResponse.json(
    {
      error: throttling.error, // "Quota exceeded for devices. Limit: 100, Used: 100"
      retryAfter: throttling.retryAfter // Seconds until next period
    },
    {
      status: 429, // Too Many Requests
      headers: {
        'Retry-After': throttling.retryAfter?.toString() || '3600'
      }
    }
  )
}
```

#### 2. Throttling Logic

```typescript
// From src/lib/throttling.ts
if (meter.used >= meter.limit) {
  // Calculate retry after (next period start)
  const retryAfter = Math.ceil(
    (usage.currentPeriodEnd.getTime() - Date.now()) / 1000
  )
  
  return {
    throttled: true,
    error: `Quota exceeded for ${meterKey}. Limit: ${meter.limit}, Used: ${meter.used}`,
    retryAfter: retryAfter > 0 ? retryAfter : 0,
    usage: meter
  }
}
```

#### 3. Enforced Endpoints

**All SDK endpoints check throttling:**

| Endpoint | Meter Checked | Response When Throttled |
|----------|---------------|------------------------|
| `POST /api/devices` | `devices` | 429 Too Many Requests |
| `POST /api/traces` | `apiTraces` | 429 Too Many Requests |
| `POST /api/logs` | `logs` | 429 Too Many Requests |
| `POST /api/sessions` | `sessions` | 429 Too Many Requests |
| `POST /api/crashes` | `crashes` | 429 Too Many Requests |

#### 4. Warning Thresholds

**80% Usage:**
- ✅ Request still processed
- ⚠️ Warning logged
- 📧 Email notification sent (if configured)

**90% Usage:**
- ✅ Request still processed
- ⚠️ Warning logged
- 📧 Email notification sent (if configured)
- 🔴 Banner shown in dashboard

**100% Usage (Limit Reached):**
- ❌ Request rejected
- 📊 Returns 429 with `Retry-After` header
- 📧 Email notification sent (if configured)
- 🔴 Banner shown in dashboard

### Example: Free Plan User Hits Device Limit

**Scenario:**
- Plan: Free Plan (100 devices limit)
- Current usage: 100/100 devices (100%)
- User tries to register device #101

**What Happens:**

```typescript
// POST /api/devices
1. Validate API key ✅
2. Validate subscription ✅
3. Validate feature access ✅
4. Check throttling:
   - meter.used = 100
   - meter.limit = 100
   - used >= limit → throttled = true
   
5. Return response:
   {
     "error": "Quota exceeded for devices. Limit: 100, Used: 100",
     "retryAfter": 2592000 // ~30 days until next period
   }
   Status: 429 Too Many Requests
   Headers: {
     "Retry-After": "2592000"
   }
```

**SDK Behavior:**
- SDK receives 429 response
- If `offlineSupport: true`, request queued for next period
- If `offlineSupport: false`, request dropped silently
- User sees error in app logs

**Dashboard Behavior:**
- Shows "100% Used" banner
- "Upgrade Plan" button displayed
- Usage meter shows red (100%)

---

## Monthly Renewal & Meter Reset

### Renewal Process

**Cron Job**: `/api/cron/renew-subscriptions`  
**Runs**: Daily at 00:00 UTC

### Free Plan Renewal

**If Trial Still Active:**
```typescript
// Trial not expired
if (subscription.trialEndDate > now) {
  // Renew period
  currentPeriodStart = currentPeriodEnd
  currentPeriodEnd = addMonths(currentPeriodEnd, 1)
  
  // Meters reset automatically (recalculated from new periodStart)
  // Data preserved (not deleted)
  // Status stays 'active'
}
```

**If Trial Expired:**
```typescript
// Trial expired
if (subscription.trialEndDate <= now) {
  // Don't renew
  // Subscription expires (handled by expire-trials cron)
}
```

### Paid Plan Renewal

**Process:**
```typescript
1. Create invoice for new period
2. Attempt payment (Stripe)
3. If payment succeeds:
   - currentPeriodStart = currentPeriodEnd
   - currentPeriodEnd = addMonths(currentPeriodEnd, 1)
   - Meters reset automatically
   - Data preserved
   - Status stays 'active'
   
4. If payment fails:
   - Enter grace period (7 days)
   - Status stays 'active' but SDK disabled
   - Retry payment daily
   - If grace period expires → status = 'suspended'
```

### Meter Reset

**Meters reset automatically** when period renews:

```typescript
// Usage calculated from currentPeriodStart to currentPeriodEnd
const usage = await getUsageStats(userId)

// When period renews:
// - currentPeriodStart = new date
// - Usage recalculated from new periodStart
// - Meters show 0/limit (fresh start)
```

**What Resets:**
- ✅ Device registrations (count resets)
- ✅ API Traces (count resets)
- ✅ Logs (count resets)
- ✅ Sessions (count resets)
- ✅ Crashes (count resets)

**What Doesn't Reset:**
- ❌ Device records (kept in database)
- ❌ Historical data (subject to retention policy)
- ❌ Business Config keys (cumulative)
- ❌ Localization keys (cumulative)

---

## Subscription States & SDK Access

### State Matrix

| State | SDK Enabled | Feature Flags | Data Collection | API Access | Data Deleted |
|-------|-------------|---------------|------------------|------------|--------------|
| **ACTIVE** | ✅ Yes | ✅ From Plan | ✅ Yes | ✅ Yes | ❌ No |
| **EXPIRED** | ❌ No | ❌ All False | ❌ No | ❌ 403 Forbidden | ❌ No (preserved) |
| **CANCELLED** | ⚠️ Until period end | ✅ Until period end | ✅ Until period end | ✅ Until period end | ❌ No |
| **SUSPENDED** | ❌ No | ❌ All False | ❌ No | ❌ 403 Forbidden | ❌ No |
| **DISABLED** | ❌ No | ❌ All False | ❌ No | ❌ 403 Forbidden | ❌ No |

### State Transitions

#### ACTIVE → EXPIRED
**Trigger**: Trial expiration (Free Plan)  
**Process**:
1. Cron job detects `trialEndDate <= now`
2. Disables feature flags (SDK disabled)
3. Sets `status = 'expired'`
4. Sends email notification asking user to upgrade
5. SDK endpoints return 403
6. **Data preserved** (NOT deleted - user can upgrade to regain access)

#### ACTIVE → SUSPENDED
**Trigger**: Payment failure (Paid Plan)  
**Process**:
1. Payment fails during renewal
2. Enter grace period (7 days)
3. SDK disabled during grace period
4. Retry payment daily
5. If grace period expires → `status = 'suspended'`
6. SDK endpoints return 403

#### ACTIVE → DISABLED
**Trigger**: Admin disables (`enabled = false`)  
**Process**:
1. Admin sets `subscription.enabled = false`
2. SDK endpoints check `enabled` → return 403
3. Data preserved (not deleted)
4. Can be re-enabled by admin

---

## Data Retention & Deletion

### Data Retention Policy

**Per Plan:**
- `plan.retentionDays` = data retention period (e.g., 30 days)
- `null` = unlimited retention

### When Data is Deleted

#### 1. Trial Expiration (Free Plan)

**Trigger**: `trialEndDate <= now`  
**Action**: SDK disabled, data preserved
- ❌ **Data NOT deleted** (preserved for user to upgrade)
- ✅ SDK disabled (feature flags set to false)
- ✅ Subscription status: `expired`
- ✅ User can upgrade to regain access

**Note**: Data deletion policy will be discussed separately. Currently, data is preserved when trial expires to allow users to upgrade and continue using their data.

#### 2. Retention Period Expired

**Trigger**: Data older than `retentionDays`  
**Action**: Scheduled deletion (future cron job)
- ✅ Old data deleted automatically
- ✅ Only affects data older than retention period

#### 3. Subscription Cancelled

**Action**: Data kept until period end
- ❌ No immediate deletion
- ✅ Data deleted after period ends (if configured)

### Data Deletion Process

```typescript
// From /api/cron/expire-trials
const [apiTracesDeleted, logsDeleted, sessionsDeleted, crashesDeleted] = 
  await Promise.all([
    prisma.apiTrace.deleteMany({
      where: { projectId: { in: projectIds } }
    }),
    prisma.log.deleteMany({
      where: { projectId: { in: projectIds } }
    }),
    prisma.session.deleteMany({
      where: { projectId: { in: projectIds } }
    }),
    prisma.crash.deleteMany({
      where: { projectId: { in: projectIds } }
    })
  ])
```

---

## Summary

### After 30 Days (Trial Expiration)

1. ✅ **Cron job expires subscription** (daily at 2 AM UTC)
2. ✅ **Feature flags disabled** (SDK disabled)
3. ✅ **SDK endpoints return 403** (no access)
4. ✅ **Subscription status: `expired`**
5. ✅ **Email notification sent** (asking user to upgrade)
6. ✅ **Data preserved** (NOT deleted - user can upgrade to regain access)
7. ✅ **No renewal** (trial expired)
8. ✅ **User can upgrade** to continue using SDK and access their data

### When Plan is Throttled

1. ✅ **Throttling IS enforced** (all SDK endpoints check limits)
2. ✅ **Returns 429 Too Many Requests** when limit exceeded
3. ✅ **Includes `Retry-After` header** (seconds until next period)
4. ✅ **SDK queues or drops requests** (based on offline support)
5. ✅ **Dashboard shows usage warnings** (80%, 90%, 100%)

### Monthly Renewal

1. ✅ **Meters reset automatically** (when period renews)
2. ✅ **Data preserved** (not deleted on renewal)
3. ✅ **Fresh start** (usage counts reset to 0)
4. ✅ **Historical data kept** (subject to retention policy)

---

## Related Documentation

- [Subscription Renewal & Billing Lifecycle](./SUBSCRIPTION_RENEWAL_BILLING_LIFECYCLE.md)
- [Plans & Subscriptions Architecture](./PLANS_SUBSCRIPTIONS_ARCHITECTURE.md)
- [Plans & Subscriptions FAQ](./PLANS_SUBSCRIPTIONS_FAQ.md)
- [Throttling Test Results](../../tests/THROTTLING_TEST_RESULTS.md)

