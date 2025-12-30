# NivoStack Database Architecture

## Overview

This document outlines the recommended database architecture for NivoStack, including production, read replicas, and staging environments.

## Database Architecture

### Production Environment

**Primary Database (Master)**
- **Purpose**: All write operations (INSERT, UPDATE, DELETE)
- **Connection Type**: Direct connection for migrations, pooled for application
- **Usage**: 
  - Ingest API (writes only)
  - Control API (writes for config changes)
  - Studio Dashboard (writes for admin operations)

**Read Replica (Optional but Recommended)**
- **Purpose**: Read-only queries for dashboard analytics
- **Connection Type**: Read-only connection
- **Usage**: 
  - Studio Dashboard (read-heavy queries: analytics, reports, device lists)
  - Reduces load on primary database

**Note**: Supabase doesn't provide built-in read replicas, but we can:
1. Use connection pooling with read preference (if available)
2. Create a separate read-only connection pointing to the same database
3. Use Supabase's connection pooler with read-only mode

### Staging Environment

**Staging Database**
- **Purpose**: Development and preview builds testing
- **Connection Type**: Direct + Pooled (same as production)
- **Usage**:
  - Preview deployments (all branches)
  - Development testing
  - Feature branch testing

## Connection String Format

### Production Database

**Pooled Connection** (POSTGRES_PRISMA_URL):
```
postgresql://postgres.djyqtlxjpzlncppmazzz:[PASSWORD]@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Direct Connection** (POSTGRES_URL_NON_POOLING):
```
postgresql://postgres:[PASSWORD]@db.djyqtlxjpzlncppmazzz.supabase.co:5432/postgres
```

**Read Replica** (POSTGRES_READ_REPLICA_URL) - Optional:
```
postgresql://postgres:[PASSWORD]@db.djyqtlxjpzlncppmazzz.supabase.co:5432/postgres?readonly=true
```
*Note: Supabase doesn't have true read replicas, but we can use read-only connection or connection pooling*

### Staging Database

**Pooled Connection** (POSTGRES_PRISMA_URL):
```
postgresql://postgres.[STAGING_REF]:[PASSWORD]@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Direct Connection** (POSTGRES_URL_NON_POOLING):
```
postgresql://postgres:[PASSWORD]@db.[STAGING_REF].supabase.co:5432/postgres
```

## Environment Variable Configuration

### Production Environment Variables

| Variable | Value | Used By | Purpose |
|----------|-------|---------|---------|
| `POSTGRES_PRISMA_URL` | Pooled connection | All projects | Application queries (read/write) |
| `POSTGRES_URL_NON_POOLING` | Direct connection | All projects | Migrations, schema changes |
| `POSTGRES_READ_REPLICA_URL` | Read-only connection | Studio only | Dashboard read queries (optional) |
| `JWT_SECRET` | Generated secret | All projects | JWT token signing |

### Staging/Preview Environment Variables

| Variable | Value | Used By | Purpose |
|----------|-------|---------|---------|
| `POSTGRES_PRISMA_URL` | Staging pooled | All projects | Preview/development queries |
| `POSTGRES_URL_NON_POOLING` | Staging direct | All projects | Preview migrations |
| `JWT_SECRET` | Different secret | All projects | Preview JWT signing |

## Project-Specific Database Usage

### nivostack-studio (Dashboard)
- **Primary**: Write operations (admin actions, config changes)
- **Read Replica**: Read operations (analytics, device lists, reports)
- **Staging**: Full read/write for preview builds

### nivostack-ingest-api
- **Primary**: Write-only (device registration, logs, traces, crashes, sessions)
- **Staging**: Write-only for preview builds

### nivostack-control-api
- **Primary**: Read/write (SDK init, config retrieval, feature flags)
- **Staging**: Read/write for preview builds

## Performance Recommendations

1. **Connection Pooling**: Always use pooled connections for application queries
2. **Direct Connections**: Use only for migrations and schema changes
3. **Read Replica**: Use for dashboard analytics to reduce primary database load
4. **Indexing**: Ensure proper indexes on frequently queried fields (see schema.prisma)
5. **Query Optimization**: Use Prisma's `select` to limit fields returned

## Migration Strategy

1. **Production Migrations**: Run on direct connection (`POSTGRES_URL_NON_POOLING`)
2. **Staging Migrations**: Run on staging direct connection
3. **Schema Changes**: Always test on staging first

## Monitoring

- Monitor connection pool usage
- Track query performance
- Monitor read/write ratios
- Set up alerts for connection limits

