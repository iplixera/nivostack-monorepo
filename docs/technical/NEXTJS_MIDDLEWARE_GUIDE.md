# Next.js Middleware Guide

## What is Middleware?

Middleware in Next.js is code that runs **before a request is completed**. It allows you to modify the request or response, redirect, rewrite URLs, or block requests based on conditions.

## How Middleware Works

```
Request → Middleware → Route Handler/Page Component → Response
```

Middleware executes **on the Edge** (Vercel Edge Network), meaning it runs close to your users for low latency.

## Basic Middleware Example

**`middleware.ts`** (in `src/` directory):

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Access request information
  const pathname = request.nextUrl.pathname;
  const hostname = request.headers.get('host');
  
  // Modify response
  return NextResponse.next();
}

// Configure which routes middleware runs on
export const config = {
  matcher: '/api/:path*', // Only run on API routes
};
```

## Middleware for Domain-Based Routing

### Use Case: Route Filtering by Domain

For NivoStack, we want to:
- `ingest.nivostack.com` → Only allow POST/PUT/PATCH to specific endpoints
- `api.nivostack.com` → Only allow GET and CRUD operations
- `studio.nivostack.com` → Allow all routes (dashboard)

### Complete Implementation

**`dashboard/src/middleware.ts`**:

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;
  const method = request.method;

  // Skip middleware for non-API routes
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // ============================================
  // INGEST API (ingest.nivostack.com)
  // ============================================
  if (hostname.startsWith('ingest.')) {
    // Define allowed ingest routes (write operations only)
    const ingestRoutes = [
      '/api/devices',           // Device registration
      '/api/traces',            // API traces
      '/api/logs',              // Logs
      '/api/crashes',           // Crash reports
      '/api/sessions',          // Session management
    ];

    // Check if route is an ingest route
    const isIngestRoute = ingestRoutes.some(route => 
      pathname.startsWith(route)
    );

    // Allow POST/PUT/PATCH for ingest routes
    const isWriteOperation = ['POST', 'PUT', 'PATCH'].includes(method);
    
    // Allow DELETE for device user endpoints
    const isDeviceUserEndpoint = pathname.match(/^\/api\/devices\/[^/]+\/user$/);
    const isDeleteUserOperation = method === 'DELETE' && isDeviceUserEndpoint;

    if (isIngestRoute && (isWriteOperation || isDeleteUserOperation)) {
      // Add CORS headers for SDK requests
      const response = NextResponse.next();
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'POST, PUT, PATCH, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');
      return response;
    }

    // Block everything else
    return NextResponse.json(
      { 
        error: 'Route not available on ingest domain',
        message: 'This endpoint is only available on api.nivostack.com',
        availableDomains: ['api.nivostack.com']
      },
      { status: 404 }
    );
  }

  // ============================================
  // CONTROL API (api.nivostack.com)
  // ============================================
  if (hostname.startsWith('api.')) {
    // Define allowed control routes
    const controlRoutes = [
      // SDK endpoints
      '/api/sdk-init',
      '/api/business-config',
      '/api/localization',
      '/api/feature-flags',
      '/api/sdk-settings',
      
      // Data endpoints (read operations)
      '/api/projects',
      '/api/devices',
      '/api/sessions',
      '/api/traces',
      '/api/logs',
      '/api/crashes',
      
      // Admin endpoints
      '/api/admin',
      
      // Auth endpoints
      '/api/auth',
      
      // Subscription endpoints
      '/api/subscription',
    ];

    // Check if route is a control route
    const isControlRoute = controlRoutes.some(route => 
      pathname.startsWith(route)
    );

    if (isControlRoute) {
      // Add CORS headers
      const response = NextResponse.next();
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
      return response;
    }

    // Block everything else
    return NextResponse.json(
      { 
        error: 'Route not available on control API domain',
        message: 'This endpoint is only available on ingest.nivostack.com',
        availableDomains: ['ingest.nivostack.com']
      },
      { status: 404 }
    );
  }

  // ============================================
  // DASHBOARD (studio.nivostack.com)
  // ============================================
  if (hostname.startsWith('studio.')) {
    // Dashboard can access all routes
    return NextResponse.next();
  }

  // Default: Allow request (for localhost development)
  return NextResponse.next();
}

// Configure middleware to run on API routes only
export const config = {
  matcher: [
    '/api/:path*', // Match all API routes
  ],
};
```

## Middleware Features

### 1. Request Inspection

```typescript
export function middleware(request: NextRequest) {
  // URL information
  const url = request.nextUrl;
  const pathname = url.pathname;
  const searchParams = url.searchParams;
  
  // Headers
  const hostname = request.headers.get('host');
  const userAgent = request.headers.get('user-agent');
  const apiKey = request.headers.get('x-api-key');
  
  // Method
  const method = request.method;
  
  // IP address
  const ip = request.ip;
  
  // Cookies
  const token = request.cookies.get('token');
}
```

### 2. Response Modification

```typescript
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Add headers
  response.headers.set('X-Custom-Header', 'value');
  response.headers.set('Access-Control-Allow-Origin', '*');
  
  // Set cookies
  response.cookies.set('theme', 'dark');
  
  // Modify response
  return response;
}
```

### 3. Redirects

```typescript
export function middleware(request: NextRequest) {
  // Redirect to different URL
  if (request.nextUrl.pathname === '/old') {
    return NextResponse.redirect(new URL('/new', request.url));
  }
  
  // Rewrite URL (keeps same URL, serves different content)
  if (request.nextUrl.pathname.startsWith('/api/v1')) {
    return NextResponse.rewrite(new URL('/api/v2', request.url));
  }
}
```

### 4. Blocking Requests

```typescript
export function middleware(request: NextRequest) {
  // Return error response
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // Return 404
  return NextResponse.json(
    { error: 'Not found' },
    { status: 404 }
  );
}
```

## Advanced Middleware Patterns

### Pattern 1: Rate Limiting

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limiter (use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function middleware(request: NextRequest) {
  const ip = request.ip || 'unknown';
  const now = Date.now();
  const limit = 100; // 100 requests
  const window = 60000; // per minute

  const record = rateLimitMap.get(ip);
  
  if (record) {
    if (now > record.resetAt) {
      // Reset window
      rateLimitMap.set(ip, { count: 1, resetAt: now + window });
    } else {
      if (record.count >= limit) {
        return NextResponse.json(
          { error: 'Rate limit exceeded' },
          { 
            status: 429,
            headers: {
              'Retry-After': String(Math.ceil((record.resetAt - now) / 1000)),
            },
          }
        );
      }
      record.count++;
    }
  } else {
    rateLimitMap.set(ip, { count: 1, resetAt: now + window });
  }

  return NextResponse.next();
}
```

### Pattern 2: Authentication Check

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Skip auth check for public routes
  const publicRoutes = ['/api/auth/login', '/api/auth/register'];
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Check for API key (SDK requests)
  const apiKey = request.headers.get('x-api-key');
  if (apiKey) {
    // API key authentication handled in route handler
    return NextResponse.next();
  }

  // Check for JWT token (Dashboard requests)
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    // Add user info to headers for route handlers
    const response = NextResponse.next();
    response.headers.set('x-user-id', payload.userId);
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }
}
```

### Pattern 3: Request Logging

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const start = Date.now();
  
  const response = NextResponse.next();
  
  // Log after response
  response.headers.set('x-response-time', String(Date.now() - start));
  
  // Log request (async, don't block)
  console.log({
    method: request.method,
    pathname: request.nextUrl.pathname,
    hostname: request.headers.get('host'),
    ip: request.ip,
    userAgent: request.headers.get('user-agent'),
    timestamp: new Date().toISOString(),
  });
  
  return response;
}
```

### Pattern 4: A/B Testing

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // A/B test for homepage
  if (pathname === '/') {
    const variant = Math.random() < 0.5 ? 'A' : 'B';
    const response = NextResponse.next();
    response.cookies.set('ab-variant', variant);
    return response;
  }
  
  return NextResponse.next();
}
```

## Matcher Configuration

The `config.matcher` determines which routes middleware runs on:

```typescript
export const config = {
  // Single path
  matcher: '/about',
  
  // Multiple paths
  matcher: ['/about', '/dashboard'],
  
  // All API routes
  matcher: '/api/:path*',
  
  // Multiple patterns
  matcher: [
    '/api/:path*',
    '/dashboard/:path*',
  ],
  
  // Exclude specific paths
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
  
  // Complex pattern
  matcher: [
    '/api/((?!health|status).*)', // All API routes except health/status
  ],
};
```

## Edge Runtime Limitations

Middleware runs on the Edge, which has limitations:

### ✅ Supported
- Web APIs: `fetch`, `Headers`, `Request`, `Response`
- URL manipulation
- Headers and cookies
- Redirects and rewrites

### ❌ Not Supported
- Node.js APIs (`fs`, `path`, etc.)
- Database connections (use `fetch` to call API)
- Heavy computations
- File system access

### Workaround: Call API Routes

```typescript
export function middleware(request: NextRequest) {
  // Can't use Prisma directly, but can call your own API
  const response = await fetch(`${request.nextUrl.origin}/api/check-auth`, {
    headers: request.headers,
  });
  
  if (!response.ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  return NextResponse.next();
}
```

## Testing Middleware

### Unit Test Example

```typescript
import { NextRequest } from 'next/server';
import { middleware } from './middleware';

describe('Middleware', () => {
  it('blocks non-ingest routes on ingest domain', async () => {
    const request = new NextRequest(
      new URL('https://ingest.nivostack.com/api/projects'),
      {
        headers: {
          host: 'ingest.nivostack.com',
        },
      }
    );
    
    const response = await middleware(request);
    expect(response.status).toBe(404);
  });
  
  it('allows ingest routes on ingest domain', async () => {
    const request = new NextRequest(
      new URL('https://ingest.nivostack.com/api/devices'),
      {
        method: 'POST',
        headers: {
          host: 'ingest.nivostack.com',
        },
      }
    );
    
    const response = await middleware(request);
    expect(response.status).toBe(200);
  });
});
```

## Performance Considerations

1. **Keep middleware lightweight** - Runs on every matched request
2. **Use matcher carefully** - Don't run on unnecessary routes
3. **Cache when possible** - Use Edge KV or similar
4. **Avoid heavy operations** - Move to route handlers if needed

## Debugging Middleware

### Add Logging

```typescript
export function middleware(request: NextRequest) {
  console.log('Middleware:', {
    hostname: request.headers.get('host'),
    pathname: request.nextUrl.pathname,
    method: request.method,
  });
  
  return NextResponse.next();
}
```

### Check Vercel Logs

```bash
vercel logs --follow
```

## Best Practices

1. ✅ **Keep it simple** - Middleware should be fast and focused
2. ✅ **Use for routing/security** - Not for business logic
3. ✅ **Handle errors gracefully** - Return proper error responses
4. ✅ **Add CORS headers** - For API endpoints
5. ✅ **Log important events** - For debugging
6. ❌ **Don't do heavy computation** - Move to route handlers
7. ❌ **Don't access database directly** - Use API calls
8. ❌ **Don't block unnecessarily** - Allow development/localhost

## Real-World Example: NivoStack Middleware

Here's the complete middleware for NivoStack with all features:

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;
  const method = request.method;

  // Skip middleware for non-API routes
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Development: Allow localhost
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    return NextResponse.next();
  }

  // INGEST API
  if (hostname.startsWith('ingest.')) {
    const ingestRoutes = [
      '/api/devices',
      '/api/traces',
      '/api/logs',
      '/api/crashes',
      '/api/sessions',
    ];

    const isIngestRoute = ingestRoutes.some(route => 
      pathname.startsWith(route)
    );

    const isWriteOperation = ['POST', 'PUT', 'PATCH'].includes(method);
    const isDeviceUserEndpoint = pathname.match(/^\/api\/devices\/[^/]+\/user$/);
    const isDeleteUserOperation = method === 'DELETE' && isDeviceUserEndpoint;

    if (isIngestRoute && (isWriteOperation || isDeleteUserOperation)) {
      const response = NextResponse.next();
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'POST, PUT, PATCH, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');
      return response;
    }

    return NextResponse.json(
      { error: 'Route not available on ingest domain' },
      { status: 404 }
    );
  }

  // CONTROL API
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

    if (isControlRoute) {
      const response = NextResponse.next();
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
      return response;
    }

    return NextResponse.json(
      { error: 'Route not available on control API domain' },
      { status: 404 }
    );
  }

  // DASHBOARD - Allow all
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

## Resources

- [Next.js Middleware Docs](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Vercel Edge Functions](https://vercel.com/docs/functions/edge-functions)
- [Web APIs in Edge Runtime](https://nextjs.org/docs/app/api-reference/edge)

