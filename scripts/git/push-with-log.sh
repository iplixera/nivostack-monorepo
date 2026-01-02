#!/bin/bash

# Complete push script with logging
# All output will be saved to push-log.txt

LOG_FILE="/Users/karim-f/Code/devbridge/push-log.txt"

exec > >(tee -a "$LOG_FILE")
exec 2>&1

echo "=========================================="
echo "Push to iplixera/nivostack-monorepo"
echo "Started: $(date)"
echo "=========================================="
echo ""

cd /Users/karim-f/Code/devbridge || exit 1

echo "Current directory: $(pwd)"
echo "Current branch: $(git branch --show-current)"
echo ""

# Step 1: Backup
echo "🔒 Step 1: Creating backup..."
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_BRANCH="backup-before-clean-$TIMESTAMP"
BACKUP_TAG="backup-$TIMESTAMP"

git branch "$BACKUP_BRANCH" 2>&1
git tag "$BACKUP_TAG" 2>&1

echo "✅ Backup branch: $BACKUP_BRANCH"
echo "✅ Backup tag: $BACKUP_TAG"
echo ""

# Step 2: Clean branch
echo "🧹 Step 2: Creating clean branch..."
git checkout main 2>&1 || echo "Note: main checkout"
git checkout --orphan clean-main 2>&1 || git checkout clean-main 2>&1

echo "Clearing files..."
git rm -rf . 2>&1 || true

echo "Staging files..."
git add -A 2>&1
FILE_COUNT=$(git status --short | wc -l | tr -d ' ')
echo "✅ Files staged: $FILE_COUNT"
echo ""

# Step 3: Commit
echo "📝 Step 3: Creating commit..."
git commit -m "Initial commit - NivoStack monorepo

- Dashboard with Next.js (NivoStack Studio)
- Flutter SDK (nivostack_sdk)
- Android SDK (com.plixera.nivostack)
- Documentation
- Deployment configurations for 4 Vercel projects" \
  --author="iplixera <iplixera@iplixera.com>" 2>&1

COMMIT_HASH=$(git rev-parse HEAD)
echo "✅ Commit created: $COMMIT_HASH"
echo ""

# Step 4: Push
echo "📤 Step 4: Pushing to iplixera/nivostack-monorepo..."
git push iplixera clean-main:main --force 2>&1
PUSH_EXIT=$?

if [ $PUSH_EXIT -eq 0 ]; then
    echo "✅ Push successful!"
else
    echo "❌ Push failed with exit code: $PUSH_EXIT"
fi
echo ""

# Step 5: Verify
echo "🔍 Step 5: Verifying..."
sleep 2
git ls-remote iplixera 2>&1 | grep main || echo "Could not verify remote"
echo ""

echo "=========================================="
echo "Completed: $(date)"
echo "Log saved to: $LOG_FILE"
echo "Repository: https://github.com/iplixera/nivostack-monorepo"
echo "Backup: $BACKUP_BRANCH"
echo "=========================================="

exit $PUSH_EXIT

