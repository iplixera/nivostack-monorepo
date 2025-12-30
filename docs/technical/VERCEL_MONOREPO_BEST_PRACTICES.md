# Vercel Monorepo Best Practices

## Current Issues

### Problems with Multiple Projects Connected to Same Repo

1. **Status Confusion**
   - GitHub shows multiple deployment statuses
   - Unclear which project deployed successfully
   - Status checks can conflict

2. **Build Minutes Waste**
   - All projects trigger on every push (even with filters)
   - Filters (`ignoreCommand`) are unreliable
   - Multiple builds for same codebase

3. **Webhook Complexity**
   - Multiple webhooks from same repo
   - Can cause race conditions
   - Status updates can be delayed or lost

4. **Deployment Management**
   - Hard to track which project deployed what
   - Rollback becomes complex
   - Preview deployments multiply unnecessarily

## Recommended Solutions

### Option 1: Single Vercel Project with Multiple Environments (Recommended)

**Structure:**
- One Vercel project: `nivostack-platform`
- Multiple environments:
  - Production: `studio.nivostack.com`
  - Preview: `studio-preview.nivostack.com`
  - Staging: `studio-staging.nivostack.com`

**Deployment Strategy:**
- Use Vercel's environment variables to control behavior
- Single build, multiple deployments
- Route based on domain/path

**Pros:**
- ✅ Single source of truth
- ✅ Easier to manage
- ✅ Better status tracking
- ✅ Saves build minutes

**Cons:**
- ❌ Less granular control per service
- ❌ All services deploy together

### Option 2: Separate Repositories (Not Recommended for Monorepo)

**Structure:**
- `nivostack-website` repo → Website Vercel project
- `nivostack-studio` repo → Studio Vercel project
- `nivostack-ingest-api` repo → Ingest API Vercel project
- `nivostack-control-api` repo → Control API Vercel project

**Pros:**
- ✅ Clear separation
- ✅ Independent deployments
- ✅ Better isolation

**Cons:**
- ❌ Loses monorepo benefits
- ❌ Code duplication risk
- ❌ Harder to share code
- ❌ More complex CI/CD

### Option 3: GitHub Actions + Vercel CLI (Best for Control)

**Structure:**
- Keep monorepo as-is
- Use GitHub Actions to control deployments
- Deploy selectively based on changed files

**Workflow:**
```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches: [main, develop]

jobs:
  detect-changes:
    runs-on: ubuntu-latest
    outputs:
      website: ${{ steps.changes.outputs.website }}
      studio: ${{ steps.changes.outputs.studio }}
      ingest: ${{ steps.changes.outputs.ingest }}
      control: ${{ steps.changes.outputs.control }}
    steps:
      - uses: actions/checkout@v3
      - uses: dorny/paths-filter@v2
        id: changes
        with:
          filters: |
            website:
              - 'website/**'
            studio:
              - 'dashboard/**'
            ingest:
              - 'dashboard/**'
            control:
              - 'dashboard/**'

  deploy-website:
    needs: detect-changes
    if: needs.detect-changes.outputs.website == 'true'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_WEBSITE_PROJECT_ID }}
          working-directory: ./website

  deploy-studio:
    needs: detect-changes
    if: needs.detect-changes.outputs.studio == 'true'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_STUDIO_PROJECT_ID }}
          working-directory: ./dashboard
```

**Pros:**
- ✅ Full control over deployments
- ✅ Only deploy what changed
- ✅ Better status tracking
- ✅ Can add custom logic

**Cons:**
- ❌ More setup required
- ❌ Uses GitHub Actions minutes
- ❌ More complex configuration

### Option 4: Vercel Monorepo with Proper Filtering (Current + Improved)

**Improvements:**
1. **Better `ignoreCommand`:**
   ```bash
   # More specific checks
   git diff HEAD^ HEAD --name-only --quiet -- dashboard/src/app/api/ingest/ || exit 1
   ```

2. **Use Vercel's Deployment Filters (UI):**
   - Configure in Project Settings → Git
   - Set specific file paths
   - More reliable than `ignoreCommand`

3. **Deploy Only When Needed:**
   - Keep projects disconnected by default
   - Connect only when actively developing
   - Manual deployments for production

**Pros:**
- ✅ Minimal changes
- ✅ Works with current setup
- ✅ Can improve incrementally

**Cons:**
- ❌ Still has status sync issues
- ❌ Filters can be unreliable
- ❌ Requires manual management

## Recommended Approach for NivoStack

### Phase 1: Immediate (Current)

1. **Keep Only Active Projects Connected**
   - Connect `nivostack-studio` (main development)
   - Keep others disconnected
   - Manual deploy when needed

2. **Improve ignoreCommand**
   - More specific path checks
   - Better git diff logic

3. **Use Manual Deployments**
   - Deploy via Dashboard when needed
   - Avoid auto-deploy for now

### Phase 2: Short-term (Next Sprint)

**Implement GitHub Actions Workflow:**
- Deploy only changed projects
- Better status tracking
- More control

### Phase 3: Long-term (Future)

**Consider Architecture Changes:**
- Option A: Split into separate repos (if monorepo benefits diminish)
- Option B: Use single Vercel project with routing
- Option C: Move to different platform (if Vercel limitations persist)

## Implementation Plan

### Step 1: Disconnect All Projects
- Keep only one connected for testing
- Others deploy manually

### Step 2: Set Up GitHub Actions
- Create `.github/workflows/deploy.yml`
- Configure selective deployments
- Test with one project first

### Step 3: Monitor and Adjust
- Track build minutes usage
- Monitor deployment success rate
- Adjust as needed

## Current Recommendation

**For Now:**
1. ✅ Keep only `nivostack-studio` connected
2. ✅ Deploy others manually when needed
3. ✅ Focus on getting studio deployment stable

**Next Steps:**
1. Once studio is stable, implement GitHub Actions
2. Use GitHub Actions for selective deployments
3. Keep Vercel projects but control via Actions

**Long-term:**
- Evaluate if monorepo is still beneficial
- Consider splitting if complexity increases
- Or move to single Vercel project with routing

