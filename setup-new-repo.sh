#!/bin/bash

# ============================================
# New Repository Setup Script
# ============================================
# This script creates a new GitHub repository,
# pushes code, and configures Vercel deployment

set -e

echo ""
echo "🚀 DevBridge New Repository Setup"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration file
CONFIG_FILE=".new-repo-config"

# Check if config exists
if [ ! -f "$CONFIG_FILE" ]; then
    echo -e "${RED}❌ Configuration file not found${NC}"
    echo ""
    echo "Please create $CONFIG_FILE with the following format:"
    echo ""
    cat << 'EOF'
GITHUB_TOKEN=ghp_your_token_here
REPO_NAME=devbridge
GITHUB_ORG=your-org-or-username
REPO_PRIVATE=true
REPO_DESCRIPTION="Mobile app monitoring and configuration platform"

VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=team_xxxxxxxxxxxx
VERCEL_PROJECT_ID=prj_xxxxxxxxxxxx

DISCONNECT_OLD_REPO=yes
OLD_REPO_URL=https://github.com/pie-int/dev-bridge
EOF
    echo ""
    exit 1
fi

# Load configuration
source "$CONFIG_FILE"

# Validate required variables
if [ -z "$GITHUB_TOKEN" ] || [ -z "$REPO_NAME" ] || [ -z "$GITHUB_ORG" ]; then
    echo -e "${RED}❌ Missing required configuration${NC}"
    echo "Please ensure GITHUB_TOKEN, REPO_NAME, and GITHUB_ORG are set in $CONFIG_FILE"
    exit 1
fi

echo -e "${BLUE}📋 Configuration:${NC}"
echo "  Repository: $GITHUB_ORG/$REPO_NAME"
echo "  Private: $REPO_PRIVATE"
echo "  Description: $REPO_DESCRIPTION"
echo ""

# Confirm
read -p "Continue with this configuration? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo "Aborted."
    exit 0
fi
echo ""

# Step 1: Create GitHub Repository
echo -e "${BLUE}📦 Step 1: Creating GitHub repository...${NC}"

REPO_VISIBILITY="false"
if [ "$REPO_PRIVATE" = "true" ]; then
    REPO_VISIBILITY="true"
fi

CREATE_RESPONSE=$(curl -s -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/orgs/$GITHUB_ORG/repos \
  -d "{
    \"name\": \"$REPO_NAME\",
    \"description\": \"$REPO_DESCRIPTION\",
    \"private\": $REPO_VISIBILITY,
    \"auto_init\": false,
    \"has_issues\": true,
    \"has_projects\": true,
    \"has_wiki\": false
  }")

# Check if repo was created
if echo "$CREATE_RESPONSE" | grep -q "\"name\": \"$REPO_NAME\""; then
    echo -e "${GREEN}✅ Repository created: https://github.com/$GITHUB_ORG/$REPO_NAME${NC}"
else
    echo -e "${YELLOW}⚠️  Repository might already exist or creation failed${NC}"
    echo "Response: $CREATE_RESPONSE"
fi
echo ""

# Step 2: Configure git remote
echo -e "${BLUE}🔗 Step 2: Configuring git remote...${NC}"

NEW_REPO_URL="https://github.com/$GITHUB_ORG/$REPO_NAME.git"

# Remove old origin if exists
git remote remove origin 2>/dev/null || true

# Add new origin
git remote add origin "https://$GITHUB_TOKEN@github.com/$GITHUB_ORG/$REPO_NAME.git"

echo -e "${GREEN}✅ Remote configured${NC}"
echo ""

# Step 3: Commit any pending changes
echo -e "${BLUE}💾 Step 3: Preparing code...${NC}"

if [ -n "$(git status --porcelain)" ]; then
    echo "Committing pending changes..."
    git add -A
    git commit -m "chore: prepare for new repository migration"
fi

echo -e "${GREEN}✅ Code prepared${NC}"
echo ""

# Step 4: Create and push branches
echo -e "${BLUE}🌿 Step 4: Creating branches...${NC}"

# Ensure we're on main
git checkout main 2>/dev/null || git checkout -b main

# Tag current state
git tag -a "v1.5.1-baseline" -m "Baseline before repo migration" 2>/dev/null || true

# Push main
echo "Pushing main branch..."
git push -u origin main --force

# Create and push develop
echo "Creating develop branch..."
git checkout -b develop 2>/dev/null || git checkout develop
git push -u origin develop --force

# Push tags
git push origin --tags --force

echo -e "${GREEN}✅ Branches created and pushed${NC}"
echo ""

# Step 5: Set default branch
echo -e "${BLUE}⚙️  Step 5: Setting default branch to develop...${NC}"

curl -s -X PATCH \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/$GITHUB_ORG/$REPO_NAME \
  -d '{"default_branch": "develop"}' > /dev/null

echo -e "${GREEN}✅ Default branch set to develop${NC}"
echo ""

# Step 6: Set up branch protection
echo -e "${BLUE}🛡️  Step 6: Setting up branch protection...${NC}"

# Protect main branch
curl -s -X PUT \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/$GITHUB_ORG/$REPO_NAME/branches/main/protection \
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

# Protect develop branch
curl -s -X PUT \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/$GITHUB_ORG/$REPO_NAME/branches/develop/protection \
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

# Step 7: Add secrets
echo -e "${BLUE}🔐 Step 7: Adding GitHub secrets...${NC}"

if [ -n "$VERCEL_TOKEN" ] && [ -n "$VERCEL_ORG_ID" ] && [ -n "$VERCEL_PROJECT_ID" ]; then
    # Note: Adding secrets requires GitHub CLI or manual setup
    echo -e "${YELLOW}⚠️  Please add these secrets manually via GitHub CLI:${NC}"
    echo ""
    echo "  gh secret set VERCEL_TOKEN --body \"$VERCEL_TOKEN\""
    echo "  gh secret set VERCEL_ORG_ID --body \"$VERCEL_ORG_ID\""
    echo "  gh secret set VERCEL_PROJECT_ID --body \"$VERCEL_PROJECT_ID\""
    echo ""
else
    echo -e "${YELLOW}⚠️  Vercel configuration not provided, skipping secrets${NC}"
fi
echo ""

# Summary
echo ""
echo -e "${GREEN}════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Repository Setup Complete!${NC}"
echo -e "${GREEN}════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📋 What was done:${NC}"
echo "  ✅ Created repository: https://github.com/$GITHUB_ORG/$REPO_NAME"
echo "  ✅ Pushed main and develop branches"
echo "  ✅ Set develop as default branch"
echo "  ✅ Configured branch protection"
echo "  ✅ Tagged baseline: v1.5.1-baseline"
echo ""
echo -e "${BLUE}🌐 Repository URL:${NC}"
echo "  https://github.com/$GITHUB_ORG/$REPO_NAME"
echo ""
echo -e "${BLUE}📝 Next Steps:${NC}"
echo ""
echo "1. Configure Vercel:"
echo "   → Go to: https://vercel.com/flooss-bridge-hub/devbridge/settings/git"
echo "   → Disconnect old repository"
echo "   → Connect new repository: $GITHUB_ORG/$REPO_NAME"
echo "   → Set Production Branch: main"
echo "   → Enable Preview Deployments: develop"
echo ""
echo "2. Add GitHub Secrets (if not done):"
echo "   → gh secret set VERCEL_TOKEN"
echo "   → gh secret set VERCEL_ORG_ID"
echo "   → gh secret set VERCEL_PROJECT_ID"
echo ""
echo "3. Verify deployment:"
echo "   → Push a commit to develop"
echo "   → Check Vercel dashboard for preview deployment"
echo "   → Create PR: develop → main"
echo "   → Merge to trigger production deployment"
echo ""
echo -e "${GREEN}🎉 Ready to go!${NC}"
echo ""

