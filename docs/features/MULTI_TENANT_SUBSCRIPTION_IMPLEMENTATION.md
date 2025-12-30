# Multi-Tenant Subscription - Technical Implementation Plan

**Version**: 1.0  
**Date**: December 23, 2025  
**Related PRD**: [MULTI_TENANT_SUBSCRIPTION_PRD.md](./MULTI_TENANT_SUBSCRIPTION_PRD.md)

---

## 📋 Overview

This document provides detailed technical implementation steps for the multi-tenant subscription feature. It breaks down each phase into specific code changes, file modifications, and testing requirements.

---

## 🗂️ File Structure Changes

### New Files to Create

```
src/
├── lib/
│   ├── subscription.ts          # Subscription service utilities
│   └── plan.ts                  # Plan service utilities
├── app/
│   ├── api/
│   │   ├── subscription/
│   │   │   ├── route.ts         # GET, PATCH subscription
│   │   │   └── usage/
│   │   │       └── route.ts     # GET usage statistics
│   │   ├── billing/
│   │   │   └── route.ts         # GET, PATCH billing info
│   │   ├── invoices/
│   │   │   ├── route.ts         # GET invoices list
│   │   │   └── [id]/
│   │   │       └── route.ts     # GET invoice details
│   │   └── cron/
│   │       └── expire-trials/
│   │           └── route.ts     # Trial expiration cron
│   └── (dashboard)/
│       ├── subscription/
│       │   └── page.tsx         # Subscription management page
│       ├── billing/
│       │   └── page.tsx         # Billing management page
│       └── invoices/
│           └── page.tsx         # Invoices list page
└── components/
    ├── SubscriptionBanner.tsx   # Trial expiration banner
    ├── PlanCard.tsx             # Plan display card
    └── UsageStats.tsx           # Usage statistics component
```

### Files to Modify

```
prisma/
└── schema.prisma                # Add Plan, Subscription, Invoice models

src/
├── app/
│   ├── page.tsx                 # Add pricing section
│   ├── api/
│   │   ├── auth/
│   │   │   └── register/
│   │   │       └── route.ts     # Create subscription on registration
│   │   ├── logs/
│   │   │   └── route.ts         # Add subscription check
│   │   ├── traces/
│   │   │   └── route.ts         # Add subscription check
│   │   ├── sessions/
│   │   │   └── route.ts         # Add subscription check
│   │   ├── crashes/
│   │   │   └── route.ts         # Add subscription check
│   │   ├── sdk-init/
│   │   │   └── route.ts         # Add subscription check
│   │   └── feature-flags/
│   │       └── route.ts         # Add subscription check
│   └── (dashboard)/
│       ├── layout.tsx           # Add nav links, status banner
│       ├── projects/
│       │   ├── page.tsx         # Add subscription status
│       │   └── [id]/
│       │       └── page.tsx     # Add subscription banner
│       └── docs/
│           └── page.tsx         # Update if needed
├── lib/
│   └── api.ts                   # Add subscription API methods
└── components/
    └── AuthProvider.tsx         # Add subscription to user context (optional)
```

---

## 🔧 Phase 1: Database Schema Implementation

### Step 1.1: Update Prisma Schema

**File**: `prisma/schema.prisma`

**Changes**:
1. Add `Plan` model
2. Add `Subscription` model
3. Add `Invoice` model
4. Update `User` model to include subscription relation

**Code**:
```prisma
// Add after User model

model Plan {
  id                String   @id @default(cuid())
  name              String   @unique // "free", "pro", "team"
  displayName       String   // "Free Plan", "Pro Plan", "Team Plan"
  description       String?
  price             Float    @default(0) // Monthly price in USD
  currency          String   @default("USD")
  interval          String   @default("month") // month, year
  isActive          Boolean  @default(true)
  isPublic          Boolean  @default(true) // Show in pricing page
  
  // Feature Limits
  maxProjects       Int?     // null = unlimited
  maxDevices        Int?     // null = unlimited
  maxApiTraces      Int?     // Per month, null = unlimited
  maxLogs           Int?     // Per month, null = unlimited
  maxSessions       Int?     // Per month, null = unlimited
  maxCrashes        Int?     // Per month, null = unlimited
  retentionDays     Int?     // Data retention period, null = unlimited
  
  // Feature Flags
  allowApiTracking      Boolean @default(true)
  allowScreenTracking   Boolean @default(true)
  allowCrashReporting   Boolean @default(true)
  allowLogging          Boolean @default(true)
  allowBusinessConfig   Boolean @default(true)
  allowLocalization     Boolean @default(true)
  allowCustomDomains    Boolean @default(false)
  allowWebhooks         Boolean @default(false)
  allowTeamMembers      Boolean @default(false)
  allowPrioritySupport  Boolean @default(false)
  
  // Metadata
  features            Json?    // Additional features list
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  
  subscriptions       Subscription[]
  
  @@index([isActive])
  @@index([isPublic])
}

model Subscription {
  id                String   @id @default(cuid())
  userId            String   @unique
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  planId            String
  plan              Plan     @relation(fields: [planId], references: [id])
  status            String   @default("active") // active, expired, cancelled, suspended
  trialStartDate    DateTime @default(now())
  trialEndDate      DateTime // 30 days from trialStartDate
  currentPeriodStart DateTime @default(now())
  currentPeriodEnd   DateTime
  cancelledAt       DateTime?
  cancelledReason   String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  invoices          Invoice[]
  
  @@index([userId])
  @@index([status])
  @@index([trialEndDate])
}

model Invoice {
  id                String   @id @default(cuid())
  subscriptionId    String
  subscription      Subscription @relation(fields: [subscriptionId], references: [id], onDelete: Cascade)
  invoiceNumber     String   @unique // Format: INV-YYYYMMDD-XXXX
  status            String   @default("draft") // draft, open, paid, void, uncollectible
  amount            Float
  currency          String   @default("USD")
  periodStart       DateTime
  periodEnd         DateTime
  dueDate           DateTime
  paidAt            DateTime?
  pdfUrl            String?  // Link to PDF invoice
  lineItems         Json?    // Breakdown of charges
  notes             String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@index([subscriptionId])
  @@index([status])
  @@index([invoiceNumber])
}

// Update User model - add subscription relation
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  password      String
  name          String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  projects      Project[]
  subscription  Subscription? // One subscription per user
  
  @@index([email])
}
```

### Step 1.2: Create Migration

**Command**:
```bash
pnpm prisma db push
# Or for production:
pnpm prisma migrate dev --name add_subscription_models
```

### Step 1.3: Update Seed Script

**File**: `prisma/seed.ts`

**Add Plan Seeding**:
```typescript
async function main() {
  console.log('🌱 Seeding database...')

  // ... existing user/project seeding ...

  // Create Plans
  const freePlan = await prisma.plan.upsert({
    where: { name: 'free' },
    update: {},
    create: {
      name: 'free',
      displayName: 'Free Plan',
      description: '30-day free trial with full features',
      price: 0,
      currency: 'USD',
      interval: 'month',
      isActive: true,
      isPublic: true,
      // Unlimited limits for free plan during trial
      maxProjects: null,
      maxDevices: null,
      maxApiTraces: null,
      maxLogs: null,
      maxSessions: null,
      maxCrashes: null,
      retentionDays: 30, // 30-day trial
      // All features enabled during trial
      allowApiTracking: true,
      allowScreenTracking: true,
      allowCrashReporting: true,
      allowLogging: true,
      allowBusinessConfig: true,
      allowLocalization: true,
      allowCustomDomains: false,
      allowWebhooks: false,
      allowTeamMembers: false,
      allowPrioritySupport: false,
    },
  })
  console.log(`Created/Updated plan: ${freePlan.displayName}`)

  // Pro Plan (placeholder - not active yet)
  await prisma.plan.upsert({
    where: { name: 'pro' },
    update: {},
    create: {
      name: 'pro',
      displayName: 'Pro Plan',
      description: 'Professional plan for individual developers',
      price: 29.99,
      currency: 'USD',
      interval: 'month',
      isActive: false, // Not active yet
      isPublic: true,
      maxProjects: null,
      maxDevices: null,
      maxApiTraces: 100000,
      maxLogs: 500000,
      maxSessions: 50000,
      maxCrashes: 10000,
      retentionDays: 90,
      allowApiTracking: true,
      allowScreenTracking: true,
      allowCrashReporting: true,
      allowLogging: true,
      allowBusinessConfig: true,
      allowLocalization: true,
      allowCustomDomains: true,
      allowWebhooks: true,
      allowTeamMembers: false,
      allowPrioritySupport: false,
    },
  })

  // Team Plan (placeholder - not active yet)
  await prisma.plan.upsert({
    where: { name: 'team' },
    update: {},
    create: {
      name: 'team',
      displayName: 'Team Plan',
      description: 'Team collaboration with advanced features',
      price: 99.99,
      currency: 'USD',
      interval: 'month',
      isActive: false, // Not active yet
      isPublic: true,
      maxProjects: null,
      maxDevices: null,
      maxApiTraces: null, // Unlimited
      maxLogs: null, // Unlimited
      maxSessions: null, // Unlimited
      maxCrashes: null, // Unlimited
      retentionDays: null, // Unlimited
      allowApiTracking: true,
      allowScreenTracking: true,
      allowCrashReporting: true,
      allowLogging: true,
      allowBusinessConfig: true,
      allowLocalization: true,
      allowCustomDomains: true,
      allowWebhooks: true,
      allowTeamMembers: true,
      allowPrioritySupport: true,
    },
  })

  console.log('✅ Seeding complete!')
}
```

---

## 🔧 Phase 2: Service Layer Implementation

### Step 2.1: Create Plan Service

**File**: `src/lib/plan.ts`

```typescript
import { prisma } from './prisma'

export type Plan = {
  id: string
  name: string
  displayName: string
  description: string | null
  price: number
  currency: string
  interval: string
  isActive: boolean
  isPublic: boolean
  maxProjects: number | null
  maxDevices: number | null
  maxApiTraces: number | null
  maxLogs: number | null
  maxSessions: number | null
  maxCrashes: number | null
  retentionDays: number | null
  allowApiTracking: boolean
  allowScreenTracking: boolean
  allowCrashReporting: boolean
  allowLogging: boolean
  allowBusinessConfig: boolean
  allowLocalization: boolean
  allowCustomDomains: boolean
  allowWebhooks: boolean
  allowTeamMembers: boolean
  allowPrioritySupport: boolean
  features: any | null
}

export async function getPlan(planId: string): Promise<Plan | null> {
  return prisma.plan.findUnique({
    where: { id: planId },
  })
}

export async function getPlanByName(name: string): Promise<Plan | null> {
  return prisma.plan.findUnique({
    where: { name },
  })
}

export async function getPublicPlans(): Promise<Plan[]> {
  return prisma.plan.findMany({
    where: {
      isPublic: true,
      isActive: true,
    },
    orderBy: {
      price: 'asc',
    },
  })
}

export async function getPlanLimits(planId: string) {
  const plan = await getPlan(planId)
  if (!plan) return null

  return {
    maxProjects: plan.maxProjects,
    maxDevices: plan.maxDevices,
    maxApiTraces: plan.maxApiTraces,
    maxLogs: plan.maxLogs,
    maxSessions: plan.maxSessions,
    maxCrashes: plan.maxCrashes,
    retentionDays: plan.retentionDays,
  }
}
```

### Step 2.2: Create Subscription Service

**File**: `src/lib/subscription.ts`

```typescript
import { prisma } from './prisma'
import { getPlan } from './plan'

export type Subscription = {
  id: string
  userId: string
  planId: string
  status: string
  trialStartDate: Date
  trialEndDate: Date
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelledAt: Date | null
  cancelledReason: string | null
  createdAt: Date
  updatedAt: Date
  plan?: any
}

/**
 * Create a new subscription for a user
 */
export async function createSubscription(
  userId: string,
  planName: string = 'free'
): Promise<Subscription> {
  const plan = await prisma.plan.findUnique({
    where: { name: planName },
  })

  if (!plan) {
    throw new Error(`Plan "${planName}" not found`)
  }

  const trialStartDate = new Date()
  const trialEndDate = new Date(trialStartDate)
  trialEndDate.setDate(trialEndDate.getDate() + 30) // 30-day trial

  const currentPeriodEnd = new Date(trialEndDate)

  return prisma.subscription.create({
    data: {
      userId,
      planId: plan.id,
      status: 'active',
      trialStartDate,
      trialEndDate,
      currentPeriodStart: trialStartDate,
      currentPeriodEnd,
    },
    include: {
      plan: true,
    },
  })
}

/**
 * Get user's subscription
 */
export async function getSubscription(userId: string): Promise<Subscription | null> {
  return prisma.subscription.findUnique({
    where: { userId },
    include: {
      plan: true,
    },
  })
}

/**
 * Check if trial is still active
 */
export async function isTrialActive(subscription: Subscription | null): Promise<boolean> {
  if (!subscription) return false
  if (subscription.status !== 'active') return false
  
  const now = new Date()
  return subscription.trialEndDate > now
}

/**
 * Check if subscription allows a specific feature
 */
export async function isFeatureAllowed(
  subscription: Subscription | null,
  feature: string
): Promise<boolean> {
  if (!subscription) return false
  
  // If trial expired, no features allowed
  if (!(await isTrialActive(subscription))) {
    return false
  }

  const plan = await getPlan(subscription.planId)
  if (!plan) return false

  // Map feature names to plan flags
  const featureMap: Record<string, keyof typeof plan> = {
    apiTracking: 'allowApiTracking',
    screenTracking: 'allowScreenTracking',
    crashReporting: 'allowCrashReporting',
    logging: 'allowLogging',
    businessConfig: 'allowBusinessConfig',
    localization: 'allowLocalization',
    customDomains: 'allowCustomDomains',
    webhooks: 'allowWebhooks',
    teamMembers: 'allowTeamMembers',
    prioritySupport: 'allowPrioritySupport',
  }

  const planFlag = featureMap[feature]
  if (!planFlag) return false

  return plan[planFlag] === true
}

/**
 * Get usage statistics for a subscription
 */
export async function getUsageStats(userId: string) {
  const subscription = await getSubscription(userId)
  if (!subscription) {
    return null
  }

  const plan = await getPlan(subscription.planId)
  if (!plan) {
    return null
  }

  // Get current period start (trial start or subscription period start)
  const periodStart = subscription.trialStartDate
  const periodEnd = subscription.trialEndDate

  // Count usage for current period
  const [apiTraces, logs, sessions, crashes, devices, projects] = await Promise.all([
    prisma.apiTrace.count({
      where: {
        project: { userId },
        createdAt: { gte: periodStart, lte: periodEnd },
      },
    }),
    prisma.log.count({
      where: {
        project: { userId },
        createdAt: { gte: periodStart, lte: periodEnd },
      },
    }),
    prisma.session.count({
      where: {
        project: { userId },
        createdAt: { gte: periodStart, lte: periodEnd },
      },
    }),
    prisma.crash.count({
      where: {
        project: { userId },
        createdAt: { gte: periodStart, lte: periodEnd },
      },
    }),
    prisma.device.count({
      where: {
        project: { userId },
      },
    }),
    prisma.project.count({
      where: { userId },
    }),
  ])

  return {
    apiTraces: {
      used: apiTraces,
      limit: plan.maxApiTraces,
      percentage: plan.maxApiTraces ? (apiTraces / plan.maxApiTraces) * 100 : 0,
    },
    logs: {
      used: logs,
      limit: plan.maxLogs,
      percentage: plan.maxLogs ? (logs / plan.maxLogs) * 100 : 0,
    },
    sessions: {
      used: sessions,
      limit: plan.maxSessions,
      percentage: plan.maxSessions ? (sessions / plan.maxSessions) * 100 : 0,
    },
    crashes: {
      used: crashes,
      limit: plan.maxCrashes,
      percentage: plan.maxCrashes ? (crashes / plan.maxCrashes) * 100 : 0,
    },
    devices: {
      used: devices,
      limit: plan.maxDevices,
      percentage: plan.maxDevices ? (devices / plan.maxDevices) * 100 : 0,
    },
    projects: {
      used: projects,
      limit: plan.maxProjects,
      percentage: plan.maxProjects ? (projects / plan.maxProjects) * 100 : 0,
    },
    trialActive: await isTrialActive(subscription),
    trialEndDate: subscription.trialEndDate,
    daysRemaining: Math.max(
      0,
      Math.ceil((subscription.trialEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    ),
  }
}

/**
 * Update subscription status to expired
 */
export async function expireSubscription(subscriptionId: string): Promise<void> {
  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      status: 'expired',
    },
  })
}
```

---

## 🔧 Phase 3: API Endpoints Implementation

### Step 3.1: Update Registration Endpoint

**File**: `src/app/api/auth/register/route.ts`

**Add subscription creation**:
```typescript
import { createSubscription } from '@/lib/subscription'

// ... existing code ...

const user = await prisma.user.create({
  data: {
    email,
    password: hashedPassword,
    name
  },
  select: {
    id: true,
    email: true,
    name: true
  }
})

// Create free plan subscription
await createSubscription(user.id, 'free')

const token = generateToken(user.id)
// ... rest of code ...
```

### Step 3.2: Create Subscription Endpoints

**File**: `src/app/api/subscription/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { validateToken } from '@/lib/auth'
import { getSubscription, getUsageStats } from '@/lib/subscription'

export async function GET(request: NextRequest) {
  try {
    const userId = await validateToken(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscription = await getSubscription(userId)
    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    return NextResponse.json({ subscription })
  } catch (error) {
    console.error('Get subscription error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = await validateToken(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { planName } = await request.json()

    // For now, only allow upgrades (not implemented yet)
    // This is a placeholder for future Stripe integration
    return NextResponse.json({ 
      error: 'Plan upgrades coming soon',
      message: 'Please contact support to upgrade your plan'
    }, { status: 501 })
  } catch (error) {
    console.error('Update subscription error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**File**: `src/app/api/subscription/usage/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { validateToken } from '@/lib/auth'
import { getUsageStats } from '@/lib/subscription'

export async function GET(request: NextRequest) {
  try {
    const userId = await validateToken(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const usage = await getUsageStats(userId)
    if (!usage) {
      return NextResponse.json({ error: 'Usage stats not found' }, { status: 404 })
    }

    return NextResponse.json({ usage })
  } catch (error) {
    console.error('Get usage stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

### Step 3.3: Add Subscription Checks to Data Endpoints

**File**: `src/app/api/logs/route.ts`

**Add check before creating logs**:
```typescript
import { getSubscription, isTrialActive } from '@/lib/subscription'

export async function POST(request: NextRequest) {
  try {
    const project = await validateApiKey(request)
    if (!project) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    // Check subscription status
    const subscription = await getSubscription(project.userId)
    const trialActive = await isTrialActive(subscription)
    
    if (!trialActive) {
      return NextResponse.json({
        logs: [],
        count: 0,
        message: 'Trial expired. Please upgrade to continue using DevBridge.'
      }, { status: 403 })
    }

    // ... rest of existing code ...
  }
}
```

**Apply same pattern to**:
- `src/app/api/traces/route.ts`
- `src/app/api/sessions/route.ts`
- `src/app/api/crashes/route.ts`

### Step 3.4: Update SDK Init Endpoint

**File**: `src/app/api/sdk-init/route.ts`

**Add subscription check**:
```typescript
import { getSubscription, isTrialActive } from '@/lib/subscription'

export async function GET(request: NextRequest) {
  try {
    const project = await validateApiKey(request)
    if (!project) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    // Check subscription
    const subscription = await getSubscription(project.userId)
    const trialActive = await isTrialActive(subscription)
    
    if (!trialActive) {
      return NextResponse.json({
        error: 'Trial expired',
        message: 'Please upgrade your subscription to continue using DevBridge.',
        sdkEnabled: false,
      }, { status: 403 })
    }

    // ... rest of existing code ...
  }
}
```

---

## 🔧 Phase 4: Cron Job Implementation

### Step 4.1: Create Trial Expiration Cron

**File**: `src/app/api/cron/expire-trials/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { expireSubscription } from '@/lib/subscription'

// Verify cron secret (set in Vercel environment variables)
const CRON_SECRET = process.env.CRON_SECRET

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    
    // Find all active subscriptions with expired trials
    const expiredSubscriptions = await prisma.subscription.findMany({
      where: {
        status: 'active',
        trialEndDate: {
          lte: now,
        },
      },
      include: {
        user: {
          include: {
            projects: true,
          },
        },
      },
    })

    console.log(`Found ${expiredSubscriptions.length} expired trials`)

    let deletedCount = 0

    for (const subscription of expiredSubscriptions) {
      const userId = subscription.userId
      const projectIds = subscription.user.projects.map(p => p.id)

      // Delete data for all user's projects
      await Promise.all([
        // Delete API Traces
        prisma.apiTrace.deleteMany({
          where: { projectId: { in: projectIds } },
        }),
        // Delete Logs
        prisma.log.deleteMany({
          where: { projectId: { in: projectIds } },
        }),
        // Delete Sessions (includes screen views)
        prisma.session.deleteMany({
          where: { projectId: { in: projectIds } },
        }),
        // Delete Crashes
        prisma.crash.deleteMany({
          where: { projectId: { in: projectIds } },
        }),
      ])

      // Disable feature flags for all projects
      await prisma.featureFlags.updateMany({
        where: { projectId: { in: projectIds } },
        data: {
          sdkEnabled: false,
          apiTracking: false,
          screenTracking: false,
          crashReporting: false,
          logging: false,
        },
      })

      // Update subscription status
      await expireSubscription(subscription.id)

      deletedCount++
    }

    return NextResponse.json({
      success: true,
      expiredCount: expiredSubscriptions.length,
      deletedCount,
      message: `Processed ${expiredSubscriptions.length} expired trials`,
    })
  } catch (error) {
    console.error('Expire trials cron error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
```

### Step 4.2: Configure Vercel Cron

**File**: `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/expire-trials",
      "schedule": "0 2 * * *"
    }
  ]
}
```

**Schedule**: Runs daily at 2 AM UTC

**Environment Variable**: Add `CRON_SECRET` to Vercel environment variables

---

## 🔧 Phase 5-8: Frontend Implementation

### Detailed frontend implementation steps are in the PRD document.
### Key components to create:
1. Subscription page with plan details and usage
2. Billing page (placeholder for now)
3. Invoices page (empty list for Free Plan)
4. Subscription banner component
5. Update landing page with pricing section
6. Update dashboard navigation

---

## 🧪 Testing Checklist

### Unit Tests
- [ ] `createSubscription()` creates subscription with correct dates
- [ ] `isTrialActive()` returns correct values
- [ ] `isFeatureAllowed()` checks plan flags correctly
- [ ] `getUsageStats()` calculates usage correctly

### Integration Tests
- [ ] Registration creates subscription automatically
- [ ] Subscription endpoint returns correct data
- [ ] Data creation endpoints reject when trial expired
- [ ] Cron job deletes data and updates status correctly

### E2E Tests
- [ ] User can register and see subscription status
- [ ] User can view subscription details
- [ ] User sees trial expiration banner
- [ ] Data is deleted after trial expires

---

## 📝 Migration Checklist

### Pre-Deployment
- [ ] Database schema updated
- [ ] Plans seeded
- [ ] All code changes committed
- [ ] Tests passing
- [ ] Documentation updated

### Deployment
- [ ] Deploy to staging
- [ ] Test registration flow
- [ ] Test subscription endpoints
- [ ] Test cron job manually
- [ ] Verify data deletion works

### Post-Deployment
- [ ] Monitor cron job execution
- [ ] Monitor API response times
- [ ] Check error logs
- [ ] Verify email notifications (if configured)

---

**Last Updated**: December 23, 2025

