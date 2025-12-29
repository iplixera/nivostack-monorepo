# Branching Strategy for Long-Term Development

**Last Updated**: December 29, 2024  
**Status**: Active

---

## Overview

This document outlines the branching strategy for the NivoStack monorepo, designed to support long-term development while maintaining stability and enabling standardized releases.

---

## Branch Structure

```
main (production)
├── develop (integration)
│   ├── feature/sdk-feature-x
│   ├── feature/dashboard-feature-y
│   └── bugfix/issue-123
├── release/v1.0.0 (release candidate)
└── hotfix/critical-bug (emergency fixes)
```

---

## Branch Types

### 1. `main` - Production Branch

**Purpose**: Production-ready code only

**Rules**:
- ✅ Only merge from `release/*` or `hotfix/*` branches
- ✅ Always stable and tested
- ✅ Protected branch (requires PR + approval)
- ✅ Every commit triggers production deployment (dashboard)

**When to use**:
- Final release preparation
- Critical hotfixes

---

### 2. `develop` - Development Branch

**Purpose**: Integration branch for ongoing development

**Rules**:
- ✅ Merge feature branches here
- ✅ Merge bugfix branches here
- ✅ Continuous integration testing
- ✅ Can be unstable during active development

**When to use**:
- Daily development work
- Feature integration
- Bug fix integration

---

### 3. `feature/*` - Feature Branches

**Purpose**: Develop new features

**Naming**: `feature/sdk-feature-name` or `feature/dashboard-feature-name`

**Examples**:
- `feature/sdk-user-management`
- `feature/dashboard-analytics`
- `feature/flutter-offline-support`

**Rules**:
- ✅ Branch from `develop`
- ✅ Merge back to `develop` when complete
- ✅ Delete after merging
- ✅ Keep focused on single feature

**Workflow**:
```bash
# Create feature branch
git checkout develop
git pull origin develop
git checkout -b feature/sdk-user-management

# Work on feature
git add .
git commit -m "feat(sdk): add user management"

# Push and create PR
git push origin feature/sdk-user-management
# Create PR: feature/sdk-user-management → develop
```

---

### 4. `release/*` - Release Branches

**Purpose**: Prepare new release

**Naming**: `release/v1.0.0`

**Rules**:
- ✅ Branch from `develop` when ready to release
- ✅ Only bug fixes and release preparation
- ✅ No new features
- ✅ Merge to both `main` and `develop` when done

**Workflow**:
```bash
# Create release branch
git checkout develop
git pull origin develop
git checkout -b release/v1.0.0

# Update versions
# Update CHANGELOG.md
# Fix any release-blocking bugs

git add .
git commit -m "chore: prepare release v1.0.0"

# Merge to main
git checkout main
git merge release/v1.0.0
git tag v1.0.0
git push origin main --tags

# Merge back to develop
git checkout develop
git merge release/v1.0.0
git push origin develop

# Delete release branch
git branch -d release/v1.0.0
git push origin --delete release/v1.0.0
```

---

### 5. `hotfix/*` - Hotfix Branches

**Purpose**: Critical bug fixes for production

**Naming**: `hotfix/critical-bug-description`

**Examples**:
- `hotfix/sdk-crash-on-init`
- `hotfix/dashboard-auth-bypass`

**Rules**:
- ✅ Branch from `main`
- ✅ Fix critical bugs only
- ✅ Merge to both `main` and `develop`
- ✅ Create patch version release

**Workflow**:
```bash
# Create hotfix branch
git checkout main
git pull origin main
git checkout -b hotfix/sdk-crash-on-init

# Fix bug
git add .
git commit -m "fix(sdk): crash on initialization"

# Merge to main
git checkout main
git merge hotfix/sdk-crash-on-init
git tag v1.0.1
git push origin main --tags

# Merge to develop
git checkout develop
git merge hotfix/sdk-crash-on-init
git push origin develop

# Delete hotfix branch
git branch -d hotfix/sdk-crash-on-init
git push origin --delete hotfix/sdk-crash-on-init
```

---

## Long-Term Development Workflow

### Scenario: Working on Current Branch for Extended Period

**Problem**: You're working on `develop` for weeks/months, but need to release stable versions.

**Solution**: Use release branches frequently

```
develop (ongoing work)
├── release/v1.0.0 → main (stable release)
├── release/v1.1.0 → main (stable release)
└── release/v1.2.0 → main (stable release)
```

**Process**:
1. Work on `develop` continuously
2. When ready for release, create `release/v1.X.0` branch
3. Stabilize release branch (bug fixes only)
4. Merge to `main` and tag
5. Continue work on `develop`

---

## Standardized Release Process

### Step 1: Prepare Release Branch

```bash
# Ensure develop is up to date
git checkout develop
git pull origin develop

# Create release branch
git checkout -b release/v1.0.0
```

### Step 2: Update Version Numbers

**Flutter** (`packages/sdk-flutter/pubspec.yaml`):
```yaml
version: 1.0.0
```

**Android** (`packages/sdk-android/nivostack-core/build.gradle.kts`):
```kotlin
version = "1.0.0"
```

### Step 3: Update CHANGELOG.md

Add release notes to `packages/sdk-flutter/CHANGELOG.md`:

```markdown
## [1.0.0] - 2024-12-29

### Added
- Initial public release
- Feature X
- Feature Y
```

### Step 4: Commit Release Preparation

```bash
git add .
git commit -m "chore: prepare release v1.0.0"
git push origin release/v1.0.0
```

### Step 5: Create Pull Request

Create PR: `release/v1.0.0` → `main`
- Review changes
- Run CI/CD
- Get approval

### Step 6: Merge and Tag

```bash
# Merge to main
git checkout main
git pull origin main
git merge release/v1.0.0

# Create tag
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin main --tags

# Merge back to develop
git checkout develop
git merge release/v1.0.0
git push origin develop
```

### Step 7: Publish SDKs

Follow [SDK Publishing Guide](SDK_PUBLISHING_GUIDE.md)

### Step 8: Create GitHub Release

- Go to GitHub Releases
- Create release from tag `v1.0.0`
- Add release notes
- Attach assets (if any)

---

## Branch Protection Rules

### `main` Branch

- ✅ Require pull request reviews (2 approvals)
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ No force pushes
- ✅ No deletion

### `develop` Branch

- ✅ Require pull request reviews (1 approval)
- ✅ Require status checks to pass
- ✅ No force pushes

---

## Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Tests
- `chore`: Maintenance

**Examples**:
```
feat(sdk-flutter): add user management API
fix(sdk-android): crash on initialization
docs(readme): update installation instructions
chore(release): bump version to 1.0.0
```

---

## Best Practices

### ✅ Do

- Keep feature branches focused
- Merge frequently to `develop`
- Create release branches for stable releases
- Tag releases in git
- Update CHANGELOG.md before release
- Test before merging to `main`

### ❌ Don't

- Commit directly to `main`
- Merge untested code to `main`
- Skip release branches
- Forget to merge release branches back to `develop`
- Force push to protected branches

---

## FAQ

### Q: Can I work directly on `develop`?

**A**: Yes, for small changes. For larger features, use `feature/*` branches.

### Q: How often should I create release branches?

**A**: When you have stable, tested code ready for production (weekly, bi-weekly, or monthly).

### Q: What if I need to fix a bug in a release branch?

**A**: Fix it in the release branch, then merge to both `main` and `develop`.

### Q: Can I skip release branches?

**A**: Not recommended. Release branches ensure stable releases and allow continued development on `develop`.

---

## Summary

- **`main`**: Production-ready code
- **`develop`**: Ongoing development
- **`feature/*`**: New features
- **`release/*`**: Release preparation
- **`hotfix/*`**: Critical fixes

This strategy supports long-term development while maintaining stable releases.

