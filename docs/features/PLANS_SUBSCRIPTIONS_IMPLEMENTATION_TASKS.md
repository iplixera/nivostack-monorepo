# Plans & Subscriptions - Implementation Tasks & Changelog

**Date**: December 25, 2025  
**Status**: Implementation Plan  
**Approach**: Hybrid (Current Subscription + History Table)

---

## 📋 Implementation Phases

### Phase 1: Database Schema & Core Models (P0)
### Phase 2: Subscription Renewal Logic (P0)
### Phase 3: Payment Integration (Stripe) (P0)
### Phase 4: SDK Enforcement (P0)
### Phase 5: Throttling & Metering (P0)
### Phase 6: Reminder System (P1)
### Phase 7: UI Updates (P1)
### Phase 8: Testing & Documentation (P2)

---

## Phase 1: Database Schema & Core Models

### Task 1.1: Add SubscriptionHistory Model
- [ ] Create `SubscriptionHistory` model in `prisma/schema.prisma`
- [ ] Add fields: `id`, `subscriptionId`, `userId`, `planId`, `periodStart`, `periodEnd`, `status`, `totalInvoiced`, `totalPaid`, `devicesRegistered`, `apiTracesCount`, `logsCount`, `sessionsCount`, `crashesCount`, `createdAt`
- [ ] Add indexes: `userId`, `subscriptionId`, `periodStart`
- [ ] Add relation to `Subscription` model

### Task 1.2: Update Subscription Model
- [ ] Add `subscriptionCount` field (Int, default 1)
- [ ] Add `gracePeriodEnd` field (DateTime?)
- [ ] Add `gracePeriodReason` field (String?)
- [ ] Add `lastPaymentAttempt` field (DateTime?)
- [ ] Add `paymentRetryCount` field (Int, default 0)
- [ ] Add `lastAlert80`, `lastAlert90`, `lastAlert100` fields (DateTime?) for usage alerts
- [ ] Add relation to `SubscriptionHistory`
- [ ] Update indexes

### Task 1.3: Add Payment Method Model
- [ ] Create `PaymentMethod` model
- [ ] Add fields: `id`, `userId`, `stripePaymentMethodId`, `type` (card, bank_account), `last4`, `brand`, `expMonth`, `expYear`, `isDefault`, `createdAt`, `updatedAt`
- [ ] Add relation to `User` model
- [ ] Add indexes

### Task 1.4: Update Invoice Model
- [ ] Add `stripeInvoiceId` field (String?)
- [ ] Add `stripePaymentIntentId` field (String?)
- [ ] Add `paymentMethodId` field (String?)
- [ ] Add relation to `PaymentMethod`
- [ ] Update indexes

### Task 1.5: Run Migrations
- [ ] Run `pnpm prisma db push`
- [ ] Run `pnpm prisma generate`
- [ ] Verify schema changes

---

## Phase 2: Subscription Renewal Logic

### Task 2.1: Fix Period Calculation
- [ ] Update `getUsageStats()` in `src/lib/subscription.ts`
- [ ] Change from `trialStartDate/trialEndDate` to `currentPeriodStart/currentPeriodEnd`
- [ ] Update all usage queries to use correct period
- [ ] Test period calculation

### Task 2.2: Create SubscriptionHistory Service
- [ ] Create `src/lib/subscription-history.ts`
- [ ] Add `createHistoryRecord()` function
- [ ] Add `getHistoryByUserId()` function
- [ ] Add `getHistoryBySubscriptionId()` function
- [ ] Add `getSubscriptionCount()` function

### Task 2.3: Implement Renewal Logic
- [ ] Create `src/lib/subscription-renewal.ts`
- [ ] Add `renewSubscription()` function
- [ ] Add `renewFreePlan()` function
- [ ] Add `renewPaidPlan()` function
- [ ] Add `shouldRenewFreePlan()` function
- [ ] Implement history record creation
- [ ] Implement period advancement
- [ ] Implement subscription count increment

### Task 2.4: Create Renewal Cron Job
- [ ] Create `src/app/api/cron/renew-subscriptions/route.ts`
- [ ] Implement daily cron job (runs at 00:00 UTC)
- [ ] Find subscriptions needing renewal (`currentPeriodEnd <= now`)
- [ ] Process Free Plan renewals
- [ ] Process Paid Plan renewals (with payment)
- [ ] Handle errors and logging
- [ ] Add CRON_SECRET authentication

### Task 2.5: Update Vercel Cron Configuration
- [ ] Update `vercel.json` to add renewal cron job
- [ ] Configure schedule: `0 0 * * *` (daily at midnight UTC)
- [ ] Test cron job locally

---

## Phase 3: Payment Integration (Stripe)

### Task 3.1: Install Stripe Dependencies
- [ ] Install `stripe` package: `pnpm add stripe`
- [ ] Install `@stripe/stripe-js` for frontend (if needed)
- [ ] Add Stripe types

### Task 3.2: Configure Stripe Environment Variables
- [ ] Add `STRIPE_SECRET_KEY` to `.env.local` (sandbox key)
- [ ] Add `STRIPE_PUBLISHABLE_KEY` to `.env.local` (sandbox key)
- [ ] Add `STRIPE_WEBHOOK_SECRET` to `.env.local` (for webhooks)
- [ ] Add to Vercel environment variables (test environment)
- [ ] Document Stripe setup in README

### Task 3.3: Create Stripe Service
- [ ] Create `src/lib/stripe.ts`
- [ ] Initialize Stripe client with secret key
- [ ] Add `createCustomer()` function
- [ ] Add `createPaymentMethod()` function
- [ ] Add `attachPaymentMethod()` function
- [ ] Add `chargePaymentMethod()` function
- [ ] Add `createSubscription()` function (Stripe subscription)
- [ ] Add `cancelSubscription()` function
- [ ] Add error handling

### Task 3.4: Create Payment Method API Endpoints
- [ ] Create `src/app/api/payment-methods/route.ts` (GET, POST)
- [ ] Create `src/app/api/payment-methods/[id]/route.ts` (GET, DELETE, PATCH)
- [ ] Implement list payment methods
- [ ] Implement add payment method
- [ ] Implement set default payment method
- [ ] Implement delete payment method
- [ ] Add authentication checks

### Task 3.5: Integrate Payment into Renewal
- [ ] Update `renewPaidPlan()` in `src/lib/subscription-renewal.ts`
- [ ] Add payment attempt logic
- [ ] Handle payment success
- [ ] Handle payment failure (enter grace period)
- [ ] Create invoice on payment success
- [ ] Update invoice status

### Task 3.6: Create Payment Retry Logic
- [ ] Create `src/lib/payment-retry.ts`
- [ ] Add `retryFailedPayment()` function
- [ ] Add `enterGracePeriod()` function
- [ ] Add `suspendSubscription()` function
- [ ] Implement retry logic with exponential backoff

### Task 3.7: Create Payment Retry Cron Job
- [ ] Create `src/app/api/cron/retry-payments/route.ts`
- [ ] Implement daily cron job
- [ ] Find subscriptions in grace period
- [ ] Retry payment for each subscription
- [ ] Send reminders if needed
- [ ] Suspend if grace period expired

### Task 3.8: Create Stripe Webhook Handler
- [ ] Create `src/app/api/webhooks/stripe/route.ts`
- [ ] Handle `payment_intent.succeeded` event
- [ ] Handle `payment_intent.payment_failed` event
- [ ] Handle `invoice.payment_succeeded` event
- [ ] Handle `invoice.payment_failed` event
- [ ] Handle `customer.subscription.deleted` event
- [ ] Verify webhook signature
- [ ] Update subscription/invoice status

### Task 3.9: Update Vercel Cron Configuration
- [ ] Add payment retry cron job to `vercel.json`
- [ ] Configure schedule: `0 2 * * *` (daily at 2 AM UTC)

---

## Phase 4: SDK Enforcement

### Task 4.1: Create Subscription Validation Helper
- [ ] Create `src/lib/subscription-validation.ts`
- [ ] Add `validateSubscription()` function
- [ ] Check `subscription.enabled`
- [ ] Check `subscription.status`
- [ ] Check `trialEndDate` (if applicable)
- [ ] Check `gracePeriodEnd` (if in grace period)
- [ ] Return validation result with error message

### Task 4.2: Update SDK Endpoints - Traces
- [ ] Update `src/app/api/traces/route.ts`
- [ ] Add subscription validation before processing
- [ ] Return 403 if subscription invalid
- [ ] Test with disabled/expired subscriptions

### Task 4.3: Update SDK Endpoints - Logs
- [ ] Update `src/app/api/logs/route.ts`
- [ ] Add subscription validation
- [ ] Return 403 if subscription invalid

### Task 4.4: Update SDK Endpoints - Sessions
- [ ] Update `src/app/api/sessions/route.ts`
- [ ] Add subscription validation
- [ ] Return 403 if subscription invalid

### Task 4.5: Update SDK Endpoints - Crashes
- [ ] Update `src/app/api/crashes/route.ts`
- [ ] Add subscription validation
- [ ] Return 403 if subscription invalid

### Task 4.6: Update SDK Endpoints - Devices
- [ ] Update `src/app/api/devices/route.ts`
- [ ] Add subscription validation
- [ ] Return 403 if subscription invalid

### Task 4.7: Update Feature Flags Endpoint
- [ ] Update `src/app/api/feature-flags/route.ts`
- [ ] Check subscription status
- [ ] Return all flags as `false` if subscription invalid
- [ ] Enforce plan features as maximum

### Task 4.8: Update SDK Init Endpoint
- [ ] Update `src/app/api/sdk-init/route.ts`
- [ ] Check subscription status
- [ ] Return error if subscription invalid
- [ ] Include subscription status in response

---

## Phase 5: Throttling & Metering

### Task 5.1: Create Throttling Helper
- [ ] Create `src/lib/throttling.ts`
- [ ] Add `checkThrottling()` function
- [ ] Check usage vs limit for each meter
- [ ] Return throttling result with status
- [ ] Support hard limit (reject) and soft limit (warn)

### Task 5.2: Update Usage Calculation
- [ ] Update `getUsageStats()` in `src/lib/subscription.ts`
- [ ] Use `currentPeriodStart/currentPeriodEnd` for period-based meters
- [ ] Fix devices meter to be period-based
- [ ] Add API endpoints meter (unique endpoints)
- [ ] Add API requests meter (total requests)

### Task 5.3: Add Throttling to SDK Endpoints
- [ ] Update `POST /api/traces` - check `apiTraces` meter
- [ ] Update `POST /api/logs` - check `logs` meter
- [ ] Update `POST /api/sessions` - check `sessions` meter
- [ ] Update `POST /api/crashes` - check `crashes` meter
- [ ] Update `POST /api/devices` - check `devices` meter
- [ ] Return 429 if throttled
- [ ] Include `Retry-After` header

### Task 5.4: Add Throttling to Dashboard Actions
- [ ] Update project creation - check `projects` meter
- [ ] Update business config key creation - check `businessConfigKeys` meter
- [ ] Update localization key creation - check `localizationKeys` meter
- [ ] Show error messages
- [ ] Disable create buttons when throttled

---

## Phase 6: Reminder System

### Task 6.1: Create Email Service
- [ ] Create `src/lib/email.ts`
- [ ] Add email sending function (using SendGrid, Resend, or similar)
- [ ] Add email templates
- [ ] Configure email provider

### Task 6.2: Create Email Templates
- [ ] Create `payment_failed` template
- [ ] Create `payment_reminder` template (3 days, 1 day)
- [ ] Create `payment_succeeded` template
- [ ] Create `trial_expiring` template (7 days, 3 days, 1 day)
- [ ] Create `trial_expired` template
- [ ] Create `quota_warning_80` template
- [ ] Create `quota_warning_90` template
- [ ] Create `quota_exceeded` template

### Task 6.3: Create Reminder Cron Job
- [ ] Create `src/app/api/cron/send-reminders/route.ts`
- [ ] Implement payment reminders (3 days, 1 day before grace period ends)
- [ ] Implement trial expiration reminders (7 days, 3 days, 1 day)
- [ ] Implement usage alerts (80%, 90%, 100%)
- [ ] Track last sent date to avoid duplicates

### Task 6.4: Update Vercel Cron Configuration
- [ ] Add reminder cron job to `vercel.json`
- [ ] Configure schedule: `0 9 * * *` (daily at 9 AM UTC)

---

## Phase 7: UI Updates

### Task 7.1: Update Subscription Page
- [ ] Show subscription history table
- [ ] Show subscription count
- [ ] Show current period usage
- [ ] Show grace period status (if applicable)
- [ ] Add payment method management section

### Task 7.2: Create Payment Methods Page
- [ ] Create `src/app/(dashboard)/payment-methods/page.tsx`
- [ ] List all payment methods
- [ ] Add payment method form (Stripe Elements)
- [ ] Set default payment method
- [ ] Delete payment method

### Task 7.3: Update Admin Subscriptions Page
- [ ] Show subscription history
- [ ] Show subscription count
- [ ] Show grace period status
- [ ] Add manual renewal button (admin)

### Task 7.4: Add Usage Alerts UI
- [ ] Show usage warnings at 80%, 90%
- [ ] Show throttled status at 100%
- [ ] Add upgrade prompts

---

## Phase 8: Testing & Documentation

### Task 8.1: Create Test Suite
- [ ] Create `tests/subscription-renewal-test.ts`
- [ ] Test Free Plan renewal (trial active)
- [ ] Test Free Plan expiration (trial expired)
- [ ] Test Paid Plan renewal (payment success)
- [ ] Test Paid Plan payment failure
- [ ] Test grace period logic
- [ ] Test payment retry

### Task 8.2: Create Stripe Test Cases
- [ ] Test payment method creation
- [ ] Test payment success flow
- [ ] Test payment failure flow
- [ ] Test webhook handling
- [ ] Test subscription renewal with payment

### Task 8.3: Update Documentation
- [ ] Update `PLANS_SUBSCRIPTIONS_ARCHITECTURE.md` with implementation details
- [ ] Update `SUBSCRIPTION_RENEWAL_BILLING_LIFECYCLE.md` with actual implementation
- [ ] Create `STRIPE_INTEGRATION_GUIDE.md`
- [ ] Update README with Stripe setup instructions

### Task 8.4: Manual Testing Checklist
- [ ] Test Free Plan user registration
- [ ] Test Free Plan renewal (trial active)
- [ ] Test Free Plan expiration
- [ ] Test Paid Plan subscription creation
- [ ] Test payment method addition
- [ ] Test payment success renewal
- [ ] Test payment failure → grace period
- [ ] Test payment retry
- [ ] Test subscription suspension
- [ ] Test SDK enforcement (disabled subscription)
- [ ] Test throttling (exceed limits)
- [ ] Test reminder emails

---

## Changelog

### [Unreleased] - Implementation Phase

#### Added
- `SubscriptionHistory` model for tracking billing periods
- `PaymentMethod` model for storing payment methods
- `subscriptionCount` field to track customer lifetime
- Grace period fields (`gracePeriodEnd`, `gracePeriodReason`)
- Payment retry fields (`lastPaymentAttempt`, `paymentRetryCount`)
- Usage alert tracking fields (`lastAlert80`, `lastAlert90`, `lastAlert100`)

#### Changed
- Updated `getUsageStats()` to use `currentPeriodStart/currentPeriodEnd` instead of `trialStartDate/trialEndDate`
- Devices meter now period-based (resets monthly)
- Subscription renewal creates history record instead of just updating period

#### Fixed
- Period calculation now uses billing period instead of trial period
- Meters now reset correctly on renewal

#### Security
- Added subscription validation to all SDK endpoints
- Added throttling enforcement to prevent quota abuse

---

## Implementation Order

1. **Phase 1**: Database Schema (Foundation)
2. **Phase 2**: Renewal Logic (Core functionality)
3. **Phase 3**: Payment Integration (Billing)
4. **Phase 4**: SDK Enforcement (Security)
5. **Phase 5**: Throttling (Quota enforcement)
6. **Phase 6**: Reminders (User communication)
7. **Phase 7**: UI Updates (User experience)
8. **Phase 8**: Testing (Quality assurance)

---

**Status**: Ready for Implementation  
**Next Step**: Begin Phase 1 - Database Schema & Core Models

