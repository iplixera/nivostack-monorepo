# Middleware Quick Reference

## What is Middleware?

Code that runs **before** requests are completed. Perfect for:
- Route filtering by domain
- Authentication checks
- CORS headers
- Rate limiting
- Redirects/rewrites

## File Location

```
dashboard/src/middleware.ts
```

## Basic Structure

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Your logic here
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*', // Which routes to run on
};
```

## Common Patterns

### 1. Check Domain

```typescript
const hostname = request.headers.get('host') || '';
if (hostname.startsWith('ingest.')) {
  // Handle ingest domain
}
```

### 2. Check Path

```typescript
const pathname = request.nextUrl.pathname;
if (pathname.startsWith('/api/devices')) {
  // Handle devices endpoint
}
```

### 3. Check Method

```typescript
const method = request.method;
if (method === 'POST') {
  // Handle POST requests
}
```

### 4. Add Headers

```typescript
const response = NextResponse.next();
response.headers.set('Access-Control-Allow-Origin', '*');
return response;
```

### 5. Block Request

```typescript
return NextResponse.json(
  { error: 'Not allowed' },
  { status: 403 }
);
```

### 6. Redirect

```typescript
return NextResponse.redirect(new URL('/new-path', request.url));
```

## Matcher Patterns

```typescript
export const config = {
  // Single path
  matcher: '/api/:path*',
  
  // Multiple paths
  matcher: ['/api/:path*', '/dashboard/:path*'],
  
  // Exclude paths
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
```

## Request Properties

```typescript
request.nextUrl.pathname      // '/api/devices'
request.nextUrl.searchParams  // Query parameters
request.method                // 'GET', 'POST', etc.
request.headers.get('host')   // 'ingest.nivostack.com'
request.headers.get('x-api-key') // API key
request.ip                    // Client IP
request.cookies.get('token')  // Cookie value
```

## Response Methods

```typescript
NextResponse.next()                    // Continue
NextResponse.redirect(url)             // Redirect
NextResponse.rewrite(url)              // Rewrite URL
NextResponse.json({ error: '...' })    // JSON response
```

## NivoStack Example

```typescript
export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;
  
  // Ingest domain: Only POST/PUT/PATCH
  if (hostname.startsWith('ingest.')) {
    const ingestRoutes = ['/api/devices', '/api/traces', '/api/logs'];
    const isIngestRoute = ingestRoutes.some(r => pathname.startsWith(r));
    const isWrite = ['POST', 'PUT', 'PATCH'].includes(request.method);
    
    if (isIngestRoute && isWrite) {
      return NextResponse.next();
    }
    return NextResponse.json({ error: 'Not allowed' }, { status: 404 });
  }
  
  // Control domain: GET and CRUD
  if (hostname.startsWith('api.')) {
    const controlRoutes = ['/api/sdk-init', '/api/business-config'];
    const isControlRoute = controlRoutes.some(r => pathname.startsWith(r));
    
    if (isControlRoute) {
      return NextResponse.next();
    }
    return NextResponse.json({ error: 'Not allowed' }, { status: 404 });
  }
  
  // Dashboard: Allow all
  return NextResponse.next();
}
```

## Debugging

```typescript
console.log('Middleware:', {
  hostname: request.headers.get('host'),
  pathname: request.nextUrl.pathname,
  method: request.method,
});
```

## See Also

- Full Guide: `NEXTJS_MIDDLEWARE_GUIDE.md`
- Deployment: `VERCEL_DEPLOYMENT_ALTERNATIVE.md`

