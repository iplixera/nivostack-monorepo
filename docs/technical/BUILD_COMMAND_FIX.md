# Build Command Error Fix

## Error

```
Command "cd dashboard && pnpm install && pnpm build" exited with 1
```

## Root Cause

The build command included `cd dashboard`, but since `rootDirectory` is already set to `dashboard` in Vercel project settings, Vercel automatically changes to that directory before running the build command. This causes the command to fail because it tries to `cd dashboard` from within the `dashboard` directory.

## Solution

### Fixed Build Command

**Before:**
```bash
cd dashboard && pnpm install && pnpm build
```

**After:**
```bash
pnpm install && pnpm build
```

### Why This Works

1. **Root Directory**: Vercel automatically changes to `dashboard/` directory
2. **Build Command**: Runs from within `dashboard/`, so no `cd` needed
3. **Install Command**: Separate `installCommand` handles `pnpm install`

## Configuration

### Vercel Project Settings

- **Root Directory**: `dashboard`
- **Build Command**: `pnpm install && pnpm build`
- **Install Command**: `pnpm install`
- **Output Directory**: `.next`

### What the Build Command Does

1. `pnpm install` - Installs dependencies
2. `pnpm build` - Runs:
   - `prisma generate --schema=../prisma/schema.prisma`
   - `next build --webpack`

## Common Build Failures After Fix

### 1. Missing Environment Variables

**Error**: Prisma generation fails

**Solution**: Ensure these are set in Vercel:
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `JWT_SECRET`

### 2. Prisma Schema Path Issue

**Error**: Cannot find schema file

**Solution**: Verify schema path in `dashboard/package.json`:
```json
{
  "prisma": {
    "schema": "../prisma/schema.prisma"
  }
}
```

### 3. pnpm Workspace Issues

**Error**: Module resolution failures

**Solution**: If needed, create `dashboard/.npmrc`:
```
link-workspace-packages=false
shamefully-hoist=true
```

## Verification

After fixing, verify:
1. Build command doesn't include `cd dashboard`
2. Root Directory is set to `dashboard`
3. Build logs show commands running from `dashboard/` directory
4. Prisma generation succeeds
5. Next.js build completes

## Next Steps

1. Trigger new deployment
2. Check build logs for any remaining errors
3. Fix any environment variable or dependency issues
4. Verify deployment succeeds

