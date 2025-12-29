import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateApiKey } from '@/lib/auth'

/**
 * GET /api/business-config/stream
 * Server-Sent Events (SSE) endpoint for real-time config updates
 * SDKs can subscribe to this endpoint to receive updates when configs change
 */
export async function GET(request: NextRequest) {
  const project = await validateApiKey(request)
  if (!project) {
    return new Response('Invalid API key', { status: 401 })
  }

  // Create a ReadableStream for SSE
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()

      // Send initial connection message
      const send = (data: string) => {
        controller.enqueue(encoder.encode(`data: ${data}\n\n`))
      }

      // Send initial connection message
      send(JSON.stringify({ type: 'connected', projectId: project.id }))

      // Subscribe to config updates
      const unsubscribe = subscribeToConfigUpdates(project.id, (event) => {
        send(JSON.stringify({
          type: 'config_updated',
          config: {
            key: event.configKey,
            version: event.version,
            updatedAt: event.updatedAt.toISOString()
          }
        }))
      })

      // Send keepalive ping every 30 seconds
      const keepaliveInterval = setInterval(() => {
        send(JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() }))
      }, 30000)

      // Clean up on client disconnect
      request.signal.addEventListener('abort', () => {
        unsubscribe()
        clearInterval(keepaliveInterval)
        controller.close()
      })
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no' // Disable buffering for nginx
    }
  })
}

