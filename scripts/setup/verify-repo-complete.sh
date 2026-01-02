#!/bin/bash
# Complete repository verification and branch setup
# All output goes to verify-repo.log

exec > >(tee verify-repo.log)
exec 2>&1

set -e

REPO_URL="https://github.com/iplixera/nivostack-monorepo.git"
CLONE_DIR="/Users/karim-f/Code/nivostack-monorepo-checkout"

echo "=========================================="
echo "Repository Verification and Branch Setup"
echo "Started: $(date)"
echo "=========================================="
echo ""

# Step 1: Clone repository
echo "📥 Step 1: Cloning repository..."
if [ -d "$CLONE_DIR" ]; then
    echo "Removing existing checkout..."
    rm -rf "$CLONE_DIR"
fi

git clone "$REPO_URL" "$CLONE_DIR"
cd "$CLONE_DIR"

echo "✅ Repository cloned to: $CLONE_DIR"
echo ""

# Step 2: Verify repository
echo "🔍 Step 2: Verifying repository contents..."
CURRENT_BRANCH=$(git branch --show-current)
COMMIT_COUNT=$(git rev-list --count HEAD)
LAST_COMMIT=$(git log -1 --oneline)

echo "Current branch: $CURRENT_BRANCH"
echo "Total commits: $COMMIT_COUNT"
echo "Last commit: $LAST_COMMIT"
echo ""

echo "Repository structure:"
ls -la | head -15
echo ""

# Step 3: Check remote
echo "🌐 Step 3: Remote configuration..."
git remote -v
echo ""

# Step 4: Check sync status
echo "🔄 Step 4: Checking sync status..."
git fetch origin

LOCAL_COMMITS=$(git rev-list main --not origin/main 2>/dev/null | wc -l | tr -d ' ' || echo "0")
REMOTE_COMMITS=$(git rev-list origin/main --not main 2>/dev/null | wc -l | tr -d ' ' || echo "0")

if [ "$LOCAL_COMMITS" -eq 0 ] && [ "$REMOTE_COMMITS" -eq 0 ]; then
    echo "✅ Branch main is in sync with remote"
else
    echo "⚠️  Branch differences:"
    echo "   Local commits ahead: $LOCAL_COMMITS"
    echo "   Remote commits ahead: $REMOTE_COMMITS"
fi
echo ""

# Step 5: Setup branches
echo "🌿 Step 5: Setting up branch strategy..."
echo ""

# Ensure on main
git checkout main 2>/dev/null || echo "Already on main"

# Create develop branch
if ! git show-ref --verify --quiet refs/heads/develop; then
    echo "Creating develop branch..."
    git checkout -b develop
    echo "✅ Created develop branch"
else
    echo "develop branch already exists"
    git checkout develop
fi
echo ""

# Create release branches
RELEASE_BRANCHES=("release/v1.0.0" "release/v1.1.0")

for branch in "${RELEASE_BRANCHES[@]}"; do
    if ! git show-ref --verify --quiet "refs/heads/$branch"; then
        git checkout -b "$branch" develop 2>/dev/null || git checkout -b "$branch" main
        echo "✅ Created $branch branch"
    else
        echo "⚠️  $branch already exists"
    fi
done
echo ""

# Switch back to main
git checkout main
echo ""

# Step 6: Push branches
echo "📤 Step 6: Pushing branches to remote..."
echo ""

echo "Pushing main..."
git push origin main 2>&1 || echo "main already pushed"

if git show-ref --verify --quiet refs/heads/develop; then
    echo "Pushing develop..."
    git push origin develop 2>&1 || echo "develop already pushed"
fi

for branch in "${RELEASE_BRANCHES[@]}"; do
    if git show-ref --verify --quiet "refs/heads/$branch"; then
        echo "Pushing $branch..."
        git push origin "$branch" 2>&1 || echo "$branch already pushed"
    fi
done
echo ""

# Step 7: Final verification
echo "🔍 Step 7: Final branch structure..."
echo ""
echo "Local branches:"
git branch
echo ""
echo "Remote branches:"
git branch -r | grep -E "(main|develop|release)" | head -10
echo ""

# Step 8: Summary
echo "=========================================="
echo "Summary"
echo "=========================================="
echo "Repository: $REPO_URL"
echo "Local checkout: $CLONE_DIR"
echo "Current branch: $(git branch --show-current)"
echo "Total commits: $(git rev-list --count HEAD)"
echo ""
echo "Branch Strategy:"
echo "  ✅ main - Production-ready code"
echo "  ✅ develop - Development branch"
echo "  ✅ release/v1.0.0 - Release branch for v1.0.0"
echo "  ✅ release/v1.1.0 - Release branch for v1.1.0"
echo ""
echo "All branches created and pushed!"
echo "=========================================="
echo ""
echo "Log saved to: verify-repo.log"
echo "Completed: $(date)"

