#!/bin/bash

# Simple Local Migration Script
# Run this locally to push schema changes to your local database

set -e

cd "$(dirname "$0")/.."

echo "🔄 Pushing Prisma schema to local database..."
echo ""

# Use local .env.local for database URL
if [ -f ".env.local" ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

# Push schema
pnpm dlx prisma@5.22.0 db push --schema=../prisma/schema.prisma --accept-data-loss

# Generate client
pnpm dlx prisma@5.22.0 generate --schema=../prisma/schema.prisma

echo ""
echo "✅ Local migration completed!"

