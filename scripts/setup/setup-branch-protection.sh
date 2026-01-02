#!/bin/bash

# ============================================
# Branch Protection Setup Script
# ============================================
# Sets up branch protection rules via GitHub CLI

set -e

echo ""
echo "🛡️  Setting Up Branch Protection"
echo "================================="
echo ""

# Check if gh is installed and authenticated
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI not found. Run ./setup-github-cli.sh first"
    exit 1
fi

if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated. Run: gh auth login"
    exit 1
fi

REPO="pie-int/dev-bridge"

echo "📋 Setting up protection for:"
echo "   Repository: $REPO"
echo "   Branches: main, develop"
echo ""

# Create protection rules JSON files
mkdir -p .github/protection-rules

# Main branch protection (strict)
cat > .github/protection-rules/main.json << 'EOF'
{
  "required_status_checks": {
    "strict": true,
    "contexts": []
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "required_approving_review_count": 1,
    "require_last_push_approval": false
  },
  "restrictions": null,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "block_creations": false,
  "required_conversation_resolution": true,
  "lock_branch": false,
  "allow_fork_syncing": false
}
EOF

# Develop branch protection (less strict)
cat > .github/protection-rules/develop.json << 'EOF'
{
  "required_status_checks": {
    "strict": false,
    "contexts": []
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": false,
    "require_code_owner_reviews": false,
    "required_approving_review_count": 1,
    "require_last_push_approval": false
  },
  "restrictions": null,
  "required_linear_history": false,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "block_creations": false,
  "required_conversation_resolution": false,
  "lock_branch": false,
  "allow_fork_syncing": false
}
EOF

echo "✅ Protection rule files created"
echo ""

# Apply to main branch
echo "🔒 Protecting 'main' branch..."
if gh api repos/$REPO/branches/main/protection \
    --method PUT \
    --input .github/protection-rules/main.json &> /dev/null; then
    echo "✅ main branch protected"
else
    echo "⚠️  Could not protect main (might already be protected or insufficient permissions)"
fi
echo ""

# Apply to develop branch
echo "🔒 Protecting 'develop' branch..."
if gh api repos/$REPO/branches/develop/protection \
    --method PUT \
    --input .github/protection-rules/develop.json &> /dev/null; then
    echo "✅ develop branch protected"
else
    echo "⚠️  Could not protect develop (might already be protected or insufficient permissions)"
fi
echo ""

# Set default branch for PRs
echo "🔧 Setting default branch to 'develop'..."
gh api repos/$REPO --method PATCH --field default_branch=develop 2>/dev/null || echo "⚠️  Could not change default branch"
echo ""

echo "════════════════════════════════════"
echo "✅ Branch Protection Setup Complete!"
echo "════════════════════════════════════"
echo ""
echo "📋 Protection rules applied:"
echo ""
echo "main branch:"
echo "  ✓ Requires pull request review (1 approver)"
echo "  ✓ Dismisses stale reviews"
echo "  ✓ Requires linear history"
echo "  ✓ No force pushes"
echo "  ✓ No deletions"
echo "  ✓ Requires conversation resolution"
echo ""
echo "develop branch:"
echo "  ✓ Requires pull request review (1 approver)"
echo "  ✓ No force pushes"
echo "  ✓ No deletions"
echo ""
echo "🌐 View in GitHub:"
echo "   https://github.com/$REPO/settings/branches"
echo ""

