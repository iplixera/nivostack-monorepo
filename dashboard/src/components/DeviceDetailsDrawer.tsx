'use client'

import React, { useState, useEffect, useCallback, memo } from 'react'
import { Drawer } from '@/components/ui/Drawer'
import { Badge } from '@/components/ui/Badge'
import { DebugSwitch } from '@/components/ui/DataTable'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'

interface Device {
  id: string
  deviceId: string
  platform: string
  osVersion: string | null
  appVersion: string | null
  model: string | null
  manufacturer: string | null
  lastSeenAt: string
  createdAt: string
  debugModeEnabled: boolean
  debugModeEnabledAt: string | null
  debugModeExpiresAt: string | null
  debugModeEnabledBy: string | null
  userEmail: string | null
  userName: string | null
  deviceCode: string | null
  metadata?: Record<string, unknown>
}

interface RecentActivity {
  traces: Array<{
    id: string
    url: string
    method: string
    statusCode: number
    duration: number
    timestamp: string
  }>
  logs: Array<{
    id: string
    level: string
    message: string
    timestamp: string
  }>
  crashes: Array<{
    id: string
    message: string
    timestamp: string
  }>
  sessions: Array<{
    id: string
    startedAt: string
    endedAt: string | null
    isActive: boolean
  }>
}

interface DeviceDetailsDrawerProps {
  device: Device | null
  open: boolean
  onClose: () => void
  token: string
  onToggleDebug?: (deviceId: string, enabled: boolean) => void
  onOpenTraces?: () => void
  onOpenLogs?: () => void
  onOpenCrashes?: () => void
}

type ActivityTab = 'traces' | 'logs' | 'crashes' | 'sessions'

/**
 * Device Details Drawer
 * Shows device metadata, debug controls, and recent activity
 */
export const DeviceDetailsDrawer = memo(function DeviceDetailsDrawer({
  device,
  open,
  onClose,
  token,
  onToggleDebug,
  onOpenTraces,
  onOpenLogs,
  onOpenCrashes,
}: DeviceDetailsDrawerProps) {
  const [activeTab, setActiveTab] = useState<ActivityTab>('traces')
  const [activity, setActivity] = useState<RecentActivity | null>(null)
  const [loading, setLoading] = useState(false)

  // Fetch recent activity for the device
  const fetchActivity = useCallback(async () => {
    if (!device || !token) return

    try {
      setLoading(true)
      // Fetch recent traces
      const tracesRes = await fetch(
        `/api/traces?deviceId=${device.id}&limit=10`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const tracesData = tracesRes.ok ? await tracesRes.json() : { traces: [] }

      // Fetch recent logs
      const logsRes = await fetch(
        `/api/logs?deviceId=${device.id}&limit=10`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const logsData = logsRes.ok ? await logsRes.json() : { logs: [] }

      // Fetch recent crashes
      const crashesRes = await fetch(
        `/api/crashes?deviceId=${device.id}&limit=10`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const crashesData = crashesRes.ok ? await crashesRes.json() : { crashes: [] }

      // Fetch recent sessions
      const sessionsRes = await fetch(
        `/api/sessions?deviceId=${device.id}&limit=10`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const sessionsData = sessionsRes.ok ? await sessionsRes.json() : { sessions: [] }

      setActivity({
        traces: tracesData.traces || [],
        logs: logsData.logs || [],
        crashes: crashesData.crashes || [],
        sessions: sessionsData.sessions || [],
      })
    } catch (error) {
      console.error('Failed to fetch device activity:', error)
    } finally {
      setLoading(false)
    }
  }, [device, token])

  useEffect(() => {
    if (open && device) {
      fetchActivity()
    }
  }, [open, device, fetchActivity])

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  const getPlatformBadge = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'ios':
        return <Badge>iOS</Badge>
      case 'android':
        return <Badge>Android</Badge>
      case 'web':
        return <Badge>Web</Badge>
      default:
        return <Badge>{platform}</Badge>
    }
  }

  const getStatusBadge = (statusCode: number) => {
    if (statusCode >= 500) return <Badge variant="error">{statusCode}</Badge>
    if (statusCode >= 400) return <Badge variant="warn">{statusCode}</Badge>
    return <Badge variant="ok">{statusCode}</Badge>
  }

  const getLogLevelBadge = (level: string) => {
    switch (level) {
      case 'error':
        return <Badge variant="error">ERROR</Badge>
      case 'warn':
        return <Badge variant="warn">WARN</Badge>
      case 'info':
        return <Badge variant="ok">INFO</Badge>
      default:
        return <Badge>{level.toUpperCase()}</Badge>
    }
  }

  if (!device) return null

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={device.deviceCode || device.deviceId.substring(0, 12)}
      subtitle={`${device.platform} • ${device.model || 'Unknown model'}`}
      width="lg"
      actions={
        <div className="flex items-center gap-3">
          <DebugSwitch
            enabled={device.debugModeEnabled}
            onClick={() => onToggleDebug?.(device.id, !device.debugModeEnabled)}
          />
          {device.debugModeEnabled && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400">
              Debug enabled
            </span>
          )}
        </div>
      }
    >
      <div className="space-y-5">
        {/* Device Info */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">Device Information</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10">
              <div className="text-xs text-gray-500 dark:text-gray-400">Platform</div>
              <div className="mt-1 flex items-center gap-2">
                {getPlatformBadge(device.platform)}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10">
              <div className="text-xs text-gray-500 dark:text-gray-400">OS Version</div>
              <div className="mt-1 text-sm font-mono text-gray-900 dark:text-white">
                {device.osVersion || 'Unknown'}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10">
              <div className="text-xs text-gray-500 dark:text-gray-400">App Version</div>
              <div className="mt-1 text-sm font-mono text-gray-900 dark:text-white">
                {device.appVersion || 'Unknown'}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10">
              <div className="text-xs text-gray-500 dark:text-gray-400">Model</div>
              <div className="mt-1 text-sm text-gray-900 dark:text-white">
                {device.model || 'Unknown'}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10">
              <div className="text-xs text-gray-500 dark:text-gray-400">First Seen</div>
              <div className="mt-1 text-sm text-gray-900 dark:text-white">
                {formatTimestamp(device.createdAt)}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10">
              <div className="text-xs text-gray-500 dark:text-gray-400">Last Seen</div>
              <div className="mt-1 text-sm text-gray-900 dark:text-white">
                {formatRelativeTime(device.lastSeenAt)}
              </div>
            </div>
          </div>

          {/* User Info (if available) */}
          {(device.userEmail || device.userName) && (
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
              <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">Associated User</div>
              <div className="mt-1 text-sm text-gray-900 dark:text-white">
                {device.userName || 'Unknown'} {device.userEmail && `(${device.userEmail})`}
              </div>
            </div>
          )}
        </div>

        {/* Recent Activity Tabs */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">Recent Activity</h4>

          {/* Tab Bar */}
          <div className="flex gap-1 p-1 rounded-xl bg-gray-100 dark:bg-white/[0.05]">
            {(['traces', 'logs', 'crashes', 'sessions'] as ActivityTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors
                  ${activeTab === tab
                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }
                `}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {activity && (
                  <span className="ml-1 text-gray-400 dark:text-gray-500">
                    ({activity[tab].length})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[200px] rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02]">
            {loading ? (
              <div className="flex items-center justify-center h-48 text-sm text-gray-400 dark:text-gray-500">
                Loading...
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-white/10">
                {activeTab === 'traces' && (
                  activity?.traces.length ? (
                    activity.traces.map((trace) => (
                      <div key={trace.id} className="p-3 hover:bg-gray-100 dark:hover:bg-white/[0.03] transition-colors">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-medium">{trace.method}</span>
                          {getStatusBadge(trace.statusCode)}
                          <span className="text-xs text-gray-500 dark:text-gray-400">{trace.duration}ms</span>
                        </div>
                        <div className="mt-1 text-xs font-mono text-gray-600 dark:text-gray-300 truncate">
                          {trace.url}
                        </div>
                        <div className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                          {formatRelativeTime(trace.timestamp)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-48 text-sm text-gray-400 dark:text-gray-500">
                      No traces found
                    </div>
                  )
                )}

                {activeTab === 'logs' && (
                  activity?.logs.length ? (
                    activity.logs.map((log) => (
                      <div key={log.id} className="p-3 hover:bg-gray-100 dark:hover:bg-white/[0.03] transition-colors">
                        <div className="flex items-center gap-2">
                          {getLogLevelBadge(log.level)}
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {formatRelativeTime(log.timestamp)}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                          {log.message}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-48 text-sm text-gray-400 dark:text-gray-500">
                      No logs found
                    </div>
                  )
                )}

                {activeTab === 'crashes' && (
                  activity?.crashes.length ? (
                    activity.crashes.map((crash) => (
                      <div key={crash.id} className="p-3 hover:bg-gray-100 dark:hover:bg-white/[0.03] transition-colors">
                        <div className="flex items-center gap-2">
                          <Badge variant="error">Crash</Badge>
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {formatRelativeTime(crash.timestamp)}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                          {crash.message}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-48 text-sm text-gray-400 dark:text-gray-500">
                      No crashes found
                    </div>
                  )
                )}

                {activeTab === 'sessions' && (
                  activity?.sessions.length ? (
                    activity.sessions.map((session) => (
                      <div key={session.id} className="p-3 hover:bg-gray-100 dark:hover:bg-white/[0.03] transition-colors">
                        <div className="flex items-center gap-2">
                          {session.isActive ? (
                            <Badge variant="ok">Active</Badge>
                          ) : (
                            <Badge>Ended</Badge>
                          )}
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {formatRelativeTime(session.startedAt)}
                          </span>
                        </div>
                        <div className="mt-1 text-xs font-mono text-gray-500 dark:text-gray-400">
                          {session.id.substring(0, 8)}...
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-48 text-sm text-gray-400 dark:text-gray-500">
                      No sessions found
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* View All Button */}
          <div className="flex gap-2">
            {activeTab === 'traces' && onOpenTraces && (
              <button
                onClick={onOpenTraces}
                className="flex-1 px-3 py-2 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
              >
                View all traces →
              </button>
            )}
            {activeTab === 'logs' && onOpenLogs && (
              <button
                onClick={onOpenLogs}
                className="flex-1 px-3 py-2 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
              >
                View all logs →
              </button>
            )}
            {activeTab === 'crashes' && onOpenCrashes && (
              <button
                onClick={onOpenCrashes}
                className="flex-1 px-3 py-2 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
              >
                View all crashes →
              </button>
            )}
          </div>
        </div>
      </div>
    </Drawer>
  )
})

export default DeviceDetailsDrawer
