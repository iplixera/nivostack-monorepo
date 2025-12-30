# Multi-Environment Setup Guide

## 🎯 Overview

This guide explains how to set up databases and environment variables for **Production**, **Staging**, and **Preview** environments.

---

## 🗄️ Database Strategy

### Recommended Setup

```
┌─────────────────────────────────────────────────────────┐
│  Production Database (main)                              │
│  ├── Live user data                                      │
│  ├── Real transactions                                   │
│  └── Critical data                                       │
├─────────────────────────────────────────────────────────┤
│  Staging Database (develop)                              │
│  ├── Test data                                           │
│  ├── QA testing                                          │
│  └── Integration tests                                   │
├─────────────────────────────────────────────────────────┤
│  Preview Database (feature branches)                     │
│  ├── Shared with staging OR                             │
│  └── Separate preview DB (optional)                     │
└─────────────────────────────────────────────────────────┘
```

### Database Options

#### Option 1: Separate Databases (Recommended)
- **Production**: `devbridge-prod`
- **Staging**: `devbridge-staging`
- **Preview**: Use staging database

**Pros**:
- Complete isolation
- Safe testing
- Realistic data in staging

**Cons**:
- More expensive
- Data sync needed

#### Option 2: Single Database with Prefixes
- **Production**: `prod_users`, `prod_devices`, etc.
- **Staging**: `staging_users`, `staging_devices`, etc.

**Pros**:
- Cost-effective
- Single database to manage

**Cons**:
- Risk of accidental production data access
- Migration complexity

---

## 🔐 Environment Variables Setup

### Required Variables

| Variable | Description | Environment |
|----------|-------------|-------------|
| `POSTGRES_PRISMA_URL` | Pooled connection string | All |
| `POSTGRES_URL_NON_POOLING` | Direct connection string | All |
| `JWT_SECRET` | JWT signing secret | All |
| `NEXT_PUBLIC_API_URL` | API base URL | All |
| `VERCEL_ENV` | Vercel environment | Auto-set |

---

## 📋 Step-by-Step Setup

### Step 1: Create Databases

#### For Vercel Postgres (Recommended)

1. **Go to Vercel Dashboard**
   - https://vercel.com/devbridge/devbridge/stores

2. **Create Production Database**
   ```
   Name: devbridge-production
   Region: Same as your app (e.g., us-east-1)
   ```

3. **Create Staging Database**
   ```
   Name: devbridge-staging
   Region: Same as your app
   ```

4. **Copy Connection Strings**
   - Save these for next step

#### For External PostgreSQL (Supabase, Railway, etc.)

Create two separate projects:
- `devbridge-production`
- `devbridge-staging`

---

### Step 2: Configure Vercel Environment Variables

#### Using Vercel Dashboard (Easiest)

1. **Go to Project Settings**
   - https://vercel.com/devbridge/devbridge/settings/environment-variables

2. **Add Production Variables**
   - Environment: **Production**
   - Branch: `main`

   ```env
   POSTGRES_PRISMA_URL=postgres://...production-pooled
   POSTGRES_URL_NON_POOLING=postgres://...production-direct
   JWT_SECRET=your-production-secret-minimum-32-chars
   NEXT_PUBLIC_API_URL=https://devbridge-devbridge.vercel.app
   ```

3. **Add Preview/Staging Variables**
   - Environment: **Preview**
   - Branch: `develop` (and all other branches)

   ```env
   POSTGRES_PRISMA_URL=postgres://...staging-pooled
   POSTGRES_URL_NON_POOLING=postgres://...staging-direct
   JWT_SECRET=your-staging-secret-minimum-32-chars
   NEXT_PUBLIC_API_URL=https://devbridge-git-develop-devbridge.vercel.app
   ```

4. **Add Development Variables** (Optional)
   - Environment: **Development**
   - For local testing

   ```env
   POSTGRES_PRISMA_URL=postgres://localhost:5432/devbridge
   POSTGRES_URL_NON_POOLING=postgres://localhost:5432/devbridge
   JWT_SECRET=local-dev-secret-minimum-32-chars
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

---

### Step 3: Database Migrations

#### Initial Setup

**Production Database**:
```bash
# Connect to production
POSTGRES_PRISMA_URL="<production-url>" pnpm prisma db push

# Generate client
pnpm prisma generate
```

**Staging Database**:
```bash
# Connect to staging
POSTGRES_PRISMA_URL="<staging-url>" pnpm prisma db push

# Generate client
pnpm prisma generate
```

#### Adding Test Data to Staging

Create a seed script:

**`prisma/seed.ts`**:
```typescript
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding staging database...')

  // Create test user
  const hashedPassword = await bcrypt.hash('Test123!', 10)
  const user = await prisma.user.upsert({
    where: { email: 'test@staging.com' },
    update: {},
    create: {
      email: 'test@staging.com',
      password: hashedPassword,
      name: 'Test User'
    }
  })

  // Create test project
  const project = await prisma.project.upsert({
    where: { name: 'Test Project' },
    update: {},
    create: {
      name: 'Test Project',
      apiKey: 'test-api-key-staging-12345',
      userId: user.id
    }
  })

  // Create feature flags
  await prisma.featureFlags.upsert({
    where: { projectId: project.id },
    update: {},
    create: {
      projectId: project.id,
      sdkEnabled: true,
      apiTracking: true,
      screenTracking: true,
      crashReporting: true,
      logging: true,
      deviceTracking: true,
      sessionTracking: true,
      businessConfig: true,
      localization: true,
      offlineSupport: false,
      batchEvents: true
    }
  })

  console.log('✅ Seeding complete!')
  console.log('📧 Test user: test@staging.com')
  console.log('🔑 Test password: Test123!')
  console.log('🔑 Test API Key: test-api-key-staging-12345')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

**Run seed**:
```bash
# Staging
POSTGRES_PRISMA_URL="<staging-url>" pnpm prisma db seed

# Production (careful!)
POSTGRES_PRISMA_URL="<production-url>" pnpm prisma db seed
```

---

### Step 4: Handle Schema Migrations

#### Development Flow

1. **Make schema changes in your branch**
   ```prisma
   // prisma/schema.prisma
   model NewFeature {
     id        String   @id @default(cuid())
     name      String
     createdAt DateTime @default(now())
   }
   ```

2. **Test locally**
   ```bash
   pnpm prisma db push
   pnpm prisma generate
   ```

3. **Merge to develop**
   - Vercel builds with staging database
   - Migration runs automatically

4. **Merge to main**
   - Vercel builds with production database
   - Migration runs automatically

#### Manual Migration (if needed)

**Create migration file**:
```bash
pnpm prisma migrate dev --name add_new_feature
```

**Apply to staging**:
```bash
POSTGRES_PRISMA_URL="<staging-url>" pnpm prisma migrate deploy
```

**Apply to production**:
```bash
POSTGRES_PRISMA_URL="<production-url>" pnpm prisma migrate deploy
```

---

## 🔄 Using Environment Variables in Code

### Client-Side (Public)

Only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser:

```typescript
// ✅ Available in browser
const apiUrl = process.env.NEXT_PUBLIC_API_URL

// ❌ NOT available in browser (undefined)
const dbUrl = process.env.POSTGRES_PRISMA_URL
```

### Server-Side (API Routes)

All variables are available:

```typescript
// src/app/api/devices/route.ts
import { prisma } from '@/lib/prisma'

export async function GET() {
  // Uses POSTGRES_PRISMA_URL automatically
  const devices = await prisma.device.findMany()
  return Response.json(devices)
}
```

### Environment Detection

```typescript
// Check which environment you're in
const env = process.env.VERCEL_ENV
// 'production' | 'preview' | 'development'

if (env === 'production') {
  // Production-only code
} else if (env === 'preview') {
  // Staging/preview code
}
```

---

## 📝 Environment Variables Checklist

### Production (main branch)
- [ ] `POSTGRES_PRISMA_URL` - Production database (pooled)
- [ ] `POSTGRES_URL_NON_POOLING` - Production database (direct)
- [ ] `JWT_SECRET` - Strong, unique secret (32+ chars)
- [ ] `NEXT_PUBLIC_API_URL` - Production URL
- [ ] Database migrated and seeded
- [ ] Test credentials removed
- [ ] API keys secured

### Staging (develop + preview branches)
- [ ] `POSTGRES_PRISMA_URL` - Staging database (pooled)
- [ ] `POSTGRES_URL_NON_POOLING` - Staging database (direct)
- [ ] `JWT_SECRET` - Different from production
- [ ] `NEXT_PUBLIC_API_URL` - Staging URL
- [ ] Database migrated
- [ ] Test data seeded
- [ ] Test credentials documented

### Local Development
- [ ] `.env.local` file created (gitignored)
- [ ] Local database running
- [ ] All required variables set
- [ ] Test data seeded

---

## 🚨 Common Issues & Solutions

### Issue 1: Wrong Database Connected

**Symptom**: Seeing production data in staging

**Solution**:
```bash
# Check which database is connected
vercel env ls

# Verify the POSTGRES_PRISMA_URL for each environment
```

### Issue 2: Migration Fails on Deploy

**Symptom**: Build fails with Prisma error

**Solution**:
```bash
# Run migration manually first
POSTGRES_PRISMA_URL="<url>" pnpm prisma migrate deploy

# Then redeploy
vercel --prod
```

### Issue 3: Environment Variables Not Loading

**Symptom**: `undefined` values in code

**Solution**:
1. Check variable is set in Vercel dashboard
2. Redeploy after adding variables
3. For preview branches, ensure "Preview" environment is selected

### Issue 4: JWT Secret Too Short

**Symptom**: Authentication fails

**Solution**:
```bash
# Generate strong secret
openssl rand -base64 32

# Update in Vercel dashboard
# Redeploy
```

---

## 🔒 Security Best Practices

### 1. Never Commit Secrets
```bash
# .gitignore should include:
.env
.env.local
.env*.local
*.env
```

### 2. Different Secrets Per Environment
- ❌ Don't use same JWT secret everywhere
- ✅ Generate unique secret for each environment

### 3. Rotate Secrets Regularly
```bash
# Generate new secret
openssl rand -base64 32

# Update in Vercel
# Redeploy all environments
```

### 4. Limit Database Access
- Production DB: Only production environment
- Staging DB: Preview + development
- Never expose credentials in code

### 5. Use Vercel Environment Variables
- ✅ Store in Vercel dashboard
- ❌ Don't store in Git
- ❌ Don't share in Slack/email

---

## 📊 Environment Variables Overview

```
┌─────────────────────────────────────────────────────────┐
│  Production (main branch)                                │
│  ├── POSTGRES_PRISMA_URL → devbridge-production DB      │
│  ├── JWT_SECRET → prod-secret-xyz                       │
│  └── NEXT_PUBLIC_API_URL → devbridge.vercel.app         │
├─────────────────────────────────────────────────────────┤
│  Preview (develop + feature branches)                    │
│  ├── POSTGRES_PRISMA_URL → devbridge-staging DB         │
│  ├── JWT_SECRET → staging-secret-abc                    │
│  └── NEXT_PUBLIC_API_URL → ...git-develop...vercel.app  │
├─────────────────────────────────────────────────────────┤
│  Development (local)                                     │
│  ├── POSTGRES_PRISMA_URL → localhost:5432               │
│  ├── JWT_SECRET → local-dev-secret                      │
│  └── NEXT_PUBLIC_API_URL → http://localhost:3000        │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Setup Scripts

### Check Current Environment

**`scripts/check-env.sh`**:
```bash
#!/bin/bash

echo "🔍 Current Environment Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Vercel Environment: $VERCEL_ENV"
echo "Git Branch: $VERCEL_GIT_COMMIT_REF"
echo ""
echo "Database URL: ${POSTGRES_PRISMA_URL:0:30}..."
echo "JWT Secret: ${JWT_SECRET:0:10}..."
echo "API URL: $NEXT_PUBLIC_API_URL"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
```

### Database Health Check

**`scripts/db-health-check.ts`**:
```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    const userCount = await prisma.user.count()
    const projectCount = await prisma.project.count()
    const deviceCount = await prisma.device.count()
    
    console.log(`📊 Database Stats:`)
    console.log(`   Users: ${userCount}`)
    console.log(`   Projects: ${projectCount}`)
    console.log(`   Devices: ${deviceCount}`)
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
```

---

## 📚 Quick Reference

### Commands

```bash
# Check environment variables
vercel env ls

# Pull environment variables locally
vercel env pull .env.local

# Add environment variable
vercel env add VARIABLE_NAME

# Remove environment variable
vercel env rm VARIABLE_NAME

# Run migrations
pnpm prisma migrate deploy

# Generate Prisma client
pnpm prisma generate

# Open Prisma Studio
pnpm prisma studio
```

### Links

- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)
- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)

---

**Last Updated**: December 23, 2025  
**Version**: 1.0.0

