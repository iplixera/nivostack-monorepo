#!/bin/bash

# ============================================
# GitHub CLI Installation & Setup Script
# ============================================

set -e

echo ""
echo "🚀 GitHub CLI Setup for DevBridge"
echo "==================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo -e "${RED}❌ This script is for macOS only${NC}"
    echo "For other OS, see: https://github.com/cli/cli#installation"
    exit 1
fi

# Step 1: Check if Homebrew is installed
echo -e "${BLUE}🍺 Step 1: Checking Homebrew...${NC}"
if ! command -v brew &> /dev/null; then
    echo -e "${YELLOW}⚠️  Homebrew not found. Installing...${NC}"
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
else
    echo -e "${GREEN}✅ Homebrew installed${NC}"
fi
echo ""

# Step 2: Install GitHub CLI
echo -e "${BLUE}📦 Step 2: Installing GitHub CLI...${NC}"
if command -v gh &> /dev/null; then
    echo -e "${GREEN}✅ GitHub CLI already installed${NC}"
    gh --version
else
    brew install gh
    echo -e "${GREEN}✅ GitHub CLI installed${NC}"
    gh --version
fi
echo ""

# Step 3: Authenticate
echo -e "${BLUE}🔐 Step 3: Authenticating with GitHub...${NC}"
if gh auth status &> /dev/null; then
    echo -e "${GREEN}✅ Already authenticated${NC}"
    gh auth status
else
    echo -e "${YELLOW}⚠️  Not authenticated. Starting login...${NC}"
    echo ""
    echo "Please follow the prompts to authenticate:"
    echo "1. Choose: GitHub.com"
    echo "2. Choose: HTTPS"
    echo "3. Choose: Login with a web browser"
    echo "4. Copy the code and press Enter"
    echo "5. Authorize in browser"
    echo ""
    gh auth login
fi
echo ""

# Step 4: Verify access to repo
echo -e "${BLUE}🔍 Step 4: Verifying repository access...${NC}"
if gh repo view pie-int/dev-bridge &> /dev/null; then
    echo -e "${GREEN}✅ Can access pie-int/dev-bridge${NC}"
else
    echo -e "${RED}❌ Cannot access repository${NC}"
    echo "Make sure you have access to: https://github.com/pie-int/dev-bridge"
    exit 1
fi
echo ""

# Step 5: Install Vercel CLI (if not already)
echo -e "${BLUE}📦 Step 5: Checking Vercel CLI...${NC}"
if command -v vercel &> /dev/null; then
    echo -e "${GREEN}✅ Vercel CLI already installed${NC}"
    vercel --version
else
    echo -e "${YELLOW}⚠️  Installing Vercel CLI...${NC}"
    if command -v pnpm &> /dev/null; then
        pnpm add -g vercel
    elif command -v npm &> /dev/null; then
        npm install -g vercel
    else
        echo -e "${RED}❌ Neither pnpm nor npm found${NC}"
        echo "Please install Node.js first"
        exit 1
    fi
    echo -e "${GREEN}✅ Vercel CLI installed${NC}"
fi
echo ""

# Step 6: Get Vercel info
echo -e "${BLUE}📋 Step 6: Getting Vercel project info...${NC}"
if [ -f "vercel.properties" ]; then
    VERCEL_TOKEN=$(grep VERCEL_TOKEN vercel.properties | cut -d= -f2)
    if [ -n "$VERCEL_TOKEN" ]; then
        echo -e "${GREEN}✅ Vercel token found in vercel.properties${NC}"
    fi
fi

# Try to get project info
if command -v vercel &> /dev/null && [ -n "$VERCEL_TOKEN" ]; then
    export VERCEL_TOKEN
    echo ""
    echo "Fetching Vercel project details..."
    vercel project ls 2>/dev/null || echo "Run 'vercel link' to connect project"
fi
echo ""

# Step 7: Create tokens template
echo -e "${BLUE}📝 Step 7: Creating tokens template...${NC}"
TOKENS_FILE="$HOME/.devbridge_tokens"
if [ ! -f "$TOKENS_FILE" ]; then
    cat > "$TOKENS_FILE" << 'EOF'
# DevBridge Tokens
# KEEP THIS FILE SECURE - chmod 600
# Never commit this file to git

# GitHub Personal Access Token
# Create at: https://github.com/settings/tokens/new
# Scopes needed: repo, workflow, admin:repo_hook
GITHUB_TOKEN=ghp_your_token_here

# Vercel Token (from vercel.properties)
VERCEL_TOKEN=your_vercel_token_here

# Vercel Organization ID
# Get from: https://vercel.com/account
VERCEL_ORG_ID=team_your_org_id_here

# Vercel Project ID  
# Get from: Vercel Project Settings
VERCEL_PROJECT_ID=prj_your_project_id_here

# Database URLs (optional - for local dev)
DATABASE_URL=postgresql://localhost/devbridge_dev
EOF
    chmod 600 "$TOKENS_FILE"
    echo -e "${GREEN}✅ Created token template: $TOKENS_FILE${NC}"
    echo -e "${YELLOW}📝 Edit this file and add your tokens${NC}"
else
    echo -e "${GREEN}✅ Tokens file already exists: $TOKENS_FILE${NC}"
fi
echo ""

# Summary
echo ""
echo -e "${GREEN}════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo -e "${GREEN}════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📋 What was installed:${NC}"
echo "  ✓ Homebrew (if needed)"
echo "  ✓ GitHub CLI (gh)"
echo "  ✓ Vercel CLI"
echo "  ✓ Token template file"
echo ""
echo -e "${BLUE}✅ What works now:${NC}"
gh --version | head -1
vercel --version | head -1
echo ""
echo -e "${BLUE}🔐 Authentication status:${NC}"
gh auth status 2>&1 | grep -E "Logged in|Token:"
echo ""
echo -e "${BLUE}📝 Next Steps:${NC}"
echo ""
echo "1. Create GitHub Personal Access Token:"
echo "   → https://github.com/settings/tokens/new"
echo "   → Scopes: repo, workflow, admin:repo_hook"
echo "   → Copy token"
echo ""
echo "2. Add tokens to: $TOKENS_FILE"
echo "   $ nano $TOKENS_FILE"
echo ""
echo "3. Get Vercel Project IDs:"
echo "   $ vercel project ls"
echo "   $ # Copy Project ID and Org ID"
echo ""
echo "4. Add GitHub Secrets:"
echo "   $ gh secret set VERCEL_TOKEN --body \"your_token\""
echo "   $ gh secret set VERCEL_ORG_ID --body \"your_org_id\""
echo "   $ gh secret set VERCEL_PROJECT_ID --body \"your_project_id\""
echo ""
echo "5. Set up branch protection:"
echo "   $ cd /Users/karim-f/Code/devbridge"
echo "   $ ./scripts/setup-branch-protection.sh"
echo ""
echo "6. Create development branches:"
echo "   $ ./setup-branches.sh"
echo ""
echo -e "${GREEN}📚 Documentation: docs/GITHUB_CLI_SETUP.md${NC}"
echo ""

