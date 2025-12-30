# Environment Variables Configuration Guide

This document explains how environment variables are configured for different environments (local development, Vercel preview, and Vercel production).

## Overview

NivoStack uses environment variables to configure:
- **Database connections** (PostgreSQL via Supabase)
- **Authentication secrets** (JWT)
- **API URLs** (for frontend)
- **Third-party services** (Stripe, etc.)

---

## Environment Variable Locations

### 1. **Local Development (localhost)**

**Location**: `dashboard/.env.local` (not committed to Git)

**How it works:**
- Next.js automatically loads `.env.local` when running `pnpm dev` or `pnpm build`
- File is in `.gitignore` to prevent committing secrets

**Required Variables:**
```bash
# Database (use staging database for local dev)
POSTGRES_PRISMA_URL=postgresql://postgres:Staging@db.ngsgfvrntmjakzednles.supabase.co:5432/postgres
POSTGRES_URL_NON_POOLING=postgresql://postgres:Staging@db.ngsgfvrntmjakzednles.supabase.co:5432/postgres

# Authentication
JWT_SECRET=your-local-jwt-secret-here

# Optional: API URLs (defaults to localhost:3000)
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000

# Optional: Stripe (if using payment features)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**To create `.env.local`:**
```bash
cd dashboard
cp .env.local.example .env.local  # If example exists
# Or create manually with values above
```

---

### 2. **Vercel Preview/Staging (develop branch)**

**Location**: Vercel Dashboard → Project Settings → Environment Variables

**How it works:**
- Vercel automatically injects environment variables during build
- Preview deployments use variables marked for "Preview" environment
- Triggered by pushes to `develop` branch or pull requests

**Configuration:**
- **Project**: `nivostack-studio`, `nivostack-ingest-api`, `nivostack-control-api`
- **Environment**: `Preview`
- **Set via**: Vercel Dashboard or CLI (`vercel env add`)

**Variables (Preview/Staging):**
```bash
POSTGRES_PRISMA_URL=postgresql://postgres.ngsgfvrntmjakzednles:Staging@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
POSTGRES_URL_NON_POOLING=postgresql://postgres:Staging@db.ngsgfvrntmjakzednles.supabase.co:5432/postgres
JWT_SECRET=<generated-staging-secret>
NEXT_PUBLIC_APP_URL=https://nivostack-studio-git-develop-plixeras.vercel.app
NEXT_PUBLIC_API_URL=https://api.nivostack.com
```

**To set via CLI:**
```bash
cd dashboard
vercel env add POSTGRES_PRISMA_URL preview
# Paste value when prompted
```

---

### 3. **Vercel Production (main branch)**

**Location**: Vercel Dashboard → Project Settings → Environment Variables

**How it works:**
- Production deployments use variables marked for "Production" environment
- Triggered by pushes to `main` branch
- Can be locked to prevent accidental changes

**Configuration:**
- **Project**: `nivostack-studio`, `nivostack-ingest-api`, `nivostack-control-api`
- **Environment**: `Production`
- **Set via**: Vercel Dashboard or CLI (`vercel env add`)

**Variables (Production):**
```bash
POSTGRES_PRISMA_URL=postgresql://postgres.djyqtlxjpzlncppmazzz:7ReIOt1GU4ZGsfgo@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
POSTGRES_URL_NON_POOLING=postgresql://postgres:7ReIOt1GU4ZGsfgo@db.djyqtlxjpzlncppmazzz.supabase.co:5432/postgres
JWT_SECRET=<generated-production-secret>
NEXT_PUBLIC_APP_URL=https://studio.nivostack.com
NEXT_PUBLIC_API_URL=https://api.nivostack.com
```

**To set via CLI:**
```bash
cd dashboard
vercel env add POSTGRES_PRISMA_URL production
# Paste value when prompted
```

---

## Environment Variable Priority

Next.js loads environment variables in this order (later ones override earlier):

1. `.env` (all environments)
2. `.env.local` (all environments, **ignored by Git**)
3. `.env.development` (development only)
4. `.env.production` (production only)
5. **Vercel Environment Variables** (override all files)

**Important**: Vercel environment variables always take precedence over local files.

---

## Required Environment Variables

### Database Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `POSTGRES_PRISMA_URL` | Pooled connection (for Prisma Client) | `postgresql://postgres.ref:pass@pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `POSTGRES_URL_NON_POOLING` | Direct connection (for migrations) | `postgresql://postgres:pass@db.ref.supabase.co:5432/postgres` |

**Why two URLs?**
- **Pooled**: Used by Prisma Client for regular queries (connection pooling for performance)
- **Direct**: Used by Prisma migrations (migrations need direct connection)

### Authentication Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `JWT_SECRET` | Secret key for signing JWT tokens | Random 32+ character string |

**Generate JWT Secret:**
```bash
openssl rand -base64 32
```

### Frontend Variables (NEXT_PUBLIC_*)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_URL` | Base URL of the dashboard | `https://studio.nivostack.com` |
| `NEXT_PUBLIC_API_URL` | Base URL for API calls | `https://api.nivostack.com` |

**Note**: Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Never put secrets here!

### Optional Variables

| Variable | Description | When Needed |
|----------|-------------|-------------|
| `STRIPE_SECRET_KEY` | Stripe API secret key | Payment features |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | Payment webhooks |
| `CRON_SECRET` | Secret for cron job endpoints | Cron job security |

---

## How Variables Are Used in Code

### Prisma (Database)

```typescript
// prisma/schema.prisma
datasource db {
  provider  = "postgresql"
  url       = env("POSTGRES_PRISMA_URL")      // Pooled connection
  directUrl = env("POSTGRES_URL_NON_POOLING") // Direct connection
}
```

### Next.js API Routes

```typescript
// dashboard/src/lib/prisma.ts
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})
```

### Frontend Code

```typescript
// dashboard/src/lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_APP_URL || ''
```

**Important**: Only `NEXT_PUBLIC_*` variables are available in browser code. Server-side variables (like `JWT_SECRET`) are only available in API routes.

---

## Setting Up Environment Variables

### Local Development

1. **Create `.env.local` file:**
   ```bash
   cd dashboard
   touch .env.local
   ```

2. **Add variables:**
   ```bash
   POSTGRES_PRISMA_URL=postgresql://postgres:Staging@db.ngsgfvrntmjakzednles.supabase.co:5432/postgres
   POSTGRES_URL_NON_POOLING=postgresql://postgres:Staging@db.ngsgfvrntmjakzednles.supabase.co:5432/postgres
   JWT_SECRET=your-local-secret-here
   ```

3. **Restart dev server:**
   ```bash
   pnpm dev
   ```

### Vercel (Preview & Production)

**Option 1: Via Vercel Dashboard**
1. Go to: https://vercel.com/plixeras/[project-name]/settings/environment-variables
2. Click "Add New"
3. Enter key and value
4. Select environment(s): Preview, Production, or both
5. Save

**Option 2: Via CLI**
```bash
cd dashboard
vercel env add POSTGRES_PRISMA_URL preview
# Enter value when prompted
```

**Option 3: Via Script (Bulk Setup)**
```bash
# Configure all projects at once
bash scripts/setup-database-env.sh
```

---

## Environment-Specific Configuration

### Development (Local)
- **Database**: Staging Supabase instance
- **URL**: `http://localhost:3000`
- **Source**: `.env.local` file

### Preview/Staging (Vercel)
- **Database**: Staging Supabase instance
- **URL**: `https://[project]-git-develop-plixeras.vercel.app`
- **Source**: Vercel Environment Variables (Preview)

### Production (Vercel)
- **Database**: Production Supabase instance
- **URL**: `https://studio.nivostack.com` (or custom domain)
- **Source**: Vercel Environment Variables (Production)

---

## Troubleshooting

### "Environment variable not found"
- **Local**: Check `.env.local` exists and has the variable
- **Vercel**: Check Vercel Dashboard → Environment Variables
- **Verify**: Restart dev server or redeploy

### "Database connection failed"
- **Check**: Connection string format (must include `?sslmode=require` for Supabase)
- **Verify**: Database credentials are correct
- **Test**: Use `psql` or Prisma Studio to test connection

### "JWT secret not set"
- **Generate**: `openssl rand -base64 32`
- **Set**: In `.env.local` (local) or Vercel Dashboard (deployments)

### Variables not updating
- **Local**: Restart dev server (`pnpm dev`)
- **Vercel**: Redeploy (push to trigger new build)
- **Cache**: Clear Next.js cache (`.next` folder)

---

## Security Best Practices

1. **Never commit `.env.local`** - It's in `.gitignore`
2. **Use different secrets** for each environment (dev, staging, prod)
3. **Rotate secrets** periodically, especially if exposed
4. **Use Vercel's encryption** - Variables are encrypted at rest
5. **Limit access** - Only team members who need access should have it
6. **Audit regularly** - Review who has access to environment variables

---

## Quick Reference

| Environment | Database | Config Location | Trigger |
|-------------|----------|-----------------|---------|
| **Local** | Staging | `dashboard/.env.local` | `pnpm dev` |
| **Preview** | Staging | Vercel Dashboard (Preview) | Push to `develop` |
| **Production** | Production | Vercel Dashboard (Production) | Push to `main` |

---

## Related Documentation

- [Database Setup Guide](./DATABASE_SETUP_GUIDE.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Vercel Configuration](./VERCEL_MONOREPO_BEST_PRACTICES.md)

