# Plans & Subscriptions - Documentation Index

**Date**: December 25, 2025  
**Purpose**: Central index for all Plans & Subscriptions architecture and implementation documentation

---

## 📚 Documentation Overview

This directory contains comprehensive documentation for the Plans & Subscriptions system. Each document covers a specific aspect of the architecture, implementation, and lifecycle.

---

## 📖 Document List

### 1. [PLANS_SUBSCRIPTIONS_ARCHITECTURE.md](./PLANS_SUBSCRIPTIONS_ARCHITECTURE.md)
**Purpose**: Complete architecture overview  
**Covers**:
- System overview and entity relationships
- SDK-User-Subscription linkage
- Feature governance model
- Metering & usage tracking
- Throttling & enforcement
- Monthly reset & billing periods
- Data retention
- Subscription lifecycle
- Current gaps & recommendations

**Use When**: You need to understand how all components work together

---

### 2. [PLANS_SUBSCRIPTIONS_FAQ.md](./PLANS_SUBSCRIPTIONS_FAQ.md)
**Purpose**: Direct answers to common questions  
**Covers**:
- How SDK-User is linked to SDK Settings
- Governance on SDK based on subscription
- Metered usage and throttling behavior
- Plan features vs Product Features settings
- Monthly reset and data retention
- Complete renewal and SDK linking flow
- Subscription disabled behavior

**Use When**: You have specific questions about current behavior

---

### 3. [SUBSCRIPTION_RENEWAL_BILLING_LIFECYCLE.md](./SUBSCRIPTION_RENEWAL_BILLING_LIFECYCLE.md) ⭐ **NEW**
**Purpose**: Comprehensive renewal and billing lifecycle  
**Covers**:
- Scenario: Free Plan user with 900/1000 devices
- Renewal vs new subscription decision
- Free Plan renewal logic (trial vs forever free)
- Paid Plan renewal & payment processing
- Payment failure handling & grace periods
- Payment retry logic
- Reminder system (emails, notifications)
- Meter reset logic (per-period vs lifetime)
- Data lifecycle (what happens to data at renewal)
- Complete renewal scenarios with examples

**Use When**: You need to understand renewal, billing periods, payment handling, and what happens to data/meters

---

### 4. [SUBSCRIPTION_BILLING_GAP_ANALYSIS.md](./SUBSCRIPTION_BILLING_GAP_ANALYSIS.md)
**Purpose**: Gap analysis between PRD and current implementation  
**Covers**:
- Organization model gaps
- Plan structure gaps
- Metering gaps
- Payment processing gaps
- Overage policy gaps
- Feature entitlements gaps
- UI gaps
- Backend API gaps

**Use When**: You need to understand what's missing vs what's implemented

---

### 5. [MULTI_TENANT_SUBSCRIPTION_PRD.md](./MULTI_TENANT_SUBSCRIPTION_PRD.md)
**Purpose**: Original Product Requirements Document  
**Covers**:
- Goals & objectives
- User stories
- Technical requirements
- Implementation phases

**Use When**: You need to understand the original requirements

---

### 6. [MULTI_TENANT_SUBSCRIPTION_IMPLEMENTATION.md](./MULTI_TENANT_SUBSCRIPTION_IMPLEMENTATION.md)
**Purpose**: Technical implementation plan  
**Covers**:
- File structure changes
- Database schema changes
- API endpoint implementations
- UI component implementations
- Testing requirements

**Use When**: You're implementing features

---

## 🎯 Quick Reference Guide

### Understanding Current State
1. Start with **[PLANS_SUBSCRIPTIONS_FAQ.md](./PLANS_SUBSCRIPTIONS_FAQ.md)** for quick answers
2. Read **[PLANS_SUBSCRIPTIONS_ARCHITECTURE.md](./PLANS_SUBSCRIPTIONS_ARCHITECTURE.md)** for complete picture
3. Check **[SUBSCRIPTION_BILLING_GAP_ANALYSIS.md](./SUBSCRIPTION_BILLING_GAP_ANALYSIS.md)** for what's missing

### Understanding Renewal & Billing
1. Read **[SUBSCRIPTION_RENEWAL_BILLING_LIFECYCLE.md](./SUBSCRIPTION_RENEWAL_BILLING_LIFECYCLE.md)** ⭐
2. See Section 12 for complete examples

### Implementing Features
1. Read **[MULTI_TENANT_SUBSCRIPTION_PRD.md](./MULTI_TENANT_SUBSCRIPTION_PRD.md)** for requirements
2. Follow **[MULTI_TENANT_SUBSCRIPTION_IMPLEMENTATION.md](./MULTI_TENANT_SUBSCRIPTION_IMPLEMENTATION.md)** for implementation steps

---

## 🔑 Key Concepts Quick Reference

### Subscription Renewal
- **Same Subscription**: Renewal resets meters, doesn't create new subscription
- **Period Advances**: `currentPeriodStart` and `currentPeriodEnd` move forward
- **Meters Reset**: Per-period meters reset to 0 (devices, apiTraces, logs, etc.)
- **Data Preserved**: Old data kept in database (deleted per retention policy)

### Free Plan Renewal
- **With Trial**: Renews monthly while trial active, stops when trial expires
- **Forever Free**: Renews monthly forever (if `trialEndDate` is null/far future)
- **Decision**: Check `trialEndDate` - if expired, don't renew

### Paid Plan Renewal
- **Requires Payment**: Payment must succeed to renew
- **Grace Period**: 7 days if payment fails
- **Retry Logic**: Daily retry attempts during grace period
- **Suspension**: After grace period expires, suspend subscription

### Meter Types
- **Per-Period** (reset monthly): apiTraces, apiRequests, logs, sessions, crashes, devices
- **Lifetime** (never reset): projects
- **Current State** (reset on plan change): businessConfigKeys, localizationKeys

### Data Lifecycle
- **At Renewal**: Data preserved, meters reset
- **Retention**: Data deleted after `plan.retentionDays`
- **Trial Expired**: Data deleted (Free Plan)
- **Payment Failure**: Data kept for 30 days, then deleted if downgraded

---

## 🚨 Critical Gaps Identified

### Current Implementation Issues

1. **❌ No Renewal Logic**: Meters never reset, periods never advance
2. **❌ Wrong Period Calculation**: Uses `trialStartDate/trialEndDate` instead of `currentPeriodStart/currentPeriodEnd`
3. **❌ No Payment Processing**: Can't charge for paid plans
4. **❌ No Grace Period**: No payment failure handling
5. **❌ No Payment Retry**: One failure = immediate suspension
6. **❌ No Reminder System**: No email notifications
7. **❌ No SDK-Subscription Enforcement**: SDK works even if subscription disabled/expired
8. **❌ No Throttling Enforcement**: Meters calculated but not enforced

---

## 📋 Implementation Priority

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

### Phase 4: SDK Enforcement (P0)
12. Add subscription checks to SDK endpoints
13. Implement throttling enforcement
14. Unify FeatureFlags with Plan features

### Phase 5: Enhancements (P2)
15. Implement usage snapshot storage
16. Implement overage tracking
17. Add payment method management UI

---

## 📞 Questions?

If you have questions about:
- **Architecture**: See [PLANS_SUBSCRIPTIONS_ARCHITECTURE.md](./PLANS_SUBSCRIPTIONS_ARCHITECTURE.md)
- **Current Behavior**: See [PLANS_SUBSCRIPTIONS_FAQ.md](./PLANS_SUBSCRIPTIONS_FAQ.md)
- **Renewal & Billing**: See [SUBSCRIPTION_RENEWAL_BILLING_LIFECYCLE.md](./SUBSCRIPTION_RENEWAL_BILLING_LIFECYCLE.md) ⭐
- **What's Missing**: See [SUBSCRIPTION_BILLING_GAP_ANALYSIS.md](./SUBSCRIPTION_BILLING_GAP_ANALYSIS.md)

---

**Last Updated**: December 25, 2025

