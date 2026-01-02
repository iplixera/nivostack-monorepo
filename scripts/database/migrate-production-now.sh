#!/bin/bash

# Quick script to migrate Production database directly
# No prompts - just runs the migration

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

PROD_DIRECT="postgresql://postgres:7ReIOt1GU4ZGsfgo@db.djyqtlxjpzlncppmazzz.supabase.co:5432/postgres?sslmode=require"

export POSTGRES_PRISMA_URL="$PROD_DIRECT"
export POSTGRES_URL_NON_POOLING="$PROD_DIRECT"

echo "🔄 Running Production Migration..."
pnpm dlx prisma@5.22.0 db push --schema=prisma/schema.prisma --accept-data-loss --skip-generate

echo ""
echo "✅ Production migration completed!"


