# Supabase RLS (Row Level Security) Enabling Guide

## Current Setup

Your application uses **Prisma** to connect to Supabase PostgreSQL database with:
- `POSTGRES_PRISMA_URL` - Pooled connection (for Prisma Client)
- `POSTGRES_URL_NON_POOLING` - Direct connection (for migrations)

## Impact of Enabling RLS

### ⚠️ **CRITICAL**: Check Your Connection String Type First!

**Two types of Supabase connection strings:**

1. **Service Role** (bypasses RLS):
   ```
   postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```
   - Contains `service_role` in the password or uses service role credentials
   - **Bypasses RLS** - Can access all data regardless of RLS policies
   - **Safe to enable RLS** - Won't affect your app

2. **Regular User** (respects RLS):
   ```
   postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
   ```
   - Uses regular database user credentials
   - **Respects RLS** - Will be blocked by RLS policies
   - **Will break your app** if RLS is enabled without policies

## How to Check Your Connection String

### Step 1: Check Environment Variables

In your Vercel dashboard or `.env.local`:
- Look for `POSTGRES_PRISMA_URL` or `POSTGRES_URL_NON_POOLING`
- Check if the connection string contains `service_role` or service role credentials

### Step 2: Verify in Supabase Dashboard

1. Go to Supabase Dashboard → Project Settings → Database
2. Check "Connection string" section
3. Look for "Service role" vs "Session" mode

## Recommendation

### ✅ **SAFE to Enable RLS If:**

- You're using **Service Role** connection strings (recommended for server-side apps)
- Your Prisma queries run server-side (they do)
- You want better security for direct database access

### ❌ **DON'T Enable RLS If:**

- You're using regular user credentials
- You haven't set up RLS policies
- You access the database directly from client-side code (you don't)

## Current Architecture

**Your Setup:**
- ✅ Prisma runs **server-side** (Next.js API routes)
- ✅ Uses connection strings from environment variables
- ✅ No direct client-side database access
- ✅ All queries go through Prisma Client

**This means:**
- If using **service role**: RLS won't affect Prisma queries
- If using **regular user**: RLS will block Prisma queries (needs policies)

## Safe Steps to Enable RLS

### Option 1: Use Service Role (Recommended - No Impact)

**If you're already using service role:**
1. ✅ Enable RLS in Supabase Dashboard
2. ✅ No code changes needed
3. ✅ Prisma queries continue working
4. ✅ RLS protects direct database access

**How to verify you're using service role:**
- Check Supabase Dashboard → Settings → API
- Look for "service_role" secret
- Your connection string should use this secret

### Option 2: Set Up RLS Policies (If Using Regular User)

**If you're using regular user credentials:**

1. **Create RLS Policies** for each table:
   ```sql
   -- Example: Allow service role to access all data
   CREATE POLICY "Allow service role full access"
   ON "User"
   FOR ALL
   TO service_role
   USING (true)
   WITH CHECK (true);
   ```

2. **Or use service role connection** (easier):
   - Switch to service role connection string
   - No policies needed
   - RLS enabled but bypassed for your app

## Testing Before Enabling

### Test Script

```sql
-- Run in Supabase SQL Editor to test RLS impact
-- This simulates what Prisma does

-- Test 1: Check current user
SELECT current_user;

-- Test 2: Try to read data (what Prisma does)
SELECT * FROM "User" LIMIT 1;

-- Test 3: Try to write data (what Prisma does)
INSERT INTO "User" (email, password, name) 
VALUES ('test@example.com', 'hash', 'Test User');
```

**If these queries work**, enabling RLS with service role won't break anything.

## Recommended Approach

### ✅ **Best Practice: Enable RLS + Use Service Role**

1. **Enable RLS** in Supabase Dashboard
2. **Verify** you're using service role connection strings
3. **Test** your application (should work normally)
4. **Benefit**: RLS protects against direct database access while your app continues working

### Why This Is Safe

- **Service role bypasses RLS** - Your Prisma queries work normally
- **RLS protects direct access** - Prevents unauthorized database access
- **No code changes** - Your application doesn't need updates
- **Better security** - Defense in depth

## What Happens If You Enable RLS with Regular User?

**If you enable RLS without policies and use regular user:**

❌ Prisma queries will fail with:
```
Error: new row violates row-level security policy
```

**Fix:**
- Either switch to service role connection string
- Or create RLS policies for your tables

## Verification Checklist

Before enabling RLS:

- [ ] Check connection string type (service role vs regular user)
- [ ] Test Prisma queries work (run your app locally)
- [ ] Backup database (just in case)
- [ ] Enable RLS in Supabase Dashboard
- [ ] Test application immediately after enabling
- [ ] Monitor for any errors

## Current Status

**Your application:**
- ✅ Uses Prisma (server-side)
- ✅ Connection strings from environment variables
- ✅ No direct client-side database access

**Most likely scenario:**
- You're using **service role** connection strings
- Enabling RLS is **safe** and **recommended**
- No code changes needed

## Next Steps

1. **Check your connection strings** in Vercel environment variables
2. **Verify** if they use service role credentials
3. **Enable RLS** if using service role (safe)
4. **Test** your application after enabling
5. **Monitor** for any issues

## Support

If you encounter issues after enabling RLS:
1. Check Supabase logs for RLS policy violations
2. Verify connection string type
3. Consider switching to service role if using regular user
4. Check Prisma query logs for errors

