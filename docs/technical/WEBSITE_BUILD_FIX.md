# Website Build Fix - Monorepo Issue

## Problem

Vercel can't detect Next.js even though:
- ✅ `package.json` exists in `website/` directory
- ✅ Next.js is in dependencies
- ✅ Root Directory is set to `website`

## Root Cause

**Monorepo Workspace Issue:**
- This is a pnpm monorepo with workspaces
- When Vercel runs `pnpm install`, it might be:
  1. Installing from repo root (monorepo install)
  2. But Next.js detection looks in root `package.json`
  3. Root `package.json` doesn't have Next.js (it's in `website/package.json`)

## Solutions Tried

### Solution 1: Set Root Directory to `website`
- ✅ Root Directory: `website`
- ✅ Build Command: `pnpm install && pnpm build`
- ❌ Still can't detect Next.js

### Solution 2: Use `--no-workspace-root` flag
- Install Command: `pnpm install --no-workspace-root`
- This tells pnpm to install only in current directory
- Should work when rootDirectory is `website`

### Solution 3: Use `--filter` (if needed)
- Install Command: `pnpm install --filter @nivostack/website`
- This explicitly installs only the website workspace

## Current Configuration

**nivostack-website:**
- Root Directory: `website`
- Install Command: `pnpm install --no-workspace-root`
- Build Command: `pnpm install --no-workspace-root && pnpm build`
- Output Directory: `.next`
- Framework: `nextjs`

## Alternative Solutions

If the above doesn't work:

### Option A: Create `.npmrc` in website/
```ini
shamefully-hoist=true
```

### Option B: Move website to root (not recommended)
- Would break monorepo structure

### Option C: Use separate repository for website
- Not ideal for monorepo

## Verification

After fix, check build logs for:
- ✅ `Installing dependencies...`
- ✅ `Found Next.js version: 16.0.8`
- ✅ `Building...`
- ✅ `Build completed`

## Expected Behavior

With `--no-workspace-root`:
1. Vercel changes to `website/` directory
2. Runs `pnpm install --no-workspace-root`
3. Installs only `website/package.json` dependencies
4. Next.js is detected correctly
5. Build succeeds

