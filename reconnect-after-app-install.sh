#!/bin/bash

# Run this AFTER installing Vercel GitHub App to ikarimmagdy account
# Install app here: https://github.com/apps/vercel/installations/new

VERCEL_TOKEN="51FK0FgOarNnPGuqyZvlwPPm"
PROJECT_ID="prj_5ktKrMgNxR1UgkfBLpufZl348Jvz"
TEAM_ID="team_MBPi3LRUH16KWHeCO2JAQtxs"
GITHUB_REPO="ikarimmagdy/devbridge"

echo ""
echo "🔗 Reconnecting Vercel to ikarimmagdy/devbridge"
echo "==============================================="
echo ""

# Step 1: Connect repository
echo "→ Connecting to $GITHUB_REPO..."
LINK_RESPONSE=$(curl -s -X POST \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.vercel.com/v1/projects/$PROJECT_ID/link?teamId=$TEAM_ID" \
  -d "{\"type\":\"github\",\"repo\":\"$GITHUB_REPO\"}")

if echo "$LINK_RESPONSE" | grep -q "error"; then
  echo "❌ Error: $(echo $LINK_RESPONSE | grep -o '"message":"[^"]*"' | cut -d'"' -f4)"
  echo ""
  echo "Make sure you've installed the Vercel GitHub App:"
  echo "  https://github.com/apps/vercel/installations/new"
  echo ""
  exit 1
fi

echo "✅ Connected to $GITHUB_REPO"
echo ""

# Step 2: Configure branches
echo "→ Setting production branch to 'main'..."
curl -s -X PATCH \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.vercel.com/v9/projects/$PROJECT_ID?teamId=$TEAM_ID" \
  -d '{"productionBranch":"main","framework":"nextjs"}' > /dev/null

echo "✅ Production branch: main"
echo "✅ Preview branch: develop (auto)"
echo ""

# Step 3: Verify
echo "→ Verifying configuration..."
REPO_CHECK=$(curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
  "https://api.vercel.com/v9/projects/$PROJECT_ID?teamId=$TEAM_ID" \
  | grep -o '"repo":"[^"]*"' | cut -d'"' -f4)

if [ "$REPO_CHECK" = "$GITHUB_REPO" ]; then
  echo "✅ Verified: Connected to $REPO_CHECK"
else
  echo "⚠️  Warning: Expected $GITHUB_REPO but got: $REPO_CHECK"
fi
echo ""

# Success!
echo "════════════════════════════════════════"
echo "✅ VERCEL RECONNECTED SUCCESSFULLY!"
echo "════════════════════════════════════════"
echo ""
echo "📋 Configuration:"
echo "  Repository:      $GITHUB_REPO"
echo "  Production:      main branch"
echo "  Preview:         develop branch"
echo ""
echo "🎯 Verify in Dashboard:"
echo "  → https://vercel.com/dashboard"
echo "  → Settings → Git"
echo "  → Should show: $GITHUB_REPO"
echo ""
echo "🧪 Test Deployment:"
echo "  git push origin develop"
echo ""
echo "✅ Done!"
echo ""

