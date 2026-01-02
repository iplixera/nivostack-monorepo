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
- `vercel-build.sh` - Vercel build script
- `complete-vercel-setup.sh` - Complete Vercel configuration

### [git/](./git/)
Git workflow, branch management, and remote operations.

**Common scripts:**
- `push-to-both.sh` - Push to multiple remotes
- `backup-and-push.sh` - Backup and push changes
- `commit-and-push.sh` - Commit and push in one command

### [github/](./github/)
GitHub integration scripts for issues, tracking, and automation.

**Common scripts:**
- `create-github-issue.sh` - Create GitHub issues
- `sync-tracker-to-github.sh` - Sync tracker to GitHub
- `add-issue-to-tracker.py` - Add issues to tracker
- `manage-release-tag.sh` - Manage release tags

### [database/](./database/)
Database migration, health checks, and database management scripts.

**Common scripts:**
- `migrate-production.sh` - Run production migrations
- `migrate-local.sh` - Run local migrations
- `db-health-check.ts` - Check database health
- `ensure-local-database.sh` - Ensure local database setup

### [data/](./data/)
Data management scripts for cleanup, backfill, and data operations.

**Common scripts:**
- `backfill-invitation-notifications.ts` - Backfill notifications
- `clean-test-data.ts` - Clean test data
- `delete-test-devices.ts` - Delete test devices
- `create-expired-disabled-subscriptions.ts` - Create test subscriptions

### [testing/](./testing/)
Test scripts for performance, API testing, and validation.

**Common scripts:**
- `api-perf-test.py` - API performance testing
- `api-concurrent-test.py` - Concurrent API testing
- `test-vercel-api.sh` - Test Vercel API
- `test-*.ts` - Various test scripts

### [utilities/](./utilities/)
Utility scripts for diagnostics, maintenance, and helper functions.

**Common scripts:**
- `diagnostic.sh` - Run diagnostics
- `check-github-token.sh` - Verify GitHub token
- `get-my-ip.sh` - Get your IP address
- `restart-dev-server.sh` - Restart development server

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

### Database Scripts
```bash
./scripts/database/migrate-production.sh
./scripts/database/db-health-check.ts
```

### Git Scripts
```bash
./scripts/git/push-to-both.sh
./scripts/git/backup-and-push.sh
```

### GitHub Scripts
```bash
./scripts/github/create-github-issue.sh
./scripts/github/sync-tracker-to-github.sh
```

### Testing Scripts
```bash
python3 scripts/testing/api-perf-test.py
python3 scripts/testing/api-concurrent-test.py
```

### Data Management Scripts
```bash
tsx scripts/data/backfill-invitation-notifications.ts
tsx scripts/data/clean-test-data.ts
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
- **Database operations?** → Look in `database/`
- **Git operations?** → Look in `git/`
- **GitHub integration?** → See `github/`
- **Data management?** → Check `data/`
- **Testing?** → Use `testing/`
- **Utilities?** → Browse `utilities/`

