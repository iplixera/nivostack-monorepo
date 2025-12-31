# Supabase IP Whitelisting Guide

## Problem

When running migrations, you may see:
```
Error: P1001: Can't reach database server at `db.xxx.supabase.co:5432`
```

This means your IP address is not whitelisted in Supabase.

## Solution: Whitelist Your IP

### Step 1: Get Your Current IP Address

```bash
# Check your public IP
curl ifconfig.me
# or
curl ipinfo.io/ip
```

### Step 2: Whitelist IP in Supabase

1. Go to: https://supabase.com/dashboard/project/djyqtlxjpzlncppmazzz/settings/database
2. Scroll to "Connection Pooling" or "Database Settings"
3. Find "Allowed IPs" or "IP Restrictions"
4. Click "Add IP" or "Allow IP"
5. Enter your IP address
6. Save

### Step 3: Wait a Few Minutes

IP whitelisting can take 1-2 minutes to propagate.

### Step 4: Test Connection

```bash
cd /Users/karim-f/Code/nivostack-monorepo-checkout
bash scripts/migrate-production-now.sh
```

## Alternative: Use Supabase SQL Editor

If IP whitelisting doesn't work, you can run migrations via Supabase SQL Editor:

1. Go to: https://supabase.com/dashboard/project/djyqtlxjpzlncppmazzz/sql/new
2. Run Prisma migration SQL manually
3. Or use Supabase's migration tool

## Alternative: Use Connection Pooler

Try using the connection pooler (port 6543) instead of direct connection (port 5432):

```bash
# Use pooled connection (may work without IP whitelisting)
export POSTGRES_PRISMA_URL="postgresql://postgres.djyqtlxjpzlncppmazzz:7ReIOt1GU4ZGsfgo@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
export POSTGRES_URL_NON_POOLING="postgresql://postgres.djyqtlxjpzlncppmazzz:7ReIOt1GU4ZGsfgo@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

pnpm dlx prisma@5.22.0 db push --schema=prisma/schema.prisma --accept-data-loss --skip-generate
```

**Note:** Pooler may not work for migrations (migrations need direct connection), but worth trying.

## Quick Fix Script

Run this to get your IP and instructions:

```bash
echo "Your IP address: $(curl -s ifconfig.me)"
echo ""
echo "1. Go to: https://supabase.com/dashboard/project/djyqtlxjpzlncppmazzz/settings/database"
echo "2. Find 'Allowed IPs' or 'IP Restrictions'"
echo "3. Add your IP: $(curl -s ifconfig.me)"
echo "4. Save and wait 1-2 minutes"
echo "5. Run: bash scripts/migrate-production-now.sh"
```


