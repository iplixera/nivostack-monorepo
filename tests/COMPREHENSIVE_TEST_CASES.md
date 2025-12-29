# Comprehensive Test Cases - DevBridge Platform

**Last Updated**: December 27, 2024  
**Test Environment**: Localhost (http://localhost:3000)

## Overview

This document outlines comprehensive test cases covering all features implemented across all PRDs:
- Business Configuration (Phases 1-4)
- Localization (Phases 1-2)
- Device Registration (Phases 1-2)
- Subscription & Billing (Phases 1-4)
- Admin Dashboard

---

## Test User Categories

### By Subscription Plan
- **Free Plan**: 5 users (0%, 10%, 50%, 80%, 100% consumption)
- **Pro Plan**: 5 users (0%, 10%, 50%, 80%, 100% consumption)
- **Team Plan**: 5 users (0%, 10%, 50%, 80%, 100% consumption)
- **Enterprise Plan**: 2 users (0%, High Usage)

### By Role
- **Admin User**: 1 user (admin@devbridge.com)
- **Regular Users**: 17 users (various plans and consumption levels)

---

## 1. Authentication & Authorization Tests

### 1.1 User Login
- ✅ Login with valid credentials
- ✅ Login with invalid password
- ✅ Login with non-existent email
- ✅ Session persistence after page refresh
- ✅ Logout functionality

### 1.2 Admin Access
- ✅ Admin can access `/admin` routes
- ✅ Regular users cannot access `/admin` routes
- ✅ Admin sees admin-specific navigation items
- ✅ Regular users see user-specific navigation items

---

## 2. Business Configuration Tests

### 2.1 Core Configuration Management
- ✅ Create business config with all value types (string, integer, boolean, decimal, json, image)
- ✅ Update existing config
- ✅ Delete config
- ✅ List all configs
- ✅ Filter by category
- ✅ Search configs by key/label

### 2.2 Phase 1: Targeting & Rollout
- ✅ Create targeting rules (user, device, app context)
- ✅ Test targeting rule evaluation
- ✅ Set rollout percentage (0-100%)
- ✅ Verify consistent user assignment based on hash
- ✅ View change history
- ✅ Test default value fallback

**Test Cases**:
1. Create config with targeting rules targeting iOS devices
2. Set rollout percentage to 50%
3. Verify only 50% of users receive the config
4. View change history and verify all changes are logged

### 2.3 Phase 2: Real-time Updates & Analytics
- ✅ Connect to SSE endpoint (`/api/business-config/stream`)
- ✅ Receive real-time updates when config changes
- ✅ View analytics dashboard
- ✅ Filter analytics by date range
- ✅ View per-config statistics
- ✅ Verify cache hit rate tracking
- ✅ Verify targeting match rate tracking

**Test Cases**:
1. Open SSE connection
2. Update a config value
3. Verify SSE event is received
4. View analytics and verify fetch counts are tracked

### 2.4 Phase 3: A/B Testing
- ✅ Create experiment with 2-10 variants
- ✅ Set variant weights (must sum to 100%)
- ✅ Start experiment
- ✅ View experiment results
- ✅ Verify statistical significance calculation
- ✅ Stop experiment
- ✅ Delete experiment

**Test Cases**:
1. Create experiment with 2 variants (50/50 split)
2. Start experiment
3. Simulate SDK requests (assign users to variants)
4. Track conversion events
5. View results and verify conversion rates
6. Verify statistical significance between variants

### 2.5 Phase 4: Advanced Features

#### Validation
- ✅ Create config with validation schema
- ✅ Test min/max value constraints
- ✅ Test min/max length constraints
- ✅ Test regex pattern validation
- ✅ Test allowed values validation
- ✅ Verify validation errors are shown

**Test Cases**:
1. Create config with minValue: 0, maxValue: 100
2. Try to set value to 150 (should fail)
3. Try to set value to 50 (should succeed)

#### Deployment Strategies
- ✅ Deploy with immediate strategy (100% instantly)
- ✅ Deploy with canary strategy (10% → 100% after wait)
- ✅ Deploy with linear strategy (gradual increments)
- ✅ Deploy with exponential strategy (exponential growth)
- ✅ View deployment history
- ✅ Rollback deployment

**Test Cases**:
1. Create config with rolloutPercentage: 0
2. Deploy with canary strategy (10% initial, 60min wait)
3. Verify rolloutPercentage updates to 10%
4. Wait for cron job to progress deployment
5. Verify rolloutPercentage eventually reaches 100%

#### Monitoring & Alerts
- ✅ Create alert rule (error_rate, fetch_rate, usage_drop)
- ✅ Set alert threshold and operator
- ✅ Configure webhook URL
- ✅ Configure email recipients
- ✅ View alert events
- ✅ Acknowledge alert events
- ✅ Enable/disable alerts

**Test Cases**:
1. Create alert for fetch_rate < 50 (usage drop)
2. Generate low fetch rate scenario
3. Verify alert is triggered
4. View alert event
5. Acknowledge alert

#### Approval Workflows
- ✅ Create approval request for config change
- ✅ Add approvers
- ✅ Approve request
- ✅ Reject request
- ✅ View approval history
- ✅ Verify change is applied after approval

**Test Cases**:
1. Create approval request for config update
2. Add 2 approvers
3. Set required approvals to 2
4. First approver approves
5. Verify status is still "pending"
6. Second approver approves
7. Verify status is "approved" and change is applied

---

## 3. Localization Tests

### 3.1 Core Features
- ✅ Create language
- ✅ Set default language
- ✅ Enable RTL support
- ✅ Create localization key
- ✅ Add translation for key
- ✅ View translations by language
- ✅ Filter translations by category

### 3.2 Advanced Features
- ✅ Machine Translation (Google Translate, DeepL, Azure)
- ✅ Translation Memory suggestions
- ✅ Pluralization support (ICU format)
- ✅ Translation Comments
- ✅ Translation History
- ✅ Glossary management
- ✅ OTA Updates (delta sync)

**Test Cases**:
1. Create English key "welcome_message"
2. Use machine translation to translate to Spanish
3. Add comment to translation
4. View translation history
5. Add glossary term
6. Check for OTA updates

---

## 4. Device Registration Tests

### 4.1 Core Features
- ✅ Register device via SDK endpoint
- ✅ View device list
- ✅ Filter devices by platform
- ✅ Search devices by device code
- ✅ View device details
- ✅ Update device tags and notes
- ✅ Compare devices side-by-side
- ✅ Export device data

### 4.2 Advanced Features
- ✅ Device fingerprinting
- ✅ Health metrics (battery, storage, memory, network)
- ✅ Firebase-like properties (deviceCategory, deviceBrand, locale, etc.)
- ✅ User association (setUser/clearUser)
- ✅ Debug mode toggle
- ✅ Debug mode auto-expiry

**Test Cases**:
1. Register device with all properties
2. View device in dashboard
3. Verify device fingerprinting
4. Associate user with device
5. Enable debug mode
6. Verify debug mode expires after configured time

---

## 5. Subscription & Billing Tests

### 5.1 Plan Management (Admin)
- ✅ Create plan
- ✅ Update plan limits
- ✅ Delete plan (only if no subscriptions)
- ✅ View all plans
- ✅ Enable/disable plan

### 5.2 Subscription Management
- ✅ View subscription details
- ✅ View usage statistics
- ✅ View quota limits
- ✅ Verify quota enforcement
- ✅ Test throttling at 100% consumption

**Test Cases**:
1. Login as Free Plan user at 100% consumption
2. Try to register new device (should be throttled)
3. Try to send API trace (should be throttled)
4. Verify throttling messages are shown

### 5.3 Plan Upgrades
- ✅ Upgrade from Free to Pro
- ✅ Upgrade from Pro to Team
- ✅ Upgrade from Team to Enterprise
- ✅ Verify quotas update after upgrade
- ✅ Verify usage resets on upgrade

### 5.4 Promo Codes & Discounts
- ✅ Create promo code
- ✅ Apply promo code to subscription
- ✅ Verify discount is applied
- ✅ Test promo code expiration
- ✅ Test promo code usage limits

---

## 6. Admin Dashboard Tests

### 6.1 Platform Statistics
- ✅ View total users
- ✅ View total subscriptions
- ✅ View revenue statistics
- ✅ View plan distribution
- ✅ View usage segmentation

### 6.2 Subscription Management (Admin)
- ✅ View all subscriptions
- ✅ Change user's plan
- ✅ Override user's quotas
- ✅ Enable/disable subscription
- ✅ View subscription history

### 6.3 User Management
- ✅ View all users
- ✅ View user details
- ✅ View user's projects
- ✅ View user's subscription

---

## 7. API Endpoint Tests

### 7.1 SDK Endpoints (API Key Auth)
- ✅ `POST /api/devices` - Register device
- ✅ `POST /api/sessions` - Start session
- ✅ `PUT /api/sessions` - End session
- ✅ `POST /api/traces` - Send API trace
- ✅ `POST /api/logs` - Send log
- ✅ `POST /api/crashes` - Report crash
- ✅ `GET /api/business-config` - Get configs
- ✅ `GET /api/localization/translations` - Get translations
- ✅ `GET /api/feature-flags` - Get feature flags
- ✅ `POST /api/experiments/[id]/assign` - Assign to experiment
- ✅ `POST /api/experiments/[id]/events` - Track experiment event

### 7.2 Dashboard Endpoints (JWT Auth)
- ✅ `GET /api/projects` - List projects
- ✅ `GET /api/devices` - List devices
- ✅ `GET /api/sessions` - List sessions
- ✅ `GET /api/logs` - List logs
- ✅ `GET /api/traces` - List traces
- ✅ `GET /api/business-config` - List configs
- ✅ `GET /api/experiments` - List experiments
- ✅ `GET /api/business-config/[id]/alerts` - List alerts
- ✅ `GET /api/business-config/[id]/approvals` - List approvals

### 7.3 Admin Endpoints (Admin JWT Auth)
- ✅ `GET /api/admin/stats` - Platform statistics
- ✅ `GET /api/admin/users` - List all users
- ✅ `GET /api/admin/subscriptions` - List all subscriptions
- ✅ `GET /api/admin/plans` - List all plans
- ✅ `POST /api/admin/plans` - Create plan
- ✅ `PATCH /api/admin/subscriptions/[id]/plan` - Change plan
- ✅ `PATCH /api/admin/subscriptions/[id]/quotas` - Override quotas

---

## 8. Integration Tests

### 8.1 End-to-End Workflows

#### Workflow 1: Create and Deploy Business Config
1. Login as regular user
2. Navigate to Business Configuration
3. Create new config with targeting rules
4. Set rollout percentage to 50%
5. Deploy with canary strategy
6. Verify deployment progresses
7. View analytics to see usage

#### Workflow 2: Run A/B Test
1. Create business config
2. Create experiment with 2 variants
3. Start experiment
4. Simulate SDK requests (multiple users)
5. Track conversion events
6. View experiment results
7. Stop experiment

#### Workflow 3: Subscription Lifecycle
1. Login as Free Plan user
2. View usage (should show 0% or test data)
3. Upgrade to Pro Plan
4. Verify quotas update
5. Generate usage data
6. View usage statistics
7. Test throttling at 100%

#### Workflow 4: Localization Workflow
1. Create language (Spanish)
2. Create localization key
3. Add English translation
4. Use machine translation for Spanish
5. Review and approve translation
6. Create build
7. Verify translations are included in build

---

## 9. Performance Tests

### 9.1 Load Testing
- ✅ Test with 1000 concurrent requests
- ✅ Test with 10,000 config fetches
- ✅ Test with large datasets (100k+ records)
- ✅ Verify response times < 500ms
- ✅ Verify database query performance

### 9.2 Stress Testing
- ✅ Test deployment progression with many configs
- ✅ Test alert evaluation with many alerts
- ✅ Test experiment assignment with many users
- ✅ Verify system stability under load

---

## 10. Error Handling Tests

### 10.1 Validation Errors
- ✅ Invalid config value (fails validation)
- ✅ Invalid targeting rule syntax
- ✅ Invalid experiment variant weights (not summing to 100%)
- ✅ Invalid deployment strategy

### 10.2 Authorization Errors
- ✅ Regular user accessing admin endpoints
- ✅ User accessing other user's data
- ✅ Invalid API key
- ✅ Expired JWT token

### 10.3 Business Logic Errors
- ✅ Deleting plan with active subscriptions
- ✅ Creating experiment on non-existent config
- ✅ Deploying config with invalid strategy
- ✅ Approving already-approved request

---

## Test Execution Plan

### Phase 1: Setup
1. ✅ Verify database is running
2. ✅ Run database migrations
3. ✅ Generate test users and data
4. ✅ Start development server

### Phase 2: Automated Tests
1. ✅ Run API test suite
2. ✅ Run integration tests
3. ✅ Run performance tests
4. ✅ Generate test report

### Phase 3: Manual Testing
1. ✅ Test each feature manually
2. ✅ Verify UI components
3. ✅ Test user workflows
4. ✅ Document any issues found

### Phase 4: Documentation
1. ✅ Update test credentials document
2. ✅ Document test results
3. ✅ Create test summary report

---

## Test Data Requirements

### Users Required
- 1 Admin user
- 17 Regular users (various plans and consumption levels)

### Data Required
- Devices: ~30,000+ across all users
- Sessions: ~2,700,000+ across all users
- API Traces: ~2,700,000+ across all users
- Logs: ~4,200,000+ across all users
- Crashes: ~94,000+ across all users
- Business Configs: Multiple configs per user
- Experiments: At least 1 active experiment
- Localization: Multiple languages and translations

---

## Success Criteria

### Functional
- ✅ All API endpoints return correct responses
- ✅ All UI components render correctly
- ✅ All workflows complete successfully
- ✅ All validations work as expected
- ✅ All error handling works correctly

### Performance
- ✅ API response times < 500ms (p95)
- ✅ Page load times < 2s
- ✅ Database queries optimized
- ✅ No memory leaks

### Quality
- ✅ No critical bugs
- ✅ No data loss
- ✅ Proper error messages
- ✅ User-friendly UI

---

## Notes

- All test users use password: `Test123!@#`
- Test data is preserved and not deleted automatically
- Admin user: `admin@devbridge.com`
- Test users follow pattern: `{plan}-{consumption}@demo.devbridge.com`

