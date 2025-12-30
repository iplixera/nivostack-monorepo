# Deployment Filtering - Prevent Unnecessary Builds

## Problem

All 4 Vercel projects are connected to the same GitHub repository, causing every push to trigger builds for all projects, consuming Vercel build minutes unnecessarily.

## Current Setup

- **nivostack-website**: `rootDirectory: website` ✅ Separate directory
- **nivostack-studio**: `rootDirectory: dashboard`
- **nivostack-ingest-api**: `rootDirectory: dashboard`
- **nivostack-control-api**: `rootDirectory: dashboard`

Projects 2-4 all build from the same `dashboard/` directory.

## Solution: Deployment Filters

### Option 1: Use `ignoreCommand` (Recommended)

Configure each project to only build when relevant files change:

**Website Project:**
```bash
git diff HEAD^ HEAD --quiet -- website/ || exit 1
```
Only builds if files in `website/` directory changed.

**Dashboard Projects:**
```bash
git diff HEAD^ HEAD --quiet -- dashboard/ || exit 1
```
Only builds if files in `dashboard/` directory changed.

### Setup Script

Run `scripts/setup-deployment-filters.sh` to configure all projects automatically.

### Option 2: Temporarily Disconnect Projects

If you want to stop auto-deployments temporarily:

1. Go to Vercel Dashboard → Project → Settings → Git
2. Click "Disconnect Git Repository"
3. Manually deploy when needed via Dashboard or CLI

### Option 3: Use Vercel's Deployment Filters (UI)

1. Go to Project Settings → Git
2. Configure "Deployment Filters"
3. Set file paths that trigger deployments

## Future: Split Projects into Separate Directories

Once projects are split into separate directories:
- `website/` → nivostack-website
- `studio/` → nivostack-studio
- `ingest-api/` → nivostack-ingest-api
- `control-api/` → nivostack-control-api

Then each project can have its own `ignoreCommand`:
- Website: `git diff HEAD^ HEAD --quiet -- website/ || exit 1`
- Studio: `git diff HEAD^ HEAD --quiet -- studio/ || exit 1`
- Ingest: `git diff HEAD^ HEAD --quiet -- ingest-api/ || exit 1`
- Control: `git diff HEAD^ HEAD --quiet -- control-api/ || exit 1`

## Benefits

- ✅ Saves Vercel build minutes
- ✅ Faster CI/CD (only builds what changed)
- ✅ Reduces unnecessary deployments
- ✅ Better resource utilization

## Verification

After setting up filters:
1. Make a change only in `website/`
2. Push to GitHub
3. Only `nivostack-website` should build
4. Other projects should be skipped

## Notes

- For the first commit (no HEAD^), all projects will build
- Subsequent commits will be filtered correctly
- Filters work based on git diff, so they're accurate

