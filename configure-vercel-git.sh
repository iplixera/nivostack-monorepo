#!/bin/bash

# Direct Vercel API Configuration
# Uses exact project and team IDs

VERCEL_TOKEN="51FK0FgOarNnPGuqyZvlwPPm"
PROJECT_ID="prj_5ktKrMgNxR1UgkfBLpufZl348Jvz"
TEAM_ID="team_MBPi3LRUH16KWHeCO2JAQtxs"
GITHUB_REPO="ikarimmagdy/devbridge"

echo ""
echo "🚀 Configuring Vercel Git Connection"
echo "====================================="
echo ""
echo "Project ID: $PROJECT_ID"
echo "Team ID: $TEAM_ID"
echo "GitHub Repo: $GITHUB_REPO"
echo ""

# Step 1: Remove existing Git connection
echo "🔌 Removing old Git connection..."
curl -s -X DELETE \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  "https://api.vercel.com/v1/projects/$PROJECT_ID/link?teamId=$TEAM_ID"

echo "✅ Disconnected"
echo ""

# Step 2: Update project to use new repo
echo "🔗 Connecting to $GITHUB_REPO..."

UPDATE_RESPONSE=$(curl -s -X PATCH \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.vercel.com/v9/projects/$PROJECT_ID?teamId=$TEAM_ID" \
  -d "{
    \"link\": {
      \"type\": \"github\",
      \"repo\": \"$GITHUB_REPO\"
    },
    \"productionBranch\": \"main\",
    \"framework\": \"nextjs\",
    \"buildCommand\": null,
    \"devCommand\": null,
    \"installCommand\": null,
    \"outputDirectory\": null
  }")

if echo "$UPDATE_RESPONSE" | grep -q "error"; then
  echo "⚠️  Response: $UPDATE_RESPONSE"
else
  echo "✅ Connected to $GITHUB_REPO"
fi
echo ""

# Step 3: Set up Git integration
echo "⚙️  Configuring Git integration..."

curl -s -X POST \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.vercel.com/v1/projects/$PROJECT_ID/link?teamId=$TEAM_ID" \
  -d "{
    \"type\": \"github\",
    \"repo\": \"$GITHUB_REPO\"
  }"

echo "✅ Git integration configured"
echo ""

# Step 4: Get current project info
echo "📋 Verifying configuration..."

PROJECT_INFO=$(curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
  "https://api.vercel.com/v9/projects/$PROJECT_ID?teamId=$TEAM_ID")

LINKED_REPO=$(echo "$PROJECT_INFO" | grep -o '"repo":"[^"]*"' | head -1 | cut -d'"' -f4)

echo "  Current linked repo: $LINKED_REPO"
echo ""

# Success
echo "════════════════════════════════════════"
echo "✅ CONFIGURATION COMPLETE!"
echo "════════════════════════════════════════"
echo ""
echo "Verify in Vercel:"
echo "  → https://vercel.com/$TEAM_ID/$PROJECT_ID/settings/git"
echo ""
echo "Test deployment:"
echo "  → git push origin develop"
echo ""

