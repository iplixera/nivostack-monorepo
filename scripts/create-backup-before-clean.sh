#!/bin/bash

# Backup Script - Create backup before clean branch operation
# Run this before creating the clean branch

set -e

echo "🔒 Creating backup before clean branch operation..."
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

# Also backup main branch if not already on it
if [ "$CURRENT_BRANCH" != "main" ]; then
    MAIN_BACKUP="backup-main-$SHORT_HASH"
    git checkout main 2>/dev/null || echo "Note: main branch may not exist"
    git branch "$MAIN_BACKUP" 2>/dev/null || echo "Backup of main already exists"
    git checkout "$CURRENT_BRANCH" 2>/dev/null || true
    echo "✅ Main branch backup created: $MAIN_BACKUP"
fi

# List all backups
echo ""
echo "📋 Backup Summary:"
echo "=================="
echo "Backup branches:"
git branch | grep backup | sed 's/^/  /'
echo ""
echo "Backup tags:"
git tag | grep backup | tail -5 | sed 's/^/  /'
echo ""
echo "✅ Backup complete!"
echo ""
echo "To restore from backup:"
echo "  git checkout $BACKUP_BRANCH"
echo "  or"
echo "  git checkout -b restore $BACKUP_TAG"

