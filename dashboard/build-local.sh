#!/bin/bash
set -e

echo "🔨 Running local build (same as Vercel)..."
echo "=========================================="
echo ""

cd "$(dirname "$0")"

echo "1️⃣  Installing dependencies..."
pnpm install --silent

echo ""
echo "2️⃣  Running build..."
echo ""

# Run build and capture output
if pnpm build 2>&1 | tee /tmp/dashboard-build.log; then
    echo ""
    echo "✅ BUILD SUCCESSFUL!"
    echo ""
    echo "You can now push to GitHub and Vercel will deploy successfully."
else
    BUILD_EXIT=$?
    echo ""
    echo "❌ BUILD FAILED (exit code: $BUILD_EXIT)"
    echo ""
    echo "📋 Errors found:"
    echo "=================="
    grep -i "error\|failed\|Type error" /tmp/dashboard-build.log | head -20
    echo ""
    echo "Full build log: /tmp/dashboard-build.log"
    exit $BUILD_EXIT
fi

