# 🎯 Supabase Database Setup - Your Configuration

## ✅ Current Setup

You already have:
- ✅ **Production Database**: `devbridge-db` (Supabase) - Currently in use

We'll add:
- 🆕 **Staging Database**: `devbridge-staging` (Supabase) - New database for testing

---

## 📋 Step-by-Step Setup

### Step 1: Create Staging Database in Supabase (5 min)

1. **Go to Supabase Dashboard**
   - https://supabase.com/dashboard

2. **Create New Project**
   - Click "New Project"
   - Name: `devbridge-staging`
   - Database Password: Generate a strong password (save it!)
   - Region: Same as production (for consistency)
   - Click "Create new project"

3. **Wait for database to be ready** (~2 minutes)

---

### Step 2: Get Connection Strings (2 min)

#### For Production (`devbridge-db`)

1. Go to your `devbridge-db` project in Supabase
2. Click "Project Settings" (gear icon)
3. Click "Database" in sidebar
4. Scroll to "Connection string" section
5. Copy both:
   - **Connection pooling** (for `POSTGRES_PRISMA_URL`)
   - **Direct connection** (for `POSTGRES_URL_NON_POOLING`)

Example format:
```
Pooled: postgres://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
Direct: postgres://postgres.[PROJECT_REF]:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
```

#### For Staging (`devbridge-staging`)

1. Go to your new `devbridge-staging` project
2. Same steps as above
3. Copy both connection strings

---

### Step 3: Configure Vercel Environment Variables (10 min)

Go to: https://vercel.com/devbridge/devbridge/settings/environment-variables

#### Add Production Variables (uses existing `devbridge-db`)

| Variable Name | Value | Environment | Branch |
|--------------|-------|-------------|--------|
| `POSTGRES_PRISMA_URL` | `postgres://postgres.[REF]:[PASSWORD]@...pooler.supabase.com:6543/postgres` | **Production** | `main` |
| `POSTGRES_URL_NON_POOLING` | `postgres://postgres.[REF]:[PASSWORD]@db.[REF].supabase.co:5432/postgres` | **Production** | `main` |
| `JWT_SECRET` | Generate: `openssl rand -base64 32` | **Production** | `main` |
| `NEXT_PUBLIC_API_URL` | `https://devbridge-devbridge.vercel.app` | **Production** | `main` |

**Important**: 
- Replace `[REF]` with your Supabase project reference
- Replace `[PASSWORD]` with your database password
- Use the **pooled connection** for `POSTGRES_PRISMA_URL`
- Use the **direct connection** for `POSTGRES_URL_NON_POOLING`

#### Add Preview/Staging Variables (uses new `devbridge-staging`)

| Variable Name | Value | Environment | Branch |
|--------------|-------|-------------|--------|
| `POSTGRES_PRISMA_URL` | `postgres://postgres.[STAGING_REF]:[STAGING_PASSWORD]@...pooler.supabase.com:6543/postgres` | **Preview** | All branches |
| `POSTGRES_URL_NON_POOLING` | `postgres://postgres.[STAGING_REF]:[STAGING_PASSWORD]@db.[STAGING_REF].supabase.co:5432/postgres` | **Preview** | All branches |
| `JWT_SECRET` | Generate: `openssl rand -base64 32` (DIFFERENT from production!) | **Preview** | All branches |
| `NEXT_PUBLIC_API_URL` | `https://devbridge-git-develop-devbridge.vercel.app` | **Preview** | All branches |

---

### Step 4: Run Migrations (5 min)

#### Production Database (already exists, just verify schema)

```bash
cd /Users/karim-f/Code/devbridge

# Connect to production (devbridge-db)
export POSTGRES_PRISMA_URL="postgres://postgres.[PROD_REF]:[PROD_PASSWORD]@...pooler.supabase.com:6543/postgres"

# Check if schema needs updates
pnpm prisma db push

# Generate Prisma client
pnpm prisma generate
```

**Note**: If you have existing data, this will only add new tables/columns, won't delete anything.

#### Staging Database (new database, needs full setup)

```bash
# Connect to staging (devbridge-staging)
export POSTGRES_PRISMA_URL="postgres://postgres.[STAGING_REF]:[STAGING_PASSWORD]@...pooler.supabase.com:6543/postgres"

# Create schema
pnpm prisma db push

# Generate Prisma client
pnpm prisma generate

# Seed with test data
pnpm db:seed
```

You'll see output like:
```
✅ Created user: test@staging.devbridge.com
✅ Created project: Test Project - Staging
🔑 API Key: test-staging-[random]
```

**Save these credentials for testing!**

---

### Step 5: Verify Setup (2 min)

```bash
# Check environment variables are set correctly
pnpm env:check

# Check database connections
pnpm db:health
```

---

### Step 6: Redeploy Applications (2 min)

After setting environment variables in Vercel:

**Staging (develop branch)**:
```bash
cd /Users/karim-f/Code/devbridge
git push origin develop
```

**Production (main branch)** - when ready:
```bash
git checkout main
git merge develop
git push origin main
```

Or manually trigger in Vercel dashboard:
- https://vercel.com/devbridge/devbridge

---

## 🗂️ Your Final Setup

```
┌─────────────────────────────────────────────────────────┐
│  PRODUCTION (main branch)                                │
│  ├── Database: devbridge-db (Supabase) ✅ EXISTING      │
│  ├── URL: devbridge-devbridge.vercel.app                │
│  ├── Data: Real production data                         │
│  └── Auto-deploy: On push to main                       │
├─────────────────────────────────────────────────────────┤
│  STAGING (develop + feature branches)                    │
│  ├── Database: devbridge-staging (Supabase) 🆕 NEW     │
│  ├── URL: devbridge-git-develop-devbridge.vercel.app    │
│  ├── Data: Test data (seeded)                           │
│  └── Auto-deploy: On push to any branch                 │
└─────────────────────────────────────────────────────────┘
```

---

## 🔍 How to Get Supabase Connection Strings

### Visual Guide:

1. **Supabase Dashboard** → https://supabase.com/dashboard
2. Select your project (`devbridge-db` or `devbridge-staging`)
3. Click **⚙️ Settings** (bottom left)
4. Click **Database** in the sidebar
5. Scroll down to **Connection string** section
6. You'll see:

```
Connection string
├── URI (Use for connection pooling) ← POSTGRES_PRISMA_URL
│   postgres://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
│
└── Direct connection ← POSTGRES_URL_NON_POOLING
    postgres://postgres.[REF]:[PASSWORD]@db.[REF].supabase.co:5432/postgres
```

**Important**:
- Replace `[YOUR-PASSWORD]` with your actual database password
- Use **connection pooling** (port 6543) for `POSTGRES_PRISMA_URL`
- Use **direct connection** (port 5432) for `POSTGRES_URL_NON_POOLING`

---

## ⚡ Quick Setup Commands

```bash
# 1. Create staging database in Supabase (via web UI)

# 2. Set up staging database
export POSTGRES_PRISMA_URL="<staging-pooled-url>"
pnpm prisma db push
pnpm db:seed

# 3. Verify production database (optional, if schema changed)
export POSTGRES_PRISMA_URL="<production-pooled-url>"
pnpm prisma db push

# 4. Check setup
pnpm env:check
pnpm db:health

# 5. Deploy
git push origin develop
```

---

## 🔐 Environment Variables Template

Save this and fill in your values:

```bash
# ===== PRODUCTION (devbridge-db) =====
# Vercel Environment: Production, Branch: main

POSTGRES_PRISMA_URL="postgres://postgres.[PROD_REF]:[PROD_PASS]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
POSTGRES_URL_NON_POOLING="postgres://postgres.[PROD_REF]:[PROD_PASS]@db.[PROD_REF].supabase.co:5432/postgres"
JWT_SECRET="[generate with: openssl rand -base64 32]"
NEXT_PUBLIC_API_URL="https://devbridge-devbridge.vercel.app"


# ===== STAGING (devbridge-staging) =====
# Vercel Environment: Preview, Branch: All branches

POSTGRES_PRISMA_URL="postgres://postgres.[STAGING_REF]:[STAGING_PASS]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
POSTGRES_URL_NON_POOLING="postgres://postgres.[STAGING_REF]:[STAGING_PASS]@db.[STAGING_REF].supabase.co:5432/postgres"
JWT_SECRET="[generate DIFFERENT secret with: openssl rand -base64 32]"
NEXT_PUBLIC_API_URL="https://devbridge-git-develop-devbridge.vercel.app"
```

---

## ✅ Setup Checklist

- [ ] Create `devbridge-staging` project in Supabase
- [ ] Get connection strings from `devbridge-db` (production)
- [ ] Get connection strings from `devbridge-staging`
- [ ] Generate two different JWT secrets (`openssl rand -base64 32`)
- [ ] Add Production env vars to Vercel (select "Production", branch "main")
- [ ] Add Preview env vars to Vercel (select "Preview", all branches)
- [ ] Run `pnpm prisma db push` on production (verify schema)
- [ ] Run `pnpm prisma db push` on staging
- [ ] Run `pnpm db:seed` on staging (test data)
- [ ] Verify with `pnpm env:check`
- [ ] Verify with `pnpm db:health`
- [ ] Push to `develop` branch
- [ ] Test staging deployment
- [ ] When ready, push to `main` branch
- [ ] Test production deployment

---

## 🚨 Important Notes

1. **Production (`devbridge-db`)** 
   - Already has your data
   - `pnpm prisma db push` will only ADD new tables/columns
   - Won't delete existing data
   - Safe to run

2. **Staging (`devbridge-staging`)**
   - New empty database
   - Can reset/reseed anytime
   - Use `pnpm db:seed` for test data

3. **JWT Secrets**
   - Must be DIFFERENT for production vs staging
   - Must be at least 32 characters
   - Generate with: `openssl rand -base64 32`

4. **Connection Strings**
   - Must include your password
   - Use pooled (port 6543) for Prisma
   - Use direct (port 5432) for migrations

---

## 💡 Pro Tips

1. **Test staging first**: Always test on `devbridge-staging` before touching production
2. **Keep passwords safe**: Store in a password manager
3. **Verify before deploy**: Run `pnpm env:check` before every deployment
4. **Seed staging often**: Run `pnpm db:seed` to reset test data
5. **Monitor Supabase**: Check database usage in Supabase dashboard

---

## 🔗 Quick Links

- **Supabase Dashboard**: https://supabase.com/dashboard
- **Production DB**: Your `devbridge-db` project
- **Staging DB**: Your `devbridge-staging` project
- **Vercel Env Vars**: https://vercel.com/devbridge/devbridge/settings/environment-variables
- **Vercel Dashboard**: https://vercel.com/devbridge/devbridge

---

**Need Help?** 
- Check Supabase connection strings format
- Verify environment variables in Vercel
- Run `pnpm env:check` to diagnose issues

**Last Updated**: December 23, 2025

