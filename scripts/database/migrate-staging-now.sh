#!/bin/bash

# Quick script to migrate Staging database directly
# No prompts - just runs the migration

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

STAGING_DIRECT="postgresql://postgres:Staging@db.ngsgfvrntmjakzednles.supabase.co:5432/postgres?sslmode=require"

export POSTGRES_PRISMA_URL="$STAGING_DIRECT"
export POSTGRES_URL_NON_POOLING="$STAGING_DIRECT"

echo "🔄 Running Staging Migration..."
pnpm dlx prisma@5.22.0 db push --schema=prisma/schema.prisma --accept-data-loss --skip-generate

echo ""
echo "✅ Staging migration completed!"


