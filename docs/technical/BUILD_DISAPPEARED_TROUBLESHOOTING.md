# Build Disappeared - Troubleshooting Guide

## Issue

Build was queued then disappeared from Vercel Dashboard.

## Possible Causes

### 1. Build Failed Immediately
- **Symptom**: Build appears briefly then disappears
- **Cause**: Build error occurs before it can be logged
- **Solution**: Check "Failed" deployments in Dashboard

### 2. GitHub Connection Issue
- **Symptom**: Build queued but cancelled
- **Cause**: GitHub webhook failed or connection lost
- **Solution**: Verify GitHub connection in Settings → Git

### 3. Duplicate Commit Detection
- **Symptom**: Build queued then cancelled
- **Cause**: Same commit SHA already deployed
- **Solution**: Push a new commit with unique SHA

### 4. Project Configuration Error
- **Symptom**: Build fails immediately
- **Cause**: Invalid root directory, build command, or paths
- **Solution**: Verify project settings match actual structure

### 5. Environment Variable Issue
- **Symptom**: Build fails during install/build
- **Cause**: Missing required environment variables
- **Solution**: Check Settings → Environment Variables

## How to Check

### Via Vercel Dashboard
1. Go to: https://vercel.com/plixeras/nivostack-studio
2. Click **"Deployments"** tab
3. Look for:
   - **Failed** deployments (red)
   - **Cancelled** deployments (gray)
   - **Building** deployments (blue)

### Via CLI
```bash
cd dashboard
vercel ls
# Check for failed/cancelled deployments
```

### Via API
```bash
curl -X GET "https://api.vercel.com/v6/deployments?projectId=nivostack-studio&teamId=plixeras&limit=10" \
  -H "Authorization: Bearer $VERCEL_TOKEN" | jq '.deployments[] | {state, url, createdAt}'
```

## Solutions

### Solution 1: Check Failed Deployments
1. Go to Dashboard → Deployments
2. Click on any failed deployment
3. Check "Build Logs" for error messages
4. Fix the issue and redeploy

### Solution 2: Verify Configuration
Ensure these settings are correct:
- **Root Directory**: `dashboard`
- **Build Command**: `pnpm install && pnpm build`
- **Output Directory**: `.next`
- **Framework**: Next.js

### Solution 3: Manual Trigger
1. Go to Dashboard
2. Click **"Deploy"** button
3. Select branch: `develop`
4. Monitor the build

### Solution 4: Check Environment Variables
Ensure these are set:
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `JWT_SECRET`

## Common Build Errors

### Prisma Generation Fails
- **Error**: `prisma generate` fails
- **Fix**: Ensure `POSTGRES_PRISMA_URL` is set (even if not used for generation)

### Missing Dependencies
- **Error**: Module not found
- **Fix**: Check `package.json` has all dependencies

### Path Errors
- **Error**: `cd dashboard/dashboard` or similar
- **Fix**: Remove redundant `cd` from build command

## Prevention

1. **Always check build logs** after deployment
2. **Verify configuration** before pushing
3. **Test build locally** first: `cd dashboard && pnpm install && pnpm build`
4. **Monitor deployments** in Dashboard

## Next Steps

1. Check Vercel Dashboard for failed deployments
2. Review build logs for specific errors
3. Fix configuration issues
4. Trigger new deployment
5. Monitor build progress

