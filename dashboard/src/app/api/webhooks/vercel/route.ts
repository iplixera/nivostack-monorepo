import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

/**
 * POST /api/webhooks/vercel
 * Vercel Deployment Webhook - Runs migrations after successful deployment
 * 
 * Configure in Vercel Dashboard:
 * Settings → Git → Deploy Hooks → Add Hook
 * URL: https://studio.nivostack.com/api/webhooks/vercel
 * Events: Production Deployment, Preview Deployment
 */
export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret (optional but recommended)
    const webhookSecret = process.env.VERCEL_WEBHOOK_SECRET
    const providedSecret = request.headers.get('x-vercel-signature') || request.headers.get('authorization')?.replace('Bearer ', '')

    if (webhookSecret && providedSecret !== webhookSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const deploymentUrl = body.deployment?.url || body.url
    const environment = body.deployment?.target || body.type || 'production'

    console.log(`🔄 Vercel webhook triggered: ${environment} deployment at ${deploymentUrl}`)

    // Run migration
    const dbUrl = process.env.POSTGRES_URL_NON_POOLING
    if (!dbUrl) {
      return NextResponse.json({ error: 'Database URL not configured' }, { status: 500 })
    }

    try {
      // Run Prisma db push
      const { stdout, stderr } = await execAsync(
        `POSTGRES_PRISMA_URL="${dbUrl}" POSTGRES_URL_NON_POOLING="${dbUrl}" pnpm dlx prisma@5.22.0 db push --schema=prisma/schema.prisma --accept-data-loss --skip-generate`,
        {
          cwd: process.cwd(),
          timeout: 60000,
        }
      )

      console.log('✅ Migration completed:', stdout)

      return NextResponse.json({
        success: true,
        message: 'Migration completed after deployment',
        environment,
        deploymentUrl,
        output: stdout,
      })
    } catch (error: any) {
      console.error('Migration error:', error)
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
    console.error('Webhook error:', error)
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
 * GET /api/webhooks/vercel
 * Health check
 */
export async function GET() {
  return NextResponse.json({
    message: 'Vercel deployment webhook endpoint',
    usage: 'POST to trigger migration after deployment',
    configure: 'Vercel Dashboard → Settings → Git → Deploy Hooks',
  })
}

