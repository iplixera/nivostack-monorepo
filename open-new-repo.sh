#!/bin/bash
# Script to open the new repository in Cursor

NEW_REPO="/Users/karim-f/Code/nivostack-monorepo"
CLONE_DIR="/Users/karim-f/Code/nivostack-monorepo-checkout"

echo "Setting up new repository workspace..."
echo ""

# Check if clone exists, otherwise clone fresh
if [ -d "$CLONE_DIR" ]; then
    echo "✅ Found existing clone at: $CLONE_DIR"
    REPO_PATH="$CLONE_DIR"
elif [ -d "$NEW_REPO" ]; then
    echo "✅ Found repository at: $NEW_REPO"
    REPO_PATH="$NEW_REPO"
else
    echo "📥 Cloning repository..."
    cd /Users/karim-f/Code
    git clone https://github.com/iplixera/nivostack-monorepo.git nivostack-monorepo
    REPO_PATH="$NEW_REPO"
fi

cd "$REPO_PATH"

echo ""
echo "Repository location: $REPO_PATH"
echo "Current branch: $(git branch --show-current)"
echo ""
echo "Available branches:"
git branch -a | head -10
echo ""
echo "=========================================="
echo "✅ Open this folder in Cursor:"
echo "$REPO_PATH"
echo "=========================================="
echo ""
echo "To open in Cursor, run:"
echo "cursor \"$REPO_PATH\""
echo ""
echo "Or manually:"
echo "1. File → Open Folder"
echo "2. Navigate to: $REPO_PATH"
echo "3. Click Open"

