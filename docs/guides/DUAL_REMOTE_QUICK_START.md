# 🚀 DUAL REMOTE SETUP - QUICK START

## ✅ Everything is Ready!

All tokens and configuration have been set up. Just follow these steps:

---

## 📋 Your Configuration

```
GitHub Token (Karim):  YOUR_GITHUB_TOKEN_HERE
Vercel Token:          51FK0FgOarNnPGuqyZvlwPPm
Vercel Team:           Mobile-Team
```

---

## 🎯 Step 1: Run the Setup Script (2 minutes)

```bash
cd /Users/karim-f/Code/devbridge

# Make executable
chmod +x setup-dual-remote-simple.sh

# Run it
./setup-dual-remote-simple.sh
```

**When prompted, provide:**
- **Your GitHub username**: (your personal GitHub username - NOT pie-int)
- **Repository name**: `devbridge` (or your preferred name)
- **Private repo?**: `yes`

**The script will:**
1. ✅ Create repo on your GitHub account
2. ✅ Keep `pie-int/dev-bridge` as backup remote named `flooss`
3. ✅ Set your repo as primary remote named `origin`
4. ✅ Push all code (`main` and `develop` branches)
5. ✅ Set up branch protection rules
6. ✅ Configure git to push to your repo by default
7. ✅ Create helper script: `push-to-both.sh`

**Expected output:**
```
🔀 DevBridge Dual Remote Setup
================================

✅ Repository created: https://github.com/YOUR_USERNAME/devbridge
✅ Origin set to Karim's repository
✅ Branches pushed to Karim's repository
✅ Dual Remote Setup Complete!
```

---

## 🎯 Step 2: Configure Vercel (2 minutes) ⚠️ IMPORTANT

### Disconnect Old Repository

1. Go to: https://vercel.com/dashboard
2. Find and select: **devbridge** project
3. Click: **Settings** (left sidebar)
4. Click: **Git** (in settings)
5. Scroll to "Connected Git Repository"
6. Click: **"Disconnect Git Repository"**
7. Confirm the disconnection

### Connect Your New Repository

1. Still in **Settings** → **Git**
2. Click: **"Connect Git Repository"**
3. Choose: **GitHub**
4. Select your repository: **YOUR_USERNAME/devbridge**
   - If you don't see it, click "Adjust GitHub App Permissions"
   - Grant Vercel access to your repository
5. Click **"Connect"**

### Configure Deployment Branches

1. Under "Production Branch":
   - Set to: **`main`**

2. Enable Preview Deployments:
   - Toggle ON: **"Automatically create Preview Deployments"**
   - Add branch: **`develop`**
   - This makes `develop` → preview, `main` → production

### Verify Environment Variables

1. Go to: **Settings** → **Environment Variables**
2. Verify these exist:
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`
   - `JWT_SECRET`
   - (all your existing variables should be preserved)

---

## 🎯 Step 3: Test the Setup (1 minute)

### Test Deployment

```bash
cd /Users/karim-f/Code/devbridge

# Make a test change
echo "# Dual Remote Setup Complete" >> SETUP_COMPLETE.md

# Commit it
git add SETUP_COMPLETE.md
git commit -m "test: verify dual remote deployment"

# Push to YOUR repo (will trigger Vercel)
git push origin develop
```

### Verify in Vercel

1. Go to: https://vercel.com/dashboard
2. Select: **devbridge** project
3. You should see: **New deployment** in progress
4. Source should show: **YOUR_USERNAME/devbridge** (not pie-int)

---

## ✅ After Setup - How It Works

### Git Remotes

```bash
$ git remote -v

origin  https://github.com/YOUR_USERNAME/devbridge.git (primary)
flooss  https://github.com/pie-int/dev-bridge.git (backup)
```

### Push Behavior

```bash
# Default push → YOUR repo (triggers Vercel)
git push

# Push to both remotes
./push-to-both.sh

# Push only to flooss backup
git push flooss develop
```

### Deployment Flow

```
Code Change
    ↓
git push origin develop
    ↓
GitHub (YOUR_USERNAME/devbridge)
    ↓
Vercel Webhook Triggered
    ↓
Preview Deployment Created ✅

---

git push origin main
    ↓
GitHub (YOUR_USERNAME/devbridge)
    ↓
Vercel Webhook Triggered
    ↓
Production Deployment Created ✅

---

git push flooss develop
    ↓
GitHub (pie-int/dev-bridge)
    ↓
No Vercel trigger (backup only)
```

---

## 📚 Daily Workflow

### Normal Development

```bash
# Create feature branch
git checkout develop
git checkout -b feature/my-feature

# Make changes, commit
git add .
git commit -m "feat: my feature"

# Push to YOUR repo (primary)
git push origin feature/my-feature

# Create PR on YOUR repo → triggers Vercel preview
```

### Keep Flooss in Sync

```bash
# After merging to main or develop
git checkout develop
./push-to-both.sh

# This pushes to BOTH:
# - origin (YOUR repo - triggers Vercel)
# - flooss (pie-int repo - backup)
```

### Quick Push to Primary Only

```bash
# Most common - just use regular push
git push

# Goes to 'origin' (YOUR repo) by default
# Triggers Vercel deployment
```

---

## 🆘 Troubleshooting

### Script fails to create repo

**Issue**: "Repository already exists" or API error

**Solution**: 
- That's okay! The script will continue
- Just provide your repo name when prompted
- Or use a different name

### Vercel not deploying

**Checklist**:
1. ✅ Repo is connected in Vercel Settings → Git
2. ✅ Production branch is set to `main`
3. ✅ Preview deployments enabled for `develop`
4. ✅ You pushed to the right remote: `git push origin develop`
5. ✅ Check Vercel dashboard for deployment logs

**Solution**: 
```bash
# Try an empty commit to trigger deployment
git commit --allow-empty -m "chore: trigger deployment"
git push origin develop
```

### Can't push to flooss

**Issue**: Permission denied when pushing to flooss

**Solution**: 
- That's expected if you're not a collaborator on pie-int
- Use `./push-to-both.sh` which handles errors gracefully
- Or just push to origin (your primary repo)
- Flooss is backup only, not required for deployment

### "Branch protection" errors

**Issue**: Can't push directly to main

**Solution**: 
- That's correct behavior! Main is protected
- Always work on `develop` or feature branches
- Use Pull Requests to merge to main

---

## 📖 Reference

### Files Created

- `setup-dual-remote-simple.sh` - Main setup script (run this!)
- `push-to-both.sh` - Helper to push to both remotes
- `DUAL_REMOTE_GUIDE.md` - Detailed usage guide
- `DUAL_REMOTE_QUICK_START.md` - This file

### Important Links

- **Your Repo**: https://github.com/YOUR_USERNAME/devbridge (after setup)
- **Flooss Repo**: https://github.com/pie-int/dev-bridge (backup)
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Vercel Project Settings**: https://vercel.com/YOUR_TEAM/devbridge/settings

### Helper Commands

```bash
# Check remotes
git remote -v

# Check which remote you'll push to
git config remote.pushDefault

# See all branches (local + remote)
git branch -a

# Push to specific remote
git push origin develop    # YOUR repo
git push flooss develop    # Flooss backup

# Push current branch to both
./push-to-both.sh
```

---

## ✅ Summary

**What you're doing:**
- ✅ Creating YOUR own GitHub repo for DevBridge
- ✅ Setting it as primary remote (origin)
- ✅ Keeping pie-int/dev-bridge as backup (flooss)
- ✅ Connecting Vercel to YOUR repo
- ✅ Vercel deploys ONLY from YOUR repo
- ✅ Both repos stay in sync manually via push-to-both.sh

**Why this is better:**
- ✅ You control deployments
- ✅ You own the primary repo
- ✅ Cleaner CI/CD (single source)
- ✅ Backup maintained (flooss)
- ✅ No accidental deployments from wrong repo

**Time required:**
- Step 1 (Script): ~2 minutes
- Step 2 (Vercel): ~2 minutes
- Step 3 (Test): ~1 minute
- **Total: ~5 minutes**

---

## 🎉 Ready to Go!

**Run this command now:**

```bash
cd /Users/karim-f/Code/devbridge
chmod +x setup-dual-remote-simple.sh
./setup-dual-remote-simple.sh
```

Then follow the Vercel configuration steps above!

**Questions?** Check `DUAL_REMOTE_GUIDE.md` for detailed explanations.

