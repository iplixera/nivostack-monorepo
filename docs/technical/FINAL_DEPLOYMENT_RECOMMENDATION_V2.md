# Final Deployment Recommendation v2 - 4 Projects

## Architecture Overview

**4 Separate Vercel Projects** (on one Pro plan - $20/month)

```
Vercel Pro Plan: $20/month
├── Project 1: nivostack-website (Branding/Marketing)
│   └── Domain: nivostack.com, www.nivostack.com
├── Project 2: nivostack-studio (Admin Dashboard)
│   └── Domain: studio.nivostack.com
├── Project 3: nivostack-ingest-api (Data Ingestion)
│   └── Domain: ingest.nivostack.com
└── Project 4: nivostack-control-api (Configuration & CRUD)
    └── Domain: api.nivostack.com
```

## Project Breakdown

### 1. Branding Website (`nivostack-website`)

**Purpose:** Marketing website, landing pages, documentation  
**Domain:** `nivostack.com`, `www.nivostack.com`  
**Tech:** Next.js (static pages)  
**Cost:** Free tier (static hosting) or Pro plan (if needs features)

**Content:**
- Landing page
- Features pages
- Pricing page
- Documentation (or link to docs.nivostack.com)
- Blog (optional)
- About/Contact pages

**Routes:**
- `/` (home)
- `/features`
- `/pricing`
- `/docs` (or redirect to docs.nivostack.com)
- `/about`
- `/contact`

**Authentication:** None (public site)

**Root Directory:** `website/` (new directory to create)

---

### 2. Admin Dashboard (`nivostack-studio`)

**Purpose:** NivoStack Studio - Admin console for managing projects  
**Domain:** `studio.nivostack.com`  
**Tech:** Next.js (App Router)  
**Cost:** Pro plan (shared quota)

**Content:**
- Dashboard UI
- Project management
- Device management
- Analytics & monitoring
- Settings & configuration

**Routes:**
- All UI pages (`/dashboard/*`, `/projects/*`, `/devices/*`, etc.)
- Dashboard API routes:
  - `/api/auth/*` (JWT auth)
  - `/api/projects` (JWT auth)
  - `/api/admin/*` (JWT auth)
  - `/api/subscription/*` (JWT auth)

**Authentication:** JWT tokens (`Authorization: Bearer <token>`)

**Root Directory:** `dashboard/`

---

### 3. Ingest API (`nivostack-ingest-api`)

**Purpose:** High-volume data ingestion endpoints  
**Domain:** `ingest.nivostack.com`  
**Tech:** Next.js API Routes  
**Cost:** Pro plan (shared quota)

**Routes:**
- `/api/devices` (POST) - Device registration
- `/api/traces` (POST) - API traces
- `/api/logs` (POST) - Logs
- `/api/crashes` (POST) - Crash reports
- `/api/sessions` (POST/PUT/PATCH) - Session management
- `/api/devices/[id]/user` (PATCH/DELETE) - User association

**Authentication:** API Key (`X-API-Key` header)

**Root Directory:** `dashboard/` (shared codebase)

---

### 4. Control API (`nivostack-control-api`)

**Purpose:** Configuration and CRUD operations  
**Domain:** `api.nivostack.com`  
**Tech:** Next.js API Routes  
**Cost:** Pro plan (shared quota)

**Routes:**
- `/api/sdk-init` (GET) - SDK initialization
- `/api/business-config` (GET) - Business configuration
- `/api/localization/*` (GET) - Localization
- `/api/feature-flags` (GET) - Feature flags
- `/api/sdk-settings` (GET) - SDK settings
- `/api/projects` (GET) - List projects (API key)
- `/api/devices` (GET) - List devices (API key)
- `/api/sessions` (GET) - List sessions (API key)
- `/api/traces` (GET) - List traces (API key)
- `/api/logs` (GET) - List logs (API key)
- `/api/crashes` (GET) - List crashes (API key)

**Authentication:** API Key (`X-API-Key` header)

**Root Directory:** `dashboard/` (shared codebase)

## Project Names Summary

| Project | Vercel Project Name | Domain | Purpose |
|---------|-------------------|--------|---------|
| Branding Website | `nivostack-website` | `nivostack.com` | Marketing site |
| Admin Dashboard | `nivostack-studio` | `studio.nivostack.com` | Admin console |
| Ingest API | `nivostack-ingest-api` | `ingest.nivostack.com` | Data ingestion |
| Control API | `nivostack-control-api` | `api.nivostack.com` | Config & CRUD |

## Cost Breakdown

### Single Pro Plan ($20/month)
```
All 4 projects share:
- 1 TB bandwidth (total)
- 1,000 GB-hours function execution (total)
- 24,000 build minutes (total)
```

**Note:** Branding website can use Hobby (free) plan if it's just static pages.

## Directory Structure

```
monorepo/
├── website/              # Branding website (NEW)
│   ├── src/
│   │   └── app/
│   │       ├── page.tsx          # Landing page
│   │       ├── features/
│   │       ├── pricing/
│   │       └── docs/
│   ├── package.json
│   └── vercel.json
│
├── dashboard/           # Shared codebase
│   ├── src/
│   │   └── app/
│   │       ├── api/              # All API routes
│   │       └── (dashboard)/       # Dashboard UI
│   ├── vercel-studio.json        # Dashboard config
│   ├── vercel-ingest.json        # Ingest API config
│   ├── vercel-control.json       # Control API config
│   └── package.json
│
└── packages/
    ├── sdk-flutter/
    └── sdk-android/
```

## Vercel Configuration Files

### 1. Branding Website (`website/vercel.json`)

```json
{
  "buildCommand": "npm run build",
  "framework": "nextjs",
  "outputDirectory": ".next"
}
```

### 2. Dashboard (`dashboard/vercel-studio.json`)

```json
{
  "buildCommand": "pnpm install && pnpm build",
  "framework": "nextjs"
}
```

### 3. Ingest API (`dashboard/vercel-ingest.json`)

```json
{
  "buildCommand": "pnpm install && pnpm build",
  "framework": "nextjs",
  "routes": [
    {
      "src": "/api/devices",
      "dest": "/api/devices",
      "methods": ["POST"]
    },
    {
      "src": "/api/traces",
      "dest": "/api/traces",
      "methods": ["POST"]
    },
    {
      "src": "/api/logs",
      "dest": "/api/logs",
      "methods": ["POST"]
    },
    {
      "src": "/api/crashes",
      "dest": "/api/crashes",
      "methods": ["POST"]
    },
    {
      "src": "/api/sessions",
      "dest": "/api/sessions",
      "methods": ["POST", "PUT", "PATCH"]
    },
    {
      "src": "/api/devices/(.*)/user",
      "dest": "/api/devices/$1/user",
      "methods": ["PATCH", "DELETE"]
    },
    {
      "src": "/(.*)",
      "dest": "/api/health"
    }
  ]
}
```

### 4. Control API (`dashboard/vercel-control.json`)

```json
{
  "buildCommand": "pnpm install && pnpm build",
  "framework": "nextjs",
  "routes": [
    {
      "src": "/api/sdk-init",
      "dest": "/api/sdk-init"
    },
    {
      "src": "/api/business-config",
      "dest": "/api/business-config"
    },
    {
      "src": "/api/localization/(.*)",
      "dest": "/api/localization/$1"
    },
    {
      "src": "/api/feature-flags",
      "dest": "/api/feature-flags"
    },
    {
      "src": "/api/sdk-settings",
      "dest": "/api/sdk-settings"
    },
    {
      "src": "/api/projects",
      "dest": "/api/projects"
    },
    {
      "src": "/api/devices",
      "dest": "/api/devices"
    },
    {
      "src": "/api/sessions",
      "dest": "/api/sessions"
    },
    {
      "src": "/api/traces",
      "dest": "/api/traces"
    },
    {
      "src": "/api/logs",
      "dest": "/api/logs"
    },
    {
      "src": "/api/crashes",
      "dest": "/api/crashes"
    },
    {
      "src": "/(.*)",
      "dest": "/api/health"
    }
  ]
}
```

## DNS Configuration

### GoDaddy DNS Records

```
Type    Name    Value                          TTL
A       @       [Vercel IP]                    3600
CNAME   www     cname.vercel-dns.com.          3600
CNAME   studio  cname.vercel-dns.com.          3600
CNAME   ingest  cname.vercel-dns.com.          3600
CNAME   api     cname.vercel-dns.com.          3600
```

### Vercel Domain Configuration

```bash
# Branding website
vercel domains add nivostack.com --project nivostack-website
vercel domains add www.nivostack.com --project nivostack-website

# Dashboard
vercel domains add studio.nivostack.com --project nivostack-studio

# Ingest API
vercel domains add ingest.nivostack.com --project nivostack-ingest-api

# Control API
vercel domains add api.nivostack.com --project nivostack-control-api
```

## Environment Variables

### Branding Website (`nivostack-website`)
```bash
# Usually none needed for static site
# Or minimal: Analytics IDs, etc.
```

### Dashboard (`nivostack-studio`)
```bash
POSTGRES_PRISMA_URL=postgresql://...
POSTGRES_URL_NON_POOLING=postgresql://...
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
```

### Ingest API (`nivostack-ingest-api`)
```bash
POSTGRES_PRISMA_URL=postgresql://...
POSTGRES_URL_NON_POOLING=postgresql://...
JWT_SECRET=your-secret-key
```

### Control API (`nivostack-control-api`)
```bash
POSTGRES_PRISMA_URL=postgresql://...
POSTGRES_URL_NON_POOLING=postgresql://...
JWT_SECRET=your-secret-key
```

## Deployment Commands

### Create Projects
```bash
# Branding website
cd website
vercel link --project nivostack-website

# Dashboard
cd dashboard
vercel link --project nivostack-studio

# Ingest API (same dashboard folder)
cd dashboard
vercel link --project nivostack-ingest-api --scope your-team

# Control API (same dashboard folder)
cd dashboard
vercel link --project nivostack-control-api --scope your-team
```

### Deploy
```bash
# Branding website
cd website
vercel --prod

# Dashboard
cd dashboard
vercel --prod --local-config vercel-studio.json

# Ingest API
cd dashboard
vercel --prod --local-config vercel-ingest.json

# Control API
cd dashboard
vercel --prod --local-config vercel-control.json
```

## Benefits of 4 Projects

1. **Clear Separation** ✅
   - Marketing site separate from app
   - Better organization
   - Independent updates

2. **Cost Optimization** ✅
   - Website can use free Hobby plan
   - APIs share Pro plan quotas
   - Better cost visibility

3. **Performance** ✅
   - Each service optimized independently
   - No resource contention
   - Better caching strategies

4. **Team Scalability** ✅
   - Marketing team owns website
   - Engineering team owns APIs
   - Clear ownership

5. **Professional Architecture** ✅
   - Industry-standard separation
   - Better for growth
   - Easier to scale

## Summary

✅ **4 Projects:**
1. `nivostack-website` → Marketing site
2. `nivostack-studio` → Admin dashboard
3. `nivostack-ingest-api` → Data ingestion
4. `nivostack-control-api` → Configuration & CRUD

✅ **Cost:** $20/month (Pro plan) + Free (website on Hobby)

✅ **Benefits:** Better organization, performance, scalability

This architecture makes perfect sense and follows industry best practices!

