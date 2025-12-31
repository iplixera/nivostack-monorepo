#!/bin/bash

# Run Prisma Migration Directly on Supabase
# This bypasses Vercel and runs migrations from your local machine

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "🔄 Running Database Migration on Supabase"
echo "=========================================="
echo ""

cd "$ROOT_DIR"

# Production Database
PROD_REF="djyqtlxjpzlncppmazzz"
PROD_PASSWORD="7ReIOt1GU4ZGsfgo"
PROD_DIRECT="postgresql://postgres:${PROD_PASSWORD}@db.${PROD_REF}.supabase.co:5432/postgres?sslmode=require"

# Staging Database
STAGING_REF="ngsgfvrntmjakzednles"
STAGING_PASSWORD="Staging"
STAGING_DIRECT="postgresql://postgres:${STAGING_PASSWORD}@db.${STAGING_REF}.supabase.co:5432/postgres?sslmode=require"

echo "Which database do you want to migrate?"
echo "1) Production (${PROD_REF})"
echo "2) Staging (${STAGING_REF})"
echo ""
read -p "Enter choice (1 or 2): " choice

if [ "$choice" = "1" ]; then
    DB_URL="$PROD_DIRECT"
    DB_NAME="Production"
    echo ""
    echo "⚠️  WARNING: You are about to migrate PRODUCTION database!"
    read -p "Are you sure? (type 'yes' to confirm): " confirm
    if [ "$confirm" != "yes" ]; then
        echo "❌ Migration cancelled"
        exit 1
    fi
elif [ "$choice" = "2" ]; then
    DB_URL="$STAGING_DIRECT"
    DB_NAME="Staging"
else
    echo "❌ Invalid choice"
    exit 1
fi

echo ""
echo "🔄 Migrating $DB_NAME database..."
echo "   Host: ${DB_URL%%@*}@***"
echo ""

# Set environment variables
export POSTGRES_PRISMA_URL="$DB_URL"
export POSTGRES_URL_NON_POOLING="$DB_URL"

# Run Prisma db push
echo "Running: prisma db push"
echo ""

if pnpm dlx prisma@5.22.0 db push --schema=prisma/schema.prisma --accept-data-loss --skip-generate; then
    echo ""
    echo "✅ Migration completed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Verify tables in Supabase Dashboard"
    echo "   2. Test the application"
    echo ""
else
    echo ""
    echo "❌ Migration failed!"
    echo ""
    echo "Troubleshooting:"
    echo "   - Check your IP is whitelisted in Supabase"
    echo "   - Verify database credentials"
    echo "   - Check network connectivity"
    exit 1
fi


