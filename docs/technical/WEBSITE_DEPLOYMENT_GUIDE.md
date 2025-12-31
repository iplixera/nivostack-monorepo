# Website Deployment Guide - Step by Step

**Project**: `nivostack-website`  
**Domain**: `nivostack.com`  
**Status**: ✅ Linked to Vercel, ⏳ Needs GitHub connection

## Current Status

- ✅ Website folder exists (`website/`)
- ✅ Vercel project created (`nivostack-website`)
- ✅ Project linked locally (`.vercel/project.json` exists)
- ✅ Vercel config exists (`vercel.json`)
- ⏳ GitHub connection pending
- ⏳ Domain configuration pending

## Step-by-Step Deployment

### Step 1: Login to Vercel

```bash
cd website
vercel login
```

Follow the prompts to authenticate.

### Step 2: Connect Website to GitHub

**Option A: Via Vercel CLI (Recommended)**

```bash
cd website
vercel git connect
```

When prompted:
1. Select your GitHub account
2. Select repository: `nivostack-monorepo-checkout` (or your repo name)
3. Select branch: `main` (or `master`)
4. Root Directory: `website`
5. Build Command: `pnpm install && pnpm build`
6. Output Directory: `.next`
7. Install Command: `pnpm install`
8. Framework Preset: `Next.js`

**Option B: Via Vercel Dashboard**

1. Go to https://vercel.com/nivostack/nivostack-website
2. Go to **Settings** → **Git**
3. Click **Connect Git Repository**
4. Select your GitHub repository
5. Configure:
   - **Root Directory**: `website`
   - **Build Command**: `pnpm install && pnpm build`
   - **Output Directory**: `.next`
   - **Install Command**: `pnpm install`
   - **Framework Preset**: `Next.js`
6. Click **Save**

### Step 3: Add Domain to Vercel Project

**Via CLI:**
```bash
cd website
vercel domains add nivostack.com
vercel domains add www.nivostack.com
```

**Via Dashboard:**
1. Go to https://vercel.com/nivostack/nivostack-website
2. Go to **Settings** → **Domains**
3. Click **Add Domain**
4. Enter `nivostack.com` → Click **Add**
5. Enter `www.nivostack.com` → Click **Add**

### Step 4: Configure DNS (If Not Already Done)

After adding domains in Vercel, you'll get DNS configuration values.

**For Root Domain (`nivostack.com`):**
- Type: `A`
- Name: `@`
- Value: `[Vercel IP from dashboard]` (usually `76.76.21.21` or similar)
- TTL: `3600`

**For www Subdomain:**
- Type: `CNAME`
- Name: `www`
- Value: `cname.vercel-dns.com.` (or value from Vercel)
- TTL: `3600`

**Note:** If you already have DNS configured, skip this step.

### Step 5: Deploy Website

**Option A: Auto Deploy (After GitHub Connection)**

Just push to GitHub:
```bash
git add .
git commit -m "Deploy website"
git push origin main
```

Vercel will automatically deploy.

**Option B: Manual Deploy**

```bash
cd website
vercel --prod
```

### Step 6: Verify Deployment

1. **Check Vercel Dashboard:**
   - Go to https://vercel.com/nivostack/nivostack-website
   - Check **Deployments** tab
   - Should show successful deployment

2. **Test Website:**
   ```bash
   curl https://nivostack.com
   # Should return HTML content
   ```

3. **Visit in Browser:**
   - https://nivostack.com
   - https://www.nivostack.com

## Website Structure

The website includes:

- **Home Page** (`/`) - Landing page
- **Features** (`/features`) - Features page
- **Pricing** (`/pricing`) - Pricing page
- **About** (`/about`) - About page
- **Contact** (`/contact`) - Contact page
- **Privacy** (`/privacy`) - Privacy policy
- **Terms** (`/terms`) - Terms of service
- **SEO**: `robots.txt`, `sitemap.xml`

## Troubleshooting

### Issue: Build Fails

**Check:**
- Root directory is set to `website`
- Build command: `pnpm install && pnpm build`
- Output directory: `.next`

### Issue: Domain Not Working

**Check:**
- DNS records are correct
- DNS propagation (can take up to 48 hours)
- Domain is added in Vercel dashboard

### Issue: GitHub Connection Fails

**Check:**
- Vercel CLI is logged in (`vercel login`)
- GitHub repository exists
- You have access to the repository

## Quick Commands Summary

```bash
# 1. Login
cd website
vercel login

# 2. Connect to GitHub
vercel git connect

# 3. Add domains
vercel domains add nivostack.com
vercel domains add www.nivostack.com

# 4. Deploy
vercel --prod

# Or push to GitHub for auto-deploy
git push origin main
```

## Next Steps After Website Deployment

1. ✅ Website deployed
2. ⏳ Connect Ingest API to GitHub
3. ⏳ Connect Control API to GitHub
4. ⏳ Deploy Ingest & Control APIs
5. ⏳ Test SDK integration

---

**Last Updated**: December 31, 2024

