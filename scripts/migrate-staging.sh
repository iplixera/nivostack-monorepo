#!/bin/bash

# Migrate Staging Database (Develop Branch)
# Run this after pushing migrations to develop branch

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "🔄 Staging Database Migration"
echo "=============================="
echo ""

# Staging Database Configuration
STAGING_REF="ngsgfvrntmjakzednles"
STAGING_PASSWORD="Staging"
STAGING_DIRECT="postgresql://postgres:${STAGING_PASSWORD}@db.${STAGING_REF}.supabase.co:5432/postgres?sslmode=require"

echo "📦 Staging Database:"
echo "   Host: db.${STAGING_REF}.supabase.co"
echo "   Database: postgres"
echo ""

cd "$ROOT_DIR"

# Set environment variables
export POSTGRES_PRISMA_URL="$STAGING_DIRECT"
export POSTGRES_URL_NON_POOLING="$STAGING_DIRECT"

echo "🔄 Applying pending migrations to staging..."
echo ""

# Apply all pending migrations
if pnpm dlx prisma@5.22.0 migrate deploy --schema=prisma/schema.prisma; then
    echo ""
    echo "✅ Staging migrations applied successfully!"
else
    echo ""
    echo "❌ Migration failed!"
    echo ""
    echo "If this is the first time, you may need to initialize migrations:"
    echo "  bash scripts/migrate-staging-init.sh"
    exit 1
fi

echo ""
echo "📋 Next steps:"
echo "   1. Test the staging deployment on Vercel"
echo "   2. Verify data in Supabase Dashboard"
echo "   3. If everything works, merge to main and run: bash scripts/migrate-production.sh"
echo ""

