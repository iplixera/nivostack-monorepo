#!/bin/bash

# Complete Backup and Clean Push Script
# This script creates a backup and then pushes a clean branch to the new repository

set -e

echo "🔒 Step 1: Creating backup..."
echo ""

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"

# Create timestamp
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
SHORT_HASH=$(git rev-parse --short HEAD)

# Create backup branch
BACKUP_BRANCH="backup-before-clean-$TIMESTAMP"
echo "Creating backup branch: $BACKUP_BRANCH"
git branch "$BACKUP_BRANCH"
echo "✅ Backup branch created: $BACKUP_BRANCH"

# Create backup tag
BACKUP_TAG="backup-$TIMESTAMP"
echo "Creating backup tag: $BACKUP_TAG"
git tag "$BACKUP_TAG"
echo "✅ Backup tag created: $BACKUP_TAG"

# Show backups
echo ""
echo "📋 Backup Summary:"
git branch | grep backup | sed 's/^/  /'
echo ""
git tag | grep backup | tail -3 | sed 's/^/  /'
echo ""

# Ask for confirmation
read -p "✅ Backup complete! Proceed with clean branch creation? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo "Aborted. Your backup is safe at: $BACKUP_BRANCH"
    exit 0
fi

echo ""
echo "🧹 Step 2: Creating clean branch..."
echo ""

# Ensure we're on main
git checkout main 2>/dev/null || echo "Already on main or main doesn't exist"

# Create orphan branch
echo "Creating orphan branch (no history)..."
git checkout --orphan clean-main

# Clear staging area
echo "Clearing staging area..."
git rm -rf . 2>/dev/null || true

# Add all current files
echo "Adding all current files..."
git add -A

# Create commit
echo "Creating initial commit..."
git commit -m "Initial commit - NivoStack monorepo

- Dashboard with Next.js (NivoStack Studio)
- Flutter SDK (nivostack_sdk)
- Android SDK (com.plixera.nivostack)
- Documentation
- Deployment configurations for 4 Vercel projects" \
  --author="iplixera <iplixera@iplixera.com>"

echo "✅ Clean branch created!"
echo ""

# Ask for confirmation before push
read -p "🚀 Push to iplixera/nivostack-monorepo? (yes/no): " PUSH_CONFIRM
if [ "$PUSH_CONFIRM" != "yes" ]; then
    echo "Aborted. Clean branch created locally. Push manually with:"
    echo "  git push iplixera clean-main:main --force"
    exit 0
fi

echo ""
echo "📤 Step 3: Pushing to repository..."
echo ""

# Push to new repository
git push iplixera clean-main:main --force

echo ""
echo "✅ Success! Repository pushed to: https://github.com/iplixera/nivostack-monorepo"
echo ""
echo "📋 Summary:"
echo "  - Backup branch: $BACKUP_BRANCH"
echo "  - Backup tag: $BACKUP_TAG"
echo "  - Clean branch: clean-main"
echo "  - Pushed to: iplixera/nivostack-monorepo"
echo ""
echo "To restore from backup:"
echo "  git checkout $BACKUP_BRANCH"

