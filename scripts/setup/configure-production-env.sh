#!/bin/bash

# Configure Production Environment Variables
# This script helps set production database URLs and other production-specific vars

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

echo "🔐 Configure Production Environment Variables"
echo "=============================================="
echo ""
echo "This script will help you set production environment variables."
echo "You'll need:"
echo "  - Production PostgreSQL URLs (POSTGRES_PRISMA_URL, POSTGRES_URL_NON_POOLING)"
echo "  - JWT_SECRET (if not already set)"
echo "  - Stripe keys (for studio and control-api)"
echo ""

PROJECTS=("nivostack-studio" "nivostack-ingest-api" "nivostack-control-api")

# Function to set env var
set_env_var() {
    local project=$1
    local key=$2
    local value=$3
    local environments=${4:-"production"}
    
    echo "Setting $key for $project ($environments)..."
    echo "$value" | vercel env add "$key" "$environments" "$project" --scope "$TEAM_ID" --token="$VERCEL_TOKEN" --yes 2>&1 | grep -v "already exists" || echo "  (already exists)"
}

# Prompt for production database URLs
echo "=== Production Database Configuration ==="
read -p "Enter POSTGRES_PRISMA_URL (pooled): " POSTGRES_PRISMA_URL
read -p "Enter POSTGRES_URL_NON_POOLING (direct): " POSTGRES_URL_NON_POOLING

# Prompt for JWT_SECRET if not set
read -p "Enter JWT_SECRET (or press Enter to skip if already set): " JWT_SECRET

# Set shared variables
echo ""
echo "Setting shared variables for all projects..."
for project in "${PROJECTS[@]}"; do
    echo "  Project: $project"
    [ -n "$POSTGRES_PRISMA_URL" ] && set_env_var "$project" "POSTGRES_PRISMA_URL" "$POSTGRES_PRISMA_URL" "production"
    [ -n "$POSTGRES_URL_NON_POOLING" ] && set_env_var "$project" "POSTGRES_URL_NON_POOLING" "$POSTGRES_URL_NON_POOLING" "production"
    [ -n "$JWT_SECRET" ] && set_env_var "$project" "JWT_SECRET" "$JWT_SECRET" "production"
done

# Stripe variables (Studio and Control API)
echo ""
echo "=== Stripe Configuration ==="
read -p "Enter STRIPE_SECRET_KEY (or press Enter to skip): " STRIPE_SECRET_KEY
read -p "Enter STRIPE_WEBHOOK_SECRET (or press Enter to skip): " STRIPE_WEBHOOK_SECRET
read -p "Enter NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (or press Enter to skip): " NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

if [ -n "$STRIPE_SECRET_KEY" ]; then
    set_env_var "nivostack-studio" "STRIPE_SECRET_KEY" "$STRIPE_SECRET_KEY" "production"
    set_env_var "nivostack-control-api" "STRIPE_SECRET_KEY" "$STRIPE_SECRET_KEY" "production"
fi

if [ -n "$STRIPE_WEBHOOK_SECRET" ]; then
    set_env_var "nivostack-studio" "STRIPE_WEBHOOK_SECRET" "$STRIPE_WEBHOOK_SECRET" "production"
    set_env_var "nivostack-control-api" "STRIPE_WEBHOOK_SECRET" "$STRIPE_WEBHOOK_SECRET" "production"
fi

if [ -n "$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" ]; then
    set_env_var "nivostack-studio" "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" "$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" "production"
fi

echo ""
echo "✅ Production environment variables configured!"
echo ""
echo "Note: Preview and development environments can inherit from production"
echo "      or be set separately in Vercel Dashboard"

