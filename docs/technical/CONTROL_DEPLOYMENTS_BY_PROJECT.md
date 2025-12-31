# Control Deployments by Project - Monorepo Guide

**Problem:** All projects deploy on every push to GitHub. You want to control which projects deploy.

## Current Situation

When you push to `main`:
- ✅ `nivostack-website` deploys
- ✅ `nivostack-studio` deploys  
- ⏳ `nivostack-ingest-api` (when connected)
- ⏳ `nivostack-control-api` (when connected)

**All projects trigger because they're connected to the same repo.**

## Solutions

### Solution 1: Use Ignored Build Step (Recommended)

**How it works:** Each project checks if its folder changed. If not, skip the build.

**For Website Project:**

1. **Go to Vercel Dashboard:**
   - https://vercel.com/nivostack/nivostack-website/settings/general
   - Scroll to **"Ignored Build Step"**

2. **Set to "Run my Bash script"**

3. **Add this command:**
   ```bash
   git diff HEAD^ HEAD --quiet -- website/ && exit 0 || exit 1
   ```
   
   **Note:** In Vercel:
   - `exit 0` = Skip build (no changes)
   - `exit 1` = Build (changes detected)

4. **Click "Save"**

**For Studio Project:**

1. **Go to:** https://vercel.com/nivostack/nivostack-studio/settings/general
2. **Set Ignored Build Step to:** "Run my Bash script"
3. **Command:**
   ```bash
   git diff HEAD^ HEAD --quiet -- dashboard/ && exit 0 || exit 1
   ```
4. **Click "Save"**

**For Ingest API (when connected):**

1. **Go to:** https://vercel.com/nivostack/nivostack-ingest-api/settings/general
2. **Set Ignored Build Step to:** "Run my Bash script"
3. **Command:**
   ```bash
   git diff HEAD^ HEAD --quiet -- dashboard/ && exit 0 || exit 1
   ```
4. **Click "Save"**

**For Control API (when connected):**

1. **Go to:** https://vercel.com/nivostack/nivostack-control-api/settings/general
2. **Set Ignored Build Step to:** "Run my Bash script"
3. **Command:**
   ```bash
   git diff HEAD^ HEAD --quiet -- dashboard/ && exit 0 || exit 1
   ```
4. **Click "Save"**

### Solution 2: Add ignoreCommand to vercel.json (Alternative)

**For Website:**

Add to `website/vercel.json`:
```json
{
  "buildCommand": "pnpm install && pnpm build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "installCommand": "pnpm install",
  "ignoreCommand": "git diff HEAD^ HEAD --quiet -- website/ && exit 0 || exit 1"
}
```

**For Studio:**

Add to `dashboard/vercel-studio.json`:
```json
{
  "buildCommand": "pnpm install && pnpm build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "installCommand": "pnpm install",
  "ignoreCommand": "git diff HEAD^ HEAD --quiet -- dashboard/ && exit 0 || exit 1"
}
```

**Note:** Dashboard, Ingest, and Control all use `dashboard/` folder, so they'll all deploy when dashboard changes. That's expected since they share the same codebase.

### Solution 3: Use Separate Branches

**Strategy:** Deploy different projects from different branches.

**Setup:**

1. **Create branches:**
   ```bash
   git checkout -b website-deploy
   git checkout -b studio-deploy
   ```

2. **In Vercel Dashboard, for each project:**
   - Settings → Git → Production Branch
   - Set to: `website-deploy` (for website), `studio-deploy` (for studio)

3. **Deploy workflow:**
   ```bash
   # Deploy website only
   git checkout website-deploy
   git merge main
   git push origin website-deploy
   
   # Deploy studio only
   git checkout studio-deploy
   git merge main
   git push origin studio-deploy
   ```

**Pros:** Full control  
**Cons:** More complex workflow

### Solution 4: Manual Deploy Only (No Auto-Deploy)

**Strategy:** Disconnect GitHub, deploy manually when needed.

**Steps:**

1. **For each project:**
   - Settings → Git → Disconnect

2. **Deploy manually:**
   ```bash
   # Website
   cd website
   vercel --prod
   
   # Studio
   cd dashboard
   vercel link --project nivostack-studio
   vercel --prod --local-config vercel-studio.json
   ```

**Pros:** Complete control  
**Cons:** No automatic deployments

### Solution 5: Use GitHub Actions (Advanced)

**Strategy:** Use GitHub Actions to control which projects deploy.

**Create `.github/workflows/deploy.yml`:**
```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  workflow_dispatch:
    inputs:
      project:
        description: 'Project to deploy'
        required: true
        type: choice
        options:
          - website
          - studio
          - all

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy Website
        if: github.event.inputs.project == 'website' || github.event.inputs.project == 'all' || contains(github.event.head_commit.message, '[deploy:website]')
        run: |
          cd website
          vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
      
      - name: Deploy Studio
        if: github.event.inputs.project == 'studio' || github.event.inputs.project == 'all' || contains(github.event.head_commit.message, '[deploy:studio]')
        run: |
          cd dashboard
          vercel --prod --local-config vercel-studio.json --token ${{ secrets.VERCEL_TOKEN }}
```

**Usage:**
```bash
# Deploy website only
git commit -m "update website [deploy:website]"
git push

# Deploy studio only
git commit -m "update studio [deploy:studio]"
git push

# Deploy all
git commit -m "update all [deploy:all]"
git push
```

## Recommended Approach

**For Your Use Case:** Use **Solution 1** (Ignored Build Step in Dashboard)

**Why:**
- ✅ Simple to set up
- ✅ Works automatically
- ✅ No code changes needed
- ✅ Easy to understand

**Setup Steps:**

1. **Website:** Only deploys when `website/` changes
2. **Studio/Ingest/Control:** Only deploy when `dashboard/` changes
3. **Shared changes:** If you change both folders, both deploy (expected)

## Quick Setup Script

Run this to set up all projects:

```bash
# Set up website (only deploys on website/ changes)
# Go to: https://vercel.com/nivostack/nivostack-website/settings/general
# Set Ignored Build Step: git diff HEAD^ HEAD --quiet -- website/ && exit 0 || exit 1

# Set up studio (only deploys on dashboard/ changes)
# Go to: https://vercel.com/nivostack/nivostack-studio/settings/general
# Set Ignored Build Step: git diff HEAD^ HEAD --quiet -- dashboard/ && exit 0 || exit 1
```

## Testing

**Test Website Only:**
```bash
# Make a change only in website/
echo "test" >> website/test.txt
git add website/test.txt
git commit -m "test: website only"
git push

# Only website should deploy
```

**Test Studio Only:**
```bash
# Make a change only in dashboard/
echo "test" >> dashboard/test.txt
git add dashboard/test.txt
git commit -m "test: studio only"
git push

# Only studio should deploy
```

## Important Notes

1. **Dashboard, Ingest, Control share codebase:**
   - They all use `dashboard/` folder
   - They'll all deploy when `dashboard/` changes
   - This is expected and correct

2. **First deployment after setting ignoreCommand:**
   - Might need to manually trigger first deployment
   - After that, it works automatically

3. **Git context:**
   - Vercel needs access to git history
   - Make sure GitHub connection is working

---

**Last Updated**: December 31, 2024

