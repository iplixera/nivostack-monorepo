# Complete Deployment Setup Guide

## Current Status

### ✅ Completed
- All 4 Vercel projects created
- Environment variables configured
- Database connections set up
- Build configurations fixed
- Git user set to iplixera@gmail.com
- Vercel token updated to iplixera@gmail.com

### ⚠️ Remaining Issue
**Projects are NOT connected to GitHub**, so automatic deployments don't trigger.

## Critical Step: Connect Projects to GitHub

### Step-by-Step Instructions

**1. Go to Vercel Dashboard:**
   - https://vercel.com/plixeras (or check your team URL)

**2. For EACH project, connect to GitHub:**

#### nivostack-website
1. Click on **nivostack-website**
2. Go to **Settings** → **Git**
3. Click **"Connect Git Repository"**
4. Select: **iplixera/nivostack-monorepo**
5. Configure:
   - **Root Directory**: `website`
   - **Production Branch**: `main`
   - **Framework Preset**: Next.js (auto-detected)
6. Click **"Save"**

#### nivostack-studio
1. Click on **nivostack-studio**
2. Go to **Settings** → **Git**
3. Click **"Connect Git Repository"**
4. Select: **iplixera/nivostack-monorepo**
5. Configure:
   - **Root Directory**: `dashboard`
   - **Build Command**: `cd dashboard && pnpm install && pnpm build`
   - **Output Directory**: `dashboard/.next`
   - **Production Branch**: `main`
   - **Framework Preset**: Next.js
6. Click **"Save"**

#### nivostack-ingest-api
1. Click on **nivostack-ingest-api**
2. Go to **Settings** → **Git**
3. Click **"Connect Git Repository"**
4. Select: **iplixera/nivostack-monorepo**
5. Configure:
   - **Root Directory**: `dashboard`
   - **Build Command**: `cd dashboard && pnpm install && pnpm build`
   - **Output Directory**: `dashboard/.next`
   - **Production Branch**: `main`
   - **Framework Preset**: Next.js
6. Click **"Save"**

#### nivostack-control-api
1. Click on **nivostack-control-api**
2. Go to **Settings** → **Git**
3. Click **"Connect Git Repository"**
4. Select: **iplixera/nivostack-monorepo**
5. Configure:
   - **Root Directory**: `dashboard`
   - **Build Command**: `cd dashboard && pnpm install && pnpm build`
   - **Output Directory**: `dashboard/.next`
   - **Production Branch**: `main`
   - **Framework Preset**: Next.js
6. Click **"Save"**

## After Connecting

**1. Test Deployment:**
```bash
git commit --allow-empty -m "test: verify GitHub deployments"
git push origin develop
```

**2. Monitor Deployments:**
- Go to: https://vercel.com/plixeras
- All 4 projects should trigger preview deployments
- Check build logs for any errors

**3. Verify Success:**
- All builds should complete successfully
- Preview URLs will be generated
- Future pushes will auto-deploy

## Troubleshooting

### If deployments still don't trigger:

1. **Verify GitHub Integration:**
   - Go to: https://vercel.com/account/integrations
   - Ensure GitHub is connected
   - Re-authorize if needed

2. **Check Repository Access:**
   - Ensure iplixera@gmail.com has access to `iplixera/nivostack-monorepo`
   - Check repository is not private or access is granted

3. **Verify Project Settings:**
   - Root Directory must match actual folder structure
   - Build commands must be correct
   - Output directories must be relative to root directory

4. **Check Build Logs:**
   - If builds fail, check logs in Vercel Dashboard
   - Common issues: missing dependencies, wrong paths, env vars

## Expected Behavior After Setup

✅ **Automatic Deployments:**
- Push to `develop` → Preview deployments
- Push to `main` → Production deployments
- Create PR → Preview deployment for PR

✅ **Deployer:**
- All deployments will show: `iplixera@gmail.com`

✅ **Build Status:**
- All 4 projects build successfully
- Preview URLs accessible
- Production ready when merged to main

