# Website Build Cancellation Fix

## Problem

After connecting website to GitHub, builds are being cancelled even with manual trigger.

## Root Cause

The `ignoreCommand` in `vercel.json` is causing issues:

```json
"ignoreCommand": "git diff HEAD^ HEAD --quiet -- website/ || exit 1"
```

**Issues:**
1. When first connecting to GitHub, Vercel might not have proper git context
2. The command might fail, causing builds to be cancelled
3. Vercel's ignore command logic: `exit 0` = skip build, `exit 1` = build (backwards from normal shell)

## Practical Solutions

### Solution 1: Remove ignoreCommand (Recommended for First Deploy)

**Why:** When first connecting, you want to ensure the build runs. You can add filtering later.

**Steps:**

1. **Update vercel.json:**
   ```json
   {
     "buildCommand": "pnpm install && pnpm build",
     "outputDirectory": ".next",
     "framework": "nextjs",
     "installCommand": "pnpm install"
   }
   ```

2. **Update in Vercel Dashboard:**
   - Go to: https://vercel.com/nivostack/nivostack-website/settings/general
   - Scroll to **"Ignored Build Step"**
   - Set to: **"Automatic"** (or remove the command)
   - Click **"Save"**

3. **Redeploy:**
   - Push a new commit, or
   - Click **"Redeploy"** in Vercel Dashboard

### Solution 2: Fix ignoreCommand Logic

**Why:** Keep filtering but fix the command to work correctly.

**Update vercel.json:**
```json
{
  "buildCommand": "pnpm install && pnpm build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "installCommand": "pnpm install",
  "ignoreCommand": "git diff HEAD^ HEAD --quiet -- website/ && exit 0 || exit 1"
}
```

**Or simpler (always build if website/ changes):**
```json
{
  "ignoreCommand": "git diff --quiet HEAD^ HEAD -- website/ && exit 0 || exit 1"
}
```

**Note:** In Vercel:
- `exit 0` = Skip build (no changes detected)
- `exit 1` = Build (changes detected)

### Solution 3: Disconnect & Reconnect (If Above Doesn't Work)

**Why:** Sometimes Vercel caches old configuration. Disconnecting resets it.

**Steps:**

1. **Disconnect GitHub:**
   - Go to: https://vercel.com/nivostack/nivostack-website/settings/git
   - Click **"Disconnect"**
   - Confirm

2. **Clear Ignored Build Step:**
   - Go to: Settings → General
   - Set **"Ignored Build Step"** to: **"Automatic"**
   - Click **"Save"**

3. **Reconnect GitHub:**
   - Go to: Settings → Git
   - Click **"Connect Git Repository"**
   - Select your repository
   - Configure:
     - **Root Directory**: `website`
     - **Build Command**: `pnpm install && pnpm build`
     - **Output Directory**: `.next`
     - **Install Command**: `pnpm install`
   - Click **"Save"**

4. **Deploy:**
   - Push a commit, or manually trigger deployment

### Solution 4: Manual Deploy First (Bypass GitHub)

**Why:** Get a successful deployment first, then connect GitHub.

**Steps:**

1. **Deploy via CLI:**
   ```bash
   cd website
   vercel link --project nivostack-website
   vercel --prod
   ```

2. **After successful deployment, connect GitHub:**
   ```bash
   vercel git connect
   ```

## Quick Fix (Recommended)

**Simplest approach - remove ignoreCommand temporarily:**

1. **Edit `website/vercel.json`:**
   ```json
   {
     "buildCommand": "pnpm install && pnpm build",
     "outputDirectory": ".next",
     "framework": "nextjs",
     "installCommand": "pnpm install"
   }
   ```

2. **Commit and push:**
   ```bash
   git add website/vercel.json
   git commit -m "fix: remove ignoreCommand to fix build cancellation"
   git push origin main
   ```

3. **Or update in Vercel Dashboard:**
   - Settings → General → Ignored Build Step → Set to "Automatic"

## Verification

After applying the fix:

1. **Check Vercel Dashboard:**
   - Go to: https://vercel.com/nivostack/nivostack-website
   - Check **"Deployments"** tab
   - Build should show "Building" → "Ready" (not "Cancelled")

2. **Check Build Logs:**
   - Click on the deployment
   - Check **"Build Logs"** tab
   - Should see build progress, not cancellation

3. **Test Website:**
   ```bash
   curl https://nivostack.com
   # Should return HTML
   ```

## Why This Happens

1. **First Connection:** Vercel might not have full git context
2. **Ignore Command:** If it fails or returns wrong exit code, build is cancelled
3. **Configuration Cache:** Old settings might be cached

## Prevention

After first successful deployment:

1. **Add back ignoreCommand** (if you want filtering):
   ```json
   "ignoreCommand": "git diff --quiet HEAD^ HEAD -- website/ && exit 0 || exit 1"
   ```

2. **Or keep it simple:**
   - Use **"Automatic"** in dashboard (Vercel handles it)
   - Or remove `ignoreCommand` entirely (builds on every push)

---

**Last Updated**: December 31, 2024

