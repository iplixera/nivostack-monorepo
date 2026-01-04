'use client'

import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { api } from '@/lib/api'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/layout/PageHeader'
import ThemeToggle from '@/components/ThemeToggle'
import DataTable, { Column } from '@/components/DataTable'
import FilterBar, { FilterItem } from '@/components/FilterBar'

type LiveEvent = {
  id: string
  type: 'API' | 'LOG' | 'CRASH' | 'SCREEN'
  timestamp: string
  summary: string
  traceId?: string
  logId?: string
  crashId?: string
}

export default function LiveDebugPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const { token } = useAuth()
  const projectId = params?.id as string
  const deviceId = searchParams?.get('deviceId') || ''

  const [events, setEvents] = useState<LiveEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [projectName, setProjectName] = useState('')
  const [selectedDevice, setSelectedDevice] = useState(deviceId)
  const [windowFilter, setWindowFilter] = useState('15m')
  const [tabFilter, setTabFilter] = useState('API')
  const [autoRefresh, setAutoRefresh] = useState(true)

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

  const fetchEvents = useCallback(async () => {
    if (!token || !projectId || !selectedDevice) return
    try {
      setLoading(true)
      // TODO: Implement live debug API endpoint
      // For now, fetch recent traces/logs/crashes for the device
      const [tracesResponse, logsResponse, crashesResponse] = await Promise.all([
        api.traces.list(projectId, token, { deviceId: selectedDevice, limit: 10 }),
        api.logs.list(projectId, token, { deviceId: selectedDevice, limit: 10 }),
        api.crashes.list(projectId, token, { deviceId: selectedDevice, limit: 10 }),
      ])

      const events: LiveEvent[] = []
      
      // Add traces
      tracesResponse.traces?.forEach((trace) => {
        events.push({
          id: trace.id,
          type: 'API',
          timestamp: trace.timestamp,
          summary: `${trace.method} ${trace.url} → ${trace.statusCode} (${trace.duration}ms)`,
          traceId: trace.id,
        })
      })

      // Add logs
      logsResponse.logs?.forEach((log) => {
        events.push({
          id: log.id,
          type: 'LOG',
          timestamp: log.timestamp,
          summary: `${log.level}: ${log.message}`,
          logId: log.id,
        })
      })

      // Add crashes
      crashesResponse.crashes?.forEach((crash) => {
        events.push({
          id: crash.id,
          type: 'CRASH',
          timestamp: crash.timestamp,
          summary: crash.message,
          crashId: crash.id,
        })
      })

      // Sort by timestamp descending (most recent first)
      events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      setEvents(events.slice(0, 50)) // Limit to 50 most recent
    } catch (error) {
      console.error('Failed to fetch events:', error)
    } finally {
      setLoading(false)
    }
  }

  // Style constants
  const ACTION_BUTTON_STYLE: React.CSSProperties = { padding: '7px 10px', fontSize: '11px' }

  // Memoize helper function
  const formatTimeAgo = useCallback((timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    if (seconds < 60) return seconds === 0 ? 'now' : `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    return `${hours}h`
  }, [])

  // Memoize filter array (depends on deviceId, selectedDevice, windowFilter, tabFilter)
  const filterItems = useMemo<FilterItem[]>(() => [
    {
      type: 'select',
      options: [
        { value: deviceId || '', label: selectedDevice ? `Device: ${selectedDevice}` : 'Select Device' },
      ],
      value: selectedDevice,
      onChange: setSelectedDevice,
    },
    {
      type: 'select',
      value: windowFilter,
      onChange: setWindowFilter,
      options: [
        { value: '15m', label: 'Window: Last 15m' },
        { value: '1h', label: 'Last 1h' },
        { value: '24h', label: 'Last 24h' },
      ],
    },
    {
      type: 'select',
      value: tabFilter,
      onChange: setTabFilter,
      options: [
        { value: 'API', label: 'Tab: API' },
        { value: 'Logs', label: 'Logs' },
        { value: 'Crashes', label: 'Crashes' },
        { value: 'Screen Flow', label: 'Screen Flow' },
      ],
    },
    { type: 'button', label: 'Pin', className: 'secondary' },
    { type: 'button', label: 'Share', className: 'secondary' },
  ], [deviceId, selectedDevice, windowFilter, tabFilter])

  // Memoize stats array
  const statsItems = useMemo(() => [
    { label: 'Stream', value: autoRefresh ? 'Polling (3s)' : 'Paused' },
    { label: 'Masking', value: 'ON', dot: 'warn' as const },
    { label: 'SDK batching', value: 'ON' },
  ], [autoRefresh])

  // Memoize filtered events
  const filteredEvents = useMemo(() => events.filter((e) => {
    if (tabFilter === 'API') return e.type === 'API'
    if (tabFilter === 'Logs') return e.type === 'LOG'
    if (tabFilter === 'Crashes') return e.type === 'CRASH'
    return true
  }), [events, tabFilter])

  // Memoize column definitions
  const eventColumns = useMemo<Column<LiveEvent>[]>(() => [
    {
      key: 'timestamp',
      label: 'Time',
      render: (event) => <span className="muted">{formatTimeAgo(event.timestamp)}</span>,
    },
    { key: 'type', label: 'Type', render: (event) => <b>{event.type}</b> },
    { key: 'summary', label: 'Summary', render: (event) => event.summary },
    {
      key: 'actions',
      label: 'Action',
      render: (event) => (
        <button
          className="btn secondary"
          style={ACTION_BUTTON_STYLE}
          onClick={(e) => {
            e.stopPropagation()
            // TODO: Open event detail drawer
          }}
        >
          View
        </button>
      ),
    },
  ], [formatTimeAgo])

  // Memoize handlers
  const handleRowClick = useCallback((event: LiveEvent) => {
    // TODO: Open event detail drawer
    console.log('Open event:', event.id)
  }, [])

  return (
    <AppShell projectId={projectId} projectName={projectName}>
      <PageHeader
        title="Live Debug"
        subtitle="Live feed for debug-enabled devices. Supports polling fallback; shows recent raw rows only."
        dataMode="Live"
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
          Keep current behavior: debug mode enable/disable + ability to see near real-time logs/traces/crashes/screen events for a device.
        </div>
      </div>

      {/* Status Row */}
      <div className="card" style={{ marginTop: '14px' }}>
        <div className="statusRow">
          <span className="chip">
            <span className="dot" />
            Data source: recent raw rows
          </span>
          <span className="chip">
            <span className="dot warn" />
            Fetch deltas: since=lastTimestamp
          </span>
          <span className="chip">
            <span className="dot" />
            Max window: 24h
          </span>
          <span className="chip">
            <span className="dot bad" />
            Body reveal requires role
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar filters={filterItems} stats={statsItems} />

      {/* Live Events Table */}
      <div className="grid" style={{ marginTop: '14px' }}>
        <div className="card" style={{ gridColumn: 'span 8' }}>
          <b>Recent Events (Live)</b>
          <div className="muted" style={{ marginTop: '6px' }}>
            This is not a dashboard. It is a live "tail" view.
          </div>
          <DataTable
            data={filteredEvents}
            columns={eventColumns}
            loading={loading}
            emptyMessage={selectedDevice ? 'No events found' : 'Select a device to view live events'}
            onRowClick={handleRowClick}
          />
        </div>
        <div className="card" style={{ gridColumn: 'span 4' }}>
          <b>Controls</b>
          <div className="hr" />
          <div className="row">
            <span className="chip">
              <span className="dot warn" />
              Debug mode expires
            </span>
            <button
              className="btn secondary"
              onClick={() => {
                // TODO: Extend debug TTL
              }}
            >
              Extend
            </button>
          </div>
          <div className="row" style={{ marginTop: '10px' }}>
            <span className="chip">
              <span className="dot" />
              Capture bodies
            </span>
            <button
              className="btn secondary"
              onClick={() => {
                // TODO: Toggle capture per policy
              }}
            >
              Request change
            </button>
          </div>
          <div className="footerNote" style={{ marginTop: '12px' }}>
            Implementation: query by (projectId, deviceId, timestamp desc) and only return the latest N rows.
          </div>
        </div>
      </div>
    </AppShell>
  )
}

