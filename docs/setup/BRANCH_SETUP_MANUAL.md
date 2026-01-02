# Branch Setup - Manual Steps

If the automated script doesn't work, follow these manual steps:

## Step 1: Commit All Current Changes

```bash
cd /Users/karim-f/Code/devbridge

# Check status
git status

# Add all changes
git add .

# Commit
git commit -m "chore: commit changes before branch setup"

# Push to main
git push origin main
```

## Step 2: Tag Current State

```bash
# Create baseline tag
git tag -a v1.5.1-baseline -m "Baseline before workflow change"

# Push tag
git push origin v1.5.1-baseline

# Verify
git tag -l
```

## Step 3: Create Develop Branch

```bash
# Make sure you're on main
git checkout main

# Pull latest
git pull origin main

# Create develop from main
git checkout -b develop

# Push to remote
git push -u origin develop

# Verify
git branch -a
```

## Step 4: Verify Setup

```bash
# Should show both branches
git branch -a

# Output should look like:
#   * develop
#     main
#   remotes/origin/HEAD -> origin/main
#   remotes/origin/develop
#   remotes/origin/main
```

## Step 5: You're Ready!

Current state:
- ✅ main branch: production
- ✅ develop branch: staging
- ✅ Baseline tagged
- ✅ Ready for feature branches

## Next: Create Your First Feature Branch

```bash
# From develop
git checkout develop

# Create feature branch
git checkout -b feature/test-workflow

# Make a small change
echo "# Test" >> test-workflow.md

# Commit
git add test-workflow.md
git commit -m "feat: test workflow setup"

# Push
git push origin feature/test-workflow

# Now create PR in GitHub: feature/test-workflow → develop
```

## Troubleshooting

### "Already on main"
```bash
git checkout main
git pull origin main
git checkout -b develop
```

### "Develop already exists"
```bash
git checkout develop
git pull origin develop
```

### "Uncommitted changes"
```bash
git stash
# Then retry
# After done:
git stash pop
```

### "Permission denied"
```bash
# Check remote
git remote -v

# Should show:
# origin  https://github.com/pie-int/dev-bridge.git
```

## Quick Reference

```bash
# Switch to main
git checkout main

# Switch to develop
git checkout develop

# Create feature branch
git checkout -b feature/my-feature

# Push feature branch
git push origin feature/my-feature

# See all branches
git branch -a

# See current branch
git branch --show-current
```

