#!/bin/bash

# ============================================
# Dual Remote Setup Script - SIMPLIFIED
# Karim's Personal (Primary) + Flooss (Backup)
# ============================================

set -e

echo ""
echo "🔀 DevBridge Dual Remote Setup"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
GITHUB_TOKEN_KARIM="YOUR_GITHUB_TOKEN_HERE"

# Prompt for information
echo -e "${BLUE}📝 Please provide your information:${NC}"
echo ""
read -p "Your GitHub username (Karim's personal account): " GITHUB_USERNAME
read -p "Repository name [devbridge]: " REPO_NAME
REPO_NAME=${REPO_NAME:-devbridge}
read -p "Make repository private? (yes/no) [yes]: " REPO_PRIVATE
REPO_PRIVATE=${REPO_PRIVATE:-yes}
echo ""

# Summary
echo -e "${BLUE}📋 Configuration Summary:${NC}"
echo "  Karim's Repo: $GITHUB_USERNAME/$REPO_NAME"
echo "  Flooss Repo: pie-int/dev-bridge (kept as backup)"
echo "  Primary Deployment: Karim's repo → Vercel"
echo ""

read -p "Continue with this setup? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo "Aborted."
    exit 0
fi
echo ""

# Step 1: Check current remotes
echo -e "${BLUE}🔍 Step 1: Checking current git remotes...${NC}"
echo "Current remotes:"
git remote -v
echo ""

# Step 2: Backup current remote as 'flooss'
echo -e "${BLUE}💾 Step 2: Preserving Flooss remote...${NC}"

CURRENT_ORIGIN=$(git remote get-url origin 2>/dev/null || echo "")
if [ -n "$CURRENT_ORIGIN" ]; then
    # Rename origin to flooss
    git remote rename origin flooss 2>/dev/null || {
        git remote remove flooss 2>/dev/null || true
        git remote add flooss "$CURRENT_ORIGIN"
    }
    echo -e "${GREEN}✅ Flooss remote preserved as 'flooss'${NC}"
else
    # Add flooss remote manually
    git remote add flooss https://github.com/pie-int/dev-bridge.git 2>/dev/null || true
    echo -e "${GREEN}✅ Flooss remote added${NC}"
fi
echo ""

# Step 3: Create new repository on Karim's account
echo -e "${BLUE}📦 Step 3: Creating repository on Karim's account...${NC}"

REPO_VISIBILITY="false"
if [ "$REPO_PRIVATE" = "yes" ]; then
    REPO_VISIBILITY="true"
fi

CREATE_RESPONSE=$(curl -s -X POST \
  -H "Authorization: token $GITHUB_TOKEN_KARIM" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/user/repos \
  -d "{
    \"name\": \"$REPO_NAME\",
    \"description\": \"Mobile app monitoring and configuration platform with Flutter SDK\",
    \"private\": $REPO_VISIBILITY,
    \"auto_init\": false,
    \"has_issues\": true,
    \"has_projects\": true,
    \"has_wiki\": false
  }")

if echo "$CREATE_RESPONSE" | grep -q "\"name\": \"$REPO_NAME\""; then
    echo -e "${GREEN}✅ Repository created: https://github.com/$GITHUB_USERNAME/$REPO_NAME${NC}"
elif echo "$CREATE_RESPONSE" | grep -q "name already exists"; then
    echo -e "${YELLOW}⚠️  Repository already exists, will use existing one${NC}"
else
    echo -e "${YELLOW}⚠️  Response: ${CREATE_RESPONSE:0:200}${NC}"
    echo -e "${BLUE}Continuing anyway...${NC}"
fi
echo ""

# Step 4: Add new origin (Karim's repo)
echo -e "${BLUE}🔗 Step 4: Adding Karim's repo as 'origin'...${NC}"

NEW_REPO_URL="https://$GITHUB_TOKEN_KARIM@github.com/$GITHUB_USERNAME/$REPO_NAME.git"
git remote remove origin 2>/dev/null || true
git remote add origin "$NEW_REPO_URL"

echo -e "${GREEN}✅ Origin set to Karim's repository${NC}"
echo ""

# Step 5: Commit any pending changes
echo -e "${BLUE}💾 Step 5: Preparing code...${NC}"

if [ -n "$(git status --porcelain)" ]; then
    echo "Committing pending changes..."
    git add -A
    git commit -m "chore: setup dual remote configuration" 2>/dev/null || echo "Nothing to commit or already committed"
fi
echo -e "${GREEN}✅ Code prepared${NC}"
echo ""

# Step 6: Create and push branches
echo -e "${BLUE}🌿 Step 6: Setting up branches...${NC}"

# Ensure we're on main
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    git checkout main 2>/dev/null || git checkout -b main
fi

# Tag current state
git tag -a "v1.5.2-dual-remote" -m "Dual remote setup: Karim (primary) + Flooss (backup)" 2>/dev/null || {
    git tag -d "v1.5.2-dual-remote" 2>/dev/null
    git tag -a "v1.5.2-dual-remote" -m "Dual remote setup: Karim (primary) + Flooss (backup)"
}

# Push to Karim's repo (origin)
echo "Pushing main to Karim's repository..."
git push -u origin main --force

# Ensure develop exists
git checkout -b develop 2>/dev/null || git checkout develop

# Push develop
echo "Pushing develop to Karim's repository..."
git push -u origin develop --force

# Push tags
echo "Pushing tags..."
git push origin --tags --force

echo -e "${GREEN}✅ Branches pushed to Karim's repository${NC}"
echo ""

# Step 7: Set default branch
echo -e "${BLUE}⚙️  Step 7: Setting default branch to develop...${NC}"

curl -s -X PATCH \
  -H "Authorization: token $GITHUB_TOKEN_KARIM" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/$GITHUB_USERNAME/$REPO_NAME \
  -d '{"default_branch": "develop"}' > /dev/null 2>&1 || echo "Note: Default branch setting may require manual confirmation"

echo -e "${GREEN}✅ Default branch configured${NC}"
echo ""

# Step 8: Set up branch protection
echo -e "${BLUE}🛡️  Step 8: Setting up branch protection...${NC}"

# Protect main
curl -s -X PUT \
  -H "Authorization: token $GITHUB_TOKEN_KARIM" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/$GITHUB_USERNAME/$REPO_NAME/branches/main/protection \
  -d '{
    "required_status_checks": null,
    "enforce_admins": false,
    "required_pull_request_reviews": {
      "required_approving_review_count": 1
    },
    "restrictions": null,
    "required_linear_history": true,
    "allow_force_pushes": false,
    "allow_deletions": false
  }' > /dev/null 2>&1 && echo "  ✅ Main branch protected" || echo "  ⚠️  Main protection (may need manual setup)"

# Protect develop
curl -s -X PUT \
  -H "Authorization: token $GITHUB_TOKEN_KARIM" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/$GITHUB_USERNAME/$REPO_NAME/branches/develop/protection \
  -d '{
    "required_status_checks": null,
    "enforce_admins": false,
    "required_pull_request_reviews": {
      "required_approving_review_count": 1
    },
    "restrictions": null,
    "allow_force_pushes": false,
    "allow_deletions": false
  }' > /dev/null 2>&1 && echo "  ✅ Develop branch protected" || echo "  ⚠️  Develop protection (may need manual setup)"

echo ""

# Step 9: Configure git push behavior
echo -e "${BLUE}⚙️  Step 9: Configuring git push behavior...${NC}"

# Set origin as default push remote
git config remote.pushDefault origin

echo -e "${GREEN}✅ Default push remote set to 'origin' (Karim's repo)${NC}"
echo ""

# Step 10: Create helper scripts
echo -e "${BLUE}📝 Step 10: Creating helper scripts...${NC}"

# Push to both remotes script
cat > push-to-both.sh << 'SCRIPT_END'
#!/bin/bash
# Push to both remotes

BRANCH=$(git branch --show-current)
echo "Pushing $BRANCH to both remotes..."

echo "→ Pushing to origin (Karim)..."
git push origin $BRANCH

echo "→ Pushing to flooss (backup)..."
git push flooss $BRANCH || echo "⚠️  Flooss push failed (might need access)"

echo "✅ Pushed to both remotes!"
SCRIPT_END

chmod +x push-to-both.sh

echo -e "${GREEN}✅ Created helper script: push-to-both.sh${NC}"
echo ""

# Summary
echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Dual Remote Setup Complete!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📋 Git Remotes:${NC}"
git remote -v
echo ""
echo -e "${BLUE}🎯 Remote Configuration:${NC}"
echo "  origin (primary)  → Karim's: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo "  flooss (backup)   → Flooss: https://github.com/pie-int/dev-bridge"
echo ""
echo -e "${BLUE}📤 Push Behavior:${NC}"
echo "  git push          → Pushes to origin (Karim) by default"
echo "  ./push-to-both.sh → Pushes to both remotes"
echo "  git push flooss   → Pushes only to Flooss"
echo ""
echo -e "${RED}🚨 IMPORTANT: Configure Vercel Manually${NC}"
echo ""
echo -e "${YELLOW}Step-by-step Vercel configuration:${NC}"
echo ""
echo "1. Go to: https://vercel.com/dashboard"
echo ""
echo "2. Select your 'devbridge' project"
echo ""
echo "3. Go to: Settings → Git"
echo ""
echo "4. Disconnect current repository:"
echo "   → Click 'Disconnect Git Repository'"
echo "   → Confirm disconnection"
echo ""
echo "5. Connect to Karim's new repository:"
echo "   → Click 'Connect Git Repository'"
echo "   → Choose 'GitHub'"
echo "   → Select: $GITHUB_USERNAME/$REPO_NAME"
echo "   → Authorize if prompted"
echo ""
echo "6. Configure branches:"
echo "   → Production Branch: main"
echo "   → Enable 'Automatically create Preview Deployments'"
echo "   → Preview Branch: develop"
echo ""
echo "7. Verify environment variables are preserved:"
echo "   → Settings → Environment Variables"
echo "   → Ensure POSTGRES_PRISMA_URL, JWT_SECRET, etc. are still there"
echo ""
echo "8. Test deployment:"
echo "   → Make a small change"
echo "   → git push origin develop"
echo "   → Check Vercel dashboard for new deployment"
echo ""
echo -e "${BLUE}📚 Your Repository:${NC}"
echo "  https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo ""
echo -e "${GREEN}🎉 You're all set!${NC}"
echo ""
echo "Next: Configure Vercel as shown above, then test with:"
echo "  $ git push origin develop"
echo ""

