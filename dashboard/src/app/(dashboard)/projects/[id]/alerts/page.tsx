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
import Link from 'next/link'

type Alert = {
  id: string
  title: string
  description: string | null
  type: 'API' | 'Config'
  severity: 'critical' | 'warning'
  status: 'open' | 'acknowledged' | 'resolved'
  lastTriggeredAt: string
  triggerCount: number
  cooldownMinutes: number
  endpoint: string | null
  method: string | null
}

export default function AlertsPage() {
  const params = useParams()
  const { token } = useAuth()
  const projectId = params?.id as string

  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
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

  const fetchAlerts = useCallback(async () => {
    if (!token || !projectId) return
    try {
      setLoading(true)
      const response = await api.alerts.list(projectId, token)
      setAlerts(response.alerts || [])
    } catch (error) {
      console.error('Failed to fetch alerts:', error)
    } finally {
      setLoading(false)
    }
  }, [token, projectId])

  useEffect(() => {
    if (token && projectId) {
      // Only fetch project name once on mount
      if (!projectName) {
        fetchProject()
      }
      fetchAlerts()
    }
  }, [token, projectId, fetchProject, fetchAlerts, projectName])

  // Style constants
  const ACTION_BUTTON_STYLE: React.CSSProperties = { padding: '7px 10px', fontSize: '11px' }
  const ACTION_CONTAINER_STYLE: React.CSSProperties = { display: 'flex', gap: '8px', flexWrap: 'wrap' }

  // Memoize helper function
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

  // Memoize computed stats
  const activeAlertsCount = useMemo(() => alerts.filter(a => a.status === 'open').length, [alerts])
  const criticalAlertsCount = useMemo(() => alerts.filter(a => a.severity === 'critical').length, [alerts])

  // Memoize filter array
  const filterItems = useMemo<FilterItem[]>(() => [
    {
      type: 'search',
      placeholder: 'Search alert name / endpoint / config key',
    },
    {
      type: 'select',
      options: [
        { value: 'open', label: 'Status: Open' },
        { value: 'all', label: 'All' },
        { value: 'acknowledged', label: 'Acknowledged' },
        { value: 'resolved', label: 'Resolved' },
      ],
    },
    {
      type: 'select',
      options: [
        { value: 'all', label: 'Type: All' },
        { value: 'API', label: 'API Alert' },
        { value: 'Config', label: 'Config Alert' },
      ],
    },
    {
      type: 'select',
      options: [
        { value: 'all', label: 'Severity: All' },
        { value: 'critical', label: 'critical' },
        { value: 'warning', label: 'warning' },
      ],
    },
  ], [])

  // Memoize stats array
  const statsItems = useMemo(() => [
    { label: 'Active alerts', value: activeAlertsCount, dot: 'warn' as const },
    { label: 'Critical', value: criticalAlertsCount, dot: 'bad' as const },
    { label: 'Total', value: alerts.length },
  ], [activeAlertsCount, criticalAlertsCount, alerts.length])

  // Memoize column definitions
  const alertColumns = useMemo<Column<Alert>[]>(() => [
    {
      key: 'alert',
      label: 'Alert',
      render: (alert) => (
        <>
          <b>{alert.title}</b>
          {alert.endpoint && (
            <div className="muted" style={{ fontSize: '11px' }}>
              {alert.method} {alert.endpoint}
            </div>
          )}
          {alert.description && (
            <div className="muted" style={{ fontSize: '11px' }}>
              {alert.description}
            </div>
          )}
        </>
      ),
    },
    { key: 'type', label: 'Type', render: (alert) => alert.type },
    {
      key: 'lastTriggered',
      label: 'Last Triggered',
      render: (alert) => <span className="muted">{formatTimeAgo(alert.lastTriggeredAt)}</span>,
    },
    {
      key: 'count',
      label: 'Count',
      render: (alert) => (
        <span className="chip">
          <span className={alert.severity === 'critical' ? 'dot bad' : 'dot warn'} />
          {alert.triggerCount}
        </span>
      ),
    },
    { key: 'cooldown', label: 'Cooldown', render: (alert) => `${alert.cooldownMinutes}m` },
    {
      key: 'actions',
      label: 'Action',
      render: (alert) => (
        <div style={ACTION_CONTAINER_STYLE}>
          <Link
            href={`/projects/${projectId}/traces?${alert.endpoint ? `url=${alert.endpoint}&method=${alert.method}` : ''}`}
            className="btn secondary"
            style={ACTION_BUTTON_STYLE}
            onClick={(e) => e.stopPropagation()}
          >
            View Raw
          </Link>
          <button
            className="btn secondary"
            style={ACTION_BUTTON_STYLE}
            onClick={(e) => {
              e.stopPropagation()
              // TODO: Acknowledge alert
            }}
          >
            Acknowledge
          </button>
        </div>
      ),
    },
  ], [projectId, formatTimeAgo])

  // Memoize handlers
  const handleRowClick = useCallback((alert: Alert) => {
    // TODO: Open alert detail drawer
    console.log('Open alert:', alert.id)
  }, [])

  return (
    <AppShell projectId={projectId} projectName={projectName}>
      <PageHeader
        title="Alerts"
        subtitle="Unified alerts center: API alerts + Config alerts. Includes event feed, acknowledgements, cooldown, routing."
        dataMode="Ops"
        actions={
          <>
            <ThemeToggle />
            <button className="btn" onClick={() => {}}>
              New Alert
            </button>
          </>
        }
      />

      {/* Note Section */}
      <div className="note" style={{ marginTop: '18px' }}>
        <b>Alerting UX rule</b>
        <div className="muted" style={{ marginTop: '6px' }}>
          Every alert event must have a single-click drilldown: raw traces/logs/crashes/sessions scoped to the alert context.
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar filters={filterItems} stats={statsItems} />

      {/* Alerts Table */}
      <DataTable
        data={alerts}
        columns={alertColumns}
        loading={loading}
        emptyMessage="No alerts found"
        onRowClick={handleRowClick}
        pagination={totalPages > 1 ? {
          currentPage: page,
          totalPages,
          onPageChange: setPage,
        } : undefined}
        footerNote="Implementation: Alerts support API and Config types. Each alert has drilldown to raw data with filters applied."
      />
    </AppShell>
  )
}

