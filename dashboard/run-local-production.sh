#!/bin/bash

echo "🚀 Running Dashboard Locally (Production Mode)"
echo "=============================================="
echo ""

cd "$(dirname "$0")"

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  Warning: .env.local not found"
    echo "   Make sure you have:"
    echo "   - POSTGRES_PRISMA_URL"
    echo "   - POSTGRES_URL_NON_POOLING"
    echo "   - JWT_SECRET"
    echo ""
fi

echo "1️⃣  Building project (same as Vercel)..."
echo ""

# Build the project
if pnpm build; then
    echo ""
    echo "✅ BUILD SUCCESSFUL!"
    echo ""
    echo "2️⃣  Starting production server..."
    echo "   📍 URL: http://localhost:3000"
    echo "   🛑 Press Ctrl+C to stop"
    echo ""
    echo "=============================================="
    echo ""
    
    # Start production server
    pnpm start
else
    echo ""
    echo "❌ BUILD FAILED"
    echo ""
    echo "Check errors above and fix them"
    exit 1
fi

