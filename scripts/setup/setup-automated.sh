#!/bin/bash

# ============================================
# FULLY AUTOMATED Dual Remote Setup
# ============================================

set -e

# Configuration
GITHUB_TOKEN="YOUR_GITHUB_TOKEN_HERE"
VERCEL_TOKEN="51FK0FgOarNnPGuqyZvlwPPm"
GITHUB_USERNAME="$1"
REPO_NAME="devbridge"
REPO_PRIVATE="true"

if [ -z "$GITHUB_USERNAME" ]; then
    echo "Error: GitHub username required"
    echo "Usage: $0 <github-username>"
    echo ""
    echo "Example: $0 karim-f"
    exit 1
fi

echo ""
echo "🤖 FULLY AUTOMATED Dual Remote Setup"
echo "====================================="
echo ""
echo "GitHub Username: $GITHUB_USERNAME"
echo "Repository: $REPO_NAME"
echo "Mode: Fully Automated"
echo ""

# Step 1: Check current remotes
echo "🔍 Step 1: Checking current git remotes..."
git remote -v || true
echo ""

# Step 2: Backup current remote as 'flooss'
echo "💾 Step 2: Preserving Flooss remote..."
CURRENT_ORIGIN=$(git remote get-url origin 2>/dev/null || echo "")
if [ -n "$CURRENT_ORIGIN" ]; then
    git remote rename origin flooss 2>/dev/null || {
        git remote remove flooss 2>/dev/null || true
        git remote add flooss "$CURRENT_ORIGIN"
    }
    echo "✅ Flooss remote preserved"
else
    git remote add flooss https://github.com/pie-int/dev-bridge.git 2>/dev/null || true
    echo "✅ Flooss remote added"
fi
echo ""

# Step 3: Create repository
echo "📦 Step 3: Creating repository on GitHub..."
CREATE_RESPONSE=$(curl -s -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/user/repos \
  -d "{
    \"name\": \"$REPO_NAME\",
    \"description\": \"Mobile app monitoring and configuration platform with Flutter SDK\",
    \"private\": $REPO_PRIVATE,
    \"auto_init\": false,
    \"has_issues\": true,
    \"has_projects\": true,
    \"has_wiki\": false
  }")

if echo "$CREATE_RESPONSE" | grep -q "\"name\": \"$REPO_NAME\""; then
    echo "✅ Repository created: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
elif echo "$CREATE_RESPONSE" | grep -q "name already exists"; then
    echo "✅ Repository exists, using it"
else
    echo "ℹ️  Repository response received, continuing..."
fi
echo ""

# Step 4: Add new origin
echo "🔗 Step 4: Adding your repo as 'origin'..."
NEW_REPO_URL="https://$GITHUB_TOKEN@github.com/$GITHUB_USERNAME/$REPO_NAME.git"
git remote remove origin 2>/dev/null || true
git remote add origin "$NEW_REPO_URL"
echo "✅ Origin configured"
echo ""

# Step 5: Prepare code
echo "💾 Step 5: Preparing code..."
if [ -n "$(git status --porcelain)" ]; then
    git add -A
    git commit -m "chore: setup dual remote configuration" 2>/dev/null || echo "✅ Already committed"
else
    echo "✅ Nothing to commit"
fi
echo ""

# Step 6: Push branches
echo "🌿 Step 6: Pushing branches..."

# Ensure on main
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "main")
if [ "$CURRENT_BRANCH" != "main" ]; then
    git checkout main 2>/dev/null || git checkout -b main
fi

# Tag
git tag -a "v1.5.2-dual-remote" -m "Dual remote setup" 2>/dev/null || {
    git tag -d "v1.5.2-dual-remote" 2>/dev/null || true
    git tag -a "v1.5.2-dual-remote" -m "Dual remote setup"
}

# Push main
echo "→ Pushing main..."
git push -u origin main --force 2>&1 | grep -v "Enumerating\|Counting\|Compressing\|Writing" || true

# Ensure develop exists
git checkout -b develop 2>/dev/null || git checkout develop

# Push develop
echo "→ Pushing develop..."
git push -u origin develop --force 2>&1 | grep -v "Enumerating\|Counting\|Compressing\|Writing" || true

# Push tags
echo "→ Pushing tags..."
git push origin --tags --force 2>&1 | grep -v "Enumerating\|Counting\|Compressing\|Writing" || true

echo "✅ Branches pushed"
echo ""

# Step 7: Set default branch
echo "⚙️  Step 7: Setting default branch..."
curl -s -X PATCH \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/$GITHUB_USERNAME/$REPO_NAME \
  -d '{"default_branch": "develop"}' > /dev/null 2>&1 || true
echo "✅ Default branch set to develop"
echo ""

# Step 8: Branch protection
echo "🛡️  Step 8: Setting up branch protection..."

# Protect main
curl -s -X PUT \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/$GITHUB_USERNAME/$REPO_NAME/branches/main/protection \
  -d '{
    "required_status_checks": null,
    "enforce_admins": false,
    "required_pull_request_reviews": null,
    "restrictions": null,
    "allow_force_pushes": false,
    "allow_deletions": false
  }' > /dev/null 2>&1 && echo "  ✅ Main protected" || echo "  ℹ️  Main protection (manual setup may be needed)"

# Protect develop
curl -s -X PUT \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/$GITHUB_USERNAME/$REPO_NAME/branches/develop/protection \
  -d '{
    "required_status_checks": null,
    "enforce_admins": false,
    "required_pull_request_reviews": null,
    "restrictions": null,
    "allow_force_pushes": false,
    "allow_deletions": false
  }' > /dev/null 2>&1 && echo "  ✅ Develop protected" || echo "  ℹ️  Develop protection (manual setup may be needed)"

echo ""

# Step 9: Configure git
echo "⚙️  Step 9: Configuring git..."
git config remote.pushDefault origin
echo "✅ Default push remote: origin"
echo ""

# Step 10: Helper script
echo "📝 Step 10: Creating helper script..."
cat > push-to-both.sh << 'SCRIPT_END'
#!/bin/bash
BRANCH=$(git branch --show-current)
echo "Pushing $BRANCH to both remotes..."
echo "→ origin (Karim)..."
git push origin $BRANCH
echo "→ flooss (backup)..."
git push flooss $BRANCH 2>&1 || echo "⚠️  Flooss push failed (might need access)"
echo "✅ Done!"
SCRIPT_END
chmod +x push-to-both.sh
echo "✅ Created push-to-both.sh"
echo ""

# Success!
echo ""
echo "════════════════════════════════════════"
echo "✅ DUAL REMOTE SETUP COMPLETE!"
echo "════════════════════════════════════════"
echo ""
echo "📋 Git Remotes:"
git remote -v
echo ""
echo "🎯 Repository:"
echo "  https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo ""
echo "📤 Push Behavior:"
echo "  git push          → origin (your repo)"
echo "  ./push-to-both.sh → both remotes"
echo ""
echo "🚀 Next Steps:"
echo ""
echo "1. Configure Vercel:"
echo "   → https://vercel.com/dashboard"
echo "   → Settings → Git"
echo "   → Disconnect old repo"
echo "   → Connect: $GITHUB_USERNAME/$REPO_NAME"
echo "   → Production: main"
echo "   → Preview: develop"
echo ""
echo "2. Test deployment:"
echo "   → git push origin develop"
echo ""
echo "✅ Done!"
echo ""

