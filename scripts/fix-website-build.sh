#!/bin/bash

# Fix Website Build Configuration
# This script updates the website project to fix the Next.js detection issue

set -e

TEAM_ID="plixeras"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Load Vercel token
if [ -f "$ROOT_DIR/vercel.properties" ]; then
    export VERCEL_TOKEN=$(grep VERCEL_TOKEN "$ROOT_DIR/vercel.properties" | cut -d'=' -f2)
else
    echo "❌ vercel.properties not found"
    exit 1
fi

echo "🔧 Fixing Website Build Configuration"
echo "======================================"
echo ""

# Verify package.json exists and has Next.js
if [ ! -f "$ROOT_DIR/website/package.json" ]; then
    echo "❌ website/package.json not found"
    exit 1
fi

if ! grep -q '"next"' "$ROOT_DIR/website/package.json"; then
    echo "❌ Next.js not found in website/package.json"
    exit 1
fi

echo "✅ package.json found with Next.js"
echo ""

# Update project configuration
echo "📦 Updating nivostack-website configuration..."

RESPONSE=$(curl -s -X PATCH \
    "https://api.vercel.com/v9/projects/nivostack-website?teamId=${TEAM_ID}" \
    -H "Authorization: Bearer ${VERCEL_TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{
        "rootDirectory": "website",
        "buildCommand": "pnpm install && pnpm build",
        "outputDirectory": "website/.next",
        "framework": "nextjs",
        "installCommand": "pnpm install"
    }')

if echo "$RESPONSE" | grep -q "\"id\"" || echo "$RESPONSE" | grep -q "nivostack-website"; then
    echo "  ✅ Configuration updated successfully"
else
    echo "  ⚠️  Response: $RESPONSE"
fi

echo ""
echo "✅ Website build configuration fixed!"
echo ""
echo "🚀 Next Steps:"
echo "  1. Push a new commit to trigger deployment"
echo "  2. Or manually redeploy from Vercel Dashboard"
echo ""
echo "📋 Configuration:"
echo "  Root Directory: website"
echo "  Build Command: pnpm install && pnpm build"
echo "  Output Directory: website/.next"
echo "  Framework: nextjs"

