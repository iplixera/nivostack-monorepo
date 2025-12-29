# Subscription & Billing PRD Gap Analysis

**Date**: December 25, 2025  
**PRD Version**: v0.1 (DevBridge_Subscription_Billing_PRD_v0_1.pdf)  
**Current Implementation Status**: Partial (Free Plan with trial expiration)

---

## 📋 Executive Summary

This document compares the new Subscription & Billing PRD (v0.1) requirements with the current implementation to identify gaps, missing features, and required changes.

**Key Finding**: The current implementation is focused on a **Free Plan with 30-day trial**, while the new PRD requires a **complete multi-tier billing system** with organizations, metering, payment processing, and enterprise features.

---

## 🎯 Critical Gaps by Category

### 1. **Architecture & Data Model** 🔴 CRITICAL

#### Gap: Organization Model Missing
**PRD Requirement**: 
- Organization (`org`) as primary entity
- `org_id`, `owner_user_id`, `created_at`
- Subscriptions tied to organizations, not individual users

**Current Implementation**:
- ✅ User-based subscriptions (`Subscription.userId`)
- ❌ No Organization model
- ❌ No `org_id` concept
- ❌ Projects tied to users, not organizations

**Impact**: HIGH - Requires major refactoring

**Required Changes**:
```prisma
model Organization {
  id          String   @id @default(cuid())
  ownerUserId String   // User who created the org
  owner       User     @relation("OrgOwner", fields: [ownerUserId], references: [id])
  name        String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  subscriptions Subscription[]
  projects      Project[]
  members       OrgMember[]
  
  @@index([ownerUserId])
}

model OrgMember {
  id             String   @id @default(cuid())
  orgId          String
  organization   Organization @relation(fields: [orgId], references: [id])
  userId         String
  user           User     @relation(fields: [userId], references: [id])
  role           String   // "owner", "admin", "member"
  createdAt      DateTime @default(now())
  
  @@unique([orgId, userId])
  @@index([userId])
}
```

---

### 2. **Plan Structure** 🟡 MAJOR MISMATCH

#### Gap: Plan Limits Don't Match PRD
**PRD Requirement**:
- **Free**: 1 app/1 env/3 seats, 10,000 sessions/month, 7-day retention
- **Pro**: $199/mo, 2 apps/3 env/10 seats, 100,000 sessions/month, 30-day retention
- **Team**: $499/mo, 5 apps/5 env/30 seats, 500,000 sessions/month, 90-day retention
- **Enterprise**: From $2,500/mo, custom limits

**Current Implementation**:
- **Free**: 100 devices, 1,000 sessions, 20 API endpoints, 30-day retention
- **Pro**: $29.99/mo (should be $199/mo)
- **Team**: $99.99/mo (should be $499/mo)
- **Enterprise**: $299.99/mo (should be $2,500+/mo)

**Missing Fields**:
- ❌ `maxApps` / `maxProjects` per plan (PRD: 1/2/5/custom)
- ❌ `maxEnvironments` per plan (PRD: 1/3/5/custom)
- ❌ `maxSeats` per plan (PRD: 3/10/30/custom)
- ❌ Sessions/month is primary meter (currently secondary)

**Required Changes**:
```prisma
model Plan {
  // ... existing fields ...
  
  // NEW: Capacity limits per PRD
  maxApps        Int?     // 1/2/5/null
  maxEnvironments Int?    // 1/3/5/null
  maxSeats       Int?     // 3/10/30/null
  
  // UPDATE: Sessions is PRIMARY meter
  maxSessions    Int?     // 10,000/100,000/500,000/null
  
  // UPDATE: Retention days per PRD
  retentionDays  Int?     // 7/30/90/null
}
```

---

### 3. **Metering & Quotas** 🔴 CRITICAL

#### Gap: Primary Meter is Sessions/Month
**PRD Requirement**:
- **Primary meter**: Sessions per month (customer-facing)
- **Secondary limits**: Apps/projects, environments, seats, retention days, localization keys, business config keys
- **Internal guardrails**: Request bodies count, log volume, storage/GB (not shown to customers)

**Current Implementation**:
- ✅ Tracks sessions, but not as primary meter
- ✅ Has quota fields, but enforcement unclear
- ❌ No usage rollup system
- ❌ No monthly reset logic
- ❌ No overage tracking

**Missing Models**:
```prisma
model UsageRollup {
  id          String   @id @default(cuid())
  orgId       String
  organization Organization @relation(fields: [orgId], references: [id])
  meterKey    String   // "sessions", "apps", "environments", "seats", etc.
  periodStart DateTime // Start of billing period
  periodEnd   DateTime // End of billing period
  usedValue   Int      // Actual usage count
  limitValue  Int?     // Plan limit (null = unlimited)
  createdAt   DateTime @default(now())
  
  @@unique([orgId, meterKey, periodStart])
  @@index([orgId, periodStart])
}

model Entitlement {
  id          String   @id @default(cuid())
  planId      String
  plan        Plan     @relation(fields: [planId], references: [id])
  featureKey  String   // "api_traces", "screen_flow", "cost_analysis", etc.
  enabled     Boolean  @default(true)
  
  @@unique([planId, featureKey])
}
```

**Required Changes**:
- Create `UsageRollup` model for monthly usage tracking
- Create `Entitlement` model for feature access control
- Implement monthly reset logic (cron job)
- Add usage aggregation queries

---

### 4. **Billing Lifecycle** 🔴 CRITICAL

#### Gap: No Payment Processing
**PRD Requirement**:
- Signup: Free, no credit card
- Upgrade: Immediate access, prorated billing
- Downgrade: Schedule to end of billing period
- Cancel: End-of-period cancel
- Payment failure: 7-day grace period, then downgrade to Free
- Enterprise: Invoice flow with manual approval

**Current Implementation**:
- ✅ Signup creates Free Plan subscription
- ❌ No payment provider integration (Stripe, etc.)
- ❌ No checkout flow
- ❌ No upgrade/downgrade logic
- ❌ No payment failure handling
- ❌ No proration logic
- ❌ No invoice generation

**Missing API Endpoints**:
- ❌ `POST /api/billing/checkout` - Start checkout/upgrade
- ❌ `POST /api/billing/downgrade` - Schedule downgrade
- ❌ `POST /api/billing/cancel` - Cancel subscription
- ❌ `POST /api/webhooks/billing` - Payment provider webhooks
- ❌ `GET /api/billing/invoices/[id]/pdf` - Download invoice PDF

**Required Changes**:
- Integrate payment provider (Stripe recommended)
- Implement checkout flow
- Add webhook handlers for payment events
- Implement proration logic
- Add payment failure handling
- Generate invoice PDFs

---

### 5. **Overage Policy** 🔴 MISSING

#### Gap: No Overage Billing
**PRD Requirement**:
- **Free**: Hard stop, show upgrade banner
- **Pro**: Hard stop by default; optional overage at $4 per +1,000 sessions
- **Team**: Soft limit + overage billing at $3 per +1,000 sessions
- **Enterprise**: Contract-defined

**Current Implementation**:
- ❌ No overage tracking
- ❌ No overage billing
- ❌ No overage toggle for Pro plan
- ❌ Hard stop only (no soft limits)

**Required Changes**:
```prisma
model Subscription {
  // ... existing fields ...
  
  // NEW: Overage settings
  allowOverage    Boolean  @default(false) // Pro/Team can enable
  overageRate     Float?   // $4 or $3 per 1,000 sessions
  overageSessions Int?     // Sessions beyond limit this period
  overageAmount   Float?   // Calculated overage charge
}
```

- Add overage calculation logic
- Add overage billing to invoices
- Implement soft limit enforcement (Team+)
- Add overage toggle UI for Pro plan

---

### 6. **Feature Entitlements** 🟡 PARTIAL

#### Gap: Entitlement Model Missing
**PRD Requirement**:
- Feature-based access control (API Traces, Screen Flow, Cost Analysis, etc.)
- Plan-specific feature flags
- Enterprise gates (SSO/SAML, SCIM, audit export, data residency)

**Current Implementation**:
- ✅ Plan has feature flags (`allowApiTracking`, `allowScreenTracking`, etc.)
- ❌ No `Entitlement` model for granular control
- ❌ No SSO/SAML support
- ❌ No SCIM support
- ❌ No audit log export
- ❌ No data residency options

**Required Changes**:
- Create `Entitlement` model
- Map PRD features to entitlements
- Implement SSO/SAML (Enterprise only)
- Implement SCIM (Enterprise only)
- Add audit log export functionality
- Add data residency configuration

---

### 7. **UI Screens** 🟡 PARTIAL

#### Gap: Missing Billing UI Components
**PRD Requirement**:
- **Plan & Billing**: Current plan, renewal date, payment status, upgrade/downgrade/cancel
- **Usage Dashboard**: Sessions MTD, apps/seats/keys used, set alerts, upgrade CTA
- **Invoices**: List, status, downloadable files
- **Quota Exceeded States**: Reason + what is blocked, upgrade CTA
- **Enterprise Contact**: Request quote form

**Current Implementation**:
- ✅ `/subscription` page exists (Overview, Usage, Upgrade Plan, Organization Profile tabs)
- ✅ Shows current plan, usage stats
- ❌ No payment method management
- ❌ No upgrade/downgrade/cancel flows
- ❌ No invoice list/download
- ❌ No quota exceeded states
- ❌ No enterprise contact form

**Required Changes**:
- Add payment method UI
- Add upgrade checkout flow
- Add downgrade scheduling UI
- Add cancel subscription UI
- Add invoice list and download
- Add quota exceeded banners/modals
- Add enterprise contact form

---

### 8. **API Endpoints** 🟡 PARTIAL

#### Gap: Missing Billing Endpoints
**PRD Requirement**:
- `GET /billing/plans` - List public plans ✅ (exists as `/api/plans`)
- `GET /billing/subscription` - Get current subscription ✅ (exists as `/api/subscription`)
- `POST /billing/checkout` - Start checkout/upgrade ❌
- `POST /billing/downgrade` - Schedule downgrade ❌
- `POST /billing/cancel` - Cancel subscription ❌
- `GET /billing/usage` - Usage vs quota rollups ❌ (partial: `/api/subscription/usage`)
- `GET /billing/invoices` - Invoice list ❌
- `POST /webhooks/billing` - Payment provider webhooks ❌

**Current Implementation**:
- ✅ `GET /api/subscription` - Get subscription
- ✅ `GET /api/subscription/usage` - Get usage (but not rollups)
- ✅ `GET /api/plans` - Get public plans
- ❌ `PATCH /api/subscription` - Placeholder only (returns 501)
- ❌ No billing endpoints
- ❌ No webhook handlers

**Required Changes**:
- Create `/api/billing/*` endpoints
- Implement checkout flow
- Implement downgrade/cancel logic
- Create usage rollup queries
- Create invoice endpoints
- Create webhook handler

---

### 9. **Environments & Seats** 🔴 MISSING

#### Gap: No Environment/Seat Management
**PRD Requirement**:
- **Environments**: Per app/project (1/3/5/custom)
- **Seats**: Per organization (3/10/30/custom)
- Hard stop enforcement

**Current Implementation**:
- ❌ No Environment model
- ❌ No Seat/OrgMember model (for seat tracking)
- ❌ No environment limits per plan
- ❌ No seat limits per plan

**Required Changes**:
```prisma
model Environment {
  id          String   @id @default(cuid())
  projectId   String
  project     Project  @relation(fields: [projectId], references: [id])
  name        String   // "production", "staging", "development"
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  
  @@unique([projectId, name])
  @@index([projectId])
}
```

- Add Environment model
- Add seat tracking (via OrgMember)
- Enforce environment limits on project creation
- Enforce seat limits on org member addition

---

### 10. **Organic Growth Requirements** 🔴 MISSING

#### Gap: No SEO/Content Infrastructure
**PRD Requirement**:
- SEO-friendly docs site (versioned)
- Comparison pages (Sentry vs DevBridge, etc.)
- Use-case landing pages
- Templates/assets (OpenAPI mocks, redaction policies)
- Public changelog with RSS
- Social distribution (3-5 posts/week)

**Current Implementation**:
- ❌ No docs site
- ❌ No comparison pages
- ❌ No use-case landing pages
- ❌ No templates library
- ❌ No public changelog
- ❌ No social content system

**Required Changes**:
- Build docs site (Next.js docs or similar)
- Create comparison pages
- Create use-case landing pages
- Build templates library
- Add changelog with RSS feed
- Plan social content strategy

---

## 📊 Implementation Priority Matrix

### Phase 1: Critical Foundation (Weeks 1-4)
**Priority**: P0 - Blocking

1. **Organization Model** 🔴
   - Create `Organization` model
   - Migrate subscriptions from user-based to org-based
   - Update all queries to use `orgId`

2. **Plan Structure Update** 🔴
   - Update plan limits to match PRD (sessions as primary meter)
   - Add `maxApps`, `maxEnvironments`, `maxSeats`
   - Update prices ($199 Pro, $499 Team, $2,500+ Enterprise)

3. **Metering System** 🔴
   - Create `UsageRollup` model
   - Implement monthly usage tracking
   - Create usage aggregation queries
   - Add monthly reset cron job

4. **Environments & Seats** 🔴
   - Create `Environment` model
   - Create `OrgMember` model (for seats)
   - Enforce limits on creation

### Phase 2: Billing Core (Weeks 5-8)
**Priority**: P0 - Required for paid plans

1. **Payment Provider Integration** 🔴
   - Integrate Stripe (or similar)
   - Create checkout flow
   - Implement webhook handlers

2. **Billing Lifecycle** 🔴
   - Upgrade flow (immediate access, proration)
   - Downgrade flow (schedule to period end)
   - Cancel flow (end-of-period)
   - Payment failure handling (7-day grace)

3. **Invoice Generation** 🔴
   - Generate invoice PDFs
   - Invoice list/download endpoints
   - Invoice history tracking

### Phase 3: Overage & Advanced Features (Weeks 9-12)
**Priority**: P1 - Important for Team+ plans

1. **Overage Billing** 🟡
   - Overage tracking
   - Overage calculation
   - Overage billing in invoices
   - Soft limit enforcement (Team+)

2. **Feature Entitlements** 🟡
   - Create `Entitlement` model
   - Map features to entitlements
   - Implement entitlement checks

3. **UI Enhancements** 🟡
   - Payment method management
   - Upgrade/downgrade/cancel flows
   - Invoice list/download UI
   - Quota exceeded states

### Phase 4: Enterprise Features (Weeks 13-16)
**Priority**: P2 - Enterprise only

1. **SSO/SAML** 🟢
   - SSO integration
   - SAML support

2. **SCIM** 🟢
   - SCIM API for user provisioning

3. **Audit Logs** 🟢
   - Audit event tracking
   - Audit log export

4. **Data Residency** 🟢
   - Data residency configuration
   - Multi-region support

### Phase 5: Organic Growth (Ongoing)
**Priority**: P2 - Long-term growth

1. **Docs Site** 🟢
   - SEO-friendly docs
   - Versioned documentation

2. **Content Pages** 🟢
   - Comparison pages
   - Use-case landing pages
   - Templates library

3. **Changelog** 🟢
   - Public changelog
   - RSS feed

---

## 🔄 Migration Strategy

### Step 1: Organization Migration
1. Create `Organization` model
2. Create migration script to:
   - Create org for each user
   - Migrate subscriptions to org-based
   - Migrate projects to org-based
3. Update all queries to use `orgId`

### Step 2: Plan Update
1. Update plan limits in seed script
2. Update prices
3. Add new fields (`maxApps`, `maxEnvironments`, `maxSeats`)
4. Run migration

### Step 3: Metering Migration
1. Create `UsageRollup` model
2. Backfill historical usage data
3. Implement monthly rollup cron job

### Step 4: Billing Integration
1. Set up Stripe account
2. Implement checkout flow
3. Add webhook handlers
4. Test payment flows

---

## 📝 Data Model Changes Summary

### New Models Required
1. `Organization` - Primary tenant entity
2. `OrgMember` - Seat tracking
3. `Environment` - Per-project environments
4. `UsageRollup` - Monthly usage tracking
5. `Entitlement` - Feature access control
6. `AuditEvent` - Audit log tracking

### Models to Update
1. `Plan` - Add `maxApps`, `maxEnvironments`, `maxSeats`, update prices
2. `Subscription` - Change from `userId` to `orgId`, add overage fields
3. `Project` - Change from `userId` to `orgId`
4. `Invoice` - Add overage line items, payment provider IDs

### Models to Remove
- None (backward compatible changes)

---

## 🎯 Success Criteria

### Phase 1 Complete When:
- ✅ Organizations created for all existing users
- ✅ Subscriptions migrated to org-based
- ✅ Plan limits match PRD
- ✅ Usage rollups working
- ✅ Environments/seats enforced

### Phase 2 Complete When:
- ✅ Stripe integrated
- ✅ Checkout flow working
- ✅ Upgrade/downgrade/cancel flows working
- ✅ Invoices generated
- ✅ Payment failure handling working

### Phase 3 Complete When:
- ✅ Overage tracking and billing working
- ✅ Feature entitlements enforced
- ✅ All UI screens implemented
- ✅ Quota exceeded states handled

### Phase 4 Complete When:
- ✅ SSO/SAML working (Enterprise)
- ✅ SCIM working (Enterprise)
- ✅ Audit logs exported
- ✅ Data residency configured

---

## 🚨 Risks & Mitigations

### Risk 1: Organization Migration Complexity
**Mitigation**: 
- Create comprehensive migration script
- Test on staging first
- Run during low-traffic period
- Have rollback plan

### Risk 2: Payment Provider Integration
**Mitigation**:
- Use Stripe (well-documented)
- Test webhooks thoroughly
- Implement idempotency
- Monitor payment failures

### Risk 3: Usage Rollup Performance
**Mitigation**:
- Use database indexes
- Batch processing
- Cache rollups
- Monitor query performance

### Risk 4: Breaking Changes
**Mitigation**:
- Maintain backward compatibility where possible
- Version API endpoints
- Gradual rollout
- Feature flags for new functionality

---

## 📚 Related Documentation

- [Multi-Tenant Subscription PRD](./MULTI_TENANT_SUBSCRIPTION_PRD.md) - Original PRD
- [Subscription Implementation Status](./MULTI_TENANT_SUBSCRIPTION_IMPLEMENTATION_STATUS.md) - Current status
- [Admin Dashboard PRD](./ADMIN_DASHBOARD_PRD.md) - Admin features

---

## ✅ Next Steps

1. **Review this gap analysis** with stakeholders
2. **Prioritize phases** based on business needs
3. **Create detailed implementation plan** for Phase 1
4. **Set up Stripe account** (if not already done)
5. **Begin Phase 1 implementation** (Organization model)

---

**Last Updated**: December 25, 2025  
**Status**: Ready for Review

