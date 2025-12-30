#!/bin/bash

# Setup deployment filters to prevent unnecessary builds
# This script configures ignoreCommand for each project to only build when relevant files change

set -e

TEAM_ID="plixeras"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Load Vercel token
if [ -f "$ROOT_DIR/vercel.properties" ]; then
    export VERCEL_TOKEN=$(grep VERCEL_TOKEN "$ROOT_DIR/vercel.properties" | cut -d'=' -f2)
else
    echo "❌ vercel.properties not found"
    exit 1
fi

echo "🔧 Setting up deployment filters for Vercel projects"
echo "=================================================="
echo ""

# Function to set ignoreCommand
set_ignore_command() {
    local project=$1
    local ignore_command=$2
    
    echo "📦 Configuring $project..."
    
    response=$(curl -s -X PATCH \
        "https://api.vercel.com/v9/projects/${project}?teamId=${TEAM_ID}" \
        -H "Authorization: Bearer ${VERCEL_TOKEN}" \
        -H "Content-Type: application/json" \
        -d "{
            \"ignoreCommand\": \"${ignore_command}\"
        }" 2>&1)
    
    if echo "$response" | grep -q "\"name\"" || echo "$response" | grep -q "already"; then
        echo "  ✅ Configured"
    else
        echo "  ⚠️  Response: $response"
    fi
}

# Website: Only deploy if website/ directory changes
echo "1. nivostack-website: Only deploy if website/ changes"
set_ignore_command "nivostack-website" \
    "git diff HEAD^ HEAD --quiet -- website/ || exit 1"

echo ""

# Studio: Only deploy if dashboard/ changes (and not just ingest/control routes)
echo "2. nivostack-studio: Only deploy if dashboard/ changes"
set_ignore_command "nivostack-studio" \
    "git diff HEAD^ HEAD --quiet -- dashboard/ || exit 1"

echo ""

# Ingest API: Only deploy if dashboard/ changes (could be more specific later)
echo "3. nivostack-ingest-api: Only deploy if dashboard/ changes"
set_ignore_command "nivostack-ingest-api" \
    "git diff HEAD^ HEAD --quiet -- dashboard/ || exit 1"

echo ""

# Control API: Only deploy if dashboard/ changes (could be more specific later)
echo "4. nivostack-control-api: Only deploy if dashboard/ changes"
set_ignore_command "nivostack-control-api" \
    "git diff HEAD^ HEAD --quiet -- dashboard/ || exit 1"

echo ""
echo "✅ Deployment filters configured!"
echo ""
echo "💡 How it works:"
echo "  • Each project only builds if files in its directory changed"
echo "  • Website builds only if website/ changed"
echo "  • Dashboard projects build only if dashboard/ changed"
echo ""
echo "⚠️  Note: For initial commit (HEAD^ doesn't exist), all projects will build"
echo "   Subsequent commits will be filtered correctly"

