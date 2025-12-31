# Deploy and Verify Ingest & Control APIs

**Date**: December 31, 2024  
**Status**: Ready to deploy - Environment variables and DNS configured ✅

## Current Status

✅ Environment variables set  
✅ DNS configured  
✅ Vercel domains created  
⏳ Ready to deploy and verify

## Step 1: Verify Ignored Build Step

**For Ingest API:**
1. Go to: https://vercel.com/nivostack/nivostack-ingest-api/settings/general
2. Verify **"Ignored Build Step"** is set to:
   ```bash
   git diff --name-only HEAD^ HEAD | grep -q "^dashboard/" && exit 1 || exit 0
   ```

**For Control API:**
1. Go to: https://vercel.com/nivostack/nivostack-control-api/settings/general
2. Verify **"Ignored Build Step"** is set to:
   ```bash
   git diff --name-only HEAD^ HEAD | grep -q "^dashboard/" && exit 1 || exit 0
   ```

## Step 2: Trigger Deployment

**Option A: Push to GitHub (Automatic)**

If APIs are connected to GitHub, push a commit:
```bash
git commit --allow-empty -m "chore: trigger Ingest and Control API deployments"
git push origin main
```

**Option B: Manual Deploy via Dashboard**

1. **Ingest API:**
   - Go to: https://vercel.com/nivostack/nivostack-ingest-api
   - Click **"Deploy"** button
   - Select branch: `main`
   - Click **"Deploy"**

2. **Control API:**
   - Go to: https://vercel.com/nivostack/nivostack-control-api
   - Click **"Deploy"** button
   - Select branch: `main`
   - Click **"Deploy"**

**Option C: Manual Deploy via CLI**

```bash
# Ingest API
cd dashboard
vercel link --project nivostack-ingest-api
vercel --prod --local-config vercel-ingest.json

# Control API
vercel link --project nivostack-control-api
vercel --prod --local-config vercel-control.json
```

## Step 3: Verify Deployments

### Check Deployment Status

**Via Dashboard:**
1. Go to each project's **"Deployments"** tab
2. Verify deployment status is **"Ready"** (green)
3. Check build logs for any errors

**Via CLI:**
```bash
vercel ls --project nivostack-ingest-api
vercel ls --project nivostack-control-api
```

### Test Health Endpoints

**Ingest API:**
```bash
curl https://ingest.nivostack.com/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-12-31T...",
  "migration": "already_completed",
  "database": "configured"
}
```

**Control API:**
```bash
curl https://api.nivostack.com/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-12-31T...",
  "migration": "already_completed",
  "database": "configured"
}
```

## Step 4: Test API Endpoints

### Test Ingest API (POST Endpoints)

**Device Registration:**
```bash
curl -X POST https://ingest.nivostack.com/api/devices \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "test-device-001",
    "platform": "ios",
    "osVersion": "17.0",
    "appVersion": "1.0.0",
    "manufacturer": "Apple",
    "model": "iPhone 15 Pro"
  }'
```

**Expected:** `{"id": "...", "deviceId": "test-device-001", ...}`

**Send Log:**
```bash
curl -X POST https://ingest.nivostack.com/api/logs \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "test-device-001",
    "level": "INFO",
    "message": "Test log entry",
    "timestamp": "2024-12-31T12:00:00Z",
    "tag": "test"
  }'
```

**Expected:** `{"id": "...", "message": "Test log entry", ...}`

### Test Control API (GET Endpoints)

**SDK Init:**
```bash
curl "https://api.nivostack.com/api/sdk-init?apiKey=YOUR_API_KEY"
```

**Expected:** Feature flags, SDK settings, device config

**Business Config:**
```bash
curl "https://api.nivostack.com/api/business-config?apiKey=YOUR_API_KEY"
```

**Expected:** Business configuration key-value pairs

**Feature Flags:**
```bash
curl "https://api.nivostack.com/api/feature-flags?apiKey=YOUR_API_KEY"
```

**Expected:** Feature flags object

## Step 5: Verify Route Filtering

### Ingest API Should Only Accept POST

**Test GET (should fail/404):**
```bash
curl https://ingest.nivostack.com/api/devices
# Should return 404 or method not allowed
```

**Test POST (should work):**
```bash
curl -X POST https://ingest.nivostack.com/api/devices \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"deviceId": "test"}'
# Should work
```

### Control API Should Only Accept GET/CRUD

**Test GET (should work):**
```bash
curl "https://api.nivostack.com/api/sdk-init?apiKey=YOUR_API_KEY"
# Should work
```

**Test POST (should fail/404):**
```bash
curl -X POST https://api.nivostack.com/api/devices \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"deviceId": "test"}'
# Should return 404 or method not allowed
```

## Step 6: Run Database Migrations

If this is the first deployment, trigger migrations:

**Via Health Endpoint:**
```bash
curl https://ingest.nivostack.com/api/health
curl https://api.nivostack.com/api/health
```

**Or Manually:**
```bash
bash scripts/migrate-production.sh
```

## Step 7: Test SDK Integration

### Flutter SDK

Update your Flutter app to use production endpoints:
```dart
await NivoStack.init(
  apiKey: 'your-api-key',
  ingestUrl: 'https://ingest.nivostack.com',
  controlUrl: 'https://api.nivostack.com',
);
```

### Android SDK

Update Android SDK configuration:
```kotlin
NivoStack.init(
    context = this,
    baseUrl = "https://ingest.nivostack.com",  // For sending data
    controlUrl = "https://api.nivostack.com",  // For fetching config
    apiKey = "your-api-key",
    projectId = "your-project-id"
)
```

### iOS SDK

Update iOS SDK configuration:
```swift
NivoStack.shared.configure(
    apiKey: "your-api-key",
    projectId: "your-project-id",
    ingestUrl: "https://ingest.nivostack.com",
    controlUrl: "https://api.nivostack.com"
)
```

## Verification Checklist

After deployment:

- [ ] Ingest API deployment successful
- [ ] Control API deployment successful
- [ ] Health endpoints return 200 OK
- [ ] Ingest API accepts POST requests
- [ ] Control API accepts GET requests
- [ ] Route filtering works (POST blocked on Control, GET blocked on Ingest)
- [ ] Database migrations completed
- [ ] SDK integration tested
- [ ] DNS propagation complete (domains resolve)

## Troubleshooting

### Issue: Health Endpoint Returns 500

**Cause:** Database migration not run  
**Fix:** Trigger migration via `/api/health` or run manually

### Issue: APIs Return 404

**Cause:** Routes not configured correctly  
**Fix:** Check `vercel-ingest.json` and `vercel-control.json` route configurations

### Issue: DNS Not Resolving

**Cause:** DNS propagation incomplete  
**Fix:** Wait up to 48 hours, verify DNS records in GoDaddy

### Issue: Authentication Errors

**Cause:** Missing or invalid API key  
**Fix:** Verify API key in request headers (`X-API-Key`)

## Next Steps After Verification

1. **Monitor Deployments**
   - Check Vercel Dashboard regularly
   - Monitor build minutes usage
   - Watch for errors

2. **Update Documentation**
   - Update API documentation with production URLs
   - Update SDK integration guides
   - Document any issues/solutions

3. **Performance Testing**
   - Load testing for Ingest API
   - Monitor response times
   - Check database performance

4. **Production Readiness**
   - Set up monitoring/alerts
   - Configure error tracking
   - Set up backup procedures

---

**Last Updated**: December 31, 2024  
**Status**: Ready for deployment and verification

