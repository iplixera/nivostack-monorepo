# 🔀 Dual Remote Configuration - Quick Guide

## Overview

Your DevBridge project now has **TWO** Git remotes:

1. **`origin`** (Primary) → Karim's Personal Account
   - URL: `https://github.com/YOUR_USERNAME/devbridge`
   - **Triggers Vercel deployments** ✅
   - Default push target
   - Branch protected

2. **`flooss`** (Backup) → Flooss Organization
   - URL: `https://github.com/pie-int/dev-bridge`
   - Backup/mirror only
   - No Vercel triggers
   - Kept for history/backup

---

## Quick Start

### Run the Setup Script

```bash
cd /Users/karim-f/Code/devbridge

# Make executable
chmod +x setup-dual-remote.sh

# Run it (will prompt for your GitHub username)
./setup-dual-remote.sh
```

**What it does**:
1. ✅ Creates new repo on your GitHub account
2. ✅ Renames current `origin` to `flooss`
3. ✅ Sets your repo as new `origin`
4. ✅ Pushes all code and branches
5. ✅ Sets up branch protection
6. ✅ Configures default push behavior
7. ✅ Creates helper scripts

---

## Daily Workflow

### Normal Push (to Karim's repo only)

```bash
# Regular push - goes to origin (Karim) by default
git push

# Or explicitly
git push origin main
git push origin develop
```

### Push to Both Remotes

```bash
# Use the helper script
./push-to-both.sh

# This pushes current branch to both:
# - origin (Karim)
# - flooss (backup)
```

### Push Only to Flooss

```bash
git push flooss main
git push flooss develop
```

### Check Your Remotes

```bash
# List all remotes
git remote -v

# Should show:
# origin  https://github.com/YOUR_USERNAME/devbridge.git (fetch)
# origin  https://github.com/YOUR_USERNAME/devbridge.git (push)
# flooss  https://github.com/pie-int/dev-bridge.git (fetch)
# flooss  https://github.com/pie-int/dev-bridge.git (push)
```

---

## Vercel Configuration

### Step 1: Disconnect Old Repo

1. Go to: https://vercel.com/dashboard
2. Select your **devbridge** project
3. Go to **Settings** → **Git**
4. Click **"Disconnect Git Repository"**
5. Confirm disconnection

### Step 2: Connect Karim's Repo

1. Still in **Settings** → **Git**
2. Click **"Connect Git Repository"**
3. Choose **GitHub**
4. Select: **YOUR_USERNAME/devbridge**
5. Authorize access if prompted

### Step 3: Configure Branches

1. **Production Branch**: `main`
2. **Preview Deployments**: Enable
3. **Deploy on Push**: ✅ Enabled
4. **Preview Branch**: `develop`

### Step 4: Environment Variables

All your current environment variables are preserved:
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `JWT_SECRET`
- etc.

No changes needed!

---

## Branch Strategy

```
main (production)      → Auto-deploys to Vercel Production
  ↓
develop (staging)      → Auto-deploys to Vercel Preview
  ↓
feature/* (dev)        → Creates preview deployment on PR
```

**Both remotes** will have the same branches, but only **origin (Karim)** triggers Vercel.

---

## Common Commands

```bash
# Check which remote you're on
git remote show origin

# Fetch from both remotes
git fetch --all

# Push current branch to origin
git push

# Push to specific remote
git push origin main
git push flooss main

# Push to both
./push-to-both.sh

# Pull from origin
git pull origin develop

# Pull from flooss
git pull flooss develop

# See all branches (local and remote)
git branch -a
```

---

## Helper Scripts

### `push-to-both.sh`

Automatically created by setup. Pushes current branch to both remotes:

```bash
./push-to-both.sh

# Output:
# Pushing develop to both remotes...
# → Pushing to origin (Karim)...
# → Pushing to flooss (backup)...
# ✅ Pushed to both remotes!
```

---

## Troubleshooting

### "Push to origin failed"

Check your token hasn't expired:
```bash
git remote set-url origin https://YOUR_TOKEN@github.com/YOUR_USERNAME/devbridge.git
```

### "Vercel not deploying"

1. Check Vercel is connected to Karim's repo
2. Check branch name matches (main or develop)
3. Check deployment logs in Vercel dashboard

### "Can't push to flooss"

Flooss repo might be protected. That's okay - origin is your primary.

### "Want to switch default remote"

```bash
# Make flooss the default
git config remote.pushDefault flooss

# Switch back to origin
git config remote.pushDefault origin
```

---

## Security Notes

🔒 **Token Storage**:
- Your GitHub token is embedded in the git remote URL
- Stored in `.git/config` (not committed)
- Keep `.git/` in `.gitignore`

🔒 **Access Control**:
- Karim's repo: You have full access
- Flooss repo: You may have limited access (read-only or collaborator)

---

## Deployment Flow

### Before (Single Remote)

```
Code → pie-int/dev-bridge → Vercel
```

### After (Dual Remote)

```
Code → Karim's repo (origin) → Vercel ✅
  └──→ Flooss repo (flooss) → Backup only
```

**Result**: 
- Vercel only watches Karim's repo
- Flooss repo is backup/archive
- Both stay in sync via `push-to-both.sh`

---

## Quick Reference Card

| Action | Command |
|--------|---------|
| **Push to primary** | `git push` |
| **Push to both** | `./push-to-both.sh` |
| **Push to flooss only** | `git push flooss` |
| **Check remotes** | `git remote -v` |
| **Fetch all** | `git fetch --all` |
| **See branches** | `git branch -a` |
| **Current remote** | `git remote show origin` |

---

## What's Protected

### Karim's Repo (origin)

✅ **main** branch:
- Requires PR reviews (1 approver)
- No force pushes
- No deletions
- Linear history

✅ **develop** branch:
- Requires PR reviews (1 approver)
- No force pushes
- No deletions

### Flooss Repo (flooss)

- Depends on Flooss organization settings
- Usually protected, you may need PR approval

---

## Need Help?

### Check Setup Status

```bash
# See current remotes
git remote -v

# See remote details
git remote show origin
git remote show flooss

# See branches on origin
git branch -r | grep origin

# See branches on flooss
git branch -r | grep flooss
```

### Re-run Setup

If something goes wrong:

```bash
# Remove and re-run
rm -f .dual-remote-config
./setup-dual-remote.sh
```

---

## Summary

✅ **Karim's repo** = Primary (triggers Vercel)  
✅ **Flooss repo** = Backup (no triggers)  
✅ **Default push** = origin (Karim)  
✅ **Helper script** = push-to-both.sh  
✅ **Branch protection** = Enabled on both  
✅ **Vercel deploys** = Only from Karim's repo  

---

**Ready to run the setup!** 🚀

Execute: `./setup-dual-remote.sh`

