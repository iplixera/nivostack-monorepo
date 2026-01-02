# Scripts Directory

This directory contains all project scripts organized by category.

## 📁 Script Categories

### [setup/](./setup/)
Setup and initialization scripts for repository and environment configuration.

**Common scripts:**
- `setup-new-repo.sh` - Initialize new repository
- `setup-dual-remote.sh` - Configure dual remote setup
- `verify-setup.sh` - Verify repository setup
- `check-env.sh` - Check environment configuration

### [deployment/](./deployment/)
Deployment and production release scripts.

**Common scripts:**
- `deploy.sh` - Deploy to production
- `trigger-deployment.sh` - Trigger Vercel deployment
- `complete-vercel-setup.sh` - Complete Vercel configuration

### [git/](./git/)
Git workflow, branch management, and remote operations.

**Common scripts:**
- `push-to-both.sh` - Push to multiple remotes
- `backup-and-push.sh` - Backup and push changes
- `commit-and-push.sh` - Commit and push in one command

### [testing/](./testing/)
Test scripts for performance, API testing, and validation.

**Common scripts:**
- `api-perf-test.py` - API performance testing
- `api-concurrent-test.py` - Concurrent API testing
- `test-vercel-api.sh` - Test Vercel API

### [utilities/](./utilities/)
Utility scripts for diagnostics, maintenance, and helper functions.

**Common scripts:**
- `diagnostic.sh` - Run diagnostics
- `check-github-token.sh` - Verify GitHub token
- `add-issue-to-tracker.py` - Add issues to tracker

## 🚀 Quick Usage

### Setup Scripts
```bash
./scripts/setup/setup-new-repo.sh
./scripts/setup/verify-setup.sh
```

### Deployment Scripts
```bash
./scripts/deployment/deploy.sh
./scripts/deployment/trigger-deployment.sh
```

### Git Scripts
```bash
./scripts/git/push-to-both.sh
./scripts/git/backup-and-push.sh
```

### Testing Scripts
```bash
python3 scripts/testing/api-perf-test.py
python3 scripts/testing/api-concurrent-test.py
```

## 📝 Adding New Scripts

When adding new scripts:
1. Place in appropriate category directory
2. Make executable: `chmod +x script.sh`
3. Add description to this README
4. Follow naming conventions (kebab-case)

## 🔍 Finding Scripts

- **Need to set up?** → Check `setup/`
- **Deploying?** → See `deployment/`
- **Git operations?** → Look in `git/`
- **Testing?** → Use `testing/`
- **Utilities?** → Browse `utilities/`

