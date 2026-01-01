# Localhost Database Setup

## Overview

For local development, we use a **local PostgreSQL database** running in Docker. This keeps development isolated from production and staging databases.

## Environment Configuration

### Localhost (Development)
- **Database**: Local PostgreSQL (Docker)
- **Connection**: `localhost:5433`
- **Config**: `.env.local` file

### Vercel Production
- **Database**: Production Supabase
- **Config**: Vercel Environment Variables (Production)

### Vercel Preview
- **Database**: Staging Supabase  
- **Config**: Vercel Environment Variables (Preview)

---

## Quick Setup

### 1. Start Local Database

```bash
# Start PostgreSQL container
docker-compose up -d

# Verify it's running
docker ps | grep postgres
```

### 2. Configure Environment Variables

Run the setup script:

```bash
bash scripts/setup-localhost.sh
```

This will create/update `.env.local` with:
```env
POSTGRES_PRISMA_URL=postgresql://postgres:devbridge_local_password@localhost:5433/devbridge
POSTGRES_URL_NON_POOLING=postgresql://postgres:devbridge_local_password@localhost:5433/devbridge
JWT_SECRET=<generated-secret>
```

### 3. Run Database Migrations

```bash
cd dashboard
bash scripts/run-prisma-safe.sh push
```

### 4. Start Dev Server

```bash
cd dashboard
pnpm dev
```

Open: http://localhost:3000

---

## Docker PostgreSQL Details

**Container**: `devbridge-postgres`  
**Port**: `5433` (mapped from container's 5432)  
**User**: `postgres`  
**Password**: `devbridge_local_password`  
**Database**: `devbridge`

**Connection String**:
```
postgresql://postgres:devbridge_local_password@localhost:5433/devbridge
```

---

## Troubleshooting

### Database Connection Failed

**Error**: `Can't reach database server at localhost:5433`

**Solutions**:
1. **Check Docker is running**:
   ```bash
   docker ps
   ```

2. **Start PostgreSQL container**:
   ```bash
   docker-compose up -d
   ```

3. **Check container logs**:
   ```bash
   docker logs devbridge-postgres
   ```

4. **Verify port is correct**: Should be `5433` (not `5432`)

### Container Not Starting

**Error**: Port already in use

**Solution**:
```bash
# Check what's using port 5433
lsof -i :5433

# Stop conflicting service or change port in docker-compose.yml
```

### Database Schema Out of Sync

**Error**: Schema mismatch

**Solution**:
```bash
cd dashboard
bash scripts/run-prisma-safe.sh push
```

### Reset Local Database

**To start fresh**:
```bash
# Stop and remove container
docker-compose down

# Remove volume (deletes all data)
docker volume rm nivostack-monorepo-checkout_postgres_data

# Start fresh
docker-compose up -d

# Run migrations
cd dashboard
bash scripts/run-prisma-safe.sh push
```

---

## Database Management

### Access Database Directly

```bash
# Using psql (if installed)
psql postgresql://postgres:devbridge_local_password@localhost:5433/devbridge

# Or via Docker
docker exec -it devbridge-postgres psql -U postgres -d devbridge
```

### View Database Tables

```sql
\dt
```

### Seed Test Data

```bash
cd dashboard
pnpm db:seed
```

---

## Environment Variables Summary

| Environment | Database | Config Source |
|-------------|----------|---------------|
| **Localhost** | Local PostgreSQL (Docker) | `.env.local` |
| **Vercel Production** | Production Supabase | Vercel Env Vars (Production) |
| **Vercel Preview** | Staging Supabase | Vercel Env Vars (Preview) |

---

## Next Steps

Once localhost database is working:

1. ✅ Test login: `curl http://localhost:3000/api/auth/login ...`
2. ✅ Test API endpoints
3. ✅ Start implementing features (team invitations, etc.)

---

## Notes

- **Local database is isolated**: Changes don't affect production/staging
- **Data persists**: Docker volume stores data between restarts
- **Reset anytime**: `docker-compose down -v` to start fresh
- **No IP restrictions**: Local database has no network restrictions

