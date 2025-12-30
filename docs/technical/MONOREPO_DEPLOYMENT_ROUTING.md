# Monorepo Deployment Routing Issue

## Problem

Builds appearing under wrong project (website instead of dashboard) when triggering deployments in a monorepo setup.

## Root Cause

When multiple Vercel projects are connected to the same GitHub repository:
- Vercel needs to know which project to deploy
- Uses `rootDirectory` to distinguish projects
- Manual triggers might default to first project found
- Builds can route incorrectly if rootDirectory not properly set

## Solution

### 1. Verify Root Directory Settings

Each project MUST have a unique `rootDirectory`:

**Website Project** (`nivostack-website`):
- Root Directory: `website`
- Build Command: `pnpm install && pnpm build`
- Output Directory: `.next`

**Dashboard Project** (`nivostack-studio`):
- Root Directory: `dashboard`
- Build Command: `pnpm install && pnpm build`
- Output Directory: `.next`

### 2. Correct Way to Trigger Deployments

#### Option A: Via Dashboard (Recommended)

1. **For Dashboard**:
   - Go to: https://vercel.com/plixeras/nivostack-studio
   - Click "Deploy" button
   - Verify Root Directory shows: `dashboard`
   - Select branch: `develop`
   - Click "Deploy"

2. **For Website**:
   - Go to: https://vercel.com/plixeras/nivostack-website
   - Click "Deploy" button
   - Verify Root Directory shows: `website`
   - Select branch: `develop`
   - Click "Deploy"

#### Option B: Via GitHub Push (Auto-Deploy)

When both projects are connected:
- Push to `develop` → Both projects deploy (preview)
- Push to `main` → Both projects deploy (production)
- Vercel automatically routes based on `rootDirectory`

#### Option C: Via CLI

**Dashboard**:
```bash
cd dashboard
vercel link --project nivostack-studio
vercel --prod=false
```

**Website**:
```bash
cd website
vercel link --project nivostack-website
vercel --prod=false
```

### 3. Verify Project Configuration

Check each project's settings:

```bash
# Check website
curl -X GET "https://api.vercel.com/v9/projects/nivostack-website?teamId=plixeras" \
  -H "Authorization: Bearer $VERCEL_TOKEN" | jq '.rootDirectory'

# Check dashboard
curl -X GET "https://api.vercel.com/v9/projects/nivostack-studio?teamId=plixeras" \
  -H "Authorization: Bearer $VERCEL_TOKEN" | jq '.rootDirectory'
```

Both should show their respective directories (`website` and `dashboard`).

## Why Builds Appear Under Wrong Project

1. **Manual Trigger Without Project Context**:
   - Triggering from wrong project page
   - Not specifying which project to deploy

2. **Root Directory Not Set**:
   - If `rootDirectory` is null or incorrect
   - Vercel defaults to root or first project

3. **GitHub Connection Issue**:
   - If connection not properly configured
   - Builds might route incorrectly

## Prevention

1. **Always verify you're on correct project page** before triggering
2. **Check Root Directory** in deployment settings
3. **Use GitHub push** for automatic deployments (most reliable)
4. **Verify both projects connected** to same repo with different rootDirectories

## Expected Behavior After Fix

✅ Dashboard deployments appear under `nivostack-studio` project
✅ Website deployments appear under `nivostack-website` project
✅ Both deploy automatically on GitHub push
✅ Each project builds from correct directory

## Troubleshooting

### If builds still appear under wrong project:

1. **Disconnect and reconnect GitHub**:
   - Go to project Settings → Git
   - Disconnect repository
   - Reconnect with correct rootDirectory

2. **Verify via API**:
   ```bash
   curl -X GET "https://api.vercel.com/v9/projects/nivostack-studio?teamId=plixeras" \
     -H "Authorization: Bearer $VERCEL_TOKEN" | jq '{rootDirectory, repo: .link.repo}'
   ```

3. **Check deployment source**:
   - In Vercel Dashboard → Deployments
   - Check which project the deployment belongs to
   - Verify rootDirectory in deployment details

