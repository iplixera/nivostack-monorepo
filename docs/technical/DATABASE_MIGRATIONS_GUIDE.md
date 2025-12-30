# Database Migrations Guide

This guide explains how to handle database schema changes from local development → staging (develop) → production (main).

## Overview

NivoStack uses **Prisma Migrations** to manage database schema changes. Migrations are version-controlled SQL files that track all schema changes.

## Migration Workflow

```
Local Development → Develop Branch → Main Branch
     ↓                    ↓              ↓
  Local DB          Staging DB      Production DB
```

### Step-by-Step Process

1. **Make schema changes locally** → Edit `prisma/schema.prisma`
2. **Create migration** → `bash scripts/migrate-local.sh`
3. **Test locally** → Verify changes work
4. **Commit & push to develop** → Git commit includes migration files
5. **Apply to staging** → `bash scripts/migrate-staging.sh`
6. **Test staging** → Verify on Vercel preview deployment
7. **Merge to main** → After testing passes
8. **Apply to production** → `bash scripts/migrate-production.sh`

---

## Scripts Reference

### 1. `migrate-local.sh` - Create Migration (Local)

**When to use:** After editing `prisma/schema.prisma`

**What it does:**
- Detects schema changes
- Creates a new migration file in `prisma/migrations/`
- Applies migration to local database
- Generates Prisma client

**Usage:**
```bash
bash scripts/migrate-local.sh
# Enter migration name when prompted (e.g., "add_user_table")
```

**Example:**
```bash
$ bash scripts/migrate-local.sh
Enter migration name: add_plan_table
✅ Migration created and applied to local database!
```

---

### 2. `migrate-staging.sh` - Apply to Staging

**When to use:** After pushing migrations to `develop` branch

**What it does:**
- Applies all pending migrations to staging database
- Uses `prisma migrate deploy` (safe, production-ready)

**Usage:**
```bash
bash scripts/migrate-staging.sh
```

**Example:**
```bash
$ bash scripts/migrate-staging.sh
🔄 Applying pending migrations to staging...
✅ Staging migrations applied successfully!
```

---

### 3. `migrate-production.sh` - Apply to Production

**When to use:** After merging to `main` branch and testing in staging

**What it does:**
- Applies all pending migrations to production database
- Requires confirmation (type `yes`)
- Uses `prisma migrate deploy` (safe, production-ready)

**Usage:**
```bash
bash scripts/migrate-production.sh
# Type 'yes' when prompted
```

**Example:**
```bash
$ bash scripts/migrate-production.sh
⚠️  WARNING: This will modify the PRODUCTION database!
Are you sure you want to continue? (type 'yes' to confirm): yes
✅ Production migrations applied successfully!
```

---

### 4. `migrate-staging-init.sh` - Initialize Staging (One-time)

**When to use:** First time setting up migrations on staging database

**What it does:**
- Pushes current schema to staging (creates all tables)
- Marks existing migrations as applied (if any)

**Usage:**
```bash
bash scripts/migrate-staging-init.sh
```

---

### 5. `migrate-production-init.sh` - Initialize Production (One-time)

**When to use:** First time setting up migrations on production database

**What it does:**
- Pushes current schema to production (creates all tables)
- Marks existing migrations as applied (if any)

**Usage:**
```bash
bash scripts/migrate-production-init.sh
# Type 'yes' when prompted
```

---

## Complete Example Workflow

### Scenario: Adding a new `Plan` table

**Step 1: Edit Schema**
```prisma
// prisma/schema.prisma
model Plan {
  id          String  @id @default(cuid())
  name        String  @unique
  price       Float
  // ... other fields
}
```

**Step 2: Create Migration (Local)**
```bash
bash scripts/migrate-local.sh
# Enter: add_plan_table
```

**Step 3: Test Locally**
```bash
cd dashboard
pnpm dev
# Test the new Plan table in your app
```

**Step 4: Commit & Push**
```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: add Plan table"
git push origin develop
```

**Step 5: Apply to Staging**
```bash
bash scripts/migrate-staging.sh
```

**Step 6: Test Staging**
- Check Vercel preview deployment
- Verify Plan table exists in Supabase Dashboard

**Step 7: Merge to Main**
```bash
git checkout main
git merge develop
git push origin main
```

**Step 8: Apply to Production**
```bash
bash scripts/migrate-production.sh
# Type 'yes' when prompted
```

---

## Migration Files Structure

```
prisma/
├── schema.prisma          # Current schema definition
└── migrations/
    ├── 20240101000000_init/
    │   └── migration.sql   # Initial schema
    ├── 20240102000000_add_plan_table/
    │   └── migration.sql   # Add Plan table
    └── migration_lock.toml # Lock file (ensures consistency)
```

**Important:**
- Migration files are **version-controlled** (committed to Git)
- Never edit existing migration files
- Always create new migrations for schema changes

---

## Best Practices

### ✅ DO

- **Create migrations for all schema changes**
- **Test migrations locally first**
- **Review migration SQL before applying to production**
- **Backup production database before major migrations**
- **Apply migrations in order: local → staging → production**
- **Commit migration files with schema changes**

### ❌ DON'T

- **Don't use `db push` in production** (use `migrate deploy`)
- **Don't edit existing migration files**
- **Don't skip testing in staging**
- **Don't apply untested migrations to production**
- **Don't delete migration files** (they're history)

---

## Troubleshooting

### "Migration already applied"

**Problem:** Migration was already applied to database

**Solution:**
```bash
# Mark migration as applied (if it was applied manually)
pnpm dlx prisma migrate resolve --applied <migration-name>
```

### "Database is out of sync"

**Problem:** Database schema doesn't match migrations

**Solution:**
```bash
# Reset and reapply (⚠️ WARNING: This will delete data in development)
pnpm dlx prisma migrate reset
pnpm dlx prisma migrate deploy
```

### "Migration failed in production"

**Problem:** Migration failed halfway through

**Solution:**
1. **Check migration status:**
   ```bash
   pnpm dlx prisma migrate status
   ```

2. **Rollback manually** (if needed):
   - Restore from backup
   - Fix migration SQL
   - Re-apply

3. **Mark as resolved:**
   ```bash
   pnpm dlx prisma migrate resolve --rolled-back <migration-name>
   ```

---

## Database Connection Strings

### Local Development
```bash
# From dashboard/.env.local
POSTGRES_PRISMA_URL=postgresql://postgres:Staging@db.ngsgfvrntmjakzednles.supabase.co:5432/postgres?sslmode=require
POSTGRES_URL_NON_POOLING=postgresql://postgres:Staging@db.ngsgfvrntmjakzednles.supabase.co:5432/postgres?sslmode=require
```

### Staging (Develop)
```bash
# Staging database
postgresql://postgres:Staging@db.ngsgfvrntmjakzednles.supabase.co:5432/postgres?sslmode=require
```

### Production (Main)
```bash
# Production database
postgresql://postgres:7ReIOt1GU4ZGsfgo@db.djyqtlxjpzlncppmazzz.supabase.co:5432/postgres?sslmode=require
```

**Important:** Always use **direct connection** (port 5432) for migrations, not pooled connection (port 6543).

---

## Quick Reference

| Task | Command |
|------|---------|
| Create migration (local) | `bash scripts/migrate-local.sh` |
| Apply to staging | `bash scripts/migrate-staging.sh` |
| Apply to production | `bash scripts/migrate-production.sh` |
| Initialize staging | `bash scripts/migrate-staging-init.sh` |
| Initialize production | `bash scripts/migrate-production-init.sh` |
| Check migration status | `pnpm dlx prisma migrate status` |
| View migration history | `ls -la prisma/migrations/` |

---

## Related Documentation

- [Environment Variables Guide](./ENVIRONMENT_VARIABLES_GUIDE.md)
- [Database Setup Guide](./DATABASE_SETUP_GUIDE.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)

