import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// GET - List monitored errors for a project
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const projectId = request.nextUrl.searchParams.get('projectId')
    const alertId = request.nextUrl.searchParams.get('alertId')
    const errorId = request.nextUrl.searchParams.get('errorId')
    const isResolved = request.nextUrl.searchParams.get('isResolved')
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50')
    const offset = parseInt(request.nextUrl.searchParams.get('offset') || '0')

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

    // If specific error requested, return full details
    if (errorId) {
      const error = await prisma.monitoredError.findUnique({
        where: { id: errorId },
        include: {
          alert: {
            select: {
              id: true,
              title: true,
              endpoint: true,
              method: true
            }
          }
        }
      })

      if (!error || error.projectId !== projectId) {
        return NextResponse.json({ error: 'Error not found' }, { status: 404 })
      }

      // Get related traces
      const traces = await prisma.apiTrace.findMany({
        where: {
          projectId,
          url: { contains: error.endpoint },
          method: error.method,
          OR: [
            { statusCode: error.statusCode || undefined },
            error.errorCode ? { responseBody: { contains: error.errorCode } } : {}
          ]
        },
        include: {
          device: {
            select: { deviceId: true, platform: true, model: true }
          },
          session: {
            select: { id: true, sessionToken: true }
          }
        },
        orderBy: { timestamp: 'desc' },
        take: 100
      })

      return NextResponse.json({ error, traces })
    }

    // Build where clause
    const where: Record<string, unknown> = { projectId }
    if (alertId) where.alertId = alertId
    if (isResolved !== null && isResolved !== undefined) {
      where.isResolved = isResolved === 'true'
    }

    // Get errors with pagination
    const [errors, total] = await Promise.all([
      prisma.monitoredError.findMany({
        where,
        include: {
          alert: {
            select: {
              id: true,
              title: true,
              endpoint: true,
              method: true
            }
          }
        },
        orderBy: { lastOccurrence: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.monitoredError.count({ where })
    ])

    // Get summary stats
    const stats = await prisma.monitoredError.groupBy({
      by: ['isResolved'],
      where: { projectId },
      _count: true,
      _sum: { occurrenceCount: true }
    })

    const summary = {
      totalErrors: total,
      unresolvedCount: stats.find(s => !s.isResolved)?._count || 0,
      resolvedCount: stats.find(s => s.isResolved)?._count || 0,
      totalOccurrences: stats.reduce((acc, s) => acc + (s._sum.occurrenceCount || 0), 0)
    }

    return NextResponse.json({ errors, total, summary, limit, offset })
  } catch (error) {
    console.error('Monitor GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update monitored error (resolve, add notes)
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
    const { id, isResolved, notes } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing error ID' }, { status: 400 })
    }

    // Verify error ownership
    const existingError = await prisma.monitoredError.findUnique({
      where: { id },
      include: {
        alert: {
          include: { project: true }
        }
      }
    })

    if (!existingError || existingError.alert.project.userId !== payload.userId) {
      return NextResponse.json({ error: 'Error not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (isResolved !== undefined) {
      updateData.isResolved = isResolved
      if (isResolved) {
        updateData.resolvedAt = new Date()
        updateData.resolvedBy = payload.userId
      } else {
        updateData.resolvedAt = null
        updateData.resolvedBy = null
      }
    }
    if (notes !== undefined) updateData.notes = notes

    const error = await prisma.monitoredError.update({
      where: { id },
      data: updateData,
      include: {
        alert: {
          select: {
            id: true,
            title: true,
            endpoint: true,
            method: true
          }
        }
      }
    })

    return NextResponse.json({ error })
  } catch (error) {
    console.error('Monitor PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete monitored error
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const errorId = request.nextUrl.searchParams.get('id')

    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const payload = verifyToken(token)

    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!errorId) {
      return NextResponse.json({ error: 'Missing error ID' }, { status: 400 })
    }

    // Verify error ownership
    const existingError = await prisma.monitoredError.findUnique({
      where: { id: errorId },
      include: {
        alert: {
          include: { project: true }
        }
      }
    })

    if (!existingError || existingError.alert.project.userId !== payload.userId) {
      return NextResponse.json({ error: 'Error not found' }, { status: 404 })
    }

    await prisma.monitoredError.delete({
      where: { id: errorId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Monitor DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
