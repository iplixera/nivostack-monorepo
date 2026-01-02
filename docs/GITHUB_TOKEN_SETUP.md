# GitHub Token Setup for Issue Tracker

This guide explains how to configure a GitHub token for the issue tracker script.

---

## Quick Setup

The script supports three methods for GitHub authentication:

### Method 1: Environment Variable (Recommended)

```bash
# Set token in your shell
export GITHUB_TOKEN=ghp_your_token_here

# Or add to ~/.zshrc or ~/.bashrc
echo 'export GITHUB_TOKEN=ghp_your_token_here' >> ~/.zshrc
source ~/.zshrc
```

### Method 2: Token File

Create or edit `~/.devbridge_tokens`:

```bash
# Create file
nano ~/.devbridge_tokens

# Add this line:
GITHUB_TOKEN=ghp_your_token_here

# Make it secure
chmod 600 ~/.devbridge_tokens
```

### Method 3: GitHub CLI

If GitHub CLI is installed and authenticated, the script will use it automatically:

```bash
# Install GitHub CLI
brew install gh

# Authenticate
gh auth login
```

---

## Creating a GitHub Personal Access Token

1. **Go to GitHub Settings**:
   - https://github.com/settings/tokens/new
   - Or: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)

2. **Create New Token**:
   - Note: `NivoStack Issue Tracker`
   - Expiration: `90 days` or `No expiration`
   - **Scopes** (check these):
     - ✅ `repo` (Full control of private repositories)
       - ✅ `repo:status`
       - ✅ `repo_deployment`
       - ✅ `public_repo`
       - ✅ `repo:invite`
       - ✅ `security_events`
     - ✅ `workflow` (Update GitHub Action workflows)

3. **Generate and Copy Token**:
   - Click "Generate token"
   - **IMPORTANT**: Copy the token immediately (starts with `ghp_`)
   - You won't be able to see it again!

4. **Save Token Securely**:
   - Use a password manager
   - Or save to `~/.devbridge_tokens` (make sure it's secure)

---

## For iplixera@gmail.com

If you already have a token for `iplixera@gmail.com`:

1. **Find your existing token**:
   - Check `~/.devbridge_tokens` file
   - Check environment variables: `echo $GITHUB_TOKEN`
   - Check GitHub CLI: `gh auth status`

2. **Set it up**:
   ```bash
   # Option 1: Set environment variable
   export GITHUB_TOKEN=your_existing_token_here
   
   # Option 2: Add to token file
   echo "GITHUB_TOKEN=your_existing_token_here" >> ~/.devbridge_tokens
   chmod 600 ~/.devbridge_tokens
   ```

3. **Test it**:
   ```bash
   # Test in dry-run mode first
   ./scripts/sync-tracker-to-github.sh --dry-run
   
   # If that works, test authentication
   python3 -c "
   import sys
   sys.path.insert(0, 'scripts')
   from sync_tracker_to_github import get_github_token, check_github_access
   token = get_github_token()
   if token:
       print('Token found!')
       auth = check_github_access()
       print(f'Auth method: {auth}')
   else:
       print('No token found')
   "
   ```

---

## Verification

Test your token:

```bash
# Test with the script
./scripts/sync-tracker-to-github.sh --dry-run

# Or test directly with Python
python3 scripts/sync-tracker-to-github.py --dry-run
```

You should see:
```
✅ Using GitHub token (authenticated as: your_username)
```

---

## Troubleshooting

### "No GitHub access method found"

**Solution**: Set up a token using one of the methods above.

### "Token authentication failed: 401"

**Possible causes**:
- Token is invalid or expired
- Token doesn't have required scopes
- Token was revoked

**Solution**:
1. Create a new token with required scopes
2. Update your token in the config file or environment variable

### "Token authentication failed: 403"

**Possible causes**:
- Token doesn't have `repo` scope
- Repository is private and token doesn't have access

**Solution**:
1. Ensure token has `repo` scope
2. Verify token has access to `iplixera/nivostack-monorepo`

### Script works but can't create issues

**Check**:
- Token has `repo` scope
- You have write access to the repository
- Repository exists and is accessible

---

## Security Notes

- ⚠️ **Never commit tokens to git**
- ✅ Use `~/.devbridge_tokens` (already in `.gitignore`)
- ✅ Set file permissions: `chmod 600 ~/.devbridge_tokens`
- ✅ Use environment variables for CI/CD
- ✅ Rotate tokens periodically

---

## Next Steps

Once your token is configured:

1. **Test in dry-run mode**:
   ```bash
   ./scripts/sync-tracker-to-github.sh --dry-run
   ```

2. **Create real issues**:
   ```bash
   ./scripts/sync-tracker-to-github.sh
   ```

3. **View created issues**:
   - https://github.com/iplixera/nivostack-monorepo/issues

