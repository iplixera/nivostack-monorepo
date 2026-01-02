# 🚀 NivoStack Complete Infrastructure Setup Guide

**Team**: NivoStack (team_MBPi3LRUH16KWHeCO2JAQtxs)  
**Domain**: nivostack.com  
**Date**: December 30, 2024

---

## ✅ What's Already Done

1. ✅ **Website Structure** - Created with SEO optimization
2. ✅ **Route Filtering Configs** - Created for all 4 projects
3. ✅ **Setup Scripts** - Automated setup scripts ready
4. ✅ **SDK Endpoints** - Flutter SDK already configured correctly

---

## 📋 Step-by-Step Setup

### Step 1: Login to Vercel

```bash
vercel login
```

Follow the prompts to authenticate.

**Verify**:
```bash
vercel whoami
```

Should show your email address.

---

### Step 2: Create Vercel Projects

Run the automated script:

```bash
cd /Users/karim-f/Code/nivostack-monorepo-checkout
./scripts/setup-complete-infrastructure.sh
```

**Or manually**:

```bash
# 1. Website Project
cd website
vercel link --yes --scope team_MBPi3LRUH16KWHeCO2JAQtxs --project nivostack-website

# 2. Studio Project
cd ../dashboard
vercel link --yes --scope team_MBPi3LRUH16KWHeCO2JAQtxs --project nivostack-studio --local-config vercel-studio.json

# 3. Ingest API Project
vercel link --yes --scope team_MBPi3LRUH16KWHeCO2JAQtxs --project nivostack-ingest-api --local-config vercel-ingest.json

# 4. Control API Project
vercel link --yes --scope team_MBPi3LRUH16KWHeCO2JAQtxs --project nivostack-control-api --local-config vercel-control.json
```

---

### Step 3: Configure Environment Variables

**Option A: Interactive Script** (Recommended)

```bash
./scripts/setup-env-vars.sh
```

**Option B: Vercel Dashboard**

1. Go to https://vercel.com/team/nivostack
2. Select each project
3. Go to Settings → Environment Variables
4. Add variables (see list below)

**Option C: Vercel CLI** (for each variable)

```bash
# Shared variables (set for studio, ingest-api, control-api)
vercel env add POSTGRES_PRISMA_URL production nivostack-studio --scope team_MBPi3LRUH16KWHeCO2JAQtxs
# Enter value when prompted

vercel env add POSTGRES_URL_NON_POOLING production nivostack-studio --scope team_MBPi3LRUH16KWHeCO2JAQtxs
# Enter value when prompted

vercel env add JWT_SECRET production nivostack-studio --scope team_MBPi3LRUH16KWHeCO2JAQtxs
# Enter value when prompted

# Repeat for ingest-api and control-api projects
```

#### Environment Variables List

**Shared (all 3 projects: studio, ingest-api, control-api)**:
- `POSTGRES_PRISMA_URL` - Database connection (pooled)
- `POSTGRES_URL_NON_POOLING` - Database connection (direct)
- `JWT_SECRET` - JWT signing secret

**Studio Only**:
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key

**Control API Only**:
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret

**Website**: No environment variables needed

---

### Step 4: Add Domains

**Via Vercel Dashboard** (Recommended):

1. Go to each project → Settings → Domains
2. Add domains:
   - **nivostack-website**: `nivostack.com`, `www.nivostack.com`
   - **nivostack-studio**: `studio.nivostack.com`
   - **nivostack-ingest-api**: `ingest.nivostack.com`
   - **nivostack-control-api**: `api.nivostack.com`

**Via CLI**:

```bash
vercel domains add nivostack.com --project nivostack-website --scope team_MBPi3LRUH16KWHeCO2JAQtxs
vercel domains add www.nivostack.com --project nivostack-website --scope team_MBPi3LRUH16KWHeCO2JAQtxs
vercel domains add studio.nivostack.com --project nivostack-studio --scope team_MBPi3LRUH16KWHeCO2JAQtxs
vercel domains add ingest.nivostack.com --project nivostack-ingest-api --scope team_MBPi3LRUH16KWHeCO2JAQtxs
vercel domains add api.nivostack.com --project nivostack-control-api --scope team_MBPi3LRUH16KWHeCO2JAQtxs
```

**After adding domains**, Vercel will show DNS configuration values. **Copy these values** - you'll need them for GoDaddy.

---

### Step 5: Configure GoDaddy DNS

1. **Login to GoDaddy**: https://www.godaddy.com
2. **Go to**: My Products → DNS Management → nivostack.com
3. **Add DNS Records** (use values from Vercel):

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | [Vercel IP] | 3600 |
| CNAME | www | [Vercel CNAME] | 3600 |
| CNAME | studio | [Vercel CNAME] | 3600 |
| CNAME | ingest | [Vercel CNAME] | 3600 |
| CNAME | api | [Vercel CNAME] | 3600 |

**Important**: 
- Replace `[Vercel IP]` and `[Vercel CNAME]` with actual values from Vercel Dashboard
- DNS propagation takes 24-48 hours
- You can verify with: `dig nivostack.com` or `nslookup nivostack.com`

---

### Step 6: Test Deployments

**Preview Deployments**:

```bash
# Website
cd website
vercel --preview

# Studio
cd ../dashboard
vercel --preview --local-config vercel-studio.json

# Ingest API
vercel --preview --local-config vercel-ingest.json

# Control API
vercel --preview --local-config vercel-control.json
```

**Production Deployments** (after DNS is configured):

```bash
# Website
cd website
vercel --prod

# Studio
cd ../dashboard
vercel --prod --local-config vercel-studio.json

# Ingest API
vercel --prod --local-config vercel-ingest.json

# Control API
vercel --prod --local-config vercel-control.json
```

---

### Step 7: Verify SDK Endpoints

**Flutter SDK** ✅ Already configured:
- Ingest: `https://ingest.nivostack.com`
- Control: `https://api.nivostack.com`

**Android SDK** - Currently uses single `baseUrl`. For now, use `https://ingest.nivostack.com` for all operations. Future enhancement: separate ingest/control URLs.

**Test SDKs**:
1. Update test app with API keys
2. Test device registration → `ingest.nivostack.com/api/devices`
3. Test SDK init → `api.nivostack.com/api/sdk-init`
4. Verify data appears in dashboard → `studio.nivostack.com`

---

## 🎯 Project Structure Summary

```
nivostack-monorepo-checkout/
├── website/                    → nivostack-website (nivostack.com)
│   └── vercel.json
├── dashboard/                 → 3 projects share this folder
│   ├── vercel-studio.json     → nivostack-studio (studio.nivostack.com)
│   ├── vercel-ingest.json     → nivostack-ingest-api (ingest.nivostack.com)
│   └── vercel-control.json    → nivostack-control-api (api.nivostack.com)
└── packages/
    ├── sdk-flutter/           → Uses ingest + control APIs
    └── sdk-android/           → Uses ingest API (for now)
```

---

## 🔍 Verification Checklist

After setup, verify:

- [ ] All 4 projects created in Vercel
- [ ] Environment variables set for all projects
- [ ] Domains added to each project
- [ ] DNS records configured in GoDaddy
- [ ] DNS propagation complete (24-48 hours)
- [ ] Website accessible: https://nivostack.com
- [ ] Studio accessible: https://studio.nivostack.com
- [ ] Ingest API responding: https://ingest.nivostack.com/api/health
- [ ] Control API responding: https://api.nivostack.com/api/health
- [ ] SDKs can connect to APIs
- [ ] Data flows from SDKs → Ingest API → Dashboard

---

## 🆘 Troubleshooting

### Vercel Authentication Issues
```bash
vercel logout
vercel login
```

### Project Linking Issues
```bash
# Remove existing link
rm -rf .vercel

# Link again
vercel link --scope team_MBPi3LRUH16KWHeCO2JAQtxs --project [project-name]
```

### DNS Not Resolving
- Wait 24-48 hours for propagation
- Check DNS with: `dig nivostack.com`
- Verify records in GoDaddy match Vercel values

### Build Failures
- Check environment variables are set
- Verify Prisma schema path: `../prisma/schema.prisma`
- Check build logs in Vercel Dashboard

---

## 📚 Related Documentation

- Full Plan: `docs/technical/INFRASTRUCTURE_SETUP_PLAN.md`
- Progress: `docs/technical/SETUP_PROGRESS.md`
- This Guide: `SETUP_GUIDE.md`

---

**Ready to proceed?** Start with Step 1: `vercel login`

