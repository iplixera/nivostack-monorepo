import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

/**
 * GET /api/health
 * Health check endpoint that also runs migrations on first call after deployment
 * This ensures migrations run automatically when the app starts
 */
let migrationChecked = false

export async function GET(request: NextRequest) {
    try {
        // Run migration on first health check (after deployment)
        if (!migrationChecked && process.env.POSTGRES_URL_NON_POOLING) {
            migrationChecked = true

            // Run migration in background (don't block health check)
            exec(
                `POSTGRES_PRISMA_URL="${process.env.POSTGRES_URL_NON_POOLING}" POSTGRES_URL_NON_POOLING="${process.env.POSTGRES_URL_NON_POOLING}" pnpm dlx prisma@5.22.0 db push --schema=prisma/schema.prisma --accept-data-loss --skip-generate`,
                { cwd: process.cwd(), timeout: 30000 },
                (error, stdout, stderr) => {
                    if (error) {
                        console.error('Background migration error:', error)
                    } else {
                        console.log('✅ Background migration completed:', stdout)
                    }
                }
            )
        }

        return NextResponse.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            migration: migrationChecked ? 'checked' : 'running',
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

