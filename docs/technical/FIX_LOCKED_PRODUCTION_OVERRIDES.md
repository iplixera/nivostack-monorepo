# Fix Locked Production Overrides - Complete Reset

## Problem

Production Overrides in "Ignored Build Step" is disabled/locked, preventing changes. This happens when there's an existing production deployment with different settings.

## Root Cause

- Production deployment exists with old `ignoreCommand`
- Production Overrides gets locked to match production deployment
- Project Settings can't override locked Production Overrides
- Builds keep using the old command from Production Overrides

## Complete Reset Solution

### Step 1: Disconnect GitHub

1. Go to: https://vercel.com/plixeras/nivostack-studio/settings/git
2. Click **"Disconnect"** button
3. Confirm disconnection

**Why:** This removes the GitHub connection and unlocks Production Overrides.

### Step 2: Clear Ignored Build Step Settings

1. Go to: Settings → General
2. Scroll to **"Ignored Build Step"**
3. Set Behavior to: **"Automatic"**
4. Clear any command fields (if visible)
5. Click **"Save"**

**Why:** This clears the locked Production Overrides.

### Step 3: Reconnect GitHub

1. Go to: Settings → Git
2. Click **"Connect Git Repository"**
3. Select: `iplixera/nivostack-monorepo`
4. Configure:
   - Production Branch: `main`
   - Root Directory: `dashboard`
   - Build Command: `pnpm install && pnpm build`
   - Output Directory: `.next`
5. Click **"Save"**

**Why:** Creates fresh settings without locked Overrides.

### Step 4: Configure Ignored Build Step

1. Go to: Settings → General
2. Scroll to **"Ignored Build Step"**
3. Set Behavior to: **"Run my Bash script"**
4. Command: `exit 1` (NOT exit 0! Exit 1 = build, Exit 0 = skip)
5. Click **"Save"**

**Why:** `exit 1` means "build needed" in Vercel (backwards from normal shell logic - exit 1 = build, exit 0 = skip).

### Step 5: Set Production Overrides (Optional)

Now Production Overrides should be editable:

1. In **"Production Overrides"** section:
   - Set Command: `exit 1` (if editable)
   - Click **"Save"**

**Why:** Ensures both settings match. Note: Exit 1 = build, Exit 0 = skip in Vercel.

### Step 6: Deploy

1. Go to project page
2. Click **"Deploy"**
3. Select branch: `develop`
4. Click **"Deploy"**

Build should now proceed without cancellation!

## Why This Works

1. **Disconnecting** removes GitHub webhook and unlocks settings
2. **Clearing** removes the locked Production Overrides
3. **Reconnecting** creates fresh settings
4. **Setting exit 0** ensures builds always proceed
5. **Both sections** now editable and consistent

## Alternative: Quick Fix (If Above Doesn't Work)

If the complete reset doesn't work, try:

1. **Deploy to Production** from `main` branch:
   - This will use Project Settings (`exit 0`)
   - Unlocks Production Overrides
   - Then you can edit both

2. **Or use Vercel CLI** to deploy:
   ```bash
   cd dashboard
   vercel link --project nivostack-studio
   vercel --prod=false
   ```
   - CLI deployments might bypass Ignored Build Step

## Verification

After completing all steps:
- ✅ Production Overrides should be editable
- ✅ Project Settings should have `exit 0`
- ✅ Deployments should proceed without cancellation
- ✅ Builds should appear and stay visible

## Prevention

To prevent this in the future:
- Keep Project Settings and Production Overrides in sync
- Use `exit 0` for testing (always build)
- Use proper git diff logic for production filtering
- Don't let Production Overrides get out of sync

