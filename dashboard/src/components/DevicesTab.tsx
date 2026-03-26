'use client'

import React, { useState, useEffect, useCallback, memo } from 'react'
import {
  Card,
  CardHeader,
  CardBody,
  KPICard,
  Badge,
  QuotaBanner,
  FilterBar,
  FilterInput,
  FilterSelect,
  FilterButton,
  DataTable,
  DebugSwitch,
  Drawer,
} from '@/components/ui'
import { useQueryState, useQueryStateNumber } from '@/hooks/useQueryState'

type DevicesView = 'list' | 'settings'
type TimeRange = 'last_24h' | 'last_7d' | 'last_30d' | 'all'

interface SegmentOption {
  label: string
  value: string
  count: number
}

interface DeviceStats {
  kpis: {
    totalDevices: number
    activeDevices?: number
    activeDevices24h?: number
    activeDevices7d?: number
    newDevices?: number
    newDevices24h?: number
    newDevices7d?: number
    debugEnabled: number
    iosPlatform?: number
    androidPlatform?: number
    webPlatform?: number
  }
  segmentation?: {
    platform: SegmentOption[]
    osVersion?: SegmentOption[]
    appVersion?: SegmentOption[]
  }
  timeRange: string
  timestamp: string
}

interface Device {
  id: string
  deviceId: string
  platform: string
  osVersion: string | null
  appVersion: string | null
  model: string | null
  manufacturer: string | null
  environment: string | null
  lastSeenAt: string
  createdAt: string
  debugModeEnabled: boolean
  debugModeEnabledAt: string | null
  userEmail: string | null
  userName: string | null
}

interface ActiveFilter {
  key: string
  label: string
  value: string
}

interface DevicesTabProps {
  projectId: string
  projectName: string
  token: string
  environment?: string
  quotaUsed?: number
  quotaLimit?: number
  onUpgrade?: () => void
  onNavigateToTraces?: (deviceId: string) => void
  onNavigateToLogs?: (deviceId: string) => void
  onNavigateToCrashes?: (deviceId: string) => void
}

/**
 * Devices Tab Component (v3)
 * - Table-first registry layout
 * - List | Settings tabs pattern
 * - Clear KPI labels with time context
 * - Standardized filters with active chips
 * - Device drawer with shortcuts to Traces/Logs/Crashes
 */
export const DevicesTab = memo(function DevicesTab({
  projectId,
  projectName,
  token,
  environment = 'Production',
  quotaUsed = 0,
  quotaLimit = 100000,
  onUpgrade,
  onNavigateToTraces,
  onNavigateToLogs,
  onNavigateToCrashes,
}: DevicesTabProps) {
  // URL-driven state (v5: shareable views)
  const [view, setView] = useQueryState('view', 'list')
  const [page, setPage] = useQueryStateNumber('page', 1)
  const [search, setSearch] = useQueryState('q', '')
  const [platformFilter, setPlatformFilter] = useQueryState('platform', '')
  const [debugFilter, setDebugFilter] = useQueryState('debug', '')
  const [envFilter, setEnvFilter] = useQueryState('env', '')

  // Local-only state (not URL-driven)
  const [stats, setStats] = useState<DeviceStats | null>(null)
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const limit = 50

  // Selected device drawer
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)

  // Settings state
  const [trackingScope, setTrackingScope] = useState('all')
  const [retentionDays, setRetentionDays] = useState('90')

  // Type guard for view
  const isValidView = (v: string): v is DevicesView => v === 'list' || v === 'settings'
  const currentView: DevicesView = isValidView(view) ? view : 'list'

  // Active filters for chips
  const activeFilters: ActiveFilter[] = [
    ...(search ? [{ key: 'search', label: 'Search', value: search }] : []),
    ...(platformFilter ? [{ key: 'platform', label: 'Platform', value: platformFilter }] : []),
    ...(debugFilter ? [{ key: 'debug', label: 'Debug', value: debugFilter === 'true' ? 'ON' : 'OFF' }] : []),
    ...(envFilter ? [{ key: 'env', label: 'Environment', value: envFilter }] : []),
  ]

  // Fetch device stats
  const fetchStats = useCallback(async () => {
    if (!projectId || !token) return

    try {
      const response = await fetch(
        `/api/stats/devices?projectId=${projectId}&timeRange=last_24h`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch device stats:', error)
    }
  }, [projectId, token])

  // Fetch devices
  const fetchDevices = useCallback(async () => {
    if (!projectId || !token) return

    try {
      setLoading(true)
      const params = new URLSearchParams({
        projectId,
        page: page.toString(),
        limit: limit.toString(),
      })

      if (search) params.append('search', search)
      if (platformFilter) params.append('platform', platformFilter)
      if (debugFilter) params.append('debugMode', debugFilter)
      if (envFilter) params.append('environment', envFilter)

      const response = await fetch(`/api/devices?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setDevices(data.devices || [])
        setTotal(data.pagination?.total || 0)
      }
    } catch (error) {
      console.error('Failed to fetch devices:', error)
    } finally {
      setLoading(false)
    }
  }, [projectId, token, page, search, platformFilter, debugFilter, envFilter])

  useEffect(() => {
    fetchStats()
    fetchDevices()
  }, [fetchStats, fetchDevices])

  // v5: Data-driven filter options from API stats
  const platformOptions = React.useMemo(() => {
    const options = [{ value: '', label: 'All platforms' }]
    if (stats?.segmentation?.platform) {
      stats.segmentation.platform.forEach((p) => {
        options.push({
          value: p.value,
          label: `${p.label} (${p.count})`,
        })
      })
    } else {
      // Fallback when stats not loaded
      options.push(
        { value: 'ios', label: 'iOS' },
        { value: 'android', label: 'Android' },
        { value: 'web', label: 'Web' }
      )
    }
    return options
  }, [stats?.segmentation?.platform])

  const debugOptions = [
    { value: '', label: 'All' },
    { value: 'true', label: 'Debug ON' },
    { value: 'false', label: 'Debug OFF' },
  ]

  // Environment filter options (static - environment field not in schema yet)
  const envOptions = [
    { value: '', label: 'All envs' },
    { value: 'production', label: 'Production' },
    { value: 'staging', label: 'Staging' },
    { value: 'development', label: 'Development' },
  ]

  const formatTimestamp = (timestamp: string) => {
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

  const removeFilter = (key: string) => {
    if (key === 'search') setSearch('')
    if (key === 'platform') setPlatformFilter('')
    if (key === 'debug') setDebugFilter('')
    if (key === 'env') setEnvFilter('')
    setPage(1)
  }

  const clearAllFilters = () => {
    setSearch('')
    setPlatformFilter('')
    setDebugFilter('')
    setEnvFilter('')
    setPage(1)
  }

  const handleToggleDebug = async (device: Device) => {
    try {
      const response = await fetch(`/api/devices/${device.id}/debug`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled: !device.debugModeEnabled }),
      })
      if (response.ok) {
        fetchDevices()
        if (selectedDevice?.id === device.id) {
          setSelectedDevice({ ...device, debugModeEnabled: !device.debugModeEnabled })
        }
      }
    } catch (error) {
      console.error('Failed to toggle debug mode:', error)
    }
  }

  // Device table columns
  const deviceColumns = [
    {
      key: 'device',
      header: 'Device',
      render: (device: Device) => (
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {device.model || device.platform}
          </div>
          <div className="text-xs font-mono text-gray-500 dark:text-gray-400">
            {device.deviceId.substring(0, 8)}...
          </div>
        </div>
      ),
    },
    {
      key: 'platform',
      header: 'Platform',
      width: '100px',
      render: (device: Device) => (
        <Badge variant={device.platform === 'ios' ? 'default' : device.platform === 'android' ? 'ok' : 'default'}>
          {device.platform}
        </Badge>
      ),
    },
    {
      key: 'appVersion',
      header: 'App',
      width: '80px',
      mono: true,
      render: (device: Device) => (
        <span className="text-xs font-mono">{device.appVersion || '-'}</span>
      ),
    },
    {
      key: 'osVersion',
      header: 'OS',
      width: '80px',
      mono: true,
      render: (device: Device) => (
        <span className="text-xs font-mono">{device.osVersion || '-'}</span>
      ),
    },
    {
      key: 'environment',
      header: 'Env',
      width: '100px',
      render: (device: Device) => (
        <span className="text-xs">{device.environment || 'production'}</span>
      ),
    },
    {
      key: 'debugModeEnabled',
      header: 'Debug',
      width: '80px',
      render: (device: Device) => (
        <DebugSwitch
          enabled={device.debugModeEnabled}
          onClick={() => handleToggleDebug(device)}
        />
      ),
    },
    {
      key: 'lastSeenAt',
      header: 'Last seen',
      width: '100px',
      render: (device: Device) => (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {formatTimestamp(device.lastSeenAt)}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      {/* Page Title + Tabs */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
            Devices
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Device registry and management
          </p>
        </div>

        {/* List | Settings Tabs - v4: Use blue active state, not black */}
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <button
            onClick={() => setView('list')}
            className={`px-4 py-1.5 text-xs font-medium transition-colors ${
              currentView === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            Device List
          </button>
          <button
            onClick={() => setView('settings')}
            className={`px-4 py-1.5 text-xs font-medium transition-colors ${
              currentView === 'settings'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            Settings
          </button>
        </div>
      </div>

      {/* Device List View */}
      {currentView === 'list' && (
        <>
          {/* Quota Banner - compact */}
          <QuotaBanner
            title="Devices"
            used={quotaUsed}
            limit={quotaLimit}
            unit="devices"
            onUpgrade={onUpgrade}
          />

          {/* KPI Row - grouped by meaning */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {/* Totals */}
            <KPICard
              title="Total devices"
              value={stats?.kpis.totalDevices || 0}
              subtitle="lifetime"
              span={1}
            />
            {/* Activity */}
            <KPICard
              title="Active (24h)"
              value={stats?.kpis.activeDevices24h || 0}
              subtitle="last seen"
              badge="24h"
              span={1}
            />
            <KPICard
              title="New (24h)"
              value={stats?.kpis.newDevices24h || 0}
              subtitle="first seen"
              badge="24h"
              span={1}
            />
            {/* Breakdown */}
            <KPICard
              title="iOS"
              value={stats?.kpis.iosPlatform || 0}
              subtitle="devices"
              span={1}
              onClick={() => {
                setPlatformFilter('ios')
                setPage(1)
              }}
            />
            <KPICard
              title="Android"
              value={stats?.kpis.androidPlatform || 0}
              subtitle="devices"
              span={1}
              onClick={() => {
                setPlatformFilter('android')
                setPage(1)
              }}
            />
            {/* Debug */}
            <KPICard
              title="Debug ON"
              value={stats?.kpis.debugEnabled || 0}
              subtitle="devices"
              badge="Live"
              badgeVariant="ok"
              span={1}
              onClick={() => {
                setDebugFilter('true')
                setPage(1)
              }}
            />
          </div>

          {/* Filter Bar - 3-4 inline */}
          <FilterBar>
            <FilterInput
              label="Search"
              value={search}
              onChange={(v) => { setSearch(v); setPage(1) }}
              placeholder="deviceId / model / email"
              width="180px"
            />
            <FilterSelect
              label="Platform"
              value={platformFilter}
              onChange={(v) => { setPlatformFilter(v); setPage(1) }}
              options={platformOptions}
            />
            <FilterSelect
              label="Debug"
              value={debugFilter}
              onChange={(v) => { setDebugFilter(v); setPage(1) }}
              options={debugOptions}
            />
            <FilterSelect
              label="Env"
              value={envFilter}
              onChange={(v) => { setEnvFilter(v); setPage(1) }}
              options={envOptions}
            />
            <FilterButton onClick={() => {}}>More filters</FilterButton>
            <div className="flex-1" />
            <FilterButton onClick={() => {}}>Export</FilterButton>
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

          {/* Devices Table */}
          <Card>
            <CardBody>
              <DataTable
                columns={deviceColumns}
                data={devices}
                keyExtractor={(device) => device.id}
                onRowClick={(device) => setSelectedDevice(device)}
                emptyMessage="No devices found. Check your filters or wait for devices to register."
              />

              {/* Pagination */}
              {total > limit && (
                <div className="mt-4 flex justify-between items-center pt-4 border-t border-gray-200 dark:border-white/10">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total.toLocaleString()} devices
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.02] disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page * limit >= total}
                      className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.02] disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Device Details Drawer */}
          <Drawer
            open={!!selectedDevice}
            onClose={() => setSelectedDevice(null)}
            title={selectedDevice?.model || selectedDevice?.platform || 'Device Details'}
            subtitle={selectedDevice?.deviceId}
            width="lg"
          >
            {selectedDevice && (
              <div className="space-y-5">
                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      onNavigateToTraces?.(selectedDevice.deviceId)
                      setSelectedDevice(null)
                    }}
                    className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.04] hover:bg-gray-50 dark:hover:bg-white/[0.08] transition-colors"
                  >
                    View Traces
                  </button>
                  <button
                    onClick={() => {
                      onNavigateToLogs?.(selectedDevice.deviceId)
                      setSelectedDevice(null)
                    }}
                    className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.04] hover:bg-gray-50 dark:hover:bg-white/[0.08] transition-colors"
                  >
                    View Logs
                  </button>
                  <button
                    onClick={() => {
                      onNavigateToCrashes?.(selectedDevice.deviceId)
                      setSelectedDevice(null)
                    }}
                    className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.04] hover:bg-gray-50 dark:hover:bg-white/[0.08] transition-colors"
                  >
                    View Crashes
                  </button>
                </div>

                {/* Debug Mode Toggle */}
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">Debug Mode</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Enable to capture detailed traces and logs
                      </div>
                    </div>
                    <DebugSwitch
                      enabled={selectedDevice.debugModeEnabled}
                      onClick={() => handleToggleDebug(selectedDevice)}
                    />
                  </div>
                </div>

                {/* Device Info */}
                <div className="space-y-3">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Device Information
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Platform</div>
                      <div className="text-sm mt-0.5">{selectedDevice.platform}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Model</div>
                      <div className="text-sm mt-0.5">{selectedDevice.model || '-'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">OS Version</div>
                      <div className="text-sm font-mono mt-0.5">{selectedDevice.osVersion || '-'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">App Version</div>
                      <div className="text-sm font-mono mt-0.5">{selectedDevice.appVersion || '-'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Environment</div>
                      <div className="text-sm mt-0.5">{selectedDevice.environment || 'production'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Manufacturer</div>
                      <div className="text-sm mt-0.5">{selectedDevice.manufacturer || '-'}</div>
                    </div>
                  </div>
                </div>

                {/* Activity */}
                <div className="space-y-3">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Activity
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Last Seen</div>
                      <div className="text-sm mt-0.5">{formatTimestamp(selectedDevice.lastSeenAt)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">First Seen</div>
                      <div className="text-sm mt-0.5">{formatTimestamp(selectedDevice.createdAt)}</div>
                    </div>
                  </div>
                </div>

                {/* User Info */}
                {(selectedDevice.userEmail || selectedDevice.userName) && (
                  <div className="space-y-3">
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Linked User
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedDevice.userName && (
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Name</div>
                          <div className="text-sm mt-0.5">{selectedDevice.userName}</div>
                        </div>
                      )}
                      {selectedDevice.userEmail && (
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Email</div>
                          <div className="text-sm mt-0.5">{selectedDevice.userEmail}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Device ID */}
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Device ID</div>
                  <div className="text-xs font-mono p-2 rounded bg-gray-100 dark:bg-white/[0.05] break-all">
                    {selectedDevice.deviceId}
                  </div>
                </div>
              </div>
            )}
          </Drawer>
        </>
      )}

      {/* Settings View - v5: Light cards, blue selected, neutral disabled */}
      {currentView === 'settings' && (
        <Card>
          <CardHeader title="Devices — Settings" />
          <CardBody>
            <div className="space-y-8 max-w-2xl">
              {/* Device Ingestion Mode - v5: Card-based options */}
              <div>
                <div className="mb-1 text-sm font-medium text-gray-900 dark:text-white">
                  Device Tracking Mode
                </div>
                <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
                  Choose which devices should send data to this project
                </p>

                <div className="space-y-3">
                  {/* All Devices */}
                  <button
                    onClick={() => setTrackingScope('all')}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                      trackingScope === 'all'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`font-medium ${trackingScope === 'all' ? 'text-blue-700 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                          All devices
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          Track all devices that connect to your app
                        </div>
                      </div>
                      {trackingScope === 'all' && (
                        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Debug Only */}
                  <button
                    onClick={() => setTrackingScope('debug')}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                      trackingScope === 'debug'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`font-medium ${trackingScope === 'debug' ? 'text-blue-700 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                          Debug-enabled devices only
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          Only track devices with debug mode enabled
                        </div>
                      </div>
                      {trackingScope === 'debug' && (
                        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Disabled - v5: Neutral styling, not red */}
                  <button
                    onClick={() => setTrackingScope('disabled')}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                      trackingScope === 'disabled'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`font-medium ${trackingScope === 'disabled' ? 'text-blue-700 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                          Disabled
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          No device data will be captured for this project
                        </div>
                      </div>
                      {trackingScope === 'disabled' && (
                        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                </div>
              </div>

              {/* Retention */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Data Retention Period
                </label>
                <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
                  How long device data should be retained before automatic cleanup
                </p>
                <select
                  value={retentionDays}
                  onChange={(e) => setRetentionDays(e.target.value)}
                  className="w-full max-w-xs px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="30">30 days</option>
                  <option value="60">60 days</option>
                  <option value="90">90 days</option>
                  <option value="180">180 days</option>
                  <option value="365">1 year</option>
                </select>
              </div>

              {/* Save Button */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  )
})

export default DevicesTab
