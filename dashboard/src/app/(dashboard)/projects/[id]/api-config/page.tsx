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

type ApiConfig = {
  id: string
  endpoint: string
  method: string | null
  name: string | null
  description: string | null
  costPerRequest: number
  isEnabled: boolean
  createdAt: string
}

export default function ApiConfigPage() {
  const params = useParams()
  const { token } = useAuth()
  const projectId = params?.id as string

  const [configs, setConfigs] = useState<ApiConfig[]>([])
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

  const fetchConfigs = useCallback(async () => {
    if (!token || !projectId) return
    try {
      setLoading(true)
      const response = await api.config.list(projectId, token)
      setConfigs(response.configs || [])
    } catch (error) {
      console.error('Failed to fetch configs:', error)
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
      fetchConfigs()
    }
  }, [token, projectId, fetchProject, fetchConfigs, projectName])

  // Style constants
  const ACTION_BUTTON_STYLE: React.CSSProperties = { padding: '7px 10px', fontSize: '11px' }
  const ACTION_CONTAINER_STYLE: React.CSSProperties = { display: 'flex', gap: '8px', flexWrap: 'wrap' }

  // Memoize computed stats
  const enabledCount = useMemo(() => configs.filter(c => c.isEnabled).length, [configs])
  const totalCost = useMemo(() => configs.reduce((sum, c) => sum + c.costPerRequest, 0).toFixed(2), [configs])

  // Memoize filter array
  const filterItems = useMemo<FilterItem[]>(() => [
    {
      type: 'search',
      placeholder: 'Search endpoint / method / name',
    },
    {
      type: 'select',
      options: [
        { value: 'all', label: 'Method: All' },
        { value: 'GET', label: 'GET' },
        { value: 'POST', label: 'POST' },
        { value: 'PUT', label: 'PUT' },
        { value: 'DELETE', label: 'DELETE' },
      ],
    },
    {
      type: 'select',
      options: [
        { value: 'all', label: 'Status: All' },
        { value: 'enabled', label: 'Enabled' },
        { value: 'disabled', label: 'Disabled' },
      ],
    },
    { type: 'button', label: 'More Filters', className: 'secondary' },
  ], [])

  // Memoize stats array
  const statsItems = useMemo(() => [
    { label: 'Total endpoints', value: configs.length },
    { label: 'Enabled', value: enabledCount },
    { label: 'Total cost', value: `$${totalCost}` },
  ], [configs.length, enabledCount, totalCost])

  // Memoize column definitions
  const configColumns = useMemo<Column<ApiConfig>[]>(() => [
    {
      key: 'endpoint',
      label: 'Endpoint',
      render: (config) => (
        <>
          <b>{config.method || 'ALL'} {config.endpoint}</b>
          {config.name && (
            <div className="muted" style={{ fontSize: '11px' }}>
              {config.name}
            </div>
          )}
        </>
      ),
    },
    { key: 'description', label: 'Description', render: (config) => config.description || '—' },
    { key: 'cost', label: 'Cost/Request', render: (config) => `$${config.costPerRequest.toFixed(4)}` },
    {
      key: 'status',
      label: 'Status',
      render: (config) =>
        config.isEnabled ? (
          <span className="chip">
            <span className="dot" />
            Enabled
          </span>
        ) : (
          <span className="chip">
            <span className="dot warn" />
            Disabled
          </span>
        ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (config) => (
        <div style={ACTION_CONTAINER_STYLE}>
          <button
            className="btn secondary"
            style={ACTION_BUTTON_STYLE}
            onClick={(e) => {
              e.stopPropagation()
              // TODO: Edit config
            }}
          >
            Edit
          </button>
          <button
            className="btn secondary"
            style={ACTION_BUTTON_STYLE}
            onClick={(e) => {
              e.stopPropagation()
              // TODO: View traces for this endpoint
            }}
          >
            View Traces
          </button>
        </div>
      ),
    },
  ], [])

  // Memoize handlers
  const handleRowClick = useCallback((config: ApiConfig) => {
    // TODO: Open config detail drawer
    console.log('Open config:', config.id)
  }, [])

  return (
    <AppShell projectId={projectId} projectName={projectName}>
      <PageHeader
        title="API Config"
        subtitle="Define API endpoints, cost per request, capture toggles, and monitoring defaults (per endpoint)."
        dataMode="CP"
        actions={
          <>
            <ThemeToggle />
            <button className="btn" onClick={() => {}}>
              Add Endpoint
            </button>
          </>
        }
      />

      {/* Note Section */}
      <div className="note" style={{ marginTop: '18px' }}>
        <b>API Catalog</b>
        <div className="muted" style={{ marginTop: '6px' }}>
          Used for cost analytics + monitoring + capture policy. Must match real endpoints seen in traces.
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar filters={filterItems} stats={statsItems} />

      {/* Configs Table */}
      <DataTable
        data={configs}
        columns={configColumns}
        loading={loading}
        emptyMessage="No API configs found"
        onRowClick={handleRowClick}
        footerNote="Implementation: API Config defines endpoints for cost analytics, monitoring, and capture policy. Changes affect cost calculations and monitoring."
      />
    </AppShell>
  )
}

