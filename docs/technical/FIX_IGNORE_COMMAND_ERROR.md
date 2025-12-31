# Fix Ignore Command Error - Git Diff Issue

## Problem

Error when using ignoreCommand:
```
fatal: ambiguous argument 'HEA': unknown revision or path not in the working tree.
```

The command appears to be truncated: `git diff HEAD^ HEA` instead of `git diff HEAD^ HEAD`.

## Root Cause

1. **Command might be entered incorrectly** in Vercel Dashboard
2. **Vercel might be truncating** the command
3. **First commit** (no `HEAD^`) causes issues

## Solutions

### Solution 1: Use Correct Command Format (Recommended)

**For Website:**
```bash
git diff --quiet HEAD^ HEAD -- website/ || exit 1
```

**For Studio:**
```bash
git diff --quiet HEAD^ HEAD -- dashboard/ || exit 1
```

**Key changes:**
- Use `--quiet` flag (more reliable)
- Use `--` to separate paths (prevents ambiguity)
- Simplified logic: `|| exit 1` means "if diff found, build"

### Solution 2: Handle First Commit Edge Case

**For Website:**
```bash
git rev-parse --verify HEAD^ > /dev/null 2>&1 && git diff --quiet HEAD^ HEAD -- website/ || exit 1
```

**For Studio:**
```bash
git rev-parse --verify HEAD^ > /dev/null 2>&1 && git diff --quiet HEAD^ HEAD -- dashboard/ || exit 1
```

**How it works:**
- First checks if `HEAD^` exists
- If yes, runs git diff
- If no (first commit), builds anyway (`exit 1`)

### Solution 3: Use vercel.json (Most Reliable)

**Add to `website/vercel.json`:**
```json
{
  "buildCommand": "pnpm install && pnpm build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "installCommand": "pnpm install",
  "ignoreCommand": "git diff --quiet HEAD^ HEAD -- website/ || exit 1"
}
```

**Add to `dashboard/vercel-studio.json`:**
```json
{
  "buildCommand": "pnpm install && pnpm build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "installCommand": "pnpm install",
  "ignoreCommand": "git diff --quiet HEAD^ HEAD -- dashboard/ || exit 1"
}
```

**Why this is better:**
- ✅ Version controlled
- ✅ Less prone to typos
- ✅ Easier to maintain

### Solution 4: Simplified Command (Easiest)

**For Website:**
```bash
git diff --name-only HEAD^ HEAD | grep -q "^website/" && exit 1 || exit 0
```

**For Studio:**
```bash
git diff --name-only HEAD^ HEAD | grep -q "^dashboard/" && exit 1 || exit 0
```

**How it works:**
- Lists changed files
- Checks if any start with `website/` or `dashboard/`
- If found → `exit 1` (build)
- If not → `exit 0` (skip)

## Step-by-Step Fix

### Option A: Fix in Vercel Dashboard

1. **Go to Website Project:**
   - https://vercel.com/nivostack/nivostack-website/settings/general
   - Scroll to **"Ignored Build Step"**
   - Set to: **"Run my Bash script"**
   - **Copy this exact command:**
     ```bash
     git diff --quiet HEAD^ HEAD -- website/ || exit 1
     ```
   - Paste it (make sure it's complete, no truncation)
   - Click **"Save"**

2. **Go to Studio Project:**
   - https://vercel.com/nivostack/nivostack-studio/settings/general
   - Scroll to **"Ignored Build Step"**
   - Set to: **"Run my Bash script"**
   - **Copy this exact command:**
     ```bash
     git diff --quiet HEAD^ HEAD -- dashboard/ || exit 1
     ```
   - Paste it (make sure it's complete)
   - Click **"Save"**

### Option B: Use vercel.json (Recommended)

I'll update the vercel.json files with the correct command.

## Testing

After fixing:

1. **Test Website Only:**
   ```bash
   echo "test" >> website/test.txt
   git add website/test.txt
   git commit -m "test: website"
   git push
   ```
   - ✅ Website should build
   - ✅ Studio should be skipped

2. **Test Studio Only:**
   ```bash
   echo "test" >> dashboard/test.txt
   git add dashboard/test.txt
   git commit -m "test: studio"
   git push
   ```
   - ✅ Studio should build
   - ✅ Website should be skipped

## Common Mistakes to Avoid

1. **Don't use:** `git diff HEAD^ HEA` (truncated)
2. **Don't use:** `git diff HEAD^ HEAD website/` (missing `--`)
3. **Do use:** `git diff --quiet HEAD^ HEAD -- website/` (correct)

## Why `--` is Important

The `--` separates git revisions from file paths:
- Without `--`: Git might interpret `website/` as a branch name
- With `--`: Git knows `website/` is a file path

---

**Last Updated**: December 31, 2024

