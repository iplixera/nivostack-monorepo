# Database Setup - Status & Next Steps

## ✅ Completed

### Environment Variables Configured in Vercel

All environment variables have been successfully configured for all 3 projects:

**Production Environment:**
- ✅ `POSTGRES_PRISMA_URL` - Pooled connection
- ✅ `POSTGRES_URL_NON_POOLING` - Direct connection  
- ✅ `JWT_SECRET` - Generated secret
- ✅ `POSTGRES_READ_REPLICA_URL` - Read replica (Studio only)

**Preview/Development Environment:**
- ✅ `POSTGRES_PRISMA_URL` - Staging pooled connection
- ✅ `POSTGRES_URL_NON_POOLING` - Staging direct connection
- ✅ `JWT_SECRET` - Different secret for staging

**Projects Configured:**
- ✅ nivostack-studio
- ✅ nivostack-ingest-api
- ✅ nivostack-control-api

### Connection Strings Used

**Production:**
- Pooled: `postgresql://postgres.djyqtlxjpzlncppmazzz:7ReIOt1GU4ZGsfgo@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true`
- Direct: `postgresql://postgres:7ReIOt1GU4ZGsfgo@db.djyqtlxjpzlncppmazzz.supabase.co:5432/postgres`

**Staging:**
- Pooled: `postgresql://postgres.ngsgfvrntmjakzednles:Staging@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true`
- Direct: `postgresql://postgres:Staging@db.ngsgfvrntmjakzednles.supabase.co:5432/postgres`

### Generated Secrets

- Production JWT Secret: `kbHWxR0rMr5/J6aJhWEYm8JXmW1VvdxACeyQip46l3Y=`
- Staging JWT Secret: `mY7ItjsVKO/6qdUB+ixpAX8zdq267f19fnP79PqwrkA=`

## ⏳ Next Steps

### 1. Run Database Migrations

The migrations need to be run manually due to network/IP restrictions. You can run them:

**Option A: Via Supabase Dashboard SQL Editor**

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the schema from `prisma/schema.prisma` (convert Prisma schema to SQL)

**Option B: Via Local Machine (if IP is allowed)**

```bash
# Production
export POSTGRES_PRISMA_URL="postgresql://postgres:7ReIOt1GU4ZGsfgo@db.djyqtlxjpzlncppmazzz.supabase.co:5432/postgres?sslmode=require"
export POSTGRES_URL_NON_POOLING="$POSTGRES_PRISMA_URL"
cd dashboard
pnpm prisma db push --schema=../prisma/schema.prisma --accept-data-loss

# Staging
export POSTGRES_PRISMA_URL="postgresql://postgres:Staging@db.ngsgfvrntmjakzednles.supabase.co:5432/postgres?sslmode=require"
export POSTGRES_URL_NON_POOLING="$POSTGRES_PRISMA_URL"
pnpm prisma db push --schema=../prisma/schema.prisma --accept-data-loss
```

**Option C: Via Vercel Deployment (Automatic)**

When you deploy to Vercel, the migrations will run automatically if you have a build script that runs `prisma db push`. However, it's recommended to run migrations manually first.

### 2. Verify Environment Variables

1. Go to Vercel Dashboard: https://vercel.com/nivostack
2. For each project, go to Settings → Environment Variables
3. Verify all variables are set correctly for Production, Preview, and Development

### 3. Test Database Connections

After migrations are complete:

1. Deploy a project to Vercel
2. Check Vercel function logs for database connection errors
3. Test API endpoints that interact with the database

### 4. Update Connection Strings (if needed)

If you need to add SSL parameters to the connection strings in Vercel:

- Add `?sslmode=require` to direct connections
- Pooled connections already have `?pgbouncer=true`, you may need to add `&sslmode=require`

## 📋 Verification Checklist

- [ ] Environment variables set in Vercel for all 3 projects
- [ ] Production database migrations completed
- [ ] Staging database migrations completed
- [ ] Database connections tested in Vercel deployments
- [ ] Read replica configured (optional, for Studio)
- [ ] JWT secrets verified and secure

## 🔗 Useful Links

- Vercel Dashboard: https://vercel.com/nivostack
- Supabase Production: https://supabase.com/dashboard/project/djyqtlxjpzlncppmazzz
- Supabase Staging: https://supabase.com/dashboard/project/ngsgfvrntmjakzednles
- Database Architecture: `docs/technical/DATABASE_ARCHITECTURE.md`
- Setup Guide: `docs/technical/DATABASE_SETUP_GUIDE.md`

## ⚠️ Important Notes

1. **IP Allowlist**: Supabase may require your IP to be allowlisted for direct connections
2. **SSL**: Supabase requires SSL connections - ensure `sslmode=require` is in connection strings
3. **Migrations**: Always test migrations on staging first before production
4. **Secrets**: Keep JWT secrets secure and never commit them to git
5. **Read Replica**: The read replica URL is optional and can improve dashboard performance

## 🎉 Success!

Your database environment variables are fully configured in Vercel. Once migrations are run, your projects will be ready to use the databases!

