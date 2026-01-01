import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { canPerformAction } from '@/lib/team-access'

// GET - Get notification settings for a project
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const projectId = request.nextUrl.searchParams.get('projectId')

    if (!authHeader || !projectId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const payload = verifyToken(token)

    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has access to project (owner or member)
    const hasAccess = await canPerformAction(payload.userId, projectId, 'view')
    if (!hasAccess) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 })
    }

    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Get or create notification settings
    let settings = await prisma.notificationSettings.findUnique({
      where: { projectId }
    })

    if (!settings) {
      settings = await prisma.notificationSettings.create({
        data: { projectId }
      })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Settings GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update notification settings
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const payload = verifyToken(token)

    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      projectId,
      emailEnabled,
      emailAddresses,
      pushEnabled,
      pushToken,
      smsEnabled,
      smsNumbers,
      webhookEnabled,
      webhookUrl,
      webhookSecret,
      webhookHeaders
    } = body

    if (!projectId) {
      return NextResponse.json({ error: 'Missing projectId' }, { status: 400 })
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: payload.userId
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Update or create settings
    const settings = await prisma.notificationSettings.upsert({
      where: { projectId },
      update: {
        emailEnabled: emailEnabled ?? undefined,
        emailAddresses: emailAddresses ?? undefined,
        pushEnabled: pushEnabled ?? undefined,
        pushToken: pushToken ?? undefined,
        smsEnabled: smsEnabled ?? undefined,
        smsNumbers: smsNumbers ?? undefined,
        webhookEnabled: webhookEnabled ?? undefined,
        webhookUrl: webhookUrl ?? undefined,
        webhookSecret: webhookSecret ?? undefined,
        webhookHeaders: webhookHeaders ?? undefined
      },
      create: {
        projectId,
        emailEnabled: emailEnabled ?? false,
        emailAddresses: emailAddresses ?? [],
        pushEnabled: pushEnabled ?? false,
        pushToken,
        smsEnabled: smsEnabled ?? false,
        smsNumbers: smsNumbers ?? [],
        webhookEnabled: webhookEnabled ?? false,
        webhookUrl,
        webhookSecret,
        webhookHeaders
      }
    })

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Settings PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
