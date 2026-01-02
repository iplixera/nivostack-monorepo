# DevBridge Development & Production Workflow

## 🎯 Current Situation

**Problem**: We've been working directly on `main` branch and deploying to production immediately. This means:
- ❌ Every change goes live instantly
- ❌ Testing happens in production
- ❌ Can't experiment without affecting users
- ❌ No rollback strategy

**Solution**: Implement a proper dev/staging/production workflow.

---

## 🏗️ Proposed Workflow Structure

### **Option 1: Branch-Based (Recommended)**

```
main (production)
  ↑
  | Pull Request
  |
develop (staging)
  ↑
  | Pull Request
  |
feature/* (development)
```

### **Option 2: Environment-Based**

```
production (main branch) → Vercel Production
  ↑
  | Manual Promotion
  |
staging (develop branch) → Vercel Preview
  ↑
  | Auto Deploy
  |
development (feature branches) → Local
```

---

## 📋 Recommended Setup (Option 1 + Vercel)

### **1. Git Branch Strategy**

#### **Branches:**
```bash
main              # Production-ready code only
├── develop       # Integration branch (staging)
├── feature/*     # New features
├── bugfix/*      # Bug fixes
└── hotfix/*      # Emergency production fixes
```

#### **Workflow:**
1. **Feature Development**: Create `feature/tracking-improvements` from `develop`
2. **Testing**: Merge to `develop` → auto-deploys to staging
3. **Production**: Merge `develop` to `main` via PR → deploys to production

---

### **2. Vercel Environment Setup**

#### **A. Production Environment**
- **Branch**: `main`
- **URL**: `https://devbridge-eta.vercel.app`
- **Database**: Production PostgreSQL
- **Purpose**: Live app for real users
- **Deployment**: Manual (via PR merge)

#### **B. Staging Environment**
- **Branch**: `develop`
- **URL**: `https://devbridge-staging.vercel.app` (or preview URL)
- **Database**: Staging PostgreSQL (separate)
- **Purpose**: Pre-production testing
- **Deployment**: Auto-deploy on push to `develop`

#### **C. Development Environment**
- **Branch**: `feature/*` branches
- **URL**: Vercel preview URLs
- **Database**: Local or shared dev database
- **Purpose**: Feature development and testing
- **Deployment**: Auto-preview on PR creation

---

## 🚀 Implementation Steps

### **Step 1: Create Branch Structure**

```bash
# 1. Create develop branch from main
git checkout main
git pull origin main
git checkout -b develop
git push origin develop

# 2. Protect branches in GitHub
# Go to: Settings → Branches → Branch protection rules
# - Protect: main, develop
# - Require: Pull request reviews, status checks

# 3. Set develop as default branch for new PRs
# Go to: Settings → General → Default branch → develop
```

### **Step 2: Vercel Configuration**

#### **A. Create Staging Environment**

1. **Go to Vercel Dashboard** → Your Project → Settings → Git
2. **Production Branch**: `main`
3. **Enable Preview Deployments**: Yes
4. **Deploy hooks**: 
   - `main` → Production
   - `develop` → Preview (label as "Staging")
   - `feature/*` → Preview

#### **B. Environment Variables**

```env
# Production (.env.production)
POSTGRES_PRISMA_URL=production-db-url
POSTGRES_URL_NON_POOLING=production-db-direct-url
JWT_SECRET=production-secret-xyz
NODE_ENV=production

# Staging (.env.staging)
POSTGRES_PRISMA_URL=staging-db-url
POSTGRES_URL_NON_POOLING=staging-db-direct-url
JWT_SECRET=staging-secret-abc
NODE_ENV=staging

# Development (.env.local)
POSTGRES_PRISMA_URL=dev-db-url
POSTGRES_URL_NON_POOLING=dev-db-direct-url
JWT_SECRET=dev-secret-123
NODE_ENV=development
```

#### **C. Vercel Environment Setup**

```bash
# In Vercel Dashboard → Settings → Environment Variables

# For Production:
- Set variables with scope: Production

# For Staging (Preview):
- Set variables with scope: Preview (develop branch)

# For Development:
- Set variables with scope: Preview (all other branches)
```

### **Step 3: Database Strategy**

#### **Option A: Separate Databases (Recommended)**
```
Production DB  ← main branch
Staging DB     ← develop branch  
Dev DB (Local) ← feature branches
```

**Pros**: Complete isolation, no risk to production data  
**Cons**: Need to maintain multiple databases

#### **Option B: Shared Dev DB with Production Replica**
```
Production DB  ← main branch (real data)
Dev DB         ← develop + feature branches (test data)
```

**Pros**: Simpler setup  
**Cons**: Less realistic staging environment

---

## 🔄 Daily Development Workflow

### **For New Features:**

```bash
# 1. Start from develop
git checkout develop
git pull origin develop

# 2. Create feature branch
git checkout -b feature/new-tracking-settings

# 3. Make changes
# ... code changes ...

# 4. Commit and push
git add .
git commit -m "feat: add new tracking settings"
git push origin feature/new-tracking-settings

# 5. Create Pull Request to develop
# - GitHub will create preview deployment
# - Test on preview URL
# - Get review
# - Merge to develop

# 6. Test on staging (develop branch)
# - Auto-deployed to staging URL
# - Full testing with staging database
# - Verify everything works

# 7. Create Pull Request: develop → main
# - Final review
# - Merge to main
# - Auto-deploys to production
```

### **For Hotfixes:**

```bash
# 1. Branch from main (not develop!)
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug

# 2. Fix the bug
# ... fix code ...

# 3. Commit and push
git add .
git commit -m "fix: critical tracking validation"
git push origin hotfix/critical-bug

# 4. Create PR to main
# - Fast-track review
# - Merge to main → deploys immediately

# 5. Merge main back to develop
git checkout develop
git merge main
git push origin develop
```

---

## 📊 Comparison Table

| Aspect | Current (No Workflow) | Proposed Workflow |
|--------|----------------------|-------------------|
| **Testing** | In production | In staging first |
| **Rollback** | Manual revert | Git revert + redeploy |
| **Experiments** | Risky | Safe in dev/staging |
| **Collaboration** | Direct pushes | Pull requests + reviews |
| **Safety** | Low | High |
| **Speed** | Fast but risky | Slightly slower but safe |

---

## 🛡️ Safety Measures

### **1. Branch Protection Rules**

```yaml
# main branch
- Require pull request reviews (1+)
- Require status checks to pass
- Require linear history
- Do not allow force pushes
- Do not allow deletions

# develop branch
- Require pull request reviews (1+)
- Require status checks to pass
- Allow force pushes (with care)
```

### **2. Pre-deployment Checks**

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - name: Install dependencies
        run: pnpm install
      - name: Type check
        run: pnpm exec tsc --noEmit
      - name: Lint
        run: pnpm run lint
      - name: Build
        run: pnpm run build
```

### **3. Deployment Checklist**

**Before Merging to Main:**
- [ ] Tested in staging environment
- [ ] Database migrations tested
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Performance tested
- [ ] Mobile app compatibility verified
- [ ] Changelog updated
- [ ] Documentation updated

---

## 🎯 Migration Plan (From Current State)

### **Phase 1: Set Up Branches (Today)**
```bash
# 1. Tag current main as baseline
git tag -a v1.5.1-baseline -m "Baseline before workflow change"
git push origin v1.5.1-baseline

# 2. Create develop branch
git checkout -b develop
git push origin develop

# 3. Update local repo
git fetch --all
```

### **Phase 2: Configure Vercel (Today)**
1. Add staging environment in Vercel
2. Set up environment variables per environment
3. Test preview deployments

### **Phase 3: Set Up Staging Database (This Week)**
1. Create new database for staging
2. Copy schema from production
3. Add test data
4. Update environment variables

### **Phase 4: Establish Workflow (Ongoing)**
1. Document workflow in README
2. Train team on new process
3. Set up branch protection rules
4. Create PR templates

---

## 📝 Quick Reference

### **When to Use Each Branch:**

| Task | Branch | Deploy To |
|------|--------|-----------|
| New feature | `feature/name` | Vercel preview |
| Bug fix | `bugfix/name` | Vercel preview |
| Testing | `develop` | Staging |
| Production release | `main` | Production |
| Emergency fix | `hotfix/name` | Main (fast) |

### **Common Commands:**

```bash
# Start new feature
git checkout develop && git pull && git checkout -b feature/my-feature

# Update feature with latest develop
git checkout develop && git pull
git checkout feature/my-feature && git merge develop

# Deploy to staging
git checkout develop && git merge feature/my-feature && git push

# Deploy to production
# Create PR: develop → main in GitHub, then merge

# Rollback production
git checkout main
git revert HEAD  # or specific commit
git push origin main  # Vercel auto-deploys
```

---

## 🔍 Monitoring & Rollback

### **Vercel Deployment URLs:**
```
Production:  https://devbridge-eta.vercel.app
Staging:     https://devbridge-git-develop-yourteam.vercel.app
Feature PR:  https://devbridge-git-feature-xyz-yourteam.vercel.app
```

### **Quick Rollback:**
```bash
# Option 1: Git revert (preferred)
git checkout main
git revert HEAD
git push origin main

# Option 2: Redeploy previous version in Vercel
# Vercel Dashboard → Deployments → Click previous → Promote

# Option 3: Roll back in Vercel UI
# Deployments → ... → Instant Rollback
```

---

## ✅ Next Steps

**Immediate (Today):**
1. [ ] Create `develop` branch
2. [ ] Push current state to `develop`
3. [ ] Configure Vercel for preview deployments

**Short-term (This Week):**
1. [ ] Set up staging database
2. [ ] Configure environment variables
3. [ ] Test staging deployment
4. [ ] Document workflow for team

**Ongoing:**
1. [ ] Use feature branches for all new work
2. [ ] Test in staging before production
3. [ ] Maintain changelog
4. [ ] Monitor production deployments

---

## 🎓 Best Practices

1. **Never push directly to main**
2. **Always test in staging first**
3. **Write descriptive commit messages**
4. **Keep PRs small and focused**
5. **Review before merging**
6. **Tag production releases** (`git tag v1.6.0`)
7. **Update changelog with each release**
8. **Back up production database regularly**

---

## 📚 Resources

- [Vercel Preview Deployments](https://vercel.com/docs/concepts/deployments/preview-deployments)
- [Git Branching Strategy](https://nvie.com/posts/a-successful-git-branching-model/)
- [GitHub Branch Protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches)

---

**Last Updated**: December 22, 2025  
**Version**: 1.0  
**Author**: DevBridge Team

