# Dashboard Deployment Not Appearing - Fix Guide

## Issue

Dashboard build not appearing after GitHub connection.

## Root Cause

API shows `gitConnected: false` even though Dashboard shows connected. This indicates:
1. Connection not fully synced between Dashboard and API
2. Webhook not configured properly
3. Project settings need verification

## Solution Steps

### Step 1: Verify GitHub Connection

1. Go to: https://vercel.com/plixeras/nivostack-studio/settings/git
2. Verify it shows: **"Connected to iplixera/nivostack-monorepo"**
3. If not connected:
   - Click **"Connect Git Repository"**
   - Select: `iplixera/nivostack-monorepo`
   - Production Branch: `main`
   - Click **"Save"**

### Step 2: Verify Build Settings

1. Go to: https://vercel.com/plixeras/nivostack-studio/settings/general
2. Verify these settings:
   - **Root Directory**: `dashboard`
   - **Framework Preset**: Next.js
   - **Build Command**: `pnpm install && pnpm build`
   - **Output Directory**: `.next`
   - **Install Command**: `pnpm install`

### Step 3: Manual Deployment Trigger

1. Go to: https://vercel.com/plixeras/nivostack-studio
2. Click **"Deploy"** button (top right)
3. Select:
   - **Git Repository**: `iplixera/nivostack-monorepo`
   - **Branch**: `develop`
   - **Root Directory**: `dashboard`
4. Click **"Deploy"**

### Step 4: Check Deployment Status

1. Go to: https://vercel.com/plixeras/nivostack-studio/deployments
2. Look for:
   - **Building** (blue) - Deployment in progress
   - **Ready** (green) - Deployment successful
   - **Error** (red) - Check build logs

## Alternative: Trigger via GitHub

If manual trigger doesn't work:

1. Make a small change to any file in `dashboard/`
2. Commit and push:
   ```bash
   git add dashboard/
   git commit -m "chore: trigger dashboard deployment"
   git push origin develop
   ```
3. Check Vercel Dashboard for new deployment

## Troubleshooting

### If Build Still Doesn't Appear

1. **Check GitHub Webhooks**:
   - Go to: https://github.com/iplixera/nivostack-monorepo/settings/hooks
   - Look for Vercel webhook
   - Verify it's active and recent deliveries succeeded

2. **Check Vercel Team Settings**:
   - Go to: https://vercel.com/plixeras/settings/integrations
   - Verify GitHub integration is connected
   - Reconnect if needed

3. **Check Project Permissions**:
   - Ensure `iplixera@gmail.com` has owner/admin access
   - Check team member permissions

### If Build Fails

1. Check build logs in Vercel Dashboard
2. Common issues:
   - Missing environment variables
   - Prisma generation fails
   - Build command errors
   - Path issues

## Expected Behavior After Fix

- ✅ Build appears immediately after trigger
- ✅ Build stays visible (doesn't disappear)
- ✅ Build logs are accessible
- ✅ Preview URL generated on success
- ✅ Auto-deployments work on push

## Verification

After fixing, verify:
1. GitHub connection shows in Dashboard
2. Build appears when triggered
3. Build completes successfully
4. Preview URL works

