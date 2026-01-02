#!/bin/bash

# ============================================
# Create GitHub Issue from Command Line
# ============================================
# 
# Quick script to create a GitHub issue directly
# Usage: ./scripts/create-github-issue.sh "Title" "Description" "testing,ui"

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
REPO_OWNER="iplixera"
REPO_NAME="nivostack-monorepo"

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) is not installed${NC}"
    echo ""
    echo "Install it with:"
    echo "  brew install gh"
    echo ""
    echo "Or run the setup script:"
    echo "  ./setup-github-cli.sh"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${RED}❌ Not authenticated with GitHub${NC}"
    echo ""
    echo "Authenticate with:"
    echo "  gh auth login"
    exit 1
fi

# Get arguments
TITLE="${1:-}"
BODY="${2:-}"
LABELS="${3:-testing,ui}"

if [ -z "$TITLE" ]; then
    echo -e "${YELLOW}Usage:${NC}"
    echo "  $0 \"Issue Title\" \"Issue Description\" \"label1,label2\""
    echo ""
    echo -e "${YELLOW}Example:${NC}"
    echo "  $0 \"Fix button styling\" \"The submit button needs better contrast\" \"ui,frontend\""
    echo ""
    echo -e "${YELLOW}Interactive mode:${NC}"
    read -p "Issue title: " TITLE
    read -p "Issue description: " BODY
    read -p "Labels (comma-separated, default: testing,ui): " LABELS_INPUT
    LABELS="${LABELS_INPUT:-$LABELS}"
fi

if [ -z "$TITLE" ]; then
    echo -e "${RED}❌ Title is required${NC}"
    exit 1
fi

echo -e "${BLUE}🚀 Creating GitHub Issue${NC}"
echo "=================================="
echo ""
echo "Repository: $REPO_OWNER/$REPO_NAME"
echo "Title: $TITLE"
echo "Labels: $LABELS"
echo ""

# Create issue
if [ -z "$BODY" ]; then
    issue_output=$(gh issue create \
        --repo "$REPO_OWNER/$REPO_NAME" \
        --title "$TITLE" \
        --label "$LABELS" 2>&1)
else
    issue_output=$(gh issue create \
        --repo "$REPO_OWNER/$REPO_NAME" \
        --title "$TITLE" \
        --body "$BODY" \
        --label "$LABELS" 2>&1)
fi

if [ $? -eq 0 ]; then
    # Extract issue number
    issue_number=$(echo "$issue_output" | grep -oE '/issues/[0-9]+' | grep -oE '[0-9]+' | head -1)
    issue_url=$(echo "$issue_output" | grep -oE 'https://[^ ]+')
    
    echo -e "${GREEN}✅ Issue created successfully!${NC}"
    echo ""
    echo "Issue #$issue_number"
    echo "URL: $issue_url"
    echo ""
    echo "You can add this to your tracker:"
    echo "  | XXX | $TITLE | Category | P1 | :white_circle: Not Started | #$issue_number | $BODY |"
else
    echo -e "${RED}❌ Failed to create issue${NC}"
    echo "$issue_output"
    exit 1
fi

