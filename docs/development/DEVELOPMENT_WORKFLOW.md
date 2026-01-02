# Development Workflow Guide

## 🎯 Overview

This document outlines the development workflow for the DevBridge project using Git Flow methodology with automated Vercel deployments.

## 🌳 Branch Strategy

```
main (production)
  ├── develop (staging)
      ├── feature/user-auth
      ├── feature/new-dashboard
      ├── bugfix/login-error
      └── hotfix/critical-bug
```

### Branch Roles

| Branch | Purpose | Auto-Deploy | URL |
|--------|---------|-------------|-----|
| `main` | Production code | ✅ Yes | `devbridge-devbridge.vercel.app` |
| `develop` | Staging/integration | ✅ Yes | `devbridge-git-develop-devbridge.vercel.app` |
| `feature/*` | New features | ✅ Yes | `devbridge-git-feature-*-devbridge.vercel.app` |
| `bugfix/*` | Bug fixes | ✅ Yes | `devbridge-git-bugfix-*-devbridge.vercel.app` |
| `hotfix/*` | Critical production fixes | ✅ Yes | `devbridge-git-hotfix-*-devbridge.vercel.app` |

---

## 📋 Workflow Scenarios

### Scenario 1: New Feature Development

**Example**: Adding a "User Profile" feature

#### Step 1: Create Feature Branch
```bash
# Always start from latest develop
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/user-profile
```

#### Step 2: Develop & Commit
```bash
# Make your changes
# ...

# Commit changes
git add .
git commit -m "feat: add user profile page with edit functionality"

# Push to GitHub
git push origin feature/user-profile
```

**Result**: 
- ✅ Vercel creates preview deployment automatically
- 🔗 Preview URL: `devbridge-git-feature-user-profile-devbridge.vercel.app`
- 🧪 Test feature in isolation
- 📝 Share URL with team for review

#### Step 3: Create PR to Develop
```bash
# On GitHub, create Pull Request:
# feature/user-profile → develop
```

**PR Checklist**:
- [ ] Code reviewed by team member
- [ ] Tests pass
- [ ] No linter errors
- [ ] Preview deployment tested
- [ ] Documentation updated

#### Step 4: Merge to Develop
```bash
# After approval, merge PR on GitHub
# OR via command line:
git checkout develop
git pull origin develop
git merge feature/user-profile
git push origin develop
```

**Result**:
- ✅ Vercel updates **staging** environment automatically
- 🔗 Staging URL: `devbridge-git-develop-devbridge.vercel.app`
- 🧪 Integration testing with other features
- 🗑️ Delete feature branch: `git branch -d feature/user-profile`

#### Step 5: Deploy to Production
```bash
# After staging testing passes, create PR:
# develop → main
```

**PR Checklist**:
- [ ] All features tested on staging
- [ ] QA approval
- [ ] Database migrations ready (if any)
- [ ] Environment variables verified
- [ ] Rollback plan documented

```bash
# Merge to main
git checkout main
git pull origin main
git merge develop
git push origin main
```

**Result**:
- ✅ Vercel deploys to **production** automatically
- 🔗 Production URL: `devbridge-devbridge.vercel.app`
- 🚀 Live to users!

---

### Scenario 2: Bug Fix

**Example**: Fixing login redirect issue

#### Step 1: Create Bugfix Branch
```bash
git checkout develop
git pull origin develop
git checkout -b bugfix/login-redirect
```

#### Step 2: Fix & Test
```bash
# Fix the bug
git add .
git commit -m "fix: correct login redirect to dashboard"
git push origin bugfix/login-redirect
```

**Result**: Preview deployment created

#### Step 3: Merge to Develop → Main
Follow same PR process as features

---

### Scenario 3: Hotfix (Critical Production Bug)

**Example**: Critical API key validation bug in production

#### Step 1: Create Hotfix from Main
```bash
# Hotfixes branch from main, not develop!
git checkout main
git pull origin main
git checkout -b hotfix/api-key-validation
```

#### Step 2: Fix Immediately
```bash
# Fix the critical bug
git add .
git commit -m "hotfix: fix API key validation bypass"
git push origin hotfix/api-key-validation
```

**Result**: Preview deployment for testing

#### Step 3: Merge to Main (Production)
```bash
# Create PR: hotfix/api-key-validation → main
# Fast-track review and merge
git checkout main
git merge hotfix/api-key-validation
git push origin main
```

**Result**: Production deployed immediately

#### Step 4: Merge to Develop (Keep in Sync)
```bash
# IMPORTANT: Merge hotfix to develop too!
git checkout develop
git merge hotfix/api-key-validation
git push origin develop

# Delete hotfix branch
git branch -d hotfix/api-key-validation
```

---

## 🚀 Deployment Timeline

| Action | Vercel Build Time | Total Time |
|--------|-------------------|------------|
| Push to feature branch | ~2-3 min | Immediate |
| Merge to `develop` | ~2-3 min | Immediate |
| Merge to `main` | ~2-3 min | Immediate |

---

## 🔄 Quick Commands Reference

### Starting New Work
```bash
# Feature
git checkout develop && git pull && git checkout -b feature/name

# Bugfix
git checkout develop && git pull && git checkout -b bugfix/name

# Hotfix
git checkout main && git pull && git checkout -b hotfix/name
```

### Committing Changes
```bash
git add .
git commit -m "type: description"
git push origin branch-name
```

**Commit Types**:
- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactoring
- `docs:` - Documentation
- `test:` - Tests
- `chore:` - Maintenance
- `perf:` - Performance improvement

### Creating PRs
```bash
# On GitHub:
# 1. Go to https://github.com/ikarimmagdy/devbridge/pulls
# 2. Click "New Pull Request"
# 3. Select branches: [your-branch] → [target-branch]
# 4. Fill in description
# 5. Request reviewers
# 6. Wait for approval
# 7. Merge!
```

### Cleaning Up
```bash
# Delete local branch
git branch -d branch-name

# Delete remote branch
git push origin --delete branch-name

# Prune deleted remote branches
git fetch --prune
```

---

## 🎨 AI Assistant Workflow

When you request a new feature from the AI assistant, here's what happens:

### 1️⃣ Create Feature Branch
```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

### 2️⃣ Implement Feature
- AI makes code changes
- Commits changes locally
- Pushes to GitHub

### 3️⃣ Preview Deployment
- Vercel automatically deploys
- AI provides preview URL
- You test the feature

### 4️⃣ Review & Merge
- You review the changes
- Create PR to `develop`
- Test on staging
- Merge to `main` when ready

---

## 🛡️ Branch Protection Rules

### Main Branch
- ✅ Require pull request reviews (1 reviewer)
- ✅ Dismiss stale reviews on new push
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ❌ No direct pushes (except emergencies)

### Develop Branch
- ✅ Require pull request reviews (optional)
- ✅ Require status checks to pass
- ⚠️ Allow force push for maintainers

---

## 📊 Example Timeline

**Monday 9 AM**: Start new feature
```bash
git checkout -b feature/analytics-dashboard
# ... develop ...
git push origin feature/analytics-dashboard
```
- Preview: `devbridge-git-feature-analytics-dashboard-devbridge.vercel.app`

**Monday 5 PM**: Create PR to develop
- Review by team
- Merge approved

**Tuesday 10 AM**: Staging testing
- Test on `devbridge-git-develop-devbridge.vercel.app`
- QA approval

**Tuesday 2 PM**: Deploy to production
```bash
# PR: develop → main
git checkout main
git merge develop
git push origin main
```
- Live on `devbridge-devbridge.vercel.app` 🚀

---

## 🚨 Troubleshooting

### Deployment Not Triggering
```bash
# Check Vercel project is connected
vercel link --token=YOUR_TOKEN

# Manually trigger deployment
vercel deploy --prod --token=YOUR_TOKEN
```

### Merge Conflicts
```bash
# Update your branch with latest develop
git checkout your-branch
git fetch origin
git merge origin/develop

# Resolve conflicts
# ...

git add .
git commit -m "chore: resolve merge conflicts"
git push origin your-branch
```

### Rollback Production
```bash
# Find previous commit
git log --oneline

# Create hotfix to revert
git checkout main
git checkout -b hotfix/rollback-feature
git revert <commit-hash>
git push origin hotfix/rollback-feature

# Fast-track PR to main
```

Or use Vercel:
1. Go to Vercel dashboard
2. Select deployment to rollback to
3. Click "Promote to Production"

---

## 📚 Additional Resources

- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)
- [Vercel Git Integration](https://vercel.com/docs/deployments/git)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

## ✅ Checklist for Each Release

### Before Merging to Main
- [ ] All tests pass
- [ ] Code reviewed and approved
- [ ] Feature tested on staging
- [ ] Database migrations tested
- [ ] Environment variables verified
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Performance tested (if applicable)
- [ ] Security reviewed (if applicable)
- [ ] Rollback plan documented

### After Merging to Main
- [ ] Verify production deployment
- [ ] Smoke test critical features
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Notify team of deployment
- [ ] Tag release: `git tag v1.x.x && git push --tags`
- [ ] Close related issues
- [ ] Update project board

---

**Last Updated**: December 23, 2025
**Version**: 1.0.0

