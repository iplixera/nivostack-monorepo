#!/bin/bash

# Test Migration API Locally
# This script starts the dev server and tests the migration endpoint

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR/dashboard"

echo "🧪 Testing Migration API Locally"
echo "================================="
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local not found"
    echo ""
    echo "Creating .env.local with staging database..."
    echo ""
    cat > .env.local << EOF
POSTGRES_PRISMA_URL=postgresql://postgres:Staging@db.ngsgfvrntmjakzednles.supabase.co:5432/postgres?sslmode=require
POSTGRES_URL_NON_POOLING=postgresql://postgres:Staging@db.ngsgfvrntmjakzednles.supabase.co:5432/postgres?sslmode=require
JWT_SECRET=local-test-secret-change-me
CRON_SECRET=local-test-cron-secret
EOF
    echo "✅ Created .env.local"
    echo ""
fi

# Check if dev server is running
if ! curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "🚀 Starting dev server..."
    echo "   (This will run in the background)"
    echo ""
    
    # Start dev server in background
    pnpm dev > /tmp/next-dev.log 2>&1 &
    DEV_PID=$!
    
    echo "⏳ Waiting for server to start..."
    sleep 5
    
    # Wait for server to be ready
    for i in {1..30}; do
        if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
            echo "✅ Server is ready!"
            break
        fi
        sleep 1
    done
    
    if ! curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
        echo "❌ Server failed to start"
        echo "Check logs: tail -f /tmp/next-dev.log"
        kill $DEV_PID 2>/dev/null || true
        exit 1
    fi
else
    echo "✅ Dev server is already running"
    echo ""
fi

# Get CRON_SECRET from .env.local
CRON_SECRET=$(grep CRON_SECRET .env.local 2>/dev/null | cut -d'=' -f2 | tr -d '"' | tr -d "'" || echo "local-test-cron-secret")

echo "🔄 Testing migration endpoint..."
echo "   URL: http://localhost:3000/api/migrate"
echo "   CRON_SECRET: ${CRON_SECRET:0:10}..."
echo ""

# Test the endpoint
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3000/api/migrate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${CRON_SECRET}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "HTTP Status: $HTTP_CODE"
echo ""
echo "Response:"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Migration test successful!"
elif [ "$HTTP_CODE" = "401" ]; then
    echo "❌ Unauthorized - Check CRON_SECRET in .env.local"
elif [ "$HTTP_CODE" = "500" ]; then
    echo "❌ Migration failed - Check error message above"
    echo ""
    echo "Common issues:"
    echo "  - Database connection (check POSTGRES_URL_NON_POOLING in .env.local)"
    echo "  - IP whitelisting (if using production database)"
else
    echo "❌ Unexpected response - HTTP $HTTP_CODE"
fi

echo ""
echo "📋 To stop the dev server:"
echo "   pkill -f 'next dev'"
echo ""


