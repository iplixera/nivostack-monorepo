#!/bin/bash

# ============================================
# Update GitHub Issue Status on Merge to Main
# ============================================
# 
# This script should be run in GitHub Actions when PR is merged to main
# It closes the associated issue and adds a comment
#
# Usage: ./update-issue-on-merge.sh <issue_number> [pr_number] [pr_url]

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

# Get arguments
ISSUE_NUMBER="${1:-}"
PR_NUMBER="${2:-}"
PR_URL="${3:-}"

if [ -z "$ISSUE_NUMBER" ]; then
    echo -e "${YELLOW}Usage:${NC}"
    echo "  $0 <issue_number> [pr_number] [pr_url]"
    echo ""
    echo -e "${YELLOW}Example:${NC}"
    echo "  $0 86 123 https://github.com/iplixera/nivostack-monorepo/pull/123"
    exit 1
fi

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) is not installed${NC}"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${RED}❌ Not authenticated with GitHub${NC}"
    exit 1
fi

echo -e "${BLUE}🔄 Updating Issue #${ISSUE_NUMBER}${NC}"
echo "=================================="
echo ""

# Build comment
COMMENT="✅ **Merged to main**"
if [ -n "$PR_NUMBER" ]; then
    COMMENT="${COMMENT}\n\nRelated PR: #${PR_NUMBER}"
fi
if [ -n "$PR_URL" ]; then
    COMMENT="${COMMENT}\nPR URL: ${PR_URL}"
fi
COMMENT="${COMMENT}\n\nThis issue is now complete and merged."

# Add comment to issue
echo "Adding comment to issue..."
gh issue comment "${ISSUE_NUMBER}" \
    --repo "$REPO_OWNER/$REPO_NAME" \
    --body "$COMMENT"

# Close the issue
echo "Closing issue..."
gh issue close "${ISSUE_NUMBER}" \
    --repo "$REPO_OWNER/$REPO_NAME" \
    --comment "Closed automatically after merge to main"

echo ""
echo -e "${GREEN}✅ Issue #${ISSUE_NUMBER} updated successfully!${NC}"
echo "Issue URL: https://github.com/$REPO_OWNER/$REPO_NAME/issues/${ISSUE_NUMBER}"

