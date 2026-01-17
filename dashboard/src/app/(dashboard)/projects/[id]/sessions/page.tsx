'use client'

import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { api } from '@/lib/api'
import PageHeader from '@/components/layout/PageHeader'
import ThemeToggle from '@/components/ThemeToggle'
import DataTable, { Column } from '@/components/DataTable'
import FilterBar, { FilterItem } from '@/components/FilterBar'

type Session = {
  id: string
  sessionToken: string
  startedAt: string
  endedAt: string | null
  isActive: boolean
  duration: number | null
  screenCount: number
  screenFlow: string[]
  device: { deviceId: string; platform: string; model: string } | null
  requestCount: number
  totalCost: number
}

export default function SessionsPage() {
  const params = useParams()
  const { token } = useAuth()
  const projectId = params?.id as string

  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [projectName, setProjectName] = useState('')
  const [timeRangeFilter, setTimeRangeFilter] = useState('24h')
  const [platformFilter, setPlatformFilter] = useState('all')
  const [appVersionFilter, setAppVersionFilter] = useState('all')
  const [error, setError] = useState('')

  // Export handler
  const handleExport = useCallback(async () => {
    if (!token || !projectId) return
    try {
      const params = new URLSearchParams({
        projectId,
        search: searchQuery || '',
        platform: platformFilter !== 'all' ? platformFilter : '',
        appVersion: appVersionFilter !== 'all' ? appVersionFilter : '',
        timeRange: timeRangeFilter,
        format: 'csv'
      })
      
      const response = await fetch(`/api/sessions/export?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (!response.ok) {
        alert('Export failed. Please try again.')
        return
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `sessions-${projectId}-${Date.now()}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    }
  }, [token, projectId, searchQuery, platformFilter, appVersionFilter, timeRangeFilter])

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

  const fetchSessions = useCallback(async () => {
    if (!token || !projectId) return
    try {
      setLoading(true)
      setError('')
      
      const params: Record<string, string> = {
        page: page.toString(),
        limit: '20',
      }
      
      if (searchQuery) params.search = searchQuery
      if (platformFilter !== 'all') params.platform = platformFilter
      if (appVersionFilter !== 'all') params.appVersion = appVersionFilter
      if (timeRangeFilter) params.timeRange = timeRangeFilter
      
      const response = await api.sessions.list(projectId, token, params)
      setSessions(response.sessions || [])
      setTotalPages(response.pagination?.totalPages || 1)
    } catch (error) {
      console.error('Failed to fetch sessions:', error)
      setError('Failed to load sessions. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [token, projectId, page, searchQuery, platformFilter, appVersionFilter, timeRangeFilter])

  useEffect(() => {
    if (token && projectId) {
      // Only fetch project name once on mount
      if (!projectName) {
        fetchProject()
      }
      fetchSessions()
    }
  }, [token, projectId, fetchProject, fetchSessions, projectName])

  // Style constants
  const ACTION_BUTTON_STYLE: React.CSSProperties = { padding: '7px 10px', fontSize: '11px' }

  // Memoize helper functions
  const formatDuration = useCallback((startedAt: string, endedAt: string | null) => {
    if (!endedAt) return 'Active'
    const start = new Date(startedAt)
    const end = new Date(endedAt)
    const seconds = Math.floor((end.getTime() - start.getTime()) / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }, [])

  const formatTimeAgo = useCallback((timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ago`
  }, [])

  // Memoize filter array
  const filterItems = useMemo<FilterItem[]>(() => [
    {
      type: 'search',
      placeholder: 'Search sessionId / deviceId / entryScreen / exitScreen / user',
      value: searchQuery,
      onChange: setSearchQuery,
    },
    {
      type: 'select',
      options: [
        { value: '24h', label: 'Time: Last 24h' },
        { value: '7d', label: 'Last 7d' },
        { value: '30d', label: 'Last 30d' },
      ],
      value: timeRangeFilter,
      onChange: setTimeRangeFilter,
    },
    {
      type: 'select',
      options: [
        { value: 'all', label: 'Platform: All' },
        { value: 'ios', label: 'iOS' },
        { value: 'android', label: 'Android' },
      ],
      value: platformFilter,
      onChange: setPlatformFilter,
    },
    {
      type: 'select',
      options: [
        { value: 'all', label: 'App Version: All' },
        { value: '2.0.1', label: '2.0.1' },
        { value: '2.0.0', label: '2.0.0' },
      ],
      value: appVersionFilter,
      onChange: setAppVersionFilter,
    },
    { 
      type: 'button', 
      label: 'More Filters', 
      className: 'secondary',
      onChange: () => alert('More Filters coming soon!')
    },
    { 
      type: 'button', 
      label: 'Export', 
      className: 'secondary',
      onChange: handleExport
    },
  ], [searchQuery, timeRangeFilter, platformFilter, appVersionFilter, handleExport])

  // Memoize stats array
  const statsItems = useMemo(() => [
    { label: 'Total', value: '12.3k' },
    { label: 'Avg duration', value: '3m 10s' },
    { label: 'Error sessions', value: '2.1%', dot: 'warn' as const },
    { label: 'Debug sessions', value: '410' },
  ], [])

  // Memoize column definitions
  const sessionColumns = useMemo<Column<Session>[]>(() => [
    {
      key: 'startedAt',
      label: 'Started',
      render: (session) => (
        <span className="muted">{formatTimeAgo(session.startedAt)}</span>
      ),
    },
    {
      key: 'session',
      label: 'Session',
      render: (session) => (
        <>
          <b>S-{session.sessionToken?.slice(-4).toUpperCase() || 'N/A'}</b>
          <div className="muted" style={{ fontSize: '11px' }}>
            token: …{session.sessionToken?.slice(-4) || 'N/A'}
          </div>
        </>
      ),
    },
    { key: 'device', label: 'Device', render: (session) => session.device?.deviceId || '—' },
    {
      key: 'flow',
      label: 'Entry → Exit',
      render: (session) => {
        const entryScreen = session.screenFlow?.[0] || '—'
        const exitScreen = session.isActive ? 'Active' : session.screenFlow?.[session.screenFlow.length - 1] || '—'
        return <span>{entryScreen} → {exitScreen}</span>
      },
    },
    {
      key: 'duration',
      label: 'Duration',
      render: (session) => {
        if (session.duration) {
          const minutes = Math.floor(session.duration / 60)
          const seconds = session.duration % 60
          return `${minutes}m ${seconds}s`
        }
        return formatDuration(session.startedAt, session.endedAt)
      },
    },
    { key: 'screens', label: 'Screens', render: (session) => session.screenCount || 0 },
    { key: 'events', label: 'Events', render: (session) => session.requestCount || 0 },
    {
      key: 'errors',
      label: 'Errors',
      render: () => (
        <span className="chip">
          <span className="dot" />
          0
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Action',
      render: (session) => (
        <button
          className="btn secondary"
          style={ACTION_BUTTON_STYLE}
          onClick={(e) => {
            e.stopPropagation()
            // TODO: Open Session Timeline drawer
          }}
        >
          Open
        </button>
      ),
    },
  ], [formatTimeAgo, formatDuration])

  // Memoize handlers
  const handleRowClick = useCallback((session: Session) => {
    // TODO: Open Session Timeline drawer with tabs: Timeline/Traces/Logs/Crashes/Screen Flow
    console.log('Open session:', session.id)
  }, [])

  const paginationConfig = useMemo(() => totalPages > 1 ? {
    currentPage: page,
    totalPages,
    onPageChange: setPage,
  } : undefined, [totalPages, page])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sessions"
        subtitle="Raw sessions list. Drill into Session Timeline: correlated traces/logs/crashes + screen flow (by sessionId)."
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
        <b>What stays the same</b>
        <div className="muted" style={{ marginTop: '6px' }}>
          Existing session tracking, timeline, and correlation must remain. This is UI refactor + performance rules only.
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar filters={filterItems} stats={statsItems} />

      {/* Sessions Table */}
      <DataTable
        data={sessions}
        columns={sessionColumns}
        loading={loading}
        emptyMessage="No sessions found"
        onRowClick={handleRowClick}
        pagination={paginationConfig}
        footerNote="Implementation: Session Timeline drawer shows correlated traces/logs/crashes + screen flow by sessionId."
      />
    </div>
  )
}

