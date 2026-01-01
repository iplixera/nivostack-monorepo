#!/bin/bash

# Restart Dev Server with Fresh Environment
# This script stops the dev server, clears cache, and restarts it

set -e

echo "🔄 Restarting Dev Server"
echo "========================"
echo ""

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR/dashboard"

# Stop any running dev server
echo "1️⃣  Stopping existing dev server..."
if lsof -ti:3000 > /dev/null 2>&1; then
    kill $(lsof -ti:3000) 2>/dev/null || true
    sleep 2
    echo "   ✅ Stopped dev server"
else
    echo "   ℹ️  No dev server running"
fi

# Clear Next.js cache
echo ""
echo "2️⃣  Clearing Next.js cache..."
if [ -d ".next" ]; then
    rm -rf .next
    echo "   ✅ Cleared .next cache"
else
    echo "   ℹ️  No cache to clear"
fi

# Verify environment variables
echo ""
echo "3️⃣  Verifying environment variables..."
if [ -f "../.env.local" ]; then
    if grep -q "POSTGRES_PRISMA_URL.*localhost" ../.env.local; then
        echo "   ✅ Using localhost database"
    else
        echo "   ⚠️  Warning: Not using localhost database"
        echo "   💡 Run: bash scripts/setup-localhost.sh"
    fi
else
    echo "   ⚠️  .env.local not found"
    echo "   💡 Run: bash scripts/setup-localhost.sh"
fi

# Check Docker database
echo ""
echo "4️⃣  Checking local database..."
if docker ps | grep -q "devbridge-postgres"; then
    echo "   ✅ PostgreSQL container is running"
else
    echo "   ⚠️  PostgreSQL container not running"
    echo "   💡 Start it: docker-compose up -d"
fi

# Start dev server
echo ""
echo "5️⃣  Starting dev server..."
echo "   📍 URL: http://localhost:3000"
echo "   🛑 Press Ctrl+C to stop"
echo ""
echo "=========================================="
echo ""

cd "$ROOT_DIR/dashboard"
pnpm dev

