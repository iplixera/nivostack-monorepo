#!/bin/bash

# Setup Database Environment Variables in Vercel
# This script configures production and staging database connections

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

echo "🔐 Database Environment Variables Setup"
echo "========================================"
echo ""

# Production Database Configuration
PROD_REF="djyqtlxjpzlncppmazzz"
PROD_PASSWORD="7ReIOt1GU4ZGsfgo"

# Staging Database Configuration
STAGING_REF="ngsgfvrntmjakzednles"
STAGING_PASSWORD="Staging"

# Production Database Connection Strings
PROD_POOLED="postgresql://postgres.${PROD_REF}:${PROD_PASSWORD}@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
PROD_DIRECT="postgresql://postgres:${PROD_PASSWORD}@db.${PROD_REF}.supabase.co:5432/postgres"
PROD_READ_REPLICA="postgresql://postgres:${PROD_PASSWORD}@db.${PROD_REF}.supabase.co:5432/postgres"

# Staging Database Connection Strings
STAGING_POOLED="postgresql://postgres.${STAGING_REF}:${STAGING_PASSWORD}@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
STAGING_DIRECT="postgresql://postgres:${STAGING_PASSWORD}@db.${STAGING_REF}.supabase.co:5432/postgres"

# Generate JWT secrets
PROD_JWT_SECRET=$(openssl rand -base64 32)
STAGING_JWT_SECRET=$(openssl rand -base64 32)

echo "📦 Projects to configure:"
PROJECTS=("nivostack-studio" "nivostack-ingest-api" "nivostack-control-api")

# Function to set env var via Vercel CLI
set_env_var() {
    local project=$1
    local key=$2
    local value=$3
    local environments=$4
    
    echo "  Setting $key for $project ($environments)..."
    cd "$ROOT_DIR/dashboard"
    
    # Link to the correct project
    vercel link --project "$project" --scope "$TEAM_ID" --token="$VERCEL_TOKEN" --yes > /dev/null 2>&1 || true
    
    # Set environment variable (non-interactive)
    echo "$value" | vercel env add "$key" "$environments" --token="$VERCEL_TOKEN" --yes 2>&1 | grep -v "already exists" || echo "    (already exists, skipping)"
}

# Configure Production Environment Variables
echo ""
echo "=== Production Environment (Production) ==="
for project in "${PROJECTS[@]}"; do
    echo "📦 Configuring $project..."
    set_env_var "$project" "POSTGRES_PRISMA_URL" "$PROD_POOLED" "production"
    set_env_var "$project" "POSTGRES_URL_NON_POOLING" "$PROD_DIRECT" "production"
    set_env_var "$project" "JWT_SECRET" "$PROD_JWT_SECRET" "production"
done

# Configure Read Replica for Studio (optional)
echo ""
echo "📦 Configuring Read Replica for nivostack-studio..."
set_env_var "nivostack-studio" "POSTGRES_READ_REPLICA_URL" "$PROD_READ_REPLICA" "production"

# Configure Staging Environment Variables
echo ""
echo "=== Staging Environment (Preview + Development) ==="
for project in "${PROJECTS[@]}"; do
    echo "📦 Configuring $project (staging)..."
    set_env_var "$project" "POSTGRES_PRISMA_URL" "$STAGING_POOLED" "preview,development"
    set_env_var "$project" "POSTGRES_URL_NON_POOLING" "$STAGING_DIRECT" "preview,development"
    set_env_var "$project" "JWT_SECRET" "$STAGING_JWT_SECRET" "preview,development"
done

echo ""
echo "✅ Database environment variables configured!"
echo ""
echo "📋 Summary:"
echo "  Production Database: $PROD_REF"
echo "  Staging Database: $STAGING_REF"
echo "  Production JWT Secret: $PROD_JWT_SECRET"
echo "  Staging JWT Secret: $STAGING_JWT_SECRET"
echo ""
echo "⚠️  Next Steps:"
echo "  1. Run migrations on production database"
echo "  2. Run migrations on staging database"
echo "  3. Verify connections in Vercel Dashboard"
echo ""
echo "To run migrations:"
echo "  ./scripts/run-migrations.sh"
echo ""
echo "See docs/technical/DATABASE_SETUP_GUIDE.md for details"
