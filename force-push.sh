#!/bin/bash

# Force Push to ikarimmagdy/devbridge and Trigger Vercel Deployment

set -e

cd /Users/karim-f/Code/devbridge

echo "🚀 Pushing Code to ikarimmagdy/devbridge"
echo "========================================="
echo ""

# Check current status
echo "📋 Git Status:"
git status --short | head -20
echo ""

# Add all changes
echo "→ Adding all changes..."
git add -A

# Create commit
echo "→ Creating commit..."
git commit -m "chore: complete multi-environment setup and push to ikarimmagdy" 2>/dev/null || echo "  (No new changes to commit)"

# Push to main
echo ""
echo "→ Pushing to main branch..."
git checkout main 2>/dev/null || git checkout -b main
git push origin main --force
echo "✅ Pushed to main"

# Push to develop
echo ""
echo "→ Pushing to develop branch..."
git checkout develop 2>/dev/null || git checkout -b develop
git push origin develop --force
echo "✅ Pushed to develop"

# Push tags
echo ""
echo "→ Pushing tags..."
git push origin --tags --force 2>/dev/null || echo "  (No tags to push)"

echo ""
echo "════════════════════════════════════════"
echo "✅ CODE PUSHED SUCCESSFULLY!"
echo "════════════════════════════════════════"
echo ""
echo "📍 GitHub Repository:"
echo "   https://github.com/ikarimmagdy/devbridge"
echo ""
echo "🔍 Verify:"
echo "   1. Check GitHub: https://github.com/ikarimmagdy/devbridge"
echo "   2. Check Vercel: https://vercel.com/mobile-team/devbridge"
echo "   3. Deployments should start automatically"
echo ""
echo "🚀 Vercel should now deploy from:"
echo "   - main → Production"
echo "   - develop → Preview"
echo ""

