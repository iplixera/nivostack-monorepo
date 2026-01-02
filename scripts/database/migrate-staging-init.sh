#!/bin/bash

# Initialize Staging Database with Migrations
# Run this ONCE to set up migrations on staging database

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "🔄 Initializing Staging Database Migrations"
echo "==========================================="
echo ""

# Staging Database Configuration
STAGING_REF="ngsgfvrntmjakzednles"
STAGING_PASSWORD="Staging"
STAGING_DIRECT="postgresql://postgres:${STAGING_PASSWORD}@db.${STAGING_REF}.supabase.co:5432/postgres?sslmode=require"

echo "📦 Staging Database:"
echo "   Host: db.${STAGING_REF}.supabase.co"
echo ""

cd "$ROOT_DIR"

# Set environment variables
export POSTGRES_PRISMA_URL="$STAGING_DIRECT"
export POSTGRES_URL_NON_POOLING="$STAGING_DIRECT"

echo "🔄 Pushing schema to staging (this will create all tables)..."
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
echo "✅ Staging database initialized!"
echo ""
echo "📋 Next steps:"
echo "   - Use 'bash scripts/migrate-staging.sh' for future migrations"
echo ""

