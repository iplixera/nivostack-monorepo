import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Debug endpoint to list devices using API key authentication
 *
 * GET /api/debug/devices?projectId=<projectId>
 *
 * Requires X-API-Key header
 */
export async function GET(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key')
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    if (!apiKey) {
      return NextResponse.json({ error: 'API key required' }, { status: 401 })
    }

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId query parameter is required' },
        { status: 400 }
      )
    }

    // Validate API key matches project
    const project = await prisma.project.findUnique({
      where: { apiKey },
      select: { id: true, name: true }
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

    // Get all devices for the project
    const devices = await prisma.device.findMany({
      where: { projectId },
      select: {
        id: true,
        deviceId: true,
        deviceCode: true,
        platform: true,
        osVersion: true,
        appVersion: true,
        model: true,
        manufacturer: true,
        status: true,
        createdAt: true,
        lastSeenAt: true,
        deletedAt: true,
        debugModeEnabled: true,
        debugModeExpiresAt: true,
        metadata: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      project: {
        id: project.id,
        name: project.name
      },
      count: devices.length,
      devices
    })

  } catch (error) {
    console.error('Debug devices error:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: errorMessage
      },
      { status: 500 }
    )
  }
}
