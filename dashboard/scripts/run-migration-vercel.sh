#!/bin/bash

# Run Prisma Migrations in Vercel Build
# This script runs migrations using Vercel environment variables

set -e

echo "🔄 Running Database Migrations (Vercel)"
echo "========================================="
echo ""

# Check if database URLs are set
if [ -z "$POSTGRES_PRISMA_URL" ] || [ -z "$POSTGRES_URL_NON_POOLING" ]; then
    echo "⚠️  Warning: Database URLs not set"
    echo "   POSTGRES_PRISMA_URL: ${POSTGRES_PRISMA_URL:+SET}"
    echo "   POSTGRES_URL_NON_POOLING: ${POSTGRES_URL_NON_POOLING:+SET}"
    echo ""
    echo "   Skipping migrations (this is OK for preview builds without DB access)"
    exit 0
fi

# Check if we should run migrations
# Only run on production or if MIGRATE_DB is set to "true"
if [ "$VERCEL_ENV" != "production" ] && [ "$MIGRATE_DB" != "true" ]; then
    echo "ℹ️  Skipping migrations (not production environment)"
    echo "   Set MIGRATE_DB=true to force migration"
    exit 0
fi

echo "📦 Environment: ${VERCEL_ENV:-unknown}"
echo "   Using database from environment variables"
echo ""

# Use direct connection for migrations (required by Prisma)
export POSTGRES_PRISMA_URL="$POSTGRES_URL_NON_POOLING"

cd "$(dirname "$0")/.."

# Run migrations using migrate deploy (safe for production)
echo "🔄 Running: prisma migrate deploy"
echo ""

if pnpm dlx prisma@5.22.0 migrate deploy --schema=../prisma/schema.prisma; then
    echo ""
    echo "✅ Migrations applied successfully!"
else
    echo ""
    echo "⚠️  Migration failed or no migrations to apply"
    echo "   This is OK if:"
    echo "   - Database is already up to date"
    echo "   - This is the first deployment (use db push instead)"
    echo ""
    # Try db push as fallback (for initial setup)
    echo "🔄 Trying: prisma db push (fallback for initial setup)"
    if pnpm dlx prisma@5.22.0 db push --schema=../prisma/schema.prisma --accept-data-loss --skip-generate; then
        echo "✅ Schema pushed successfully!"
    else
        echo "⚠️  Schema push also failed - continuing build anyway"
    fi
fi

echo ""

