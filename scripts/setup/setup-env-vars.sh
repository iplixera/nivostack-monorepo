#!/bin/bash

# NivoStack Environment Variables Setup Script
# Team ID: team_MBPi3LRUH16KWHeCO2JAQtxs

set -e

TEAM_ID="team_MBPi3LRUH16KWHeCO2JAQtxs"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "🔐 NivoStack Environment Variables Setup"
echo "========================================="
echo ""

# Check Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Install with: npm i -g vercel"
    exit 1
fi

# Check authentication
if ! vercel whoami &> /dev/null; then
    echo "❌ Not logged in to Vercel. Please run: vercel login"
    exit 1
fi

# Function to set env var
set_env_var() {
    local project=$1
    local key=$2
    local value=$3
    local environments=${4:-"production,preview,development"}
    
    echo "  Setting $key for $project..."
    vercel env add "$key" "$environments" "$project" --scope "$TEAM_ID" <<< "$value" 2>&1 | grep -v "already exists" || true
}

# Shared environment variables (all projects)
SHARED_VARS=(
    "POSTGRES_PRISMA_URL"
    "POSTGRES_URL_NON_POOLING"
    "JWT_SECRET"
)

# Project-specific variables
STUDIO_VARS=(
    "STRIPE_SECRET_KEY"
    "STRIPE_WEBHOOK_SECRET"
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
)

CONTROL_VARS=(
    "STRIPE_SECRET_KEY"
    "STRIPE_WEBHOOK_SECRET"
)

echo "📝 Setting up environment variables..."
echo ""
echo "⚠️  You'll be prompted to enter values for each variable."
echo "   Values are not shown for security reasons."
echo ""

# Prompt for shared variables
echo "=== Shared Variables (all projects) ==="
declare -A SHARED_VALUES
for var in "${SHARED_VARS[@]}"; do
    read -sp "Enter $var: " value
    echo ""
    SHARED_VALUES["$var"]="$value"
done

# Prompt for Studio variables
echo ""
echo "=== Studio Variables ==="
declare -A STUDIO_VALUES
for var in "${STUDIO_VARS[@]}"; do
    read -sp "Enter $var: " value
    echo ""
    STUDIO_VALUES["$var"]="$value"
done

# Prompt for Control variables
echo ""
echo "=== Control API Variables ==="
declare -A CONTROL_VALUES
for var in "${CONTROL_VARS[@]}"; do
    read -sp "Enter $var: " value
    echo ""
    CONTROL_VALUES["$var"]="$value"
done

# Set shared variables for all projects
echo ""
echo "Setting shared variables for all projects..."
for project in "nivostack-studio" "nivostack-ingest-api" "nivostack-control-api"; do
    echo "  Project: $project"
    for var in "${SHARED_VARS[@]}"; do
        set_env_var "$project" "$var" "${SHARED_VALUES[$var]}"
    done
done

# Set Studio-specific variables
echo ""
echo "Setting Studio-specific variables..."
for var in "${STUDIO_VARS[@]}"; do
    set_env_var "nivostack-studio" "$var" "${STUDIO_VALUES[$var]}"
done

# Set Control-specific variables
echo ""
echo "Setting Control API-specific variables..."
for var in "${CONTROL_VARS[@]}"; do
    set_env_var "nivostack-control-api" "$var" "${CONTROL_VALUES[$var]}"
done

echo ""
echo "✅ Environment variables configured!"
echo ""
echo "Note: Website project (nivostack-website) doesn't need environment variables."

