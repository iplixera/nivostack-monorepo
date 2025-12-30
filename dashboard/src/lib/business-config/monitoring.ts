/**
 * Config Monitoring and Alerting Engine
 * Evaluates alert conditions and triggers alerts
 */

import { prisma } from '@/lib/prisma'

export interface AlertCondition {
  condition: 'error_rate' | 'fetch_rate' | 'usage_drop' | 'validation_failure'
  threshold: number
  operator: '>' | '<' | '>=' | '<=' | '=='
  timeWindow: number // Minutes
  minOccurrences: number
}

/**
 * Evaluate alert conditions for a config
 */
export async function evaluateConfigAlerts(
  projectId: string,
  configId: string | null
): Promise<void> {
  // Get enabled alerts for this project/config
  const alerts = await prisma.configAlert.findMany({
    where: {
      projectId,
      configId: configId || null,
      enabled: true
    }
  })

  for (const alert of alerts) {
    try {
      const shouldTrigger = await checkAlertCondition(alert, projectId, configId)
      
      if (shouldTrigger) {
        await triggerAlert(alert, projectId, configId)
      }
    } catch (error) {
      console.error(`Error evaluating alert ${alert.id}:`, error)
    }
  }
}

/**
 * Check if alert condition is met
 */
async function checkAlertCondition(
  alert: any,
  projectId: string,
  configId: string | null
): Promise<boolean> {
  const now = new Date()
  const windowStart = new Date(now.getTime() - alert.timeWindow * 60 * 1000)

  // TODO: ConfigUsageMetric model needs to be added to Prisma schema
  return false
  
  /* COMMENTED OUT UNTIL CONFIGUSAGEMETRIC MODEL IS ADDED
  switch (alert.condition) {
    case 'error_rate':
      // Check validation failures or fetch errors
      const errorCount = await prisma.configUsageMetric.count({
        where: {
          projectId,
          configId: configId || undefined,
          fetchedAt: { gte: windowStart },
          // Assuming we track errors in a separate field or via ConfigFetchLog
          // This is a simplified version
        }
      })
      
      const totalFetches = await prisma.configUsageMetric.count({
        where: {
          projectId,
          configId: configId || undefined,
          fetchedAt: { gte: windowStart }
        }
      })

      const errorRate = totalFetches > 0 ? (errorCount / totalFetches) * 100 : 0
      return evaluateThreshold(errorRate, alert.threshold, alert.operator)

    case 'fetch_rate':
      // Check if fetch rate dropped significantly
      const recentFetches = await prisma.configUsageMetric.count({
        where: {
          projectId,
          configId: configId || undefined,
          fetchedAt: { gte: windowStart }
        }
      })

      // Compare with previous window
      const previousWindowStart = new Date(windowStart.getTime() - alert.timeWindow * 60 * 1000)
      const previousFetches = await prisma.configUsageMetric.count({
        where: {
          projectId,
          configId: configId || undefined,
          fetchedAt: { gte: previousWindowStart, lt: windowStart }
        }
      })

      const dropPercentage = previousFetches > 0
        ? ((previousFetches - recentFetches) / previousFetches) * 100
        : 0

      return evaluateThreshold(dropPercentage, alert.threshold, alert.operator)

    case 'usage_drop':
      // Similar to fetch_rate but more specific
      return await checkAlertCondition(
        { ...alert, condition: 'fetch_rate' },
        projectId,
        configId
      )

    case 'validation_failure':
      // Check validation failures (would need to track these separately)
      // For now, return false as this requires additional tracking
      return false

    default:
      return false
  }
  */
}

/**
 * Evaluate threshold comparison
 */
function evaluateThreshold(
  value: number,
  threshold: number,
  operator: string
): boolean {
  switch (operator) {
    case '>':
      return value > threshold
    case '<':
      return value < threshold
    case '>=':
      return value >= threshold
    case '<=':
      return value <= threshold
    case '==':
      return Math.abs(value - threshold) < 0.01
    default:
      return false
  }
}

/**
 * Trigger an alert
 */
async function triggerAlert(
  alert: any,
  projectId: string,
  configId: string | null
): Promise<void> {
  // Check if alert was recently triggered (prevent spam)
  const recentTrigger = alert.lastTriggered
    ? new Date(alert.lastTriggered.getTime() + 60 * 60 * 1000) // 1 hour cooldown
    : null

  if (recentTrigger && new Date() < recentTrigger) {
    return // Skip if triggered recently
  }

  // Create alert event
  const message = generateAlertMessage(alert, projectId, configId)
  
  await prisma.configAlertEvent.create({
    data: {
      alertId: alert.id,
      projectId,
      configId: configId || null,
      severity: 'warning',
      message,
      metadata: {
        condition: alert.condition,
        threshold: alert.threshold,
        operator: alert.operator
      }
    }
  })

  // Update alert
  await prisma.configAlert.update({
    where: { id: alert.id },
    data: {
      lastTriggered: new Date(),
      triggerCount: alert.triggerCount + 1
    }
  })

  // Send notifications (webhook, email)
  await sendAlertNotifications(alert, message)
}

/**
 * Generate alert message
 */
function generateAlertMessage(
  alert: any,
  projectId: string,
  configId: string | null
): string {
  const configInfo = configId ? `Config ID: ${configId}` : 'All configs'
  return `Alert "${alert.name}" triggered for ${configInfo}. Condition: ${alert.condition} ${alert.operator} ${alert.threshold}`
}

/**
 * Send alert notifications
 */
async function sendAlertNotifications(alert: any, message: string): Promise<void> {
  // Send webhook if configured
  if (alert.webhookUrl) {
    try {
      await fetch(alert.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alert: alert.name,
          message,
          timestamp: new Date().toISOString()
        })
      })
    } catch (error) {
      console.error('Failed to send webhook:', error)
    }
  }

  // Send emails if configured
  if (alert.emailRecipients && Array.isArray(alert.emailRecipients)) {
    // TODO: Integrate with email service
    console.log('Email notification (not implemented):', {
      recipients: alert.emailRecipients,
      message
    })
  }
}

/**
 * Get config metrics for monitoring dashboard
 */
export async function getConfigMetrics(
  projectId: string,
  configId: string | null,
  timeWindow: number = 24 // Hours
) {
  const now = new Date()
  const startTime = new Date(now.getTime() - timeWindow * 60 * 60 * 1000)

  const where: any = {
    projectId,
    fetchedAt: { gte: startTime }
  }

  if (configId) {
    where.configId = configId
  }

  // TODO: ConfigUsageMetric model needs to be added to Prisma schema
  return []
  
  /* COMMENTED OUT UNTIL CONFIGUSAGEMETRIC MODEL IS ADDED
  const metrics = await prisma.configUsageMetric.findMany({
    where,
    select: {
      fetchedAt: true,
      isCached: true,
      matchedTarget: true,
      rolloutReceived: true
    }
  })

  // Calculate statistics
  const totalFetches = metrics.length
  const cacheHits = metrics.filter(m => m.isCached).length
  const targetingMatches = metrics.filter(m => m.matchedTarget).length
  const rolloutReceives = metrics.filter(m => m.rolloutReceived).length

  // Group by hour for time series
  const hourlyData: Record<string, {
    fetches: number
    cacheHits: number
    targetingMatches: number
  }> = {}

  metrics.forEach(m => {
    const hour = new Date(m.fetchedAt).toISOString().substring(0, 13) + ':00:00'
    if (!hourlyData[hour]) {
      hourlyData[hour] = { fetches: 0, cacheHits: 0, targetingMatches: 0 }
    }
    hourlyData[hour].fetches++
    if (m.isCached) hourlyData[hour].cacheHits++
    if (m.matchedTarget) hourlyData[hour].targetingMatches++
  })

  return {
    totalFetches,
    cacheHitRate: totalFetches > 0 ? (cacheHits / totalFetches) * 100 : 0,
    targetingMatchRate: totalFetches > 0 ? (targetingMatches / totalFetches) * 100 : 0,
    rolloutReceiveRate: totalFetches > 0 ? (rolloutReceives / totalFetches) * 100 : 0,
    hourlyData: Object.entries(hourlyData).map(([time, data]) => ({
      time,
      ...data
    }))
  }
  */
}

