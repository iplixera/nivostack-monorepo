#!/bin/bash

# ============================================
# DevBridge Branch Setup Script
# ============================================
# This script sets up the development workflow branches

set -e  # Exit on any error

echo ""
echo "🌿 DevBridge Branch Setup"
echo "=========================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 0: Check we're in the right directory
echo -e "${BLUE}📍 Checking current directory...${NC}"
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Not in project root directory${NC}"
    echo "Please cd to /Users/karim-f/Code/devbridge first"
    exit 1
fi
echo -e "${GREEN}✅ In project root${NC}"
echo ""

# Step 1: Check current branch
echo -e "${BLUE}🔍 Step 1: Checking current branch...${NC}"
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"
echo ""

# Step 2: Commit any uncommitted changes
echo -e "${BLUE}💾 Step 2: Checking for uncommitted changes...${NC}"
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  Found uncommitted changes. Committing now...${NC}"
    git add -A
    git commit -m "chore: commit changes before branch setup"
    echo -e "${GREEN}✅ Changes committed${NC}"
else
    echo -e "${GREEN}✅ No uncommitted changes${NC}"
fi
echo ""

# Step 3: Make sure we're on main and it's up to date
echo -e "${BLUE}📥 Step 3: Syncing with remote main...${NC}"
git checkout main
git pull origin main
echo -e "${GREEN}✅ Main branch updated${NC}"
echo ""

# Step 4: Tag current state as baseline
echo -e "${BLUE}🏷️  Step 4: Creating baseline tag...${NC}"
TAG_NAME="v1.5.1-baseline"
if git rev-parse "$TAG_NAME" >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Tag $TAG_NAME already exists, skipping...${NC}"
else
    git tag -a "$TAG_NAME" -m "Baseline before workflow change - $(date '+%Y-%m-%d %H:%M:%S')"
    git push origin "$TAG_NAME"
    echo -e "${GREEN}✅ Created and pushed tag: $TAG_NAME${NC}"
fi
echo ""

# Step 5: Create develop branch
echo -e "${BLUE}🌱 Step 5: Creating develop branch...${NC}"
if git show-ref --verify --quiet refs/heads/develop; then
    echo -e "${YELLOW}⚠️  Develop branch already exists locally${NC}"
    git checkout develop
else
    git checkout -b develop
    echo -e "${GREEN}✅ Created develop branch${NC}"
fi
echo ""

# Step 6: Push develop to remote
echo -e "${BLUE}📤 Step 6: Pushing develop to remote...${NC}"
if git ls-remote --heads origin develop | grep -q develop; then
    echo -e "${YELLOW}⚠️  Develop branch already exists on remote${NC}"
    git pull origin develop
else
    git push -u origin develop
    echo -e "${GREEN}✅ Pushed develop branch to remote${NC}"
fi
echo ""

# Step 7: Show branch structure
echo -e "${BLUE}📊 Step 7: Current branch structure${NC}"
echo ""
git branch -a
echo ""

# Success summary
echo ""
echo -e "${GREEN}════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Branch Setup Complete!${NC}"
echo -e "${GREEN}════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📋 What was done:${NC}"
echo "  ✓ Committed any pending changes"
echo "  ✓ Tagged current state as: $TAG_NAME"
echo "  ✓ Created develop branch from main"
echo "  ✓ Pushed develop to remote"
echo ""
echo -e "${BLUE}🌿 Branch Structure:${NC}"
echo "  main     → Production (protected)"
echo "  develop  → Staging (current)"
echo ""
echo -e "${BLUE}📍 You are now on:${NC} develop branch"
echo ""
echo -e "${BLUE}🎯 Next Steps:${NC}"
echo ""
echo "1. Configure Vercel:"
echo "   → Go to: https://vercel.com/flooss-bridge-hub/devbridge/settings/git"
echo "   → Production Branch: main"
echo "   → Enable preview for: develop"
echo ""
echo "2. Set up branch protection:"
echo "   → Go to: https://github.com/pie-int/dev-bridge/settings/branches"
echo "   → Add rule for 'main' (require PR reviews)"
echo "   → Add rule for 'develop' (require PR reviews)"
echo ""
echo "3. Start your first feature:"
echo "   $ git checkout -b feature/my-first-feature"
echo "   $ # make changes"
echo "   $ git add ."
echo "   $ git commit -m 'feat: my first feature'"
echo "   $ git push origin feature/my-first-feature"
echo "   $ # Create PR to develop in GitHub"
echo ""
echo -e "${GREEN}📚 Documentation: docs/DEV_PRODUCTION_WORKFLOW.md${NC}"
echo ""

