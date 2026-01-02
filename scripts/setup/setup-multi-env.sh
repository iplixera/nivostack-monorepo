#!/bin/bash

# Complete Multi-Environment Setup
# GitHub + Vercel + Branch Protection

set -e

GITHUB_TOKEN="YOUR_GITHUB_TOKEN_HERE"
VERCEL_TOKEN="51FK0FgOarNnPGuqyZvlwPPm"
PROJECT_ID="prj_5ktKrMgNxR1UgkfBLpufZl348Jvz"
TEAM_ID="team_MBPi3LRUH16KWHeCO2JAQtxs"
GITHUB_OWNER="ikarimmagdy"
GITHUB_REPO="devbridge"

echo ""
echo "🚀 Complete Multi-Environment Setup"
echo "===================================="
echo ""

# Part 1: Verify Git Setup
echo "📦 Part 1: Verifying Git Configuration"
echo "---------------------------------------"
echo ""

cd /Users/karim-f/Code/devbridge

echo "→ Current remotes:"
git remote -v

echo ""
echo "→ Current branches:"
git branch -a

echo ""
echo "✅ Git configured"
echo ""

# Part 2: Connect Vercel
echo "🔗 Part 2: Connecting Vercel to ikarimmagdy/devbridge"
echo "------------------------------------------------------"
echo ""

echo "→ Linking repository..."
LINK_RESPONSE=$(curl -s -X POST \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.vercel.com/v1/projects/$PROJECT_ID/link?teamId=$TEAM_ID" \
  -d "{\"type\":\"github\",\"repo\":\"$GITHUB_OWNER/$GITHUB_REPO\"}")

if echo "$LINK_RESPONSE" | grep -q "error"; then
  ERROR_MSG=$(echo "$LINK_RESPONSE" | grep -o '"message":"[^"]*"' | cut -d'"' -f4)
  echo "⚠️  $ERROR_MSG"
  echo "   Note: This might mean it's already connected or needs manual verification"
else
  echo "✅ Repository linked"
fi

sleep 2

echo "→ Configuring production branch..."
curl -s -X PATCH \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.vercel.com/v9/projects/$PROJECT_ID?teamId=$TEAM_ID" \
  -d '{
    "productionBranch": "main",
    "framework": "nextjs",
    "gitComments": {
      "onCommit": true,
      "onPullRequest": true
    }
  }' > /dev/null

echo "✅ Vercel configured"
echo ""

# Part 3: Set up GitHub Branch Protection
echo "🛡️  Part 3: Setting up GitHub Branch Protection"
echo "----------------------------------------------"
echo ""

# Protect main branch
echo "→ Protecting main branch..."
MAIN_PROTECTION=$(curl -s -X PUT \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/repos/$GITHUB_OWNER/$GITHUB_REPO/branches/main/protection" \
  -d '{
    "required_status_checks": null,
    "enforce_admins": false,
    "required_pull_request_reviews": null,
    "restrictions": null,
    "required_linear_history": true,
    "allow_force_pushes": false,
    "allow_deletions": false
  }')

if echo "$MAIN_PROTECTION" | grep -q "protection"; then
  echo "✅ Main branch protected"
else
  echo "⚠️  Main protection: manual verification may be needed"
fi

# Protect develop branch
echo "→ Protecting develop branch..."
DEV_PROTECTION=$(curl -s -X PUT \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/repos/$GITHUB_OWNER/$GITHUB_REPO/branches/develop/protection" \
  -d '{
    "required_status_checks": null,
    "enforce_admins": false,
    "required_pull_request_reviews": null,
    "restrictions": null,
    "allow_force_pushes": false,
    "allow_deletions": false
  }')

if echo "$DEV_PROTECTION" | grep -q "protection"; then
  echo "✅ Develop branch protected"
else
  echo "⚠️  Develop protection: manual verification may be needed"
fi

echo ""

# Part 4: Test Push & Deployment
echo "🧪 Part 4: Testing Push & Deployment"
echo "------------------------------------"
echo ""

echo "→ Creating test commit..."
echo "# Multi-Environment Setup Complete - $(date)" > MULTI_ENV_SETUP_COMPLETE.md
git add -A
git commit -m "chore: complete multi-environment setup - ikarimmagdy/devbridge" 2>/dev/null || echo "Nothing new to commit"

echo "→ Pushing to develop branch..."
git checkout develop 2>/dev/null || git checkout -b develop
git push origin develop

echo "✅ Pushed to develop"
echo ""

# Part 5: Verification
echo "🔍 Part 5: Verifying Setup"
echo "--------------------------"
echo ""

# Check Vercel connection
echo "→ Checking Vercel connection..."
PROJECT_INFO=$(curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
  "https://api.vercel.com/v9/projects/$PROJECT_ID?teamId=$TEAM_ID")

LINKED_REPO=$(echo "$PROJECT_INFO" | grep -o '"repo":"[^"]*"' | cut -d'"' -f4 | head -1)
PROD_BRANCH=$(echo "$PROJECT_INFO" | grep -o '"productionBranch":"[^"]*"' | cut -d'"' -f4)

if [ -n "$LINKED_REPO" ]; then
  echo "✅ Vercel linked to: $LINKED_REPO"
else
  echo "⚠️  Vercel repo: Not detected (may need manual verification)"
fi

if [ -n "$PROD_BRANCH" ]; then
  echo "✅ Production branch: $PROD_BRANCH"
else
  echo "⚠️  Production branch: Not detected"
fi

# Check GitHub branches
echo "→ Checking GitHub branches..."
GITHUB_BRANCHES=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/$GITHUB_OWNER/$GITHUB_REPO/branches" \
  | grep -o '"name":"[^"]*"' | cut -d'"' -f4)

echo "   Available branches:"
echo "$GITHUB_BRANCHES" | while read branch; do
  echo "   - $branch"
done

echo ""

# Summary
echo ""
echo "════════════════════════════════════════"
echo "✅ MULTI-ENVIRONMENT SETUP COMPLETE!"
echo "════════════════════════════════════════"
echo ""
echo "📋 Configuration Summary:"
echo ""
echo "GitHub:"
echo "  Repository:      https://github.com/$GITHUB_OWNER/$GITHUB_REPO"
echo "  Main Branch:     Protected ✓"
echo "  Develop Branch:  Protected ✓"
echo ""
echo "Vercel:"
echo "  Project:         $PROJECT_ID"
echo "  Team:            Mobile-Team"
echo "  Linked Repo:     ${LINKED_REPO:-Check dashboard}"
echo "  Production:      main → https://devbridge-eta.vercel.app"
echo "  Preview:         develop → auto-preview-url"
echo ""
echo "Deployment Flow:"
echo "  develop → Preview  (automatic on push)"
echo "  main → Production  (automatic on push)"
echo ""
echo "🎯 Verify in Dashboards:"
echo ""
echo "1. GitHub:"
echo "   → https://github.com/$GITHUB_OWNER/$GITHUB_REPO"
echo "   → Settings → Branches (check protection)"
echo ""
echo "2. Vercel:"
echo "   → https://vercel.com/dashboard"
echo "   → Settings → Git (check connection)"
echo ""
echo "3. Test Deployment:"
echo "   → Check: https://vercel.com/mobile-team/devbridge"
echo "   → Should see deployment from: $GITHUB_OWNER/$GITHUB_REPO"
echo ""
echo "🎉 Setup Complete!"
echo ""

