#!/bin/bash

# Direct Staging Migration - Shows full error output
# Run this to see exact connection errors

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# Staging Database - Full connection string
STAGING_DIRECT="postgresql://postgres:Staging@db.ngsgfvrntmjakzednles.supabase.co:5432/postgres?sslmode=require"

echo "🔄 Staging Database Migration"
echo "============================="
echo ""
echo "Database: db.ngsgfvrntmjakzednles.supabase.co:5432"
echo ""

export POSTGRES_PRISMA_URL="$STAGING_DIRECT"
export POSTGRES_URL_NON_POOLING="$STAGING_DIRECT"

echo "Running: prisma db push"
echo ""

# Run with full error output
pnpm dlx prisma@5.22.0 db push --schema=prisma/schema.prisma --accept-data-loss

echo ""
echo "✅ Staging migration completed!"
echo ""

