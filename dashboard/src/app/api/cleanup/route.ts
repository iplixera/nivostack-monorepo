import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

/**
 * DELETE /api/cleanup
 * Cleanup/delete data for a project
 * Supports deleting: devices, traces, logs, sessions, crashes, screens, or all
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { projectId, type } = body

    if (!projectId || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: projectId, type' },
        { status: 400 }
      )
    }

    // Verify user has access to this project
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: user.id
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 })
    }

    let deletedCount = 0
    let message = ''

    switch (type) {
      case 'devices':
        const devicesResult = await prisma.device.deleteMany({
          where: { projectId }
        })
        deletedCount = devicesResult.count
        message = `Deleted ${deletedCount} device(s)`
        break

      case 'traces':
        const tracesResult = await prisma.apiTrace.deleteMany({
          where: { projectId }
        })
        deletedCount = tracesResult.count
        message = `Deleted ${deletedCount} API trace(s)`
        break

      case 'logs':
        const logsResult = await prisma.log.deleteMany({
          where: { projectId }
        })
        deletedCount = logsResult.count
        message = `Deleted ${deletedCount} log(s)`
        break

      case 'sessions':
        const sessionsResult = await prisma.session.deleteMany({
          where: { projectId }
        })
        deletedCount = sessionsResult.count
        message = `Deleted ${deletedCount} session(s)`
        break

      case 'crashes':
        const crashesResult = await prisma.crash.deleteMany({
          where: { projectId }
        })
        deletedCount = crashesResult.count
        message = `Deleted ${deletedCount} crash report(s)`
        break

      case 'screens':
        // Note: Screen data is embedded in sessions, not a separate table
        // Clear screen-related fields in sessions instead
        const screensResult = await prisma.session.updateMany({
          where: { projectId },
          data: {
            screenFlow: [],
            entryScreen: null,
            exitScreen: null,
            screenCount: 0
          }
        })
        deletedCount = screensResult.count
        message = `Cleared screen data from ${deletedCount} session(s)`
        break

      case 'all':
        // Delete everything in the correct order (respecting foreign key constraints)
        const results = await prisma.$transaction(async (tx) => {
          // Delete sessions (logs and traces reference sessions via foreign key with SetNull)
          const sessions = await tx.session.deleteMany({
            where: { projectId }
          })

          // Delete logs
          const logs = await tx.log.deleteMany({
            where: { projectId }
          })

          // Delete API traces
          const traces = await tx.apiTrace.deleteMany({
            where: { projectId }
          })

          // Delete crashes
          const crashes = await tx.crash.deleteMany({
            where: { projectId }
          })

          // Delete devices (last, as other tables may reference it)
          const devices = await tx.device.deleteMany({
            where: { projectId }
          })

          return {
            sessions: sessions.count,
            logs: logs.count,
            traces: traces.count,
            crashes: crashes.count,
            devices: devices.count
          }
        })

        deletedCount = results.devices + results.traces + results.logs + results.sessions + results.crashes
        message = `Deleted ALL data:\n• ${results.devices} device(s)\n• ${results.traces} API trace(s)\n• ${results.logs} log(s)\n• ${results.sessions} session(s) (including screen data)\n• ${results.crashes} crash(es)`
        break

      default:
        return NextResponse.json(
          { error: 'Invalid type. Must be one of: devices, traces, logs, sessions, crashes, screens, all' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      message,
      deletedCount,
      type
    })
  } catch (error) {
    console.error('Cleanup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

