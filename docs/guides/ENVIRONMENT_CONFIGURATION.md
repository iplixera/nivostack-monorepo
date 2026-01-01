# Environment Configuration Summary

## Overview

NivoStack uses different database configurations for different environments:

| Environment | Database | Configuration Source | Purpose |
|-------------|----------|---------------------|---------|
| **Localhost** | Local PostgreSQL (Docker) | `.env.local` | Local development |
| **Vercel Production** | Production Supabase | Vercel Env Vars (Production) | Production deployment |
| **Vercel Preview** | Staging Supabase | Vercel Env Vars (Preview) | Preview/staging deployments |

---

## Localhost Configuration

### Database Setup

**Using Docker PostgreSQL**:
- Container: `devbridge-postgres`
- Port: `5433` (mapped from container's 5432)
- User: `postgres`
- Password: `devbridge_local_password`
- Database: `devbridge`

### Environment Variables (`.env.local`)

```env
# Database Configuration (Localhost)
POSTGRES_PRISMA_URL=postgresql://postgres:devbridge_local_password@localhost:5433/devbridge
POSTGRES_URL_NON_POOLING=postgresql://postgres:devbridge_local_password@localhost:5433/devbridge

# JWT Secret (generated)
JWT_SECRET=<generated-secret>

# Optional: App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Quick Start

```bash
# 1. Start local database
docker-compose up -d

# 2. Setup environment
bash scripts/setup-localhost.sh

# 3. Run migrations
cd dashboard
bash scripts/run-prisma-safe.sh push

# 4. Start dev server
pnpm dev
```

---

## Vercel Production Configuration

### Environment Variables (Vercel Dashboard)

**Production Environment** (main branch):
- `POSTGRES_PRISMA_URL`: Production Supabase pooled connection
- `POSTGRES_URL_NON_POOLING`: Production Supabase direct connection
- `JWT_SECRET`: Production JWT secret
- `NEXT_PUBLIC_APP_URL`: Production app URL

**Configure via**:
- Vercel Dashboard → Project → Settings → Environment Variables
- Or: `vercel env add POSTGRES_PRISMA_URL production`

---

## Vercel Preview Configuration

### Environment Variables (Vercel Dashboard)

**Preview Environment** (all branches except main):
- `POSTGRES_PRISMA_URL`: Staging Supabase pooled connection
- `POSTGRES_URL_NON_POOLING`: Staging Supabase direct connection
- `JWT_SECRET`: Staging JWT secret (different from production)
- `NEXT_PUBLIC_APP_URL`: Preview app URL

**Configure via**:
- Vercel Dashboard → Project → Settings → Environment Variables
- Or: `vercel env add POSTGRES_PRISMA_URL preview`

---

## Database Connection Strings

### Localhost (Docker)
```
postgresql://postgres:devbridge_local_password@localhost:5433/devbridge
```

### Production Supabase
```
# Pooled
postgresql://postgres.djyqtlxjpzlncppmazzz:[PASSWORD]@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true

# Direct
postgresql://postgres:[PASSWORD]@db.djyqtlxjpzlncppmazzz.supabase.co:5432/postgres
```

### Staging Supabase
```
# Pooled
postgresql://postgres.ngsgfvrntmjakzednles:[PASSWORD]@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true

# Direct
postgresql://postgres:[PASSWORD]@db.ngsgfvrntmjakzednles.supabase.co:5432/postgres
```

---

## Setup Scripts

### Localhost Setup
```bash
bash scripts/setup-localhost.sh
```
- Creates/updates `.env.local`
- Generates Prisma client
- Tests database connection

### Database Migrations
```bash
# Localhost
cd dashboard
bash scripts/run-prisma-safe.sh push

# Production (via Vercel)
# Migrations run automatically on deployment
# Or manually via API: POST /api/migrate
```

---

## Verification

### Check Localhost Database
```bash
# Check Docker container
docker ps | grep postgres

# Test connection
docker exec devbridge-postgres psql -U postgres -d devbridge -c "SELECT 1;"
```

### Check Environment Variables
```bash
# Localhost
cat .env.local

# Vercel (via CLI)
vercel env ls
```

### Test API Connection
```bash
# Health check
curl http://localhost:3000/api/health

# Login test
curl http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","password":"password"}'
```

---

## Troubleshooting

### Localhost Issues

**Database not connecting**:
1. Check Docker is running: `docker ps`
2. Start container: `docker-compose up -d`
3. Verify port: Should be `5433` (not `5432`)
4. Check `.env.local` has correct credentials

**Schema out of sync**:
```bash
cd dashboard
bash scripts/run-prisma-safe.sh push
```

### Vercel Issues

**Environment variables not loading**:
1. Check Vercel Dashboard → Settings → Environment Variables
2. Verify environment is set correctly (Production vs Preview)
3. Redeploy after adding variables

**Database connection failed**:
1. Verify connection strings are correct
2. Check IP restrictions in Supabase
3. Verify database is running

---

## Best Practices

1. **Never commit `.env.local`**: Already in `.gitignore`
2. **Use different JWT secrets**: Production and staging should have different secrets
3. **Test locally first**: Use localhost database for development
4. **Keep environments separate**: Don't mix production and staging data
5. **Document changes**: Update this file when adding new environment variables

---

## Related Documentation

- `docs/guides/LOCALHOST_DATABASE_SETUP.md` - Detailed localhost setup
- `docs/guides/LOCALHOST_SETUP.md` - General localhost setup
- `docs/technical/ENVIRONMENT_VARIABLES_GUIDE.md` - Complete environment variables guide

