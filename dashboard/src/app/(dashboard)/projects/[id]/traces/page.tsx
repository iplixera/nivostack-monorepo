'use client'

import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { api } from '@/lib/api'
import PageHeader from '@/components/layout/PageHeader'
import ThemeToggle from '@/components/ThemeToggle'
import DataTable, { Column } from '@/components/DataTable'
import FilterBar, { FilterItem } from '@/components/FilterBar'

type Trace = {
  id: string
  url: string
  method: string
  statusCode: number
  duration: number
  error: string | null
  timestamp: string
  screenName?: string
  networkType?: string
  country?: string
  cost?: number
  device?: { deviceId: string; platform: string; model: string }
}

export default function ApiTracesPage() {
  const params = useParams()
  const { token } = useAuth()
  const projectId = params?.id as string

  const [traces, setTraces] = useState<Trace[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [projectName, setProjectName] = useState('')
  const [methodFilter, setMethodFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

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

  const fetchTraces = useCallback(async () => {
    if (!token || !projectId) return
    try {
      setLoading(true)
      const response = await api.traces.list(projectId, token, {
        page,
        limit: 20,
        method: methodFilter !== 'all' ? methodFilter : undefined,
      })
      setTraces(response.traces || [])
      setTotalPages(response.pagination?.totalPages || 1)
    } catch (error) {
      console.error('Failed to fetch traces:', error)
    } finally {
      setLoading(false)
    }
  }, [token, projectId, page, methodFilter])

  useEffect(() => {
    if (token && projectId) {
      // Only fetch project name once on mount
      if (!projectName) {
        fetchProject()
      }
      fetchTraces()
    }
  }, [token, projectId, fetchProject, fetchTraces, projectName])

  // Style constants
  const ACTION_BUTTON_STYLE: React.CSSProperties = { padding: '7px 10px', fontSize: '11px' }
  const ACTION_CONTAINER_STYLE: React.CSSProperties = { display: 'flex', gap: '8px', flexWrap: 'wrap' }

  // Memoize helper functions
  const getStatusDot = useCallback((statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return 'dot'
    if (statusCode >= 400 && statusCode < 500) return 'dot bad'
    if (statusCode >= 500) return 'dot bad'
    return 'dot'
  }, [])

  // Memoize filter array
  const filterItems = useMemo<FilterItem[]>(() => [
    {
      type: 'search',
      placeholder: 'Search endpoint / url / deviceId / sessionId',
      value: searchQuery,
      onChange: setSearchQuery,
    },
    {
      type: 'select',
      options: [
        { value: '1h', label: 'Time: Last 1h' },
        { value: '24h', label: 'Last 24h' },
        { value: '7d', label: 'Last 7d' },
      ],
    },
    {
      type: 'select',
      value: methodFilter,
      onChange: setMethodFilter,
      options: [
        { value: 'all', label: 'Method: All' },
        { value: 'GET', label: 'GET' },
        { value: 'POST', label: 'POST' },
        { value: 'PUT', label: 'PUT' },
      ],
    },
    {
      type: 'select',
      value: statusFilter,
      onChange: setStatusFilter,
      options: [
        { value: 'all', label: 'Status: All' },
        { value: '200', label: '2xx' },
        { value: '400', label: '4xx' },
        { value: '500', label: '5xx' },
      ],
    },
    { type: 'button', label: 'More Filters', className: 'secondary' },
    { type: 'button', label: 'Export', className: 'secondary' },
  ], [searchQuery, methodFilter, statusFilter])

  // Memoize stats array
  const statsItems = useMemo(() => [
    { label: 'Capture bodies', value: 'ON' },
    { label: 'Masking', value: 'ON', dot: 'warn' as const },
    { label: 'Retention', value: '7 days' },
  ], [])

  // Memoize column definitions
  const traceColumns = useMemo<Column<Trace>[]>(() => [
    {
      key: 'timestamp',
      label: 'Time',
      render: (trace) => (
        <span className="muted">{new Date(trace.timestamp).toLocaleString()}</span>
      ),
    },
    { key: 'method', label: 'Method', render: (trace) => <b>{trace.method}</b> },
    { key: 'url', label: 'Endpoint', render: (trace) => trace.url },
    {
      key: 'statusCode',
      label: 'Status',
      render: (trace) => (
        <span className="chip">
          <span className={getStatusDot(trace.statusCode)} />
          {trace.statusCode}
        </span>
      ),
    },
    { key: 'duration', label: 'Duration', render: (trace) => <span className="muted">{trace.duration}ms</span> },
    {
      key: 'device',
      label: 'Device',
      render: (trace) => (
        <span className="muted">
          {trace.device ? `${trace.device.deviceId.slice(0, 8)}...` : '—'}
        </span>
      ),
    },
    { key: 'screenName', label: 'Screen', render: (trace) => <span className="muted">{trace.screenName || '—'}</span> },
    {
      key: 'cost',
      label: 'Cost',
      render: (trace) => (
        <span className="muted">${trace.cost?.toFixed(3) || '0.000'}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (trace) => (
        <div style={ACTION_CONTAINER_STYLE}>
          <button
            className="btn secondary"
            style={ACTION_BUTTON_STYLE}
            onClick={(e) => {
              e.stopPropagation()
              // TODO: Open trace drawer
            }}
          >
            Open
          </button>
          {trace.device && (
            <a
              href={`/projects/${projectId}/live-debug?deviceId=${trace.device.deviceId}`}
              className="btn secondary"
              style={ACTION_BUTTON_STYLE}
              onClick={(e) => e.stopPropagation()}
            >
              Live Debug
            </a>
          )}
        </div>
      ),
    },
  ], [projectId, getStatusDot])

  // Memoize handlers
  const handleRowClick = useCallback((trace: Trace) => {
    // TODO: Open trace detail drawer
    console.log('Open trace:', trace.id)
  }, [])

  const paginationConfig = useMemo(() => totalPages > 1 ? {
    currentPage: page,
    totalPages,
    onPageChange: setPage,
  } : undefined, [totalPages, page])

  return (
    <div className="space-y-6">
      <PageHeader
        title="API Traces"
        subtitle="Raw trace list with strict performance: list query excludes bodies. Drawer lazily fetches headers/bodies."
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
          Keep current behavior: traces list, filtering, trace details (request/response), security settings for body capture and masking.
        </div>
      </div>

      {/* Status Row */}
      <div className="card" style={{ marginTop: '14px' }}>
        <div className="statusRow">
          <span className="chip">
            <span className="dot" />
            List query: metadata only (no bodies)
          </span>
          <span className="chip">
            <span className="dot warn" />
            Bodies: lazy fetch in drawer
          </span>
          <span className="chip">
            <span className="dot bad" />
            Redaction policy enforced
          </span>
          <span className="chip">
            <span className="dot" />
            Deep-link: deviceId/sessionId/traceId
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar filters={filterItems} stats={statsItems} />

      {/* Traces Table */}
      <DataTable
        data={traces}
        columns={traceColumns}
        loading={loading}
        emptyMessage="No traces found"
        onRowClick={handleRowClick}
        pagination={paginationConfig}
        footerNote="Implementation detail: trace body fields loaded only when drawer opens (traceId). Never return bodies in list."
      />
    </div>
  )
}
