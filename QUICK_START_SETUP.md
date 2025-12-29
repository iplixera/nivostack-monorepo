# 🚀 Quick Start: Complete Infrastructure Setup

**Follow these steps in order to complete the setup.**

---

## Step 1: Login to Vercel (Required First)

```bash
vercel login
```

Follow the browser prompts to authenticate.

**Verify**:
```bash
vercel whoami
```

---

## Step 2: Create All 4 Vercel Projects

```bash
cd /Users/karim-f/Code/nivostack-monorepo-checkout
./scripts/create-vercel-projects.sh
```

This will create:
- ✅ `nivostack-website` (website folder)
- ✅ `nivostack-studio` (dashboard folder)
- ✅ `nivostack-ingest-api` (dashboard folder)
- ✅ `nivostack-control-api` (dashboard folder)

---

## Step 3: Set Environment Variables

**Option A: Interactive Script**
```bash
./scripts/setup-env-vars.sh
```

**Option B: Vercel Dashboard**
1. Go to https://vercel.com/team/nivostack
2. For each project (studio, ingest-api, control-api):
   - Settings → Environment Variables
   - Add: `POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING`, `JWT_SECRET`
   - Studio only: Add Stripe variables

---

## Step 4: Add Domains

**Via Vercel Dashboard** (Recommended):

1. Go to each project → Settings → Domains
2. Add:
   - **nivostack-website**: `nivostack.com`, `www.nivostack.com`
   - **nivostack-studio**: `studio.nivostack.com`
   - **nivostack-ingest-api**: `ingest.nivostack.com`
   - **nivostack-control-api**: `api.nivostack.com`

**Copy DNS values** shown by Vercel - you'll need them for GoDaddy.

---

## Step 5: Configure GoDaddy DNS

1. Login to GoDaddy
2. Go to: My Products → DNS → nivostack.com
3. Add records (use values from Vercel):

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | [Vercel IP] | 3600 |
| CNAME | www | [Vercel CNAME] | 3600 |
| CNAME | studio | [Vercel CNAME] | 3600 |
| CNAME | ingest | [Vercel CNAME] | 3600 |
| CNAME | api | [Vercel CNAME] | 3600 |

**Wait 24-48 hours** for DNS propagation.

---

## Step 6: Test Deployments

```bash
# Preview deployments
cd website && vercel --preview
cd ../dashboard && vercel --preview --local-config vercel-studio.json
```

---

## Step 7: Update SDKs (If Needed)

**Flutter SDK**: ✅ Already configured correctly
- Ingest: `https://ingest.nivostack.com`
- Control: `https://api.nivostack.com`

**Android SDK**: Currently uses single URL
- Use `https://ingest.nivostack.com` for now
- Future: Will support separate URLs (see `docs/technical/ANDROID_SDK_ENDPOINT_UPDATE.md`)

---

## ✅ Verification

After DNS propagates, verify:

- [ ] https://nivostack.com - Website loads
- [ ] https://studio.nivostack.com - Dashboard loads
- [ ] https://ingest.nivostack.com/api/health - Returns 200
- [ ] https://api.nivostack.com/api/health - Returns 200
- [ ] SDKs can connect and send data
- [ ] Data appears in dashboard

---

**Need help?** See `SETUP_GUIDE.md` for detailed instructions.

