# Backup and Clean Push Steps

## Step 1: Create Backup

Run these commands in your terminal:

```bash
cd /Users/karim-f/Code/devbridge

# Create backup branch with timestamp
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
git branch backup-before-clean-$TIMESTAMP

# Create backup tag
git tag backup-$TIMESTAMP

# Verify backups
git branch | grep backup
git tag | grep backup | tail -3
```

## Step 2: Create Clean Branch and Push

After backup is verified, run:

```bash
# Ensure you're on main branch
git checkout main

# Create orphan branch (no history)
git checkout --orphan clean-main

# Clear staging area (orphan branch may have old files)
git rm -rf .

# Add all current files
git add -A

# Create single commit with your author info
git commit -m "Initial commit - NivoStack monorepo

- Dashboard with Next.js (NivoStack Studio)
- Flutter SDK (nivostack_sdk)
- Android SDK (com.plixera.nivostack)
- Documentation
- Deployment configurations for 4 Vercel projects" \
  --author="iplixera <iplixera@iplixera.com>"

# Push to new repository
git push iplixera clean-main:main --force

# Verify push succeeded
git ls-remote iplixera
```

## Step 3: Verify on GitHub

Visit: https://github.com/iplixera/nivostack-monorepo

## Restore from Backup (if needed)

```bash
# List backups
git branch | grep backup
git tag | grep backup

# Restore from backup branch
git checkout backup-before-clean-YYYYMMDD-HHMMSS

# Or restore from tag
git checkout -b restore backup-YYYYMMDD-HHMMSS
```

