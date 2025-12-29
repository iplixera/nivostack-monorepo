# NivoStack Deployment Guide

## GitHub Connection to Vercel

### Step 1: Authorize GitHub in Vercel

1. Go to: https://vercel.com/account/integrations
2. Find "GitHub" and click "Connect"
3. Authorize Vercel to access your GitHub account/organization
4. Select the `iplixera` organization if prompted

### Step 2: Connect Projects to GitHub Repository

For each project (`nivostack-website`, `nivostack-studio`, `nivostack-ingest-api`, `nivostack-control-api`):

1. Go to Vercel Dashboard: https://vercel.com/nivostack
2. Select the project
3. Go to **Settings** → **Git**
4. Click **"Connect Git Repository"**
5. Select: `iplixera/nivostack-monorepo`
6. Configure:
   - **Production Branch**: `main`
   - **Root Directory**: 
     - `website/` for `nivostack-website`
     - `dashboard/` for other projects
   - **Framework Preset**: Next.js
   - **Build Command**: 
     - `cd website && pnpm install && pnpm build` for website
     - `cd dashboard && pnpm install && pnpm build` for others
   - **Output Directory**: 
     - `website/.next` for website
     - `dashboard/.next` for others

### Step 3: Configure Branch Deployments

After connecting GitHub:

- **Production**: Auto-deploys from `main` branch
- **Preview**: Auto-deploys from `develop` branch and all PRs
- **Development**: Manual deployments from any branch

## Manual Deployment (Without GitHub)

If you need to deploy manually before GitHub is connected:

### Deploy Website (Preview)

```bash
cd website
vercel --token="$VERCEL_TOKEN"
```

### Deploy Studio (Preview)

```bash
cd dashboard
vercel link --project nivostack-studio --local-config vercel-studio.json
vercel --token="$VERCEL_TOKEN"
```

### Deploy Ingest API (Preview)

```bash
cd dashboard
vercel link --project nivostack-ingest-api --local-config vercel-ingest.json
vercel --token="$VERCEL_TOKEN"
```

### Deploy Control API (Preview)

```bash
cd dashboard
vercel link --project nivostack-control-api --local-config vercel-control.json
vercel --token="$VERCEL_TOKEN"
```

## Production Deployment

After GitHub is connected, production deployments happen automatically on push to `main`:

```bash
git checkout main
git merge develop
git push origin main
```

Or deploy manually:

```bash
vercel --prod --token="$VERCEL_TOKEN"
```

## Deployment Status

### Current Status

- ✅ **Vercel Projects**: All 4 projects created
- ✅ **Environment Variables**: Configured for all projects
- ⏳ **GitHub Connection**: Needs manual setup in Dashboard
- ⏳ **First Deployment**: Pending GitHub connection or manual deploy

### Next Steps

1. **Connect GitHub** (see Step 1-2 above)
2. **Push to develop branch** - Will trigger preview deployments
3. **Verify deployments** - Check Vercel Dashboard
4. **Test preview URLs** - Verify all projects work

## Troubleshooting

### Build Failures

If builds fail:
1. Check build logs in Vercel Dashboard
2. Verify environment variables are set
3. Check root directory and build commands
4. Verify dependencies in `package.json`

### GitHub Connection Issues

If GitHub connection fails:
1. Verify GitHub integration is authorized
2. Check repository access permissions
3. Try disconnecting and reconnecting
4. Verify repository URL: `iplixera/nivostack-monorepo`

### Environment Variables Not Loading

If env vars aren't loading:
1. Check Vercel Dashboard → Settings → Environment Variables
2. Verify environment (Production/Preview/Development)
3. Redeploy after adding variables
4. Check variable names match code

## Deployment URLs

After deployment, you'll get URLs like:

- **Website Preview**: `https://nivostack-website-git-develop-nivostack.vercel.app`
- **Studio Preview**: `https://nivostack-studio-git-develop-nivostack.vercel.app`
- **Ingest API Preview**: `https://nivostack-ingest-api-git-develop-nivostack.vercel.app`
- **Control API Preview**: `https://nivostack-control-api-git-develop-nivostack.vercel.app`

Production URLs (after connecting domains):
- `https://nivostack.com` (website)
- `https://studio.nivostack.com` (studio)
- `https://ingest.nivostack.com` (ingest-api)
- `https://api.nivostack.com` (control-api)

