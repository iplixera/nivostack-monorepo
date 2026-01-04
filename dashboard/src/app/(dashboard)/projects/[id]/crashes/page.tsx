'use client'

import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { api } from '@/lib/api'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/layout/PageHeader'
import ThemeToggle from '@/components/ThemeToggle'
import DataTable, { Column } from '@/components/DataTable'
import FilterBar, { FilterItem } from '@/components/FilterBar'

type Crash = {
  id: string
  message: string
  stackTrace: string | null
  metadata: Record<string, unknown> | null
  timestamp: string
  device?: { deviceId: string; platform: string; model: string | null }
}

export default function CrashesPage() {
  const params = useParams()
  const { token } = useAuth()
  const projectId = params?.id as string

  const [crashes, setCrashes] = useState<Crash[]>([])
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

  const fetchCrashes = useCallback(async () => {
    if (!token || !projectId) return
    try {
      setLoading(true)
      const response = await api.crashes.list(projectId, token, {
        page,
        limit: 20,
        search: searchQuery || undefined,
      })
      setCrashes(response.crashes || [])
      setTotalPages(response.pagination?.totalPages || 1)
    } catch (error) {
      console.error('Failed to fetch crashes:', error)
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
      fetchCrashes()
    }
  }, [token, projectId, fetchProject, fetchCrashes, projectName])

  // Style constants
  const ACTION_BUTTON_STYLE: React.CSSProperties = { padding: '7px 10px', fontSize: '11px' }
  const ACTION_CONTAINER_STYLE: React.CSSProperties = { display: 'flex', gap: '8px', flexWrap: 'wrap' }

  // Memoize helper functions
  const formatTimeAgo = useCallback((timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }, [])

  // Memoize filter array
  const filterItems = useMemo<FilterItem[]>(() => [
    {
      type: 'search',
      placeholder: 'Search crash message / stack / deviceId',
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
    },
    {
      type: 'select',
      options: [
        { value: 'all', label: 'Platform: All' },
        { value: 'ios', label: 'iOS' },
        { value: 'android', label: 'Android' },
      ],
    },
    { type: 'button', label: 'More Filters', className: 'secondary' },
    { type: 'button', label: 'Export', className: 'secondary' },
  ], [searchQuery])

  // Memoize stats array
  const statsItems = useMemo(() => [
    { label: 'Total crashes', value: '1.2k' },
    { label: 'Unique groups', value: '45' },
    { label: 'Affected devices', value: '312', dot: 'warn' as const },
  ], [])

  // Memoize column definitions
  const crashColumns = useMemo<Column<Crash>[]>(() => [
    {
      key: 'timestamp',
      label: 'Last Seen',
      render: (crash) => <span className="muted">{formatTimeAgo(crash.timestamp)}</span>,
    },
    {
      key: 'message',
      label: 'Crash',
      render: (crash) => (
        <>
          <b>{crash.message}</b>
          {crash.stackTrace && (
            <div className="muted" style={{ fontSize: '11px', marginTop: '4px' }}>
              {crash.stackTrace.split('\n')[0]}
            </div>
          )}
        </>
      ),
    },
    { key: 'device', label: 'Device', render: (crash) => crash.device?.deviceId || '—' },
    { key: 'platform', label: 'Platform', render: (crash) => crash.device?.platform || '—' },
    {
      key: 'count',
      label: 'Count',
      render: () => (
        <span className="chip">
          <span className="dot warn" />
          1
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (crash) => (
        <div style={ACTION_CONTAINER_STYLE}>
          <button
            className="btn secondary"
            style={ACTION_BUTTON_STYLE}
            onClick={(e) => {
              e.stopPropagation()
              // TODO: View raw crashes for this group
            }}
          >
            View Raw
          </button>
          <button
            className="btn secondary"
            style={ACTION_BUTTON_STYLE}
            onClick={(e) => {
              e.stopPropagation()
              // TODO: Open crash detail drawer
            }}
          >
            Open
          </button>
        </div>
      ),
    },
  ], [formatTimeAgo])

  // Memoize handlers
  const handleRowClick = useCallback((crash: Crash) => {
    // TODO: Open crash detail drawer
    console.log('Open crash:', crash.id)
  }, [])

  const paginationConfig = useMemo(() => totalPages > 1 ? {
    currentPage: page,
    totalPages,
    onPageChange: setPage,
  } : undefined, [totalPages, page])

  return (
    <AppShell projectId={projectId} projectName={projectName}>
      <PageHeader
        title="Crashes"
        subtitle="Aggregated crash groups with drilldown to raw. Group by message/stack signature; show trends + affected devices."
        dataMode="Aggregated"
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
          Keep current behavior: crash list, grouping, stack trace view, device correlation. Add aggregated trends + drilldown to raw.
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar filters={filterItems} stats={statsItems} />

      {/* Crashes Table */}
      <DataTable
        data={crashes}
        columns={crashColumns}
        loading={loading}
        emptyMessage="No crashes found"
        onRowClick={handleRowClick}
        pagination={paginationConfig}
        footerNote="Implementation: crash groups aggregated by message/stack signature. Drilldown shows all raw crashes in group."
      />
    </AppShell>
  )
}

