# Localhost Database Policy

## Policy: Localhost ALWAYS Uses Local Database

**Rule**: Local development (`localhost`) **MUST** always use a local PostgreSQL database. Remote databases (Supabase) are **NOT** used for localhost.

## Why?

1. **Isolation**: Local development doesn't affect staging/production data
2. **Performance**: Local database is faster (no network latency)
3. **Reliability**: No dependency on external services
4. **Testing**: Safe to test migrations and schema changes
5. **Offline**: Works without internet connection

## Implementation

### Automatic Enforcement

The `scripts/setup-localhost.sh` script **automatically**:
- ✅ Configures `.env.local` for local database
- ✅ Prevents remote database configuration
- ✅ Creates backup if remote config found

### Manual Enforcement

Run this anytime to ensure local database:
```bash
bash scripts/ensure-local-database.sh
```

### Configuration

**Localhost** (`.env.local`):
```env
POSTGRES_PRISMA_URL=postgresql://postgres:devbridge_local_password@localhost:5433/devbridge
POSTGRES_URL_NON_POOLING=postgresql://postgres:devbridge_local_password@localhost:5433/devbridge
```

**Vercel Production** (Environment Variables):
```env
POSTGRES_PRISMA_URL=<production-supabase-url>
POSTGRES_URL_NON_POOLING=<production-supabase-direct-url>
```

**Vercel Preview** (Environment Variables):
```env
POSTGRES_PRISMA_URL=<staging-supabase-url>
POSTGRES_URL_NON_POOLING=<staging-supabase-direct-url>
```

## Setup Process

### First Time Setup

```bash
# 1. Run setup script (enforces local database)
bash scripts/setup-localhost.sh

# 2. Start Docker Desktop

# 3. Start local database
bash scripts/start-local-database.sh

# 4. Start dev server
cd dashboard
pnpm dev
```

### Daily Development

```bash
# 1. Start Docker Desktop (if not running)

# 2. Start database
bash scripts/start-local-database.sh

# 3. Start dev server
cd dashboard
pnpm dev
```

## Database Migrations

### Local Development

Migrations run automatically when you:
- Start dev server (checks schema)
- Run `pnpm migrate` manually
- Use `prisma db push` directly

### Deployment (Vercel)

Migrations run automatically during build:
1. **Build Phase**: `prisma db push` runs (may fail if DB unreachable)
2. **Runtime Phase**: `/api/health` runs migration on first request

**Build Script** (`dashboard/package.json`):
```json
{
  "build": "bash ../scripts/vercel-build.sh"
}
```

This script:
- ✅ Generates Prisma client (required)
- ✅ Runs migrations (required)
- ✅ Builds Next.js app

## Troubleshooting

### "Database is not running"

**Solution**:
```bash
# Start Docker Desktop, then:
bash scripts/start-local-database.sh
```

### "Wrong database configuration"

**Solution**:
```bash
# Force local database configuration:
bash scripts/ensure-local-database.sh
```

### "Migration failed during build"

**This is OK!** Migrations will run automatically on first API request via `/api/health` endpoint.

## Files

- `scripts/setup-localhost.sh` - Initial setup (enforces local DB)
- `scripts/ensure-local-database.sh` - Enforce local DB config
- `scripts/start-local-database.sh` - Start Docker database
- `scripts/vercel-build.sh` - Vercel build with migrations
- `.env.local` - Local development config (local DB only)

## Summary

✅ **Localhost = Local Database** (always)  
✅ **Vercel = Remote Database** (from env vars)  
✅ **Migrations = Automatic** (during deployment)

