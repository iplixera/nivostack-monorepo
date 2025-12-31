# Vercel Build Database Connection Fix

## Problem

During Vercel builds, `prisma db push` fails with:
```
Error: P1001: Can't reach database server at `db.djyqtlxjpzlncppmazzz.supabase.co:5432`
```

**Root Cause**: 
- Vercel's build environment cannot reach Supabase database (IP restrictions/network policies)
- Supabase databases are typically restricted to specific IP addresses
- Vercel build servers have dynamic IPs that aren't whitelisted

## Solution

Make `prisma db push` **non-blocking** during build, with automatic migration on first API request as fallback.

### Build Script (Non-Blocking)

```json
"build": "bash scripts/run-prisma-safe.sh generate && (bash scripts/run-prisma-safe.sh push || echo '⚠️  Migration skipped - will run on first API request') && next build --webpack"
```

**What happens**:
1. ✅ `prisma generate` **must succeed** (required for build)
2. ⚠️ `prisma db push` **can fail** (non-blocking)
3. ✅ Build continues even if migration fails
4. 🔄 Automatic migration runs on first API request (`/api/health`)

### Automatic Migration Fallback

The `/api/health` endpoint automatically runs migrations on first call:

```typescript
// dashboard/src/app/api/health/route.ts
// Runs prisma db push on first health check after deployment
```

**Benefits**:
- ✅ Builds succeed even if database is unreachable
- ✅ Migrations run automatically when app starts
- ✅ No manual intervention needed
- ✅ Works with Supabase IP restrictions

## Deployment Flow

1. **Build Phase**:
   ```
   prisma generate → ✅ (required)
   prisma db push → ⚠️ (may fail, non-blocking)
   next build → ✅ (continues)
   ```

2. **Runtime Phase** (First API Request):
   ```
   GET /api/health → 🔄 Runs prisma db push → ✅ Migration applied
   ```

## Why This Approach?

1. **Supabase IP Restrictions**: Database only accepts connections from whitelisted IPs
2. **Vercel Dynamic IPs**: Build servers have changing IPs that can't be whitelisted
3. **Runtime Access**: Vercel runtime can access Supabase (different network path)
4. **Automatic Recovery**: First API request ensures migrations are applied

## Alternative Solutions (Not Recommended)

### ❌ Whitelist Vercel IPs
- Vercel IPs change frequently
- Not practical to maintain
- Security risk

### ❌ Use Connection Pooler
- Still requires network access during build
- Same IP restriction issues

### ❌ Manual Migration Scripts
- Requires manual intervention
- Not automated
- Error-prone

## Verification

After deployment, check logs:

1. **Build Logs** (should show warning):
   ```
   ⚠️  Migration skipped - will run on first API request
   ```

2. **Runtime Logs** (first `/api/health` call):
   ```
   🔄 Running database migration...
   ✅ Migration completed
   ```

## Related Files

- `dashboard/package.json` - Build script
- `dashboard/src/app/api/health/route.ts` - Automatic migration endpoint
- `dashboard/scripts/run-prisma-safe.sh` - Prisma wrapper script

