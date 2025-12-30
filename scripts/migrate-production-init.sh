#!/bin/bash

# Initialize Production Database with Migrations
# Run this ONCE to set up migrations on production database

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "🔄 Initializing Production Database Migrations"
echo "=============================================="
echo ""

# Production Database Configuration
PROD_REF="djyqtlxjpzlncppmazzz"
PROD_PASSWORD="7ReIOt1GU4ZGsfgo"
PROD_DIRECT="postgresql://postgres:${PROD_PASSWORD}@db.${PROD_REF}.supabase.co:5432/postgres?sslmode=require"

echo "📦 Production Database:"
echo "   Host: db.${PROD_REF}.supabase.co"
echo ""

# Confirm before proceeding
echo "⚠️  WARNING: This will modify the PRODUCTION database!"
echo ""
read -p "Are you sure you want to continue? (type 'yes' to confirm): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo "❌ Migration cancelled"
    exit 1
fi

cd "$ROOT_DIR"

# Set environment variables
export POSTGRES_PRISMA_URL="$PROD_DIRECT"
export POSTGRES_URL_NON_POOLING="$PROD_DIRECT"

echo ""
echo "🔄 Pushing schema to production (this will create all tables)..."
echo ""

# Push schema to create baseline
if pnpm dlx prisma@5.22.0 db push --schema=prisma/schema.prisma --accept-data-loss; then
    echo ""
    echo "✅ Schema pushed successfully!"
else
    echo ""
    echo "❌ Schema push failed!"
    exit 1
fi

echo ""
echo "🔄 Marking current state as baseline migration..."
echo ""

# Mark current state as baseline (if migrations exist)
if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations)" ]; then
    echo "   Migrations directory exists, marking as applied..."
    pnpm dlx prisma@5.22.0 migrate resolve --applied --schema=prisma/schema.prisma $(ls -t prisma/migrations | head -1) || true
fi

echo ""
echo "✅ Production database initialized!"
echo ""
echo "📋 Next steps:"
echo "   - Use 'bash scripts/migrate-production.sh' for future migrations"
echo ""

