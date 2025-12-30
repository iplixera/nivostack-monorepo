import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

/**
 * POST /api/migrate
 * Run database migrations via API endpoint
 * Protected by CRON_SECRET or can be called from Vercel Dashboard
 * 
 * This endpoint can be called:
 * - Manually: POST /api/migrate with Authorization: Bearer <CRON_SECRET>
 * - Via Vercel Cron: Automatically with x-cron-secret header
 */
export async function POST(request: NextRequest) {
  try {
    // Check for authorization (CRON_SECRET or Authorization header)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    const providedSecret = authHeader?.replace('Bearer ', '') || request.headers.get('x-cron-secret')

    if (cronSecret && providedSecret !== cronSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUrl = process.env.POSTGRES_URL_NON_POOLING
    if (!dbUrl) {
      return NextResponse.json({ error: 'Database URL not configured' }, { status: 500 })
    }

    // Run Prisma db push to sync schema
    const { exec } = await import('child_process')
    const { promisify } = await import('util')
    const path = await import('path')
    const execAsync = promisify(exec)

    try {
      // Get the correct path to prisma schema (relative to dashboard directory)
      const schemaPath = path.join(process.cwd(), '..', 'prisma', 'schema.prisma')
      
      console.log('🔄 Running database migration...')
      console.log('Schema path:', schemaPath)
      console.log('Working directory:', process.cwd())
      
      const { stdout, stderr } = await execAsync(
        `POSTGRES_PRISMA_URL="${dbUrl}" POSTGRES_URL_NON_POOLING="${dbUrl}" pnpm dlx prisma@5.22.0 db push --schema="${schemaPath}" --accept-data-loss --skip-generate`,
        {
          cwd: process.cwd(),
          timeout: 60000,
          maxBuffer: 10 * 1024 * 1024, // 10MB
        }
      )

      return NextResponse.json({
        success: true,
        message: 'Migration completed',
        output: stdout,
        errors: stderr || null,
      })
    } catch (error: any) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          output: error.stdout || null,
          errors: error.stderr || null,
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Migration error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/migrate
 * Check migration status
 */
export async function GET() {
  return NextResponse.json({
    message: 'Migration endpoint - POST to run migrations',
    database: process.env.POSTGRES_URL_NON_POOLING ? 'configured' : 'not configured',
  })
}

