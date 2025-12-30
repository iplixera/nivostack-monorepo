# Database Migration Deployment Guide

## Overview

Database migrations run automatically using multiple methods to ensure reliability:

1. **During Build** (non-blocking) - Tries to run, but may fail due to IP restrictions
2. **On First API Request** (automatic) - Runs via middleware when app starts serving
3. **Manual API Endpoint** - On-demand migration trigger
4. **Daily Cron Job** - Backup to keep schema in sync

## How It Works

### 1. Build-Time Migration (Non-Blocking)

**Location:** `dashboard/scripts/run-migration-vercel-simple.sh`

- Runs during `pnpm build`
- Non-blocking: If connection fails, build continues
- May fail due to Vercel build server IP restrictions

**Status:** ✅ Already configured

### 2. Automatic Migration on First Request (Recommended)

**Location:** `dashboard/src/middleware.ts`

**How it works:**
- Runs automatically on the first API request after deployment
- Executes in background (non-blocking)
- Uses deployed server (has database access, no IP restrictions)
- Only runs once per deployment instance

**Status:** ✅ Already configured - **No action needed!**

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

**Status:** ✅ Already configured

### 4. Health Check Endpoint

**Location:** `dashboard/src/app/api/health/route.ts`

**How it works:**
- Runs migration on first call after deployment
- Can be called by monitoring tools
- Non-blocking (runs in background)

**Usage:**
```bash
curl https://studio.nivostack.com/api/health
```

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
│  First API      │
│  Request        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Middleware     │
│  (runs migrate)│
└─────────────────┘
```

## What You Need to Do

### ✅ Nothing! It's Already Set Up

The migration system is **fully automatic**:

1. ✅ **Build-time migration** - Configured in `package.json`
2. ✅ **Automatic on first request** - Configured in `middleware.ts`
3. ✅ **Manual endpoint** - Available at `/api/migrate`
4. ✅ **Health check** - Available at `/api/health`

### Optional: Test Migration

After deployment, you can verify migration ran:

```bash
# Check if migration ran (should show "checked")
curl https://studio.nivostack.com/api/health

# Or run manually
curl -X POST https://studio.nivostack.com/api/migrate \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## How It Works Technically

### Middleware Approach

The `middleware.ts` file:
- Intercepts all API requests
- On first request after deployment, triggers migration in background
- Uses `exec()` to run `prisma db push`
- Non-blocking (doesn't slow down requests)
- Only runs once per server instance

### Why This Works

1. **No IP Restrictions** - Runs from deployed server, not build server
2. **Automatic** - No manual configuration needed
3. **Reliable** - Runs on first request, ensures migrations happen
4. **Non-Blocking** - Doesn't slow down API responses

## Troubleshooting

### Migration not running

**Check:**
1. Verify `POSTGRES_URL_NON_POOLING` is set in Vercel
2. Check server logs for migration output
3. Call `/api/health` to trigger migration manually

### Migration takes too long

**Solution:**
- Migration runs in background, doesn't block requests
- Check logs for any errors
- Can run manually via `/api/migrate` endpoint

### Need to run migration immediately

**Solution:**
```bash
curl -X POST https://studio.nivostack.com/api/migrate \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Summary

**✅ Fully Automatic - No Configuration Needed!**

- Migrations run automatically on first API request after deployment
- No Vercel webhook configuration needed
- No manual steps required
- Just deploy and migrations will run automatically
