#!/bin/bash
set -e

echo "🔨 Running Production Build (Same as Vercel)"
echo "==========================================="
echo ""

cd "$(dirname "$0")"

# Step 1: Build
echo "1️⃣  Building project..."
echo ""

if pnpm build; then
    echo ""
    echo "✅ BUILD SUCCESSFUL!"
    echo ""
    echo "🚀 Starting production server..."
    echo "   Server: http://localhost:3000"
    echo "   Press Ctrl+C to stop"
    echo ""
    echo "==========================================="
    echo ""
    
    # Step 2: Start production server
    pnpm start
else
    echo ""
    echo "❌ BUILD FAILED"
    echo ""
    echo "Fix errors above before starting server"
    exit 1
fi

