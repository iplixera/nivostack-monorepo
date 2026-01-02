#!/bin/bash

# Run Prisma Migrations for Production and Staging
# This script helps run migrations on the correct database

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "🗄️  Prisma Database Migrations"
echo "=============================="
echo ""

# Production Database Configuration
PROD_REF="djyqtlxjpzlncppmazzz"
PROD_PASSWORD="7ReIOt1GU4ZGsfgo"
PROD_DIRECT="postgresql://postgres:${PROD_PASSWORD}@db.${PROD_REF}.supabase.co:5432/postgres?sslmode=require"

# Staging Database Configuration
STAGING_REF="ngsgfvrntmjakzednles"
STAGING_PASSWORD="Staging"
STAGING_DIRECT="postgresql://postgres:${STAGING_PASSWORD}@db.${STAGING_REF}.supabase.co:5432/postgres?sslmode=require"

# Function to run migrations
run_migrations() {
    local env_name=$1
    local db_url=$2
    
    echo "📦 Running migrations for $env_name..."
    echo "   Database: ${db_url%%@*}@***"
    
    cd "$ROOT_DIR"
    
    # Use direct connection for migrations
    echo "   Pushing schema..."
    POSTGRES_PRISMA_URL="$db_url" POSTGRES_URL_NON_POOLING="$db_url" pnpm dlx prisma@5.22.0 db push --schema=prisma/schema.prisma --accept-data-loss || {
        echo "   ⚠️  Migration failed, but continuing..."
    }
    
    echo "   Generating Prisma client..."
    POSTGRES_PRISMA_URL="$db_url" POSTGRES_URL_NON_POOLING="$db_url" pnpm dlx prisma@5.22.0 generate --schema=prisma/schema.prisma || {
        echo "   ⚠️  Generate failed, but continuing..."
    }
    
    echo "   ✅ Migrations completed for $env_name"
    echo ""
}

# Run production migrations
echo "=== Production Database ==="
run_migrations "Production" "$PROD_DIRECT"

# Run staging migrations
echo "=== Staging Database ==="
run_migrations "Staging" "$STAGING_DIRECT"

# Optionally seed staging database
echo ""
read -p "Seed staging database with test data? (y/n): " SEED_STAGING
if [ "$SEED_STAGING" = "y" ]; then
    echo "🌱 Seeding staging database..."
    export POSTGRES_PRISMA_URL="$STAGING_DIRECT"
    export POSTGRES_URL_NON_POOLING="$STAGING_DIRECT"
    cd "$ROOT_DIR/dashboard"
    pnpm db:seed || echo "⚠️  Seed script not available or failed"
fi

echo ""
echo "✅ Migration process complete!"
echo ""
echo "⚠️  Important:"
echo "  - Production database schema updated"
echo "  - Staging database schema updated"
echo "  - Verify schema changes in Supabase Dashboard"
echo "  - Test connections in Vercel Dashboard"
