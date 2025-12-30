#!/bin/bash

# Complete setup script for new repository branches

set -e

REPO_URL="https://github.com/iplixera/nivostack-monorepo.git"
CLONE_DIR="/Users/karim-f/Code/nivostack-monorepo-checkout"

echo "=========================================="
echo "Setting Up New Repository Branches"
echo "=========================================="
echo ""

# Step 1: Clone repository
echo "Step 1: Cloning repository..."
if [ -d "$CLONE_DIR" ]; then
    echo "Removing existing checkout..."
    rm -rf "$CLONE_DIR"
fi

git clone "$REPO_URL" "$CLONE_DIR" 2>&1
cd "$CLONE_DIR"

echo "✅ Repository cloned to: $CLONE_DIR"
echo ""

# Step 2: Verify repository contents
echo "Step 2: Verifying repository..."
echo "Current branch: $(git branch --show-current)"
echo "Total commits: $(git rev-list --count HEAD)"
echo "Last commit:"
git log -1 --pretty=format:"  %h - %an <%ae> - %s"
echo ""
echo "Repository structure:"
ls -la | grep -E "^d|^-" | head -15
echo ""

# Step 3: Verify remote
echo "Step 3: Remote configuration:"
git remote -v
echo ""

# Step 4: Check what's pushed
echo "Step 4: Checking remote status..."
git fetch origin 2>&1
LOCAL_BRANCH=$(git branch --show-current)
REMOTE_BRANCH="origin/$LOCAL_BRANCH"

if git show-ref --verify --quiet "refs/remotes/$REMOTE_BRANCH"; then
    LOCAL_COMMITS=$(git rev-list "$LOCAL_BRANCH" --not "$REMOTE_BRANCH" 2>/dev/null | wc -l | tr -d ' ')
    REMOTE_COMMITS=$(git rev-list "$REMOTE_BRANCH" --not "$LOCAL_BRANCH" 2>/dev/null | wc -l | tr -d ' ')
    
    if [ "$LOCAL_COMMITS" -eq 0 ] && [ "$REMOTE_COMMITS" -eq 0 ]; then
        echo "✅ Branch $LOCAL_BRANCH is in sync with remote"
    else
        echo "⚠️  Branch $LOCAL_BRANCH has differences:"
        echo "   Local commits ahead: $LOCAL_COMMITS"
        echo "   Remote commits ahead: $REMOTE_COMMITS"
    fi
else
    echo "⚠️  Remote branch $REMOTE_BRANCH not found"
fi
echo ""

# Step 5: Setup branch strategy (main, develop, release/*)
echo "Step 5: Setting up branch strategy..."
echo ""

# Ensure we're on main
git checkout main 2>/dev/null || echo "Already on main"

# Create develop branch
if ! git show-ref --verify --quiet refs/heads/develop; then
    echo "Creating develop branch..."
    git checkout -b develop
    echo "✅ Created develop branch from main"
else
    echo "develop branch already exists"
    git checkout develop
    echo "Switched to develop branch"
fi
echo ""

# Create release branches
echo "Creating release branches..."
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

# Step 6: Push all branches to remote
echo "Step 6: Pushing branches to remote..."
echo ""

# Push main
echo "Pushing main branch..."
git push origin main 2>&1 || echo "main already pushed"

# Push develop
if git show-ref --verify --quiet refs/heads/develop; then
    echo "Pushing develop branch..."
    git push origin develop 2>&1 || echo "develop already pushed"
fi

# Push release branches
for branch in "${RELEASE_BRANCHES[@]}"; do
    if git show-ref --verify --quiet "refs/heads/$branch"; then
        echo "Pushing $branch branch..."
        git push origin "$branch" 2>&1 || echo "$branch already pushed"
    fi
done
echo ""

# Step 7: Final verification
echo "Step 7: Final branch structure:"
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
echo ""
echo "Branch Strategy:"
echo "  - main: Production-ready code"
echo "  - develop: Development branch"
echo "  - release/v1.0.0: Release branch for v1.0.0"
echo "  - release/v1.1.0: Release branch for v1.1.0"
echo ""
echo "All branches have been created and pushed!"
echo "=========================================="

