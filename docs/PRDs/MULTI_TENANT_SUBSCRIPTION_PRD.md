# PRD: Multi-Tenant Subscription Management

**Version**: 1.0  
**Date**: December 23, 2025  
**Status**: Planning  
**Priority**: P0 (Production Preparation)

---

## 📋 Executive Summary

Enable multi-tenant subscription management for DevBridge to support SaaS monetization. Initially launch with a **Free Plan** offering full features for 30 days, after which data is automatically deleted and features disabled. Future plans (Pro, Team) will be scaffolded but not activated.

---

## 🎯 Goals & Objectives

### Primary Goals
1. **Multi-tenant Architecture**: Isolate user data and resources per subscription
2. **Subscription Management**: Enable plan management, billing, and invoicing
3. **Free Plan Launch**: Offer 30-day free trial with full features, then auto-cleanup
4. **User Experience**: Clear subscription information on landing page and dashboard

### Success Metrics
- ✅ Users can register and automatically get Free Plan
- ✅ Subscription status visible throughout dashboard
- ✅ Automatic data deletion after 30-day trial expires
- ✅ Feature restrictions enforced based on subscription status
- ✅ Billing/Invoices/Subscription tabs functional

---

## 👥 User Stories

### US-1: Landing Page Subscription Display
**As a** visitor  
**I want to** see subscription plan information before registering  
**So that** I understand what I'm signing up for

**Acceptance Criteria**:
- Landing page displays Free Plan features prominently
- Shows "30-day free trial" messaging
- Mentions data deletion after trial period
- Clear call-to-action to register

### US-2: Automatic Free Plan Assignment
**As a** new user  
**I want to** automatically receive Free Plan upon registration  
**So that** I can start using DevBridge immediately

**Acceptance Criteria**:
- User registration creates subscription with Free Plan
- Subscription start date is set to registration date
- Trial expiration date is 30 days from registration
- User can see subscription status immediately after registration

### US-3: Subscription Dashboard Tabs
**As a** registered user  
**I want to** access Billing, Invoices, and Subscription tabs  
**So that** I can manage my subscription and view payment history

**Acceptance Criteria**:
- Three new tabs: Billing, Invoices, Subscription
- Billing tab shows current plan, payment method, billing address
- Invoices tab lists all invoices (empty for Free Plan initially)
- Subscription tab shows plan details, usage, upgrade options

### US-4: Free Plan Feature Access
**As a** Free Plan user  
**I want to** access all features during the 30-day trial  
**So that** I can fully evaluate DevBridge

**Acceptance Criteria**:
- All features enabled during trial period
- No restrictions on API traces, logs, sessions, screens
- Full access to all dashboard features
- Clear indication of trial status and expiration date

### US-5: Post-Trial Data Deletion
**As a** Free Plan user after trial expires  
**I want** my data to be automatically deleted  
**So that** DevBridge maintains data hygiene

**Acceptance Criteria**:
- Cron job runs daily to check expired trials
- Deletes: API Traces, Logs, Sessions (including screen views), Crashes
- Preserves: Projects, Devices (metadata only), Feature Flags, SDK Settings
- User receives email notification before deletion (7 days, 1 day warnings)
- Features disabled after deletion

### US-6: Post-Trial Feature Restrictions
**As a** Free Plan user after trial expires  
**I want** clear messaging about feature restrictions  
**So that** I understand why features are disabled

**Acceptance Criteria**:
- Dashboard shows "Trial Expired" banner
- Feature flags automatically disabled
- SDK endpoints reject new data (gracefully)
- Upgrade prompt displayed prominently

---

## 🏗️ Architecture Overview

### Current Architecture
```
User (1) ──→ (N) Projects ──→ (N) Devices, Logs, Traces, Sessions, etc.
```

### Proposed Architecture
```
User (1) ──→ (1) Subscription ──→ (1) Plan
         └──→ (N) Projects ──→ (N) Devices, Logs, Traces, Sessions, etc.
```

**Key Changes**:
- Add `Subscription` model (one per user)
- Add `Plan` model (Free, Pro, Team)
- Add `Invoice` model (for billing history)
- Add subscription checks to all data creation endpoints
- Add cron job for trial expiration handling

---

## 📊 Data Models

### Subscription Model
```prisma
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
```

### Plan Model
```prisma
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
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  
  subscriptions       Subscription[]
  
  @@index([isActive])
  @@index([isPublic])
}
```

### Invoice Model
```prisma
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
```

### Updated User Model
```prisma
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

---

## 🎨 UI/UX Design

### Landing Page Updates

**Section: Pricing Plans**
```tsx
// Add after main hero section, before features grid
<section className="py-20 bg-gray-900">
  <div className="max-w-4xl mx-auto px-4">
    <h2 className="text-3xl font-bold text-white text-center mb-12">
      Start Free, Upgrade When Ready
    </h2>
    <div className="grid md:grid-cols-3 gap-8">
      {/* Free Plan Card */}
      <div className="bg-gray-800 rounded-lg p-8 border-2 border-blue-600">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-white mb-2">Free Plan</h3>
          <div className="text-4xl font-bold text-blue-400 mb-2">$0</div>
          <div className="text-gray-400 text-sm">30-day free trial</div>
        </div>
        <ul className="space-y-3 mb-6">
          <li className="flex items-start text-gray-300">
            <CheckIcon /> <span>All features enabled</span>
          </li>
          <li className="flex items-start text-gray-300">
            <CheckIcon /> <span>Unlimited projects</span>
          </li>
          <li className="flex items-start text-gray-300">
            <CheckIcon /> <span>Unlimited devices</span>
          </li>
          <li className="flex items-start text-gray-300">
            <CheckIcon /> <span>Full API & log tracking</span>
          </li>
          <li className="flex items-start text-gray-300">
            <CheckIcon /> <span>Crash reporting</span>
          </li>
        </ul>
        <div className="bg-yellow-900/20 border border-yellow-600 rounded p-3 mb-4">
          <p className="text-yellow-400 text-sm">
            ⚠️ After 30 days, data will be automatically deleted and features disabled. Upgrade to keep your data.
          </p>
        </div>
        <Link href="/register" className="block w-full text-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
          Start Free Trial
        </Link>
      </div>
      
      {/* Pro Plan - Coming Soon */}
      <div className="bg-gray-800 rounded-lg p-8 opacity-60">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-white mb-2">Pro Plan</h3>
          <div className="text-4xl font-bold text-gray-400 mb-2">Coming Soon</div>
        </div>
        {/* Placeholder features */}
      </div>
      
      {/* Team Plan - Coming Soon */}
      <div className="bg-gray-800 rounded-lg p-8 opacity-60">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-white mb-2">Team Plan</h3>
          <div className="text-4xl font-bold text-gray-400 mb-2">Coming Soon</div>
        </div>
        {/* Placeholder features */}
      </div>
    </div>
  </div>
</section>
```

### Dashboard Navigation Updates

**Add Subscription Section to Nav**:
```tsx
<nav>
  {/* Existing links */}
  <Link href="/projects">Projects</Link>
  <Link href="/docs">SDK Docs</Link>
  
  {/* New subscription links */}
  <Link href="/subscription">Subscription</Link>
  <Link href="/billing">Billing</Link>
  <Link href="/invoices">Invoices</Link>
</nav>
```

### Subscription Status Banner

**Show in Dashboard Layout** (when trial expires or expires soon):
```tsx
{subscription?.status === 'expired' && (
  <div className="bg-red-900/20 border-l-4 border-red-600 p-4 mb-6">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-red-400 font-semibold">Trial Expired</h3>
        <p className="text-gray-300 text-sm">
          Your free trial has ended. Your data has been deleted and features are disabled.
        </p>
      </div>
      <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">
        Upgrade Now
      </button>
    </div>
  </div>
)}

{subscription?.status === 'active' && daysUntilExpiry <= 7 && (
  <div className="bg-yellow-900/20 border-l-4 border-yellow-600 p-4 mb-6">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-yellow-400 font-semibold">Trial Ending Soon</h3>
        <p className="text-gray-300 text-sm">
          Your free trial expires in {daysUntilExpiry} days. Upgrade to keep your data.
        </p>
      </div>
      <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">
        Upgrade Now
      </button>
    </div>
  </div>
)}
```

---

## 🔧 Implementation Plan

### Phase 1: Database Schema (Week 1)

**Tasks**:
1. ✅ Add `Plan`, `Subscription`, `Invoice` models to Prisma schema
2. ✅ Update `User` model to include subscription relation
3. ✅ Create migration script
4. ✅ Seed database with Free Plan (and placeholder Pro/Team plans)
5. ✅ Update Prisma client

**Files to Modify**:
- `prisma/schema.prisma`
- `prisma/seed.ts` (add plan seeding)

**Dependencies**: None

---

### Phase 2: Subscription Service Layer (Week 1)

**Tasks**:
1. ✅ Create `SubscriptionService` utility
   - `createSubscription(userId, planId)` - Create subscription on registration
   - `getSubscription(userId)` - Get user's subscription
   - `isTrialActive(subscription)` - Check if trial is still active
   - `isFeatureAllowed(subscription, feature)` - Check feature access
   - `getUsageStats(subscription)` - Get current usage vs limits
2. ✅ Create `PlanService` utility
   - `getPlan(planId)` - Get plan details
   - `getPublicPlans()` - Get all public plans
   - `getPlanLimits(planId)` - Get plan limits

**Files to Create**:
- `src/lib/subscription.ts`
- `src/lib/plan.ts`

**Dependencies**: Phase 1

---

### Phase 3: API Endpoints (Week 1-2)

**Tasks**:
1. ✅ Update registration endpoint to create subscription
2. ✅ Create subscription management endpoints:
   - `GET /api/subscription` - Get current subscription
   - `PATCH /api/subscription` - Update subscription (upgrade/downgrade)
   - `GET /api/subscription/usage` - Get usage statistics
3. ✅ Create billing endpoints:
   - `GET /api/billing` - Get billing information
   - `PATCH /api/billing` - Update payment method
4. ✅ Create invoice endpoints:
   - `GET /api/invoices` - List invoices
   - `GET /api/invoices/[id]` - Get invoice details
   - `GET /api/invoices/[id]/pdf` - Download invoice PDF
5. ✅ Add subscription checks to data creation endpoints:
   - `POST /api/logs` - Check subscription before creating logs
   - `POST /api/traces` - Check subscription before creating traces
   - `POST /api/sessions` - Check subscription before creating sessions
   - `POST /api/crashes` - Check subscription before creating crashes

**Files to Create**:
- `src/app/api/subscription/route.ts`
- `src/app/api/subscription/usage/route.ts`
- `src/app/api/billing/route.ts`
- `src/app/api/invoices/route.ts`
- `src/app/api/invoices/[id]/route.ts`

**Files to Modify**:
- `src/app/api/auth/register/route.ts`
- `src/app/api/logs/route.ts`
- `src/app/api/traces/route.ts`
- `src/app/api/sessions/route.ts`
- `src/app/api/crashes/route.ts`

**Dependencies**: Phase 2

---

### Phase 4: Cron Job for Trial Expiration (Week 2)

**Tasks**:
1. ✅ Create cron endpoint: `POST /api/cron/expire-trials`
2. ✅ Implement trial expiration logic:
   - Find subscriptions with `trialEndDate < now()` and `status = 'active'`
   - Delete data: API Traces, Logs, Sessions, Crashes
   - Update subscription status to `'expired'`
   - Disable feature flags for all projects
   - Send notification email (if email service configured)
3. ✅ Schedule cron job in Vercel (or external cron service)

**Files to Create**:
- `src/app/api/cron/expire-trials/route.ts`

**Files to Modify**:
- `vercel.json` (if using Vercel cron)

**Dependencies**: Phase 2, Phase 3

---

### Phase 5: Frontend - Landing Page (Week 2)

**Tasks**:
1. ✅ Update landing page with pricing section
2. ✅ Add Free Plan card with trial messaging
3. ✅ Add "Coming Soon" cards for Pro/Team plans
4. ✅ Update "Start Free" CTA to emphasize trial

**Files to Modify**:
- `src/app/page.tsx`

**Dependencies**: None (can be done in parallel)

---

### Phase 6: Frontend - Dashboard Tabs (Week 2-3)

**Tasks**:
1. ✅ Create Subscription page (`/subscription`)
   - Show current plan details
   - Display trial status and expiration
   - Show usage statistics (if limits exist)
   - Upgrade button (disabled for now)
2. ✅ Create Billing page (`/billing`)
   - Show current payment method (placeholder)
   - Billing address form (placeholder)
   - Update payment method (placeholder)
3. ✅ Create Invoices page (`/invoices`)
   - List all invoices (empty for Free Plan)
   - Invoice details modal
   - Download PDF button (placeholder)
4. ✅ Add navigation links to dashboard layout
5. ✅ Add subscription status banner to dashboard layout

**Files to Create**:
- `src/app/(dashboard)/subscription/page.tsx`
- `src/app/(dashboard)/billing/page.tsx`
- `src/app/(dashboard)/invoices/page.tsx`
- `src/components/SubscriptionBanner.tsx`
- `src/components/PlanCard.tsx`
- `src/components/UsageStats.tsx`

**Files to Modify**:
- `src/app/(dashboard)/layout.tsx`
- `src/lib/api.ts` (add subscription API methods)

**Dependencies**: Phase 3

---

### Phase 7: Feature Restrictions (Week 3)

**Tasks**:
1. ✅ Update `sdk-init` endpoint to check subscription
2. ✅ Add subscription checks to feature flag endpoints
3. ✅ Update dashboard to show "Feature Disabled" messages
4. ✅ Add subscription status to project list/detail pages

**Files to Modify**:
- `src/app/api/sdk-init/route.ts`
- `src/app/api/feature-flags/route.ts`
- `src/app/(dashboard)/projects/[id]/page.tsx`
- `src/app/(dashboard)/projects/page.tsx`

**Dependencies**: Phase 2, Phase 3

---

### Phase 8: Testing & Documentation (Week 3)

**Tasks**:
1. ✅ Write unit tests for subscription service
2. ✅ Write integration tests for API endpoints
3. ✅ Test trial expiration cron job
4. ✅ Update API documentation
5. ✅ Create user guide for subscription management

**Files to Create**:
- `docs/SUBSCRIPTION_MANAGEMENT.md`
- `docs/BILLING_GUIDE.md`

**Dependencies**: All phases

---

## 🔍 Impact Analysis

### Database Impact

**New Tables**:
- `Plan` - 3 rows (Free, Pro, Team)
- `Subscription` - 1 row per user (grows with user base)
- `Invoice` - 0 rows initially (grows with paid subscriptions)

**Indexes Added**:
- `Subscription.userId` (unique) - Fast user lookup
- `Subscription.status` - Fast filtering by status
- `Subscription.trialEndDate` - Fast cron job queries
- `Invoice.subscriptionId` - Fast invoice lookup

**Storage Impact**: Minimal (~1KB per user for subscription)

---

### API Impact

**New Endpoints**:
- `GET /api/subscription` - Low traffic (dashboard load)
- `PATCH /api/subscription` - Very low traffic (upgrades)
- `GET /api/subscription/usage` - Low traffic (dashboard)
- `GET /api/billing` - Low traffic (billing page)
- `PATCH /api/billing` - Very low traffic (updates)
- `GET /api/invoices` - Low traffic (invoices page)
- `POST /api/cron/expire-trials` - Daily cron (1 request/day)

**Modified Endpoints** (with subscription checks):
- `POST /api/auth/register` - Adds subscription creation (minimal overhead)
- `POST /api/logs` - Adds subscription check (1 DB query)
- `POST /api/traces` - Adds subscription check (1 DB query)
- `POST /api/sessions` - Adds subscription check (1 DB query)
- `POST /api/crashes` - Adds subscription check (1 DB query)
- `GET /api/sdk-init` - Adds subscription check (1 DB query)

**Performance Impact**:
- Each data creation endpoint: +1 DB query (subscription lookup)
- Can be optimized with caching (Redis) if needed
- Estimated overhead: <10ms per request

---

### Frontend Impact

**New Pages**:
- `/subscription` - New page
- `/billing` - New page
- `/invoices` - New page

**Modified Pages**:
- `/` (landing) - Add pricing section
- `/projects` - Add subscription status indicator
- `/projects/[id]` - Add subscription status banner
- Layout - Add navigation links, status banner

**Bundle Size Impact**: ~+50KB (estimated)

---

### SDK Impact

**No Changes Required**: SDK continues to work as-is. Server-side subscription checks handle restrictions.

---

## 💡 Suggestions & Improvements

### 1. **Trial Extension Option**
**Suggestion**: Allow users to extend trial by 7 days (one-time) if they haven't upgraded yet.

**Implementation**: Add `trialExtensionUsed` boolean to Subscription model, add endpoint to extend trial.

**Priority**: P2

---

### 2. **Usage Dashboard**
**Suggestion**: Show real-time usage statistics (API traces this month, logs this month, etc.) vs plan limits.

**Implementation**: Create usage aggregation queries, display in Subscription page.

**Priority**: P1 (for Free Plan, show "Unlimited" for now)

---

### 3. **Email Notifications**
**Suggestion**: Send email notifications:
- 7 days before trial expires
- 1 day before trial expires
- On trial expiration (data deleted)
- On subscription upgrade/downgrade

**Implementation**: Integrate email service (SendGrid, Resend, etc.), create email templates.

**Priority**: P1 (for trial expiration warnings)

---

### 4. **Grace Period**
**Suggestion**: Instead of immediate deletion, give 7-day grace period where:
- Data is marked for deletion (read-only)
- User can upgrade to restore access
- After 7 days, permanent deletion

**Implementation**: Add `gracePeriodEndDate` to Subscription, modify deletion logic.

**Priority**: P2

---

### 5. **Data Export Before Deletion**
**Suggestion**: Before deleting data, allow users to export their data (CSV, JSON).

**Implementation**: Create export endpoints, add "Export Data" button in Subscription page.

**Priority**: P2

---

### 6. **Subscription Analytics**
**Suggestion**: Track subscription metrics:
- Trial-to-paid conversion rate
- Average time to upgrade
- Most-used features by plan

**Implementation**: Add analytics events, create admin dashboard.

**Priority**: P3

---

### 7. **Plan Comparison Table**
**Suggestion**: Add detailed plan comparison table on landing page.

**Implementation**: Create comparison component, add to pricing section.

**Priority**: P1 (when Pro/Team plans are ready)

---

### 8. **Stripe Integration (Future)**
**Suggestion**: Integrate Stripe for Pro/Team plan payments.

**Implementation**: 
- Add Stripe webhook handler
- Create checkout session endpoint
- Handle subscription updates from Stripe

**Priority**: P0 (when launching paid plans)

---

## 🚨 Risks & Mitigations

### Risk 1: Data Loss During Trial Expiration
**Mitigation**: 
- Send multiple email warnings (7 days, 1 day)
- Add grace period (7 days read-only)
- Log all deletions for audit trail
- Test cron job thoroughly in staging

### Risk 2: Performance Impact from Subscription Checks
**Mitigation**:
- Cache subscription status (Redis or in-memory)
- Use database indexes for fast lookups
- Monitor API response times

### Risk 3: Users Confused by Trial Expiration
**Mitigation**:
- Clear messaging on landing page
- Prominent banners in dashboard
- Email notifications
- Help documentation

### Risk 4: Cron Job Fails to Run
**Mitigation**:
- Use reliable cron service (Vercel Cron, Cron-job.org)
- Add monitoring/alerting
- Manual trigger endpoint for admin
- Log all cron executions

---

## 📅 Timeline

| Phase | Duration | Start | End |
|-------|----------|-------|-----|
| Phase 1: Database Schema | 1 day | Day 1 | Day 1 |
| Phase 2: Service Layer | 2 days | Day 2 | Day 3 |
| Phase 3: API Endpoints | 3 days | Day 4 | Day 6 |
| Phase 4: Cron Job | 2 days | Day 7 | Day 8 |
| Phase 5: Landing Page | 1 day | Day 9 | Day 9 |
| Phase 6: Dashboard Tabs | 3 days | Day 10 | Day 12 |
| Phase 7: Feature Restrictions | 2 days | Day 13 | Day 14 |
| Phase 8: Testing & Docs | 2 days | Day 15 | Day 16 |

**Total Estimated Time**: 16 days (~3 weeks)

---

## ✅ Definition of Done

- [ ] Database schema updated and migrated
- [ ] Free Plan seeded in database
- [ ] Registration creates subscription automatically
- [ ] Landing page shows pricing section
- [ ] Subscription/Billing/Invoices tabs functional
- [ ] Trial expiration cron job working
- [ ] Data deletion working correctly
- [ ] Feature restrictions enforced
- [ ] Email notifications sent (if service configured)
- [ ] Documentation updated
- [ ] Tested in staging environment
- [ ] Deployed to production

---

## 📚 Related Documentation

- [Device Debug Mode](./DEVICE_DEBUG_MODE.md)
- [Development Workflow](./DEVELOPMENT_WORKFLOW.md)
- [Environment Setup](./ENVIRONMENT_SETUP.md)

---

**Last Updated**: December 23, 2025  
**Next Review**: After Phase 1 completion

