import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Track if migration has been checked in this instance
let migrationChecked = false

export function middleware(request: NextRequest) {
  // Run migration check on first API request after deployment
  // This ensures migrations run automatically when the app starts serving requests
  if (!migrationChecked && request.nextUrl.pathname.startsWith('/api/') && process.env.POSTGRES_URL_NON_POOLING) {
    migrationChecked = true
    
    // Run migration in background (non-blocking)
    const { exec } = require('child_process')
    exec(
      `POSTGRES_PRISMA_URL="${process.env.POSTGRES_URL_NON_POOLING}" POSTGRES_URL_NON_POOLING="${process.env.POSTGRES_URL_NON_POOLING}" pnpm dlx prisma@5.22.0 db push --schema=prisma/schema.prisma --accept-data-loss --skip-generate 2>&1`,
      { cwd: process.cwd(), timeout: 30000 },
      (error: any, stdout: string, stderr: string) => {
        if (error) {
          console.error('Background migration error:', error.message)
        } else {
          console.log('✅ Background migration completed')
        }
      }
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}

