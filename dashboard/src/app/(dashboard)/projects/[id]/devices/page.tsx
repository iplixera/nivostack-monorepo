'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { api } from '@/lib/api'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/layout/PageHeader'
import ThemeToggle from '@/components/ThemeToggle'
import DataTable, { Column } from '@/components/DataTable'
import FilterBar, { FilterItem } from '@/components/FilterBar'

type Device = {
  id: string
  deviceId: string
  platform: string
  osVersion: string
  appVersion: string
  model: string
  manufacturer?: string
  lastSeenAt: string
  createdAt: string
  debugModeEnabled?: boolean
  userId?: string
  userEmail?: string
}

type DeviceStats = {
  total: number
  android: number
  ios: number
  today: number
  thisWeek: number
  thisMonth: number
  debugModeCount: number
}

export default function DevicesPage() {
  const params = useParams()
  const { token } = useAuth()
  const projectId = params?.id as string

  const [devices, setDevices] = useState<Device[]>([])
  const [stats, setStats] = useState<DeviceStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [projectName, setProjectName] = useState('')

  const fetchProject = useCallback(async () => {
    if (!token || !projectId) return
    try {
      const data = await api.projects.list(token)
      const project = data.projects?.find(p => p.id === projectId)
      setProjectName(project?.name || 'Project')
    } catch (error) {
      console.error('Failed to fetch project:', error)
    }
  }, [token, projectId])

  const fetchDevices = useCallback(async () => {
    if (!token || !projectId) return
    try {
      setLoading(true)
      const response = await api.devices.list(projectId, token, {
        page,
        limit: 20,
        search: searchQuery || undefined,
      })
      setDevices(response.devices || [])
      setTotalPages(response.pagination?.totalPages || 1)
      // Use stats from API response if available (no need for separate call)
      if (response.stats) {
        setStats(response.stats)
      }
    } catch (error) {
      console.error('Failed to fetch devices:', error)
    } finally {
      setLoading(false)
    }
  }, [token, projectId, page, searchQuery])

  useEffect(() => {
    if (token && projectId) {
      // Only fetch project name once on mount
      if (!projectName) {
        fetchProject()
      }
      fetchDevices()
    }
  }, [token, projectId, fetchDevices, fetchProject, projectName])

  // Style constants
  const ACTION_BUTTON_STYLE: React.CSSProperties = { padding: '7px 10px', fontSize: '11px' }
  const ACTION_CONTAINER_STYLE: React.CSSProperties = { display: 'flex', gap: '8px', flexWrap: 'wrap' }

  // Memoize filter array
  const filterItems = useMemo<FilterItem[]>(() => [
    {
      type: 'search',
      placeholder: 'Search deviceId / deviceCode / user email / model / appVersion',
      value: searchQuery,
      onChange: setSearchQuery,
    },
    {
      type: 'select',
      options: [
        { value: 'all', label: 'Platform: All' },
        { value: 'ios', label: 'iOS' },
        { value: 'android', label: 'Android' },
      ],
    },
    {
      type: 'select',
      options: [
        { value: 'all', label: 'Debug: All' },
        { value: 'enabled', label: 'Enabled' },
        { value: 'disabled', label: 'Disabled' },
      ],
    },
    {
      type: 'select',
      options: [
        { value: 'today', label: 'Last Seen: Today' },
        { value: 'week', label: 'This Week' },
        { value: 'month', label: 'This Month' },
      ],
    },
    { type: 'button', label: 'More Filters', className: 'secondary' },
    { type: 'button', label: 'Export', className: 'secondary' },
    { type: 'button', label: 'Saved Views', className: 'secondary' },
  ], [searchQuery])

  // Memoize stats array
  const statsItems = useMemo(() => stats ? [
    { label: 'Total', value: stats.total },
    { label: 'iOS', value: stats.ios },
    { label: 'Android', value: stats.android },
    { label: 'Debug Enabled', value: stats.debugModeCount, dot: 'warn' as const },
    { label: 'Active Today', value: stats.today },
  ] : undefined, [stats])

  // Memoize column definitions
  const deviceColumns = useMemo<Column<Device>[]>(() => [
    {
      key: 'device',
      label: 'Device',
      render: (device) => (
        <>
          <b>{device.deviceId}</b>
          {device.model && (
            <div className="muted" style={{ fontSize: '11px' }}>
              {device.model}
              {device.manufacturer && ` · ${device.manufacturer}`}
            </div>
          )}
        </>
      ),
    },
    { key: 'platform', label: 'Platform', render: (device) => device.platform },
    { key: 'appVersion', label: 'App', render: (device) => device.appVersion },
    { key: 'osVersion', label: 'OS', render: (device) => device.osVersion },
    {
      key: 'lastSeenAt',
      label: 'Last Seen',
      render: (device) => (
        <span className="muted">{new Date(device.lastSeenAt).toLocaleDateString()}</span>
      ),
    },
    {
      key: 'debug',
      label: 'Debug',
      render: (device) =>
        device.debugModeEnabled ? (
          <span className="chip">
            <span className="dot warn" />
            Enabled
          </span>
        ) : (
          <span className="chip">
            <span className="dot" />
            Off
          </span>
        ),
    },
    {
      key: 'status',
      label: 'Status',
      render: () => (
        <span className="chip">
          <span className="dot" />
          Active
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (device) => (
        <div style={ACTION_CONTAINER_STYLE}>
          {device.debugModeEnabled ? (
            <a
              href={`/projects/${projectId}/live-debug?deviceId=${device.deviceId}`}
              className="btn secondary"
              style={ACTION_BUTTON_STYLE}
              onClick={(e) => e.stopPropagation()}
            >
              Live Debug
            </a>
          ) : (
            <button
              className="btn secondary"
              style={ACTION_BUTTON_STYLE}
              onClick={(e) => {
                e.stopPropagation()
                // TODO: Enable debug mode
              }}
            >
              Enable Debug
            </button>
          )}
          <button
            className="btn secondary"
            style={ACTION_BUTTON_STYLE}
            onClick={(e) => {
              e.stopPropagation()
              // TODO: Open device drawer
            }}
          >
            Open
          </button>
        </div>
      ),
    },
  ], [projectId])

  // Memoize handlers
  const handleRowClick = useCallback((device: Device) => {
    // TODO: Open device detail drawer
    console.log('Open device:', device.id)
  }, [])

  const paginationConfig = useMemo(() => totalPages > 1 ? {
    currentPage: page,
    totalPages,
    onPageChange: setPage,
  } : undefined, [totalPages, page])

  return (
    <AppShell projectId={projectId} projectName={projectName}>
      <PageHeader
        title="Devices"
        subtitle="Raw device registry for debugging + management. Drawer tabs show correlated raw data by deviceId."
        dataMode="Raw"
        actions={
          <>
            <ThemeToggle />
            <button className="btn" onClick={() => {}}>
              Primary Action
            </button>
          </>
        }
      />

      {/* Note Section */}
      <div className="note" style={{ marginTop: '18px' }}>
        <b>Mapping to current functions</b>
        <div className="muted" style={{ marginTop: '6px' }}>
          Keep current behavior: device list + filters + debug mode enable/disable + device detail view. Refactor UI only.
        </div>
      </div>

      {/* Status Row */}
      <div className="card" style={{ marginTop: '14px' }}>
        <div className="statusRow">
          <span className="chip">
            <span className="dot" />
            Server pagination
          </span>
          <span className="chip">
            <span className="dot" />
            Indexed filters: projectId + lastSeenAt + platform
          </span>
          <span className="chip">
            <span className="dot warn" />
            Debug mode actions permission-gated
          </span>
          <span className="chip">
            <span className="dot" />
            Row → Drawer (Overview/Sessions/Traces/Logs/Crashes/Metadata)
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar filters={filterItems} stats={statsItems} />

      {/* Devices Table */}
      <DataTable
        data={devices}
        columns={deviceColumns}
        loading={loading}
        emptyMessage="No devices found"
        onRowClick={handleRowClick}
        pagination={paginationConfig}
        footerNote="Implementation: keep existing API calls; move request bodies and heavy tabs to lazy fetch by deviceId."
      />
    </AppShell>
  )
}
