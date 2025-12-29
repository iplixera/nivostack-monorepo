# Subscription Renewal Architecture Decision

**Date**: December 25, 2025  
**Status**: Architecture Decision Document  
**Purpose**: Analyze renewal approaches and recommend best solution for history tracking and customer lifetime value

---

## 🤔 The Question

**Should renewal reset meters on the same subscription, or create a new subscription for each billing period?**

### Original Recommendation
- **Same Subscription**: Renew period, reset meters
- **Reasoning**: Simpler queries, one record per user, easier quota overrides

### User's Concern
- **New Subscription**: Create new subscription each period
- **Reasoning**: 
  - Need history to know customer lifetime
  - Future offers based on number of subscriptions
  - Better analytics and churn tracking

---

## 📊 Approach Comparison

### Approach A: Same Subscription (Renew Period)

**How It Works**:
```typescript
// Renewal
subscription.currentPeriodStart = oldPeriodEnd
subscription.currentPeriodEnd = addMonths(oldPeriodEnd, 1)
// Meters reset automatically (recalculated from new periodStart)
```

**Pros**:
- ✅ Simple queries: `SELECT * FROM Subscription WHERE userId = ?` → Always get current
- ✅ One record per user (cleaner database)
- ✅ Quota overrides persist across periods
- ✅ Easier to update subscription (plan change, status, etc.)
- ✅ Less database records

**Cons**:
- ❌ Hard to track "how many periods has user been subscribed"
- ❌ No clear history of each billing period
- ❌ Hard to query "subscriptions in January 2025"
- ❌ Need separate audit/history table for tracking
- ❌ Harder to implement "loyalty offers" based on subscription count

**Database Structure**:
```prisma
model Subscription {
  id                String
  userId            String   @unique  // One per user
  planId            String
  currentPeriodStart DateTime
  currentPeriodEnd   DateTime
  // ... other fields
}
```

---

### Approach B: New Subscription Each Period

**How It Works**:
```typescript
// Renewal
const newSubscription = await createSubscription({
  userId: oldSubscription.userId,
  planId: oldSubscription.planId,
  previousSubscriptionId: oldSubscription.id, // Link to previous
  currentPeriodStart: oldSubscription.currentPeriodEnd,
  currentPeriodEnd: addMonths(oldSubscription.currentPeriodEnd, 1),
})

// Mark old as completed
await updateSubscription(oldSubscription.id, {
  status: 'completed',
  nextSubscriptionId: newSubscription.id,
})
```

**Pros**:
- ✅ Clear history: Each period is a distinct record
- ✅ Easy to query: "How many subscriptions has user had?"
- ✅ Easy analytics: "Subscriptions in January 2025"
- ✅ Better for offers: "10th subscription = 20% discount"
- ✅ Each period has its own invoice, status, etc.
- ✅ Better churn analysis (can see gaps in subscriptions)

**Cons**:
- ❌ More complex queries: Need to find "current" subscription
- ❌ Multiple records per user (need to filter by status)
- ❌ Quota overrides need to be copied to new subscription
- ❌ More database records (scales with time)
- ❌ Need to ensure only one "active" subscription at a time

**Database Structure**:
```prisma
model Subscription {
  id                    String
  userId                String   // NOT unique - multiple per user
  planId                String
  previousSubscriptionId String?  // Link to previous period
  nextSubscriptionId     String?  // Link to next period
  status                String   // active, completed, cancelled, expired
  periodStart           DateTime
  periodEnd             DateTime
  // ... other fields
  
  @@index([userId, status])  // For finding current subscription
}
```

---

### Approach C: Hybrid (Recommended) ⭐

**How It Works**:
- Keep one "current" subscription record (for active period)
- Create subscription history/period records for each billing period
- Track subscription count separately

**Pros**:
- ✅ Best of both worlds
- ✅ Simple current subscription query
- ✅ Complete history tracking
- ✅ Easy to count subscriptions for offers
- ✅ Quota overrides persist on current subscription
- ✅ Better analytics without complexity

**Cons**:
- ⚠️ Slightly more complex (two models)
- ⚠️ Need to sync data between models

**Database Structure**:
```prisma
model Subscription {
  id                String
  userId            String   @unique  // One current subscription per user
  planId            String
  currentPeriodStart DateTime
  currentPeriodEnd   DateTime
  subscriptionCount  Int     @default(1)  // Total periods subscribed
  // ... other fields
  
  subscriptionHistory SubscriptionHistory[]
}

model SubscriptionHistory {
  id                String   @id @default(cuid())
  subscriptionId    String
  subscription      Subscription @relation(fields: [subscriptionId], references: [id])
  userId            String   // Denormalized for easy querying
  planId            String
  periodStart       DateTime
  periodEnd         DateTime
  status            String   // completed, cancelled, expired
  totalInvoiced     Float    // Total amount invoiced for this period
  totalPaid          Float?   // Total amount paid
  devicesRegistered  Int      // Usage stats for this period
  apiTracesCount    Int
  // ... other period-specific data
  
  createdAt         DateTime @default(now())
  
  @@index([userId])
  @@index([subscriptionId])
  @@index([periodStart])
}
```

---

## 🎯 Recommendation: **Approach C (Hybrid)**

### Why Hybrid is Best

1. **Current Subscription Queries**: Simple - `WHERE userId = ? AND status = 'active'`
2. **History Tracking**: Complete - `SubscriptionHistory` table has all periods
3. **Subscription Count**: Easy - `subscription.subscriptionCount` or count history records
4. **Offers**: Easy - Check `subscriptionCount` or count history records
5. **Analytics**: Rich - Query `SubscriptionHistory` for any period analysis
6. **Quota Overrides**: Persist - Stored on current `Subscription` record

### Implementation Flow

```typescript
// Renewal Process
async function renewSubscription(subscriptionId: string) {
  const currentSub = await getSubscription(subscriptionId)
  const plan = await getPlan(currentSub.planId)
  
  // Step 1: Create history record for completed period
  await prisma.subscriptionHistory.create({
    data: {
      subscriptionId: currentSub.id,
      userId: currentSub.userId,
      planId: currentSub.planId,
      periodStart: currentSub.currentPeriodStart,
      periodEnd: currentSub.currentPeriodEnd,
      status: 'completed',
      totalInvoiced: currentSub.discountedPrice || plan.price,
      totalPaid: await getTotalPaidForPeriod(currentSub.id),
      devicesRegistered: await getDevicesCount(currentSub.userId, currentSub.currentPeriodStart, currentSub.currentPeriodEnd),
      apiTracesCount: await getApiTracesCount(currentSub.userId, currentSub.currentPeriodStart, currentSub.currentPeriodEnd),
      // ... other usage stats
    }
  })
  
  // Step 2: Update current subscription for new period
  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      currentPeriodStart: currentSub.currentPeriodEnd,
      currentPeriodEnd: addMonths(currentSub.currentPeriodEnd, plan.interval === 'month' ? 1 : 12),
      subscriptionCount: { increment: 1 },  // Increment counter
      // Quota overrides persist automatically
      // Status stays 'active'
    }
  })
  
  // Step 3: Generate invoice for new period (if paid plan)
  if (plan.price > 0) {
    await createInvoice(subscriptionId, {
      periodStart: currentSub.currentPeriodEnd,
      periodEnd: addMonths(currentSub.currentPeriodEnd, plan.interval === 'month' ? 1 : 12),
      amount: currentSub.discountedPrice || plan.price,
    })
  }
}
```

### Query Examples

**Get Current Subscription**:
```typescript
const currentSub = await prisma.subscription.findUnique({
  where: { userId },
  include: { plan: true }
})
```

**Get Subscription History**:
```typescript
const history = await prisma.subscriptionHistory.findMany({
  where: { userId },
  orderBy: { periodStart: 'desc' }
})
```

**Get Subscription Count**:
```typescript
// Option 1: From current subscription
const count = currentSub.subscriptionCount

// Option 2: Count history records
const count = await prisma.subscriptionHistory.count({
  where: { userId, status: 'completed' }
})
```

**Check for Offers**:
```typescript
// "10th subscription = 20% discount"
if (currentSub.subscriptionCount === 10) {
  await applyDiscount(currentSub.id, 20)
}

// "Loyalty bonus after 12 months"
const completedPeriods = await prisma.subscriptionHistory.count({
  where: { userId, status: 'completed' }
})
if (completedPeriods >= 12) {
  await applyLoyaltyBonus(userId)
}
```

**Analytics Queries**:
```typescript
// "Subscriptions in January 2025"
const janSubs = await prisma.subscriptionHistory.findMany({
  where: {
    userId,
    periodStart: { gte: new Date('2025-01-01') },
    periodEnd: { lte: new Date('2025-01-31') }
  }
})

// "Average devices per period"
const avgDevices = await prisma.subscriptionHistory.aggregate({
  where: { userId },
  _avg: { devicesRegistered: true }
})

// "Churn analysis - gaps in subscriptions"
const gaps = await findSubscriptionGaps(userId)
```

---

## 🔄 Alternative: Pure New Subscription Approach

If you prefer **Approach B** (new subscription each period), here's how to implement it:

### Database Schema

```prisma
model Subscription {
  id                    String   @id @default(cuid())
  userId                String   // NOT unique - multiple per user
  planId                String
  plan                  Plan     @relation(fields: [planId], references: [id])
  
  // Period tracking
  periodStart           DateTime
  periodEnd             DateTime
  
  // Status
  status                String   @default("active") // active, completed, cancelled, expired, suspended
  
  // Linking
  previousSubscriptionId String?
  previousSubscription   Subscription? @relation("SubscriptionChain", fields: [previousSubscriptionId], references: [id])
  nextSubscriptionId     String?
  nextSubscription       Subscription? @relation("SubscriptionChain")
  
  // Quota overrides (copied from previous subscription)
  quotaMaxDevices       Int?
  quotaMaxApiTraces     Int?
  // ... other quota overrides
  
  // Admin control
  enabled               Boolean  @default(true)
  
  // Discount/Promo
  promoCodeId           String?
  promoCode             PromoCode? @relation(fields: [promoCodeId], references: [id])
  discountPercent       Float?
  discountAmount        Float?
  discountedPrice       Float?
  
  // Metadata
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  invoices              Invoice[]
  
  @@index([userId, status])  // For finding current subscription
  @@index([userId, periodStart])  // For history queries
  @@index([status])
}
```

### Renewal Logic

```typescript
async function renewSubscription(oldSubscriptionId: string) {
  const oldSub = await getSubscription(oldSubscriptionId)
  const plan = await getPlan(oldSub.planId)
  
  // Step 1: Mark old subscription as completed
  await prisma.subscription.update({
    where: { id: oldSubscriptionId },
    data: {
      status: 'completed',
      nextSubscriptionId: null, // Will be set after creating new one
    }
  })
  
  // Step 2: Create new subscription for next period
  const newSub = await prisma.subscription.create({
    data: {
      userId: oldSub.userId,
      planId: oldSub.planId,
      periodStart: oldSub.periodEnd,
      periodEnd: addMonths(oldSub.periodEnd, plan.interval === 'month' ? 1 : 12),
      status: 'active',
      previousSubscriptionId: oldSub.id,
      // Copy quota overrides from previous subscription
      quotaMaxDevices: oldSub.quotaMaxDevices,
      quotaMaxApiTraces: oldSub.quotaMaxApiTraces,
      // Copy discount/promo
      promoCodeId: oldSub.promoCodeId,
      discountPercent: oldSub.discountPercent,
      discountAmount: oldSub.discountAmount,
      discountedPrice: oldSub.discountedPrice,
    }
  })
  
  // Step 3: Link old subscription to new one
  await prisma.subscription.update({
    where: { id: oldSubscriptionId },
    data: { nextSubscriptionId: newSub.id }
  })
  
  // Step 4: Generate invoice for new period
  if (plan.price > 0) {
    await createInvoice(newSub.id, {
      periodStart: newSub.periodStart,
      periodEnd: newSub.periodEnd,
      amount: newSub.discountedPrice || plan.price,
    })
  }
  
  return newSub
}
```

### Query Current Subscription

```typescript
// Get current active subscription
const currentSub = await prisma.subscription.findFirst({
  where: {
    userId,
    status: 'active',
  },
  orderBy: { periodStart: 'desc' },  // Most recent active
  include: { plan: true }
})

// Or use a helper function
async function getCurrentSubscription(userId: string) {
  return prisma.subscription.findFirst({
    where: { userId, status: 'active' },
    orderBy: { periodStart: 'desc' },
    include: { plan: true }
  })
}
```

### Subscription Count for Offers

```typescript
// Count completed subscriptions (periods)
const subscriptionCount = await prisma.subscription.count({
  where: {
    userId,
    status: 'completed',
  }
})

// Check for offers
if (subscriptionCount === 10) {
  await applyDiscount(newSub.id, 20) // 20% discount on 10th subscription
}
```

---

## 📊 Final Recommendation Matrix

| Requirement | Approach A (Same) | Approach B (New) | Approach C (Hybrid) ⭐ |
|-------------|-------------------|------------------|------------------------|
| **Current Subscription Query** | ✅ Simple | ⚠️ Need filter | ✅ Simple |
| **History Tracking** | ❌ Need separate table | ✅ Built-in | ✅ Built-in |
| **Subscription Count** | ❌ Need to calculate | ✅ Count records | ✅ Count or field |
| **Offers Based on Count** | ❌ Complex | ✅ Easy | ✅ Easy |
| **Analytics** | ❌ Limited | ✅ Rich | ✅ Rich |
| **Quota Overrides** | ✅ Persist | ⚠️ Need to copy | ✅ Persist |
| **Database Complexity** | ✅ Simple | ⚠️ More records | ⚠️ Two models |
| **Query Performance** | ✅ Fast | ⚠️ Need indexes | ✅ Fast |

---

## 🎯 My Recommendation

**Go with Approach C (Hybrid)** because:

1. **Best of Both Worlds**: Simple current queries + complete history
2. **Future-Proof**: Easy to implement offers, analytics, loyalty programs
3. **Performance**: Current subscription query is fast (one record)
4. **Flexibility**: Can query history without affecting current subscription logic
5. **Scalability**: History table can be archived/partitioned separately

**But if you prefer Approach B (New Subscription Each Period)**, that's also valid and I can implement it. It's simpler in some ways (one model) but requires careful querying for "current" subscription.

---

## 💡 Implementation Decision

**Which approach do you prefer?**

1. **Approach C (Hybrid)** - Recommended ⭐
   - Current subscription + history table
   - Best balance of simplicity and features

2. **Approach B (New Subscription Each Period)**
   - One model, multiple records per user
   - Simpler model, more complex queries

3. **Approach A (Same Subscription)**
   - One record per user
   - Simplest, but limited history

**Let me know your preference and I'll implement it accordingly!**

---

**End of Document**

