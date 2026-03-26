'use client'

import React, { useState, useEffect, useCallback, memo } from 'react'
import {
  Card,
  CardHeader,
  CardBody,
  KPICard,
  Badge,
  FilterBar,
  FilterInput,
  FilterSelect,
  FilterButton,
  DataTable,
  Drawer,
} from '@/components/ui'
import { useQueryState, useQueryStateBoolean } from '@/hooks/useQueryState'

type Mode = 'overview' | 'inspect'
type TimeRange = 'last_15m' | 'last_1h' | 'last_24h' | 'last_7d' | 'last_30d'
type EventType = 'traces' | 'logs' | 'crashes' | 'sessions'

interface DashboardStats {
  kpis: {
    activeDevices: number
    sessions: number
    apiRequests: number
    errorRate: number
    crashFreeRate: number
    crashRate: string
    p95Latency: number
  }
  topIssues: Array<{
    type: 'crash' | 'error' | 'slow'
    title: string
    subtitle: string
    timestamp: string
  }>
  breakdown: {
    platform: Array<{
      label: string
      value: string
      count: number
    }>
  }
  timeRange: string
  timestamp: string
}

interface RecentTrace {
  id: string
  url: string
  method: string
  statusCode: number
  duration: number
  timestamp: string
  screenName?: string
  requestHeaders?: string
  requestBody?: string
  responseHeaders?: string
  responseBody?: string
  device?: {
    deviceId: string
    platform: string
    model: string
  }
}

interface ActiveFilter {
  key: string
  label: string
  value: string
}

interface DashboardTabProps {
  projectId: string
  projectName: string
  token: string
  environment?: string
  onDrilldown?: (filters: Record<string, string>) => void
}

/**
 * Dashboard Tab Component (v3)
 * - Overview mode: KPIs, charts, top issues (aggregated trends)
 * - Inspect mode: Raw event stream with row details drawer (investigation)
 * - Single control bar: Environment, Time Range, Mode Toggle
 * - No duplicate controls
 */
export const DashboardTab = memo(function DashboardTab({
  projectId,
  projectName,
  token,
  environment = 'Production',
  onDrilldown,
}: DashboardTabProps) {
  // URL-driven filter state (v5: shareable views)
  const [mode, setMode] = useQueryState('mode', 'overview')
  const [timeRange, setTimeRange] = useQueryState('range', 'last_24h')
  const [selectedEnv, setSelectedEnv] = useQueryState('env', environment)
  const [eventType, setEventType] = useQueryState('type', 'traces')
  const [rawSearch, setRawSearch] = useQueryState('q', '')
  const [autoRefresh, setAutoRefresh] = useQueryStateBoolean('auto', false)

  // Local-only state (not URL-driven)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentTraces, setRecentTraces] = useState<RecentTrace[]>([])
  const [loading, setLoading] = useState(true)
  const [pinnedDeviceId, setPinnedDeviceId] = useState<string | null>(null)
  const [selectedTrace, setSelectedTrace] = useState<RecentTrace | null>(null)

  // Active filters for chips
  const activeFilters: ActiveFilter[] = [
    ...(pinnedDeviceId ? [{ key: 'device', label: 'Device', value: pinnedDeviceId.slice(0, 8) + '...' }] : []),
    ...(rawSearch ? [{ key: 'search', label: 'Search', value: rawSearch }] : []),
  ]

  // Type guards for URL params
  const isValidMode = (m: string): m is Mode => m === 'overview' || m === 'inspect'
  const isValidTimeRange = (r: string): r is TimeRange =>
    ['last_15m', 'last_1h', 'last_24h', 'last_7d', 'last_30d'].includes(r)
  const isValidEventType = (t: string): t is EventType =>
    ['traces', 'logs', 'crashes', 'sessions'].includes(t)

  // Coerce URL params to valid types with fallbacks
  const currentMode: Mode = isValidMode(mode) ? mode : 'overview'
  const currentTimeRange: TimeRange = isValidTimeRange(timeRange) ? timeRange : 'last_24h'
  const currentEventType: EventType = isValidEventType(eventType) ? eventType : 'traces'

  // Fetch dashboard stats for overview mode
  const fetchStats = useCallback(async () => {
    if (!projectId || !token) return

    try {
      setLoading(true)
      const response = await fetch(
        `/api/stats/dashboard?projectId=${projectId}&timeRange=${currentTimeRange}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }, [projectId, token, currentTimeRange])

  // Fetch recent traces for inspect mode
  const fetchRecentTraces = useCallback(async () => {
    if (!projectId || !token) return

    try {
      setLoading(true)
      const params = new URLSearchParams({
        projectId,
        limit: '100',
      })
      if (pinnedDeviceId) params.append('deviceId', pinnedDeviceId)
      if (rawSearch) params.append('search', rawSearch)

      const response = await fetch(`/api/traces?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setRecentTraces(data.traces || [])
      }
    } catch (error) {
      console.error('Failed to fetch recent traces:', error)
    } finally {
      setLoading(false)
    }
  }, [projectId, token, pinnedDeviceId, rawSearch])

  useEffect(() => {
    if (currentMode === 'overview') {
      fetchStats()
    } else {
      fetchRecentTraces()
    }
  }, [currentMode, fetchStats, fetchRecentTraces])

  // Auto-refresh for inspect mode
  useEffect(() => {
    if (currentMode === 'inspect' && autoRefresh) {
      const interval = setInterval(fetchRecentTraces, 5000)
      return () => clearInterval(interval)
    }
  }, [currentMode, autoRefresh, fetchRecentTraces])

  const timeRangeOptions = [
    { value: 'last_15m', label: '15m' },
    { value: 'last_1h', label: '1h' },
    { value: 'last_24h', label: '24h' },
    { value: 'last_7d', label: '7d' },
    { value: 'last_30d', label: '30d' },
  ]

  // Environment filter options (static - environment field not in schema yet)
  const envOptions = [
    { value: '', label: 'All envs' },
    { value: 'production', label: 'Production' },
    { value: 'staging', label: 'Staging' },
    { value: 'development', label: 'Development' },
  ]

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toLocaleString()
  }

  const getStatusBadge = (statusCode: number) => {
    if (statusCode >= 500) return <Badge variant="error">{statusCode}</Badge>
    if (statusCode >= 400) return <Badge variant="warn">{statusCode}</Badge>
    if (statusCode >= 200 && statusCode < 300) return <Badge variant="ok">{statusCode}</Badge>
    return <Badge>{statusCode}</Badge>
  }

  const getIssueBadge = (type: 'crash' | 'error' | 'slow') => {
    switch (type) {
      case 'crash':
        return <Badge variant="error">Crash</Badge>
      case 'error':
        return <Badge variant="error">HTTP Error</Badge>
      case 'slow':
        return <Badge variant="warn">Slow</Badge>
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)

    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return date.toLocaleDateString()
  }

  const removeFilter = (key: string) => {
    if (key === 'device') setPinnedDeviceId(null)
    if (key === 'search') setRawSearch('')
  }

  const clearAllFilters = () => {
    setPinnedDeviceId(null)
    setRawSearch('')
  }

  // Trace table columns
  const traceColumns = [
    {
      key: 'method',
      header: 'Method',
      width: '80px',
      render: (trace: RecentTrace) => (
        <span className="font-mono text-xs font-medium">{trace.method}</span>
      ),
    },
    {
      key: 'url',
      header: 'Endpoint',
      render: (trace: RecentTrace) => {
        try {
          const url = new URL(trace.url)
          return <span className="font-mono text-xs truncate max-w-xs">{url.pathname}</span>
        } catch {
          return <span className="font-mono text-xs truncate max-w-xs">{trace.url}</span>
        }
      },
    },
    {
      key: 'statusCode',
      header: 'Status',
      width: '80px',
      render: (trace: RecentTrace) => getStatusBadge(trace.statusCode),
    },
    {
      key: 'duration',
      header: 'Duration',
      width: '90px',
      render: (trace: RecentTrace) => (
        <span className={`text-xs ${trace.duration > 1000 ? 'text-amber-600 dark:text-amber-400' : ''}`}>
          {trace.duration}ms
        </span>
      ),
    },
    {
      key: 'screenName',
      header: 'Screen',
      render: (trace: RecentTrace) => (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {trace.screenName || '-'}
        </span>
      ),
    },
    {
      key: 'device',
      header: 'Device',
      render: (trace: RecentTrace) => (
        <span className="text-xs">
          {trace.device?.platform || '-'} {trace.device?.model ? `• ${trace.device.model}` : ''}
        </span>
      ),
    },
    {
      key: 'timestamp',
      header: 'Time',
      width: '90px',
      render: (trace: RecentTrace) => (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {formatTimestamp(trace.timestamp)}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      {/* Page Title (minimal) */}
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
          Dashboard
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          System health and investigation console
        </p>
      </div>

      {/* Unified Control Bar - ONE place for all primary controls */}
      <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02]">
        {/* Environment */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">Env</span>
          <select
            value={selectedEnv}
            onChange={(e) => setSelectedEnv(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.04] text-gray-900 dark:text-white"
          >
            {envOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-white dark:bg-gray-800">
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Time Range */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">Time</span>
          <div className="flex rounded-lg border border-gray-200 dark:border-white/10 overflow-hidden">
            {timeRangeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTimeRange(opt.value)}
                className={`px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  currentTimeRange === opt.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-white/[0.04] text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.08]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Mode Toggle - v4: Use blue active state, not black */}
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <button
            onClick={() => setMode('overview')}
            className={`px-4 py-1.5 text-xs font-medium transition-colors ${
              currentMode === 'overview'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setMode('inspect')}
            className={`px-4 py-1.5 text-xs font-medium transition-colors ${
              currentMode === 'inspect'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            Inspect
          </button>
        </div>
      </div>

      {/* Overview Mode (Aggregated) */}
      {currentMode === 'overview' && (
        <div className="space-y-4">
          {/* KPI Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KPICard
              title="Active devices"
              value={stats?.kpis.activeDevices || 0}
              subtitle="distinct"
              badge={timeRangeOptions.find(o => o.value === currentTimeRange)?.label}
              span={1}
              onClick={() => onDrilldown?.({ tab: 'devices', env: selectedEnv, range: currentTimeRange })}
            />
            <KPICard
              title="Sessions"
              value={formatNumber(stats?.kpis.sessions || 0)}
              subtitle="total"
              badge={timeRangeOptions.find(o => o.value === currentTimeRange)?.label}
              span={1}
            />
            <KPICard
              title="API requests"
              value={formatNumber(stats?.kpis.apiRequests || 0)}
              subtitle="traces"
              badge={timeRangeOptions.find(o => o.value === currentTimeRange)?.label}
              span={1}
              onClick={() => onDrilldown?.({ tab: 'traces', env: selectedEnv, range: currentTimeRange })}
            />
            <KPICard
              title="Crash-free"
              value={stats?.kpis.sessions === 0 ? '—' : `${stats?.kpis.crashFreeRate || 100}%`}
              subtitle={stats?.kpis.sessions === 0 ? 'No sessions' : 'of sessions'}
              badge={stats?.kpis.sessions === 0 ? 'N/A' : (parseFloat(stats?.kpis.crashRate || '0') > 1 ? `${stats?.kpis.crashRate}% crash` : 'Healthy')}
              badgeVariant={stats?.kpis.sessions === 0 ? 'default' : (parseFloat(stats?.kpis.crashRate || '0') > 1 ? 'error' : 'ok')}
              span={1}
            />
          </div>

          {/* Charts + Issues Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Main Chart */}
            <Card className="lg:col-span-2">
              <CardHeader
                title="Requests & errors over time"
                badge={
                  <div className="flex gap-2">
                    <Badge>P95: {stats?.kpis.p95Latency || 0}ms</Badge>
                    <Badge variant={stats?.kpis.errorRate && stats.kpis.errorRate > 2 ? 'error' : 'default'}>
                      5xx: {stats?.kpis.errorRate || 0}%
                    </Badge>
                  </div>
                }
              />
              <CardBody>
                <div className="h-64 flex items-center justify-center border border-dashed border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-white/[0.01]">
                  <div className="text-center">
                    <div className="text-sm text-gray-400 dark:text-gray-500 mb-2">
                      Time series chart
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      Click any point to drill down into raw traces
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Top Issues */}
            <Card>
              <CardHeader title="Top issues" badge={<Badge>{timeRangeOptions.find(o => o.value === currentTimeRange)?.label}</Badge>} />
              <CardBody>
                <div className="space-y-2">
                  {stats?.topIssues && stats.topIssues.length > 0 ? (
                    stats.topIssues.map((issue, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02] hover:bg-gray-100 dark:hover:bg-white/[0.04] cursor-pointer transition-colors"
                        onClick={() =>
                          onDrilldown?.({
                            tab: issue.type === 'crash' ? 'crashes' : 'traces',
                            env: selectedEnv,
                            range: currentTimeRange,
                          })
                        }
                      >
                        {getIssueBadge(issue.type)}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {issue.title}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {issue.subtitle}
                          </div>
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                          {formatTimestamp(issue.timestamp)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-sm text-gray-400 dark:text-gray-500">
                      No issues detected
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {/* Inspect Mode (Raw Investigation) */}
      {currentMode === 'inspect' && (
        <div className="space-y-3">
          {/* Inspect Filters */}
          <FilterBar>
            <FilterInput
              label="Search"
              value={rawSearch}
              onChange={setRawSearch}
              placeholder="deviceId / sessionId / endpoint"
              width="200px"
            />
            <FilterSelect
              label="Type"
              value={currentEventType}
              onChange={(v) => setEventType(v)}
              options={[
                { value: 'traces', label: 'Traces' },
                { value: 'logs', label: 'Logs' },
                { value: 'crashes', label: 'Crashes' },
                { value: 'sessions', label: 'Sessions' },
              ]}
            />
            <FilterButton onClick={fetchRecentTraces}>
              Refresh
            </FilterButton>
            <FilterButton
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? '⏸ Stop' : '▶ Auto'}
            </FilterButton>
          </FilterBar>

          {/* Active Filter Chips */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {activeFilters.map((filter) => (
                <span
                  key={filter.key}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs"
                >
                  <span className="text-blue-600 dark:text-blue-400">{filter.label}:</span>
                  {filter.value}
                  <button
                    onClick={() => removeFilter(filter.key)}
                    className="ml-0.5 p-0.5 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
              <button
                onClick={clearAllFilters}
                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Raw Events Table */}
          <Card>
            <CardHeader
              title="Live event stream"
              badge={
                <div className="flex gap-2">
                  <Badge variant={autoRefresh ? 'ok' : 'default'}>
                    {autoRefresh ? 'Auto-refresh ON' : 'Manual refresh'}
                  </Badge>
                  <Badge>{recentTraces.length} events</Badge>
                </div>
              }
            />
            <CardBody>
              <DataTable
                columns={traceColumns}
                data={recentTraces}
                keyExtractor={(trace) => trace.id}
                onRowClick={(trace) => setSelectedTrace(trace)}
                emptyMessage="No events found. Adjust filters or wait for new data."
                maxHeight="500px"
              />
            </CardBody>
          </Card>

          {/* Row Details Drawer */}
          <Drawer
            open={!!selectedTrace}
            onClose={() => setSelectedTrace(null)}
            title={selectedTrace?.method + ' ' + (selectedTrace?.url ? new URL(selectedTrace.url).pathname : '')}
            subtitle={selectedTrace ? `${selectedTrace.statusCode} • ${selectedTrace.duration}ms` : ''}
            width="lg"
            actions={
              selectedTrace?.device?.deviceId && (
                <button
                  onClick={() => {
                    setPinnedDeviceId(selectedTrace.device!.deviceId)
                    setSelectedTrace(null)
                  }}
                  className="px-3 py-1.5 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  Pin this device
                </button>
              )
            }
          >
            {selectedTrace && (
              <div className="space-y-4">
                {/* Metadata */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</div>
                    <div>{getStatusBadge(selectedTrace.statusCode)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Duration</div>
                    <div className="text-sm font-medium">{selectedTrace.duration}ms</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Screen</div>
                    <div className="text-sm">{selectedTrace.screenName || '-'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Time</div>
                    <div className="text-sm">{new Date(selectedTrace.timestamp).toLocaleString()}</div>
                  </div>
                </div>

                {/* Device Info */}
                {selectedTrace.device && (
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10">
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Device</div>
                    <div className="space-y-1">
                      <div className="text-sm">
                        <span className="text-gray-500">Platform:</span> {selectedTrace.device.platform}
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">Model:</span> {selectedTrace.device.model || '-'}
                      </div>
                      <div className="text-sm font-mono text-xs">
                        <span className="text-gray-500">ID:</span> {selectedTrace.device.deviceId}
                      </div>
                    </div>
                  </div>
                )}

                {/* URL */}
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Full URL</div>
                  <div className="text-xs font-mono p-2 rounded bg-gray-100 dark:bg-white/[0.05] break-all">
                    {selectedTrace.url}
                  </div>
                </div>

                {/* Request/Response (if available) */}
                {selectedTrace.requestHeaders && (
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Request Headers</div>
                    <pre className="text-xs font-mono p-2 rounded bg-gray-100 dark:bg-white/[0.05] overflow-auto max-h-32">
                      {selectedTrace.requestHeaders}
                    </pre>
                  </div>
                )}

                {selectedTrace.responseBody && (
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Response Body</div>
                    <pre className="text-xs font-mono p-2 rounded bg-gray-100 dark:bg-white/[0.05] overflow-auto max-h-48">
                      {selectedTrace.responseBody}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </Drawer>
        </div>
      )}
    </div>
  )
})

export default DashboardTab
