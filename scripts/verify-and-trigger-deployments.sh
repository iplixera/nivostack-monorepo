#!/bin/bash

# Verify and Trigger Vercel Deployments
# This script helps verify project configurations and trigger deployments

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

echo "🔍 Verifying Project Configurations"
echo "===================================="
echo ""

PROJECTS=("nivostack-website" "nivostack-studio" "nivostack-ingest-api" "nivostack-control-api")

for project in "${PROJECTS[@]}"; do
    echo "📦 $project:"
    CONFIG=$(curl -s -X GET "https://api.vercel.com/v9/projects/$project?teamId=$TEAM_ID" \
        -H "Authorization: Bearer $VERCEL_TOKEN" 2>/dev/null)
    
    echo "$CONFIG" | jq -r '{
        rootDirectory: .rootDirectory,
        buildCommand: .buildCommand,
        outputDirectory: .outputDirectory,
        gitConnected: (.link.repo != null),
        repo: .link.repo
    }' 2>/dev/null || echo "  Could not fetch config"
    echo ""
done

echo ""
echo "🚀 To Trigger Deployments:"
echo "=========================="
echo ""
echo "Option 1: Push to GitHub (if connected)"
echo "  git commit --allow-empty -m 'trigger deployments'"
echo "  git push origin develop"
echo ""
echo "Option 2: Manual Deploy via CLI"
echo "  cd website && vercel --prod"
echo "  cd dashboard && vercel link --project nivostack-studio && vercel --prod"
echo "  cd dashboard && vercel link --project nivostack-ingest-api && vercel --prod"
echo "  cd dashboard && vercel link --project nivostack-control-api && vercel --prod"
echo ""
echo "Option 3: Redeploy from Vercel Dashboard"
echo "  https://vercel.com/$TEAM_ID"
echo "  Click each project → Deployments → Redeploy"

