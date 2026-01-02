#!/bin/bash

# Run Prisma Migrations for Production Database Only
# This script runs migrations on the production database

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "🗄️  Running Production Database Migrations"
echo "=========================================="
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
read -p "⚠️  This will modify the PRODUCTION database. Continue? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo "❌ Migration cancelled"
    exit 1
fi

cd "$ROOT_DIR"

echo ""
echo "1️⃣  Pushing schema to production database..."
echo "   (This creates/updates all tables including Plan, User, Project, etc.)"
echo ""

# Use direct connection for migrations (required by Prisma)
export POSTGRES_PRISMA_URL="$PROD_DIRECT"
export POSTGRES_URL_NON_POOLING="$PROD_DIRECT"

# Run db push to sync schema
if pnpm dlx prisma@5.22.0 db push --schema=prisma/schema.prisma; then
    echo ""
    echo "✅ Schema pushed successfully!"
else
    echo ""
    echo "❌ Schema push failed!"
    exit 1
fi

echo ""
echo "2️⃣  Generating Prisma client..."
echo ""

if pnpm dlx prisma@5.22.0 generate --schema=prisma/schema.prisma; then
    echo ""
    echo "✅ Prisma client generated!"
else
    echo ""
    echo "❌ Prisma client generation failed!"
    exit 1
fi

echo ""
echo "✅ Production migrations completed!"
echo ""
echo "📋 Next Steps:"
echo "   1. Verify tables in Supabase Dashboard"
echo "   2. Check Vercel deployment logs"
echo "   3. Test the application"
echo ""
echo "To verify tables, run:"
echo "   psql -h db.${PROD_REF}.supabase.co -p 5432 -d postgres -U postgres -c '\\dt'"
echo ""

