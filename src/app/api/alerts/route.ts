import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// Standard HTTP error codes
const STANDARD_ERROR_CODES = {
  client: [400, 401, 403, 404, 405, 408, 409, 410, 413, 414, 415, 422, 429],
  server: [500, 501, 502, 503, 504]
}

// GET - List all alerts for a project
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

    const alerts = await prisma.apiAlert.findMany({
      where: { projectId },
      include: {
        _count: {
          select: { monitoredErrors: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      alerts,
      standardErrorCodes: STANDARD_ERROR_CODES
    })
  } catch (error) {
    console.error('Alerts GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new alert
export async function POST(request: NextRequest) {
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
      title,
      description,
      endpoint,
      method,
      isEnabled,
      monitorStandardErrors,
      standardErrorCodes,
      customStatusCodes,
      bodyErrorField,
      bodyErrorValues,
      headerErrorField,
      headerErrorValues,
      notifyEmail,
      notifyPush,
      notifySms,
      notifyWebhook,
      cooldownMinutes
    } = body

    if (!projectId || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
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

    const alert = await prisma.apiAlert.create({
      data: {
        projectId,
        title,
        description: description || null,
        endpoint: endpoint || null,
        method: method || null,
        isEnabled: isEnabled !== false,
        monitorStandardErrors: monitorStandardErrors !== false,
        standardErrorCodes: standardErrorCodes || [],
        customStatusCodes: customStatusCodes || [],
        bodyErrorField: bodyErrorField || null,
        bodyErrorValues: bodyErrorValues || [],
        headerErrorField: headerErrorField || null,
        headerErrorValues: headerErrorValues || [],
        notifyEmail: notifyEmail !== false,
        notifyPush: notifyPush === true,
        notifySms: notifySms === true,
        notifyWebhook: notifyWebhook === true,
        cooldownMinutes: cooldownMinutes || 5
      }
    })

    return NextResponse.json({ alert })
  } catch (error) {
    console.error('Alerts POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update an alert
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
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing alert ID' }, { status: 400 })
    }

    // Verify alert ownership
    const existingAlert = await prisma.apiAlert.findUnique({
      where: { id },
      include: { project: true }
    })

    if (!existingAlert || existingAlert.project.userId !== payload.userId) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
    }

    const alert = await prisma.apiAlert.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ alert })
  } catch (error) {
    console.error('Alerts PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete an alert
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const alertId = request.nextUrl.searchParams.get('id')

    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const payload = verifyToken(token)

    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!alertId) {
      return NextResponse.json({ error: 'Missing alert ID' }, { status: 400 })
    }

    // Verify alert ownership
    const existingAlert = await prisma.apiAlert.findUnique({
      where: { id: alertId },
      include: { project: true }
    })

    if (!existingAlert || existingAlert.project.userId !== payload.userId) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
    }

    await prisma.apiAlert.delete({
      where: { id: alertId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Alerts DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
