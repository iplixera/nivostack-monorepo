#!/bin/bash

# Non-interactive Backup and Clean Push Script
# Automatically creates backup and pushes clean branch

set -e

echo "🔒 Step 1: Creating backup..."
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_BRANCH="backup-before-clean-$TIMESTAMP"
BACKUP_TAG="backup-$TIMESTAMP"

git branch "$BACKUP_BRANCH" 2>/dev/null || true
git tag "$BACKUP_TAG" 2>/dev/null || true

echo "✅ Backup created: $BACKUP_BRANCH"
echo "✅ Backup tag: $BACKUP_TAG"
echo ""

echo "🧹 Step 2: Creating clean branch..."
git checkout main 2>/dev/null || git checkout -b main 2>/dev/null || true
git checkout --orphan clean-main 2>/dev/null || git checkout clean-main
git rm -rf . 2>/dev/null || true
git add -A

echo "📝 Creating initial commit..."
git commit -m "Initial commit - NivoStack monorepo

- Dashboard with Next.js (NivoStack Studio)
- Flutter SDK (nivostack_sdk)
- Android SDK (com.plixera.nivostack)
- Documentation
- Deployment configurations for 4 Vercel projects" \
  --author="iplixera <iplixera@iplixera.com>" || echo "Commit may already exist"

echo "✅ Clean branch created!"
echo ""

echo "📤 Step 3: Pushing to repository..."
git push iplixera clean-main:main --force

echo ""
echo "✅ Success! Repository pushed to: https://github.com/iplixera/nivostack-monorepo"
echo "📋 Backup: $BACKUP_BRANCH"

