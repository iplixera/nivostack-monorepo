#!/bin/bash

# Verify new repo and setup branches

set -e

echo "=========================================="
echo "Verifying and Setting Up Branches"
echo "=========================================="
echo ""

# Clone the new repo
CLONE_DIR="/Users/karim-f/Code/nivostack-monorepo-checkout"
REPO_URL="https://github.com/iplixera/nivostack-monorepo.git"

echo "Step 1: Cloning repository..."
if [ -d "$CLONE_DIR" ]; then
    echo "Removing existing checkout..."
    rm -rf "$CLONE_DIR"
fi

git clone "$REPO_URL" "$CLONE_DIR" 2>&1
cd "$CLONE_DIR"

echo "✅ Repository cloned"
echo ""

# Verify what's in the repo
echo "Step 2: Verifying repository contents..."
echo "Current branch: $(git branch --show-current)"
echo "Commit count: $(git rev-list --count HEAD)"
echo "Last commit: $(git log -1 --oneline)"
echo ""

echo "Repository structure:"
ls -la | head -15
echo ""

# Check if main branch exists
echo "Step 3: Checking branches..."
git branch -a
echo ""

# Setup branch strategy (main, develop, release branches)
echo "Step 4: Setting up branch strategy..."

# Create develop branch from main
if ! git show-ref --verify --quiet refs/heads/develop; then
    echo "Creating develop branch..."
    git checkout -b develop
    echo "✅ Created develop branch"
else
    echo "develop branch already exists"
    git checkout develop
fi
echo ""

# Create release branch structure
echo "Step 5: Creating release branch structure..."
if ! git show-ref --verify --quiet refs/heads/release/v1.0.0; then
    git checkout -b release/v1.0.0 develop 2>/dev/null || git checkout -b release/v1.0.0 main
    echo "✅ Created release/v1.0.0 branch"
else
    echo "release/v1.0.0 branch already exists"
fi
echo ""

# Switch back to main
git checkout main
echo ""

# Verify all branches
echo "Step 6: Final branch structure:"
git branch -a
echo ""

# Verify remote
echo "Step 7: Remote configuration:"
git remote -v
echo ""

# Check if everything is pushed
echo "Step 8: Checking if everything is pushed..."
git fetch origin 2>&1
LOCAL_COMMITS=$(git rev-list main --not origin/main 2>/dev/null | wc -l | tr -d ' ')
if [ "$LOCAL_COMMITS" -eq 0 ]; then
    echo "✅ All commits are pushed to remote"
else
    echo "⚠️  Found $LOCAL_COMMITS unpushed commits"
fi
echo ""

# Summary
echo "=========================================="
echo "Summary"
echo "=========================================="
echo "Repository: $REPO_URL"
echo "Location: $CLONE_DIR"
echo "Branches:"
git branch -a | grep -E "(main|develop|release)" | head -10
echo ""
echo "✅ Setup complete!"
echo "=========================================="

