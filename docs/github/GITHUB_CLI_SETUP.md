# GitHub CLI & Token Setup Guide

## 🎯 Overview

This guide will help you set up:
1. **GitHub CLI (gh)** - Command-line tool for GitHub
2. **GitHub Personal Access Token** - For authentication
3. **GitHub Actions** - For CI/CD automation
4. **Vercel Token** - Already set up in `vercel.properties`

---

## 📦 Step 1: Install GitHub CLI

### On macOS (Recommended):

```bash
# Using Homebrew (if you have it)
brew install gh

# Verify installation
gh --version
```

### Alternative (if Homebrew not available):

```bash
# Download binary directly
curl -fsSL https://github.com/cli/cli/releases/download/v2.40.0/gh_2.40.0_macOS_amd64.tar.gz -o gh.tar.gz
tar -xzf gh.tar.gz
sudo mv gh_2.40.0_macOS_amd64/bin/gh /usr/local/bin/
rm -rf gh.tar.gz gh_2.40.0_macOS_amd64

# Verify
gh --version
```

### Or use the installer:

```bash
# Download from: https://github.com/cli/cli/releases
# Run the .pkg installer
```

---

## 🔑 Step 2: Authenticate GitHub CLI

### Option A: Interactive Login (Easiest)

```bash
gh auth login
```

Follow the prompts:
1. **What account?** → GitHub.com
2. **Protocol?** → HTTPS
3. **Authenticate?** → Login with a web browser
4. **Copy code** → Opens browser, paste code
5. **Authorize** → Approve

### Option B: With Token (Manual)

```bash
# You'll need to create a token first (see Step 3)
gh auth login --with-token < token.txt
```

---

## 🎫 Step 3: Required Tokens

### A. GitHub Personal Access Token (PAT)

**Purpose**: Full GitHub API access (repos, workflows, packages)

**How to Create:**

1. Go to: https://github.com/settings/tokens/new
2. **Note**: `DevBridge CLI Access`
3. **Expiration**: 90 days (or No expiration)
4. **Select scopes**:

```
✅ repo (Full control of private repositories)
   ✅ repo:status
   ✅ repo_deployment
   ✅ public_repo
   ✅ repo:invite
   ✅ security_events

✅ workflow (Update GitHub Action workflows)

✅ admin:org (if using org)
   ✅ read:org
   ✅ write:org

✅ admin:repo_hook (Manage webhooks)
   ✅ write:repo_hook
   ✅ read:repo_hook

✅ delete_repo (Delete repositories - optional)
```

5. **Generate token**
6. **Copy token** (you won't see it again!)

**Save the token:**
```bash
# Create secure tokens file
echo "GITHUB_TOKEN=ghp_your_token_here" > ~/.devbridge_tokens
chmod 600 ~/.devbridge_tokens
```

### B. GitHub Actions Token (Automatic)

**Purpose**: Used in CI/CD workflows

**How it works:**
- Automatically provided by GitHub in Actions
- No manual setup needed
- Available as `${{ secrets.GITHUB_TOKEN }}`
- Limited to current repository

**Permissions**: Set in workflow file

### C. Vercel Token (Already Set Up)

**Purpose**: Deploy from CI/CD

**Status**: ✅ Already configured in `vercel.properties`

**Verify:**
```bash
cat vercel.properties | grep VERCEL_TOKEN
```

---

## 🔐 Step 4: Token Storage Strategy

### For Local Development:

Create `~/.devbridge_tokens`:
```bash
# GitHub Token
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Vercel Token (copy from vercel.properties)
VERCEL_TOKEN=PbKyuuUZHkyHTiCGbC6A6f52

# Optional: Database URLs for local dev
DATABASE_URL=postgresql://localhost/devbridge_dev
```

### For GitHub Actions (CI/CD):

Go to: https://github.com/pie-int/dev-bridge/settings/secrets/actions

Add repository secrets:
```
VERCEL_TOKEN          = (copy from vercel.properties)
VERCEL_ORG_ID        = (get from Vercel)
VERCEL_PROJECT_ID    = (get from Vercel)
```

---

## 🚀 Step 5: Verify Setup

```bash
# Check GitHub CLI
gh --version

# Check authentication
gh auth status

# Test API access
gh repo view pie-int/dev-bridge

# List branches
gh api repos/pie-int/dev-bridge/branches --jq '.[].name'

# Check if you can create issues
gh issue list --repo pie-int/dev-bridge
```

---

## 🛠️ Step 6: Common GitHub CLI Commands

### Repository Management

```bash
# View repo info
gh repo view

# Clone repo
gh repo clone pie-int/dev-bridge

# View repo in browser
gh repo view --web
```

### Branch Management

```bash
# List branches
gh api repos/pie-int/dev-bridge/branches --jq '.[].name'

# Create branch protection rule
gh api repos/pie-int/dev-bridge/branches/main/protection \
  --method PUT \
  --input protection-rules.json

# Delete branch
gh api repos/pie-int/dev-bridge/git/refs/heads/old-branch \
  --method DELETE
```

### Pull Requests

```bash
# Create PR
gh pr create --base develop --head feature/my-feature \
  --title "feat: my feature" \
  --body "Description"

# List PRs
gh pr list

# View PR
gh pr view 123

# Merge PR
gh pr merge 123 --squash

# Check PR status
gh pr checks
```

### GitHub Actions (CI/CD)

```bash
# List workflows
gh workflow list

# View workflow runs
gh run list

# Watch latest run
gh run watch

# Re-run failed jobs
gh run rerun --failed

# View workflow file
gh workflow view
```

### Issues

```bash
# Create issue
gh issue create --title "Bug: something broke" --body "Details"

# List issues
gh issue list

# Close issue
gh issue close 123
```

### Releases

```bash
# Create release
gh release create v1.6.0 --title "v1.6.0" --notes "Release notes"

# List releases
gh release list

# View latest release
gh release view --web
```

---

## 🔄 Step 7: Set Up Branch Protection (via CLI)

Create `branch-protection.json`:

```json
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["build", "test"]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "required_approving_review_count": 1
  },
  "restrictions": null,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false
}
```

Apply protection:

```bash
# Protect main branch
gh api repos/pie-int/dev-bridge/branches/main/protection \
  --method PUT \
  --input branch-protection.json

# Protect develop branch
gh api repos/pie-int/dev-bridge/branches/develop/protection \
  --method PUT \
  --input branch-protection.json
```

---

## 📋 Step 8: Get Vercel IDs (for CI/CD)

```bash
# Method 1: From Vercel CLI
vercel project ls

# Method 2: From Vercel dashboard
# Go to: https://vercel.com/flooss-bridge-hub/devbridge/settings
# Copy Project ID and Org ID

# Method 3: Via API
curl -H "Authorization: Bearer $VERCEL_TOKEN" \
  https://api.vercel.com/v9/projects
```

Save to GitHub Secrets:

```bash
# Using gh CLI
gh secret set VERCEL_ORG_ID --body "team_xxxxxxxxxxxx"
gh secret set VERCEL_PROJECT_ID --body "prj_xxxxxxxxxxxx"
gh secret set VERCEL_TOKEN --body "$(cat vercel.properties | grep VERCEL_TOKEN | cut -d= -f2)"
```

---

## ✅ Verification Checklist

After setup, verify:

```bash
# 1. GitHub CLI installed
gh --version
# Should show: gh version 2.40.0+

# 2. Authenticated
gh auth status
# Should show: ✓ Logged in to github.com

# 3. Can access repo
gh repo view pie-int/dev-bridge
# Should show repo info

# 4. Can list branches
gh api repos/pie-int/dev-bridge/branches --jq '.[].name'
# Should show: main, develop

# 5. Vercel token works
vercel --version
# Should work without errors

# 6. GitHub secrets set
gh secret list
# Should show: VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID
```

---

## 🎯 Quick Reference

### Tokens You Need:

| Token | Purpose | Where to Get | Where to Use |
|-------|---------|--------------|--------------|
| **GitHub PAT** | CLI + API access | https://github.com/settings/tokens | Local: `~/.devbridge_tokens` |
| **Vercel Token** | Deployments | Already in `vercel.properties` | GitHub Secrets |
| **Vercel Org ID** | Vercel API | Vercel Dashboard | GitHub Secrets |
| **Vercel Project ID** | Vercel API | Vercel Dashboard | GitHub Secrets |

### Installation Commands:

```bash
# Install GitHub CLI
brew install gh

# Login
gh auth login

# Verify
gh auth status
gh repo view pie-int/dev-bridge
```

### Set GitHub Secrets:

```bash
gh secret set VERCEL_TOKEN --body "your_token"
gh secret set VERCEL_ORG_ID --body "your_org_id"
gh secret set VERCEL_PROJECT_ID --body "your_project_id"
```

---

## 🆘 Troubleshooting

### "gh: command not found"
```bash
# Reinstall
brew install gh
# Or download from: https://github.com/cli/cli/releases
```

### "authentication required"
```bash
gh auth login
# Follow prompts
```

### "insufficient permissions"
```bash
# Recreate token with correct scopes
# Go to: https://github.com/settings/tokens
# Delete old token, create new one with required scopes
```

### "API rate limit exceeded"
```bash
# Check rate limit status
gh api rate_limit

# Wait or use different token
```

---

## 🔒 Security Best Practices

1. **Never commit tokens** to git
2. **Use `.gitignore`** for token files
3. **Rotate tokens** regularly (every 90 days)
4. **Use minimal scopes** - only what you need
5. **Revoke unused tokens** immediately
6. **Store securely** - use `chmod 600` on token files
7. **Don't share tokens** - each person should have their own

---

## 📚 Resources

- GitHub CLI Docs: https://cli.github.com/manual/
- GitHub PAT Guide: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token
- Vercel CLI: https://vercel.com/docs/cli
- GitHub Actions Secrets: https://docs.github.com/en/actions/security-guides/encrypted-secrets

---

**Next**: After setup, run `./setup-branches.sh` to create development branches!

