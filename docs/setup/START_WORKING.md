# Starting Work on New Repository

## Which Folder to Open

**Open this folder**: `/Users/karim-f/Code/nivostack-monorepo-checkout`

This is the cloned version of the new repository: `iplixera/nivostack-monorepo`

## Setup Steps

### Option 1: Use Existing Clone (if it exists)

```bash
cd /Users/karim-f/Code/nivostack-monorepo-checkout
git fetch origin
git checkout main
```

### Option 2: Fresh Clone (Recommended)

```bash
cd /Users/karim-f/Code
git clone https://github.com/iplixera/nivostack-monorepo.git nivostack-monorepo
cd nivostack-monorepo
```

## Verify Setup

```bash
# Check current branch
git branch --show-current

# Check all branches
git branch -a

# Check remote
git remote -v
```

## Create New Branch for Work

```bash
# Make sure you're on main and up to date
git checkout main
git pull origin main

# Create and switch to new branch
git checkout -b feature/your-feature-name
# or
git checkout -b develop
# or
git checkout -b release/v1.0.0
```

## Folder Structure

```
nivostack-monorepo/
├── dashboard/          # NivoStack Studio (Next.js)
├── packages/
│   ├── sdk-flutter/   # Flutter SDK
│   └── sdk-android/   # Android SDK
├── docs/              # Documentation
└── website/           # Marketing website (to be created)
```

## Quick Start Commands

```bash
# Navigate to repo
cd /Users/karim-f/Code/nivostack-monorepo

# Check status
git status

# See all branches
git branch -a

# Create new feature branch
git checkout -b feature/my-new-feature

# Start working!
```

## Important Notes

- **Original repo**: `/Users/karim-f/Code/devbridge` (keep for reference)
- **New repo**: `/Users/karim-f/Code/nivostack-monorepo` (work here)
- All new work should be done in the new repository
- The new repo has clean history (no secrets, no large files)

