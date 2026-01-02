# Run Migration via API - Quick Guide

## Step 1: Get Your CRON_SECRET

### Option A: From Vercel Dashboard
1. Go to: https://vercel.com/plixeras/nivostack-studio/settings/environment-variables
2. Find `CRON_SECRET` variable
3. Click to reveal the value
4. Copy it

### Option B: If CRON_SECRET doesn't exist, create it:

1. Go to: https://vercel.com/plixeras/nivostack-studio/settings/environment-variables
2. Click "Add New"
3. Fill in:
   - **Key:** `CRON_SECRET`
   - **Value:** Generate one: `openssl rand -base64 32`
   - **Environment:** Production (and Preview if needed)
4. Save

## Step 2: Run Migration

### Complete curl Command (Production)

Replace `YOUR_CRON_SECRET_HERE` with your actual secret:

```bash
curl -X POST https://studio.nivostack.com/api/migrate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CRON_SECRET_HERE" \
  -v
```

### Complete curl Command (One Line)

```bash
curl -X POST https://studio.nivostack.com/api/migrate -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_CRON_SECRET_HERE"
```

### Using the Script

```bash
cd /Users/karim-f/Code/nivostack-monorepo-checkout

# Set your CRON_SECRET
export CRON_SECRET="your-secret-here"

# Run migration
bash scripts/run-migration-via-api.sh
```

## Example with Real Values

```bash
# Replace with your actual CRON_SECRET from Vercel
curl -X POST https://studio.nivostack.com/api/migrate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer abc123xyz456..." \
  -v
```

## Response

### Success:
```json
{
  "success": true,
  "message": "Migration completed",
  "output": "Prisma schema loaded...\n✅ Database schema synced",
  "errors": null
}
```

### Error:
```json
{
  "success": false,
  "error": "Error message",
  "output": null,
  "errors": "Error details"
}
```

## Quick Test (No Auth Required)

Check if endpoint is available:
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


