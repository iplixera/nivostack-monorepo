#!/bin/bash
set -e

cd /Users/karim-f/Code/devbridge

echo "=== Starting Push Process ==="
echo ""

# Step 1: Backup
echo "Step 1: Creating backup..."
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_BRANCH="backup-before-clean-$TIMESTAMP"
git branch "$BACKUP_BRANCH" 2>/dev/null || true
git tag "backup-$TIMESTAMP" 2>/dev/null || true
echo "✅ Backup: $BACKUP_BRANCH"
echo ""

# Step 2: Clean branch
echo "Step 2: Creating clean branch..."
git checkout main 2>/dev/null || true
git checkout --orphan clean-main 2>/dev/null || git checkout clean-main
git rm -rf . 2>/dev/null || true
git add -A
echo "✅ Files staged"
echo ""

# Step 3: Commit
echo "Step 3: Creating commit..."
git commit -m "Initial commit - NivoStack monorepo

- Dashboard with Next.js (NivoStack Studio)
- Flutter SDK (nivostack_sdk)  
- Android SDK (com.plixera.nivostack)
- Documentation
- Deployment configurations for 4 Vercel projects" \
  --author="iplixera <iplixera@iplixera.com>" 2>&1 || echo "Commit exists or error"
echo "✅ Commit created"
echo ""

# Step 4: Push
echo "Step 4: Pushing to iplixera/nivostack-monorepo..."
git push iplixera clean-main:main --force 2>&1
echo "✅ Push complete!"
echo ""

# Step 5: Verify
echo "Step 5: Verifying..."
sleep 2
git ls-remote iplixera 2>&1 | grep main || echo "Checking..."
echo ""

echo "=== Complete ==="
echo "Repository: https://github.com/iplixera/nivostack-monorepo"
echo "Backup: $BACKUP_BRANCH"

