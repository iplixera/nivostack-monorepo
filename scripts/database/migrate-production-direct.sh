#!/bin/bash

# Direct Production Migration - Shows full error output
# Run this to see exact connection errors

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# Production Database - Full connection string
PROD_DIRECT="postgresql://postgres:7ReIOt1GU4ZGsfgo@db.djyqtlxjpzlncppmazzz.supabase.co:5432/postgres?sslmode=require"

echo "🔄 Production Database Migration"
echo "================================"
echo ""
echo "Database: db.djyqtlxjpzlncppmazzz.supabase.co:5432"
echo ""

export POSTGRES_PRISMA_URL="$PROD_DIRECT"
export POSTGRES_URL_NON_POOLING="$PROD_DIRECT"

echo "Running: prisma db push"
echo ""

# Run with full error output
pnpm dlx prisma@5.22.0 db push --schema=prisma/schema.prisma --accept-data-loss

echo ""
echo "✅ Production migration completed!"
echo ""

