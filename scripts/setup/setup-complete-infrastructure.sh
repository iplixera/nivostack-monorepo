#!/bin/bash

# Complete Infrastructure Setup Script for NivoStack
# This script guides you through the complete setup process

set -e

TEAM_ID="team_MBPi3LRUH16KWHeCO2JAQtxs"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "🚀 NivoStack Complete Infrastructure Setup"
echo "==========================================="
echo ""
echo "This script will guide you through:"
echo "  1. Vercel authentication"
echo "  2. Creating 4 Vercel projects"
echo "  3. Configuring environment variables"
echo "  4. Adding domains"
echo "  5. DNS configuration instructions"
echo ""

# Step 1: Check Vercel CLI
echo "Step 1: Checking Vercel CLI..."
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found."
    echo "   Install with: npm i -g vercel"
    exit 1
fi
echo "✅ Vercel CLI installed: $(vercel --version)"
echo ""

# Step 2: Check authentication
echo "Step 2: Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    echo "❌ Not logged in to Vercel."
    echo "   Please run: vercel login"
    echo "   Then run this script again."
    exit 1
fi
echo "✅ Authenticated as: $(vercel whoami)"
echo ""

# Step 3: Create projects
echo "Step 3: Creating Vercel projects..."
echo ""

cd "$ROOT_DIR"

# Website project
echo "📦 Creating nivostack-website..."
cd website
vercel link --yes --scope "$TEAM_ID" --project "nivostack-website" 2>&1 | grep -v "already linked" || echo "  Already linked"
cd ..

# Studio project
echo "📦 Creating nivostack-studio..."
cd dashboard
vercel link --yes --scope "$TEAM_ID" --project "nivostack-studio" --local-config vercel-studio.json 2>&1 | grep -v "already linked" || echo "  Already linked"
cd ..

# Ingest API project
echo "📦 Creating nivostack-ingest-api..."
cd dashboard
vercel link --yes --scope "$TEAM_ID" --project "nivostack-ingest-api" --local-config vercel-ingest.json 2>&1 | grep -v "already linked" || echo "  Already linked"
cd ..

# Control API project
echo "📦 Creating nivostack-control-api..."
cd dashboard
vercel link --yes --scope "$TEAM_ID" --project "nivostack-control-api" --local-config vercel-control.json 2>&1 | grep -v "already linked" || echo "  Already linked"
cd ..

echo ""
echo "✅ All projects created!"
echo ""

# Step 4: Environment variables
echo "Step 4: Environment Variables Setup"
echo "===================================="
echo ""
echo "⚠️  You need to set environment variables manually in Vercel Dashboard"
echo "   or use the interactive script: ./scripts/setup-env-vars.sh"
echo ""
echo "Required variables:"
echo ""
echo "Shared (all projects):"
echo "  - POSTGRES_PRISMA_URL"
echo "  - POSTGRES_URL_NON_POOLING"
echo "  - JWT_SECRET"
echo ""
echo "Studio only:"
echo "  - STRIPE_SECRET_KEY"
echo "  - STRIPE_WEBHOOK_SECRET"
echo "  - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
echo ""
echo "Control API only:"
echo "  - STRIPE_SECRET_KEY"
echo "  - STRIPE_WEBHOOK_SECRET"
echo ""

# Step 5: Domain setup instructions
echo "Step 5: Domain Configuration"
echo "============================"
echo ""
echo "Add domains in Vercel Dashboard for each project:"
echo ""
echo "1. nivostack-website:"
echo "   - nivostack.com"
echo "   - www.nivostack.com"
echo ""
echo "2. nivostack-studio:"
echo "   - studio.nivostack.com"
echo ""
echo "3. nivostack-ingest-api:"
echo "   - ingest.nivostack.com"
echo ""
echo "4. nivostack-control-api:"
echo "   - api.nivostack.com"
echo ""
echo "After adding domains, Vercel will provide DNS configuration values."
echo "Then configure GoDaddy DNS records as shown in:"
echo "  docs/technical/INFRASTRUCTURE_SETUP_PLAN.md"
echo ""

echo "✅ Setup script complete!"
echo ""
echo "Next steps:"
echo "  1. Set environment variables (Vercel Dashboard or ./scripts/setup-env-vars.sh)"
echo "  2. Add domains in Vercel Dashboard"
echo "  3. Configure DNS in GoDaddy"
echo "  4. Test deployments"

