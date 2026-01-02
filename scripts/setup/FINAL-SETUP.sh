#!/bin/bash

# FINAL SETUP SCRIPT - Run this in your terminal
# This script will push code and deploy

set -e

cd /Users/karim-f/Code/devbridge

echo "🚀 Final Setup - Push & Deploy"
echo "==============================="
echo ""

# Set tokens
export GH_TOKEN="YOUR_GITHUB_TOKEN_HERE"
export VERCEL_TOKEN="51FK0FgOarNnPGuqyZvlwPPm"

# 1. Verify remote
echo "1. Checking git remote..."
CURRENT_REMOTE=$(git remote get-url origin 2>/dev/null || echo "")
if [[ "$CURRENT_REMOTE" != *"ikarimmagdy/devbridge"* ]]; then
    echo "   Setting remote to ikarimmagdy/devbridge..."
    git remote remove origin 2>/dev/null || true
    git remote add origin "https://$GH_TOKEN@github.com/ikarimmagdy/devbridge.git"
fi
echo "   ✅ Remote: $(git remote get-url origin | sed 's/ghp_[^@]*@/@/')"
echo ""

# 2. Commit changes
echo "2. Committing changes..."
git add -A
git commit -m "chore: final push to ikarimmagdy/devbridge" 2>/dev/null || echo "   Nothing to commit"
echo "   ✅ Ready to push"
echo ""

# 3. Push main
echo "3. Pushing to main..."
git checkout main 2>/dev/null || git checkout -b main
git push origin main --force
echo "   ✅ Main pushed"
echo ""

# 4. Push develop
echo "4. Pushing to develop..."
git checkout develop 2>/dev/null || git checkout -b develop
git push origin develop --force
echo "   ✅ Develop pushed"
echo ""

# 5. Verify on GitHub
echo "5. Verifying GitHub..."
if command -v gh &> /dev/null; then
    gh repo view ikarimmagdy/devbridge --json name,owner 2>/dev/null && echo "   ✅ Repository verified" || echo "   ⚠️  Could not verify with gh cli"
else
    curl -s -H "Authorization: token $GH_TOKEN" \
        "https://api.github.com/repos/ikarimmagdy/devbridge" \
        | grep -q '"name": "devbridge"' && echo "   ✅ Repository exists" || echo "   ⚠️  Could not verify"
fi
echo ""

# 6. Deploy with Vercel
echo "6. Deploying to Vercel..."
if command -v vercel &> /dev/null; then
    echo "   Using Vercel CLI..."
    vercel --prod --yes --token="$VERCEL_TOKEN" 2>&1 | tail -5
else
    echo "   Using Vercel API..."
    DEPLOY=$(curl -s -X POST \
        -H "Authorization: Bearer $VERCEL_TOKEN" \
        -H "Content-Type: application/json" \
        "https://api.vercel.com/v13/deployments" \
        -d "{\"name\":\"devbridge\",\"gitSource\":{\"type\":\"github\",\"repo\":\"ikarimmagdy/devbridge\",\"ref\":\"develop\"},\"teamId\":\"team_MBPi3LRUH16KWHeCO2JAQtxs\"}")
    
    if echo "$DEPLOY" | grep -q '"url"'; then
        URL=$(echo "$DEPLOY" | grep -o '"url":"[^"]*"' | cut -d'"' -f4)
        echo "   ✅ Deployment started: https://$URL"
    else
        echo "   ⚠️  Deploy response: $(echo $DEPLOY | head -c 100)"
    fi
fi
echo ""

# 7. Summary
echo "================================"
echo "✅ SETUP COMPLETE!"
echo "================================"
echo ""
echo "GitHub:  https://github.com/ikarimmagdy/devbridge"
echo "Vercel:  https://vercel.com/mobile-team/devbridge"
echo ""
echo "Check these URLs to verify everything is working!"
echo ""

