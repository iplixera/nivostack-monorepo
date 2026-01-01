# Localhost Development Setup Guide

## Quick Setup

Run the setup script to configure localhost:

```bash
bash scripts/setup-localhost.sh
```

This will:
- ✅ Create/update `.env.local` with required variables
- ✅ Generate Prisma client
- ✅ Test database connection

## Manual Setup

### 1. Environment Variables

Create `.env.local` in the project root:

```env
# Database Configuration (Staging for local development)
POSTGRES_PRISMA_URL=postgresql://postgres:YOUR_PASSWORD@db.ngsgfvrntmjakzednles.supabase.co:5432/postgres?sslmode=require
POSTGRES_URL_NON_POOLING=postgresql://postgres:YOUR_PASSWORD@db.ngsgfvrntmjakzednles.supabase.co:5432/postgres?sslmode=require

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=your-generated-secret-here-minimum-32-chars

# Optional: App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Generate Prisma Client

```bash
cd dashboard
bash scripts/run-prisma-safe.sh generate
```

### 3. Start Dev Server

```bash
cd dashboard
pnpm dev
```

Open: http://localhost:3000

---

## Troubleshooting

### Database Connection Failed (P1001)

**Error**: `Can't reach database server at db.ngsgfvrntmjakzednles.supabase.co:5432`

**Possible Causes**:
1. **IP Restrictions**: Supabase database has IP whitelist enabled
2. **Wrong Password**: Database password is incorrect
3. **Network Issues**: Firewall or network blocking connection

**Solutions**:

#### Option 1: Whitelist Your IP in Supabase

1. Go to Supabase Dashboard → Your Project → Settings → Database
2. Find "Connection Pooling" or "Network Restrictions"
3. Add your current IP address to the whitelist
4. Get your IP: `curl ifconfig.me`

#### Option 2: Use Connection Pooler (Recommended)

If IP restrictions are enabled, use the connection pooler instead:

```env
# Use pooler connection (port 6543 instead of 5432)
POSTGRES_PRISMA_URL=postgresql://postgres.ref:YOUR_PASSWORD@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
POSTGRES_URL_NON_POOLING=postgresql://postgres:YOUR_PASSWORD@db.ngsgfvrntmjakzednles.supabase.co:5432/postgres?sslmode=require
```

**Note**: Pooler is for queries, direct connection is still needed for migrations.

#### Option 3: Disable IP Restrictions (Development Only)

1. Go to Supabase Dashboard → Settings → Database
2. Temporarily disable IP restrictions (for development)
3. **⚠️ Re-enable after development!**

#### Option 4: Use VPN or Tunnel

If you're behind a corporate firewall:
- Use VPN to connect
- Or use a tunnel service (ngrok, Cloudflare Tunnel)

### Prisma Client Not Generated

**Error**: `Cannot find module '@prisma/client'`

**Solution**:
```bash
cd dashboard
bash scripts/run-prisma-safe.sh generate
```

### Port 3000 Already in Use

**Error**: `Port 3000 is already in use`

**Solution**:
```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
kill $(lsof -ti:3000)

# Or use a different port
PORT=3001 pnpm dev
```

### Environment Variables Not Loading

**Issue**: Variables in `.env.local` not being read

**Check**:
1. File is named exactly `.env.local` (not `.env.local.txt`)
2. File is in project root (not in `dashboard/`)
3. Restart dev server after changing `.env.local`

---

## Verification Checklist

- [ ] `.env.local` exists in project root
- [ ] `POSTGRES_PRISMA_URL` is set
- [ ] `POSTGRES_URL_NON_POOLING` is set
- [ ] `JWT_SECRET` is set (32+ characters)
- [ ] Prisma client generated (`node_modules/.prisma/client/index.js`)
- [ ] Database connection works (check `/api/health`)
- [ ] Dev server starts without errors
- [ ] Can access http://localhost:3000

---

## Testing Database Connection

### Quick Test

```bash
cd dashboard
pnpm db:health
```

### Manual Test

```bash
# Test connection
psql "postgresql://postgres:YOUR_PASSWORD@db.ngsgfvrntmjakzednles.supabase.co:5432/postgres?sslmode=require" -c "SELECT 1;"
```

### Via API

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2026-01-01T12:00:00.000Z"
}
```

---

## Common Issues

### Issue: Dev Server Starts But API Returns 500

**Cause**: Database connection failed

**Check**:
1. Database credentials are correct
2. IP is whitelisted in Supabase
3. Network/firewall allows connection

### Issue: Prisma Schema Out of Sync

**Error**: `The database schema is not in sync with the Prisma schema`

**Solution**:
```bash
cd dashboard
bash scripts/run-prisma-safe.sh push
```

### Issue: TypeScript Errors

**Error**: Type errors in IDE

**Solution**:
```bash
cd dashboard
pnpm install
pnpm prisma generate
```

---

## Next Steps

Once localhost is working:

1. ✅ Test API endpoints
2. ✅ Test authentication flow
3. ✅ Test database operations
4. ✅ Start implementing new features

---

## Need Help?

If you're still having issues:

1. Check Supabase Dashboard → Logs for connection attempts
2. Verify database credentials in Supabase Dashboard
3. Check network/firewall settings
4. Try connecting from a different network

