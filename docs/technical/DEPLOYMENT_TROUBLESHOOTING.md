# Deployment Troubleshooting Guide

## Current Issues

### Issue 1: Only Website Deployed (with error)
- **Status**: Website project deployed but has build error
- **Other Projects**: Didn't trigger at all

### Issue 2: Projects Not Git-Connected
- **Problem**: `nivostack-studio`, `nivostack-ingest-api`, `nivostack-control-api` show as not connected to GitHub
- **Impact**: No automatic deployments triggered from GitHub pushes

## Solutions

### Fix 1: Connect Projects to GitHub (Required)

**For each project** (`nivostack-studio`, `nivostack-ingest-api`, `nivostack-control-api`):

1. **Go to Vercel Dashboard:**
   - https://vercel.com/nivostack

2. **Select Project:**
   - Click on the project name

3. **Connect Git Repository:**
   - Go to **Settings** → **Git**
   - Click **"Connect Git Repository"**
   - Select: `iplixera/nivostack-monorepo`
   - Click **"Connect"**

4. **Verify Settings:**
   - **Root Directory**: 
     - `dashboard` (for studio, ingest-api, control-api)
     - `website` (for website - should already be set)
   - **Production Branch**: `main`
   - **Framework Preset**: Next.js (should auto-detect)

5. **Save and Redeploy:**
   - After connecting, Vercel will trigger a deployment
   - Or manually trigger: Click **"Redeploy"** button

### Fix 2: Check Website Build Error

**To view website build error:**

1. **Via Dashboard:**
   - Go to: https://vercel.com/nivostack/nivostack-website
   - Click on the failed deployment
   - Go to **"Build Logs"** tab
   - Check for error messages

2. **Common Build Errors:**
   - Missing dependencies
   - Build command failing
   - Environment variables missing
   - TypeScript/ESLint errors

### Fix 3: Verify Project Configurations

After connecting GitHub, verify each project has:

**nivostack-website:**
- Root Directory: `website`
- Build Command: `pnpm install && pnpm build`
- Output Directory: `website/.next`

**nivostack-studio:**
- Root Directory: `dashboard`
- Build Command: `cd dashboard && pnpm install && pnpm build`
- Output Directory: `dashboard/.next`

**nivostack-ingest-api:**
- Root Directory: `dashboard`
- Build Command: `cd dashboard && pnpm install && pnpm build`
- Output Directory: `dashboard/.next`

**nivostack-control-api:**
- Root Directory: `dashboard`
- Build Command: `cd dashboard && pnpm install && pnpm build`
- Output Directory: `dashboard/.next`

## Verification Steps

After fixing:

1. **Check Git Connection:**
   - Go to project → Settings → Git
   - Should show: `iplixera/nivostack-monorepo`

2. **Trigger Test Deployment:**
   ```bash
   git commit --allow-empty -m "test: verify deployments"
   git push origin develop
   ```

3. **Monitor Deployments:**
   - All 4 projects should trigger
   - Check Vercel Dashboard for build status

4. **Check Build Logs:**
   - If any fail, check build logs
   - Fix errors and redeploy

## Quick Fix Script

If you want to verify configurations via API (requires proper token scope):

```bash
# Check project settings
export VERCEL_TOKEN=$(grep VERCEL_TOKEN vercel.properties | cut -d'=' -f2)
for project in nivostack-website nivostack-studio nivostack-ingest-api nivostack-control-api; do
  echo "=== $project ==="
  curl -s -X GET "https://api.vercel.com/v9/projects/$project?teamId=team_MBPi3LRUH16KWHeCO2JAQtxs" \
    -H "Authorization: Bearer $VERCEL_TOKEN" | jq '.link.repo'
done
```

## Next Steps

1. ✅ Connect all projects to GitHub (via Dashboard)
2. ✅ Fix website build error (check logs)
3. ✅ Verify configurations
4. ✅ Push new commit to test
5. ✅ Monitor all 4 deployments

