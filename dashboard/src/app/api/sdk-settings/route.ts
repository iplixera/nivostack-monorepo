import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { canPerformAction } from '@/lib/team-access'

// Default SDK settings values
const DEFAULT_SDK_SETTINGS = {
  // Tracking mode - 'disabled' by default (safe default)
  trackingMode: 'disabled',
  // Security
  captureRequestBodies: true,
  captureResponseBodies: true,
  capturePrintStatements: false,
  sanitizeSensitiveData: true,
  sensitiveFieldPatterns: ['password', 'token', 'secret', 'apiKey', 'api_key', 'authorization', 'cookie'],
  // Performance
  maxLogQueueSize: 100,
  maxTraceQueueSize: 50,
  flushIntervalSeconds: 30,
  enableBatching: true,
  // Log control - 'debug' by default (can be set to 'disabled' to turn off logging)
  minLogLevel: 'debug',
  verboseErrors: false,
}

// GET - Retrieve SDK settings for a project (SDK uses API key, Dashboard uses JWT)
export async function GET(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key')
    const authHeader = request.headers.get('authorization')
    const projectId = request.nextUrl.searchParams.get('projectId')

    let project

    // SDK authentication (API key)
    if (apiKey) {
      project = await prisma.project.findUnique({
        where: { apiKey },
        select: { id: true }
      })
      if (!project) {
        return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
      }
    }
    // Dashboard authentication (JWT)
    else if (authHeader && projectId) {
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
      project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { id: true }
      })
      if (!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 })
      }
    } else {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Fetch SDK settings
    let settings = await prisma.sdkSettings.findUnique({
      where: { projectId: project.id },
      select: {
        id: true,
        projectId: true,
        trackingMode: true,
        captureRequestBodies: true,
        captureResponseBodies: true,
        capturePrintStatements: true,
        sanitizeSensitiveData: true,
        sensitiveFieldPatterns: true,
        maxLogQueueSize: true,
        maxTraceQueueSize: true,
        flushIntervalSeconds: true,
        enableBatching: true,
        minLogLevel: true,
        verboseErrors: true,
      }
    })

    // If no settings exist, create with defaults
    if (!settings) {
      settings = await prisma.sdkSettings.create({
        data: {
          projectId: project.id,
          ...DEFAULT_SDK_SETTINGS,
        },
        select: {
          id: true,
          projectId: true,
          trackingMode: true,
          captureRequestBodies: true,
          captureResponseBodies: true,
          capturePrintStatements: true,
          sanitizeSensitiveData: true,
          sensitiveFieldPatterns: true,
          maxLogQueueSize: true,
          maxTraceQueueSize: true,
          flushIntervalSeconds: true,
          enableBatching: true,
          minLogLevel: true,
          verboseErrors: true,
        }
      })
    }

    // Also fetch API configs for per-endpoint settings
    const apiConfigs = await prisma.apiConfig.findMany({
      where: { projectId: project.id, isEnabled: true },
      select: {
        endpoint: true,
        method: true,
        enableLogs: true,
        captureRequestBody: true,
        captureResponseBody: true,
        costPerRequest: true,
      }
    })

    // Normalize 'disabled' to 'none' for UI consistency
    const trackingMode = settings.trackingMode || DEFAULT_SDK_SETTINGS.trackingMode
    const normalizedTrackingMode = trackingMode === 'disabled' ? 'none' : trackingMode

    return NextResponse.json({
      settings: {
        // Tracking mode - normalized to 'none' if 'disabled'
        trackingMode: normalizedTrackingMode,
        // Security
        captureRequestBodies: settings.captureRequestBodies,
        captureResponseBodies: settings.captureResponseBodies,
        capturePrintStatements: settings.capturePrintStatements,
        sanitizeSensitiveData: settings.sanitizeSensitiveData,
        sensitiveFieldPatterns: settings.sensitiveFieldPatterns,
        // Performance
        maxLogQueueSize: settings.maxLogQueueSize,
        maxTraceQueueSize: settings.maxTraceQueueSize,
        flushIntervalSeconds: settings.flushIntervalSeconds,
        enableBatching: settings.enableBatching,
        // Log control
        minLogLevel: settings.minLogLevel,
        verboseErrors: settings.verboseErrors,
      },
      apiConfigs, // Per-endpoint configurations
    })
  } catch (error) {
    console.error('SDK settings GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update SDK settings (Dashboard only - JWT auth)
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
    const { projectId, ...updates } = body

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 })
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: payload.userId }
    })
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const selectFields = {
      id: true,
      projectId: true,
      trackingMode: true,
      captureRequestBodies: true,
      captureResponseBodies: true,
      capturePrintStatements: true,
      sanitizeSensitiveData: true,
      sensitiveFieldPatterns: true,
      maxLogQueueSize: true,
      maxTraceQueueSize: true,
      flushIntervalSeconds: true,
      enableBatching: true,
      minLogLevel: true,
      verboseErrors: true,
    }

    // Check if settings exist
    const existing = await prisma.sdkSettings.findUnique({
      where: { projectId },
      select: { id: true }
    })

    let settings
    if (existing) {
      // Update existing settings
      settings = await prisma.sdkSettings.update({
        where: { projectId },
        data: {
          // Tracking mode
          ...(updates.trackingMode !== undefined && { trackingMode: updates.trackingMode }),
          // Security
          ...(updates.captureRequestBodies !== undefined && { captureRequestBodies: updates.captureRequestBodies }),
          ...(updates.captureResponseBodies !== undefined && { captureResponseBodies: updates.captureResponseBodies }),
          ...(updates.capturePrintStatements !== undefined && { capturePrintStatements: updates.capturePrintStatements }),
          ...(updates.sanitizeSensitiveData !== undefined && { sanitizeSensitiveData: updates.sanitizeSensitiveData }),
          ...(updates.sensitiveFieldPatterns !== undefined && { sensitiveFieldPatterns: updates.sensitiveFieldPatterns }),
          // Performance
          ...(updates.maxLogQueueSize !== undefined && { maxLogQueueSize: updates.maxLogQueueSize }),
          ...(updates.maxTraceQueueSize !== undefined && { maxTraceQueueSize: updates.maxTraceQueueSize }),
          ...(updates.flushIntervalSeconds !== undefined && { flushIntervalSeconds: updates.flushIntervalSeconds }),
          ...(updates.enableBatching !== undefined && { enableBatching: updates.enableBatching }),
          // Log control
          ...(updates.minLogLevel !== undefined && { minLogLevel: updates.minLogLevel }),
          ...(updates.verboseErrors !== undefined && { verboseErrors: updates.verboseErrors }),
        },
        select: selectFields
      })
    } else {
      // Create new settings with defaults
      settings = await prisma.sdkSettings.create({
        data: {
          projectId,
          trackingMode: updates.trackingMode ?? DEFAULT_SDK_SETTINGS.trackingMode,
          captureRequestBodies: updates.captureRequestBodies ?? DEFAULT_SDK_SETTINGS.captureRequestBodies,
          captureResponseBodies: updates.captureResponseBodies ?? DEFAULT_SDK_SETTINGS.captureResponseBodies,
          capturePrintStatements: updates.capturePrintStatements ?? DEFAULT_SDK_SETTINGS.capturePrintStatements,
          sanitizeSensitiveData: updates.sanitizeSensitiveData ?? DEFAULT_SDK_SETTINGS.sanitizeSensitiveData,
          sensitiveFieldPatterns: updates.sensitiveFieldPatterns ?? DEFAULT_SDK_SETTINGS.sensitiveFieldPatterns,
          maxLogQueueSize: updates.maxLogQueueSize ?? DEFAULT_SDK_SETTINGS.maxLogQueueSize,
          maxTraceQueueSize: updates.maxTraceQueueSize ?? DEFAULT_SDK_SETTINGS.maxTraceQueueSize,
          flushIntervalSeconds: updates.flushIntervalSeconds ?? DEFAULT_SDK_SETTINGS.flushIntervalSeconds,
          enableBatching: updates.enableBatching ?? DEFAULT_SDK_SETTINGS.enableBatching,
          minLogLevel: updates.minLogLevel ?? DEFAULT_SDK_SETTINGS.minLogLevel,
          verboseErrors: updates.verboseErrors ?? DEFAULT_SDK_SETTINGS.verboseErrors,
        },
        select: selectFields
      })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('SDK settings PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
