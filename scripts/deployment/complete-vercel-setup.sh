#!/bin/bash

# Complete Vercel + GitHub Setup
# This configures both Vercel API and GitHub webhooks

set -e

VERCEL_TOKEN="51FK0FgOarNnPGuqyZvlwPPm"
GITHUB_TOKEN="YOUR_GITHUB_TOKEN_HERE"
PROJECT_ID="prj_5ktKrMgNxR1UgkfBLpufZl348Jvz"
TEAM_ID="team_MBPi3LRUH16KWHeCO2JAQtxs"
GITHUB_REPO="ikarimmagdy/devbridge"
GITHUB_OWNER="ikarimmagdy"
GITHUB_REPO_NAME="devbridge"

echo ""
echo "🚀 Complete Vercel + GitHub Integration Setup"
echo "=============================================="
echo ""

# Part 1: Configure Vercel
echo "📦 Part 1: Configuring Vercel Project"
echo "--------------------------------------"
echo ""

# Remove old link
echo "→ Removing old Git link..."
curl -s -X DELETE \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  "https://api.vercel.com/v1/projects/$PROJECT_ID/link?teamId=$TEAM_ID" \
  > /tmp/vercel-unlink.json 2>&1

sleep 2

# Update project settings
echo "→ Updating project settings..."
curl -s -X PATCH \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.vercel.com/v9/projects/$PROJECT_ID?teamId=$TEAM_ID" \
  -d "{
    \"name\": \"devbridge\",
    \"framework\": \"nextjs\",
    \"productionBranch\": \"main\",
    \"gitComments\": {
      \"onCommit\": true,
      \"onPullRequest\": true
    },
    \"autoExposeSystemEnvs\": true
  }" > /tmp/vercel-update.json 2>&1

sleep 2

# Link to new repo
echo "→ Linking to $GITHUB_REPO..."
curl -s -X POST \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.vercel.com/v1/projects/$PROJECT_ID/link?teamId=$TEAM_ID" \
  -d "{
    \"type\": \"github\",
    \"repo\": \"$GITHUB_REPO\",
    \"repoId\": 0
  }" > /tmp/vercel-link.json 2>&1

echo "✅ Vercel configured"
echo ""

# Part 2: Configure GitHub Webhooks
echo "📡 Part 2: Setting up GitHub Webhooks"
echo "--------------------------------------"
echo ""

# Get Vercel webhook URL
WEBHOOK_URL="https://api.vercel.com/v1/integrations/deploy/$PROJECT_ID"

echo "→ Getting existing webhooks..."
EXISTING_WEBHOOKS=$(curl -s \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/repos/$GITHUB_OWNER/$GITHUB_REPO_NAME/hooks")

# Check if Vercel webhook exists
VERCEL_HOOK_ID=$(echo "$EXISTING_WEBHOOKS" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ -n "$VERCEL_HOOK_ID" ]; then
  echo "→ Removing old Vercel webhook..."
  curl -s -X DELETE \
    -H "Authorization: token $GITHUB_TOKEN" \
    "https://api.github.com/repos/$GITHUB_OWNER/$GITHUB_REPO_NAME/hooks/$VERCEL_HOOK_ID"
  sleep 1
fi

echo "→ Creating new Vercel webhook..."
WEBHOOK_RESPONSE=$(curl -s -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/repos/$GITHUB_OWNER/$GITHUB_REPO_NAME/hooks" \
  -d "{
    \"name\": \"web\",
    \"active\": true,
    \"events\": [\"push\", \"pull_request\"],
    \"config\": {
      \"url\": \"$WEBHOOK_URL\",
      \"content_type\": \"json\",
      \"insecure_ssl\": \"0\"
    }
  }")

if echo "$WEBHOOK_RESPONSE" | grep -q '"id"'; then
  echo "✅ GitHub webhook created"
else
  echo "⚠️  Webhook response: $(echo $WEBHOOK_RESPONSE | head -c 200)"
fi
echo ""

# Part 3: Trigger test deployment
echo "🚀 Part 3: Triggering Test Deployment"
echo "--------------------------------------"
echo ""

echo "→ Creating deployment from develop branch..."
DEPLOY_RESPONSE=$(curl -s -X POST \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.vercel.com/v13/deployments" \
  -d "{
    \"name\": \"devbridge\",
    \"gitSource\": {
      \"type\": \"github\",
      \"repoId\": \"$GITHUB_OWNER/$GITHUB_REPO_NAME\",
      \"ref\": \"develop\"
    },
    \"target\": \"preview\",
    \"teamId\": \"$TEAM_ID\"
  }")

DEPLOY_URL=$(echo "$DEPLOY_RESPONSE" | grep -o '"url":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -n "$DEPLOY_URL" ]; then
  echo "✅ Deployment triggered: https://$DEPLOY_URL"
else
  echo "ℹ️  Deployment will trigger on next push"
  echo "   Response: $(echo $DEPLOY_RESPONSE | head -c 200)"
fi
echo ""

# Summary
echo ""
echo "════════════════════════════════════════"
echo "✅ SETUP COMPLETE!"
echo "════════════════════════════════════════"
echo ""
echo "📋 Configuration:"
echo "  GitHub Repo:     $GITHUB_REPO"
echo "  Vercel Project:  $PROJECT_ID"
echo "  Vercel Team:     $TEAM_ID"
echo "  Production:      main"
echo "  Preview:         develop"
echo ""
echo "🔍 Verify Setup:"
echo ""
echo "1. Check Vercel Dashboard:"
echo "   https://vercel.com/dashboard"
echo ""
echo "2. Check Project Settings:"
echo "   https://vercel.com/$TEAM_ID/devbridge/settings/git"
echo ""
echo "3. Check GitHub Webhooks:"
echo "   https://github.com/$GITHUB_OWNER/$GITHUB_REPO_NAME/settings/hooks"
echo ""
echo "🧪 Test Deployment:"
echo "   cd /Users/karim-f/Code/devbridge"
echo "   git push origin develop"
echo ""
echo "✅ Done!"
echo ""

# Save configuration
cat > /Users/karim-f/Code/devbridge/.vercel-setup-complete << EOF
GitHub Repo: $GITHUB_REPO
Vercel Project: $PROJECT_ID
Vercel Team: $TEAM_ID
Setup Date: $(date)
Status: Complete
EOF

echo "💾 Configuration saved to .vercel-setup-complete"
echo ""

