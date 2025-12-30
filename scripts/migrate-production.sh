#!/bin/bash

# Migrate Production Database (Main Branch)
# Run this after merging to main branch and testing in staging

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "🔄 Production Database Migration"
echo "==============================="
echo ""

# Production Database Configuration
PROD_REF="djyqtlxjpzlncppmazzz"
PROD_PASSWORD="7ReIOt1GU4ZGsfgo"
PROD_DIRECT="postgresql://postgres:${PROD_PASSWORD}@db.${PROD_REF}.supabase.co:5432/postgres?sslmode=require"

echo "📦 Production Database:"
echo "   Host: db.${PROD_REF}.supabase.co"
echo "   Database: postgres"
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
echo "🔄 Applying pending migrations to production..."
echo ""

# Apply all pending migrations
if pnpm dlx prisma@5.22.0 migrate deploy --schema=prisma/schema.prisma; then
    echo ""
    echo "✅ Production migrations applied successfully!"
else
    echo ""
    echo "❌ Migration failed!"
    echo ""
    echo "If this is the first time, you may need to initialize migrations:"
    echo "  bash scripts/migrate-production-init.sh"
    exit 1
fi

echo ""
echo "📋 Next steps:"
echo "   1. Verify tables in Supabase Dashboard"
echo "   2. Check Vercel deployment logs"
echo "   3. Test the production application"
echo ""

