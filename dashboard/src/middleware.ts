import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Note: Migration is handled by /api/health endpoint
// Middleware runs in Edge runtime which doesn't support child_process
// So we can't run migrations here - rely on /api/health instead

export function middleware(request: NextRequest) {
  // Middleware just passes through - migration handled by /api/health
  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}

