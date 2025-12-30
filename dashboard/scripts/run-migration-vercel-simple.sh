#!/bin/bash

# Simple Migration Script for Vercel
# Uses db push (faster, good for initial setup and schema changes)

set -e

echo "🔄 Running Database Migration (Vercel)"

# Check if database URLs are set
if [ -z "$POSTGRES_PRISMA_URL" ] || [ -z "$POSTGRES_URL_NON_POOLING" ]; then
    echo "⚠️  Database URLs not set - skipping migration"
    exit 0
fi

# Use direct connection for migrations
export POSTGRES_PRISMA_URL="$POSTGRES_URL_NON_POOLING"

cd "$(dirname "$0")/.."

# Push schema (creates/updates tables)
pnpm dlx prisma@5.22.0 db push --schema=../prisma/schema.prisma --accept-data-loss --skip-generate

echo "✅ Migration completed"

