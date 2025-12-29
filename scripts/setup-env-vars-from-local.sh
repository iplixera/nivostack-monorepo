#!/bin/bash

# Set Environment Variables from .env.local to Vercel Projects
# This script reads from dashboard/.env.local and sets them in Vercel

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

# Load .env.local
ENV_FILE="$ROOT_DIR/dashboard/.env.local"
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ $ENV_FILE not found"
    exit 1
fi

echo "🔐 Setting Environment Variables from .env.local"
echo "================================================="
echo ""

# Function to set env var
set_env_var() {
    local project=$1
    local key=$2
    local value=$3
    local environments=${4:-"production,preview,development"}
    
    echo "  Setting $key for $project ($environments)..."
    echo "$value" | vercel env add "$key" "$environments" "$project" --scope "$TEAM_ID" --token="$VERCEL_TOKEN" --yes 2>&1 | grep -v "already exists" || echo "    (already exists, skipping)"
}

# Read variables from .env.local
source "$ENV_FILE"

# Shared variables (all 3 projects)
PROJECTS=("nivostack-studio" "nivostack-ingest-api" "nivostack-control-api")

echo "Setting shared variables for: ${PROJECTS[*]}"
echo ""

for project in "${PROJECTS[@]}"; do
    echo "📦 Project: $project"
    
    # POSTGRES_PRISMA_URL
    if [ -n "$POSTGRES_PRISMA_URL" ]; then
        set_env_var "$project" "POSTGRES_PRISMA_URL" "$POSTGRES_PRISMA_URL"
    else
        echo "  ⚠️  POSTGRES_PRISMA_URL not found in .env.local"
    fi
    
    # POSTGRES_URL_NON_POOLING
    if [ -n "$POSTGRES_URL_NON_POOLING" ]; then
        set_env_var "$project" "POSTGRES_URL_NON_POOLING" "$POSTGRES_URL_NON_POOLING"
    else
        echo "  ⚠️  POSTGRES_URL_NON_POOLING not found in .env.local"
    fi
    
    # JWT_SECRET
    if [ -n "$JWT_SECRET" ]; then
        set_env_var "$project" "JWT_SECRET" "$JWT_SECRET"
    else
        echo "  ⚠️  JWT_SECRET not found in .env.local"
    fi
    
    echo ""
done

# Studio-specific variables
echo "📦 Setting Studio-specific variables..."
if [ -n "$STRIPE_SECRET_KEY" ]; then
    set_env_var "nivostack-studio" "STRIPE_SECRET_KEY" "$STRIPE_SECRET_KEY"
fi
if [ -n "$STRIPE_WEBHOOK_SECRET" ]; then
    set_env_var "nivostack-studio" "STRIPE_WEBHOOK_SECRET" "$STRIPE_WEBHOOK_SECRET"
fi
if [ -n "$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" ]; then
    set_env_var "nivostack-studio" "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" "$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
fi

# Control API-specific variables
echo ""
echo "📦 Setting Control API-specific variables..."
if [ -n "$STRIPE_SECRET_KEY" ]; then
    set_env_var "nivostack-control-api" "STRIPE_SECRET_KEY" "$STRIPE_SECRET_KEY"
fi
if [ -n "$STRIPE_WEBHOOK_SECRET" ]; then
    set_env_var "nivostack-control-api" "STRIPE_WEBHOOK_SECRET" "$STRIPE_WEBHOOK_SECRET"
fi

echo ""
echo "✅ Environment variables setup complete!"
echo ""
echo "Note: Verify variables in Vercel Dashboard if needed"

