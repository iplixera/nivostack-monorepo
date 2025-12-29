# Subscription Renewal & Billing Lifecycle

**Date**: December 25, 2025  
**Status**: Architecture & Recommendations  
**Purpose**: Comprehensive understanding of subscription renewal, billing periods, meter resets, payment handling, and data lifecycle

---

## 📋 Table of Contents

1. [Scenario: Free Plan User with 900/1000 Devices](#scenario-free-plan-user-with-9001000-devices)
2. [Renewal vs New Subscription](#renewal-vs-new-subscription)
3. [Free Plan Renewal Logic](#free-plan-renewal-logic)
4. [Paid Plan Renewal & Payment](#paid-plan-renewal--payment)
5. [Payment Failure Handling](#payment-failure-handling)
6. [Reminder System](#reminder-system)
7. [Meter Reset Logic](#meter-reset-logic)
8. [Data Lifecycle](#data-lifecycle)
9. [Recommended Architecture](#recommended-architecture)
10. [Implementation Gaps](#implementation-gaps)

---

## 1. Scenario: Free Plan User with 900/1000 Devices

### Example Scenario

**User**: New user joins  
**Plan**: Free Plan (quota: 1000 devices)  
**Usage**: 900 devices registered by end of month  
**Question**: What happens at the end of the billing period?

### Current State (Broken)

**❌ Problem**: 
- Meters use `trialStartDate/trialEndDate` (never changes)
- No monthly reset mechanism
- Devices meter has no date filter (lifetime count)
- Renewal logic doesn't exist

**What Actually Happens Now**:
```
Month 1:
  - User registers 900 devices
  - Meter shows: 900/1000 (90%)
  - Period: trialStartDate → trialEndDate (30 days)

End of Month 1:
  - ❌ Nothing happens
  - ❌ Meters don't reset
  - ❌ Period doesn't advance
  - ❌ Usage continues to accumulate

Month 2:
  - User registers 200 more devices
  - Meter shows: 1100/1000 (110% - exceeded!)
  - But still works because throttling not enforced
```

### Recommended Behavior

**✅ Correct Flow**:

```
Month 1 (Jan 1 - Jan 31):
  - Period: currentPeriodStart = Jan 1, currentPeriodEnd = Jan 31
  - User registers 900 devices
  - Meter: 900/1000 devices (90%)
  - Data: All 900 devices stored

End of Month 1 (Jan 31, 23:59:59):
  - Cron job runs (daily at 00:00 UTC on Feb 1)
  - Check: currentPeriodEnd <= now
  - For Free Plan:
    - Check if trialEndDate > now (trial still active)
    - If trial active → Renew period
    - If trial expired → Don't renew, expire subscription

Month 2 (Feb 1 - Feb 28):
  - If renewed:
    - currentPeriodStart = Feb 1 (was Jan 31)
    - currentPeriodEnd = Feb 28 (was Jan 31 + 30 days)
    - Meter resets: 0/1000 devices (fresh start)
    - Old data: Kept (900 devices still in database)
    - New registrations: Counted from Feb 1 onwards
  - If expired:
    - Subscription status = 'expired'
    - SDK disabled
    - Data deleted (after retention period)
```

### Key Points

1. **Meters Reset**: Per-period meters (devices, apiTraces, logs, etc.) reset to 0
2. **Data Preserved**: Old data is NOT deleted (only deleted per retention policy)
3. **Same Subscription**: We don't create a new subscription, we renew the existing one
4. **Period Advances**: `currentPeriodStart` and `currentPeriodEnd` move forward

---

## 2. Renewal vs New Subscription

### Question: Should renewal reset meters or create new subscription?

### Answer: **Renewal Resets Meters, Same Subscription**

**Architecture Decision**:

```
❌ WRONG: Create new subscription each month
✅ CORRECT: Renew existing subscription, reset meters
```

### Why Same Subscription?

**Benefits**:
1. **Historical Tracking**: One subscription = one billing history
2. **Invoice Generation**: Each period generates one invoice
3. **Quota Overrides**: Admin-set overrides persist across renewals
4. **User Experience**: User sees one subscription, not multiple
5. **Analytics**: Easier to track lifetime value, churn, etc.

### How Renewal Works

```typescript
// Renewal Logic (Cron Job)
async function renewSubscription(subscriptionId: string) {
  const subscription = await getSubscriptionById(subscriptionId)
  const plan = await getPlan(subscription.planId)
  
  // Move to next billing period
  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      currentPeriodStart: subscription.currentPeriodEnd,
      currentPeriodEnd: addMonths(subscription.currentPeriodEnd, plan.interval === 'month' ? 1 : 12),
      // Meters automatically reset (recalculated from new currentPeriodStart)
      // Status stays 'active'
      // enabled stays true
    }
  })
  
  // Generate invoice for new period (if paid plan)
  if (plan.price > 0) {
    await createInvoice(subscriptionId, {
      periodStart: subscription.currentPeriodEnd,
      periodEnd: addMonths(subscription.currentPeriodEnd, plan.interval === 'month' ? 1 : 12),
      amount: subscription.discountedPrice || plan.price,
      status: 'open',
      dueDate: addDays(subscription.currentPeriodEnd, 7), // 7 days grace period
    })
  }
}
```

### Meter Reset Logic

**Per-Period Meters** (reset monthly):
- `apiTraces` - Count from `currentPeriodStart` to `currentPeriodEnd`
- `apiRequests` - Count from `currentPeriodStart` to `currentPeriodEnd`
- `logs` - Count from `currentPeriodStart` to `currentPeriodEnd`
- `sessions` - Count from `currentPeriodStart` to `currentPeriodEnd`
- `crashes` - Count from `currentPeriodStart` to `currentPeriodEnd`
- `devices` - **DECISION NEEDED**: Period-based or lifetime?

**Lifetime Meters** (never reset):
- `projects` - Total projects (never reset)
- `businessConfigKeys` - Current count (reset on plan change only)
- `localizationKeys` - Current count (reset on plan change only)

**Recommendation for Devices**:
- **Option A**: Period-based (reset monthly) - "Devices registered this month"
- **Option B**: Lifetime (never reset) - "Total devices ever registered"
- **Option C**: Hybrid - Track both "devices this month" and "total devices"

**Recommended: Option A (Period-Based)**
- Aligns with other per-period meters
- Allows monthly device registration limits
- More predictable billing

---

## 3. Free Plan Renewal Logic

### Current State

**Problem**: Free Plan uses `trialEndDate` which is confusing

### Free Plan Types

#### Type 1: Free Plan with Trial Period

**Configuration**:
- `plan.price = 0`
- `plan.name = "free"`
- `subscription.trialEndDate` = registration date + 30 days
- `subscription.currentPeriodEnd` = registration date + 30 days

**Renewal Logic**:
```typescript
// Free Plan with Trial
if (plan.price === 0 && subscription.trialEndDate > now) {
  // Trial still active → Renew period
  renewSubscription(subscriptionId)
} else if (plan.price === 0 && subscription.trialEndDate <= now) {
  // Trial expired → Don't renew, expire subscription
  await expireSubscription(subscriptionId)
}
```

**Behavior**:
- ✅ Renews monthly while trial is active
- ❌ Stops renewing when trial expires
- ❌ Data deleted after trial expires
- ❌ Features disabled after trial expires

#### Type 2: Free Plan without Trial (Forever Free)

**Configuration**:
- `plan.price = 0`
- `plan.name = "free"`
- `subscription.trialEndDate` = null or far future (2099-12-31)
- `subscription.currentPeriodEnd` = registration date + 30 days

**Renewal Logic**:
```typescript
// Forever Free Plan
if (plan.price === 0 && subscription.trialEndDate === null) {
  // Forever free → Always renew
  renewSubscription(subscriptionId)
}
```

**Behavior**:
- ✅ Renews monthly forever
- ✅ Meters reset monthly
- ✅ Data kept (subject to retention policy)
- ✅ Features remain enabled

### Recommended Free Plan Model

**Hybrid Approach**:

```typescript
// Free Plan Renewal Decision
function shouldRenewFreePlan(subscription: Subscription, plan: Plan): boolean {
  // If trialEndDate is set and expired → Don't renew
  if (subscription.trialEndDate && subscription.trialEndDate <= new Date()) {
    return false // Trial expired
  }
  
  // If trialEndDate is null or far future → Always renew
  if (!subscription.trialEndDate || subscription.trialEndDate > new Date('2099-12-31')) {
    return true // Forever free
  }
  
  // Trial still active → Renew
  return true
}
```

### Free Plan Renewal Flow

```
Free Plan User - Month 1:
  - Registration: Jan 1
  - trialEndDate: Feb 1 (30-day trial)
  - currentPeriodStart: Jan 1
  - currentPeriodEnd: Jan 31
  - Devices: 900/1000

End of Month 1 (Jan 31):
  - Cron job checks: currentPeriodEnd <= now
  - Check: trialEndDate (Feb 1) > now (Jan 31) → Trial active
  - Action: Renew period
  - Result:
    - currentPeriodStart = Feb 1
    - currentPeriodEnd = Feb 28
    - Meter resets: 0/1000 devices
    - Status: 'active'
    - Data: 900 devices kept

Free Plan User - Month 2:
  - Period: Feb 1 - Feb 28
  - Devices: 200/1000 (new registrations)
  - Total devices in DB: 1100 (900 from Jan + 200 from Feb)

End of Month 2 (Feb 28):
  - Cron job checks: currentPeriodEnd <= now
  - Check: trialEndDate (Feb 1) <= now (Feb 28) → Trial expired
  - Action: Don't renew, expire subscription
  - Result:
    - Status: 'expired'
    - SDK disabled
    - Data deleted (after retention period)
```

---

## 4. Paid Plan Renewal & Payment

### Paid Plan Renewal Flow

```
Paid Plan User - Month 1:
  - Plan: Pro Plan ($29.99/month)
  - Registration: Jan 1
  - currentPeriodStart: Jan 1
  - currentPeriodEnd: Jan 31
  - Payment method: Credit card on file
  - Devices: 900/1000

End of Month 1 (Jan 31):
  - Cron job: currentPeriodEnd <= now
  - Step 1: Attempt payment
    - Charge credit card: $29.99
    - Payment result: Success/Failure
  - Step 2: If payment succeeds
    - Renew period
    - Create invoice (status: 'paid')
    - Reset meters
  - Step 3: If payment fails
    - Don't renew period
    - Create invoice (status: 'open')
    - Enter grace period (7 days)
    - Send payment failure notification
```

### Payment Processing Flow

```typescript
async function renewPaidSubscription(subscriptionId: string) {
  const subscription = await getSubscription(subscriptionId)
  const plan = await getPlan(subscription.planId)
  const user = await getUser(subscription.userId)
  
  // Step 1: Create invoice for new period
  const invoice = await createInvoice(subscriptionId, {
    periodStart: subscription.currentPeriodEnd,
    periodEnd: addMonths(subscription.currentPeriodEnd, 1),
    amount: subscription.discountedPrice || plan.price,
    status: 'draft',
    dueDate: addDays(subscription.currentPeriodEnd, 7),
  })
  
  // Step 2: Attempt payment (if payment method exists)
  if (user.paymentMethodId) {
    const paymentResult = await chargePaymentMethod(
      user.paymentMethodId,
      invoice.amount,
      `DevBridge ${plan.displayName} - ${formatPeriod(invoice.periodStart, invoice.periodEnd)}`
    )
    
    if (paymentResult.success) {
      // Payment succeeded
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          status: 'paid',
          paidAt: new Date(),
        }
      })
      
      // Renew subscription
      await renewSubscription(subscriptionId)
      
      return { success: true, invoice }
    } else {
      // Payment failed
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          status: 'open', // Unpaid
        }
      })
      
      // Enter grace period
      await enterGracePeriod(subscriptionId, {
        invoiceId: invoice.id,
        gracePeriodEnd: addDays(new Date(), 7),
        paymentFailureReason: paymentResult.error,
      })
      
      return { success: false, invoice, error: paymentResult.error }
    }
  } else {
    // No payment method - can't renew
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: 'open' }
    })
    
    await enterGracePeriod(subscriptionId, {
      invoiceId: invoice.id,
      gracePeriodEnd: addDays(new Date(), 7),
      paymentFailureReason: 'No payment method on file',
    })
    
    return { success: false, invoice, error: 'No payment method' }
  }
}
```

---

## 5. Payment Failure Handling

### Grace Period Logic

**Current State**: ❌ No grace period implementation

### Recommended Grace Period Flow

```
Payment Failure Timeline:

Day 0 (Period End):
  - Payment attempt fails
  - Invoice status: 'open'
  - Subscription: Still 'active' (grace period)
  - Grace period starts: 7 days
  - SDK: Still works (grace period)
  - Notification: Payment failed email sent

Day 1-6 (Grace Period):
  - Daily retry: Attempt payment every 24 hours
  - If payment succeeds:
    - Invoice status: 'paid'
    - Renew subscription
    - Reset meters
    - Grace period ends
  - If payment still fails:
    - Continue grace period
    - Send reminder emails (Day 3, Day 5, Day 6)

Day 7 (Grace Period End):
  - Final payment attempt
  - If succeeds: Renew subscription
  - If fails: Suspend subscription
    - Status: 'suspended'
    - SDK disabled
    - Data kept (for 30 days)
    - Send final notice

Day 37 (30 days after suspension):
  - If still unpaid:
    - Downgrade to Free Plan
    - Delete data (if Free Plan retention < 30 days)
    - Send cancellation notice
```

### Payment Retry Logic

```typescript
// Daily Cron Job: Retry Failed Payments
async function retryFailedPayments() {
  const now = new Date()
  
  // Find subscriptions in grace period with unpaid invoices
  const subscriptions = await prisma.subscription.findMany({
    where: {
      status: 'active',
      enabled: true,
      invoices: {
        some: {
          status: 'open',
          dueDate: { lte: now },
          periodStart: { lte: now }, // Current or past period
        }
      }
    },
    include: {
      user: true,
      plan: true,
      invoices: {
        where: {
          status: 'open',
        },
        orderBy: { createdAt: 'desc' },
        take: 1,
      }
    }
  })
  
  for (const subscription of subscriptions) {
    const invoice = subscription.invoices[0]
    const gracePeriodEnd = addDays(invoice.dueDate, 7)
    
    // Check if still in grace period
    if (now <= gracePeriodEnd) {
      // Retry payment
      const paymentResult = await attemptPayment(subscription, invoice)
      
      if (paymentResult.success) {
        // Payment succeeded
        await renewSubscription(subscription.id)
        await sendEmail(subscription.user.email, 'payment_succeeded', { invoice })
      } else {
        // Still failed - send reminder if needed
        const daysRemaining = Math.ceil((gracePeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysRemaining === 3 || daysRemaining === 1) {
          await sendEmail(subscription.user.email, 'payment_reminder', {
            invoice,
            daysRemaining,
            gracePeriodEnd,
          })
        }
      }
    } else {
      // Grace period expired - suspend subscription
      await suspendSubscription(subscription.id, {
        reason: 'Payment failure - grace period expired',
        invoiceId: invoice.id,
      })
    }
  }
}
```

### Subscription States During Payment Failure

| Day | Status | SDK Enabled | Data Kept | Actions |
|-----|--------|-------------|-----------|---------|
| 0 (Failure) | `active` | ✅ Yes | ✅ Yes | Send failure email |
| 1-6 (Grace) | `active` | ✅ Yes | ✅ Yes | Retry daily, send reminders |
| 7 (Expired) | `suspended` | ❌ No | ✅ Yes (30 days) | Disable SDK, send final notice |
| 37 (30 days) | `active` (Free) | ⚠️ Limited | ⚠️ Per retention | Downgrade to Free, delete old data |

---

## 6. Reminder System

### Reminder Types

#### 6.1 Payment Reminders

**Triggers**:
- Payment failure (immediate)
- 3 days before grace period ends
- 1 day before grace period ends
- Grace period expired (final notice)

**Email Templates**:
```typescript
// Payment Failure (Day 0)
subject: "Payment Failed - Action Required"
body: "Your payment for DevBridge Pro Plan failed. Please update your payment method."

// Payment Reminder (Day 3)
subject: "Reminder: Payment Due in 3 Days"
body: "Your payment is due in 3 days. Update payment method to avoid service interruption."

// Final Reminder (Day 1)
subject: "Final Notice: Payment Due Tomorrow"
body: "Your payment is due tomorrow. Service will be suspended if payment is not received."

// Grace Period Expired (Day 7)
subject: "Service Suspended - Payment Required"
body: "Your subscription has been suspended due to payment failure. Update payment to restore service."
```

#### 6.2 Trial Expiration Reminders

**Triggers**:
- 7 days before trial ends
- 3 days before trial ends
- 1 day before trial ends
- Trial expired

**Email Templates**:
```typescript
// 7 Days Before
subject: "Your Free Trial Ends in 7 Days"
body: "Upgrade to Pro Plan to continue using DevBridge after your trial ends."

// Trial Expired
subject: "Your Free Trial Has Ended"
body: "Your trial has ended. Upgrade to continue using DevBridge."
```

#### 6.3 Usage Alerts

**Triggers**:
- 80% of quota used
- 90% of quota used
- 100% of quota used (throttled)

**Email Templates**:
```typescript
// 80% Usage
subject: "You've Used 80% of Your Quota"
body: "You've used 80% of your device registration quota. Consider upgrading."

// 100% Usage (Throttled)
subject: "Quota Exceeded - Service Limited"
body: "You've exceeded your quota. Upgrade to continue using all features."
```

### Reminder Implementation

```typescript
// Daily Cron Job: Send Reminders
async function sendReminders() {
  const now = new Date()
  
  // Payment reminders
  await sendPaymentReminders(now)
  
  // Trial expiration reminders
  await sendTrialExpirationReminders(now)
  
  // Usage alerts
  await sendUsageAlerts(now)
}

async function sendPaymentReminders(now: Date) {
  const subscriptions = await prisma.subscription.findMany({
    where: {
      status: 'active',
      invoices: {
        some: {
          status: 'open',
          dueDate: { lte: addDays(now, 7) },
        }
      }
    },
    include: {
      user: true,
      invoices: {
        where: { status: 'open' },
        orderBy: { dueDate: 'asc' },
        take: 1,
      }
    }
  })
  
  for (const sub of subscriptions) {
    const invoice = sub.invoices[0]
    const daysUntilDue = Math.ceil((invoice.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntilDue === 3 || daysUntilDue === 1) {
      await sendEmail(sub.user.email, 'payment_reminder', {
        daysRemaining: daysUntilDue,
        invoice,
      })
    }
  }
}

async function sendTrialExpirationReminders(now: Date) {
  const subscriptions = await prisma.subscription.findMany({
    where: {
      status: 'active',
      plan: { price: 0 }, // Free plans
      trialEndDate: {
        gte: now,
        lte: addDays(now, 7),
      }
    },
    include: { user: true, plan: true }
  })
  
  for (const sub of subscriptions) {
    const daysRemaining = Math.ceil((sub.trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysRemaining === 7 || daysRemaining === 3 || daysRemaining === 1) {
      await sendEmail(sub.user.email, 'trial_expiring', {
        daysRemaining,
        trialEndDate: sub.trialEndDate,
      })
    }
  }
}

async function sendUsageAlerts(now: Date) {
  const subscriptions = await prisma.subscription.findMany({
    where: { status: 'active', enabled: true },
    include: { user: true, plan: true }
  })
  
  for (const sub of subscriptions) {
    const usage = await getUsageStats(sub.userId)
    if (!usage) continue
    
    // Check each meter
    const meters = ['devices', 'apiTraces', 'logs', 'sessions']
    for (const meterKey of meters) {
      const meter = usage[meterKey]
      if (!meter.limit) continue
      
      const percentage = meter.percentage
      
      if (percentage >= 100 && !sub.lastAlert100) {
        await sendEmail(sub.user.email, 'quota_exceeded', { meter: meterKey })
        await prisma.subscription.update({
          where: { id: sub.id },
          data: { lastAlert100: now }
        })
      } else if (percentage >= 90 && percentage < 100 && !sub.lastAlert90) {
        await sendEmail(sub.user.email, 'quota_warning_90', { meter: meterKey })
        await prisma.subscription.update({
          where: { id: sub.id },
          data: { lastAlert90: now }
        })
      } else if (percentage >= 80 && percentage < 90 && !sub.lastAlert80) {
        await sendEmail(sub.user.email, 'quota_warning_80', { meter: meterKey })
        await prisma.subscription.update({
          where: { id: sub.id },
          data: { lastAlert80: now }
        })
      }
    }
  }
}
```

---

## 7. Meter Reset Logic

### Current Problem

**❌ Uses Wrong Period**:
```typescript
// Current (WRONG)
periodStart = subscription.trialStartDate  // Never changes
periodEnd = subscription.trialEndDate      // Only changes on plan change
```

### Recommended Meter Reset

#### 7.1 Per-Period Meters (Reset Monthly)

**Meters that Reset**:
- `apiTraces` - Count from `currentPeriodStart` to `currentPeriodEnd`
- `apiRequests` - Count from `currentPeriodStart` to `currentPeriodEnd`
- `logs` - Count from `currentPeriodStart` to `currentPeriodEnd`
- `sessions` - Count from `currentPeriodStart` to `currentPeriodEnd`
- `crashes` - Count from `currentPeriodStart` to `currentPeriodEnd`
- `devices` - **Count from `currentPeriodStart` to `currentPeriodEnd`** (recommended)

**Reset Logic**:
```typescript
// On renewal
currentPeriodStart = oldPeriodEnd
currentPeriodEnd = addMonths(oldPeriodEnd, 1)

// Usage calculation automatically resets
// Because it queries: createdAt >= currentPeriodStart AND < currentPeriodEnd
// New period = new start date = fresh count
```

#### 7.2 Lifetime Meters (Never Reset)

**Meters that Don't Reset**:
- `projects` - Total projects (lifetime)
- `businessConfigKeys` - Current count (reset on plan change only)
- `localizationKeys` - Current count (reset on plan change only)
- `localizationLanguages` - Current count (reset on plan change only)

#### 7.3 Devices Meter Decision

**Recommendation: Period-Based (Reset Monthly)**

**Reasoning**:
- Aligns with other per-period meters
- Allows monthly device registration limits
- More predictable billing
- Matches user expectation ("devices registered this month")

**Implementation**:
```typescript
// Devices meter (period-based)
devices = prisma.device.count({
  where: {
    project: { userId },
    createdAt: { gte: currentPeriodStart, lt: currentPeriodEnd }
  }
})

// On renewal: Automatically resets to 0
// Because currentPeriodStart changes, query returns new period's count
```

**Alternative: Track Both**
```typescript
// Period-based (resets monthly)
devicesThisMonth = count(where: createdAt >= currentPeriodStart)

// Lifetime (never resets)
totalDevices = count(where: userId = user.id)

// Show both in UI
```

---

## 8. Data Lifecycle

### What Happens to Data at Renewal?

#### Scenario: 900 Devices Registered in Month 1

**Month 1**:
- Devices registered: 900
- Stored in database: 900 Device records
- Meter shows: 900/1000

**End of Month 1 (Renewal)**:
- ✅ Meter resets: 0/1000 (new period)
- ✅ Data preserved: 900 Device records still in database
- ✅ Can query old data: `WHERE createdAt < currentPeriodStart`

**Month 2**:
- New devices registered: 200
- Total in database: 1100 Device records (900 from Jan + 200 from Feb)
- Meter shows: 200/1000 (only Feb registrations)

### Data Retention Policy

**When Data is Deleted**:

```typescript
// Data Retention (Cron Job - runs daily)
async function enforceDataRetention() {
  const subscriptions = await prisma.subscription.findMany({
    include: { plan: true }
  })
  
  for (const sub of subscriptions) {
    const retentionDays = sub.plan.retentionDays || 90
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays)
    
    // Delete old data (older than retentionDays)
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
    
    // Devices: Keep forever (or delete if older than retentionDays?)
    // Recommendation: Keep devices forever (needed for device tracking)
  }
}
```

### Data Deletion Scenarios

#### Scenario 1: Normal Renewal (Paid Plan)

```
Month 1: 900 devices registered
Renewal: Meter resets, data kept
Month 2: 200 more devices registered
Total: 1100 devices in database

After 90 days (retention):
- Month 1 devices (900) → Deleted (older than 90 days)
- Month 2 devices (200) → Kept (within 90 days)
```

#### Scenario 2: Trial Expired (Free Plan)

```
Month 1: 900 devices registered
Trial expires: Subscription expired
Action: Delete all data (immediately or after grace period?)
```

**Recommendation**: 
- Free Plan trial expiration → Delete data after 7-day grace period
- Paid Plan cancellation → Keep data for retention period, then delete

#### Scenario 3: Subscription Suspended (Payment Failure)

```
Month 1: 900 devices registered
Payment fails: Subscription suspended
Action: Keep data for 30 days
After 30 days: If still unpaid → Downgrade to Free → Delete data
```

---

## 9. Recommended Architecture

### 9.1 Subscription Renewal Flow

```typescript
// Daily Cron Job: Renew Subscriptions
async function processRenewals() {
  const now = new Date()
  
  // Find subscriptions that need renewal
  const subscriptions = await prisma.subscription.findMany({
    where: {
      currentPeriodEnd: { lte: now },
      status: 'active',
      enabled: true,
    },
    include: {
      plan: true,
      user: true,
    }
  })
  
  for (const subscription of subscriptions) {
    const plan = subscription.plan
    
    // Decision: Should renew?
    if (plan.price === 0) {
      // Free Plan
      if (shouldRenewFreePlan(subscription, plan)) {
        await renewFreePlan(subscription.id)
      } else {
        await expireSubscription(subscription.id)
      }
    } else {
      // Paid Plan
      await renewPaidPlan(subscription.id)
    }
  }
}

async function renewFreePlan(subscriptionId: string) {
  const subscription = await getSubscriptionById(subscriptionId)
  
  // Check if trial expired
  if (subscription.trialEndDate && subscription.trialEndDate <= new Date()) {
    // Trial expired - don't renew
    await expireSubscription(subscriptionId)
    return
  }
  
  // Trial still active - renew period
  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      currentPeriodStart: subscription.currentPeriodEnd,
      currentPeriodEnd: addMonths(subscription.currentPeriodEnd, 1),
      // Meters automatically reset (recalculated from new periodStart)
    }
  })
  
  // Log renewal
  await createAuditLog({
    subscriptionId,
    action: 'renewed',
    details: 'Free plan period renewed',
  })
}

async function renewPaidPlan(subscriptionId: string) {
  const subscription = await getSubscriptionById(subscriptionId)
  const plan = await getPlan(subscription.planId)
  const user = await getUser(subscription.userId)
  
  // Step 1: Create invoice
  const invoice = await createInvoice(subscriptionId, {
    periodStart: subscription.currentPeriodEnd,
    periodEnd: addMonths(subscription.currentPeriodEnd, plan.interval === 'month' ? 1 : 12),
    amount: subscription.discountedPrice || plan.price,
    status: 'draft',
    dueDate: addDays(subscription.currentPeriodEnd, 7),
  })
  
  // Step 2: Attempt payment
  if (user.paymentMethodId) {
    const paymentResult = await attemptPayment(user.paymentMethodId, invoice.amount)
    
    if (paymentResult.success) {
      // Payment succeeded - renew
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: 'paid', paidAt: new Date() }
      })
      
      await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          currentPeriodStart: subscription.currentPeriodEnd,
          currentPeriodEnd: addMonths(subscription.currentPeriodEnd, plan.interval === 'month' ? 1 : 12),
        }
      })
      
      await sendEmail(user.email, 'payment_succeeded', { invoice })
    } else {
      // Payment failed - enter grace period
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: 'open' }
      })
      
      await enterGracePeriod(subscriptionId, {
        invoiceId: invoice.id,
        gracePeriodEnd: addDays(new Date(), 7),
        paymentFailureReason: paymentResult.error,
      })
      
      await sendEmail(user.email, 'payment_failed', { invoice, error: paymentResult.error })
    }
  } else {
    // No payment method - enter grace period
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: 'open' }
    })
    
    await enterGracePeriod(subscriptionId, {
      invoiceId: invoice.id,
      gracePeriodEnd: addDays(new Date(), 7),
      paymentFailureReason: 'No payment method on file',
    })
    
    await sendEmail(user.email, 'payment_method_required', { invoice })
  }
}
```

### 9.2 Grace Period Management

```typescript
// Add to Subscription model
model Subscription {
  // ... existing fields
  gracePeriodEnd      DateTime?  // When grace period ends
  gracePeriodReason   String?    // Why in grace period
  lastPaymentAttempt  DateTime?  // Last payment retry attempt
  paymentRetryCount   Int        @default(0) // Number of retry attempts
}

// Enter grace period
async function enterGracePeriod(
  subscriptionId: string,
  options: {
    invoiceId: string
    gracePeriodEnd: Date
    paymentFailureReason: string
  }
) {
  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      gracePeriodEnd: options.gracePeriodEnd,
      gracePeriodReason: options.paymentFailureReason,
      lastPaymentAttempt: new Date(),
      paymentRetryCount: 1,
      // Status stays 'active' during grace period
    }
  })
}

// Retry payment (daily cron)
async function retryFailedPayments() {
  const now = new Date()
  
  const subscriptions = await prisma.subscription.findMany({
    where: {
      status: 'active',
      gracePeriodEnd: { lte: addDays(now, 1), gte: now }, // Within 24 hours of expiry
      invoices: {
        some: { status: 'open' }
      }
    },
    include: {
      user: true,
      invoices: {
        where: { status: 'open' },
        orderBy: { createdAt: 'desc' },
        take: 1,
      }
    }
  })
  
  for (const sub of subscriptions) {
    // Don't retry more than once per day
    if (sub.lastPaymentAttempt && 
        getDaysBetween(sub.lastPaymentAttempt, now) < 1) {
      continue
    }
    
    const invoice = sub.invoices[0]
    const paymentResult = await attemptPayment(sub.user.paymentMethodId, invoice.amount)
    
    await prisma.subscription.update({
      where: { id: sub.id },
      data: {
        lastPaymentAttempt: new Date(),
        paymentRetryCount: { increment: 1 }
      }
    })
    
    if (paymentResult.success) {
      await renewSubscription(sub.id)
    } else if (now >= sub.gracePeriodEnd) {
      await suspendSubscription(sub.id)
    }
  }
}
```

---

## 10. Implementation Gaps

### 🔴 Critical Gaps

#### Gap 1: No Renewal Logic
**Current**: No cron job to renew subscriptions  
**Impact**: Meters never reset, periods never advance  
**Fix**: Implement daily renewal cron job

#### Gap 2: Wrong Period Calculation
**Current**: Uses `trialStartDate/trialEndDate`  
**Impact**: Meters never reset  
**Fix**: Use `currentPeriodStart/currentPeriodEnd`

#### Gap 3: No Payment Processing
**Current**: No payment provider integration  
**Impact**: Can't charge for paid plans  
**Fix**: Integrate Stripe/PayPal/etc.

#### Gap 4: No Grace Period
**Current**: No payment failure handling  
**Impact**: Can't handle failed payments gracefully  
**Fix**: Implement grace period logic

#### Gap 5: No Payment Retry
**Current**: No automatic retry mechanism  
**Impact**: One failure = immediate suspension  
**Fix**: Implement daily retry logic

#### Gap 6: No Reminder System
**Current**: No email notifications  
**Impact**: Users don't know about issues  
**Fix**: Implement email reminder system

### 🟡 Important Gaps

#### Gap 7: Devices Meter Type Unclear
**Current**: No date filter on devices  
**Impact**: Can't track monthly device registrations  
**Fix**: Decide on period-based vs lifetime

#### Gap 8: No Usage Snapshot Storage
**Current**: Usage calculated on-demand  
**Impact**: Slow for large datasets  
**Fix**: Store daily usage snapshots

#### Gap 9: No Overage Tracking
**Current**: No tracking of usage beyond limits  
**Impact**: Can't bill for overages  
**Fix**: Track overage amounts

---

## 11. Recommended Implementation Order

### Phase 1: Core Renewal (P0)
1. Fix period calculation (`currentPeriodStart/currentPeriodEnd`)
2. Implement renewal cron job
3. Implement Free Plan renewal logic
4. Implement meter reset logic

### Phase 2: Payment Processing (P0)
5. Integrate payment provider (Stripe)
6. Implement payment attempt logic
7. Implement invoice generation
8. Implement grace period logic

### Phase 3: Payment Retry & Reminders (P1)
9. Implement payment retry cron job
10. Implement reminder email system
11. Implement usage alerts

### Phase 4: Enhancements (P2)
12. Implement usage snapshot storage
13. Implement overage tracking
14. Add payment method management UI

---

## 12. Example: Complete Renewal Scenario

### Free Plan User - 900/1000 Devices

**Timeline**:

```
Jan 1: User registers
  - Subscription created: Free Plan
  - trialEndDate: Feb 1 (30-day trial)
  - currentPeriodStart: Jan 1
  - currentPeriodEnd: Jan 31
  - Status: 'active'

Jan 1-31: User uses service
  - Registers 900 devices
  - Meter: 900/1000 devices (90%)
  - Data: 900 Device records in database

Feb 1, 00:00 UTC: Renewal Cron Job Runs
  - Check: currentPeriodEnd (Jan 31) <= now (Feb 1) → True
  - Check: plan.price === 0 → Free Plan
  - Check: trialEndDate (Feb 1) > now (Feb 1, 00:00) → False (expired)
  - Decision: Don't renew, expire subscription
  - Action:
    - Status: 'expired'
    - SDK disabled
    - Data deleted (after retention period)
    - Feature flags disabled

Alternative: If trialEndDate was Feb 15
  - Check: trialEndDate (Feb 15) > now (Feb 1) → True (still active)
  - Decision: Renew period
  - Action:
    - currentPeriodStart = Feb 1 (was Jan 31)
    - currentPeriodEnd = Feb 28 (was Jan 31 + 30 days)
    - Meter resets: 0/1000 devices
    - Data preserved: 900 devices still in database
    - Status: 'active'
    - SDK: Still enabled
```

### Paid Plan User - 900/1000 Devices

**Timeline**:

```
Jan 1: User subscribes to Pro Plan ($29.99/month)
  - Subscription created: Pro Plan
  - currentPeriodStart: Jan 1
  - currentPeriodEnd: Jan 31
  - Payment method: Credit card on file
  - Status: 'active'

Jan 1-31: User uses service
  - Registers 900 devices
  - Meter: 900/1000 devices (90%)
  - Data: 900 Device records

Feb 1, 00:00 UTC: Renewal Cron Job Runs
  - Check: currentPeriodEnd (Jan 31) <= now (Feb 1) → True
  - Check: plan.price > 0 → Paid Plan
  - Action: Attempt renewal
  
  Step 1: Create Invoice
    - Invoice created: $29.99
    - Status: 'draft'
    - Period: Feb 1 - Feb 28
    - Due date: Feb 8 (7 days grace)
  
  Step 2: Attempt Payment
    - Charge credit card: $29.99
    - Result: Success ✅
  
  Step 3: Renew Subscription
    - Invoice status: 'paid'
    - currentPeriodStart = Feb 1
    - currentPeriodEnd = Feb 28
    - Meter resets: 0/1000 devices
    - Data preserved: 900 devices
    - Status: 'active'
    - Email sent: Payment succeeded

Feb 1-28: User uses service
  - Registers 200 more devices
  - Meter: 200/1000 devices (20%)
  - Total in DB: 1100 devices (900 from Jan + 200 from Feb)
```

### Paid Plan - Payment Failure Scenario

**Timeline**:

```
Feb 1, 00:00 UTC: Renewal Attempt
  - Payment fails: Insufficient funds
  - Invoice status: 'open'
  - Grace period starts: 7 days (until Feb 8)
  - Status: 'active' (still works during grace)
  - Email sent: Payment failed

Feb 2-7: Daily Retry Attempts
  - Day 2: Retry payment → Still fails
  - Day 3: Retry payment → Still fails, send reminder
  - Day 4: Retry payment → Still fails
  - Day 5: Retry payment → Still fails, send reminder
  - Day 6: Retry payment → Still fails
  - Day 7: Retry payment → Still fails, send final reminder

Feb 8, 00:00 UTC: Grace Period Expires
  - Final payment attempt → Still fails
  - Action: Suspend subscription
    - Status: 'suspended'
    - SDK disabled
    - Data kept (for 30 days)
    - Email sent: Service suspended

Mar 8, 00:00 UTC: 30 Days After Suspension
  - Check: Still unpaid
  - Action: Downgrade to Free Plan
    - Status: 'active'
    - Plan: Free Plan
    - Data deleted (Free Plan retention: 30 days)
    - Email sent: Downgraded to Free Plan
```

---

## 13. Summary: Answers to Your Questions

### Q1: What happens to 900 devices at end of month?

**Answer**: 
- **Meter resets**: 0/1000 (new period starts)
- **Data preserved**: 900 Device records kept in database
- **Can query old data**: Yes, via `createdAt < currentPeriodStart`
- **New registrations**: Counted separately in new period

### Q2: Should renewal reset meters or create new subscription?

**Answer**: 
- **Renewal resets meters** (same subscription)
- **Don't create new subscription** (keep one subscription for history)
- **Period advances**: `currentPeriodStart` and `currentPeriodEnd` move forward
- **Meters recalculate**: From new `currentPeriodStart` to `currentPeriodEnd`

### Q3: Free plan renewal logic?

**Answer**:
- **Free Plan with Trial**: Renews monthly while trial active, stops when trial expires
- **Free Plan Forever**: Renews monthly forever (if `trialEndDate` is null/far future)
- **Decision**: Check `trialEndDate` - if expired, don't renew; if active/null, renew

### Q4: Paid plan renewal requires payment?

**Answer**:
- **Yes**: Payment must succeed to renew
- **If payment fails**: Enter 7-day grace period
- **During grace**: SDK still works, daily retry attempts
- **After grace**: Suspend subscription if still unpaid

### Q5: Payment retry logic?

**Answer**:
- **Daily retries**: Attempt payment once per day during grace period
- **Reminders**: Send emails at Day 3, Day 5, Day 6, Day 7
- **After grace**: Suspend subscription
- **After 30 days**: Downgrade to Free Plan if still unpaid

### Q6: Additional recommendations?

**Answer**: See Section 10 (Implementation Gaps) and Section 11 (Implementation Order)

---

**End of Document**

