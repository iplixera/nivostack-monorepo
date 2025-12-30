# DevBridge Knowledge Base - Multi-Environment Setup Troubleshooting

**Date**: December 23, 2025  
**Session**: Multi-Environment Database & Deployment Setup  
**Status**: ✅ RESOLVED - Both environments working

---

## 🎯 Problem Summary

User had a working production deployment that started returning 404 errors after attempting to set up separate databases for production and staging environments.

**Initial State**:
- ✅ Single production database (`devbridge-db` in Supabase)
- ✅ Single Vercel project
- ❌ No separation between production and staging data

**Goal**:
- ✅ Production using `devbridge-db` (existing data)
- ✅ Staging using `devbridge-staging` (new database for testing)
- ✅ Auto-deployment for both environments

---

## 🐛 Root Causes Identified

### 1. Supabase Integration Conflict (PRIMARY ISSUE)
**Problem**: Vercel had a Supabase integration that created 14 environment variables (marked with ⚡ icon) targeting "All Environments". These were:
- Overriding manual environment-specific variables
- Pointing ALL environments to `devbridge-db`
- Impossible to override via manual configuration

**Variables Affected**:
```
POSTGRES_URL
SUPABASE_URL
SUPABASE_PUBLISHABLE_KEY
NEXT_PUBLIC_devbridge-dbSUPABASE_ANON_KEY
NEXT_PUBLIC_devbridge-dbSUPABASE_PUBLISHABLE_KEY
SUPABASE_JWT_SECRET
POSTGRES_USER
NEXT_PUBLIC_devbridge-dbSUPABASE_URL
POSTGRES_PASSWORD
POSTGRES_DATABASE
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_SECRET_KEY
POSTGRES_HOST
SUPABASE_ANON_KEY
```

**Solution**: Deleted all 14 integration variables via Vercel API

### 2. Missing Framework Preset
**Problem**: Vercel project had `framework: null`, causing Next.js not to be properly recognized

**Solution**: Set Framework Preset to "Next.js" in Vercel dashboard

### 3. Incorrect Database Connection Strings
**Problem**: `POSTGRES_URL_NON_POOLING` was using pooler subdomain with port 5432:
```
❌ BAD:  postgres://postgres.xxx:password@aws-1-eu-central-2.pooler.supabase.com:5432/postgres
✅ GOOD: postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
```

**Solution**: Updated to use correct `db.xxx.supabase.co` host for direct connections

### 4. Environment Variable Targeting Issues
**Problem**: Manual variables were set to target all environments instead of being environment-specific

**Solution**: Created separate variables for each environment:
- `POSTGRES_PRISMA_URL` (production) → `devbridge-db`
- `POSTGRES_PRISMA_URL` (preview) → `devbridge-staging`
- Same for `POSTGRES_URL_NON_POOLING`

---

## 🔧 Complete Resolution Steps

### Step 1: Identify Environment Variables Conflict
```bash
# Check current variables via Vercel API
curl -H "Authorization: Bearer TOKEN" \
  "https://api.vercel.com/v9/projects/PROJECT_ID/env?teamId=TEAM_ID"
```

### Step 2: Delete Supabase Integration Variables
```bash
# Delete each integration variable by ID
curl -X DELETE \
  "https://api.vercel.com/v9/projects/PROJECT_ID/env/VAR_ID?teamId=TEAM_ID" \
  -H "Authorization: Bearer TOKEN"
```

14 variables deleted in total.

### Step 3: Create Environment-Specific Variables

**Production Variables**:
```bash
# POSTGRES_PRISMA_URL for production
curl -X POST "https://api.vercel.com/v10/projects/PROJECT_ID/env?teamId=TEAM_ID" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "key": "POSTGRES_PRISMA_URL",
    "value": "postgres://postgres.pxtdfnwvixmyxhcdcgup:PASSWORD@aws-1-eu-central-2.pooler.supabase.com:6543/postgres?pgbouncer=true",
    "target": ["production"],
    "type": "encrypted"
  }'

# POSTGRES_URL_NON_POOLING for production
curl -X POST "https://api.vercel.com/v10/projects/PROJECT_ID/env?teamId=TEAM_ID" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "key": "POSTGRES_URL_NON_POOLING",
    "value": "postgresql://postgres:PASSWORD@db.pxtdfnwvixmyxhcdcgup.supabase.co:5432/postgres?sslmode=require",
    "target": ["production"],
    "type": "encrypted"
  }'
```

**Preview/Staging Variables**:
```bash
# POSTGRES_PRISMA_URL for preview
curl -X POST "https://api.vercel.com/v10/projects/PROJECT_ID/env?teamId=TEAM_ID" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "key": "POSTGRES_PRISMA_URL",
    "value": "postgresql://postgres.hwcbpruztqeifvczidly:PASSWORD@aws-1-eu-central-2.pooler.supabase.com:6543/postgres?pgbouncer=true",
    "target": ["preview", "development"],
    "type": "encrypted"
  }'

# POSTGRES_URL_NON_POOLING for preview
curl -X POST "https://api.vercel.com/v10/projects/PROJECT_ID/env?teamId=TEAM_ID" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "key": "POSTGRES_URL_NON_POOLING",
    "value": "postgresql://postgres:PASSWORD@db.hwcbpruztqeifvczidly.supabase.co:5432/postgres?sslmode=require",
    "target": ["preview", "development"],
    "type": "encrypted"
  }'
```

### Step 4: Set Framework Preset
In Vercel Dashboard:
1. Go to: Project Settings → General → Framework Settings
2. Framework Preset: Select "Next.js" (not "NestJS"!)
3. Save

### Step 5: Trigger Deployments
```bash
# Production
curl -X POST "https://api.vercel.com/v13/deployments" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "name": "devbridge",
    "gitSource": {"type": "github", "repo": "ikarimmagdy/devbridge", "repoId": 1120621459, "ref": "main"},
    "target": "production"
  }'

# Staging
curl -X POST "https://api.vercel.com/v13/deployments" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "name": "devbridge",
    "gitSource": {"type": "github", "repo": "ikarimmagdy/devbridge", "repoId": 1120621459, "ref": "develop"}
  }'
```

---

## ✅ Final Configuration

### Environment Variables (6 total)

| Variable | Production Target | Preview Target |
|----------|------------------|----------------|
| `POSTGRES_PRISMA_URL` | devbridge-db pooled | devbridge-staging pooled |
| `POSTGRES_URL_NON_POOLING` | devbridge-db direct | devbridge-staging direct |
| `JWT_SECRET` | Production secret | Preview secret |

### Deployment URLs

- **Production**: https://devbridge-eta.vercel.app
- **Staging**: https://devbridge-git-develop-devbridge.vercel.app

### Database Configuration

**Production (devbridge-db)**:
- Host: `db.pxtdfnwvixmyxhcdcgup.supabase.co`
- Pooler: `aws-1-eu-central-2.pooler.supabase.com:6543`
- Direct: Port 5432

**Staging (devbridge-staging)**:
- Host: `db.hwcbpruztqeifvczidly.supabase.co`
- Pooler: `aws-1-eu-central-2.pooler.supabase.com:6543`
- Direct: Port 5432

---

## 🎓 Key Learnings

### 1. Vercel Integration Variables Take Precedence
Integration variables (marked with ⚡) ALWAYS override manual variables, even if manual variables are set for specific environments. Must delete integration variables first.

### 2. Framework Detection is Critical
Without Framework Preset set, Vercel may not properly build/serve the app even if build succeeds. Always verify Framework Preset is set correctly.

### 3. Supabase Connection String Formats
- **Pooled (port 6543)**: Use `postgres.PROJECT_REF` subdomain
- **Direct (port 5432)**: Use `db.PROJECT_REF` subdomain
- **Never**: Mix pooler subdomain with direct port

### 4. Environment Variable Targeting
Vercel allows multiple variables with SAME KEY but DIFFERENT TARGETS. This is the correct way to have environment-specific values.

### 5. Local Testing is Essential
If app works locally but fails on Vercel with 404:
- ✅ Code is fine
- ❌ Vercel configuration issue (framework, env vars, build settings)

---

## 🚨 Common Pitfalls

### ❌ DON'T: Use Supabase Integration for Multi-Environment
The Supabase integration creates variables for ALL environments, making separation impossible.

### ✅ DO: Manual Environment Variables
Create separate variables with environment-specific targeting.

### ❌ DON'T: Assume Build Success = Working App
A successful build doesn't mean the app will serve correctly. Framework detection and runtime configuration matter.

### ✅ DO: Test Both Direct URLs and Aliases
Always test:
- Direct deployment URL: `project-hash.vercel.app`
- Alias URL: `project-domain.vercel.app`

### ❌ DON'T: Mix Connection String Formats
Don't use pooler subdomain for direct connections or vice versa.

---

## 📊 Debugging Checklist

When encountering 404 on all Vercel routes:

- [ ] Check if app works locally (`pnpm dev`)
- [ ] Verify Framework Preset is set correctly
- [ ] Check for conflicting integration variables (⚡ icon)
- [ ] Verify environment variables are targeting correct environments
- [ ] Check database connection strings format
- [ ] Test both deployment URL and alias URL
- [ ] Check Vercel Runtime Logs (not just build logs)
- [ ] Verify Prisma client is generated during build

---

## 🔗 Related Documentation

- `ENVIRONMENT_SETUP.md` - General environment setup guide
- `SUPABASE_SETUP.md` - Supabase-specific configuration
- `DEVELOPMENT_WORKFLOW.md` - Git workflow and branching strategy
- `ENV_QUICK_START.md` - Quick reference for environment variables

---

## 📝 Session Timeline

1. **Initial Problem**: 404 errors on all routes after database setup attempt
2. **First Attempts**: Updated environment variables, but integration variables were overriding
3. **Discovery**: Found Supabase integration variables marked with ⚡
4. **Solution**: Deleted integration variables, set Framework Preset to Next.js
5. **Verification**: Both environments working with correct databases
6. **Duration**: ~4 hours of troubleshooting

---

## 💡 Future Reference

**If setting up multi-environment again**:
1. ✅ Create databases first
2. ✅ DO NOT connect Supabase integration in Vercel
3. ✅ Manually create environment-specific variables via API or dashboard
4. ✅ Set Framework Preset immediately
5. ✅ Test locally before deploying
6. ✅ Deploy and verify

**Vercel API Endpoints Used**:
- GET `/v9/projects/{id}/env` - List environment variables
- POST `/v10/projects/{id}/env` - Create environment variable
- DELETE `/v9/projects/{id}/env/{varId}` - Delete environment variable
- POST `/v13/deployments` - Trigger deployment

---

**Status**: ✅ Fully Resolved  
**Last Updated**: December 23, 2025  
**Author**: AI Assistant (Claude)

