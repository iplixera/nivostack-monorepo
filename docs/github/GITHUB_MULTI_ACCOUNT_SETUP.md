# GitHub Multi-Account Setup Guide

Guide for managing multiple GitHub accounts and repositories, including collaboration setup and Cursor IDE configuration.

---

## Table of Contents

1. [Problem Statement](#problem-statement)
2. [Solution Options](#solution-options)
3. [Option 1: Add Personal Account as Collaborator (Recommended)](#option-1-add-personal-account-as-collaborator-recommended)
4. [Option 2: Use Personal Token for All Repos](#option-2-use-personal-token-for-all-repos)
5. [Cursor IDE Configuration](#cursor-ide-configuration)
6. [Git Configuration for Multiple Accounts](#git-configuration-for-multiple-accounts)
7. [Best Practices](#best-practices)

---

## Problem Statement

**Current Situation:**
- Multiple GitHub accounts (e.g., `iplixera`, `ikarimmagdy`)
- Different repos owned by different accounts
- Need to work on both repos from same machine/IDE
- Want to avoid switching accounts constantly

**Challenges:**
- Git authentication conflicts
- Cursor IDE needs to know which token to use
- Commit author attribution
- Push permissions

---

## Solution Options

### Option 1: Add Personal Account as Collaborator ✅ **RECOMMENDED**
- Add your personal GitHub account as collaborator to all repos
- Use personal account's token for all operations
- Single authentication setup
- Clean commit history

### Option 2: Use Personal Token for All Repos
- Use personal account's token for all repos
- Works if you have access (owner or collaborator)
- Simpler setup

### Option 3: SSH Keys with Multiple Accounts
- Use SSH keys for different accounts
- More complex but very secure
- Good for long-term setup

---

## Option 1: Add Personal Account as Collaborator (Recommended)

### Step 1: Add Collaborator to Repositories

#### For Repository 1: `iplixera/nivostack-monorepo`

1. **Go to repository on GitHub:**
   ```
   https://github.com/iplixera/nivostack-monorepo
   ```

2. **Navigate to Settings:**
   - Click **Settings** tab
   - Click **Collaborators** in left sidebar
   - Click **Add people**

3. **Add your personal account:**
   - Search for your personal GitHub username (e.g., `ikarimmagdy`)
   - Select your account
   - Choose permission level:
     - **Write** - Can push, create branches (recommended for development)
     - **Admin** - Full access (if you need to manage settings)

4. **Accept invitation:**
   - Check email for invitation
   - Or go to: https://github.com/notifications
   - Accept the collaboration invitation

#### For Repository 2: `ikarimmagdy/devbridge` (or other repo)

Repeat the same process for the second repository.

### Step 2: Verify Access

```bash
# Check if you can access the repo
git ls-remote https://github.com/iplixera/nivostack-monorepo.git

# Should work without errors if you have access
```

### Step 3: Update Git Remote URLs

```bash
# Navigate to repository
cd /path/to/nivostack-monorepo-checkout

# Update remote to use your personal account
git remote set-url origin https://YOUR_PERSONAL_USERNAME@github.com/iplixera/nivostack-monorepo.git

# Or use SSH (if you prefer)
git remote set-url origin git@github.com:iplixera/nivostack-monorepo.git
```

---

## Option 2: Use Personal Token for All Repos

### Step 1: Create Personal Access Token

1. **Go to GitHub Settings:**
   ```
   https://github.com/settings/tokens
   ```

2. **Generate New Token:**
   - Click **Generate new token** → **Generate new token (classic)**
   - Name: `Cursor IDE - Personal`
   - Expiration: Choose appropriate (90 days, 1 year, or no expiration)
   - Select scopes:
     - ✅ `repo` - Full control of private repositories
     - ✅ `workflow` - Update GitHub Action workflows (if needed)
     - ✅ `write:packages` - Upload packages (if needed)
     - ✅ `delete:packages` - Delete packages (if needed)

3. **Generate and Copy Token:**
   - Click **Generate token**
   - **IMPORTANT:** Copy the token immediately (you won't see it again)
   - Save it securely (password manager recommended)

### Step 2: Use Token in Git Operations

#### For HTTPS URLs:

```bash
# When pushing, use token as password
git push https://YOUR_PERSONAL_USERNAME:YOUR_TOKEN@github.com/iplixera/nivostack-monorepo.git

# Or configure Git credential helper
git config --global credential.helper store
# Then on first push, enter:
# Username: YOUR_PERSONAL_USERNAME
# Password: YOUR_TOKEN
```

#### For SSH URLs:

```bash
# Generate SSH key for your personal account
ssh-keygen -t ed25519 -C "your_email@example.com" -f ~/.ssh/id_ed25519_personal

# Add to SSH agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519_personal

# Copy public key
cat ~/.ssh/id_ed25519_personal.pub

# Add to GitHub: https://github.com/settings/keys
# Click "New SSH key"
# Paste public key and save
```

---

## Cursor IDE Configuration

### Using Personal GitHub Token in Cursor

#### Method 1: Git Credential Helper (Recommended)

1. **Configure Git globally:**
   ```bash
   git config --global credential.helper store
   ```

2. **First push will prompt for credentials:**
   - Username: `your_personal_username`
   - Password: `your_personal_token` (not your GitHub password!)

3. **Credentials are saved** and Cursor will use them automatically

#### Method 2: Environment Variable

1. **Set environment variable:**
   ```bash
   # Add to ~/.zshrc or ~/.bashrc
   export GITHUB_TOKEN=your_personal_token_here
   ```

2. **Restart Cursor** to pick up environment variable

#### Method 3: Git Config with Token

```bash
# Configure Git to use token
git config --global url."https://YOUR_USERNAME:YOUR_TOKEN@github.com/".insteadOf "https://github.com/"

# This rewrites all GitHub URLs to include your token
```

### Cursor Settings

1. **Open Cursor Settings:**
   - `Cmd + ,` (Mac) or `Ctrl + ,` (Windows/Linux)

2. **Search for "Git":**
   - Enable: **Git: Enabled**
   - Enable: **Git: Auto Fetch**

3. **Git Authentication:**
   - Cursor uses system Git configuration
   - Make sure Git credential helper is configured (see above)

---

## Git Configuration for Multiple Accounts

### Per-Repository Configuration

```bash
# Navigate to repository
cd /path/to/nivostack-monorepo-checkout

# Set local Git config (only for this repo)
git config user.name "Your Personal Name"
git config user.email "your_personal_email@example.com"

# Verify
git config user.name
git config user.email
```

### Global Configuration (Default)

```bash
# Set global Git config (for all repos)
git config --global user.name "Your Personal Name"
git config --global user.email "your_personal_email@example.com"
```

### Multiple Accounts with SSH

Create `~/.ssh/config`:

```ssh
# Personal account (default)
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_personal
  IdentitiesOnly yes

# Organization account (if needed)
Host github-org
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_org
  IdentitiesOnly yes
```

Then use different hosts:
```bash
# For personal account repos
git remote set-url origin git@github.com:username/repo.git

# For org account repos
git remote set-url origin git@github-org:orgname/repo.git
```

---

## Best Practices

### ✅ Recommended Setup

1. **Add Personal Account as Collaborator**
   - Simplest solution
   - Single authentication setup
   - Clean commit history

2. **Use Personal Access Token**
   - More secure than password
   - Can be revoked if compromised
   - Fine-grained permissions

3. **Configure Git Credential Helper**
   - Store credentials securely
   - Works automatically with Cursor
   - No need to enter credentials repeatedly

4. **Set Per-Repository User Config**
   - Different email/name per repo if needed
   - Overrides global config
   - Maintains proper attribution

### ⚠️ Security Considerations

1. **Token Security:**
   - Never commit tokens to repository
   - Use environment variables or credential helper
   - Rotate tokens periodically
   - Use minimum required permissions

2. **SSH Key Security:**
   - Use strong passphrase
   - Don't share private keys
   - Use different keys for different accounts

3. **Credential Storage:**
   - Git credential helper stores in plain text
   - Consider using keychain (Mac) or credential manager (Windows)
   - Or use SSH keys instead

### 📝 Commit Author Attribution

**Important:** Commit author is determined by:
1. Local Git config (`user.name` and `user.email`)
2. Not by which account pushed the commit
3. Set per-repository if you want different attribution

```bash
# Check current author
git config user.name
git config user.email

# Set for specific repo
cd /path/to/repo
git config user.name "Account Name"
git config user.email "account@example.com"
```

---

## Step-by-Step Setup Checklist

### For Each Repository:

- [ ] Add personal GitHub account as collaborator
- [ ] Accept collaboration invitation
- [ ] Update remote URL (if needed)
- [ ] Set local Git user config
- [ ] Test push/pull access

### For Cursor IDE:

- [ ] Create personal access token
- [ ] Configure Git credential helper
- [ ] Test Git operations in Cursor
- [ ] Verify commit author attribution

### Verification:

```bash
# Test access
git ls-remote origin

# Test push (create test branch first)
git checkout -b test-access
git commit --allow-empty -m "Test access"
git push origin test-access
git push origin --delete test-access  # Clean up
```

---

## Troubleshooting

### Issue: Authentication Failed

**Solution:**
```bash
# Clear stored credentials
git credential reject
# Then try again - will prompt for new credentials

# Or remove from credential store
# Mac: Keychain Access → search "github"
# Windows: Credential Manager → Windows Credentials
```

### Issue: Wrong Commit Author

**Solution:**
```bash
# Check current config
git config user.name
git config user.email

# Set correct config
git config user.name "Correct Name"
git config user.email "correct@email.com"

# Fix last commit author
git commit --amend --author="Correct Name <correct@email.com>"
```

### Issue: Cursor Not Using Token

**Solution:**
1. Check Git credential helper is configured
2. Restart Cursor after configuring Git
3. Try pushing from terminal first to cache credentials
4. Check Cursor Git settings

---

## Summary

### Recommended Approach:

1. ✅ **Add personal account as collaborator** to all repos
2. ✅ **Use personal access token** for authentication
3. ✅ **Configure Git credential helper** for automatic auth
4. ✅ **Set per-repo Git config** for proper attribution
5. ✅ **Use same token in Cursor** - it will use Git config automatically

### Quick Setup Commands:

```bash
# 1. Configure Git credential helper
git config --global credential.helper store

# 2. Set per-repo user (repeat for each repo)
cd /path/to/repo
git config user.name "Your Name"
git config user.email "your@email.com"

# 3. First push will prompt for credentials
# Username: your_personal_username
# Password: your_personal_token
```

---

*Last Updated: December 2025*  
*For questions or issues, refer to GitHub documentation or create an issue.*

