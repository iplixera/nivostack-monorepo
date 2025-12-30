#!/bin/bash

# ONE-COMMAND SETUP
# Run this: bash auto-setup.sh

GITHUB_USERNAME="ikarimmagdy"
GITHUB_TOKEN="YOUR_GITHUB_TOKEN_HERE"
REPO_NAME="devbridge"

echo "🤖 Starting automated setup..."

# 1. Rename current origin to flooss
echo "→ Backing up flooss remote..."
git remote rename origin flooss 2>/dev/null || git remote add flooss https://github.com/pie-int/dev-bridge.git

# 2. Create GitHub repo
echo "→ Creating GitHub repository..."
curl -s -X POST -H "Authorization: token $GITHUB_TOKEN" -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/user/repos \
  -d "{\"name\":\"$REPO_NAME\",\"private\":true,\"auto_init\":false}" > /tmp/github-response.json

# 3. Add new origin
echo "→ Setting up new origin..."
git remote add origin "https://$GITHUB_TOKEN@github.com/$GITHUB_USERNAME/$REPO_NAME.git"

# 4. Commit changes
echo "→ Committing changes..."
git add -A
git commit -m "chore: dual remote setup" 2>/dev/null || echo "Nothing to commit"

# 5. Push everything
echo "→ Pushing to your repository..."
git checkout main 2>/dev/null || git checkout -b main
git push -u origin main --force
git checkout develop 2>/dev/null || git checkout -b develop
git push -u origin develop --force
git push origin --tags --force

# 6. Set default remote
git config remote.pushDefault origin

# 7. Create helper
cat > push-to-both.sh << 'EOF'
#!/bin/bash
B=$(git branch --show-current)
git push origin $B && git push flooss $B
EOF
chmod +x push-to-both.sh

echo ""
echo "✅ DONE!"
echo ""
echo "Remotes:"
git remote -v
echo ""
echo "Your repo: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo ""
echo "Next: Configure Vercel to use your repo"
echo "  1. Go to: https://vercel.com/dashboard"
echo "  2. Settings → Git → Disconnect → Connect"
echo "  3. Select: $GITHUB_USERNAME/$REPO_NAME"
echo ""

