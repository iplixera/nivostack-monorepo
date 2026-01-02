# 🎯 Quick Setup - Tokens & CLI

## What You Need

### 1. GitHub Personal Access Token (PAT)
**Create here**: https://github.com/settings/tokens/new

**Settings**:
- Note: `DevBridge CLI & CI/CD`
- Expiration: `90 days` or `No expiration`
- **Scopes** (check these boxes):
  - ✅ `repo` (all sub-scopes)
  - ✅ `workflow`
  - ✅ `admin:repo_hook` (write:repo_hook, read:repo_hook)
  - ✅ `admin:org` → `read:org` (if using org)
  - ✅ `delete_repo` (optional)

**Save it**: Copy the token (starts with `ghp_`)

---

### 2. Vercel Token
**Status**: ✅ Already have it in `vercel.properties`

**Get it**:
```bash
cat vercel.properties | grep VERCEL_TOKEN
```

---

### 3. Vercel Project Details
**Get from**: https://vercel.com/flooss-bridge-hub/devbridge/settings

**Need**:
- Project ID (starts with `prj_`)
- Organization ID (starts with `team_`)

**Or via CLI**:
```bash
vercel project ls
```

---

## Installation Steps

### Step 1: Install GitHub CLI

```bash
# Run the setup script
cd /Users/karim-f/Code/devbridge
chmod +x setup-github-cli.sh
./setup-github-cli.sh
```

**What it does**:
1. Installs Homebrew (if needed)
2. Installs GitHub CLI
3. Installs/updates Vercel CLI
4. Authenticates with GitHub
5. Creates token template file

---

### Step 2: Add Your Tokens

**Edit token file**:
```bash
nano ~/.devbridge_tokens
```

**Fill in**:
```bash
GITHUB_TOKEN=ghp_your_actual_token_here
VERCEL_TOKEN=PbKyuuUZHkyHTiCGbC6A6f52  # from vercel.properties
VERCEL_ORG_ID=team_your_org_id
VERCEL_PROJECT_ID=prj_your_project_id
```

**Save**: `Ctrl+O`, then `Ctrl+X`

---

### Step 3: Add GitHub Secrets (for CI/CD)

```bash
# Source your tokens
source ~/.devbridge_tokens

# Add to GitHub
gh secret set VERCEL_TOKEN --body "$VERCEL_TOKEN"
gh secret set VERCEL_ORG_ID --body "$VERCEL_ORG_ID"
gh secret set VERCEL_PROJECT_ID --body "$VERCEL_PROJECT_ID"

# Verify
gh secret list
```

---

### Step 4: Set Up Branch Protection

```bash
cd /Users/karim-f/Code/devbridge
chmod +x scripts/setup-branch-protection.sh
./scripts/setup-branch-protection.sh
```

---

### Step 5: Create Branches

```bash
chmod +x setup-branches.sh
./setup-branches.sh
```

---

## Verification

```bash
# GitHub CLI installed?
gh --version

# Authenticated?
gh auth status

# Can access repo?
gh repo view pie-int/dev-bridge

# Secrets added?
gh secret list

# Branches created?
git branch -a
```

---

## Token Summary

| Token | Where to Get | Where to Use |
|-------|-------------|--------------|
| **GitHub PAT** | https://github.com/settings/tokens/new | `~/.devbridge_tokens` |
| **Vercel Token** | `vercel.properties` file | GitHub Secrets + local file |
| **Vercel Org ID** | https://vercel.com/account | GitHub Secrets |
| **Vercel Project ID** | Vercel project settings | GitHub Secrets |

---

## Quick Commands

```bash
# Install everything
./setup-github-cli.sh

# Set up branches
./setup-branches.sh

# Set up protection
./scripts/setup-branch-protection.sh

# Add secrets
source ~/.devbridge_tokens
gh secret set VERCEL_TOKEN --body "$VERCEL_TOKEN"
gh secret set VERCEL_ORG_ID --body "$VERCEL_ORG_ID"
gh secret set VERCEL_PROJECT_ID --body "$VERCEL_PROJECT_ID"

# Verify setup
gh auth status
gh secret list
git branch -a
```

---

## Full Documentation

- **Complete Guide**: `docs/GITHUB_CLI_SETUP.md`
- **Workflow Guide**: `docs/DEV_PRODUCTION_WORKFLOW.md`
- **Branch Setup**: `docs/BRANCH_SETUP_MANUAL.md`

---

## Next Steps After Setup

1. ✅ GitHub CLI installed & authenticated
2. ✅ Tokens added
3. ✅ Secrets configured
4. ✅ Branch protection enabled
5. ✅ Branches created

**Now you can:**
```bash
git checkout develop
git checkout -b feature/my-first-feature
# ... make changes ...
gh pr create --base develop --title "feat: my feature"
```

---

**Questions?** See `docs/GITHUB_CLI_SETUP.md` for troubleshooting!

