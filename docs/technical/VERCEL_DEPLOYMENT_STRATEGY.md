# Vercel Deployment Strategy for NivoStack Monorepo

This guide explains how to split the NivoStack monorepo into separate Vercel projects for cost optimization and better scalability.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    NivoStack Monorepo                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │  Brand Website   │  │  Admin Dashboard │               │
│  │  (Marketing)     │  │  (Studio)        │               │
│  └──────────────────┘  └──────────────────┘               │
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │  Ingest API       │  │  Control API      │               │
│  │  (Data Ingestion) │  │  (Config/CRUD)   │               │
│  └──────────────────┘  └──────────────────┘               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Project Structure

### 1. Brand Website (`nivostack.com`)
**Purpose**: Marketing website, landing pages, documentation  
**Domain**: `nivostack.com`, `www.nivostack.com`  
**Tech**: Next.js (static pages)  
**Cost**: Free tier (static hosting)

### 2. Admin Dashboard (`studio.nivostack.com`)
**Purpose**: NivoStack Studio - Admin console for managing projects  
**Domain**: `studio.nivostack.com`  
**Tech**: Next.js (App Router)  
**Routes**: All dashboard UI pages (`/dashboard/*`, `/projects/*`, etc.)  
**Cost**: Hobby/Pro plan

### 3. Ingest API (`ingest.nivostack.com`)
**Purpose**: High-volume data ingestion endpoints  
**Domain**: `ingest.nivostack.com`  
**Tech**: Next.js API Routes  
**Routes**: 
- `/api/devices` (POST)
- `/api/traces` (POST)
- `/api/logs` (POST)
- `/api/crashes` (POST)
- `/api/sessions` (POST/PUT/PATCH)
- `/api/devices/[id]/user` (PATCH/DELETE)

**Cost**: Pro plan (for better performance and scaling)

### 4. Control API (`api.nivostack.com`)
**Purpose**: Configuration and CRUD operations  
**Domain**: `api.nivostack.com`  
**Tech**: Next.js API Routes  
**Routes**:
- `/api/sdk-init` (GET)
- `/api/business-config` (GET)
- `/api/localization/*` (GET)
- `/api/feature-flags` (GET)
- `/api/sdk-settings` (GET)
- `/api/projects` (CRUD)
- `/api/devices` (GET, DELETE)
- `/api/sessions` (GET)
- `/api/traces` (GET)
- `/api/logs` (GET)
- `/api/crashes` (GET)
- `/api/admin/*` (All admin endpoints)
- `/api/auth/*` (Authentication)
- `/api/subscription/*` (Subscription management)

**Cost**: Pro plan

## Step 1: Create Separate Next.js Projects

### Option A: Keep Monorepo Structure (Recommended)

Create separate entry points within the monorepo:

```
dashboard/
├── src/
│   ├── app/
│   │   ├── api/              # Shared API routes
│   │   ├── (dashboard)/      # Dashboard UI only
│   │   └── page.tsx          # Dashboard home
│   └── ...
├── ingest/
│   ├── src/
│   │   └── app/
│   │       └── api/          # Ingest API routes only
│   └── package.json
├── control/
│   ├── src/
│   │   └── app/
│   │       └── api/          # Control API routes only
│   └── package.json
└── website/
    ├── src/
    │   └── app/              # Marketing pages
    └── package.json
```

### Option B: Separate Repositories (Not Recommended)

Keep everything in monorepo but deploy different folders to different Vercel projects.

## Step 2: Vercel Project Configuration

### 2.1 Brand Website Project

**Project Name**: `nivostack-website`  
**Root Directory**: `website`  
**Framework Preset**: Next.js  
**Build Command**: `cd website && npm run build`  
**Output Directory**: `.next`

**Environment Variables**:
```bash
# None needed for static site
```

**vercel.json**:
```json
{
  "buildCommand": "cd website && npm run build",
  "outputDirectory": "website/.next",
  "framework": "nextjs",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/$1"
    }
  ]
}
```

### 2.2 Admin Dashboard Project

**Project Name**: `nivostack-studio`  
**Root Directory**: `dashboard`  
**Framework Preset**: Next.js  
**Build Command**: `cd dashboard && pnpm install && pnpm build`  
**Output Directory**: `.next`

**Environment Variables**:
```bash
POSTGRES_PRISMA_URL=postgresql://...
POSTGRES_URL_NON_POOLING=postgresql://...
JWT_SECRET=your-jwt-secret
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
```

**vercel.json** (in `dashboard/`):
```json
{
  "buildCommand": "pnpm install && pnpm build",
  "framework": "nextjs",
  "rewrites": [
    {
      "source": "/api/(ingest|control)/(.*)",
      "destination": "/api/$2"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        }
      ]
    }
  ]
}
```

### 2.3 Ingest API Project

**Project Name**: `nivostack-ingest-api`  
**Root Directory**: `dashboard` (shared codebase)  
**Framework Preset**: Next.js  
**Build Command**: `cd dashboard && pnpm install && pnpm build`  
**Output Directory**: `.next`

**Environment Variables**:
```bash
POSTGRES_PRISMA_URL=postgresql://...
POSTGRES_URL_NON_POOLING=postgresql://...
JWT_SECRET=your-jwt-secret
```

**vercel.json** (create `ingest-vercel.json`):
```json
{
  "buildCommand": "cd dashboard && pnpm install && pnpm build",
  "framework": "nextjs",
  "routes": [
    {
      "src": "/api/devices",
      "dest": "/api/devices"
    },
    {
      "src": "/api/traces",
      "dest": "/api/traces"
    },
    {
      "src": "/api/logs",
      "dest": "/api/logs"
    },
    {
      "src": "/api/crashes",
      "dest": "/api/crashes"
    },
    {
      "src": "/api/sessions",
      "dest": "/api/sessions"
    },
    {
      "src": "/api/devices/(.*)/user",
      "dest": "/api/devices/$1/user"
    },
    {
      "src": "/(.*)",
      "dest": "/api/health"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "POST, PUT, PATCH, DELETE, OPTIONS"
        }
      ]
    }
  ]
}
```

### 2.4 Control API Project

**Project Name**: `nivostack-control-api`  
**Root Directory**: `dashboard` (shared codebase)  
**Framework Preset**: Next.js  
**Build Command**: `cd dashboard && pnpm install && pnpm build`  
**Output Directory**: `.next`

**Environment Variables**:
```bash
POSTGRES_PRISMA_URL=postgresql://...
POSTGRES_URL_NON_POOLING=postgresql://...
JWT_SECRET=your-jwt-secret
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**vercel.json** (create `control-vercel.json`):
```json
{
  "buildCommand": "cd dashboard && pnpm install && pnpm build",
  "framework": "nextjs",
  "routes": [
    {
      "src": "/api/sdk-init",
      "dest": "/api/sdk-init"
    },
    {
      "src": "/api/business-config",
      "dest": "/api/business-config"
    },
    {
      "src": "/api/localization/(.*)",
      "dest": "/api/localization/$1"
    },
    {
      "src": "/api/feature-flags",
      "dest": "/api/feature-flags"
    },
    {
      "src": "/api/sdk-settings",
      "dest": "/api/sdk-settings"
    },
    {
      "src": "/api/projects",
      "dest": "/api/projects"
    },
    {
      "src": "/api/devices",
      "dest": "/api/devices"
    },
    {
      "src": "/api/sessions",
      "dest": "/api/sessions"
    },
    {
      "src": "/api/traces",
      "dest": "/api/traces"
    },
    {
      "src": "/api/logs",
      "dest": "/api/logs"
    },
    {
      "src": "/api/crashes",
      "dest": "/api/crashes"
    },
    {
      "src": "/api/admin/(.*)",
      "dest": "/api/admin/$1"
    },
    {
      "src": "/api/auth/(.*)",
      "dest": "/api/auth/$1"
    },
    {
      "src": "/api/subscription/(.*)",
      "dest": "/api/subscription/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/api/health"
    }
  ]
}
```

## Step 3: Vercel CLI Setup

### Install Vercel CLI

```bash
npm i -g vercel
```

### Link Projects

```bash
# Link each project separately
cd dashboard
vercel link --project nivostack-studio

# For ingest API (use same dashboard folder)
vercel link --project nivostack-ingest-api --scope your-team

# For control API (use same dashboard folder)
vercel link --project nivostack-control-api --scope your-team
```

### Deploy Commands

```bash
# Deploy dashboard
cd dashboard
vercel --prod

# Deploy ingest API (with custom config)
cd dashboard
vercel --prod --local-config ingest-vercel.json

# Deploy control API (with custom config)
cd dashboard
vercel --prod --local-config control-vercel.json
```

## Step 4: GoDaddy DNS Configuration

### DNS Records Setup

Log into GoDaddy DNS management and add the following records:

#### For `nivostack.com` (Brand Website)
```
Type    Name    Value                          TTL
A       @       [Vercel IP]                    3600
CNAME   www     cname.vercel-dns.com.          3600
```

#### For `studio.nivostack.com` (Admin Dashboard)
```
Type    Name    Value                          TTL
CNAME   studio  cname.vercel-dns.com.         3600
```

#### For `ingest.nivostack.com` (Ingest API)
```
Type    Name    Value                          TTL
CNAME   ingest  cname.vercel-dns.com.         3600
```

#### For `api.nivostack.com` (Control API)
```
Type    Name    Value                          TTL
CNAME   api     cname.vercel-dns.com.         3600
```

### Vercel Domain Configuration

1. **Brand Website**:
   ```bash
   vercel domains add nivostack.com --project nivostack-website
   vercel domains add www.nivostack.com --project nivostack-website
   ```

2. **Admin Dashboard**:
   ```bash
   vercel domains add studio.nivostack.com --project nivostack-studio
   ```

3. **Ingest API**:
   ```bash
   vercel domains add ingest.nivostack.com --project nivostack-ingest-api
   ```

4. **Control API**:
   ```bash
   vercel domains add api.nivostack.com --project nivostack-control-api
   ```

## Step 5: Cost Optimization Strategy

### Vercel Pricing Tiers

| Feature | Hobby (Free) | Pro ($20/mo) | Enterprise |
|---------|-------------|--------------|------------|
| Bandwidth | 100 GB | 1 TB | Unlimited |
| Serverless Functions | 100 GB-hours | 1,000 GB-hours | Custom |
| Builds | 6,000/min | 24,000/min | Unlimited |

### Recommended Setup

1. **Brand Website**: Hobby (Free) - Static pages, minimal traffic
2. **Admin Dashboard**: Pro ($20/mo) - Moderate traffic, authentication
3. **Ingest API**: Pro ($20/mo) - High volume, needs performance
4. **Control API**: Pro ($20/mo) - Moderate volume, CRUD operations

**Total Cost**: ~$60/month (vs $20/month for single project with all traffic)

### Benefits of Splitting

1. **Independent Scaling**: Each service scales based on its own traffic
2. **Cost Control**: Can downgrade/upgrade individual services
3. **Performance**: Dedicated resources for high-traffic endpoints
4. **Isolation**: Issues in one service don't affect others
5. **Analytics**: Separate metrics per service

## Step 6: Environment Variables Management

### Shared Variables

Create a `.env.shared` file with common variables:

```bash
# Database
POSTGRES_PRISMA_URL=postgresql://...
POSTGRES_URL_NON_POOLING=postgresql://...

# Auth
JWT_SECRET=your-jwt-secret

# Stripe (for dashboard and control API)
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Project-Specific Variables

Set via Vercel dashboard or CLI:

```bash
# For ingest API (minimal variables)
vercel env add POSTGRES_PRISMA_URL production --project nivostack-ingest-api
vercel env add POSTGRES_URL_NON_POOLING production --project nivostack-ingest-api
vercel env add JWT_SECRET production --project nivostack-ingest-api

# For control API (full variables)
vercel env add POSTGRES_PRISMA_URL production --project nivostack-control-api
vercel env add JWT_SECRET production --project nivostack-control-api
vercel env add STRIPE_SECRET_KEY production --project nivostack-control-api
```

## Step 7: Deployment Scripts

Create deployment scripts in the root:

### `scripts/deploy-all.sh`

```bash
#!/bin/bash

echo "Deploying all NivoStack services..."

# Deploy dashboard
echo "Deploying Admin Dashboard..."
cd dashboard
vercel --prod --yes
cd ..

# Deploy ingest API
echo "Deploying Ingest API..."
cd dashboard
vercel --prod --yes --local-config ingest-vercel.json
cd ..

# Deploy control API
echo "Deploying Control API..."
cd dashboard
vercel --prod --yes --local-config control-vercel.json
cd ..

echo "All services deployed!"
```

### `scripts/deploy-ingest.sh`

```bash
#!/bin/bash
cd dashboard
vercel --prod --yes --local-config ingest-vercel.json
```

### `scripts/deploy-control.sh`

```bash
#!/bin/bash
cd dashboard
vercel --prod --yes --local-config control-vercel.json
```

## Step 8: Monitoring & Analytics

### Vercel Analytics

Enable analytics for each project:
- Dashboard: Full analytics (user sessions, page views)
- Ingest API: Function analytics (invocations, duration)
- Control API: Function analytics (invocations, duration)

### Custom Monitoring

Add health check endpoints:

```typescript
// dashboard/src/app/api/health/route.ts
export async function GET() {
  return Response.json({
    status: 'ok',
    service: 'ingest-api', // or 'control-api', 'dashboard'
    timestamp: new Date().toISOString(),
  });
}
```

## Troubleshooting

### Issue: Routes not working after split

**Solution**: Ensure `vercel.json` routes are correctly configured for each project.

### Issue: Environment variables not available

**Solution**: Set environment variables in Vercel dashboard for each project separately.

### Issue: DNS not resolving

**Solution**: 
1. Verify DNS records in GoDaddy
2. Wait for DNS propagation (up to 48 hours)
3. Check Vercel domain configuration

### Issue: Build failures

**Solution**: Ensure `package.json` scripts and dependencies are correct for each project.

## Next Steps

1. Create separate Vercel projects
2. Configure DNS in GoDaddy
3. Set up environment variables
4. Test deployments
5. Monitor performance and costs
6. Optimize based on usage patterns

