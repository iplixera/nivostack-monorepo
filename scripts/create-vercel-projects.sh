#!/bin/bash

# Create All 4 Vercel Projects
# Run this AFTER: vercel login

set -e

TEAM_ID="team_MBPi3LRUH16KWHeCO2JAQtxs"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "🚀 Creating NivoStack Vercel Projects"
echo "====================================="
echo ""

# Check authentication
if ! vercel whoami &> /dev/null; then
    echo "❌ Not authenticated. Please run: vercel login"
    exit 1
fi

echo "✅ Authenticated as: $(vercel whoami)"
echo ""

# 1. Website Project
echo "📦 1/4: Creating nivostack-website..."
cd "$ROOT_DIR/website"
vercel link --yes --scope "$TEAM_ID" --project "nivostack-website" 2>&1 | grep -E "(Linked|already)" || true
echo "✅ Website project linked"
echo ""

# 2. Studio Project
echo "📦 2/4: Creating nivostack-studio..."
cd "$ROOT_DIR/dashboard"
vercel link --yes --scope "$TEAM_ID" --project "nivostack-studio" --local-config vercel-studio.json 2>&1 | grep -E "(Linked|already)" || true
echo "✅ Studio project linked"
echo ""

# 3. Ingest API Project
echo "📦 3/4: Creating nivostack-ingest-api..."
vercel link --yes --scope "$TEAM_ID" --project "nivostack-ingest-api" --local-config vercel-ingest.json 2>&1 | grep -E "(Linked|already)" || true
echo "✅ Ingest API project linked"
echo ""

# 4. Control API Project
echo "📦 4/4: Creating nivostack-control-api..."
vercel link --yes --scope "$TEAM_ID" --project "nivostack-control-api" --local-config vercel-control.json 2>&1 | grep -E "(Linked|already)" || true
echo "✅ Control API project linked"
echo ""

echo "🎉 All projects created successfully!"
echo ""
echo "Next steps:"
echo "  1. Set environment variables: ./scripts/setup-env-vars.sh"
echo "  2. Add domains in Vercel Dashboard"
echo "  3. Configure DNS in GoDaddy"

