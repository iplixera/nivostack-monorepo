# Comprehensive Test Credentials - DevBridge Platform

**Generated**: December 27, 2024  
**Environment**: Localhost (http://localhost:3000)  
**Password for all users**: `Test123!@#`

---

## 🔐 Quick Login

**Login URL**: http://localhost:3000/login

**Admin User**:
- Email: `admin@devbridge.com`
- Password: `Test123!@#`
- Access: Full admin dashboard, all features

---

## 📊 Test Users by Plan

### Free Plan Users (5 users)

| Email | Consumption | Usage Level | Test Focus |
|-------|-------------|-------------|------------|
| `free-new@demo.devbridge.com` | 0% (New) | Fresh account | New user onboarding, empty state UI |
| `free-10@demo.devbridge.com` | 10% | Low usage | Normal operations, quota display |
| `free-50@demo.devbridge.com` | 50% | Medium usage | Mid-tier usage, analytics |
| `free-80@demo.devbridge.com` | 80% | High usage | Warning thresholds, upgrade prompts |
| `free-100@demo.devbridge.com` | 100% (At Limit) | Maximum usage | Throttling, quota enforcement, upgrade required |

**Free Plan Limits**:
- Devices: 100
- Sessions: 1,000/month
- API Traces: 1,000/month
- API Endpoints: 20 unique
- API Requests: 1,000/month
- Logs: 10,000/month
- Crashes: 100/month
- Business Config Keys: 50
- Localization Languages: 5
- Localization Keys: 200

---

### Pro Plan Users (5 users)

| Email | Consumption | Usage Level | Test Focus |
|-------|-------------|-------------|------------|
| `pro-new@demo.devbridge.com` | 0% (New) | Fresh account | Plan upgrade benefits, new features |
| `pro-10@demo.devbridge.com` | 10% | Low usage | Pro features, higher limits |
| `pro-50@demo.devbridge.com` | 50% | Medium usage | Pro analytics, advanced features |
| `pro-80@demo.devbridge.com` | 80% | High usage | Pro performance, scaling |
| `pro-100@demo.devbridge.com` | 100% (At Limit) | Maximum usage | Pro throttling, upgrade to Team |

**Pro Plan Limits**:
- Devices: 1,000
- Sessions: 100,000/month
- API Traces: 100,000/month
- API Endpoints: 200 unique
- API Requests: 100,000/month
- Logs: 500,000/month
- Crashes: 10,000/month
- Business Config Keys: 500
- Localization Languages: 50
- Localization Keys: 2,000

---

### Team Plan Users (5 users)

| Email | Consumption | Usage Level | Test Focus |
|-------|-------------|-------------|------------|
| `team-new@demo.devbridge.com` | 0% (New) | Fresh account | Team features, unlimited devices |
| `team-10@demo.devbridge.com` | 10% | Low usage | Team collaboration features |
| `team-50@demo.devbridge.com` | 50% | Medium usage | Team analytics, advanced features |
| `team-80@demo.devbridge.com` | 80% | High usage | Team performance, enterprise features |
| `team-100@demo.devbridge.com` | 100% (At Limit) | Maximum usage | Team throttling, upgrade to Enterprise |

**Team Plan Limits**:
- Devices: **Unlimited**
- Sessions: 500,000/month
- API Traces: 500,000/month
- API Endpoints: **Unlimited**
- API Requests: 500,000/month
- Logs: **Unlimited**
- Crashes: **Unlimited**
- Business Config Keys: **Unlimited**
- Localization Languages: **Unlimited**
- Localization Keys: **Unlimited**

---

### Enterprise Plan Users (2 users)

| Email | Consumption | Usage Level | Test Focus |
|-------|-------------|-------------|------------|
| `enterprise-new@demo.devbridge.com` | 0% (New) | Fresh account | Enterprise features, unlimited everything |
| `enterprise-high@demo.devbridge.com` | High Usage | Unlimited | Enterprise performance, large scale |

**Enterprise Plan Limits**:
- **All features: Unlimited**
- Priority support
- Custom SLA
- Dedicated account manager

---

## 🧪 Testing Scenarios

### Scenario 1: New User Onboarding
**User**: `free-new@demo.devbridge.com`  
**Steps**:
1. Login
2. Verify empty state UI
3. Create first project
4. View onboarding flow
5. Test basic features

### Scenario 2: Quota Management
**User**: `free-80@demo.devbridge.com`  
**Steps**:
1. Login
2. View usage dashboard (should show 80%)
3. Verify warning messages
4. Test upgrade prompts
5. Verify quota limits are displayed

### Scenario 3: Throttling & Limits
**User**: `free-100@demo.devbridge.com`  
**Steps**:
1. Login
2. Verify throttling messages
3. Try to create new device (should be blocked)
4. Try to send API trace (should be throttled)
5. Verify upgrade required messages

### Scenario 4: Plan Upgrade Flow
**User**: `free-50@demo.devbridge.com`  
**Steps**:
1. Login
2. Navigate to Subscription page
3. View upgrade options
4. Upgrade to Pro Plan
5. Verify quotas update
6. Verify usage resets

### Scenario 5: Business Configuration Testing
**User**: `pro-new@demo.devbridge.com`  
**Steps**:
1. Login
2. Navigate to Business Configuration
3. Create config with targeting rules
4. Set rollout percentage
5. Deploy with canary strategy
6. View analytics
7. Create A/B test experiment

### Scenario 6: Localization Testing
**User**: `team-new@demo.devbridge.com`  
**Steps**:
1. Login
2. Navigate to Localization
3. Create language (Spanish)
4. Create localization key
5. Use machine translation
6. Add translation comments
7. Create build

### Scenario 7: Device Management
**User**: `pro-10@demo.devbridge.com`  
**Steps**:
1. Login
2. Navigate to Device Registration
3. View device list
4. Filter by platform
5. View device details
6. Add device tags
7. Compare devices

### Scenario 8: Admin Dashboard
**User**: `admin@devbridge.com`  
**Steps**:
1. Login
2. Navigate to Admin Dashboard
3. View platform statistics
4. Manage subscriptions
5. Manage plans
6. View user analytics
7. Test admin-only features

---

## 📋 Feature Testing Checklist

### Business Configuration
- [ ] Create/Edit/Delete configs
- [ ] Targeting rules
- [ ] Rollout percentage
- [ ] Change history
- [ ] Real-time updates (SSE)
- [ ] Analytics dashboard
- [ ] A/B testing experiments
- [ ] Validation system
- [ ] Deployment strategies
- [ ] Monitoring & alerts
- [ ] Approval workflows

### Localization
- [ ] Language management
- [ ] Translation management
- [ ] Machine translation
- [ ] Translation memory
- [ ] Pluralization
- [ ] Translation comments
- [ ] Translation history
- [ ] Glossary
- [ ] OTA updates

### Device Registration
- [ ] Device registration
- [ ] Device list & filtering
- [ ] Device details
- [ ] Device tags & notes
- [ ] Device comparison
- [ ] Device export
- [ ] User association
- [ ] Debug mode

### Subscription & Billing
- [ ] View subscription
- [ ] View usage statistics
- [ ] Quota enforcement
- [ ] Throttling at limits
- [ ] Plan upgrades
- [ ] Promo codes
- [ ] Admin subscription management

### Admin Dashboard
- [ ] Platform statistics
- [ ] User management
- [ ] Subscription management
- [ ] Plan management
- [ ] Analytics & forecasting

---

## 🔧 API Testing

### SDK Endpoints (Use API Key from Project Settings)

**Example API Key**: Get from project settings after login

**Test Endpoints**:
```bash
# Register device
curl -X POST http://localhost:3000/api/devices \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"deviceId": "test-device", "platform": "ios", ...}'

# Get business configs
curl http://localhost:3000/api/business-config \
  -H "X-API-Key: YOUR_API_KEY"

# Get translations
curl http://localhost:3000/api/localization/translations?language=en \
  -H "X-API-Key: YOUR_API_KEY"
```

---

## 📊 Test Data Summary

### Generated Test Data
- **Users**: 18 (1 admin + 17 regular)
- **Projects**: 17 (one per regular user)
- **Devices**: ~30,000+ (distributed across users)
- **Sessions**: ~2,700,000+ (distributed across users)
- **API Traces**: ~2,700,000+ (distributed across users)
- **Logs**: ~4,200,000+ (distributed across users)
- **Crashes**: ~94,000+ (distributed across users)

### Data Distribution
- **Free Plan**: Lower volume data (matching 10-100% of limits)
- **Pro Plan**: Medium volume data (matching 10-100% of limits)
- **Team Plan**: Higher volume data (matching 10-100% of limits)
- **Enterprise Plan**: Very high volume data (unlimited)

---

## 🚀 Quick Start Testing

1. **Start Development Server**:
   ```bash
   pnpm dev
   ```

2. **Login as Admin**:
   - Email: `admin@devbridge.com`
   - Password: `Test123!@#`
   - Verify admin dashboard loads

3. **Test Regular User**:
   - Email: `free-new@demo.devbridge.com`
   - Password: `Test123!@#`
   - Verify user dashboard loads

4. **Test Throttled User**:
   - Email: `free-100@demo.devbridge.com`
   - Password: `Test123!@#`
   - Verify throttling messages

5. **Test Plan Upgrade**:
   - Email: `free-50@demo.devbridge.com`
   - Password: `Test123!@#`
   - Navigate to Subscription → Upgrade to Pro

---

## 📝 Notes

- All test data is preserved and will not be deleted automatically
- Test users follow pattern: `{plan}-{consumption}@demo.devbridge.com`
- Password is the same for all users: `Test123!@#`
- Admin user has full access to all features
- Regular users have access based on their subscription plan
- Usage percentages are approximate and based on generated test data

---

## 🐛 Known Test Data

### Admin User
- **Email**: `admin@devbridge.com`
- **Password**: `Test123!@#`
- **Plan**: Free (with admin privileges)
- **Projects**: Multiple test projects

### Test Projects
Each regular user has one project:
- Project name: `{Plan} {Consumption} Project`
- API Key: `demo-{plan}-{consumption}-{timestamp}`

---

**Last Updated**: December 27, 2024  
**Test Environment**: Local Development  
**Database**: PostgreSQL (localhost:5433)

