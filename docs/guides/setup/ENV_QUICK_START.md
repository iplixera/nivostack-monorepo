# 🚀 Environment Setup - Quick Start

## Step 1: Create Databases

### Option A: Vercel Postgres (Recommended)

1. Go to: https://vercel.com/devbridge/devbridge/stores
2. Click "Create Database" → "Postgres"
3. Create **two** databases:
   - `devbridge-production` (for main branch)
   - `devbridge-staging` (for develop + preview branches)
4. Copy connection strings for each

### Option B: External Provider (Supabase, Railway, etc.)

Create two separate database projects and get connection strings.

---

## Step 2: Configure Vercel Environment Variables

Go to: https://vercel.com/devbridge/devbridge/settings/environment-variables

### For Production (main branch)

| Variable | Value | Environment |
|----------|-------|-------------|
| `POSTGRES_PRISMA_URL` | `postgres://...production-pooled` | Production |
| `POSTGRES_URL_NON_POOLING` | `postgres://...production-direct` | Production |
| `JWT_SECRET` | Generate: `openssl rand -base64 32` | Production |
| `NEXT_PUBLIC_API_URL` | `https://devbridge-devbridge.vercel.app` | Production |

### For Staging/Preview (develop + all feature branches)

| Variable | Value | Environment |
|----------|-------|-------------|
| `POSTGRES_PRISMA_URL` | `postgres://...staging-pooled` | Preview |
| `POSTGRES_URL_NON_POOLING` | `postgres://...staging-direct` | Preview |
| `JWT_SECRET` | Generate: `openssl rand -base64 32` (different!) | Preview |
| `NEXT_PUBLIC_API_URL` | `https://devbridge-git-develop-devbridge.vercel.app` | Preview |

---

## Step 3: Run Migrations

### Production Database
```bash
# Connect to production
export POSTGRES_PRISMA_URL="<production-pooled-url>"
pnpm prisma db push
pnpm prisma generate
```

### Staging Database
```bash
# Connect to staging
export POSTGRES_PRISMA_URL="<staging-pooled-url>"
pnpm prisma db push
pnpm prisma generate

# Seed with test data
pnpm db:seed
```

---

## Step 4: Verify Setup

```bash
# Check environment variables
pnpm env:check

# Check database connection
pnpm db:health
```

---

## Step 5: Redeploy

After setting up environment variables:

1. **Production**: 
   ```bash
   git push origin main
   ```
   Or manually trigger in Vercel dashboard

2. **Staging**:
   ```bash
   git push origin develop
   ```

---

## 🔍 Quick Commands

```bash
# Check environment
pnpm env:check

# Database health check
pnpm db:health

# Seed staging database
pnpm db:seed

# Run migrations
pnpm prisma db push

# Open Prisma Studio
pnpm prisma studio

# Pull env vars locally
vercel env pull .env.local
```

---

## 📊 Environment Overview

```
Production (main)
  ├── Database: devbridge-production
  ├── URL: devbridge-devbridge.vercel.app
  └── Use Case: Live users

Staging (develop)
  ├── Database: devbridge-staging
  ├── URL: devbridge-git-develop-devbridge.vercel.app
  └── Use Case: QA testing

Preview (feature/*)
  ├── Database: devbridge-staging (shared)
  ├── URL: devbridge-git-[branch]-devbridge.vercel.app
  └── Use Case: Feature testing
```

---

## 🚨 Common Issues

### Build fails with "Can't reach database"
**Solution**: Check environment variables are set in Vercel dashboard for correct environment

### "JWT secret must be at least 32 characters"
**Solution**: Generate new secret: `openssl rand -base64 32`

### Migrations not applying
**Solution**: Run manually: `POSTGRES_PRISMA_URL="<url>" pnpm prisma migrate deploy`

### Wrong data showing up
**Solution**: Verify you're using correct database URL for environment

---

## 📚 Full Documentation

See `docs/ENVIRONMENT_SETUP.md` for detailed information.

---

## ✅ Setup Checklist

- [ ] Created production database
- [ ] Created staging database
- [ ] Set production env vars in Vercel
- [ ] Set preview env vars in Vercel
- [ ] Ran migrations on production DB
- [ ] Ran migrations on staging DB
- [ ] Seeded staging DB with test data
- [ ] Verified with `pnpm env:check`
- [ ] Verified with `pnpm db:health`
- [ ] Triggered production deployment
- [ ] Triggered staging deployment
- [ ] Tested both environments work

---

**Need Help?** Check `docs/ENVIRONMENT_SETUP.md` or contact the team.

