#!/bin/bash

# NivoStack Vercel Projects Setup Script
# Team ID: team_MBPi3LRUH16KWHeCO2JAQtxs

set -e

TEAM_ID="team_MBPi3LRUH16KWHeCO2JAQtxs"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "🚀 NivoStack Vercel Projects Setup"
echo "===================================="
echo ""

# Check Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Install with: npm i -g vercel"
    exit 1
fi

# Check authentication
echo "📋 Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    echo "❌ Not logged in to Vercel. Please run: vercel login"
    exit 1
fi

echo "✅ Authenticated as: $(vercel whoami)"
echo ""

# Function to create project
create_project() {
    local project_name=$1
    local root_dir=$2
    local vercel_config=$3
    
    echo "📦 Creating project: $project_name"
    
    cd "$ROOT_DIR/$root_dir"
    
    # Link project (creates if doesn't exist)
    vercel link --yes --scope "$TEAM_ID" --project "$project_name" 2>&1 | grep -v "already linked" || true
    
    echo "✅ Project $project_name linked"
    echo ""
}

# Create all 4 projects
echo "Creating Vercel projects..."
echo ""

# 1. Brand Website
create_project "nivostack-website" "website" "vercel.json"

# 2. Admin Dashboard (Studio)
create_project "nivostack-studio" "dashboard" "vercel-studio.json"

# 3. Ingest API
create_project "nivostack-ingest-api" "dashboard" "vercel-ingest.json"

# 4. Control API
create_project "nivostack-control-api" "dashboard" "vercel-control.json"

echo "✅ All projects created successfully!"
echo ""
echo "Next steps:"
echo "1. Configure environment variables (see scripts/setup-env-vars.sh)"
echo "2. Add domains in Vercel Dashboard"
echo "3. Configure DNS records in GoDaddy"

