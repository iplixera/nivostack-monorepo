#!/bin/bash

# ============================================
# Sync Tracker to GitHub Issues
# ============================================
# 
# This script reads the tracker file and creates/updates GitHub issues
# for items that don't have a GitHub issue number yet.
#
# Note: This script is a wrapper that calls the Python version for better reliability.

set -e

# Use Python version if available, otherwise fall back to bash implementation
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PYTHON_SCRIPT="$SCRIPT_DIR/sync-tracker-to-github.py"

if [ -f "$PYTHON_SCRIPT" ] && command -v python3 &> /dev/null; then
    exec python3 "$PYTHON_SCRIPT" "$@"
fi

# Fallback to bash implementation below
set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
TRACKER_FILE="docs/TRACKER_TESTING_UI.md"
REPO_OWNER="iplixera"
REPO_NAME="nivostack-monorepo"
LABELS_TESTING="testing,integration"
LABELS_UI="ui,frontend"

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

# Check if tracker file exists
if [ ! -f "$TRACKER_FILE" ]; then
    echo -e "${RED}❌ Tracker file not found: $TRACKER_FILE${NC}"
    exit 1
fi

echo -e "${BLUE}🚀 Syncing Tracker to GitHub Issues${NC}"
echo "=================================="
echo ""
echo "Repository: $REPO_OWNER/$REPO_NAME"
echo "Tracker: $TRACKER_FILE"
echo ""

# Extract items from tracker that don't have GitHub issues
echo -e "${BLUE}📋 Scanning tracker file...${NC}"

# Create temporary files
TEMP_DIR=$(mktemp -d)
TESTING_ITEMS="$TEMP_DIR/testing_items.txt"
UI_ITEMS="$TEMP_DIR/ui_items.txt"

# Extract testing tasks (lines with TEST-XXX that don't have a GitHub issue number)
grep -E "^\| TEST-" "$TRACKER_FILE" | grep -E "\| - \|" > "$TESTING_ITEMS" || true

# Extract UI changes (lines with UI-XXX that don't have a GitHub issue number)
grep -E "^\| UI-" "$TRACKER_FILE" | grep -E "\| - \|" > "$UI_ITEMS" || true

TESTING_COUNT=$(wc -l < "$TESTING_ITEMS" | tr -d ' ')
UI_COUNT=$(wc -l < "$UI_ITEMS" | tr -d ' ')

echo "Found $TESTING_COUNT testing tasks without GitHub issues"
echo "Found $UI_COUNT UI changes without GitHub issues"
echo ""

if [ "$TESTING_COUNT" -eq 0 ] && [ "$UI_COUNT" -eq 0 ]; then
    echo -e "${GREEN}✅ All items already have GitHub issues${NC}"
    rm -rf "$TEMP_DIR"
    exit 0
fi

# Function to create GitHub issue
create_issue() {
    local title="$1"
    local body="$2"
    local labels="$3"
    local issue_type="$4"
    
    echo -e "${YELLOW}Creating issue: $title${NC}"
    
    # Create issue via GitHub CLI
    local issue_output
    issue_output=$(gh issue create \
        --repo "$REPO_OWNER/$REPO_NAME" \
        --title "$title" \
        --body "$body" \
        --label "$labels" 2>&1) || {
        echo -e "${RED}❌ Failed to create issue: $title${NC}"
        echo "$issue_output"
        return 1
    }
    
    # Extract issue number from output (format: "https://github.com/owner/repo/issues/123")
    local issue_number
    issue_number=$(echo "$issue_output" | grep -oE '/issues/[0-9]+' | grep -oE '[0-9]+' | head -1)
    
    if [ -n "$issue_number" ]; then
        echo -e "${GREEN}✅ Created issue #$issue_number${NC}"
        echo "$issue_number"
    else
        echo -e "${RED}❌ Could not extract issue number${NC}"
        echo "$issue_output"
        return 1
    fi
}

# Process testing tasks
if [ "$TESTING_COUNT" -gt 0 ]; then
    echo -e "${BLUE}📝 Processing testing tasks...${NC}"
    
    while IFS='|' read -r id title category priority status github_issue notes; do
        # Clean up whitespace
        id=$(echo "$id" | xargs)
        title=$(echo "$title" | xargs)
        category=$(echo "$category" | xargs)
        priority=$(echo "$priority" | xargs)
        notes=$(echo "$notes" | xargs)
        
        # Skip if already has GitHub issue
        if [ "$github_issue" != "-" ]; then
            continue
        fi
        
        # Create issue body
        body="**Type**: Testing Task
**Category**: $category
**Priority**: $priority
**Status**: $status

**Description**:
$notes

---
*Created from tracker: $id*"
        
        # Create issue
        issue_number=$(create_issue "[Testing] $title" "$body" "$LABELS_TESTING" "testing")
        
        if [ -n "$issue_number" ]; then
            # Update tracker file with issue number
            # Use sed to replace the line
            sed -i.bak "s/| $id | $title | $category | $priority | $status | - |/| $id | $title | $category | $priority | $status | #$issue_number |/" "$TRACKER_FILE"
            echo "Updated tracker with issue #$issue_number"
        fi
        
    done < "$TESTING_ITEMS"
fi

# Process UI changes
if [ "$UI_COUNT" -gt 0 ]; then
    echo -e "${BLUE}🎨 Processing UI changes...${NC}"
    
    while IFS='|' read -r id title component priority status github_issue notes; do
        # Clean up whitespace
        id=$(echo "$id" | xargs)
        title=$(echo "$title" | xargs)
        component=$(echo "$component" | xargs)
        priority=$(echo "$priority" | xargs)
        notes=$(echo "$notes" | xargs)
        
        # Skip if already has GitHub issue
        if [ "$github_issue" != "-" ]; then
            continue
        fi
        
        # Create issue body
        body="**Type**: UI Change
**Component**: $component
**Priority**: $priority
**Status**: $status

**Description**:
$notes

---
*Created from tracker: $id*"
        
        # Create issue
        issue_number=$(create_issue "[UI] $title" "$body" "$LABELS_UI" "ui")
        
        if [ -n "$issue_number" ]; then
            # Update tracker file with issue number
            sed -i.bak "s/| $id | $title | $component | $priority | $status | - |/| $id | $title | $component | $priority | $status | #$issue_number |/" "$TRACKER_FILE"
            echo "Updated tracker with issue #$issue_number"
        fi
        
    done < "$UI_ITEMS"
fi

# Clean up backup files
rm -f "$TRACKER_FILE.bak"
rm -rf "$TEMP_DIR"

echo ""
echo -e "${GREEN}✅ Sync complete!${NC}"
echo ""
echo "View issues at: https://github.com/$REPO_OWNER/$REPO_NAME/issues"

