# Simple Prisma Migration Guide

## Overview

This guide shows the **simple approach** to deploying Prisma schema changes to Supabase.

## How It Works

### Automatic (During Vercel Build)

When you deploy to Vercel, the build command automatically:
1. Generates Prisma client
2. Pushes schema to database (`prisma db push`)
3. Builds the Next.js app

**No manual steps needed!** The schema changes are automatically applied.

### Manual (If Needed)

If you need to manually migrate:

#### Local Development
```bash
cd dashboard
bash scripts/migrate-local.sh
```

#### Staging Database
```bash
bash scripts/migrate-staging.sh
```

#### Production Database
```bash
bash scripts/migrate-production.sh
```

## Workflow

1. **Edit Schema** → Edit `prisma/schema.prisma`
2. **Test Locally** → Run `bash dashboard/scripts/migrate-local.sh`
3. **Commit & Push** → Git commit and push to GitHub
4. **Deploy** → Vercel automatically runs migration during build
5. **Done!** → Schema is updated in production

## That's It!

The migration runs automatically during deployment. No complex scripts, no manual steps.

## Troubleshooting

**Migration fails during build?**
- Check database connection strings in Vercel environment variables
- Verify `POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING` are set
- Check Supabase dashboard for connection issues

**Need to run manually?**
- Use the scripts above
- Or run directly: `pnpm dlx prisma db push --schema=../prisma/schema.prisma`
