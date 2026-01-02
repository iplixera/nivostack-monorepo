#!/bin/bash

# Simple Production Migration Script
# Run this to push schema changes to production Supabase database

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "🔄 Migrating Production Database"
echo "================================"
echo ""

cd "$ROOT_DIR"

# Production Database
PROD_REF="djyqtlxjpzlncppmazzz"
PROD_PASSWORD="7ReIOt1GU4ZGsfgo"
PROD_DIRECT="postgresql://postgres:${PROD_PASSWORD}@db.${PROD_REF}.supabase.co:5432/postgres?sslmode=require"

echo "⚠️  WARNING: You are about to migrate PRODUCTION database!"
read -p "Are you sure? (type 'yes' to confirm): " confirm
if [ "$confirm" != "yes" ]; then
    echo "❌ Migration cancelled"
    exit 1
fi

echo ""
echo "🔄 Pushing schema to production..."
echo ""

# Set environment variables
export POSTGRES_PRISMA_URL="$PROD_DIRECT"
export POSTGRES_URL_NON_POOLING="$PROD_DIRECT"

# Push schema
pnpm dlx prisma@5.22.0 db push --schema=prisma/schema.prisma --accept-data-loss --skip-generate

# Note: Client generation skipped - it's already generated during build

echo ""
echo "✅ Production migration completed!"
echo ""
echo "📋 Next steps:"
echo "   1. Verify tables in Supabase Dashboard"
echo "   2. Test the application"
echo ""
