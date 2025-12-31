# Trigger Ingest & Control API Deployments

## Problem

After pushing to GitHub:
- ✅ Website triggered (but canceled - expected if no changes)
- ✅ Studio triggered (but canceled - expected if no changes)
- ❌ Ingest API didn't trigger
- ❌ Control API didn't trigger

## Root Cause

**Ingest and Control APIs are NOT connected to GitHub yet.**

They need to be connected to GitHub to trigger automatic deployments.

## Solution: Connect APIs to GitHub

### Step 1: Connect Ingest API to GitHub

**Via Vercel Dashboard (Recommended):**

1. Go to: https://vercel.com/nivostack/nivostack-ingest-api/settings/git
2. Click **"Connect Git Repository"**
3. Select your GitHub repository: `iplixera/nivostack-monorepo` (or your repo name)
4. Configure:
   - **Production Branch**: `main`
   - **Root Directory**: `dashboard`
   - **Build Command**: `pnpm install && pnpm build`
   - **Output Directory**: `.next`
   - **Install Command**: `pnpm install`
   - **Framework Preset**: `Next.js`
5. Click **"Save"**

**Via CLI:**
```bash
cd dashboard
vercel link --project nivostack-ingest-api
vercel git connect
```

### Step 2: Connect Control API to GitHub

**Via Vercel Dashboard:**

1. Go to: https://vercel.com/nivostack/nivostack-control-api/settings/git
2. Click **"Connect Git Repository"**
3. Select your GitHub repository: `iplixera/nivostack-monorepo`
4. Configure:
   - **Production Branch**: `main`
   - **Root Directory**: `dashboard`
   - **Build Command**: `pnpm install && pnpm build`
   - **Output Directory**: `.next`
   - **Install Command**: `pnpm install`
   - **Framework Preset**: `Next.js`
5. Click **"Save"**

**Via CLI:**
```bash
cd dashboard
vercel link --project nivostack-control-api
vercel git connect
```

### Step 3: Verify Ignored Build Step

After connecting, verify Ignored Build Step is configured:

**For Ingest API:**
1. Go to: Settings → General → Ignored Build Step
2. Should be: `git diff --name-only HEAD^ HEAD | grep -q "^dashboard/" && exit 1 || exit 0`

**For Control API:**
1. Go to: Settings → General → Ignored Build Step
2. Should be: `git diff --name-only HEAD^ HEAD | grep -q "^dashboard/" && exit 1 || exit 0`

### Step 4: Trigger Deployment

**Option A: Push to GitHub (Now Will Work)**

```bash
# Make a change in dashboard/ to trigger all three
echo "test" >> dashboard/test.txt
git add dashboard/test.txt
git commit -m "chore: trigger dashboard deployments"
git push origin main
```

**Expected:**
- ✅ Studio deploys (dashboard/ changed)
- ✅ Ingest API deploys (dashboard/ changed)
- ✅ Control API deploys (dashboard/ changed)
- ⏭️ Website skips (no website/ changes)

**Option B: Empty Commit (If No Changes)**

```bash
git commit --allow-empty -m "chore: trigger all API deployments"
git push origin main
```

**Note:** Empty commit might trigger all projects (first deployment), but filtering will work on subsequent commits.

**Option C: Manual Deploy (Immediate)**

If you want to deploy now without waiting for GitHub connection:

```bash
# Ingest API
cd dashboard
vercel link --project nivostack-ingest-api
vercel --prod --local-config vercel-ingest.json

# Control API
vercel link --project nivostack-control-api
vercel --prod --local-config vercel-control.json
```

## Verification

After connecting to GitHub and pushing:

1. **Check Vercel Dashboard:**
   - Go to each project's "Deployments" tab
   - Should see new deployments triggered by GitHub push

2. **Check GitHub Integration:**
   - Go to: Settings → Git
   - Should show: "Connected to GitHub"
   - Should show repository name

3. **Test Deployments:**
   ```bash
   # Make a change
   echo "test" >> dashboard/test.txt
   git add dashboard/test.txt
   git commit -m "test: trigger APIs"
   git push origin main
   
   # Check Vercel Dashboard - all three should deploy
   ```

## Troubleshooting

### Issue: "Connect Git Repository" Button Not Available

**Cause:** Project might already be connected to a different repo  
**Fix:** 
1. Check Settings → Git
2. If connected to wrong repo, disconnect first
3. Then reconnect to correct repo

### Issue: APIs Still Don't Trigger

**Check:**
1. GitHub connection status (Settings → Git)
2. Production branch is set to `main`
3. Root Directory is set to `dashboard`
4. Ignored Build Step is configured correctly

### Issue: All Projects Deploy (No Filtering)

**Cause:** Ignored Build Step not configured  
**Fix:** Set Ignored Build Step in Dashboard settings

## Quick Checklist

- [ ] Ingest API connected to GitHub
- [ ] Control API connected to GitHub
- [ ] Ignored Build Step configured for both
- [ ] Root Directory set to `dashboard` for both
- [ ] Production branch set to `main` for both
- [ ] Test push triggers deployments

---

**Last Updated**: December 31, 2024

