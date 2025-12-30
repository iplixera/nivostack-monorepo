#!/bin/bash

# Manual Deployment Trigger for Vercel
# This triggers deployments from ikarimmagdy/devbridge

VERCEL_TOKEN="51FK0FgOarNnPGuqyZvlwPPm"
TEAM_ID="team_MBPi3LRUH16KWHeCO2JAQtxs"
PROJECT_ID="prj_5ktKrMgNxR1UgkfBLpufZl348Jvz"

echo ""
echo "🚀 Triggering Vercel Deployments"
echo "================================="
echo ""

# 1. Trigger deployment from develop branch
echo "→ Triggering deployment from develop branch..."
DEPLOY_RESPONSE=$(curl -s -X POST \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.vercel.com/v13/deployments" \
  -d "{
    \"name\": \"devbridge\",
    \"gitSource\": {
      \"type\": \"github\",
      \"repo\": \"ikarimmagdy/devbridge\",
      \"ref\": \"develop\"
    },
    \"target\": \"preview\",
    \"teamId\": \"$TEAM_ID\",
    \"projectSettings\": {
      \"framework\": \"nextjs\"
    }
  }")

DEPLOY_URL=$(echo "$DEPLOY_RESPONSE" | grep -o '"url":"[^"]*"' | head -1 | cut -d'"' -f4)
DEPLOY_ID=$(echo "$DEPLOY_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -n "$DEPLOY_URL" ]; then
  echo "✅ Deployment triggered!"
  echo "   URL: https://$DEPLOY_URL"
  echo "   ID: $DEPLOY_ID"
else
  echo "⚠️  Response: $(echo $DEPLOY_RESPONSE | head -c 200)"
fi

echo ""

# 2. Check recent deployments
echo "→ Checking recent deployments..."
DEPLOYMENTS=$(curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
  "https://api.vercel.com/v6/deployments?projectId=$PROJECT_ID&teamId=$TEAM_ID&limit=3")

echo "$DEPLOYMENTS" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    deployments = d.get('deployments', [])
    if deployments:
        print('  Recent deployments:')
        for dep in deployments[:3]:
            state = dep.get('state', 'unknown')
            branch = dep.get('meta', {}).get('githubCommitRef', 'unknown')
            url = dep.get('url', 'no-url')
            print(f'    {state}: {branch} → {url}')
    else:
        print('  No deployments found')
except Exception as e:
    print(f'  Error: {e}')
" 2>/dev/null || echo "  (Could not parse deployments)"

echo ""
echo "════════════════════════════════════════"
echo "✅ DEPLOYMENT TRIGGERED!"
echo "════════════════════════════════════════"
echo ""
echo "🔍 Check Deployment Status:"
echo "   https://vercel.com/mobile-team/devbridge/deployments"
echo ""
echo "📍 Your Repository:"
echo "   https://github.com/ikarimmagdy/devbridge"
echo ""
echo "⏱️  Deployment usually takes 1-3 minutes"
echo ""

