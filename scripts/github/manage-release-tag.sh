#!/bin/bash

# NivoStack Release Tag Management Script
# Safely creates or updates a release tag with proper cleanup

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${GREEN}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if tag name is provided
if [ -z "$1" ]; then
    print_error "Usage: $0 <tag-name> [message]"
    echo ""
    echo "Examples:"
    echo "  $0 v1.0.0"
    echo "  $0 v1.0.0 \"Release Android SDK v1.0.0\""
    exit 1
fi

TAG_NAME="$1"
TAG_MESSAGE="${2:-Release ${TAG_NAME}}"
REMOTE="origin"

print_info "Managing release tag: ${TAG_NAME}"

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Not in a git repository"
    exit 1
fi

# Check if there are uncommitted changes
if ! git diff-index --quiet HEAD --; then
    print_warning "You have uncommitted changes!"
    echo ""
    git status --short
    echo ""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Aborted. Commit your changes first."
        exit 1
    fi
fi

# Check if tag exists locally
if git rev-parse "${TAG_NAME}" >/dev/null 2>&1; then
    print_warning "Tag ${TAG_NAME} already exists locally"
    echo "  Current commit: $(git rev-parse ${TAG_NAME})"
    echo "  Current message: $(git tag -l -n9 ${TAG_NAME} | tail -n +2 | sed 's/^[[:space:]]*//')"
    echo ""
    read -p "Delete and recreate? (y/N) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Deleting local tag ${TAG_NAME}..."
        git tag -d "${TAG_NAME}"
    else
        print_info "Aborted. Tag not modified."
        exit 0
    fi
fi

# Check if tag exists remotely
if git ls-remote --tags "${REMOTE}" | grep -q "refs/tags/${TAG_NAME}$"; then
    print_warning "Tag ${TAG_NAME} already exists on remote"
    REMOTE_COMMIT=$(git ls-remote --tags "${REMOTE}" | grep "refs/tags/${TAG_NAME}$" | cut -f1)
    echo "  Remote commit: ${REMOTE_COMMIT}"
    echo ""
    read -p "Delete and recreate on remote? (y/N) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Deleting remote tag ${TAG_NAME}..."
        git push "${REMOTE}" ":refs/tags/${TAG_NAME}" || true
    else
        print_warning "Remote tag not deleted. Will only create local tag."
    fi
fi

# Create the tag
print_info "Creating tag ${TAG_NAME}..."
git tag -a "${TAG_NAME}" -m "${TAG_MESSAGE}"

# Show tag info
echo ""
print_info "Tag created successfully!"
echo "  Tag: ${TAG_NAME}"
echo "  Commit: $(git rev-parse ${TAG_NAME})"
echo "  Message: ${TAG_MESSAGE}"
echo ""

# Ask if user wants to push
read -p "Push tag to ${REMOTE}? (Y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    print_info "Pushing tag ${TAG_NAME} to ${REMOTE}..."
    git push "${REMOTE}" "${TAG_NAME}"
    print_info "Tag pushed successfully!"
else
    print_warning "Tag created locally but not pushed."
    echo "  Push manually with: git push ${REMOTE} ${TAG_NAME}"
fi

echo ""
print_info "Done! Tag ${TAG_NAME} is ready."

