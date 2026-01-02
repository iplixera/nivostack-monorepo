#!/bin/bash

# Connect Vercel Projects to GitHub Repository
# This script connects all Vercel projects to the GitHub repository

set -e

TEAM_ID="team_MBPi3LRUH16KWHeCO2JAQtxs"
GITHUB_REPO="iplixera/nivostack-monorepo"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Load Vercel token
if [ -f "$ROOT_DIR/vercel.properties" ]; then
    export VERCEL_TOKEN=$(grep VERCEL_TOKEN "$ROOT_DIR/vercel.properties" | cut -d'=' -f2)
else
    echo "❌ vercel.properties not found"
    exit 1
fi

echo "🔗 Connecting Vercel Projects to GitHub"
echo "======================================="
echo ""
echo "Repository: $GITHUB_REPO"
echo ""

PROJECTS=("nivostack-website" "nivostack-studio" "nivostack-ingest-api" "nostack-control-api")

# Function to get project ID
get_project_id() {
    local project_name=$1
    curl -s -X GET \
        "https://api.vercel.com/v9/projects/${project_name}?teamId=${TEAM_ID}" \
        -H "Authorization: Bearer ${VERCEL_TOKEN}" | \
        jq -r '.id' 2>/dev/null || echo ""
}

# Function to connect GitHub via API
connect_github_api() {
    local project_id=$1
    local project_name=$2
    
    echo "  Connecting $project_name to GitHub..."
    
    # First, check if GitHub is already connected
    local current_repo=$(curl -s -X GET \
        "https://api.vercel.com/v9/projects/${project_id}?teamId=${TEAM_ID}" \
        -H "Authorization: Bearer ${VERCEL_TOKEN}" | \
        jq -r '.link.repo' 2>/dev/null)
    
    if [ -n "$current_repo" ] && [ "$current_repo" != "null" ]; then
        echo "    Already connected to: $current_repo"
        return 0
    fi
    
    # Connect via API (requires GitHub integration)
    local response=$(curl -s -X PATCH \
        "https://api.vercel.com/v9/projects/${project_id}?teamId=${TEAM_ID}" \
        -H "Authorization: Bearer ${VERCEL_TOKEN}" \
        -H "Content-Type: application/json" \
        -d "{
            \"link\": {
                \"type\": \"github\",
                \"repo\": \"${GITHUB_REPO}\",
                \"repoId\": 0,
                \"org\": \"iplixera\",
                \"gitCredentialId\": \"\",
                \"productionBranch\": \"main\",
                \"sourceless\": false
            }
        }" 2>&1)
    
    if echo "$response" | grep -q "\"id\"" || echo "$response" | grep -q "already"; then
        echo "    ✅ Connected"
    else
        echo "    ⚠️  Response: $response"
        echo "    ℹ️  Note: GitHub connection may require manual setup in Vercel Dashboard"
    fi
}

# Connect each project
for project in "${PROJECTS[@]}"; do
    echo "📦 Project: $project"
    PROJECT_ID=$(get_project_id "$project")
    
    if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" = "null" ]; then
        echo "  ⚠️  Could not get project ID for $project"
        continue
    fi
    
    connect_github_api "$PROJECT_ID" "$project"
    echo ""
done

echo ""
echo "✅ GitHub connection process completed!"
echo ""
echo "⚠️  Important Notes:"
echo "  1. If connection failed, you may need to:"
echo "     - Authorize GitHub in Vercel Dashboard"
echo "     - Go to: https://vercel.com/account/integrations"
echo "     - Connect GitHub account"
echo ""
echo "  2. After GitHub is connected, Vercel will:"
echo "     - Auto-deploy on push to main (production)"
echo "     - Auto-deploy on push to develop (preview)"
echo "     - Create preview deployments for PRs"
echo ""
echo "  3. Manual connection via Dashboard:"
echo "     - Go to project Settings → Git"
echo "     - Click 'Connect Git Repository'"
echo "     - Select: $GITHUB_REPO"

