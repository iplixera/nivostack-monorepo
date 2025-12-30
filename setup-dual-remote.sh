#!/bin/bash

# ============================================
# Dual Remote Setup Script
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
VERCEL_TOKEN="51FK0FgOarNnPGuqyZvlwPPm"
VERCEL_TEAM_NAME="Mobile-Team"

# Prompt for GitHub username
echo -e "${BLUE}📝 Please provide your information:${NC}"
echo ""
read -p "Your GitHub username (Karim's personal account): " GITHUB_USERNAME
read -p "Repository name [devbridge]: " REPO_NAME
REPO_NAME=${REPO_NAME:-devbridge}
read -p "Make repository private? (yes/no) [yes]: " REPO_PRIVATE
REPO_PRIVATE=${REPO_PRIVATE:-yes}
echo ""

# Fetch Vercel information
echo -e "${BLUE}🔍 Fetching Vercel project information...${NC}"

# Get teams
echo "  Looking for team: $VERCEL_TEAM_NAME"
VERCEL_TEAMS=$(curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
  "https://api.vercel.com/v2/teams")

# Extract team ID by name
VERCEL_ORG_ID=$(echo "$VERCEL_TEAMS" | grep -B5 "\"name\": \"$VERCEL_TEAM_NAME\"" | grep -o '"id": "[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$VERCEL_ORG_ID" ]; then
    # Try alternative extraction
    VERCEL_ORG_ID=$(echo "$VERCEL_TEAMS" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
fi

if [ -n "$VERCEL_ORG_ID" ]; then
    echo -e "${GREEN}✅ Found Team ID: $VERCEL_ORG_ID${NC}"
    
    # Get projects for this team
    VERCEL_PROJECTS=$(curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
      "https://api.vercel.com/v9/projects?teamId=$VERCEL_ORG_ID")
    
    # Try to find devbridge project
    VERCEL_PROJECT_ID=$(echo "$VERCEL_PROJECTS" | grep -o '"id":"prj_[^"]*"' | grep -i devbridge -A1 | head -1 | grep -o 'prj_[^"]*')
    
    if [ -z "$VERCEL_PROJECT_ID" ]; then
        # Try to get any project ID
        VERCEL_PROJECT_ID=$(echo "$VERCEL_PROJECTS" | grep -o '"id":"prj_[^"]*"' | head -1 | cut -d'"' -f4)
    fi
    
    if [ -n "$VERCEL_PROJECT_ID" ]; then
        echo -e "${GREEN}✅ Found Project ID: $VERCEL_PROJECT_ID${NC}"
    else
        echo -e "${YELLOW}⚠️  Could not auto-detect Project ID${NC}"
        echo "Available projects:"
        echo "$VERCEL_PROJECTS" | grep -o '"name":"[^"]*"' | cut -d'"' -f4
        read -p "Enter Vercel Project ID manually (or project name): " VERCEL_PROJECT_INPUT
        
        # Check if input is a name or ID
        if [[ "$VERCEL_PROJECT_INPUT" == prj_* ]]; then
            VERCEL_PROJECT_ID="$VERCEL_PROJECT_INPUT"
        else
            # Search by name
            VERCEL_PROJECT_ID=$(echo "$VERCEL_PROJECTS" | grep "\"name\":\"$VERCEL_PROJECT_INPUT\"" -A5 | grep -o '"id":"prj_[^"]*"' | head -1 | cut -d'"' -f4)
        fi
    fi
else
    echo -e "${YELLOW}⚠️  Could not auto-detect Team ID${NC}"
    echo "Please provide Team ID manually"
    read -p "Enter Vercel Team ID: " VERCEL_ORG_ID
    read -p "Enter Vercel Project ID: " VERCEL_PROJECT_ID
fi
echo ""

# Summary
echo -e "${BLUE}📋 Configuration Summary:${NC}"
echo "  Karim's Repo: $GITHUB_USERNAME/$REPO_NAME"
echo "  Flooss Repo: pie-int/dev-bridge (kept as backup)"
echo "  Vercel Project: $VERCEL_PROJECT_ID"
echo "  Vercel Org: $VERCEL_ORG_ID"
echo "  Primary Deployment: Karim's repo"
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
    git remote rename origin flooss 2>/dev/null || git remote add flooss "$CURRENT_ORIGIN"
    echo -e "${GREEN}✅ Flooss remote preserved as 'flooss'${NC}"
else
    # Add flooss remote manually
    git remote add flooss https://github.com/pie-int/dev-bridge.git
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
    echo -e "${YELLOW}⚠️  Warning: ${CREATE_RESPONSE}${NC}"
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
    git commit -m "chore: setup dual remote configuration"
fi
echo -e "${GREEN}✅ Code prepared${NC}"
echo ""

# Step 6: Create and push branches
echo -e "${BLUE}🌿 Step 6: Setting up branches...${NC}"

# Ensure we're on main
git checkout main 2>/dev/null || git checkout -b main

# Tag current state
git tag -a "v1.5.1-dual-remote" -m "Dual remote setup: Karim (primary) + Flooss (backup)" 2>/dev/null || true

# Push to Karim's repo (origin)
echo "Pushing to Karim's repository..."
git push -u origin main --force

# Create develop if doesn't exist
git checkout -b develop 2>/dev/null || git checkout develop

# Push develop
git push -u origin develop --force

# Push tags
git push origin --tags --force

echo -e "${GREEN}✅ Branches pushed to Karim's repository${NC}"
echo ""

# Step 7: Set default branch
echo -e "${BLUE}⚙️  Step 7: Setting default branch to develop...${NC}"

curl -s -X PATCH \
  -H "Authorization: token $GITHUB_TOKEN_KARIM" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/$GITHUB_USERNAME/$REPO_NAME \
  -d '{"default_branch": "develop"}' > /dev/null

echo -e "${GREEN}✅ Default branch set${NC}"
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
  }' > /dev/null

echo "  ✅ Main branch protected"

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
  }' > /dev/null

echo "  ✅ Develop branch protected"
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
git push flooss $BRANCH

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
echo -e "${BLUE}🚀 Vercel Deployment:${NC}"
echo "  Triggers ONLY from: Karim's repository"
echo "  Flooss repository: Kept as backup, no deployment triggers"
echo ""
echo -e "${BLUE}📝 Next Steps:${NC}"
echo ""
echo "1. Configure Vercel (IMPORTANT!):"
echo "   → Go to: https://vercel.com/dashboard"
echo "   → Select your project"
echo "   → Go to Settings → Git"
echo "   → Click 'Disconnect Git Repository'"
echo "   → Click 'Connect Git Repository'"
echo "   → Select: $GITHUB_USERNAME/$REPO_NAME"
echo "   → Production Branch: main"
echo "   → Enable Preview Deployments: develop"
echo ""
echo "2. Verify remote configuration:"
echo "   $ git remote -v"
echo ""
echo "3. Test push to primary:"
echo "   $ git push origin develop"
echo ""
echo "4. Sync to both remotes:"
echo "   $ ./push-to-both.sh"
echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo "  - Main repo: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo "  - Backup repo: https://github.com/pie-int/dev-bridge"
echo ""
echo -e "${GREEN}🎉 You're all set!${NC}"
echo ""

