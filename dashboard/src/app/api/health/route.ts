import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'

const execAsync = promisify(exec)

// Track migration status per instance
let migrationChecked = false
let migrationRunning = false

/**
 * GET /api/health
 * Health check endpoint that also runs migrations on first call after deployment
 * This ensures migrations run automatically when the app starts
 */
export async function GET(request: NextRequest) {
    try {
        const dbUrl = process.env.POSTGRES_URL_NON_POOLING

        // Run migration on first health check (after deployment)
        if (!migrationChecked && !migrationRunning && dbUrl) {
            migrationRunning = true

            try {
        // Get the correct path to prisma schema
        // In Vercel, we need to resolve from the dashboard directory
        const cwd = typeof process.cwd === 'function' ? process.cwd() : '/vercel/path0/dashboard'
        const schemaPath = path.join(cwd, '..', 'prisma', 'schema.prisma')
        
        console.log('🔄 Running database migration...')
        console.log('Schema path:', schemaPath)
        console.log('Working directory:', cwd)
        
        // Use npx instead of pnpm dlx (pnpm not available in Vercel runtime)
        // npx is available and will use the locally installed prisma
        const { stdout, stderr } = await execAsync(
          `npx --yes prisma@5.22.0 db push --schema="${schemaPath}" --accept-data-loss --skip-generate`,
          {
            cwd: cwd,
            timeout: 60000, // 60 seconds
            maxBuffer: 10 * 1024 * 1024, // 10MB
            env: {
              ...process.env,
              POSTGRES_PRISMA_URL: dbUrl,
              POSTGRES_URL_NON_POOLING: dbUrl,
            },
          }
        )

                migrationChecked = true
                migrationRunning = false

                console.log('✅ Migration completed:', stdout)
                if (stderr) {
                    console.warn('Migration warnings:', stderr)
                }

                return NextResponse.json({
                    status: 'ok',
                    timestamp: new Date().toISOString(),
                    migration: 'completed',
                    output: stdout.substring(0, 500), // First 500 chars
                })
            } catch (error: any) {
                migrationRunning = false
                console.error('❌ Migration error:', error.message)

                return NextResponse.json(
                    {
                        status: 'error',
                        timestamp: new Date().toISOString(),
                        migration: 'failed',
                        error: error.message,
                        output: error.stdout?.substring(0, 500) || null,
                        errors: error.stderr?.substring(0, 500) || null,
                    },
                    { status: 500 }
                )
            }
        }

        return NextResponse.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            migration: migrationChecked ? 'already_completed' : 'not_configured',
            database: dbUrl ? 'configured' : 'not_configured',
        })
    } catch (error: any) {
        return NextResponse.json(
            {
                status: 'error',
                error: error.message,
            },
            { status: 500 }
        )
    }
}

