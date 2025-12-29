/**
 * Config Update Event Broadcasting System
 * 
 * This module handles broadcasting config updates to connected SSE clients
 * In production, this could be replaced with Redis Pub/Sub or similar
 */

interface ConfigUpdateEvent {
  projectId: string
  configKey: string
  version: number
  updatedAt: Date
}

// In-memory store for active SSE connections
// In production, use Redis or similar for distributed systems
const activeConnections = new Map<string, Set<(event: ConfigUpdateEvent) => void>>()

/**
 * Register a callback for config updates for a project
 */
export function subscribeToConfigUpdates(
  projectId: string,
  callback: (event: ConfigUpdateEvent) => void
): () => void {
  if (!activeConnections.has(projectId)) {
    activeConnections.set(projectId, new Set())
  }

  const callbacks = activeConnections.get(projectId)!
  callbacks.add(callback)

  // Return unsubscribe function
  return () => {
    callbacks.delete(callback)
    if (callbacks.size === 0) {
      activeConnections.delete(projectId)
    }
  }
}

/**
 * Broadcast config update to all subscribers
 */
export function broadcastConfigUpdate(event: ConfigUpdateEvent) {
  const callbacks = activeConnections.get(event.projectId)
  if (callbacks) {
    callbacks.forEach(callback => {
      try {
        callback(event)
      } catch (error) {
        console.error('Error broadcasting config update:', error)
      }
    })
  }
}

/**
 * Get number of active subscribers for a project
 */
export function getSubscriberCount(projectId: string): number {
  return activeConnections.get(projectId)?.size || 0
}

