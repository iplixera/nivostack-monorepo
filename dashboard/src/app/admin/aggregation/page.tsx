'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/components/AuthProvider'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
// Icons replaced with text/symbols
import { api } from '@/lib/api'

interface QueueStatus {
  waiting: number
  active: number
  completed: number
  failed: number
  delayed: number
  prioritized: number
}

interface AggregationState {
  projectId: string
  projectName: string
  lastHourlyAggregation?: string
  lastDailyAggregation?: string
  isAggregating: boolean
}

interface SystemHealth {
  redisConnected: boolean
  databaseConnected: boolean
  workerRunning: boolean
  lastHeartbeat?: string
}

export default function AdminAggregationPage() {
  const { token } = useAuth()
  const [loading, setLoading] = useState(true)
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null)
  const [aggregationStates, setAggregationStates] = useState<AggregationState[]>([])
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null)
  const [triggeringAggregation, setTriggeringAggregation] = useState(false)

  const fetchQueueStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/aggregation/queue-status', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setQueueStatus(data)
      }
    } catch (error) {
      console.error('Failed to fetch queue status:', error)
    }
  }, [token])

  const fetchAggregationStates = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/aggregation/states', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setAggregationStates(data.states)
      }
    } catch (error) {
      console.error('Failed to fetch aggregation states:', error)
    }
  }, [token])

  const fetchSystemHealth = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/aggregation/health', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setSystemHealth(data)
      }
    } catch (error) {
      console.error('Failed to fetch system health:', error)
    }
  }, [token])

  const triggerHourlyAggregation = useCallback(async () => {
    setTriggeringAggregation(true)
    try {
      const response = await fetch('/api/cron/hourly-aggregation', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        // Refresh queue status after a delay
        setTimeout(fetchQueueStatus, 2000)
      }
    } catch (error) {
      console.error('Failed to trigger hourly aggregation:', error)
    } finally {
      setTriggeringAggregation(false)
    }
  }, [token, fetchQueueStatus])

  const triggerDailyAggregation = useCallback(async () => {
    setTriggeringAggregation(true)
    try {
      const response = await fetch('/api/cron/daily-aggregation', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        // Refresh queue status after a delay
        setTimeout(fetchQueueStatus, 2000)
      }
    } catch (error) {
      console.error('Failed to trigger daily aggregation:', error)
    } finally {
      setTriggeringAggregation(false)
    }
  }, [token, fetchQueueStatus])

  const refreshAll = useCallback(async () => {
    setLoading(true)
    await Promise.all([
      fetchQueueStatus(),
      fetchAggregationStates(),
      fetchSystemHealth(),
    ])
    setLoading(false)
  }, [fetchQueueStatus, fetchAggregationStates, fetchSystemHealth])

  useEffect(() => {
    if (token) {
      refreshAll()
      // Auto-refresh every 30 seconds
      const interval = setInterval(refreshAll, 30000)
      return () => clearInterval(interval)
    }
  }, [token, refreshAll])

  if (loading && !queueStatus) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Aggregation Admin Dashboard"
          description="Monitor and manage the aggregation system"
          actions={
            <Button onClick={refreshAll} variant="outline" size="sm">
              <span>🔄</span>
              Refresh
            </Button>
          }
        />

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>⚡</span>
              System Health
            </CardTitle>
            <CardDescription>Current status of aggregation system components</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <span>💾</span>
                <span className="text-sm">Database:</span>
                <Badge variant={systemHealth?.databaseConnected ? "default" : "destructive"}>
                  {systemHealth?.databaseConnected ? "Connected" : "Disconnected"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span>⚡</span>
                <span className="text-sm">Redis:</span>
                <Badge variant={systemHealth?.redisConnected ? "default" : "destructive"}>
                  {systemHealth?.redisConnected ? "Connected" : "Disconnected"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span>▶️</span>
                <span className="text-sm">Worker:</span>
                <Badge variant={systemHealth?.workerRunning ? "default" : "secondary"}>
                  {systemHealth?.workerRunning ? "Running" : "Stopped"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span>🕐</span>
                <span className="text-sm">Last Heartbeat:</span>
                <span className="text-xs text-muted-foreground">
                  {systemHealth?.lastHeartbeat ? new Date(systemHealth.lastHeartbeat).toLocaleString() : 'Never'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Queue Status */}
        <Card>
          <CardHeader>
            <CardTitle>Queue Status</CardTitle>
            <CardDescription>Current state of the aggregation job queue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{queueStatus?.waiting || 0}</div>
                <div className="text-sm text-muted-foreground">Waiting</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{queueStatus?.active || 0}</div>
                <div className="text-sm text-muted-foreground">Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{queueStatus?.completed || 0}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{queueStatus?.failed || 0}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{queueStatus?.delayed || 0}</div>
                <div className="text-sm text-muted-foreground">Delayed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{queueStatus?.prioritized || 0}</div>
                <div className="text-sm text-muted-foreground">Prioritized</div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={triggerHourlyAggregation}
                disabled={triggeringAggregation}
                size="sm"
              >
                {triggeringAggregation ? (
                  <span>🔄</span>
                ) : (
                  <span>▶️</span>
                )}
                Trigger Hourly
              </Button>
              <Button
                onClick={triggerDailyAggregation}
                disabled={triggeringAggregation}
                variant="outline"
                size="sm"
              >
                {triggeringAggregation ? (
                  <span>🔄</span>
                ) : (
                  <span>▶️</span>
                )}
                Trigger Daily
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Aggregation States */}
        <Card>
          <CardHeader>
            <CardTitle>Project Aggregation States</CardTitle>
            <CardDescription>Last aggregation times and current status for each project</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {aggregationStates.map((state) => (
                <div key={state.projectId} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">{state.projectName}</div>
                    <div className="text-sm text-muted-foreground">
                      Last Hourly: {state.lastHourlyAggregation ?
                        new Date(state.lastHourlyAggregation).toLocaleString() : 'Never'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Last Daily: {state.lastDailyAggregation ?
                        new Date(state.lastDailyAggregation).toLocaleString() : 'Never'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {state.isAggregating ? (
                      <Badge variant="secondary">
                        <span>🔄</span>
                        Aggregating
                      </Badge>
                    ) : (
                      <Badge variant="default">
                        <span>✅</span>
                        Ready
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              {aggregationStates.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  No projects found or aggregation states not available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="justify-start">
                <span>💾</span>
                View Raw Data
              </Button>
              <Button variant="outline" className="justify-start">
                <span>⚡</span>
                View Worker Logs
              </Button>
              <Button variant="outline" className="justify-start">
                <span>⚠️</span>
                Clear Failed Jobs
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
