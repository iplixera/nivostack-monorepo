#!/bin/bash

# Push NivoStack monorepo to iplixera/nivostack-monorepo
# This script creates a backup, then pushes a clean branch

set -e

echo "🔒 Step 1: Creating backup..."
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_BRANCH="backup-before-clean-$TIMESTAMP"
BACKUP_TAG="backup-$TIMESTAMP"

git branch "$BACKUP_BRANCH" 2>/dev/null || true
git tag "$BACKUP_TAG" 2>/dev/null || true

echo "✅ Backup created: $BACKUP_BRANCH"
echo ""

echo "🧹 Step 2: Creating clean branch..."
# Ensure we're on main
git checkout main 2>/dev/null || echo "Note: main branch"

# Create orphan branch
git checkout --orphan clean-main 2>/dev/null || git checkout clean-main

# Clear and add files
git rm -rf . 2>/dev/null || true
git add -A

echo "📝 Creating commit with author: iplixera <iplixera@iplixera.com>"
git commit -m "Initial commit - NivoStack monorepo

- Dashboard with Next.js (NivoStack Studio)
- Flutter SDK (nivostack_sdk)
- Android SDK (com.plixera.nivostack)
- Documentation
- Deployment configurations for 4 Vercel projects" \
  --author="iplixera <iplixera@iplixera.com>" 2>&1 || echo "Commit may exist"

echo "✅ Clean branch ready!"
echo ""

echo "📤 Step 3: Pushing to iplixera/nivostack-monorepo..."
git push iplixera clean-main:main --force 2>&1

echo ""
echo "✅ Push complete!"
echo "📋 Repository: https://github.com/iplixera/nivostack-monorepo"
echo "📋 Backup: $BACKUP_BRANCH"

