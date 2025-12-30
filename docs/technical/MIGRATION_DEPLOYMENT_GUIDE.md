# Database Migration Deployment Guide

## Overview

Database migrations run automatically as part of the deployment process. There are multiple ways migrations can be triggered:

1. **During Build** (non-blocking) - Tries to run, but may fail due to IP restrictions
2. **After Deployment** (recommended) - Via webhook or API endpoint
3. **Via Cron** - Scheduled automatic migrations

## Current Setup

### 1. Build-Time Migration (Non-Blocking)

**Location:** `dashboard/scripts/run-migration-vercel-simple.sh`

**How it works:**
- Runs during `pnpm build` command
- Non-blocking: If connection fails, build continues
- Uses 30-second timeout to prevent hanging

**Status:** ✅ Already configured in `package.json`

### 2. Post-Deployment Webhook (Recommended)

**Location:** `dashboard/src/app/api/webhooks/vercel/route.ts`

**How to set up:**

1. **Get your deployment URL:**
   ```
   https://studio.nivostack.com/api/webhooks/vercel
   ```

2. **Configure in Vercel Dashboard:**
   - Go to: Project Settings → Git → Deploy Hooks
   - Click "Add Hook"
   - Name: `Run Migrations`
   - URL: `https://studio.nivostack.com/api/webhooks/vercel`
   - Events: Select "Production Deployment" and/or "Preview Deployment"
   - Save

3. **Set webhook secret (optional but recommended):**
   ```bash
   # In Vercel Dashboard → Environment Variables
   VERCEL_WEBHOOK_SECRET=your-secret-here
   ```

**How it works:**
- Vercel calls the webhook after successful deployment
- Webhook runs `prisma db push` to sync schema
- Returns success/failure status

### 3. Manual API Endpoint

**Location:** `dashboard/src/app/api/migrate/route.ts`

**How to use:**

```bash
# Run migration manually
curl -X POST https://studio.nivostack.com/api/migrate \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

**Or from Vercel Dashboard:**
- Go to: Functions → `/api/migrate`
- Click "Invoke"
- Or use Vercel CLI: `vercel functions invoke migrate`

### 4. Scheduled Cron Job

**Location:** `dashboard/vercel-studio.json`

**How it works:**
- Runs daily at midnight
- Calls `/api/migrate` endpoint
- Ensures schema stays in sync

**Status:** ✅ Already configured

## Migration Flow

```
┌─────────────────┐
│  Git Push       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Vercel Build   │
│  (tries migrate)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Deployment     │
│  (successful)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Webhook        │
│  (runs migrate) │
└─────────────────┘
```

## Troubleshooting

### Migration fails during build

**Problem:** `Can't reach database server`

**Solution:** This is expected! Build servers can't reach Supabase due to IP whitelisting. The migration will run via webhook after deployment.

### Webhook not triggering

**Check:**
1. Webhook URL is correct
2. Webhook is enabled in Vercel Dashboard
3. Events are selected (Production/Preview)
4. Deployment was successful

### Migration API returns 401

**Problem:** Missing or incorrect `CRON_SECRET`

**Solution:**
1. Set `CRON_SECRET` in Vercel Environment Variables
2. Include in request: `Authorization: Bearer YOUR_CRON_SECRET`

### Migration takes too long

**Problem:** Timeout errors

**Solution:**
- Increase timeout in API endpoint (currently 60 seconds)
- Or run migrations manually before deployment

## Best Practices

1. ✅ **Always test migrations locally first**
   ```bash
   bash scripts/migrate-staging.sh
   ```

2. ✅ **Run migrations on staging before production**
   - Test in preview deployment
   - Verify schema changes
   - Then deploy to production

3. ✅ **Monitor migration logs**
   - Check Vercel function logs
   - Check webhook execution logs
   - Verify in Supabase Dashboard

4. ✅ **Use webhook for automatic migrations**
   - Most reliable method
   - Runs after successful deployment
   - Has access to database (no IP restrictions)

## Quick Reference

| Method | When | Reliability | Setup |
|--------|------|-------------|-------|
| **Build-time** | During build | ⚠️ May fail (IP restrictions) | ✅ Already configured |
| **Webhook** | After deployment | ✅ High | ⚙️ Needs Vercel config |
| **API endpoint** | On-demand | ✅ High | ✅ Already configured |
| **Cron job** | Daily at midnight | ✅ High | ✅ Already configured |

## Recommended Setup

**For automatic migrations:**
1. ✅ Keep build-time migration (non-blocking)
2. ✅ Set up Vercel webhook (post-deployment)
3. ✅ Keep cron job as backup

**This ensures migrations run even if one method fails.**

