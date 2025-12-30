import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { checkThrottling } from '@/lib/throttling'
import { validateSubscription } from '@/lib/subscription-validation'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const projects = await prisma.project.findMany({
      where: { userId: user.id },
      include: {
        _count: {
          select: {
            devices: true,
            logs: true,
            crashes: true,
            apiTraces: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ projects })
  } catch (error) {
    console.error('Get projects error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate subscription is active
    const subscriptionValidation = await validateSubscription(user.id)
    if (!subscriptionValidation.valid) {
      return NextResponse.json(
        { error: subscriptionValidation.error || 'Subscription invalid' },
        { status: 403 }
      )
    }

    // Check project limit before creating
    const throttling = await checkThrottling(user.id, 'projects')
    if (throttling.throttled) {
      return NextResponse.json(
        {
          error: throttling.error || 'Project limit reached',
          usage: throttling.usage,
          retryAfter: throttling.retryAfter,
        },
        {
          status: 429,
          headers: throttling.retryAfter
            ? { 'Retry-After': throttling.retryAfter.toString() }
            : {},
        }
      )
    }

    // Check if limit is reached (even if not throttled, we should prevent creation)
    if (throttling.usage) {
      const { used, limit } = throttling.usage
      if (limit !== null && used >= limit) {
        return NextResponse.json(
          {
            error: `Project limit reached. You have used ${used} of ${limit} projects. Please upgrade your plan to create more projects.`,
            usage: throttling.usage,
          },
          { status: 403 }
        )
      }
    }

    const { name } = await request.json()

    if (!name) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 })
    }

    const project = await prisma.project.create({
      data: {
        name,
        userId: user.id
      }
    })

    return NextResponse.json({ project })
  } catch (error) {
    console.error('Create project error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
