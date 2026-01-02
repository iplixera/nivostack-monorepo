#!/bin/bash

# Script to add, commit, and push changes to git
# Usage: ./commit-and-push.sh [commit-message]

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the repository root
REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

echo -e "${GREEN}=== Git Commit & Push Script ===${NC}\n"

# Check if there are any changes
if [ -z "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}No changes to commit. Working directory is clean.${NC}"
    exit 0
fi

# Show current status
echo -e "${GREEN}Current git status:${NC}"
git status --short
echo ""

# Ask what to add
echo -e "${YELLOW}What would you like to add?${NC}"
echo "1) All changes (git add .)"
echo "2) Only modified files (git add -u)"
echo "3) Specific files (interactive)"
echo "4) Cancel"
read -p "Enter choice [1-4] (default: 1): " choice
choice=${choice:-1}

case $choice in
    1)
        echo -e "${GREEN}Adding all changes...${NC}"
        git add .
        ;;
    2)
        echo -e "${GREEN}Adding modified files...${NC}"
        git add -u
        ;;
    3)
        echo -e "${GREEN}Select files to add (space-separated paths):${NC}"
        read -p "Files: " files
        if [ -n "$files" ]; then
            git add $files
        else
            echo -e "${RED}No files specified. Exiting.${NC}"
            exit 1
        fi
        ;;
    4)
        echo -e "${YELLOW}Cancelled.${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid choice. Exiting.${NC}"
        exit 1
        ;;
esac

# Show what will be committed
echo ""
echo -e "${GREEN}Staged changes:${NC}"
git status --short
echo ""

# Get commit message
if [ -n "$1" ]; then
    COMMIT_MSG="$1"
else
    read -p "Enter commit message: " COMMIT_MSG
    if [ -z "$COMMIT_MSG" ]; then
        echo -e "${RED}Commit message cannot be empty. Exiting.${NC}"
        exit 1
    fi
fi

# Confirm before committing
echo ""
read -p "Commit with message: '${COMMIT_MSG}'? [y/N] " confirm
if [[ ! $confirm =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Cancelled. Changes are staged but not committed.${NC}"
    exit 0
fi

# Commit
echo -e "${GREEN}Committing changes...${NC}"
git commit -m "$COMMIT_MSG"

# Show commit info
echo ""
echo -e "${GREEN}Commit created successfully!${NC}"
git log -1 --oneline
echo ""

# Ask about pushing
read -p "Push to remote? [y/N] " push_confirm
if [[ $push_confirm =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}Pushing to remote...${NC}"
    CURRENT_BRANCH=$(git branch --show-current)
    git push origin "$CURRENT_BRANCH"
    echo -e "${GREEN}✓ Pushed successfully to origin/$CURRENT_BRANCH${NC}"
else
    echo -e "${YELLOW}Changes committed but not pushed.${NC}"
    echo "Run 'git push' when ready."
fi

echo ""
echo -e "${GREEN}Done!${NC}"

