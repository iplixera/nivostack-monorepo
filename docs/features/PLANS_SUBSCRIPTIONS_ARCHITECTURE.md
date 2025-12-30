# Plans & Subscriptions Architecture

**Date**: December 25, 2025  
**Status**: Architecture Documentation  
**Purpose**: Comprehensive understanding of how Plans, Subscriptions, SDK Settings, Feature Flags, Metering, Throttling, and Data Retention work together

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Entity Relationships](#entity-relationships)
3. [SDK-User-Subscription Linkage](#sdk-user-subscription-linkage)
4. [Feature Governance Model](#feature-governance-model)
5. [Metering & Usage Tracking](#metering--usage-tracking)
6. [Throttling & Enforcement](#throttling--enforcement)
7. [Monthly Reset & Billing Periods](#monthly-reset--billing-periods)
8. [Data Retention](#data-retention)
9. [Subscription Lifecycle](#subscription-lifecycle)
10. [Current Gaps & Recommendations](#current-gaps--recommendations)

---

## 1. System Overview

### Core Entities

```
User (1) ──→ (1) Subscription ──→ (1) Plan
  │                                    │
  │                                    ├── Feature Flags (allowApiTracking, etc.)
  │                                    ├── Quota Limits (maxDevices, maxApiTraces, etc.)
  │                                    └── Data Retention (retentionDays)
  │
  └──→ (N) Projects ──→ (1) FeatureFlags (per-project)
                      └──→ (1) SdkSettings (per-project)
```

### Key Concepts

- **Plan**: Template defining limits, features, and pricing
- **Subscription**: User's assignment to a Plan (with optional quota overrides)
- **FeatureFlags**: Per-project SDK feature toggles (currently independent of subscription)
- **SdkSettings**: Per-project SDK configuration (tracking mode, security, performance)
- **Usage Meters**: Track consumption of quota-limited resources

---

## 2. Entity Relationships

### Current Database Schema

```prisma
User {
  id: String
  email: String
  subscription: Subscription? (one-to-one)
  projects: Project[] (one-to-many)
}

Subscription {
  id: String
  userId: String (unique, one-to-one with User)
  planId: String (many-to-one with Plan)
  status: String (active, expired, cancelled, suspended, disabled)
  enabled: Boolean (admin control - if false, SDK disabled globally)
  trialStartDate: DateTime
  trialEndDate: DateTime
  currentPeriodStart: DateTime
  currentPeriodEnd: DateTime
  quotaMaxDevices: Int? (override plan default)
  quotaMaxApiTraces: Int?
  quotaMaxApiRequests: Int?
  // ... other quota overrides
}

Plan {
  id: String
  name: String (unique: "free", "pro", "team", "enterprise")
  price: Float
  maxDevices: Int? (null = unlimited)
  maxApiTraces: Int? (per month)
  maxApiRequests: Int? (per month)
  allowApiTracking: Boolean
  allowScreenTracking: Boolean
  // ... other feature flags
  retentionDays: Int? (data retention period)
}

Project {
  id: String
  userId: String (many-to-one with User)
  apiKey: String (used by SDK)
  featureFlags: FeatureFlags? (one-to-one)
  sdkSettings: SdkSettings? (one-to-one)
}

FeatureFlags {
  projectId: String (unique, one-to-one with Project)
  sdkEnabled: Boolean (master kill switch)
  apiTracking: Boolean
  screenTracking: Boolean
  // ... other features
}

SdkSettings {
  projectId: String (unique, one-to-one with Project)
  trackingMode: String (disabled, debug, production)
  captureRequestBodies: Boolean
  // ... other settings
}
```

---

## 3. SDK-User-Subscription Linkage

### Current Flow

```
SDK Request (X-API-Key)
    ↓
Project Lookup (by apiKey)
    ↓
User (via project.userId)
    ↓
Subscription (via user.subscription)
    ↓
Plan (via subscription.planId)
```

### Current Implementation Status

**✅ What Works:**
- SDK authenticates via `X-API-Key` → finds Project
- Project has `userId` → can find User's Subscription
- Subscription has `planId` → can find Plan

**❌ What's Missing:**
- **No SDK-level subscription checks**: API endpoints (`/api/traces`, `/api/logs`, etc.) don't check subscription status
- **No subscription.enabled enforcement**: When admin disables subscription, SDK still works
- **FeatureFlags are project-level**: Not governed by subscription/plan
- **No throttling enforcement**: Meters are calculated but not enforced

### Recommended Architecture

```
SDK Request Flow:
1. Authenticate via X-API-Key → Get Project
2. Get User via project.userId
3. Get Subscription via user.subscription
4. Check subscription.enabled (if false → reject)
5. Check subscription.status (if expired/cancelled → reject)
6. Get Plan via subscription.planId
7. Check usage meters (if throttled → reject or queue)
8. Check plan feature flags (if feature disabled → reject)
9. Process request
```

---

## 4. Feature Governance Model

### Current State: Dual Control System

**Problem**: Two separate systems control features:

1. **Plan Feature Flags** (`Plan.allowApiTracking`, etc.)
   - Defined at plan level
   - Not enforced in SDK
   - Used for display/UI only

2. **Project Feature Flags** (`FeatureFlags.apiTracking`, etc.)
   - Per-project settings
   - Enforced in SDK (via `/api/feature-flags`)
   - Independent of subscription

### Current Behavior

```typescript
// SDK calls GET /api/feature-flags?X-API-Key=xxx
// Returns: Project's FeatureFlags (not subscription-based)

// Dashboard shows: Project's FeatureFlags (can be toggled independently)
// Subscription page shows: Plan's feature flags (informational only)
```

### Recommended Unified Model

**Option A: Subscription-Driven (Recommended)**
```
Plan Feature Flags → Subscription → Enforced in SDK
Project FeatureFlags → Read-only, synced from Plan
```

**Option B: Hybrid (Current + Enhancement)**
```
Plan Feature Flags → Maximum allowed features
Project FeatureFlags → User can disable (but not enable beyond plan)
Subscription.enabled → Master kill switch
```

**Option C: Plan-Only**
```
Remove Project FeatureFlags
All features controlled by Plan → Subscription → SDK
```

### Recommendation: **Option B (Hybrid Enhanced)**

**Logic:**
1. **Plan defines maximum features** (`allowApiTracking: true`)
2. **Subscription inherits plan features** (can be overridden by admin)
3. **Project FeatureFlags can only disable** (not enable beyond plan)
4. **SDK checks**: `subscription.enabled && plan.allowFeature && project.featureFlag`

**Example:**
- Plan allows `apiTracking: true`
- Subscription is active
- User disables `apiTracking` in project settings → SDK stops tracking
- User cannot enable `apiTracking` if plan doesn't allow it

---

## 5. Metering & Usage Tracking

### Current Implementation

**Location**: `src/lib/subscription.ts` → `getUsageStats()`

**Current Logic:**
```typescript
// Period calculation
periodStart = subscription.trialStartDate
periodEnd = subscription.trialEndDate

// Usage counting
apiTraces = count(where: createdAt >= periodStart AND <= periodEnd)
devices = count(where: userId = user.id) // No date filter
```

### Issues

1. **Wrong Period**: Uses `trialStartDate/trialEndDate` instead of `currentPeriodStart/currentPeriodEnd`
2. **No Monthly Reset**: Meters never reset (only reset when trial ends)
3. **Devices Not Metered**: Device count has no date filter (lifetime count)
4. **No Meter Storage**: Usage calculated on-demand, not stored

### Recommended Metering Architecture

#### 5.1 Meter Types

**Per-Period Meters** (reset monthly):
- `apiTraces` - Count of API traces in current period
- `apiRequests` - Count of API requests in current period
- `logs` - Count of log entries in current period
- `sessions` - Count of sessions in current period
- `crashes` - Count of crashes in current period

**Lifetime Meters** (never reset):
- `devices` - Total registered devices
- `projects` - Total projects
- `apiEndpoints` - Unique API endpoints tracked

**Cumulative Meters** (reset on plan change):
- `businessConfigKeys` - Current count of config keys
- `localizationKeys` - Current count of localization keys
- `localizationLanguages` - Current count of languages

#### 5.2 Period Management

```typescript
// Billing Period Logic
currentPeriodStart: DateTime  // Start of current billing period
currentPeriodEnd: DateTime    // End of current billing period (typically +30 days)

// Monthly Reset Logic (Cron Job)
if (now >= currentPeriodEnd) {
  // Reset period
  subscription.currentPeriodStart = subscription.currentPeriodEnd
  subscription.currentPeriodEnd = addMonths(subscription.currentPeriodEnd, 1)
  
  // Reset per-period meters (but keep data)
  // Usage stats recalculated from periodStart to periodEnd
}
```

#### 5.3 Usage Storage (Optional Enhancement)

**Current**: On-demand calculation (slow for large datasets)

**Recommended**: Store usage snapshots
```prisma
model UsageSnapshot {
  id: String
  subscriptionId: String
  periodStart: DateTime
  periodEnd: DateTime
  meterKey: String // "apiTraces", "logs", etc.
  usedValue: Int
  limitValue: Int?
  createdAt: DateTime
  
  @@unique([subscriptionId, meterKey, periodStart])
}
```

---

## 6. Throttling & Enforcement

### Current State

**❌ No Throttling Enforcement**

**What Exists:**
- Usage calculation (`getUsageStats()`)
- Quota limits (plan defaults + subscription overrides)
- Percentage calculation (`used / limit * 100`)

**What's Missing:**
- No API endpoint checks before processing requests
- No SDK-side throttling
- No queue/reject logic when limits exceeded

### Recommended Throttling Architecture

#### 6.1 Throttling Levels

**Level 1: Hard Limit (Reject)**
```typescript
if (used >= limit) {
  return 429 Too Many Requests
  // SDK should queue or drop request
}
```

**Level 2: Warning Threshold (80%)**
```typescript
if (used >= limit * 0.8) {
  // Continue processing but:
  // - Log warning
  // - Send notification to user
  // - Show banner in dashboard
}
```

**Level 3: Soft Limit (Queue)**
```typescript
if (used >= limit * 0.95) {
  // Queue request for next period
  // Or allow with rate limiting
}
```

#### 6.2 Enforcement Points

**SDK Endpoints** (should check before processing):
- `POST /api/traces` → Check `apiTraces` meter
- `POST /api/logs` → Check `logs` meter
- `POST /api/sessions` → Check `sessions` meter
- `POST /api/crashes` → Check `crashes` meter
- `POST /api/devices` → Check `devices` meter

**Dashboard Actions** (should check before allowing):
- Create project → Check `projects` meter
- Create business config key → Check `businessConfigKeys` meter
- Add localization key → Check `localizationKeys` meter

#### 6.3 Throttling Behavior

**When Limit Exceeded:**
1. **API Request**: Return `429 Too Many Requests` with `Retry-After` header
2. **SDK**: Queue request (if `offlineSupport: true`) or drop silently
3. **Dashboard**: Show error message, disable create buttons

**When Subscription Disabled:**
1. **All SDK endpoints**: Return `403 Forbidden`
2. **Feature flags endpoint**: Return all flags as `false`
3. **SDK-init endpoint**: Return error or disabled config

---

## 7. Monthly Reset & Billing Periods

### Current Implementation

**Problem**: Uses `trialStartDate/trialEndDate` for all meters

```typescript
// Current (WRONG)
periodStart = subscription.trialStartDate  // Never changes
periodEnd = subscription.trialEndDate      // Only changes on plan change
```

### Recommended Implementation

#### 7.1 Billing Period Logic

```typescript
// Correct Period Calculation
periodStart = subscription.currentPeriodStart  // Start of current billing month
periodEnd = subscription.currentPeriodEnd      // End of current billing month

// Monthly Reset (Cron Job - runs daily)
async function resetBillingPeriods() {
  const now = new Date()
  const subscriptions = await prisma.subscription.findMany({
    where: {
      currentPeriodEnd: { lte: now },
      status: 'active',
      enabled: true
    }
  })
  
  for (const sub of subscriptions) {
    // Move to next period
    await prisma.subscription.update({
      where: { id: sub.id },
      data: {
        currentPeriodStart: sub.currentPeriodEnd,
        currentPeriodEnd: addMonths(sub.currentPeriodEnd, 1),
        // Meters automatically reset (calculated from new periodStart)
      }
    })
  }
}
```

#### 7.2 Period Types

**Monthly Subscription** (`interval: "month"`):
- Period = 30 days (or calendar month)
- Reset on `currentPeriodEnd`

**Yearly Subscription** (`interval: "year"`):
- Period = 365 days
- Reset on `currentPeriodEnd`

**Free Plan** (`price: 0`):
- Uses `trialEndDate` as period end
- No automatic renewal
- Admin can extend trial

#### 7.3 Usage Calculation

```typescript
// Per-Period Meters (reset monthly)
apiTraces = count(where: 
  project.userId = userId AND
  createdAt >= currentPeriodStart AND
  createdAt < currentPeriodEnd
)

// Lifetime Meters (never reset)
devices = count(where: project.userId = userId)

// Current State Meters (reset on plan change)
businessConfigKeys = count(where: project.userId = userId)
```

---

## 8. Data Retention

### Current State

**Plan Model Has**: `retentionDays: Int?`

**❌ Not Enforced**: No cron job deletes old data

### Recommended Implementation

#### 8.1 Retention Policy

```typescript
// Retention Logic (Cron Job - runs daily)
async function enforceDataRetention() {
  const subscriptions = await prisma.subscription.findMany({
    include: { plan: true }
  })
  
  for (const sub of subscriptions) {
    const retentionDays = sub.plan.retentionDays || 90 // Default 90 days
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays)
    
    // Delete old data for user's projects
    await Promise.all([
      prisma.apiTrace.deleteMany({
        where: {
          project: { userId: sub.userId },
          createdAt: { lt: cutoffDate }
        }
      }),
      prisma.log.deleteMany({
        where: {
          project: { userId: sub.userId },
          createdAt: { lt: cutoffDate }
        }
      }),
      // ... other data types
    ])
  }
}
```

#### 8.2 Retention by Plan

- **Free Plan**: `retentionDays: 30` (30 days)
- **Pro Plan**: `retentionDays: 90` (90 days)
- **Team Plan**: `retentionDays: 365` (1 year)
- **Enterprise Plan**: `retentionDays: null` (unlimited)

#### 8.3 Retention Scope

**Data Types to Retain/Delete:**
- ✅ `ApiTrace` - Delete after retention period
- ✅ `Log` - Delete after retention period
- ✅ `Session` - Delete after retention period
- ✅ `Crash` - Delete after retention period
- ❌ `Device` - Keep (needed for device tracking)
- ❌ `Project` - Keep (core entity)
- ❌ `BusinessConfig` - Keep (configuration data)
- ❌ `LocalizationKey` - Keep (translation data)

---

## 9. Subscription Lifecycle

### 9.1 Subscription States

```
CREATED → ACTIVE → (EXPIRED | CANCELLED | SUSPENDED | DISABLED)
```

**State Transitions:**

1. **ACTIVE** → **EXPIRED**
   - Trigger: `trialEndDate` passed AND no payment
   - Action: Disable all features, delete data (if retention expired)

2. **ACTIVE** → **CANCELLED**
   - Trigger: User cancels subscription
   - Action: Continue until `currentPeriodEnd`, then disable

3. **ACTIVE** → **SUSPENDED**
   - Trigger: Payment failure
   - Action: Disable features, keep data (7-day grace period)

4. **ACTIVE** → **DISABLED**
   - Trigger: Admin disables (`enabled: false`)
   - Action: Immediately disable SDK, keep data

5. **DISABLED** → **ACTIVE**
   - Trigger: Admin enables (`enabled: true`)
   - Action: Re-enable SDK immediately

### 9.2 SDK Behavior by State

| State | SDK Enabled | Feature Flags | Data Collection | API Access |
|-------|-------------|---------------|-----------------|------------|
| **ACTIVE** | ✅ Yes | ✅ From Plan | ✅ Yes | ✅ Yes |
| **EXPIRED** | ❌ No | ❌ All False | ❌ No | ❌ 403 Forbidden |
| **CANCELLED** | ⚠️ Until period end | ✅ Until period end | ✅ Until period end | ✅ Until period end |
| **SUSPENDED** | ❌ No | ❌ All False | ❌ No | ❌ 403 Forbidden |
| **DISABLED** | ❌ No | ❌ All False | ❌ No | ❌ 403 Forbidden |

### 9.3 Renewal Logic

**Monthly Subscription:**
```typescript
// On currentPeriodEnd
if (status === 'active' && enabled === true) {
  // Auto-renew (if payment succeeds)
  currentPeriodStart = currentPeriodEnd
  currentPeriodEnd = addMonths(currentPeriodEnd, 1)
  // Meters reset automatically (new period)
}
```

**Free Plan:**
```typescript
// No auto-renewal
// Admin must manually extend trialEndDate
// Or user upgrades to paid plan
```

---

## 10. Current Gaps & Recommendations

### 🔴 Critical Gaps

#### Gap 1: No SDK-Subscription Enforcement
**Current**: SDK endpoints don't check subscription status  
**Impact**: Disabled/expired subscriptions still work  
**Fix**: Add subscription checks to all SDK endpoints

#### Gap 2: Feature Flags Not Subscription-Driven
**Current**: FeatureFlags are project-level, independent of subscription  
**Impact**: Users can enable features not in their plan  
**Fix**: Enforce plan features as maximum, project flags as opt-out only

#### Gap 3: No Throttling Enforcement
**Current**: Meters calculated but not enforced  
**Impact**: Users can exceed limits without restriction  
**Fix**: Add throttling checks before processing requests

#### Gap 4: Wrong Period Calculation
**Current**: Uses `trialStartDate/trialEndDate` for all meters  
**Impact**: Meters never reset, wrong usage displayed  
**Fix**: Use `currentPeriodStart/currentPeriodEnd` for per-period meters

#### Gap 5: No Monthly Reset
**Current**: No cron job to reset billing periods  
**Impact**: Meters accumulate forever  
**Fix**: Implement daily cron job to reset periods

#### Gap 6: No Data Retention Enforcement
**Current**: `retentionDays` exists but not enforced  
**Impact**: Data accumulates forever, storage costs grow  
**Fix**: Implement daily cron job to delete old data

### 🟡 Important Gaps

#### Gap 7: No Usage Snapshot Storage
**Current**: Usage calculated on-demand  
**Impact**: Slow queries for large datasets  
**Fix**: Store usage snapshots daily

#### Gap 8: Devices Meter Not Period-Based
**Current**: Device count has no date filter  
**Impact**: Can't track monthly device registrations  
**Fix**: Add period filter or make it lifetime meter

#### Gap 9: No Overage Tracking
**Current**: No tracking of usage beyond limits  
**Impact**: Can't bill for overages  
**Fix**: Track overage amounts separately

### 🟢 Nice-to-Have Enhancements

#### Gap 10: No Usage Alerts
**Current**: No notifications when approaching limits  
**Fix**: Send email/notification at 80%, 90%, 100%

#### Gap 11: No Grace Period Logic
**Current**: No payment failure handling  
**Fix**: Implement 7-day grace period before suspension

---

## 11. Recommended Implementation Priority

### Phase 1: Critical Fixes (P0)
1. ✅ Add subscription checks to SDK endpoints
2. ✅ Fix period calculation (use `currentPeriodStart/currentPeriodEnd`)
3. ✅ Implement monthly reset cron job
4. ✅ Add throttling enforcement

### Phase 2: Feature Governance (P1)
5. ✅ Unify FeatureFlags with Plan features
6. ✅ Enforce subscription.enabled in SDK
7. ✅ Implement data retention cron job

### Phase 3: Enhancements (P2)
8. ✅ Add usage snapshot storage
9. ✅ Implement overage tracking
10. ✅ Add usage alerts

---

## 12. Architecture Diagrams

### 12.1 SDK Request Flow (Recommended)

```
SDK Request
    ↓
[1] Authenticate (X-API-Key → Project)
    ↓
[2] Get User (project.userId)
    ↓
[3] Get Subscription (user.subscription)
    ↓
[4] Check subscription.enabled
    ├─→ false → Return 403 Forbidden
    └─→ true → Continue
    ↓
[5] Check subscription.status
    ├─→ expired/cancelled/suspended → Return 403 Forbidden
    └─→ active → Continue
    ↓
[6] Get Plan (subscription.planId)
    ↓
[7] Check Plan Feature Flag (e.g., allowApiTracking)
    ├─→ false → Return 403 Feature Not Available
    └─→ true → Continue
    ↓
[8] Check Project FeatureFlag (e.g., apiTracking)
    ├─→ false → Return 403 Feature Disabled by User
    └─→ true → Continue
    ↓
[9] Calculate Usage Meter (e.g., apiTraces)
    ↓
[10] Check Throttling
    ├─→ used >= limit → Return 429 Too Many Requests
    └─→ used < limit → Continue
    ↓
[11] Process Request
    ↓
[12] Increment Usage Meter
```

### 12.2 Feature Flag Hierarchy

```
Plan.allowApiTracking (Maximum)
    ↓
Subscription.enabled (Master Switch)
    ↓
Project.FeatureFlags.apiTracking (User Override - can only disable)
    ↓
SDK Behavior
```

**Logic:**
```typescript
const isApiTrackingEnabled = 
  plan.allowApiTracking &&           // Plan allows it
  subscription.enabled &&             // Subscription is active
  subscription.status === 'active' && // Not expired/cancelled
  project.featureFlags.apiTracking    // User hasn't disabled it
```

### 12.3 Meter Reset Flow

```
Daily Cron Job (runs at 00:00 UTC)
    ↓
Find subscriptions where currentPeriodEnd <= now
    ↓
For each subscription:
    ├─→ Move to next period
    │   currentPeriodStart = currentPeriodEnd
    │   currentPeriodEnd = addMonths(currentPeriodEnd, 1)
    │
    ├─→ Reset per-period meters
    │   (Usage recalculated from new periodStart)
    │
    └─→ Keep lifetime meters unchanged
        (devices, projects, etc.)
```

---

## 13. API Endpoint Changes Required

### Current SDK Endpoints (Need Subscription Checks)

```typescript
// POST /api/traces
// POST /api/logs
// POST /api/sessions
// POST /api/crashes
// POST /api/devices
// GET /api/feature-flags
// GET /api/sdk-init
```

### Required Checks

```typescript
async function validateSubscription(projectId: string) {
  const project = await getProject(projectId)
  const user = await getUser(project.userId)
  const subscription = await getSubscription(user.id)
  
  // Check 1: Subscription exists
  if (!subscription) {
    throw new Error('No subscription found')
  }
  
  // Check 2: Subscription enabled
  if (!subscription.enabled) {
    throw new Error('Subscription disabled by admin')
  }
  
  // Check 3: Subscription active
  if (subscription.status !== 'active') {
    throw new Error(`Subscription ${subscription.status}`)
  }
  
  // Check 4: Trial not expired
  if (subscription.trialEndDate < new Date()) {
    throw new Error('Trial expired')
  }
  
  return { subscription, user, project }
}

async function checkThrottling(
  userId: string,
  meterKey: string,
  increment: number = 1
) {
  const usage = await getUsageStats(userId)
  const meter = usage[meterKey]
  
  if (meter.limit !== null && meter.used + increment > meter.limit) {
    throw new Error(`Quota exceeded for ${meterKey}`)
  }
  
  return true
}
```

---

## 14. Summary: How Everything Works Together

### 14.1 User Journey

1. **User Signs Up** → Free subscription created
2. **User Creates Project** → Project gets API key
3. **SDK Initializes** → Calls `/api/sdk-init` with API key
4. **SDK Gets Config** → Returns feature flags + settings
5. **SDK Sends Data** → Calls `/api/traces`, `/api/logs`, etc.
6. **Usage Tracked** → Meters incremented per request
7. **Monthly Reset** → Cron job resets meters on period end
8. **User Upgrades** → Subscription plan changed
9. **Features Updated** → New plan features available
10. **Data Retained** → Old data deleted per retention policy

### 14.2 Admin Controls

1. **Create/Edit Plans** → Define limits and features
2. **Assign Plan to User** → Create subscription
3. **Override Quotas** → Set custom limits per subscription
4. **Disable Subscription** → `enabled: false` → SDK stops working
5. **Change Plan** → Update subscription.planId
6. **Extend Trial** → Update subscription.trialEndDate

### 14.3 SDK Behavior

1. **On Init**: Check subscription → Get feature flags → Configure SDK
2. **On Request**: Check subscription → Check throttling → Process or reject
3. **On Throttle**: Queue request (if offline support) or drop
4. **On Disable**: All endpoints return 403, feature flags return all false

---

## 15. Next Steps

### Before Implementation

1. **Review this architecture** with stakeholders
2. **Decide on feature governance model** (Option A, B, or C)
3. **Define throttling behavior** (reject vs queue vs rate limit)
4. **Set retention policies** per plan
5. **Design usage snapshot storage** (if needed)

### Implementation Order

1. Fix period calculation (use `currentPeriodStart/currentPeriodEnd`)
2. Add subscription checks to SDK endpoints
3. Implement monthly reset cron job
4. Add throttling enforcement
5. Unify feature flags with plan features
6. Implement data retention cron job

---

**End of Architecture Document**

