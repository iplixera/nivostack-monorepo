#!/bin/bash

# Fix Vercel Project Configurations
# This script updates root directory and build settings for all projects

set -e

TEAM_ID="team_MBPi3LRUH16KWHeCO2JAQtxs"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Load Vercel token
if [ -f "$ROOT_DIR/vercel.properties" ]; then
    export VERCEL_TOKEN=$(grep VERCEL_TOKEN "$ROOT_DIR/vercel.properties" | cut -d'=' -f2)
else
    echo "❌ vercel.properties not found"
    exit 1
fi

echo "🔧 Fixing Vercel Project Configurations"
echo "========================================"
echo ""

# Function to update project config
update_project_config() {
    local project=$1
    local root_dir=$2
    local build_cmd=$3
    local output_dir=$4
    
    echo "📦 Updating $project..."
    
    local response=$(curl -s -X PATCH \
        "https://api.vercel.com/v9/projects/${project}?teamId=${TEAM_ID}" \
        -H "Authorization: Bearer ${VERCEL_TOKEN}" \
        -H "Content-Type: application/json" \
        -d "{
            \"rootDirectory\": \"${root_dir}\",
            \"buildCommand\": \"${build_cmd}\",
            \"outputDirectory\": \"${output_dir}\",
            \"framework\": \"nextjs\"
        }")
    
    if echo "$response" | grep -q "\"id\""; then
        echo "  ✅ Updated successfully"
    else
        echo "  ⚠️  Response: $response"
    fi
}

# Update website
update_project_config \
    "nivostack-website" \
    "website" \
    "cd website && pnpm install && pnpm build" \
    "website/.next"

# Update studio
update_project_config \
    "nivostack-studio" \
    "dashboard" \
    "cd dashboard && pnpm install && pnpm build" \
    "dashboard/.next"

# Update ingest-api
update_project_config \
    "nivostack-ingest-api" \
    "dashboard" \
    "cd dashboard && pnpm install && pnpm build" \
    "dashboard/.next"

# Update control-api
update_project_config \
    "nivostack-control-api" \
    "dashboard" \
    "cd dashboard && pnpm install && pnpm build" \
    "dashboard/.next"

echo ""
echo "✅ Project configurations updated!"
echo ""
echo "⚠️  Next Steps:"
echo "  1. Push a new commit to trigger deployments"
echo "  2. Or manually trigger deployments from Vercel Dashboard"

