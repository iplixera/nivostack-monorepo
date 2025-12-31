# Next Steps After Connecting Ingest & Control APIs to GitHub

**Date**: December 31, 2024  
**Status**: Ready to execute after GitHub connection

## Overview

After connecting `nivostack-ingest-api` and `nivostack-control-api` to GitHub, follow these steps to complete the deployment setup.

## Step-by-Step Checklist

### ✅ Phase 1: GitHub Connection (Current)

- [x] Website connected to GitHub
- [x] Studio connected to GitHub
- [ ] Ingest API connected to GitHub
- [ ] Control API connected to GitHub

### Phase 2: Configure Ignored Build Step

**For Ingest API:**
1. Go to: https://vercel.com/nivostack/nivostack-ingest-api/settings/general
2. Scroll to **"Ignored Build Step"**
3. Select: **"Run my Bash script"**
4. Command:
   ```bash
   git diff --name-only HEAD^ HEAD | grep -q "^dashboard/" && exit 1 || exit 0
   ```
5. Click **"Save"**

**For Control API:**
1. Go to: https://vercel.com/nivostack/nivostack-control-api/settings/general
2. Scroll to **"Ignored Build Step"**
3. Select: **"Run my Bash script"**
4. Command:
   ```bash
   git diff --name-only HEAD^ HEAD | grep -q "^dashboard/" && exit 1 || exit 0
   ```
5. Click **"Save"**

**Why:** Both use `dashboard/` folder, so they'll deploy when dashboard changes (same as Studio).

### Phase 3: Configure Environment Variables

**For Ingest API:**

Required variables:
- `POSTGRES_PRISMA_URL` - Production database (pooled)
- `POSTGRES_URL_NON_POOLING` - Production database (direct)
- `JWT_SECRET` - JWT signing secret

**Steps:**
1. Go to: https://vercel.com/nivostack/nivostack-ingest-api/settings/environment-variables
2. Add each variable for **Production**, **Preview**, and **Development**
3. Use same values as Studio (they share the database)
4. Click **"Save"**

**For Control API:**

Required variables:
- `POSTGRES_PRISMA_URL` - Production database (pooled)
- `POSTGRES_URL_NON_POOLING` - Production database (direct)
- `JWT_SECRET` - JWT signing secret
- `STRIPE_SECRET_KEY` - Stripe secret key (if using payments)
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret (if using payments)

**Steps:**
1. Go to: https://vercel.com/nivostack/nivostack-control-api/settings/environment-variables
2. Add each variable for **Production**, **Preview**, and **Development**
3. Use same values as Studio
4. Click **"Save"**

### Phase 4: Add Domains

**For Ingest API:**

1. Go to: https://vercel.com/nivostack/nivostack-ingest-api/settings/domains
2. Click **"Add Domain"**
3. Enter: `ingest.nivostack.com`
4. Follow DNS configuration instructions

**For Control API:**

1. Go to: https://vercel.com/nivostack/nivostack-control-api/settings/domains
2. Click **"Add Domain"**
3. Enter: `api.nivostack.com`
4. Follow DNS configuration instructions

### Phase 5: Configure DNS Records

After adding domains in Vercel, configure DNS in GoDaddy:

**CNAME Records:**
- Type: `CNAME`
- Name: `ingest`
- Value: `cname.vercel-dns.com.` (or value from Vercel)
- TTL: `3600`

- Type: `CNAME`
- Name: `api`
- Value: `cname.vercel-dns.com.` (or value from Vercel)
- TTL: `3600`

**Note:** Vercel will provide exact DNS values after adding domains. Use those exact values.

### Phase 6: Deploy APIs

**Option A: Automatic (After GitHub Connection)**

Just push to GitHub:
```bash
git commit --allow-empty -m "chore: trigger API deployments"
git push origin main
```

Both APIs should deploy automatically.

**Option B: Manual**

**Ingest API:**
```bash
cd dashboard
vercel link --project nivostack-ingest-api
vercel --prod --local-config vercel-ingest.json
```

**Control API:**
```bash
cd dashboard
vercel link --project nivostack-control-api
vercel --prod --local-config vercel-control.json
```

### Phase 7: Verify Deployments

**Test Ingest API:**
```bash
# Health check
curl https://ingest.nivostack.com/api/health

# Should return: {"status":"ok",...}
```

**Test Control API:**
```bash
# Health check
curl https://api.nivostack.com/api/health

# Should return: {"status":"ok",...}
```

**Test SDK Integration:**
```bash
# Device registration (Ingest API)
curl -X POST https://ingest.nivostack.com/api/devices \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"deviceId": "test-device", "platform": "ios"}'

# SDK init (Control API)
curl "https://api.nivostack.com/api/sdk-init?apiKey=YOUR_API_KEY"
```

### Phase 8: Run Database Migrations

After first deployment, trigger migrations:

**Via API:**
```bash
curl https://ingest.nivostack.com/api/health
curl https://api.nivostack.com/api/health
```

**Or manually:**
```bash
bash scripts/migrate-production.sh
```

## Expected Behavior After Setup

### Deployment Flow

1. **Change in `website/`:**
   - ✅ Website deploys
   - ⏭️ Studio, Ingest, Control skip

2. **Change in `dashboard/`:**
   - ✅ Studio deploys
   - ✅ Ingest API deploys
   - ✅ Control API deploys
   - ⏭️ Website skips

3. **Change in both:**
   - ✅ All projects deploy

### API Routing

**Ingest API (`ingest.nivostack.com`):**
- `/api/devices` (POST)
- `/api/traces` (POST)
- `/api/logs` (POST)
- `/api/crashes` (POST)
- `/api/sessions` (POST, PUT, PATCH)
- All other routes → 404

**Control API (`api.nivostack.com`):**
- `/api/sdk-init` (GET)
- `/api/business-config` (GET)
- `/api/localization/*` (GET)
- `/api/feature-flags` (GET)
- `/api/projects` (GET, CRUD)
- `/api/devices` (GET, DELETE)
- All POST routes → 404

**Studio (`studio.nivostack.com`):**
- All routes (UI + APIs)
- Full dashboard functionality

## Troubleshooting

### Issue: APIs Not Deploying

**Check:**
1. GitHub connection status
2. Ignored Build Step configuration
3. Root Directory setting (`dashboard`)
4. Build logs for errors

### Issue: DNS Not Working

**Check:**
1. DNS records are correct
2. DNS propagation (can take up to 48 hours)
3. Domain added in Vercel Dashboard
4. SSL certificate status

### Issue: APIs Return 404

**Check:**
1. Routes configured in `vercel-ingest.json` / `vercel-control.json`
2. Correct HTTP methods (POST for ingest, GET for control)
3. API endpoints exist in codebase

### Issue: Database Errors

**Check:**
1. Environment variables set correctly
2. Database migrations run
3. Database connection strings valid

## Verification Checklist

After completing all steps:

- [ ] Ingest API connected to GitHub
- [ ] Control API connected to GitHub
- [ ] Ignored Build Step configured for both
- [ ] Environment variables set for both
- [ ] Domains added (`ingest.nivostack.com`, `api.nivostack.com`)
- [ ] DNS records configured
- [ ] APIs deployed successfully
- [ ] Health checks return 200 OK
- [ ] SDK integration tested
- [ ] Database migrations completed

## Next Steps After APIs Are Live

1. **Update SDKs** (if needed)
   - Verify endpoints in Flutter SDK
   - Update Android SDK if needed
   - Test iOS SDK

2. **Monitor Deployments**
   - Check Vercel Dashboard regularly
   - Monitor build minutes usage
   - Watch for deployment errors

3. **Documentation**
   - Update API documentation
   - Update SDK integration guides
   - Document any issues/solutions

4. **Testing**
   - End-to-end SDK testing
   - Load testing for ingest API
   - Performance monitoring

---

**Last Updated**: December 31, 2024  
**Status**: Ready for execution

