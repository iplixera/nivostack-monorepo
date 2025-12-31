# Migration via API - Complete Guide

## Overview

Run database migrations by calling the `/api/migrate` endpoint. This runs on the deployed Vercel server, so no IP whitelisting is needed.

## Quick Start

### Step 1: Get Your CRON_SECRET

1. Go to: https://vercel.com/plixeras/nivostack-studio/settings/environment-variables
2. Find the `CRON_SECRET` variable
3. Copy its value

**If CRON_SECRET doesn't exist:**
1. Click "Add New"
2. Key: `CRON_SECRET`
3. Value: Generate a secret (see below)
4. Environment: Production (and Preview if needed)
5. Save

**Generate a secret:**
```bash
openssl rand -base64 32
```

### Step 2: Run Migration

**Option A: Using the script**
```bash
cd /Users/karim-f/Code/nivostack-monorepo-checkout

# Set CRON_SECRET
export CRON_SECRET="your-secret-here"

# Run migration
bash scripts/run-migration-via-api.sh
```

**Option B: Direct curl command**
```bash
curl -X POST https://studio.nivostack.com/api/migrate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CRON_SECRET_HERE"
```

## Complete curl Commands

### Production (studio.nivostack.com)
```bash
curl -X POST https://studio.nivostack.com/api/migrate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CRON_SECRET_HERE" \
  -v
```

### Preview/Staging (if different URL)
```bash
curl -X POST https://nivostack-studio-git-develop-plixeras.vercel.app/api/migrate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CRON_SECRET_HERE" \
  -v
```

## Response Examples

### Success Response
```json
{
  "success": true,
  "message": "Migration completed",
  "output": "Prisma schema loaded...\n✅ Database schema synced",
  "errors": null
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message here",
  "output": null,
  "errors": "Error details"
}
```

### Unauthorized (Wrong Secret)
```json
{
  "error": "Unauthorized"
}
```

## Setting Up CRON_SECRET in Vercel

### Via Vercel Dashboard

1. Go to: https://vercel.com/plixeras/nivostack-studio/settings/environment-variables
2. Click "Add New"
3. Fill in:
   - **Key:** `CRON_SECRET`
   - **Value:** (generate with `openssl rand -base64 32`)
   - **Environment:** Production (and Preview)
4. Save

### Via Vercel CLI

```bash
cd dashboard
vercel env add CRON_SECRET production
# Paste secret when prompted
```

## Testing the Endpoint

### Check if endpoint exists (no auth needed)
```bash
curl https://studio.nivostack.com/api/migrate
```

Should return:
```json
{
  "message": "Migration endpoint - POST to run migrations",
  "database": "configured"
}
```

### Test with authentication
```bash
curl -X POST https://studio.nivostack.com/api/migrate \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -v
```

## Troubleshooting

### "Unauthorized" Error
- Check `CRON_SECRET` is set in Vercel
- Verify you're using the correct secret value
- Make sure secret is set for the correct environment (Production/Preview)

### "Database URL not configured"
- Check `POSTGRES_URL_NON_POOLING` is set in Vercel
- Verify it's set for the correct environment

### Migration fails
- Check Vercel function logs
- Look at the error message in the response
- Verify database connection string is correct

## Automation

### Add to CI/CD Pipeline

```yaml
# Example GitHub Actions
- name: Run Migration
  run: |
    curl -X POST https://studio.nivostack.com/api/migrate \
      -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

### Add to Deployment Script

```bash
# After deployment
curl -X POST https://studio.nivostack.com/api/migrate \
  -H "Authorization: Bearer ${CRON_SECRET}"
```

## Security Notes

- ✅ `CRON_SECRET` should be a strong random string
- ✅ Never commit `CRON_SECRET` to Git
- ✅ Use different secrets for Production and Preview
- ✅ Rotate secrets periodically


