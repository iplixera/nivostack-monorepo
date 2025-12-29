# NivoStack Infrastructure Setup Status

**Last Updated**: $(date)

## ✅ Completed Steps

### Phase 1: Website Structure ✅
- Created `website/` folder with Next.js 16
- SEO optimization (robots.txt, sitemap, metadata)
- Marketing pages (home, features, pricing, about, contact, privacy, terms)
- Vercel configuration (`website/vercel.json`)

### Phase 2: Vercel Projects ✅
All 4 projects created and linked:
- ✅ `nivostack-website` - Brand website
- ✅ `nivostack-studio` - Admin Dashboard/Studio
- ✅ `nivostack-ingest-api` - Ingest API (POST endpoints)
- ✅ `nivostack-control-api` - Control API (GET/CRUD endpoints)

**Project IDs**:
- nivostack-website: (check `.vercel/project.json` in `website/`)
- nivostack-studio: (check `.vercel/project.json` in `dashboard/`)
- nivostack-ingest-api: (check `.vercel/project.json` in `dashboard/`)
- nivostack-control-api: `prj_9e4hARIVhYuouNeTYQPTpfvW05g7`

### Phase 3: Route Filtering Configs ✅
- `dashboard/vercel-studio.json` - Studio routes (all dashboard routes)
- `dashboard/vercel-ingest.json` - Ingest API routes (POST only)
- `dashboard/vercel-control.json` - Control API routes (GET/CRUD)

### Phase 4: Setup Scripts ✅
- `scripts/create-vercel-projects.sh` - Project creation script
- `scripts/setup-env-vars-from-local.sh` - Env var setup from local
- `scripts/configure-production-env.sh` - Production env configuration

## ⏳ Next Steps (Manual/Interactive)

### Step 1: Configure Environment Variables

**Option A: Via Vercel Dashboard (Recommended)**
1. Go to https://vercel.com/nivostack
2. For each project (`nivostack-studio`, `nivostack-ingest-api`, `nivostack-control-api`):
   - Go to Settings → Environment Variables
   - Add the following for **Production**, **Preview**, and **Development**:
     - `POSTGRES_PRISMA_URL` - Production PostgreSQL pooled URL
     - `POSTGRES_URL_NON_POOLING` - Production PostgreSQL direct URL
     - `JWT_SECRET` - JWT signing secret
   - For `nivostack-studio` and `nivostack-control-api`, also add:
     - `STRIPE_SECRET_KEY` - Stripe secret key
     - `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
     - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key (studio only)

**Option B: Via CLI (from project directory)**
```bash
cd dashboard
vercel env add POSTGRES_PRISMA_URL production
# Paste value when prompted
vercel env add POSTGRES_PRISMA_URL preview
vercel env add POSTGRES_PRISMA_URL development
# Repeat for other variables
```

### Step 2: Add Domains to Vercel Projects

**For nivostack-website:**
```bash
cd website
vercel domains add nivostack.com
vercel domains add www.nivostack.com
```

**For nivostack-studio:**
```bash
cd dashboard
# Switch to studio project context
vercel link --project nivostack-studio
vercel domains add studio.nivostack.com
```

**For nivostack-ingest-api:**
```bash
cd dashboard
# Switch to ingest-api project context
vercel link --project nivostack-ingest-api
vercel domains add ingest.nivostack.com
```

**For nivostack-control-api:**
```bash
cd dashboard
# Switch to control-api project context
vercel link --project nivostack-control-api
vercel domains add api.nivostack.com
```

### Step 3: Configure GoDaddy DNS

After adding domains in Vercel, you'll get DNS configuration values. Add these in GoDaddy:

**A Record** (for root domain):
- Type: `A`
- Name: `@`
- Value: `[Vercel IP from nivostack-website]`
- TTL: `3600`

**CNAME Records**:
- Type: `CNAME`
- Name: `www`
- Value: `cname.vercel-dns.com.`
- TTL: `3600`

- Type: `CNAME`
- Name: `studio`
- Value: `cname.vercel-dns.com.`
- TTL: `3600`

- Type: `CNAME`
- Name: `ingest`
- Value: `cname.vercel-dns.com.`
- TTL: `3600`

- Type: `CNAME`
- Name: `api`
- Value: `cname.vercel-dns.com.`
- TTL: `3600`

**Note**: Vercel will provide specific DNS values after adding domains. Use those exact values.

### Step 4: Deploy Projects

**Deploy website:**
```bash
cd website
vercel --prod
```

**Deploy studio:**
```bash
cd dashboard
vercel link --project nivostack-studio
vercel --prod --local-config vercel-studio.json
```

**Deploy ingest-api:**
```bash
cd dashboard
vercel link --project nivostack-ingest-api
vercel --prod --local-config vercel-ingest.json
```

**Deploy control-api:**
```bash
cd dashboard
vercel link --project nivostack-control-api
vercel --prod --local-config vercel-control.json
```

### Step 5: Update SDKs

**Flutter SDK** ✅ Already configured:
- `kDefaultNivoStackIngestUrl = 'https://ingest.nivostack.com'`
- `kDefaultNivoStackControlUrl = 'https://api.nivostack.com'`

**Android SDK** ⚠️ Needs update:
- Currently uses single `baseUrl`
- Needs to support separate `ingestUrl` and `controlUrl`
- See `docs/technical/ANDROID_SDK_ENDPOINT_UPDATE.md`

### Step 6: Test End-to-End

1. **Test Website**: Visit https://nivostack.com
2. **Test Studio**: Visit https://studio.nivostack.com
3. **Test Ingest API**: 
   ```bash
   curl -X POST https://ingest.nivostack.com/api/devices \
     -H "X-API-Key: YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"deviceId": "test", "platform": "ios"}'
   ```
4. **Test Control API**:
   ```bash
   curl https://api.nivostack.com/api/sdk-init?apiKey=YOUR_API_KEY
   ```
5. **Test SDK Integration**: Use Flutter/Android SDKs with new endpoints

## 📋 Project Structure Summary

```
nivostack-monorepo/
├── website/              → nivostack-website (Vercel)
│   ├── src/app/         → Marketing pages
│   └── vercel.json      → Website config
├── dashboard/           → 3 Vercel projects
│   ├── vercel-studio.json    → Studio config
│   ├── vercel-ingest.json    → Ingest API config
│   └── vercel-control.json   → Control API config
└── packages/
    ├── sdk-flutter/     → Flutter SDK (✅ endpoints ready)
    └── sdk-android/     → Android SDK (⚠️ needs update)
```

## 🔗 Useful Links

- Vercel Dashboard: https://vercel.com/nivostack
- Team ID: `team_MBPi3LRUH16KWHeCO2JAQtxs`
- Domain: `nivostack.com`
- Documentation: `docs/technical/INFRASTRUCTURE_SETUP_PLAN.md`

## ⚠️ Important Notes

1. **Environment Variables**: Production database URLs must be configured (not localhost)
2. **DNS Propagation**: DNS changes can take up to 48 hours
3. **Vercel Deployments**: Each project deploys independently
4. **Route Filtering**: Ingest and Control APIs use route filtering to restrict access
5. **SDK Updates**: Android SDK needs endpoint separation update

