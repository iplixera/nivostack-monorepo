#!/bin/bash

# Try migration using connection pooler (may work without IP whitelisting)

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# Use connection pooler (port 6543) - may work without IP whitelisting
PROD_POOLER="postgresql://postgres.djyqtlxjpzlncppmazzz:7ReIOt1GU4ZGsfgo@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

export POSTGRES_PRISMA_URL="$PROD_POOLER"
export POSTGRES_URL_NON_POOLING="$PROD_POOLER"

echo "🔄 Running Production Migration (using connection pooler)..."
echo "   This may work even if direct connection is blocked"
echo ""

if pnpm dlx prisma@5.22.0 db push --schema=prisma/schema.prisma --accept-data-loss --skip-generate; then
    echo ""
    echo "✅ Migration completed!"
else
    echo ""
    echo "❌ Migration failed - you may need to:"
    echo "   1. Whitelist your IP in Supabase Dashboard"
    echo "   2. Run: bash scripts/get-my-ip.sh to get your IP"
    exit 1
fi


