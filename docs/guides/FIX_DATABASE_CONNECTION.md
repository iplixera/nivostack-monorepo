# Fix Database Connection for Localhost

## Current Issue

**Error**: `Can't reach database server at db.ngsgfvrntmjakzednles.supabase.co:5432`

**Cause**: Supabase database has IP restrictions enabled, blocking connections from your local IP.

---

## Solution 1: Whitelist Your IP in Supabase (Recommended)

### Step 1: Get Your Current IP

```bash
curl ifconfig.me
```

Or visit: https://ifconfig.me

### Step 2: Add IP to Supabase Whitelist

1. **Go to Supabase Dashboard**
   - https://supabase.com/dashboard
   - Select your project: `ngsgfvrntmjakzednles`

2. **Navigate to Database Settings**
   - Go to: **Settings** → **Database**
   - Or: **Project Settings** → **Database**

3. **Find Network Restrictions**
   - Look for: "Network Restrictions", "IP Allowlist", or "Connection Pooling"
   - May be under "Connection string" section

4. **Add Your IP**
   - Click "Add IP" or "Add to whitelist"
   - Enter your IP address (from Step 1)
   - Save

5. **Wait 1-2 minutes** for changes to propagate

6. **Test Connection**
   ```bash
   cd dashboard
   pnpm dev
   # Try login again
   ```

---

## Solution 2: Use Connection Pooler (Alternative)

If IP whitelisting doesn't work, use the connection pooler which may have different network rules:

### Update `.env.local`

```env
# Use pooler connection (port 6543)
POSTGRES_PRISMA_URL=postgresql://postgres.ref:YOUR_PASSWORD@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true

# Keep direct connection for migrations
POSTGRES_URL_NON_POOLING=postgresql://postgres:YOUR_PASSWORD@db.ngsgfvrntmjakzednles.supabase.co:5432/postgres?sslmode=require
```

**Note**: Replace `YOUR_PASSWORD` with your actual database password.

**Get Connection Strings**:
1. Go to Supabase Dashboard → Settings → Database
2. Find "Connection string" section
3. Copy "Connection pooling" URL (for `POSTGRES_PRISMA_URL`)
4. Copy "Direct connection" URL (for `POSTGRES_URL_NON_POOLING`)

---

## Solution 3: Temporarily Disable IP Restrictions (Development Only)

⚠️ **Only for development! Re-enable after testing!**

1. Go to Supabase Dashboard → Settings → Database
2. Find "Network Restrictions" or "IP Allowlist"
3. Temporarily disable restrictions
4. Test connection
5. **Re-enable restrictions** after testing

---

## Solution 4: Use VPN or Different Network

If you're behind a corporate firewall:

1. **Use VPN**: Connect to a VPN that allows database connections
2. **Use Mobile Hotspot**: Test from a different network
3. **Use Cloud Development**: Use Vercel Preview deployments for testing

---

## Verify Connection Works

### Test 1: Direct Database Connection

```bash
# Test with psql (if installed)
psql "postgresql://postgres:YOUR_PASSWORD@db.ngsgfvrntmjakzednles.supabase.co:5432/postgres?sslmode=require" -c "SELECT 1;"
```

### Test 2: Via API

```bash
# Start dev server
cd dashboard
pnpm dev

# In another terminal, test health endpoint
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

### Test 3: Login Endpoint

```bash
curl 'http://localhost:3000/api/auth/login' \
  -H 'Content-Type: application/json' \
  --data-raw '{"email":"freeplan@dev.com","password":"123456"}'
```

**Success**: Returns user data and token
**Failure**: Returns `{"error":"Internal server error"}` (database connection issue)

---

## Quick Fix Script

Create a script to test and fix connection:

```bash
#!/bin/bash
# test-db-connection.sh

echo "🔍 Testing Database Connection..."
echo ""

# Get current IP
MY_IP=$(curl -s ifconfig.me)
echo "📍 Your IP: $MY_IP"
echo ""

# Test connection
cd dashboard
if pnpm prisma db execute --stdin --schema=../prisma/schema.prisma <<< "SELECT 1;" 2>&1 | grep -q "1"; then
    echo "✅ Database connection successful!"
else
    echo "❌ Database connection failed"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Go to Supabase Dashboard → Settings → Database"
    echo "   2. Add IP to whitelist: $MY_IP"
    echo "   3. Wait 1-2 minutes"
    echo "   4. Run this script again"
fi
```

---

## Common Issues

### Issue: "Still can't connect after whitelisting"

**Solutions**:
1. Wait 2-3 minutes for DNS/propagation
2. Restart dev server: `pnpm dev`
3. Check IP hasn't changed (if using dynamic IP)
4. Verify password is correct in `.env.local`

### Issue: "Connection works but login still fails"

**Check**:
1. User exists in database: `freeplan@dev.com`
2. Password is correct: `123456`
3. Database schema is up to date: `pnpm prisma db push`

### Issue: "IP keeps changing"

**Solutions**:
1. Use connection pooler (Solution 2)
2. Whitelist IP range (if Supabase supports it)
3. Use static IP (VPN or cloud instance)

---

## After Fixing Connection

Once connection works:

1. ✅ Test login: `curl http://localhost:3000/api/auth/login ...`
2. ✅ Test registration: Create a new user
3. ✅ Test API endpoints: Projects, devices, etc.
4. ✅ Start implementing team invitations feature

---

## Need Help?

If still having issues:

1. Check Supabase Dashboard → Logs for connection attempts
2. Verify database is running (Supabase Dashboard → Database → Status)
3. Check `.env.local` has correct credentials
4. Try connecting from Supabase SQL Editor (tests if database is accessible)

