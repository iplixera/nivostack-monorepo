# Multiple Projects Build Error

## Issue

All projects (studio, ingest-api, control-api) are failing with:
```
Command "pnpm install && pnpm build" exited with 1
```

Website project succeeds, but dashboard-based projects fail.

## Root Cause Analysis

### Configuration
- **Website**: `rootDirectory: website` → Uses `website/vercel.json` ✅
- **Studio**: `rootDirectory: dashboard` → Uses `dashboard/vercel.json` ✅
- **Ingest API**: `rootDirectory: dashboard` → Uses `dashboard/vercel.json` ✅
- **Control API**: `rootDirectory: dashboard` → Uses `dashboard/vercel.json` ✅

All three dashboard projects share the same `dashboard/vercel.json` file, which is correct since they all build from the same directory.

### Why Website Succeeds But Others Fail

1. **Website**:
   - Has `.npmrc` with workspace isolation
   - Simpler build (no Prisma, no database)
   - Fewer dependencies

2. **Dashboard Projects**:
   - Part of pnpm workspace
   - Require Prisma generation
   - Need database environment variables
   - More complex build process

## Common Build Failures

### 1. Missing Environment Variables

**Error**: Prisma generation fails or database connection errors

**Required Variables**:
- `POSTGRES_PRISMA_URL` (for Prisma client generation)
- `POSTGRES_URL_NON_POOLING` (for migrations)
- `JWT_SECRET` (for authentication)

**Solution**: Set in Vercel project settings for each project

### 2. Prisma Generation Failing

**Error**: `Error: Can't reach database server` or `Schema not found`

**Causes**:
- Missing `POSTGRES_PRISMA_URL`
- Incorrect schema path (`../prisma/schema.prisma`)
- Database connection issues

**Solution**:
- Ensure `POSTGRES_PRISMA_URL` is set (even if not used for generation)
- Verify schema path in `dashboard/package.json`
- Check database connection strings

### 3. pnpm Workspace Issues

**Error**: Module resolution failures, dependency conflicts

**Solution**: Create `dashboard/.npmrc`:
```
link-workspace-packages=false
shamefully-hoist=true
```

### 4. Build Script Errors

**Error**: `prisma generate` fails or `next build` fails

**Check**: `dashboard/package.json` build script:
```json
{
  "scripts": {
    "build": "prisma generate --schema=../prisma/schema.prisma && next build --webpack"
  }
}
```

## Debugging Steps

### Step 1: Check Build Logs

1. Go to Vercel Dashboard → Project → Deployments
2. Click on failed deployment
3. Check "Build Logs" tab
4. Look for the actual error message

### Step 2: Verify Environment Variables

For each project (studio, ingest-api, control-api):

1. Go to Project Settings → Environment Variables
2. Verify these are set:
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`
   - `JWT_SECRET`

### Step 3: Test Build Locally

```bash
cd dashboard
pnpm install
pnpm build
```

This will show the actual error locally.

### Step 4: Check Prisma Schema Path

Verify `dashboard/package.json`:
```json
{
  "prisma": {
    "schema": "../prisma/schema.prisma"
  }
}
```

## Solutions

### Solution 1: Add Missing Environment Variables

Set in Vercel for each project:
- Production environment
- Preview environment
- Development environment

### Solution 2: Add dashboard/.npmrc

If workspace issues:
```bash
cd dashboard
cat > .npmrc << EOF
link-workspace-packages=false
shamefully-hoist=true
EOF
```

### Solution 3: Fix Prisma Generation

Ensure `POSTGRES_PRISMA_URL` is set even if Prisma doesn't need it for generation (it checks for the env var).

### Solution 4: Verify Build Command

Ensure `dashboard/vercel.json` has:
```json
{
  "buildCommand": "pnpm install && pnpm build",
  "installCommand": "pnpm install"
}
```

## Next Steps

1. **Check build logs** in Vercel Dashboard to see actual error
2. **Verify environment variables** are set for all projects
3. **Test build locally** to reproduce error
4. **Fix the specific issue** based on error message

## Expected Behavior After Fix

- ✅ All projects build successfully
- ✅ Prisma generation completes
- ✅ Next.js build succeeds
- ✅ Deployments complete

