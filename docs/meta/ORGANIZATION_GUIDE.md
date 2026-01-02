# Repository Organization Guide

This guide explains the repository structure and organization.

## 📁 Directory Structure

```
nivostack-monorepo/
├── README.md                 # Main project README
├── package.json              # Root package configuration
├── tsconfig.json             # TypeScript configuration
├── vercel.json              # Vercel configuration
│
├── dashboard/               # Next.js dashboard application
├── packages/                # SDK packages
│   ├── sdk-flutter/        # Flutter SDK
│   ├── sdk-android/        # Android SDK
│   └── sdk-ios/            # iOS SDK
│
├── scripts/                 # All project scripts (organized)
│   ├── setup/              # Setup and initialization
│   ├── deployment/         # Deployment automation
│   ├── git/                # Git workflow scripts
│   ├── testing/            # Test scripts
│   └── utilities/           # Utility scripts
│
└── docs/                    # All documentation (organized)
    ├── setup/              # Setup guides
    ├── deployment/         # Deployment docs
    ├── development/        # Development docs
    ├── guides/             # User guides
    ├── features/           # Feature docs
    ├── PRDs/               # Product Requirements
    └── technical/          # Technical docs
```

## 📝 Scripts Organization

### scripts/setup/
Repository and environment setup scripts.

**Examples:**
- `setup-new-repo.sh` - Initialize new repository
- `setup-dual-remote.sh` - Configure dual remote setup
- `verify-setup.sh` - Verify repository configuration

### scripts/deployment/
Deployment and production release automation.

**Examples:**
- `deploy.sh` - Deploy to production
- `trigger-deployment.sh` - Trigger Vercel deployment
- `complete-vercel-setup.sh` - Complete Vercel setup

### scripts/git/
Git workflow, branch management, and remote operations.

**Examples:**
- `push-to-both.sh` - Push to multiple remotes
- `backup-and-push.sh` - Backup and push changes
- `commit-and-push.sh` - Commit and push automation

### scripts/testing/
Test scripts for performance, API testing, and validation.

**Examples:**
- `api-perf-test.py` - API performance testing
- `api-concurrent-test.py` - Concurrent API testing

### scripts/utilities/
Utility scripts for diagnostics, maintenance, and helper functions.

**Examples:**
- `diagnostic.sh` - Run diagnostics
- `check-github-token.sh` - Verify GitHub token

## 📚 Documentation Organization

### docs/setup/
Setup, installation, and configuration guides.

**Examples:**
- `SETUP_GUIDE.md` - Complete setup guide
- `QUICK_START_SETUP.md` - Quick start instructions
- `LOCAL_DEVELOPMENT_SETUP.md` - Local development setup

### docs/deployment/
Deployment, releases, and production documentation.

**Examples:**
- `DEPLOYMENT_INSTRUCTIONS.md` - Deployment guide
- `CHANGELOG.md` - Version changelog
- `RELEASE_NOTES.md` - Release notes

### docs/development/
Development workflows and technical documentation.

**Examples:**
- `DEVELOPER_GUIDE.md` - Developer guide
- `DEVELOPMENT_WORKFLOW.md` - Development workflow
- Bug fix and migration documentation

### docs/guides/
User guides, integration guides, and how-to documentation.

**Examples:**
- Integration guides for SDKs
- User guides
- How-to guides

### docs/features/
Feature documentation and planning.

**Examples:**
- Feature plans and roadmaps
- Feature implementation docs

### docs/PRDs/
Product Requirements Documents.

**Examples:**
- Feature PRDs
- Product specifications

### docs/technical/
Technical architecture and decision records.

**Examples:**
- Architecture documentation
- Performance optimization guides
- Technical decision records

## 🎯 Benefits of Organization

1. **Easier Navigation** - Find files quickly by category
2. **Better Maintenance** - Related files grouped together
3. **Cleaner Root** - Root directory only contains essential files
4. **Scalability** - Easy to add new files in appropriate locations
5. **Documentation** - Clear structure helps new contributors

## 📖 Finding Files

### Need to set up?
→ Check `docs/setup/` and `scripts/setup/`

### Deploying?
→ See `docs/deployment/` and `scripts/deployment/`

### Git operations?
→ Look in `scripts/git/`

### Development?
→ Browse `docs/development/`

### Testing?
→ Use `scripts/testing/`

## 🔄 Adding New Files

When adding new files:

1. **Scripts**: Place in appropriate `scripts/` subdirectory
2. **Documentation**: Place in appropriate `docs/` subdirectory
3. **Root files**: Only essential configuration files

## 📋 Quick Reference

- **Main README**: [`README.md`](../README.md)
- **Scripts Index**: [`scripts/README.md`](../scripts/README.md)
- **Docs Index**: [`docs/README.md`](./README.md)

