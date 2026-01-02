#!/bin/bash

# ============================================
# Check GitHub Token Configuration
# ============================================

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "🔍 Checking GitHub Token Configuration"
echo "========================================"
echo ""

# Check environment variable
if [ -n "$GITHUB_TOKEN" ]; then
    echo -e "${GREEN}✅ GITHUB_TOKEN environment variable is set${NC}"
    echo "   Token preview: ${GITHUB_TOKEN:0:10}..."
else
    echo -e "${YELLOW}⚠️  GITHUB_TOKEN environment variable not set${NC}"
fi

# Check token file
TOKENS_FILE="$HOME/.devbridge_tokens"
if [ -f "$TOKENS_FILE" ]; then
    echo -e "${GREEN}✅ Token file exists: $TOKENS_FILE${NC}"
    if grep -q "GITHUB_TOKEN=" "$TOKENS_FILE"; then
        TOKEN_VALUE=$(grep "GITHUB_TOKEN=" "$TOKENS_FILE" | cut -d'=' -f2 | tr -d '"' | tr -d "'" | xargs)
        if [ -n "$TOKEN_VALUE" ] && [ "$TOKEN_VALUE" != "ghp_your_token_here" ]; then
            echo -e "${GREEN}   Token found: ${TOKEN_VALUE:0:10}...${NC}"
        else
            echo -e "${YELLOW}   Token placeholder found (not configured)${NC}"
        fi
    else
        echo -e "${YELLOW}   No GITHUB_TOKEN in file${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Token file not found: $TOKENS_FILE${NC}"
fi

# Check GitHub CLI
if command -v gh &> /dev/null; then
    echo -e "${GREEN}✅ GitHub CLI is installed${NC}"
    if gh auth status &> /dev/null; then
        echo -e "${GREEN}   GitHub CLI is authenticated${NC}"
        gh auth status 2>&1 | grep -E "Logged in|Token:" | head -2
    else
        echo -e "${YELLOW}   GitHub CLI not authenticated${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  GitHub CLI not installed${NC}"
fi

echo ""
echo "📋 Summary:"
echo "==========="

# Test token if available
TOKEN_TO_TEST=""
if [ -n "$GITHUB_TOKEN" ]; then
    TOKEN_TO_TEST="$GITHUB_TOKEN"
elif [ -f "$TOKENS_FILE" ]; then
    TOKEN_VALUE=$(grep "GITHUB_TOKEN=" "$TOKENS_FILE" 2>/dev/null | cut -d'=' -f2 | tr -d '"' | tr -d "'" | xargs)
    if [ -n "$TOKEN_VALUE" ] && [ "$TOKEN_VALUE" != "ghp_your_token_here" ]; then
        TOKEN_TO_TEST="$TOKEN_VALUE"
    fi
fi

if [ -n "$TOKEN_TO_TEST" ]; then
    echo -e "${BLUE}Testing token authentication...${NC}"
    # Test token with GitHub API
    RESPONSE=$(curl -s -H "Authorization: token $TOKEN_TO_TEST" \
        -H "Accept: application/vnd.github.v3+json" \
        https://api.github.com/user 2>&1)
    
    if echo "$RESPONSE" | grep -q '"login"'; then
        USERNAME=$(echo "$RESPONSE" | grep '"login"' | head -1 | sed 's/.*"login": *"\([^"]*\)".*/\1/')
        echo -e "${GREEN}✅ Token is valid!${NC}"
        echo -e "${GREEN}   Authenticated as: $USERNAME${NC}"
        echo ""
        echo -e "${GREEN}✅ Ready to create GitHub issues!${NC}"
        echo ""
        echo "Run: ./scripts/sync-tracker-to-github.sh"
    else
        echo -e "${RED}❌ Token authentication failed${NC}"
        echo "   Response: ${RESPONSE:0:200}"
        echo ""
        echo "Please check:"
        echo "  1. Token is valid and not expired"
        echo "  2. Token has 'repo' scope"
        echo "  3. Token has access to iplixera/nivostack-monorepo"
    fi
else
    echo -e "${YELLOW}⚠️  No token found to test${NC}"
    echo ""
    echo "To set up a token:"
    echo "  1. Create token: https://github.com/settings/tokens/new"
    echo "  2. Set environment variable: export GITHUB_TOKEN=ghp_..."
    echo "  3. Or add to ~/.devbridge_tokens: GITHUB_TOKEN=ghp_..."
    echo ""
    echo "See: docs/GITHUB_TOKEN_SETUP.md"
fi

echo ""

