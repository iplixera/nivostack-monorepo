# Alternative: Single Project with Route Filtering

If splitting into multiple projects is too complex, you can use a single Vercel project with middleware to route requests based on domain.

## Architecture

```
┌─────────────────────────────────────────────┐
│      Single Vercel Project                  │
│      (nivostack-platform)                   │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────────┐  │
│  │  Middleware (Route Filtering)       │  │
│  └─────────────────────────────────────┘  │
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │  Ingest  │  │ Control  │  │ Dashboard│ │
│  │  Routes  │  │ Routes   │  │ Routes   │ │
│  └──────────┘  └──────────┘  └──────────┘ │
│                                             │
└─────────────────────────────────────────────┘
```

## Implementation

### 1. Create Middleware

**`dashboard/src/middleware.ts`**:

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;

  // Ingest API routes (ingest.nivostack.com)
  if (hostname.startsWith('ingest.')) {
    const ingestRoutes = [
      '/api/devices',
      '/api/traces',
      '/api/logs',
      '/api/crashes',
      '/api/sessions',
    ];

    const isIngestRoute = ingestRoutes.some(route => 
      pathname.startsWith(route) && 
      (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH')
    );

    if (!isIngestRoute && pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Route not available on ingest domain' },
        { status: 404 }
      );
    }

    // Allow device user endpoints
    if (pathname.match(/^\/api\/devices\/[^/]+\/user$/)) {
      return NextResponse.next();
    }
  }

  // Control API routes (api.nivostack.com)
  if (hostname.startsWith('api.')) {
    const controlRoutes = [
      '/api/sdk-init',
      '/api/business-config',
      '/api/localization',
      '/api/feature-flags',
      '/api/sdk-settings',
      '/api/projects',
      '/api/devices',
      '/api/sessions',
      '/api/traces',
      '/api/logs',
      '/api/crashes',
      '/api/admin',
      '/api/auth',
      '/api/subscription',
    ];

    const isControlRoute = controlRoutes.some(route => 
      pathname.startsWith(route)
    );

    if (!isControlRoute && pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Route not available on control API domain' },
        { status: 404 }
      );
    }
  }

  // Dashboard routes (studio.nivostack.com)
  if (hostname.startsWith('studio.')) {
    // Allow all dashboard routes
    if (pathname.startsWith('/api/')) {
      // Dashboard can access all APIs
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
  ],
};
```

### 2. Single Vercel Project Configuration

**`dashboard/vercel.json`**:

```json
{
  "buildCommand": "pnpm install && pnpm build",
  "framework": "nextjs",
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
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization, X-API-Key"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ]
}
```

### 3. DNS Configuration (Same as Before)

All domains point to the same Vercel project:

```
Type    Name    Value                          TTL
CNAME   studio  cname.vercel-dns.com.         3600
CNAME   ingest  cname.vercel-dns.com.         3600
CNAME   api     cname.vercel-dns.com.         3600
```

### 4. Vercel Domain Setup

```bash
cd dashboard
vercel domains add studio.nivostack.com
vercel domains add ingest.nivostack.com
vercel domains add api.nivostack.com
```

## Pros and Cons

### Pros
- ✅ Single deployment
- ✅ Shared codebase
- ✅ Easier to manage
- ✅ Lower initial cost ($20/month)
- ✅ Simpler environment variable management

### Cons
- ❌ All traffic counts toward same quota
- ❌ Can't scale services independently
- ❌ Single point of failure
- ❌ Harder to optimize individual services

## Recommendation

**Start with single project** (this alternative approach), then **split later** if:
- Traffic exceeds quotas
- Need independent scaling
- Want separate monitoring
- Cost optimization becomes critical

