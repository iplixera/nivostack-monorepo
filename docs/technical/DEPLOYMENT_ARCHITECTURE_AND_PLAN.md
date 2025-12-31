# NivoStack Deployment Architecture & Complete Plan

**Date**: December 31, 2024  
**Status**: Studio deployed ✅ | Ingest & Control APIs need deployment

## 🏗️ Current Architecture

### 4 Vercel Projects (Same Codebase, Different Routes)

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Repository                         │
│              nivostack-monorepo-checkout                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ (Git Push)
                            ▼
        ┌───────────────────────────────────┐
        │   Vercel GitHub Integration       │
        └───────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   Studio     │   │   Ingest     │   │   Control    │
│  (Connected) │   │  (NOT CONN)  │   │  (NOT CONN)  │
└──────────────┘   └──────────────┘   └──────────────┘
        │                   │                   │
        ▼                   ▼                   ▼
studio.nivostack.com  ingest.nivostack.com  api.nivostack.com
```

### Project Details

| Project | Vercel Name | Domain | GitHub Connected | Status |
|---------|-------------|--------|------------------|--------|
| Website | `nivostack-website` | `nivostack.com` | ❓ | Unknown |
| Dashboard | `nivostack-studio` | `studio.nivostack.com` | ✅ Yes | ✅ Deployed |
| Ingest API | `nivostack-ingest-api` | `ingest.nivostack.com` | ❌ No | ⏳ Needs Deploy |
| Control API | `nivostack-control-api` | `api.nivostack.com` | ❌ No | ⏳ Needs Deploy |

## 🔍 Current Situation Analysis

### 1. Dashboard (Studio) - ✅ Working

**What it does:**
- Serves the admin dashboard UI (`studio.nivostack.com`)
- Handles ALL API routes (both dashboard APIs and SDK APIs)
- Frontend calls APIs using **relative paths** (`/api/...`)

**How it works:**
```typescript
// dashboard/src/lib/api.ts
const API_BASE = '' // Empty = relative paths
fetch(`${API_BASE}/api/projects`) // Calls studio.nivostack.com/api/projects
```

**Key Point:** Dashboard frontend calls its OWN API routes, NOT separate ingest/control APIs.

### 2. Ingest API - ⏳ Not Deployed Yet

**What it should do:**
- Handle SDK data ingestion (POST endpoints)
- Routes: `/api/devices`, `/api/traces`, `/api/logs`, `/api/crashes`, `/api/sessions`
- Domain: `ingest.nivostack.com`

**Current Status:**
- ❌ Not connected to GitHub
- ❌ Not deployed
- ✅ DNS configured (CNAME record exists)
- ✅ Vercel config exists (`vercel-ingest.json`)

### 3. Control API - ⏳ Not Deployed Yet

**What it should do:**
- Handle SDK configuration (GET endpoints)
- Routes: `/api/sdk-init`, `/api/business-config`, `/api/localization`, etc.
- Domain: `api.nivostack.com`

**Current Status:**
- ❌ Not connected to GitHub
- ❌ Not deployed
- ✅ DNS configured (CNAME record exists)
- ✅ Vercel config exists (`vercel-control.json`)

## 🎯 Answer to Your Questions

### Q1: Do we need to redeploy dashboard to connect ingest and api?

**Answer: NO** - Dashboard is already deployed and working. Ingest and Control APIs are **separate Vercel projects** that need to be deployed independently.

### Q2: What is the overall deployment plan?

**Answer:** See "Complete Deployment Plan" section below.

### Q3: Is the dashboard calling ingest/api or localhost?

**Answer:** Dashboard calls **its own API routes** (relative paths like `/api/projects`). It does NOT call `ingest.nivostack.com` or `api.nivostack.com`.

**Architecture:**
- **Dashboard Frontend** → Calls `studio.nivostack.com/api/*` (same deployment)
- **SDKs** → Call `ingest.nivostack.com/api/*` and `api.nivostack.com/api/*` (separate deployments)

### Q4: How to organize development and complete SDK integration?

**Answer:** See "Development Workflow" section below.

## 📋 Complete Deployment Plan

### Phase 1: Connect Ingest & Control APIs to GitHub ✅

**Goal:** Enable automatic deployments for ingest and control APIs

**Steps:**

1. **Connect Ingest API to GitHub:**
   ```bash
   cd dashboard
   vercel link --project nivostack-ingest-api
   vercel git connect
   # Select: nivostack-ingest-api
   # Select: Branch to deploy (main/master)
   ```

2. **Connect Control API to GitHub:**
   ```bash
   cd dashboard
   vercel link --project nivostack-control-api
   vercel git connect
   # Select: nivostack-control-api
   # Select: Branch to deploy (main/master)
   ```

**Alternative (Via Vercel Dashboard):**
1. Go to https://vercel.com/nivostack/nivostack-ingest-api
2. Settings → Git → Connect Git Repository
3. Select your GitHub repo
4. Configure:
   - Root Directory: `dashboard`
   - Build Command: `pnpm install && pnpm build`
   - Output Directory: `.next`
   - Install Command: `pnpm install`
   - Framework Preset: Next.js

Repeat for `nivostack-control-api`.

### Phase 2: Configure Environment Variables

**For `nivostack-ingest-api`:**
```bash
cd dashboard
vercel link --project nivostack-ingest-api

# Add environment variables
vercel env add POSTGRES_PRISMA_URL production
vercel env add POSTGRES_URL_NON_POOLING production
vercel env add JWT_SECRET production
```

**For `nivostack-control-api`:**
```bash
cd dashboard
vercel link --project nivostack-control-api

# Add environment variables
vercel env add POSTGRES_PRISMA_URL production
vercel env add POSTGRES_URL_NON_POOLING production
vercel env add JWT_SECRET production
```

**Note:** Use the SAME database URLs as studio (they share the same database).

### Phase 3: Deploy Ingest & Control APIs

**Option A: Manual Deploy (Immediate)**
```bash
cd dashboard

# Deploy Ingest API
vercel link --project nivostack-ingest-api
vercel --prod --local-config vercel-ingest.json

# Deploy Control API
vercel link --project nivostack-control-api
vercel --prod --local-config vercel-control.json
```

**Option B: Auto Deploy (After GitHub Connection)**
- Push to GitHub → Vercel automatically deploys all 3 projects
- Each project uses its own config file (`vercel-studio.json`, `vercel-ingest.json`, `vercel-control.json`)

### Phase 4: Verify Deployments

**Test Ingest API:**
```bash
curl -X POST https://ingest.nivostack.com/api/health
# Should return: {"status":"ok",...}
```

**Test Control API:**
```bash
curl https://api.nivostack.com/api/health
# Should return: {"status":"ok",...}
```

**Test SDK Integration:**
```bash
# Test device registration (Ingest API)
curl -X POST https://ingest.nivostack.com/api/devices \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"deviceId": "test-device", "platform": "ios"}'

# Test SDK init (Control API)
curl "https://api.nivostack.com/api/sdk-init?apiKey=YOUR_API_KEY"
```

## 🔄 Development Workflow

### Current Setup (All in One)

```
dashboard/
├── src/app/api/          # All API routes
│   ├── devices/         # Used by studio, ingest, control
│   ├── sessions/        # Used by studio, ingest, control
│   ├── sdk-init/        # Used by control only
│   └── ...
├── vercel-studio.json   # Studio config (all routes)
├── vercel-ingest.json   # Ingest config (POST routes only)
└── vercel-control.json  # Control config (GET/CRUD routes)
```

### How It Works

**Same Codebase, Different Route Filters:**

1. **Studio** (`vercel-studio.json`):
   - Serves ALL routes (UI + all APIs)
   - Used by dashboard frontend

2. **Ingest API** (`vercel-ingest.json`):
   - Only POST routes (devices, traces, logs, crashes, sessions)
   - Used by SDKs for sending data

3. **Control API** (`vercel-control.json`):
   - GET routes + CRUD (sdk-init, business-config, etc.)
   - Used by SDKs for fetching config

### Development Process

**1. Local Development:**
```bash
cd dashboard
pnpm dev
# Runs on localhost:3000
# All routes available (like studio)
```

**2. Testing SDK Integration:**
```bash
# Update SDK to use production URLs
ingestUrl: 'https://ingest.nivostack.com'
controlUrl: 'https://api.nivostack.com'
```

**3. Deploy Changes:**
```bash
# Push to GitHub
git push origin main

# All 3 projects auto-deploy:
# - studio.nivostack.com (all routes)
# - ingest.nivostack.com (POST routes)
# - api.nivostack.com (GET/CRUD routes)
```

## 🎯 SDK Integration Status

### Flutter SDK ✅ Ready

**Current Configuration:**
```dart
const String kDefaultNivoStackIngestUrl = 'https://ingest.nivostack.com';
const String kDefaultNivoStackControlUrl = 'https://api.nivostack.com';
```

**Status:** ✅ Already configured correctly. Will work once APIs are deployed.

### Android SDK ⚠️ Needs Update

**Current:** Uses single `baseUrl`  
**Needed:** Separate `ingestUrl` and `controlUrl`

**Update Required:** See `docs/technical/ANDROID_SDK_ENDPOINT_UPDATE.md`

### iOS SDK ✅ Ready

**Current Configuration:**
```swift
ingestUrl: "https://ingest.nivostack.com"
controlUrl: "https://api.nivostack.com"
```

**Status:** ✅ Already configured correctly.

## 📊 Deployment Checklist

### Immediate Actions

- [ ] Connect `nivostack-ingest-api` to GitHub
- [ ] Connect `nivostack-control-api` to GitHub
- [ ] Configure environment variables for both projects
- [ ] Deploy ingest API (manual or auto)
- [ ] Deploy control API (manual or auto)
- [ ] Test ingest API endpoints
- [ ] Test control API endpoints
- [ ] Test SDK integration end-to-end

### After Deployment

- [ ] Verify DNS propagation (can take up to 48 hours)
- [ ] Monitor Vercel deployments for errors
- [ ] Test SDK integration with real apps
- [ ] Update Android SDK if needed
- [ ] Document any issues or changes

## 🔧 Troubleshooting

### Issue: Ingest API returns 404

**Cause:** Route not matching or project not deployed  
**Fix:** Check `vercel-ingest.json` routes, verify deployment

### Issue: Control API returns 404

**Cause:** Route not matching or project not deployed  
**Fix:** Check `vercel-control.json` routes, verify deployment

### Issue: SDK can't reach APIs

**Cause:** DNS not propagated or APIs not deployed  
**Fix:** Wait for DNS propagation, verify deployments

### Issue: Database errors

**Cause:** Environment variables not set  
**Fix:** Add `POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING` to project settings

## 📝 Summary

**Current Status:**
- ✅ Dashboard (Studio) deployed and working
- ✅ DNS configured for all domains
- ⏳ Ingest API needs deployment
- ⏳ Control API needs deployment

**Next Steps:**
1. Connect ingest & control APIs to GitHub
2. Deploy both APIs
3. Test SDK integration
4. Update Android SDK if needed

**Key Insight:**
- Dashboard calls its own APIs (relative paths)
- SDKs call separate ingest/control APIs (absolute URLs)
- All 3 projects share the same codebase but filter routes differently

---

**Last Updated**: December 31, 2024  
**Next Review**: After ingest/control API deployment

