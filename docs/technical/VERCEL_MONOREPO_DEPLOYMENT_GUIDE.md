# Vercel Monorepo Deployment Guide - Complete

**Last Updated**: December 31, 2024  
**Status**: ✅ Working - Website & Studio deployed with filtering

## Overview

This guide covers deploying multiple Vercel projects from a single monorepo, with proper build filtering to prevent unnecessary deployments.

## Architecture

```
GitHub Repository (nivostack-monorepo-checkout)
├── website/          → nivostack-website (nivostack.com)
├── dashboard/        → nivostack-studio (studio.nivostack.com)
│                     → nivostack-ingest-api (ingest.nivostack.com)
│                     → nivostack-control-api (api.nivostack.com)
└── packages/         → SDK packages (not deployed)
```

## Current Status

| Project | Domain | GitHub Connected | Status | Filter |
|---------|--------|------------------|--------|--------|
| Website | nivostack.com | ✅ Yes | ✅ Deployed | `website/` changes only |
| Studio | studio.nivostack.com | ✅ Yes | ✅ Deployed | `dashboard/` changes only |
| Ingest API | ingest.nivostack.com | ⏳ Pending | ⏳ Not Deployed | `dashboard/` changes only |
| Control API | api.nivostack.com | ⏳ Pending | ⏳ Not Deployed | `dashboard/` changes only |

## Key Concepts

### 1. Ignored Build Step

**Purpose:** Prevent unnecessary builds when files haven't changed.

**Vercel Logic:**
- `exit 0` = Skip build (cancel deployment)
- `exit 1` = Build (proceed with deployment)

**Correct Command Format:**
```bash
git diff --name-only HEAD^ HEAD | grep -q "^folder/" && exit 1 || exit 0
```

**How it works:**
- Lists changed files between commits
- Checks if any start with `folder/`
- If found → `exit 1` (build)
- If not found → `exit 0` (skip)

### 2. Shared Codebase

**Dashboard, Ingest API, and Control API** all use the same `dashboard/` folder but:
- **Studio**: Serves all routes (UI + APIs)
- **Ingest API**: Only POST routes (via `vercel-ingest.json`)
- **Control API**: Only GET/CRUD routes (via `vercel-control.json`)

**Important:** All three will deploy when `dashboard/` changes. This is expected.

### 3. Vercel Configuration Files

Each project uses a different config file:

- `website/vercel.json` → Website project
- `dashboard/vercel-studio.json` → Studio project
- `dashboard/vercel-ingest.json` → Ingest API project
- `dashboard/vercel-control.json` → Control API project

## Setup Steps

### Step 1: Connect Project to GitHub

**Via Vercel Dashboard (Recommended):**

1. Go to: https://vercel.com/nivostack/[project-name]/settings/git
2. Click **"Connect Git Repository"**
3. Select your GitHub repository
4. Configure:
   - **Production Branch**: `main`
   - **Root Directory**: `website` (for website) or `dashboard` (for others)
   - **Build Command**: `pnpm install && pnpm build`
   - **Output Directory**: `.next`
   - **Install Command**: `pnpm install`
   - **Framework Preset**: `Next.js`
5. Click **"Save"**

**Via CLI:**
```bash
cd [project-folder]
vercel link --project [project-name]
vercel git connect
```

### Step 2: Configure Ignored Build Step

**For Website:**
1. Go to: Settings → General → Ignored Build Step
2. Select: **"Run my Bash script"**
3. Command:
   ```bash
   git diff --name-only HEAD^ HEAD | grep -q "^website/" && exit 1 || exit 0
   ```
4. Click **"Save"**

**For Studio/Ingest/Control:**
1. Go to: Settings → General → Ignored Build Step
2. Select: **"Run my Bash script"**
3. Command:
   ```bash
   git diff --name-only HEAD^ HEAD | grep -q "^dashboard/" && exit 1 || exit 0
   ```
4. Click **"Save"**

**Important:** Do NOT put `ignoreCommand` in `vercel.json` files. Use Dashboard settings only.

### Step 3: Configure Environment Variables

**Required for all projects:**
- `POSTGRES_PRISMA_URL` - Database connection (pooled)
- `POSTGRES_URL_NON_POOLING` - Database connection (direct)
- `JWT_SECRET` - JWT signing secret

**Additional for Studio & Control API:**
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key (Studio only)

**Set via Dashboard:**
1. Go to: Settings → Environment Variables
2. Add each variable for **Production**, **Preview**, and **Development**
3. Click **"Save"**

### Step 4: Add Domains

**Via Dashboard:**
1. Go to: Settings → Domains
2. Click **"Add Domain"**
3. Enter domain (e.g., `ingest.nivostack.com`)
4. Follow DNS configuration instructions

**Via CLI:**
```bash
vercel domains add ingest.nivostack.com
vercel domains add api.nivostack.com
```

### Step 5: Configure DNS

After adding domains in Vercel, configure DNS records:

**CNAME Records:**
- `ingest` → `cname.vercel-dns.com.`
- `api` → `cname.vercel-dns.com.`

**Note:** Vercel will provide exact values after adding domains.

## Deployment Workflow

### Automatic Deployment

After connecting to GitHub:
1. **Push to `main`** → Triggers production deployment
2. **Push to other branches** → Creates preview deployment
3. **Only projects with changes** deploy (thanks to Ignored Build Step)

### Manual Deployment

**Via Dashboard:**
1. Go to project → Deployments tab
2. Click **"Deploy"** button
3. Select branch and click **"Deploy"**

**Via CLI:**
```bash
cd [project-folder]
vercel link --project [project-name]
vercel --prod
```

## Troubleshooting

### Issue: Build Canceled

**Cause:** Ignored Build Step returning `exit 0`  
**Fix:** Check command logic - should return `exit 1` when changes detected

### Issue: All Projects Deploy

**Cause:** Ignored Build Step not configured  
**Fix:** Set Ignored Build Step in Dashboard settings

### Issue: Wrong Project Deploys

**Cause:** Root Directory misconfigured  
**Fix:** Verify Root Directory in Settings → General

### Issue: Build Fails

**Cause:** Missing environment variables or build errors  
**Fix:** Check build logs, verify environment variables

## Best Practices

1. **Use Dashboard for Ignored Build Step**
   - More reliable than `vercel.json`
   - Easier to update without code commits

2. **Keep vercel.json Simple**
   - Only include build commands and routes
   - Don't use `ignoreCommand` in JSON

3. **Test Filtering**
   - Make isolated changes to test filtering
   - Verify only expected projects deploy

4. **Monitor Build Minutes**
   - Filtering saves build minutes
   - Check usage in Vercel Dashboard

5. **Document Changes**
   - Update this guide when making changes
   - Keep team informed of deployment process

## Next Steps After Connecting Ingest & Control APIs

See: `docs/technical/NEXT_STEPS_AFTER_API_CONNECTION.md`

---

**Last Updated**: December 31, 2024  
**Maintained By**: NivoStack Team

