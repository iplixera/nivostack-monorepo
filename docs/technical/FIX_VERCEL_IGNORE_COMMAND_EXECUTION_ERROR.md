# Fix Vercel ignoreCommand Execution Error

## Problem

Vercel is trying to execute the JSON property as a command:
```
Running "   "ignoreCommand": "git diff --quiet HEAD^ HEAD -- dashboard/ || exit 1""
/bin/sh: line 1: ignoreCommand:: command not found
```

## Root Causes

1. **JSON Syntax Error**: Trailing comma in `vercel-studio.json` (fixed)
2. **Vercel Reading JSON Literally**: Vercel might be reading the entire JSON line instead of parsing it
3. **Conflict with Dashboard Settings**: Dashboard settings might override vercel.json

## Solutions

### Solution 1: Remove ignoreCommand from vercel.json (Recommended)

**Why:** Vercel Dashboard settings are more reliable than vercel.json for ignoreCommand.

**Steps:**

1. **Remove from `website/vercel.json`:**
   ```json
   {
     "buildCommand": "pnpm install && pnpm build",
     "outputDirectory": ".next",
     "framework": "nextjs",
     "installCommand": "pnpm install"
   }
   ```

2. **Remove from `dashboard/vercel-studio.json`:**
   ```json
   {
     "buildCommand": "pnpm install && pnpm build",
     "outputDirectory": ".next",
     "framework": "nextjs",
     "installCommand": "pnpm install"
   }
   ```

3. **Set in Vercel Dashboard Instead:**
   - Website: Settings → General → Ignored Build Step
   - Studio: Settings → General → Ignored Build Step
   - Use: `git diff --quiet HEAD^ HEAD -- website/ || exit 1` (for website)
   - Use: `git diff --quiet HEAD^ HEAD -- dashboard/ || exit 1` (for studio)

### Solution 2: Use Correct JSON Format

If you want to keep it in vercel.json, ensure:
- Valid JSON (no trailing commas)
- Proper escaping if needed
- Correct property name: `ignoreCommand` (not `ignore-command`)

**Correct format:**
```json
{
  "ignoreCommand": "git diff --quiet HEAD^ HEAD -- website/ || exit 1"
}
```

### Solution 3: Use Environment Variable Approach

Instead of ignoreCommand, use a script:

1. **Create `scripts/check-changes.sh`:**
   ```bash
   #!/bin/bash
   if [ "$VERCEL_GIT_COMMIT_REF" = "main" ]; then
     git diff --quiet HEAD^ HEAD -- website/ && exit 0 || exit 1
   else
     exit 1
   fi
   ```

2. **Call from buildCommand:**
   ```json
   {
     "buildCommand": "bash scripts/check-changes.sh && pnpm install && pnpm build"
   }
   ```

## Recommended Approach

**Use Vercel Dashboard Settings** (not vercel.json):

1. **Remove ignoreCommand from vercel.json files**
2. **Set in Dashboard:**
   - Go to Project → Settings → General
   - Scroll to "Ignored Build Step"
   - Select "Run my Bash script"
   - Enter: `git diff --quiet HEAD^ HEAD -- website/ || exit 1`
   - Click "Save"

**Why this is better:**
- ✅ More reliable
- ✅ Easier to change without code commits
- ✅ No JSON parsing issues
- ✅ Works consistently

## Verification

After fixing:

1. **Check JSON syntax:**
   ```bash
   python3 -m json.tool website/vercel.json
   python3 -m json.tool dashboard/vercel-studio.json
   ```

2. **Test deployment:**
   - Make change only in `website/`
   - Push to GitHub
   - Only website should deploy

3. **Check build logs:**
   - Should show: "Skipping build (no changes detected)" or "Building..."

---

**Last Updated**: December 31, 2024

