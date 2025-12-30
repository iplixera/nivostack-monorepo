# Database Setup Guide for NivoStack

## Quick Start

### Step 1: Configure Environment Variables

Run the automated setup script:

```bash
./scripts/setup-database-env.sh
```

This script will:
1. Prompt for production database password
2. Prompt for staging database password (optional)
3. Configure all environment variables in Vercel projects
4. Generate JWT secrets automatically

### Step 2: Run Migrations

Run migrations on both production and staging databases:

```bash
./scripts/run-migrations.sh
```

Or manually:

```bash
# Production
export POSTGRES_PRISMA_URL="postgresql://postgres:[PASSWORD]@db.djyqtlxjpzlncppmazzz.supabase.co:5432/postgres"
export POSTGRES_URL_NON_POOLING="$POSTGRES_PRISMA_URL"
pnpm prisma db push --schema=prisma/schema.prisma

# Staging (if configured)
export POSTGRES_PRISMA_URL="postgresql://postgres:[PASSWORD]@db.[STAGING_REF].supabase.co:5432/postgres"
export POSTGRES_URL_NON_POOLING="$POSTGRES_PRISMA_URL"
pnpm prisma db push --schema=prisma/schema.prisma
pnpm db:seed  # Optional: seed with test data
```

## Manual Setup

### Production Database Connection Strings

Based on your Supabase setup:

**Pooled Connection** (for application queries):
```
postgresql://postgres.djyqtlxjpzlncppmazzz:[YOUR-PASSWORD]@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Direct Connection** (for migrations):
```
postgresql://postgres:[YOUR-PASSWORD]@db.djyqtlxjpzlncppmazzz.supabase.co:5432/postgres
```

**Read Replica** (optional, for dashboard reads):
```
postgresql://postgres:[YOUR-PASSWORD]@db.djyqtlxjpzlncppmazzz.supabase.co:5432/postgres
```
*Note: Supabase doesn't have true read replicas, but we can use connection pooling or a separate read-only connection*

### Staging Database Setup

1. **Create a new Supabase project** for staging
2. **Get connection strings** (same format as production)
3. **Configure in Vercel** for Preview and Development environments

## Environment Variables Configuration

### For nivostack-studio (Dashboard)

**Production:**
- `POSTGRES_PRISMA_URL` - Pooled connection (read/write)
- `POSTGRES_URL_NON_POOLING` - Direct connection (migrations)
- `POSTGRES_READ_REPLICA_URL` - Read-only connection (optional, for analytics)
- `JWT_SECRET` - JWT signing secret

**Preview/Development:**
- `POSTGRES_PRISMA_URL` - Staging pooled connection
- `POSTGRES_URL_NON_POOLING` - Staging direct connection
- `JWT_SECRET` - Different JWT secret for staging

### For nivostack-ingest-api

**Production:**
- `POSTGRES_PRISMA_URL` - Pooled connection (write-only)
- `POSTGRES_URL_NON_POOLING` - Direct connection (migrations)
- `JWT_SECRET` - JWT signing secret

**Preview/Development:**
- `POSTGRES_PRISMA_URL` - Staging pooled connection
- `POSTGRES_URL_NON_POOLING` - Staging direct connection
- `JWT_SECRET` - Different JWT secret for staging

### For nivostack-control-api

**Production:**
- `POSTGRES_PRISMA_URL` - Pooled connection (read/write)
- `POSTGRES_URL_NON_POOLING` - Direct connection (migrations)
- `JWT_SECRET` - JWT signing secret

**Preview/Development:**
- `POSTGRES_PRISMA_URL` - Staging pooled connection
- `POSTGRES_URL_NON_POOLING` - Staging direct connection
- `JWT_SECRET` - Different JWT secret for staging

## Using Read Replicas

The dashboard (`nivostack-studio`) can use a read replica for read-heavy queries:

```typescript
// For read-only queries (analytics, device lists, reports)
import { prismaRead } from '@/lib/prisma-read'
const devices = await prismaRead.device.findMany()

// For write operations (always use primary)
import { prisma } from '@/lib/prisma'
await prisma.device.update({ ... })
```

**Benefits:**
- Reduces load on primary database
- Better performance for dashboard analytics
- Improved scalability

**Note:** If `POSTGRES_READ_REPLICA_URL` is not set, `prismaRead` falls back to the primary database.

## Performance Recommendations

1. **Always use pooled connections** for application queries (`POSTGRES_PRISMA_URL`)
2. **Use direct connections** only for migrations (`POSTGRES_URL_NON_POOLING`)
3. **Use read replica** for dashboard read queries (when available)
4. **Monitor connection pool usage** in Supabase dashboard
5. **Set up connection limits** based on your plan

## Troubleshooting

### Connection Issues

If you see connection errors:
1. Verify password is correct
2. Check Supabase project is active
3. Verify IP allowlist (if configured)
4. Check connection pool limits

### Migration Issues

If migrations fail:
1. Ensure you're using `POSTGRES_URL_NON_POOLING` (direct connection)
2. Check database permissions
3. Verify schema.prisma is up to date
4. Run `pnpm prisma generate` after schema changes

### Read Replica Not Working

If read replica queries fail:
1. Check `POSTGRES_READ_REPLICA_URL` is set
2. Verify connection string is correct
3. Check if Supabase supports read replicas (may need to use connection pooling instead)

## Next Steps

After setting up databases:

1. ✅ Configure environment variables in Vercel
2. ✅ Run migrations on production
3. ✅ Run migrations on staging
4. ✅ Seed staging database (optional)
5. ✅ Deploy projects
6. ✅ Test database connections
7. ✅ Monitor performance

See `docs/technical/DATABASE_ARCHITECTURE.md` for detailed architecture information.

