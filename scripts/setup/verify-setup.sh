#!/bin/bash

# Verification Script - Check All Setup
# Run this to verify everything is working

VERCEL_TOKEN="51FK0FgOarNnPGuqyZvlwPPm"
GITHUB_TOKEN="YOUR_GITHUB_TOKEN_HERE"
PROJECT_ID="prj_5ktKrMgNxR1UgkfBLpufZl348Jvz"
TEAM_ID="team_MBPi3LRUH16KWHeCO2JAQtxs"

echo ""
echo "🔍 Verifying Multi-Environment Setup"
echo "====================================="
echo ""

# 1. Check Git
echo "📦 Git Configuration:"
cd /Users/karim-f/Code/devbridge
git remote -v | head -4
echo ""

# 2. Check Vercel
echo "🔗 Vercel Configuration:"
curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
  "https://api.vercel.com/v9/projects/$PROJECT_ID?teamId=$TEAM_ID" \
  | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    link = d.get('link', {})
    repo = link.get('repo', 'Not connected')
    prod_branch = d.get('productionBranch', 'Not set')
    framework = d.get('framework', 'Not set')
    print(f'  Repository: {repo}')
    print(f'  Production Branch: {prod_branch}')
    print(f'  Framework: {framework}')
    if repo == 'ikarimmagdy/devbridge':
        print('  ✅ CONNECTED TO IKARIMMAGDY!')
    else:
        print('  ⚠️  Not connected to ikarimmagdy/devbridge')
except:
    print('  ⚠️  Could not parse response')
"
echo ""

# 3. Check GitHub Branches
echo "🌿 GitHub Branches:"
curl -s -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/ikarimmagdy/devbridge/branches" \
  | python3 -c "
import sys, json
try:
    branches = json.load(sys.stdin)
    for b in branches:
        protected = '🛡️ ' if b.get('protected') else '  '
        print(f'  {protected}{b[\"name\"]}')
except:
    print('  ⚠️  Could not fetch branches')
"
echo ""

# 4. Check Recent Deployments
echo "🚀 Recent Deployments:"
curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
  "https://api.vercel.com/v6/deployments?projectId=$PROJECT_ID&teamId=$TEAM_ID&limit=3" \
  | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    deployments = d.get('deployments', [])
    if deployments:
        for dep in deployments[:3]:
            state = dep.get('state', 'unknown')
            branch = dep.get('meta', {}).get('githubCommitRef', 'unknown')
            url = dep.get('url', 'no-url')
            print(f'  {state}: {branch} → {url}')
    else:
        print('  No deployments found')
except:
    print('  ⚠️  Could not fetch deployments')
"
echo ""

# 5. Summary
echo "════════════════════════════════════════"
echo "📋 VERIFICATION COMPLETE"
echo "════════════════════════════════════════"
echo ""
echo "✅ Check Vercel Dashboard:"
echo "   https://vercel.com/mobile-team/devbridge"
echo ""
echo "✅ Check GitHub Repository:"
echo "   https://github.com/ikarimmagdy/devbridge"
echo ""
echo "✅ Production URL:"
echo "   https://devbridge-eta.vercel.app"
echo ""

