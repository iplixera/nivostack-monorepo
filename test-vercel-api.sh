#!/bin/bash

# Quick Vercel API Test
# This script verifies your Vercel token and finds your team/project IDs

VERCEL_TOKEN="51FK0FgOarNnPGuqyZvlwPPm"
VERCEL_TEAM_NAME="Mobile-Team"

echo "🔍 Testing Vercel API Access..."
echo ""

# Test 1: Get teams
echo "📋 Fetching teams..."
TEAMS_RESPONSE=$(curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
  "https://api.vercel.com/v2/teams")

if [ -n "$TEAMS_RESPONSE" ]; then
    echo "✅ API responded"
    echo ""
    echo "Available teams:"
    echo "$TEAMS_RESPONSE" | grep -o '"name":"[^"]*"' | cut -d'"' -f4
    echo ""
    
    # Find Mobile-Team ID
    TEAM_ID=$(echo "$TEAMS_RESPONSE" | grep -B2 "\"name\":\"$VERCEL_TEAM_NAME\"" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    
    if [ -n "$TEAM_ID" ]; then
        echo "✅ Found $VERCEL_TEAM_NAME ID: $TEAM_ID"
        echo ""
        
        # Test 2: Get projects for this team
        echo "📦 Fetching projects for $VERCEL_TEAM_NAME..."
        PROJECTS_RESPONSE=$(curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
          "https://api.vercel.com/v9/projects?teamId=$TEAM_ID")
        
        if [ -n "$PROJECTS_RESPONSE" ]; then
            echo "✅ Projects API responded"
            echo ""
            echo "Available projects:"
            echo "$PROJECTS_RESPONSE" | grep -o '"name":"[^"]*"' | cut -d'"' -f4
            echo ""
            
            # Find devbridge project
            PROJECT_ID=$(echo "$PROJECTS_RESPONSE" | grep "devbridge" -B2 -A2 | grep -o '"id":"prj_[^"]*"' | head -1 | cut -d'"' -f4)
            
            if [ -n "$PROJECT_ID" ]; then
                echo "✅ Found devbridge project ID: $PROJECT_ID"
                echo ""
                echo "════════════════════════════════════════"
                echo "✅ All IDs Found! Ready to proceed!"
                echo "════════════════════════════════════════"
                echo ""
                echo "Team ID:    $TEAM_ID"
                echo "Project ID: $PROJECT_ID"
                echo ""
                
                # Save to config file
                cat > .vercel-ids << EOF
VERCEL_TEAM_ID=$TEAM_ID
VERCEL_PROJECT_ID=$PROJECT_ID
EOF
                echo "💾 Saved to .vercel-ids"
            else
                echo "⚠️  Could not find 'devbridge' project"
                echo "Available projects:"
                echo "$PROJECTS_RESPONSE" | grep -o '"name":"[^"]*"' | cut -d'"' -f4 | sed 's/^/  - /'
            fi
        else
            echo "❌ Projects API failed"
        fi
    else
        echo "⚠️  Could not find team: $VERCEL_TEAM_NAME"
        echo "Available teams:"
        echo "$TEAMS_RESPONSE" | grep -o '"name":"[^"]*"' | cut -d'"' -f4 | sed 's/^/  - /'
    fi
else
    echo "❌ API call failed - check token"
fi

echo ""
echo "🔍 Debugging Info:"
echo "Teams response length: ${#TEAMS_RESPONSE}"
echo "First 200 chars: ${TEAMS_RESPONSE:0:200}"

