# PRD: DevBridge Admin Dashboard

**Version**: 1.0  
**Date**: December 23, 2025  
**Status**: Planning  
**Priority**: P0 (Production Preparation)

---

## 📋 Executive Summary

Create a comprehensive admin dashboard for DevBridge administrators to manage users, subscriptions, and monitor platform statistics. Admins can enable/disable subscriptions, view revenue (prepared for paid plans), and access platform-wide analytics.

---

## 🎯 Goals & Objectives

### Primary Goals
1. **User Management**: View all registered users and their subscription status
2. **Subscription Control**: Enable/disable subscriptions with global SDK control
3. **Revenue Tracking**: Display subscription revenue (prepared for paid plans)
4. **Platform Statistics**: Show platform-wide metrics and feature usage
5. **User Notifications**: Display appropriate warnings to end users when disabled

### Success Metrics
- ✅ Admins can view all users and subscriptions
- ✅ Admins can enable/disable subscriptions
- ✅ Disabled subscriptions disable SDK globally
- ✅ End users see clear warnings when disabled
- ✅ Platform statistics are accurate and up-to-date

---

## 👥 User Stories

### US-1: Admin User List
**As an** admin  
**I want to** see all registered users  
**So that** I can manage the platform

**Acceptance Criteria**:
- List all users with email, name, registration date
- Show subscription status for each user
- Filter by subscription status (active, expired, disabled)
- Search by email or name
- Pagination support

### US-2: Subscription Management
**As an** admin  
**I want to** enable/disable user subscriptions  
**So that** I can control platform access

**Acceptance Criteria**:
- Toggle subscription enabled/disabled status
- Disabled subscriptions disable SDK globally for that user
- Changes take effect immediately
- Audit trail of who disabled/enabled and when

### US-3: Revenue Dashboard
**As an** admin  
**I want to** see subscription revenue  
**So that** I can track business metrics

**Acceptance Criteria**:
- Display total revenue (currently $0 for Free Plan)
- Show revenue by plan type
- Show active vs expired subscriptions count
- Prepare for future paid plan revenue

### US-4: Platform Statistics
**As an** admin  
**I want to** see platform-wide statistics  
**So that** I can monitor platform health

**Acceptance Criteria**:
- Total registered users
- Total API traces
- Total devices
- Feature usage statistics (logs, business config, etc.)
- Active vs inactive subscriptions

### US-5: End User Warnings
**As a** regular user  
**I want to** see clear warnings when my subscription is disabled  
**So that** I know why features aren't working

**Acceptance Criteria**:
- Show "Disabled by admin - contact support" when admin disabled
- Show "Trial expired - upgrade or extend" when trial expired
- Display appropriate action buttons
- Warning appears in dashboard and project pages

---

## 🏗️ Architecture Overview

### Current Architecture
```
User → Subscription → Plan
```

### Proposed Architecture
```
Admin User (special role)
  └── Admin Dashboard
       ├── Users List
       ├── Subscriptions Management
       ├── Revenue Dashboard
       └── Platform Statistics
```

**Key Changes**:
- Add `isAdmin` field to User model
- Add `enabled` field to Subscription model (admin control)
- Add `disabledBy` and `disabledAt` fields to Subscription
- Create admin-only API endpoints
- Create admin dashboard pages

---

## 📊 Data Models

### Updated User Model
```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  password      String
  name          String?
  isAdmin       Boolean  @default(false) // Admin flag
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  projects      Project[]
  subscription  Subscription?
  
  @@index([email])
  @@index([isAdmin])
}
```

### Updated Subscription Model
```prisma
model Subscription {
  id                String   @id @default(cuid())
  userId            String   @unique
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  planId            String
  plan              Plan     @relation(fields: [planId], references: [id])
  status            String   @default("active") // active, expired, cancelled, suspended, disabled
  enabled           Boolean  @default(true) // Admin control - if false, SDK disabled globally
  trialStartDate    DateTime @default(now())
  trialEndDate      DateTime
  currentPeriodStart DateTime @default(now())
  currentPeriodEnd   DateTime
  cancelledAt       DateTime?
  cancelledReason   String?
  disabledBy        String?  // Admin user ID who disabled
  disabledAt        DateTime? // When admin disabled
  enabledBy         String?  // Admin user ID who enabled
  enabledAt         DateTime? // When admin enabled
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  invoices          Invoice[]
  
  @@index([userId])
  @@index([status])
  @@index([enabled])
  @@index([trialEndDate])
}
```

---

## 🎨 UI/UX Design

### Admin Dashboard Layout

**New Route**: `/admin`

**Navigation**:
- Dashboard (overview)
- Users
- Subscriptions
- Revenue
- Statistics

### Admin Dashboard Overview

**Cards Display**:
- Total Users
- Active Subscriptions
- Expired Subscriptions
- Disabled Subscriptions
- Total Revenue (prepared for paid)
- Total API Traces
- Total Devices
- Feature Usage Stats

### Users Management Page

**Table Columns**:
- Email
- Name
- Registration Date
- Subscription Status
- Plan Type
- Trial Status
- Actions (Enable/Disable)

**Filters**:
- Subscription Status
- Plan Type
- Search by email/name

### Subscriptions Management Page

**Table Columns**:
- User Email
- Plan Name
- Status
- Payment Status (Free/Paid)
- Revenue
- Trial End Date
- Enabled/Disabled
- Actions

**Bulk Actions**:
- Enable Selected
- Disable Selected
- Export to CSV

### Revenue Dashboard

**Metrics**:
- Total Revenue (all time)
- Monthly Revenue
- Revenue by Plan
- Active Subscriptions Count
- Expired Subscriptions Count

**Charts** (prepared for future):
- Revenue over time
- Subscription growth
- Plan distribution

---

## 🔧 Implementation Plan

### Phase 1: Database Schema Updates
- Add `isAdmin` to User model
- Add `enabled`, `disabledBy`, `disabledAt`, `enabledBy`, `enabledAt` to Subscription
- Update seed script to create admin user

### Phase 2: Admin Service Layer
- Create `admin.ts` service utilities
- Add admin authentication check
- Add subscription enable/disable functions
- Add statistics aggregation functions

### Phase 3: Admin API Endpoints
- `GET /api/admin/users` - List all users
- `GET /api/admin/subscriptions` - List all subscriptions
- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/revenue` - Revenue statistics
- `PATCH /api/admin/subscriptions/[id]/enable` - Enable subscription
- `PATCH /api/admin/subscriptions/[id]/disable` - Disable subscription

### Phase 4: Subscription Service Updates
- Update `isTrialActive()` to check `enabled` flag
- Update SDK endpoints to check `enabled` flag
- Add admin disable check to all data endpoints

### Phase 5: Admin Dashboard Pages
- Create `/admin` overview page
- Create `/admin/users` page
- Create `/admin/subscriptions` page
- Create `/admin/revenue` page
- Create `/admin/statistics` page

### Phase 6: End User Warnings
- Update SubscriptionBanner to show admin disable message
- Update project detail page warnings
- Add "Contact Admin" messaging

### Phase 7: Testing & Documentation
- Test admin functionality
- Test end user warnings
- Update documentation

---

## 🔍 Impact Analysis

### Database Impact
- **New Fields**: 6 fields added (isAdmin, enabled, disabledBy, disabledAt, enabledBy, enabledAt)
- **New Indexes**: 2 indexes (isAdmin, enabled)
- **Storage Impact**: Minimal (~100 bytes per user)

### API Impact
- **New Endpoints**: 6 admin endpoints
- **Modified Endpoints**: All SDK endpoints check `enabled` flag
- **Performance Impact**: Minimal (additional boolean check)

### Frontend Impact
- **New Pages**: 5 admin pages
- **Modified Pages**: SubscriptionBanner, project detail page
- **Bundle Size Impact**: ~+100KB (estimated)

---

## 💡 Key Features

### Admin Controls
1. **Enable/Disable Subscriptions**: Toggle subscription enabled status
2. **Global SDK Control**: Disabled subscriptions disable SDK for all user's projects
3. **Audit Trail**: Track who disabled/enabled and when

### End User Experience
1. **Clear Warnings**: Different messages for admin disable vs trial expiration
2. **Action Buttons**: "Contact Admin" or "Upgrade/Extend Trial"
3. **Consistent Messaging**: Same warnings across dashboard and project pages

### Statistics & Analytics
1. **User Metrics**: Total users, active/expired/disabled counts
2. **Platform Metrics**: Total API traces, devices, logs, etc.
3. **Feature Usage**: Per-feature statistics (logs, business config, etc.)
4. **Revenue Tracking**: Prepared for paid plans

---

## 🚨 Security Considerations

### Admin Access Control
- Only users with `isAdmin: true` can access admin endpoints
- Admin endpoints require JWT authentication
- Server-side validation of admin status

### Audit Trail
- Log all admin actions (enable/disable subscriptions)
- Track which admin performed actions
- Timestamp all changes

---

## 📅 Implementation Timeline

**Estimated**: 6-8 hours (step by step, not by days)

---

## ✅ Definition of Done

- [ ] Database schema updated
- [ ] Admin user created (seed script)
- [ ] Admin service layer implemented
- [ ] Admin API endpoints created
- [ ] Subscription service updated with enabled check
- [ ] SDK endpoints check enabled flag
- [ ] Admin dashboard pages created
- [ ] End user warnings implemented
- [ ] Statistics displayed correctly
- [ ] Testing completed
- [ ] Documentation updated

---

**Last Updated**: December 23, 2025

