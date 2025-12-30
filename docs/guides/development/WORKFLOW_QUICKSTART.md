# Development & Production Workflow - Quick Start

## 🎯 Summary

We're moving from **"push to main = production"** to a **proper dev/staging/production workflow** to avoid breaking production during development.

---

## 📂 Files Created

1. **`docs/DEV_PRODUCTION_WORKFLOW.md`** - Comprehensive guide (full details)
2. **`scripts/setup-workflow.sh`** - Automated setup script
3. **`docs/WORKFLOW_QUICKSTART.md`** - This file (quick reference)

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Run Setup Script

```bash
cd /Users/karim-f/Code/devbridge
chmod +x scripts/setup-workflow.sh
./scripts/setup-workflow.sh
```

This will:
- ✅ Tag current state as `v1.5.1-baseline`
- ✅ Create `develop` branch
- ✅ Push to GitHub

### Step 2: Configure Vercel (Manual)

1. Go to [Vercel Project Settings](https://vercel.com/flooss-bridge-hub/devbridge/settings/git)
2. Set **Production Branch**: `main`
3. Enable **Preview Deployments** for `develop` branch
4. Add environment variables for staging (Preview scope)

### Step 3: Create Staging Database (Optional but Recommended)

Option A - Separate Database:
```bash
# Create new Postgres DB for staging
# Copy schema from production
pg_dump $PROD_DB | psql $STAGING_DB
```

Option B - Use Same Database (Quick Start):
- Keep using production DB for now
- Switch to separate staging DB later

### Step 4: GitHub Branch Protection

1. Go to [Branch Settings](https://github.com/pie-int/dev-bridge/settings/branches)
2. Add rule for `main`:
   - ✅ Require pull request reviews
   - ✅ Require status checks to pass
3. Add rule for `develop`:
   - ✅ Require pull request reviews

---

## 🔄 New Daily Workflow

### For New Features:

```bash
# 1. Start from develop
git checkout develop
git pull origin develop

# 2. Create feature branch
git checkout -b feature/my-awesome-feature

# 3. Make your changes
# ... code, code, code ...

# 4. Commit and push
git add .
git commit -m "feat: add awesome feature"
git push origin feature/my-awesome-feature

# 5. Create PR to develop (in GitHub)
# - Vercel creates preview deployment
# - Test on preview URL
# - Merge to develop

# 6. Test in staging
# - develop branch auto-deploys to staging
# - Full testing with staging environment

# 7. Create PR: develop → main
# - Final review
# - Merge → deploys to production
```

### For Quick Fixes:

```bash
# Hotfix (goes straight to production)
git checkout main
git pull origin main
git checkout -b hotfix/critical-fix
# ... fix ...
git push origin hotfix/critical-fix
# Create PR to main → merge → deploys
```

---

## 🌍 Environment URLs

After setup:

| Environment | Branch | URL | Database | Purpose |
|-------------|--------|-----|----------|---------|
| **Production** | `main` | `https://devbridge-eta.vercel.app` | Production | Live users |
| **Staging** | `develop` | `https://devbridge-git-develop-*.vercel.app` | Staging | Pre-production testing |
| **Preview** | `feature/*` | `https://devbridge-git-feature-*.vercel.app` | Dev | Feature testing |

---

## 📋 Checklist

**Before First Feature:**
- [ ] Run `./scripts/setup-workflow.sh`
- [ ] Configure Vercel preview deployments
- [ ] (Optional) Create staging database
- [ ] Set up branch protection rules
- [ ] Read `docs/DEV_PRODUCTION_WORKFLOW.md`

**Before Deploying to Production:**
- [ ] Tested in staging environment
- [ ] No TypeScript errors
- [ ] Mobile app compatibility verified
- [ ] Changelog updated
- [ ] PR reviewed and approved

---

## 💡 Key Benefits

**Before:**
- ❌ Every commit goes to production
- ❌ Testing in production
- ❌ No rollback strategy

**After:**
- ✅ Test in staging first
- ✅ Safe experimentation
- ✅ Easy rollback
- ✅ Multiple environments
- ✅ Code review process

---

## 🆘 Common Questions

**Q: Can I still push directly to main?**  
A: No (after branch protection). You'll create PRs instead.

**Q: What if I need to deploy something urgent?**  
A: Use hotfix workflow - branch from main, create PR, merge quickly.

**Q: Do I need a separate staging database?**  
A: Recommended but not required initially. You can start with the same DB.

**Q: What happens to my current work?**  
A: Nothing! Everything continues working. Just use develop branch going forward.

---

## 📚 Full Documentation

See **`docs/DEV_PRODUCTION_WORKFLOW.md`** for:
- Detailed setup instructions
- Branch protection configuration
- Database setup options
- Rollback procedures
- Best practices
- Troubleshooting

---

**Ready to start?** Run `./scripts/setup-workflow.sh` now! 🚀

