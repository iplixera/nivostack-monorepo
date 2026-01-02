#!/bin/bash

# Fix secrets and push - with full logging

cd /Users/karim-f/Code/devbridge

LOG_FILE="push-fix-log.txt"
exec > >(tee "$LOG_FILE")
exec 2>&1

echo "=========================================="
echo "Removing secrets and pushing"
echo "Started: $(date)"
echo "=========================================="
echo ""

# Ensure on clean-main
echo "Checking branch..."
git checkout clean-main 2>&1 || git checkout --orphan clean-main 2>&1
echo "Current branch: $(git branch --show-current)"
echo ""

# Remove .dual-remote-config completely
echo "Removing .dual-remote-config..."
if [ -f ".dual-remote-config" ]; then
    git rm -f .dual-remote-config 2>&1
    echo "✅ Removed .dual-remote-config"
else
    echo "⚠️  .dual-remote-config not found (may already be removed)"
fi
echo ""

# Ensure tokens are redacted in docs
echo "Checking for tokens in files..."
grep -r "ghp_" . --include="*.md" --include="*.sh" --include="*.py" 2>/dev/null | grep -v ".git" | head -5
echo ""

# Add updated files
echo "Staging changes..."
git add EXECUTE_PUSH.md PUSH_STATUS.md .gitignore 2>&1
git add -A 2>&1
echo ""

# Show what will be committed
echo "Files to commit:"
git status --short | head -20
echo ""

# Amend commit
echo "Amending commit..."
git commit --amend -m "Initial commit - NivoStack monorepo

- Dashboard with Next.js (NivoStack Studio)
- Flutter SDK (nivostack_sdk)
- Android SDK (com.plixera.nivostack)
- Documentation
- Deployment configurations for 4 Vercel projects" \
  --author="iplixera <iplixera@iplixera.com>" 2>&1

COMMIT_HASH=$(git rev-parse HEAD)
echo "✅ Commit: $COMMIT_HASH"
echo ""

# Verify no secrets in commit
echo "Checking commit for secrets..."
git show HEAD | grep -i "ghp_" | head -5 || echo "✅ No tokens found in commit"
echo ""

# Push
echo "Pushing to repository..."
git push iplixera clean-main:main --force 2>&1
PUSH_EXIT=$?

echo ""
echo "=========================================="
if [ $PUSH_EXIT -eq 0 ]; then
    echo "✅ SUCCESS! Push completed!"
    echo "📋 Repository: https://github.com/iplixera/nivostack-monorepo"
else
    echo "❌ Push failed with exit code: $PUSH_EXIT"
    echo "Check log above for details"
fi
echo "Log saved to: $LOG_FILE"
echo "=========================================="

exit $PUSH_EXIT

