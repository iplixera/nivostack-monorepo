#!/bin/bash

# DevBridge - Setup Development Workflow
# Run this script to set up dev/staging/production workflow

set -e  # Exit on error

echo "🚀 DevBridge Development Workflow Setup"
echo "========================================"
echo ""

# Step 1: Tag current state
echo "📌 Step 1: Tagging current production state..."
git tag -a v1.5.1-baseline -m "Baseline before workflow change" 2>/dev/null || echo "Tag already exists, skipping..."
git push origin v1.5.1-baseline 2>/dev/null || echo "Tag already pushed, continuing..."
echo "✅ Current state tagged as v1.5.1-baseline"
echo ""

# Step 2: Create develop branch
echo "🌿 Step 2: Creating develop branch..."
git checkout -b develop 2>/dev/null || git checkout develop
git push -u origin develop 2>/dev/null || echo "Develop branch already exists on remote"
echo "✅ Develop branch created and pushed"
echo ""

# Step 3: Show next steps
echo "✅ Git Setup Complete!"
echo ""
echo "📋 Next Steps (Manual):"
echo ""
echo "1. Configure Vercel:"
echo "   - Go to: https://vercel.com/flooss-bridge-hub/devbridge/settings/git"
echo "   - Production Branch: main"
echo "   - Enable automatic deployments for: develop (staging)"
echo ""
echo "2. Set up Staging Database:"
echo "   - Create new Postgres database for staging"
echo "   - Copy schema: pg_dump production | psql staging"
echo "   - Add staging DB URL to Vercel Environment Variables (Preview scope)"
echo ""
echo "3. Update Branch Protection (GitHub):"
echo "   - Go to: https://github.com/pie-int/dev-bridge/settings/branches"
echo "   - Protect 'main': Require PR reviews, status checks"
echo "   - Protect 'develop': Require PR reviews"
echo ""
echo "4. Start Using Workflow:"
echo "   git checkout develop"
echo "   git checkout -b feature/my-feature"
echo "   # ... make changes ..."
echo "   git push origin feature/my-feature"
echo "   # Create PR to develop → test in staging"
echo "   # Create PR to main → deploy to production"
echo ""
echo "📚 Full Documentation: docs/DEV_PRODUCTION_WORKFLOW.md"
echo ""

