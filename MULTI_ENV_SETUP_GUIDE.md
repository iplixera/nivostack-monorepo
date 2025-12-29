# ✅ COMPLETE MULTI-ENVIRONMENT SETUP

## 🎯 What I've Created For You

I've prepared complete automation scripts to:
1. ✅ Verify Git remotes and branches  
2. ✅ Connect Vercel to ikarimmagdy/devbridge
3. ✅ Set up GitHub branch protection
4. ✅ Test push and deployment
5. ✅ Configure multi-environment workflow

---

## 🚀 EXECUTE THIS COMMAND

```bash
cd /Users/karim-f/Code/devbridge
bash setup-multi-env.sh
```

**This script will:**
- ✅ Verify your git configuration
- ✅ Connect Vercel to your repository
- ✅ Protect main and develop branches on GitHub
- ✅ Create test commit
- ✅ Push to develop (triggers preview deployment)
- ✅ Verify everything is working

---

## 📋 WHAT IT SETS UP

### 1. Git Configuration
```
origin → ikarimmagdy/devbridge (primary)
flooss → pie-int/dev-bridge (backup)

Branches:
- main (production)
- develop (staging)
```

### 2. Vercel Configuration
```
Project: devbridge
Team: Mobile-Team
Repository: ikarimmagdy/devbridge

Production: main → devbridge-eta.vercel.app
Preview: develop → auto-generated-url
```

### 3. GitHub Branch Protection
```
main:
- No force pushes
- No deletions
- Linear history required

develop:
- No force pushes
- No deletions
```

### 4. Deployment Flow
```
develop branch:
  git push origin develop
  → Triggers Vercel preview deployment
  → URL: devbridge-git-develop-[team].vercel.app

main branch:
  git push origin main
  → Triggers Vercel production deployment
  → URL: devbridge-eta.vercel.app
```

---

## 🔍 VERIFICATION STEPS

### 1. Verify Git Setup

```bash
cd /Users/karim-f/Code/devbridge

# Check remotes
git remote -v

# Should show:
# origin  https://github.com/ikarimmagdy/devbridge.git
# flooss  https://github.com/pie-int/dev-bridge.git

# Check branches
git branch -a

# Should show:
# * develop
#   main
#   remotes/origin/develop
#   remotes/origin/main
```

### 2. Verify Vercel Connection

**Via Dashboard:**
1. Go to: https://vercel.com/dashboard
2. Select: devbridge project
3. Go to: Settings → Git
4. Should show: **ikarimmagdy/devbridge** ✅

**Via API:**
```bash
curl -s -H "Authorization: Bearer 51FK0FgOarNnPGuqyZvlwPPm" \
  "https://api.vercel.com/v9/projects/prj_5ktKrMgNxR1UgkfBLpufZl348Jvz?teamId=team_MBPi3LRUH16KWHeCO2JAQtxs" \
  | grep -o '"repo":"[^"]*"'

# Should output: "repo":"ikarimmagdy/devbridge"
```

### 3. Verify GitHub Branches

**Via Browser:**
- Go to: https://github.com/ikarimmagdy/devbridge
- Should see: main and develop branches
- Check: Settings → Branches → Branch protection rules

**Via API:**
```bash
curl -s -H "Authorization: token YOUR_GITHUB_TOKEN_HERE" \
  "https://api.github.com/repos/ikarimmagdy/devbridge/branches" \
  | grep '"name"'

# Should list: main, develop
```

### 4. Test Deployment

```bash
cd /Users/karim-f/Code/devbridge

# Make a test change
echo "# Test Deployment - $(date)" > TEST_DEPLOY_$(date +%s).md

# Commit
git add .
git commit -m "test: verify multi-environment deployment"

# Push to develop (triggers preview)
git push origin develop

# Check Vercel dashboard
open https://vercel.com/mobile-team/devbridge
```

---

## 🎯 MULTI-ENVIRONMENT WORKFLOW

### Development Workflow

```bash
# 1. Create feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/my-feature

# 2. Make changes and commit
git add .
git commit -m "feat: my feature"

# 3. Push feature branch
git push origin feature/my-feature

# 4. Create PR to develop on GitHub
# This creates a preview deployment automatically

# 5. After PR approval, merge to develop
# This updates the develop preview deployment

# 6. When ready for production, create PR from develop to main
# After approval and merge, production deploys automatically
```

### Quick Push Commands

```bash
# Push to develop (preview deployment)
git checkout develop
git push origin develop

# Push to main (production deployment)  
git checkout main
git push origin main

# Push to both remotes (your repo + flooss backup)
./push-to-both.sh
```

---

## 📊 ENVIRONMENT MATRIX

| Branch | Environment | URL | Auto-Deploy | Database |
|--------|-------------|-----|-------------|----------|
| `main` | Production | devbridge-eta.vercel.app | ✅ Yes | Production DB |
| `develop` | Staging | devbridge-git-develop-*.vercel.app | ✅ Yes | Production DB |
| `feature/*` | Preview | devbridge-git-feature-*.vercel.app | ✅ Yes (on PR) | Production DB |

**Note:** Currently all environments use the same database. If you need separate databases, we can configure that.

---

## 🔧 MANUAL COMMANDS (If Automation Fails)

### Connect Vercel

```bash
curl -X POST \
  -H "Authorization: Bearer 51FK0FgOarNnPGuqyZvlwPPm" \
  -H "Content-Type: application/json" \
  "https://api.vercel.com/v1/projects/prj_5ktKrMgNxR1UgkfBLpufZl348Jvz/link?teamId=team_MBPi3LRUH16KWHeCO2JAQtxs" \
  -d '{"type":"github","repo":"ikarimmagdy/devbridge"}'
```

### Set Production Branch

```bash
curl -X PATCH \
  -H "Authorization: Bearer 51FK0FgOarNnPGuqyZvlwPPm" \
  -H "Content-Type: application/json" \
  "https://api.vercel.com/v9/projects/prj_5ktKrMgNxR1UgkfBLpufZl348Jvz?teamId=team_MBPi3LRUH16KWHeCO2JAQtxs" \
  -d '{"productionBranch":"main"}'
```

### Protect Branches

```bash
# Protect main
curl -X PUT \
  -H "Authorization: token YOUR_GITHUB_TOKEN_HERE" \
  -H "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/repos/ikarimmagdy/devbridge/branches/main/protection" \
  -d '{"required_linear_history":true,"allow_force_pushes":false,"allow_deletions":false}'

# Protect develop
curl -X PUT \
  -H "Authorization: token YOUR_GITHUB_TOKEN_HERE" \
  -H "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/repos/ikarimmagdy/devbridge/branches/develop/protection" \
  -d '{"required_linear_history":false,"allow_force_pushes":false,"allow_deletions":false}'
```

---

## ✅ VERIFICATION CHECKLIST

### Git Setup
- [ ] Run: `git remote -v`
- [ ] Verify: origin → ikarimmagdy/devbridge
- [ ] Verify: flooss → pie-int/dev-bridge
- [ ] Run: `git branch -a`
- [ ] Verify: main and develop branches exist

### Vercel Setup
- [ ] Open: https://vercel.com/dashboard
- [ ] Select: devbridge project
- [ ] Go to: Settings → Git
- [ ] Verify: Shows ikarimmagdy/devbridge
- [ ] Verify: Production branch is main

### GitHub Setup
- [ ] Open: https://github.com/ikarimmagdy/devbridge
- [ ] Verify: Repository exists
- [ ] Verify: main and develop branches exist
- [ ] Go to: Settings → Branches
- [ ] Verify: Branch protection rules exist

### Deployment Test
- [ ] Make test commit
- [ ] Run: `git push origin develop`
- [ ] Check: https://vercel.com/dashboard
- [ ] Verify: New deployment appears
- [ ] Verify: Source shows ikarimmagdy/devbridge
- [ ] Verify: Branch shows develop

---

## 🎉 EXPECTED RESULTS

After running `bash setup-multi-env.sh`, you should see:

```
🚀 Complete Multi-Environment Setup
====================================

📦 Part 1: Verifying Git Configuration
✅ Git configured

🔗 Part 2: Connecting Vercel to ikarimmagdy/devbridge
✅ Repository linked
✅ Vercel configured

🛡️  Part 3: Setting up GitHub Branch Protection
✅ Main branch protected
✅ Develop branch protected

🧪 Part 4: Testing Push & Deployment
✅ Pushed to develop

🔍 Part 5: Verifying Setup
✅ Vercel linked to: ikarimmagdy/devbridge
✅ Production branch: main

════════════════════════════════════════
✅ MULTI-ENVIRONMENT SETUP COMPLETE!
════════════════════════════════════════
```

---

## 📚 QUICK REFERENCE

### Daily Commands

```bash
# Work on feature
git checkout develop
git pull origin develop
git checkout -b feature/my-feature
# ... make changes ...
git push origin feature/my-feature

# Deploy to staging
git checkout develop
git push origin develop

# Deploy to production
git checkout main
git merge develop
git push origin main

# Sync both remotes
./push-to-both.sh
```

### URLs

- **GitHub Repo:** https://github.com/ikarimmagdy/devbridge
- **Vercel Dashboard:** https://vercel.com/mobile-team/devbridge
- **Production URL:** https://devbridge-eta.vercel.app
- **Develop Preview:** https://vercel.com/mobile-team/devbridge (check deployments)

---

## 🚀 READY TO EXECUTE!

**Run this command now:**

```bash
cd /Users/karim-f/Code/devbridge
bash setup-multi-env.sh
```

**Then verify everything is working by checking:**
1. Vercel dashboard shows ikarimmagdy/devbridge
2. GitHub has both branches with protection
3. Test push triggers deployment

**Total setup time: ~2 minutes** ⚡

---

**Everything is automated and ready to go!** 🎉

