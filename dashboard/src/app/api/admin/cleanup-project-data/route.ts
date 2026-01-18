import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { canPerformAction } from '@/lib/team-access'

/**
 * Admin endpoint to cleanup all test data for a project
 *
 * DELETE /api/admin/cleanup-project-data?projectId=<projectId>
 *
 * This endpoint deletes:
 * - All devices for the project
 * - All API traces for the project
 * - All logs for the project
 * - All sessions for the project
 *
 * Requires authentication and project ownership
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId query parameter is required' },
        { status: 400 }
      )
    }

    // Check for API key authentication first
    const apiKey = request.headers.get('x-api-key')

    let project: any

    if (apiKey) {
      // Validate API key matches project
      project = await prisma.project.findUnique({
        where: { apiKey },
        select: {
          id: true,
          name: true,
          userId: true,
          teamId: true
        }
      })

      if (!project) {
        return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
      }

      if (project.id !== projectId) {
        return NextResponse.json(
          { error: 'API key does not match project ID' },
          { status: 403 }
        )
      }

      // API key is valid, proceed with cleanup
    } else {
      // Fall back to user authentication
      const user = await getAuthUser(request)
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      // Verify project exists and user has access
      project = await prisma.project.findUnique({
        where: { id: projectId },
        select: {
          id: true,
          name: true,
          userId: true,
          teamId: true
        }
      })

      if (!project) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        )
      }

      // Check if user has access to this project
      const hasAccess = await canPerformAction(user.id, project.teamId, project.userId, 'delete')
      if (!hasAccess) {
        return NextResponse.json(
          { error: 'Forbidden: You do not have permission to manage this project' },
          { status: 403 }
        )
      }
    }

    console.log(`🧹 Starting cleanup for project: ${project.name} (${projectId})`)

    // Count records before deletion
    const [deviceCount, traceCount, logCount, sessionCount] = await Promise.all([
      prisma.device.count({ where: { projectId } }),
      prisma.apiTrace.count({ where: { projectId } }),
      prisma.log.count({ where: { projectId } }),
      prisma.session.count({ where: { projectId } })
    ])

    console.log(`📊 Current data counts:`, {
      devices: deviceCount,
      traces: traceCount,
      logs: logCount,
      sessions: sessionCount
    })

    if (deviceCount === 0 && traceCount === 0 && logCount === 0 && sessionCount === 0) {
      return NextResponse.json({
        success: true,
        message: 'No data to clean up',
        deleted: {
          devices: 0,
          traces: 0,
          logs: 0,
          sessions: 0
        }
      })
    }

    // Delete data in correct order (respecting foreign key constraints)
    console.log(`🗑️  Deleting data...`)

    // 1. Delete API traces (no foreign key dependencies)
    const deletedTraces = await prisma.apiTrace.deleteMany({
      where: { projectId }
    })
    console.log(`   ✓ Deleted ${deletedTraces.count} API traces`)

    // 2. Delete logs (no foreign key dependencies)
    const deletedLogs = await prisma.log.deleteMany({
      where: { projectId }
    })
    console.log(`   ✓ Deleted ${deletedLogs.count} logs`)

    // 3. Delete sessions (may reference devices)
    const deletedSessions = await prisma.session.deleteMany({
      where: { projectId }
    })
    console.log(`   ✓ Deleted ${deletedSessions.count} sessions`)

    // 4. Delete devices (must be last due to foreign key references)
    const deletedDevices = await prisma.device.deleteMany({
      where: { projectId }
    })
    console.log(`   ✓ Deleted ${deletedDevices.count} devices`)

    console.log(`✅ Cleanup complete for project: ${project.name}`)

    return NextResponse.json({
      success: true,
      message: 'Project data cleaned up successfully',
      project: {
        id: project.id,
        name: project.name
      },
      deleted: {
        devices: deletedDevices.count,
        traces: deletedTraces.count,
        logs: deletedLogs.count,
        sessions: deletedSessions.count
      }
    })

  } catch (error) {
    console.error('Cleanup error:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined

    return NextResponse.json(
      {
        error: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && {
          details: errorMessage,
          stack: errorStack
        })
      },
      { status: 500 }
    )
  }
}
