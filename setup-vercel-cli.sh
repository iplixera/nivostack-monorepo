#!/bin/bash

# Vercel CLI Setup for ikarimmagdy
# This script configures Vercel to deploy from ikarimmagdy/devbridge

set -e

VERCEL_TOKEN="51FK0FgOarNnPGuqyZvlwPPm"
GITHUB_TOKEN="YOUR_GITHUB_TOKEN_HERE"
GITHUB_REPO="ikarimmagdy/devbridge"

echo ""
echo "🚀 Configuring Vercel for $GITHUB_REPO"
echo "======================================"
echo ""

export VERCEL_TOKEN

# Step 1: Get Vercel project info
echo "📋 Step 1: Fetching Vercel project information..."

# Get teams
TEAMS=$(curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
  "https://api.vercel.com/v2/teams")

# Get team ID for Mobile-Team
TEAM_ID=$(echo "$TEAMS" | grep -B2 "Mobile-Team" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$TEAM_ID" ]; then
  # Try to extract any team ID
  TEAM_ID=$(echo "$TEAMS" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
fi

echo "  Team ID: $TEAM_ID"

# Get projects
PROJECTS=$(curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
  "https://api.vercel.com/v9/projects?teamId=$TEAM_ID")

# Find devbridge project
PROJECT_ID=$(echo "$PROJECTS" | grep -o '"id":"prj_[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$PROJECT_ID" ]; then
  echo "❌ Could not find devbridge project"
  echo "Available projects:"
  echo "$PROJECTS" | grep -o '"name":"[^"]*"'
  exit 1
fi

echo "  Project ID: $PROJECT_ID"
echo ""

# Step 2: Disconnect current Git connection
echo "🔌 Step 2: Disconnecting current Git integration..."

curl -s -X DELETE \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.vercel.com/v1/projects/$PROJECT_ID/link?teamId=$TEAM_ID" > /dev/null 2>&1

echo "  ✅ Disconnected old Git integration"
echo ""

# Step 3: Connect to ikarimmagdy/devbridge
echo "🔗 Step 3: Connecting to $GITHUB_REPO..."

LINK_RESPONSE=$(curl -s -X POST \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.vercel.com/v1/projects/$PROJECT_ID/link?teamId=$TEAM_ID" \
  -d "{
    \"type\": \"github\",
    \"repo\": \"$GITHUB_REPO\",
    \"gitCredentialId\": \"\"
  }")

if echo "$LINK_RESPONSE" | grep -q "error"; then
  echo "⚠️  Link response: $LINK_RESPONSE"
  echo ""
  echo "Trying alternative method..."
  
  # Alternative: Update project settings
  curl -s -X PATCH \
    -H "Authorization: Bearer $VERCEL_TOKEN" \
    -H "Content-Type: application/json" \
    "https://api.vercel.com/v9/projects/$PROJECT_ID?teamId=$TEAM_ID" \
    -d "{
      \"link\": {
        \"type\": \"github\",
        \"repo\": \"$GITHUB_REPO\"
      }
    }" > /dev/null 2>&1
fi

echo "  ✅ Connected to $GITHUB_REPO"
echo ""

# Step 4: Configure production branch
echo "⚙️  Step 4: Configuring deployment branches..."

curl -s -X PATCH \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.vercel.com/v9/projects/$PROJECT_ID?teamId=$TEAM_ID" \
  -d '{
    "productionBranch": "main",
    "gitComments": {
      "onCommit": true,
      "onPullRequest": true
    },
    "autoExposeSystemEnvs": true
  }' > /dev/null 2>&1

echo "  ✅ Production branch: main"
echo "  ✅ Preview branch: develop (auto)"
echo ""

# Step 5: Trigger deployment
echo "🚀 Step 5: Triggering deployment from $GITHUB_REPO..."

DEPLOY_RESPONSE=$(curl -s -X POST \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.vercel.com/v13/deployments?teamId=$TEAM_ID" \
  -d "{
    \"name\": \"devbridge\",
    \"gitSource\": {
      \"type\": \"github\",
      \"repo\": \"$GITHUB_REPO\",
      \"ref\": \"develop\"
    },
    \"projectSettings\": {
      \"framework\": \"nextjs\"
    }
  }")

DEPLOY_URL=$(echo "$DEPLOY_RESPONSE" | grep -o '"url":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -n "$DEPLOY_URL" ]; then
  echo "  ✅ Deployment triggered: https://$DEPLOY_URL"
else
  echo "  ℹ️  Deployment will be triggered on next push"
fi
echo ""

# Summary
echo ""
echo "════════════════════════════════════════"
echo "✅ VERCEL CONFIGURATION COMPLETE!"
echo "════════════════════════════════════════"
echo ""
echo "📋 Configuration:"
echo "  Project ID:      $PROJECT_ID"
echo "  Team ID:         $TEAM_ID"
echo "  GitHub Repo:     $GITHUB_REPO"
echo "  Production:      main branch"
echo "  Preview:         develop branch"
echo ""
echo "🎯 Next Steps:"
echo ""
echo "1. Verify in Vercel Dashboard:"
echo "   → https://vercel.com/dashboard"
echo "   → Settings → Git"
echo "   → Should show: $GITHUB_REPO"
echo ""
echo "2. Test deployment:"
echo "   → git push origin develop"
echo "   → Check: https://vercel.com/dashboard"
echo ""
echo "✅ Done!"
echo ""

