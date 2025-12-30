#!/bin/bash

# Run migrations on both staging and production databases
# This script applies the current schema to both databases

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "🔄 Running Database Migrations"
echo "=============================="
echo ""

cd "$ROOT_DIR"

# Production Database - Full connection strings with passwords
PROD_DIRECT="postgresql://postgres:7ReIOt1GU4ZGsfgo@db.djyqtlxjpzlncppmazzz.supabase.co:5432/postgres?sslmode=require"

# Staging Database - Full connection strings with passwords
STAGING_DIRECT="postgresql://postgres:Staging@db.ngsgfvrntmjakzednles.supabase.co:5432/postgres?sslmode=require"

# Function to run migration
run_migration() {
    local env_name=$1
    local db_url=$2
    
    echo "📦 Migrating $env_name database..."
    echo "   Testing connection..."
    
    # Test connection first
    export POSTGRES_PRISMA_URL="$db_url"
    export POSTGRES_URL_NON_POOLING="$db_url"
    
    # Try to connect and push schema
    echo "   Pushing schema..."
    if POSTGRES_PRISMA_URL="$db_url" POSTGRES_URL_NON_POOLING="$db_url" pnpm dlx prisma@5.22.0 db push --schema=prisma/schema.prisma --accept-data-loss --skip-generate 2>&1; then
        echo "   ✅ $env_name migration successful!"
        return 0
    else
        echo "   ❌ $env_name migration failed!"
        echo ""
        echo "   Troubleshooting:"
        echo "   - Check if your IP is whitelisted in Supabase"
        echo "   - Verify database credentials"
        echo "   - Check network connectivity"
        return 1
    fi
}

# Run production migration
echo "=== Production Database ==="
if run_migration "Production" "$PROD_DIRECT"; then
    echo "✅ Production migration completed"
else
    echo "❌ Production migration failed - check errors above"
    exit 1
fi

echo ""

# Run staging migration
echo "=== Staging Database ==="
if run_migration "Staging" "$STAGING_DIRECT"; then
    echo "✅ Staging migration completed"
else
    echo "❌ Staging migration failed - check errors above"
    exit 1
fi

# Generate Prisma client
echo ""
echo "=== Generating Prisma Client ==="
export POSTGRES_PRISMA_URL="$PROD_DIRECT"
export POSTGRES_URL_NON_POOLING="$PROD_DIRECT"
pnpm dlx prisma@5.22.0 generate --schema=prisma/schema.prisma

echo ""
echo "✅ All migrations completed!"
echo ""
