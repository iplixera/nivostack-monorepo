# Deployment Quick Start Guide

## Choose Your Approach

### Option 1: Single Project (Recommended to Start)
- **Cost**: $20/month (Vercel Pro)
- **Complexity**: Low
- **Best for**: Starting out, moderate traffic
- **See**: `VERCEL_DEPLOYMENT_ALTERNATIVE.md`

### Option 2: Multiple Projects (For Scale)
- **Cost**: ~$60/month (3x Pro plans)
- **Complexity**: Medium-High
- **Best for**: High traffic, need independent scaling
- **See**: `VERCEL_DEPLOYMENT_STRATEGY.md`

## Quick Setup: Single Project Approach

### Step 1: Install Vercel CLI

```bash
npm i -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Link Project

```bash
cd dashboard
vercel link
```

### Step 4: Add Domains in Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to Settings → Domains
4. Add domains:
   - `studio.nivostack.com`
   - `ingest.nivostack.com`
   - `api.nivostack.com`

### Step 5: Configure GoDaddy DNS

Log into GoDaddy and add CNAME records:

```
Type    Name    Value                          TTL
CNAME   studio  cname.vercel-dns.com.         3600
CNAME   ingest  cname.vercel-dns.com.         3600
CNAME   api     cname.vercel-dns.com.         3600
```

**Note**: Replace `cname.vercel-dns.com.` with the actual CNAME value from Vercel domain settings.

### Step 6: Set Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

```bash
POSTGRES_PRISMA_URL=postgresql://...
POSTGRES_URL_NON_POOLING=postgresql://...
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
```

### Step 7: Create Middleware (if using single project)

Create `dashboard/src/middleware.ts`:

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;

  // Ingest API (ingest.nivostack.com) - only POST/PUT/PATCH
  if (hostname.startsWith('ingest.')) {
    const ingestRoutes = ['/api/devices', '/api/traces', '/api/logs', '/api/crashes', '/api/sessions'];
    const isIngestRoute = ingestRoutes.some(route => 
      pathname.startsWith(route) && 
      ['POST', 'PUT', 'PATCH'].includes(request.method)
    );
    
    if (!isIngestRoute && pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Route not available' }, { status: 404 });
    }
  }

  // Control API (api.nivostack.com) - GET and CRUD
  if (hostname.startsWith('api.')) {
    const controlRoutes = [
      '/api/sdk-init', '/api/business-config', '/api/localization',
      '/api/feature-flags', '/api/sdk-settings', '/api/projects',
      '/api/devices', '/api/sessions', '/api/traces', '/api/logs',
      '/api/crashes', '/api/admin', '/api/auth', '/api/subscription'
    ];
    
    const isControlRoute = controlRoutes.some(route => pathname.startsWith(route));
    if (!isControlRoute && pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Route not available' }, { status: 404 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
```

### Step 8: Deploy

```bash
cd dashboard
vercel --prod
```

### Step 9: Verify

1. **Dashboard**: https://studio.nivostack.com
2. **Ingest API**: `curl https://ingest.nivostack.com/api/health`
3. **Control API**: `curl https://api.nivostack.com/api/health`

## DNS Propagation

DNS changes can take 24-48 hours to propagate. Use these tools to check:

- [DNS Checker](https://dnschecker.org/)
- [What's My DNS](https://www.whatsmydns.net/)

## Troubleshooting

### Domain not resolving
- Wait for DNS propagation
- Verify CNAME records in GoDaddy
- Check Vercel domain configuration

### 404 errors
- Verify middleware is correctly filtering routes
- Check Vercel deployment logs
- Ensure routes exist in `dashboard/src/app/api/`

### Environment variables not working
- Set variables in Vercel dashboard (not just `.env.local`)
- Redeploy after adding variables
- Check variable names match exactly

## Next Steps

1. Monitor Vercel analytics
2. Set up error tracking (Sentry, etc.)
3. Configure rate limiting
4. Set up monitoring alerts
5. Consider splitting to multiple projects if traffic grows

