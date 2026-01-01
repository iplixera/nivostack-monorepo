import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, validateApiKey } from '@/lib/auth'
import { validateSubscription } from '@/lib/subscription-validation'
import { canPerformAction } from '@/lib/team-access'

// Default feature flags values
const DEFAULT_FLAGS = {
  sdkEnabled: true,       // Master kill switch - disables entire SDK when false
  apiTracking: true,
  screenTracking: true,
  crashReporting: true,
  logging: true,
  deviceTracking: true,
  sessionTracking: true,
  businessConfig: true,
  localization: true,
  offlineSupport: false,
  batchEvents: true
}

// SDK endpoint: Get feature flags for a project (used during SDK initialization)
// Uses X-API-Key header for authentication
export async function GET(request: NextRequest) {
  try {
    // First try API key auth (for SDK)
    const apiKey = request.headers.get('x-api-key')

    if (apiKey) {
      // SDK authentication
      const project = await prisma.project.findFirst({
        where: { apiKey },
        include: { featureFlags: true }
      })

      if (!project) {
        return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
      }

      // Validate subscription
      const validation = await validateSubscription(project.userId)
      if (!validation.valid) {
        // Return all flags as false if subscription invalid
        return NextResponse.json({
          flags: Object.fromEntries(
            Object.keys(DEFAULT_FLAGS).map(key => [key, false])
          ),
          projectId: project.id,
          error: validation.error,
        })
      }

      // If no feature flags exist yet, return defaults
      if (!project.featureFlags) {
        return NextResponse.json({
          flags: DEFAULT_FLAGS,
          projectId: project.id
        })
      }

      // Return the feature flags (excluding internal fields)
      const { id, projectId, createdAt, updatedAt, ...flags } = project.featureFlags
      return NextResponse.json({
        flags,
        projectId: project.id
      })
    }

    // Dashboard authentication (JWT)
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
    }

    // Check if user has access to project (owner or member)
    const hasAccess = await canPerformAction(payload.userId, projectId, 'view')
    if (!hasAccess) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 })
    }

    // Verify project exists and fetch feature flags
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { featureFlags: true }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // If no feature flags exist yet, return defaults
    if (!project.featureFlags) {
      return NextResponse.json({
        flags: DEFAULT_FLAGS,
        projectId: project.id
      })
    }

    // Return the feature flags
    const { id, createdAt, updatedAt, projectId: _, ...flags } = project.featureFlags
    return NextResponse.json({
      flags,
      projectId: project.id
    })
  } catch (error) {
    console.error('Get feature flags error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Dashboard endpoint: Update feature flags for a project
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { projectId, flags } = await request.json()

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
    }

    // Verify user can manage settings (owner or admin only)
    const canManage = await canPerformAction(payload.userId, projectId, 'manage_settings')
    if (!canManage) {
      return NextResponse.json({ error: 'Permission denied. Only owners and admins can update feature flags.' }, { status: 403 })
    }

    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Validate flag keys
    const validKeys = Object.keys(DEFAULT_FLAGS)
    const invalidKeys = Object.keys(flags).filter(key => !validKeys.includes(key))
    if (invalidKeys.length > 0) {
      return NextResponse.json({
        error: `Invalid flag keys: ${invalidKeys.join(', ')}`
      }, { status: 400 })
    }

    // Upsert feature flags (create if not exists, update if exists)
    const featureFlags = await prisma.featureFlags.upsert({
      where: { projectId },
      update: flags,
      create: {
        projectId,
        ...DEFAULT_FLAGS,
        ...flags
      }
    })

    // Return updated flags
    const { id, createdAt, updatedAt, projectId: _, ...updatedFlags } = featureFlags
    return NextResponse.json({
      flags: updatedFlags,
      projectId
    })
  } catch (error) {
    console.error('Update feature flags error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
