# Plans & Subscriptions - FAQ & Current State

**Date**: December 25, 2025  
**Purpose**: Direct answers to specific questions about Plans, Subscriptions, SDK Settings, and Feature Governance

---

## Q1: How is SDK-User linked to SDK Settings?

### Current State

**Linkage Chain:**
```
SDK (X-API-Key) → Project → User → Subscription → Plan
```

**SDK Settings:**
- Stored per **Project** (`SdkSettings.projectId`)
- Not linked to Subscription or Plan
- Independent configuration (tracking mode, security, performance)

**Feature Flags:**
- Stored per **Project** (`FeatureFlags.projectId`)
- Not linked to Subscription or Plan
- Can be toggled independently by user

### Problem

**❌ No Governance**: SDK Settings and Feature Flags are project-level only. They don't respect:
- Subscription status (enabled/disabled)
- Plan feature flags (`allowApiTracking`, etc.)
- Subscription limits

### Answer

**Current**: SDK-User linkage exists but **not enforced**. SDK can work even if:
- Subscription is disabled
- Subscription is expired
- Plan doesn't allow the feature

**Recommended**: SDK should check subscription before processing any request.

---

## Q2: Is there actual governance on how SDK works based on subscription model?

### Current State

**❌ NO - No Governance Currently**

**What Exists:**
- Plan has feature flags (`allowApiTracking`, `allowScreenTracking`, etc.)
- Subscription has `enabled` field (admin control)
- Subscription has `status` field (active, expired, cancelled, etc.)

**What's Missing:**
- SDK endpoints don't check subscription status
- Feature flags don't respect plan features
- No throttling enforcement

### Answer

**No, there is currently NO governance**. The SDK works independently of:
- Subscription status
- Plan features
- Usage limits

**This is a critical gap** that needs to be fixed.

---

## Q3: Do we have metered usages for the SDK and handle behavior after throttling?

### Current State

**Metering: ✅ Exists**
- Usage calculated in `getUsageStats()`
- Tracks: apiTraces, logs, sessions, crashes, devices, projects
- Shows percentage used vs limit

**Throttling: ❌ NOT Enforced**

**What Happens When Limit Exceeded:**
- **Nothing** - Requests still processed
- No rejection
- No queuing
- No rate limiting

### Answer

**Meters exist but throttling is NOT enforced**. When a user exceeds their limit:
- API requests still succeed
- Data still collected
- No error returned to SDK
- Only UI shows "100% used" but functionality continues

**This needs to be fixed** to enforce limits.

---

## Q4: If we disable features from the plan, does that reflect on Product Features settings?

### Current State

**❌ NO - They are Separate Systems**

**Plan Features** (`Plan.allowApiTracking`):
- Defined at plan level
- Shown in subscription page (informational)
- **NOT enforced** in SDK
- **NOT synced** to project FeatureFlags

**Project Features** (`FeatureFlags.apiTracking`):
- Stored per project
- Can be toggled by user in dashboard
- Enforced in SDK (via `/api/feature-flags`)
- **Independent** of plan features

### Answer

**No, they are completely separate**. Disabling a feature in Plan does NOT:
- Update project FeatureFlags
- Disable the feature in SDK
- Show any indication in UI

**This is confusing and needs to be unified**.

### Recommended Solution

**Option 1: Plan-Driven (Recommended)**
- Plan features = Maximum allowed
- Project FeatureFlags = User can disable (but not enable beyond plan)
- SDK checks: `plan.allowFeature && project.featureFlag`

**Option 2: Subscription Override**
- Plan features = Default
- Subscription can override (admin control)
- Project FeatureFlags = User can disable only

---

## Q5: Are meters monthly reset? What about data retention?

### Current State

**Monthly Reset: ❌ NO**

**Current Logic:**
```typescript
// Uses trialStartDate/trialEndDate (WRONG)
periodStart = subscription.trialStartDate  // Never changes
periodEnd = subscription.trialEndDate      // Only changes on plan change
```

**Problem**: Meters never reset. They accumulate from trial start until trial end (or forever if trial extended).

### Answer

**No, meters are NOT monthly reset**. They use `trialStartDate/trialEndDate` which:
- Never changes for monthly subscriptions
- Only changes when plan changes
- Results in incorrect usage display

**Should Use**: `currentPeriodStart/currentPeriodEnd` which resets monthly.

### Data Retention

**Current State:**
- Plan has `retentionDays` field
- **NOT enforced** - No cron job deletes old data

**Answer**: Data retention is **defined but NOT enforced**. Old data is never deleted.

**Recommended**: Implement daily cron job to delete data older than `retentionDays`.

---

## Q6: Need full understanding of plans, subscriptions, renewal, and linking with SDK settings

### Complete Flow

#### 6.1 Plan Creation (Admin)
```
Admin creates Plan:
  - Sets limits (maxDevices: 100, maxApiTraces: 1000)
  - Sets features (allowApiTracking: true)
  - Sets retention (retentionDays: 90)
  - Sets price ($29.99/month)
```

#### 6.2 Subscription Creation (Admin or User)
```
Admin assigns Plan to User:
  - Creates Subscription (userId → planId)
  - Sets trialStartDate = now
  - Sets trialEndDate = now + plan.retentionDays
  - Sets currentPeriodStart = now
  - Sets currentPeriodEnd = now + 30 days (for monthly)
  - Can override quotas (quotaMaxDevices: 150)
```

#### 6.3 SDK Initialization
```
SDK calls GET /api/sdk-init?X-API-Key=xxx:
  1. Authenticate via API key → Get Project
  2. Get User (project.userId)
  3. Get Subscription (user.subscription)
  4. Check subscription.enabled (if false → error)
  5. Check subscription.status (if expired → error)
  6. Get Plan (subscription.planId)
  7. Return feature flags (from Plan + Project FeatureFlags)
  8. Return SDK settings (from Project SdkSettings)
```

#### 6.4 SDK Data Collection
```
SDK calls POST /api/traces:
  1. Authenticate → Get Project → Get User → Get Subscription
  2. Check subscription.enabled (if false → 403)
  3. Check plan.allowApiTracking (if false → 403)
  4. Check project.featureFlags.apiTracking (if false → 403)
  5. Calculate usage (apiTraces count in current period)
  6. Check throttling (if used >= limit → 429)
  7. Process request
  8. Increment usage meter
```

#### 6.5 Monthly Renewal
```
Cron Job (runs daily at 00:00 UTC):
  1. Find subscriptions where currentPeriodEnd <= now
  2. For each subscription:
     - currentPeriodStart = currentPeriodEnd
     - currentPeriodEnd = addMonths(currentPeriodEnd, 1)
     - Meters automatically reset (recalculated from new periodStart)
```

#### 6.6 Subscription Disabled
```
Admin disables subscription (enabled: false):
  1. Update subscription.enabled = false
  2. SDK endpoints check this → Return 403
  3. Feature flags endpoint → Return all false
  4. SDK stops working immediately
  5. Data is kept (not deleted)
```

---

## Q7: If subscription is disabled, does that disable SDK?

### Current State

**❌ NO - SDK Still Works**

**What Happens:**
- Admin sets `subscription.enabled = false`
- UI shows "Subscription Disabled"
- **But SDK endpoints don't check this**
- **SDK continues to work normally**

### Answer

**No, currently disabling subscription does NOT disable SDK**. This is a critical gap.

**Should Work Like:**
```
subscription.enabled = false
  ↓
SDK endpoints check this
  ↓
Return 403 Forbidden
  ↓
SDK stops working
```

---

## Summary: Current vs Recommended

### Current Architecture (Broken)

```
SDK → Project → (no subscription check) → Works anyway
Plan Features → (not enforced) → Informational only
Project Features → (independent) → Can enable anything
Meters → (calculated but not enforced) → No throttling
Period → (uses trial dates) → Never resets
Retention → (defined but not enforced) → Data never deleted
```

### Recommended Architecture (Fixed)

```
SDK → Project → User → Subscription → Plan
  ↓
Check subscription.enabled → If false → 403
Check subscription.status → If expired → 403
Check plan features → If disabled → 403
Check project features → If disabled → 403
Check throttling → If exceeded → 429
Process request
```

---

## Critical Issues to Fix

1. **❌ No subscription checks in SDK endpoints**
2. **❌ Feature flags not linked to plans**
3. **❌ No throttling enforcement**
4. **❌ Wrong period calculation**
5. **❌ No monthly reset**
6. **❌ No data retention enforcement**
7. **❌ subscription.enabled not enforced**

---

**See [PLANS_SUBSCRIPTIONS_ARCHITECTURE.md](./PLANS_SUBSCRIPTIONS_ARCHITECTURE.md) for complete architecture details.**

