#!/bin/bash

# Simple Staging Migration Script
# Run this to push schema changes to staging Supabase database

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "🔄 Migrating Staging Database"
echo "=============================="
echo ""

cd "$ROOT_DIR"

# Staging Database
STAGING_REF="ngsgfvrntmjakzednles"
STAGING_PASSWORD="Staging"
STAGING_DIRECT="postgresql://postgres:${STAGING_PASSWORD}@db.${STAGING_REF}.supabase.co:5432/postgres?sslmode=require"

echo "🔄 Pushing schema to staging..."
echo ""

# Set environment variables
export POSTGRES_PRISMA_URL="$STAGING_DIRECT"
export POSTGRES_URL_NON_POOLING="$STAGING_DIRECT"

# Push schema
pnpm dlx prisma@5.22.0 db push --schema=prisma/schema.prisma --accept-data-loss

# Generate client
pnpm dlx prisma@5.22.0 generate --schema=prisma/schema.prisma

echo ""
echo "✅ Staging migration completed!"
echo ""
echo "📋 Next steps:"
echo "   1. Verify tables in Supabase Dashboard"
echo "   2. Test the application"
echo ""
