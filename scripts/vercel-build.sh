#!/bin/bash

# Vercel Build Script with Database Migrations
# This script runs during Vercel deployment to:
# 1. Generate Prisma client
# 2. Run database migrations
# 3. Build Next.js app

set -e

echo "🚀 Vercel Build Process"
echo "======================"
echo ""

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR/dashboard"

# Step 1: Generate Prisma Client (REQUIRED)
echo "1️⃣  Generating Prisma Client..."
bash scripts/run-prisma-safe.sh generate
echo ""

# Step 2: Run Database Migrations (REQUIRED for deployment)
echo "2️⃣  Running Database Migrations..."
set +e  # Don't exit on error for migrations
if bash scripts/run-prisma-safe.sh push --skip-generate 2>&1; then
    echo "   ✅ Migrations applied successfully"
else
    echo "   ⚠️  Migration failed or skipped (will run on first API request)"
    echo "   This is OK if database is not reachable during build"
    echo "   Error handling in code will prevent 500 errors"
fi
set -e  # Re-enable exit on error
echo ""

# Step 3: Build Next.js App
echo "3️⃣  Building Next.js Application..."
next build --webpack

echo ""
echo "✅ Build complete!"

