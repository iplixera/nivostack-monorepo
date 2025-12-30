#!/bin/bash

# Migrate Local Database (Development)
# Use this when making schema changes locally

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "🔄 Local Database Migration"
echo "============================"
echo ""

cd "$ROOT_DIR"

# Check if .env.local exists
if [ ! -f "dashboard/.env.local" ]; then
    echo "⚠️  Warning: dashboard/.env.local not found"
    echo "   Make sure you have POSTGRES_PRISMA_URL and POSTGRES_URL_NON_POOLING set"
    echo ""
fi

# Load environment variables from .env.local if it exists
if [ -f "dashboard/.env.local" ]; then
    export $(grep -v '^#' dashboard/.env.local | grep -E 'POSTGRES_PRISMA_URL|POSTGRES_URL_NON_POOLING' | xargs)
fi

echo "📦 Creating migration from schema changes..."
echo ""

# Create a new migration
read -p "Enter migration name (e.g., add_user_table): " MIGRATION_NAME
if [ -z "$MIGRATION_NAME" ]; then
    echo "❌ Migration name is required"
    exit 1
fi

echo ""
echo "Creating migration: $MIGRATION_NAME"
echo ""

# Create migration (this will detect schema changes)
pnpm dlx prisma@5.22.0 migrate dev --name "$MIGRATION_NAME" --schema=prisma/schema.prisma

echo ""
echo "✅ Migration created and applied to local database!"
echo ""
echo "📋 Next steps:"
echo "   1. Review the migration in: prisma/migrations/"
echo "   2. Commit the migration files to Git"
echo "   3. Push to develop branch"
echo "   4. Run: bash scripts/migrate-staging.sh (to apply to staging)"
echo ""

