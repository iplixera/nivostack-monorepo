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

    // Get projects where user is owner (legacy)
    const ownedProjects = await prisma.project.findMany({
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

    // Get projects where user is a member
    let memberProjects: any[] = []
    try {
      memberProjects = await prisma.projectMember.findMany({
        where: { userId: user.id },
        include: {
          project: {
            include: {
              _count: {
                select: {
                  devices: true,
                  logs: true,
                  crashes: true,
                  apiTraces: true
                }
              }
            }
          },
        },
        orderBy: { joinedAt: 'desc' }
      })
      
      // Fetch inviter details for each member project
      for (const member of memberProjects) {
        if (member.invitedBy) {
          try {
            const inviter = await prisma.user.findUnique({
              where: { id: member.invitedBy },
              select: {
                id: true,
                name: true,
                email: true,
              },
            })
            member.inviter = inviter
          } catch (err) {
            console.warn('Could not fetch inviter:', err)
            member.inviter = null
          }
        } else {
          member.inviter = null
        }
      }
    } catch (err: any) {
      // If ProjectMember model doesn't exist yet, skip member projects
      console.warn('Could not fetch member projects:', err.message)
      memberProjects = []
    }

    // Combine and deduplicate (user might be both owner and member)
    const projectMap = new Map()

    // Add owned projects
    ownedProjects.forEach((project) => {
      projectMap.set(project.id, {
        ...project,
        role: 'owner', // User's role in project
        invitedBy: null, // Owned projects don't have an inviter
      })
    })

    // Add member projects (don't override if already owner)
    memberProjects.forEach((member) => {
      if (!projectMap.has(member.project.id)) {
        projectMap.set(member.project.id, {
          ...member.project,
          role: member.role, // User's role in project
          invitedBy: member.inviter ? {
            name: member.inviter.name,
            email: member.inviter.email,
          } : null,
          joinedAt: member.joinedAt,
        })
      }
    })

    const projects = Array.from(projectMap.values())

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

    // Create ProjectMember entry for owner
    await prisma.projectMember.create({
      data: {
        projectId: project.id,
        userId: user.id,
        role: 'owner',
        invitedAt: new Date(),
        joinedAt: new Date(),
      },
    })

    return NextResponse.json({ project: { ...project, role: 'owner' } })
  } catch (error) {
    console.error('Create project error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
