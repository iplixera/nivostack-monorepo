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

type BusinessConfig = {
  id: string
  key: string
  label: string | null
  description: string | null
  valueType: string
  stringValue: string | null
  integerValue: number | null
  booleanValue: boolean | null
  decimalValue: number | null
  jsonValue: unknown
  category?: { id: string; name: string }
}

export default function BusinessConfigPage() {
  const params = useParams()
  const { token } = useAuth()
  const projectId = params?.id as string

  const [configs, setConfigs] = useState<BusinessConfig[]>([])
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

  const fetchConfigs = useCallback(async () => {
    if (!token || !projectId) return
    try {
      setLoading(true)
      const response = await api.businessConfig.list(projectId, token)
      setConfigs(response.configs || [])
      setTotalPages(Math.ceil((response.configs?.length || 0) / 20))
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

  // Memoize helper function
  const getValueDisplay = useCallback((config: BusinessConfig) => {
    switch (config.valueType) {
      case 'string':
        return config.stringValue || '—'
      case 'integer':
        return config.integerValue?.toString() || '—'
      case 'boolean':
        return config.booleanValue ? 'true' : 'false'
      case 'decimal':
        return config.decimalValue?.toString() || '—'
      case 'json':
        return JSON.stringify(config.jsonValue)
      default:
        return '—'
    }
  }, [])

  // Memoize filter array
  const filterItems = useMemo<FilterItem[]>(() => [
    {
      type: 'search',
      placeholder: 'Search config key / label / category',
      value: searchQuery,
      onChange: setSearchQuery,
    },
    {
      type: 'select',
      options: [
        { value: 'all', label: 'Category: All' },
      ],
    },
    {
      type: 'select',
      options: [
        { value: 'all', label: 'Type: All' },
        { value: 'string', label: 'String' },
        { value: 'integer', label: 'Integer' },
        { value: 'boolean', label: 'Boolean' },
      ],
    },
    { type: 'button', label: 'More Filters', className: 'secondary' },
    { type: 'button', label: 'Export', className: 'secondary' },
  ], [searchQuery])

  // Memoize stats array
  const statsItems = useMemo(() => [
    { label: 'Total keys', value: configs.length },
    { label: 'Categories', value: '8' },
    { label: 'Usage', value: '82%', dot: 'warn' as const },
  ], [configs.length])

  // Memoize column definitions
  const configColumns = useMemo<Column<BusinessConfig>[]>(() => [
    {
      key: 'key',
      label: 'Key',
      render: (config) => (
        <>
          <b>{config.key}</b>
          {config.label && (
            <div className="muted" style={{ fontSize: '11px' }}>
              {config.label}
            </div>
          )}
        </>
      ),
    },
    { key: 'category', label: 'Category', render: (config) => config.category?.name || '—' },
    { key: 'type', label: 'Type', render: (config) => config.valueType },
    {
      key: 'value',
      label: 'Value',
      render: (config) => (
        <span className="muted" style={{ fontFamily: 'ui-monospace', fontSize: '11px' }}>
          {getValueDisplay(config)}
        </span>
      ),
    },
    { key: 'description', label: 'Description', render: (config) => config.description || '—' },
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
              // TODO: Delete config
            }}
          >
            Delete
          </button>
        </div>
      ),
    },
  ], [getValueDisplay])

  // Memoize handlers
  const handleRowClick = useCallback((config: BusinessConfig) => {
    // TODO: Open config detail drawer
    console.log('Open config:', config.id)
  }, [])

  const paginationConfig = useMemo(() => totalPages > 1 ? {
    currentPage: page,
    totalPages,
    onPageChange: setPage,
  } : undefined, [totalPages, page])

  return (
    <AppShell projectId={projectId} projectName={projectName}>
      <PageHeader
        title="Business Config"
        subtitle="Manage business configuration keys and values. Supports categories, versioning, and A/B testing."
        dataMode="CP"
        actions={
          <>
            <ThemeToggle />
            <button className="btn" onClick={() => {}}>
              Create Config
            </button>
          </>
        }
      />

      {/* Note Section */}
      <div className="note" style={{ marginTop: '18px' }}>
        <b>Mapping to current functions</b>
        <div className="muted" style={{ marginTop: '6px' }}>
          Keep current behavior: config CRUD, categories, versioning. Add quota warnings and usage tracking.
        </div>
      </div>

      {/* Quota Warning */}
      <div
        className="warnBox"
        style={{
          marginTop: '14px',
          borderLeft: '4px solid var(--w)',
          padding: '10px 12px',
          borderRadius: '12px',
          background: 'linear-gradient(180deg, var(--s), var(--s2))',
          border: '1px solid var(--b)',
        }}
      >
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div>
            <b>Quota warning: 82% used</b>
            <div className="muted" style={{ marginTop: '4px', fontSize: '12px' }}>
              You are close to the monthly limit for <b>Business Config Keys</b>.
            </div>
          </div>
          <div className="row">
            <a href={`/projects/${projectId}/billing`} className="btn secondary">
              Review usage
            </a>
            <button className="btn" onClick={() => {}}>
              Upgrade
            </button>
          </div>
        </div>
        <div style={{ marginTop: '10px' }} className="progress">
          <div className="bar warn" style={{ width: '82%', height: '100%', background: 'var(--w)', borderRadius: '999px' }} />
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar filters={filterItems} stats={statsItems} />

      {/* Configs Table */}
      <DataTable
        data={configs}
        columns={configColumns}
        loading={loading}
        emptyMessage="No configs found"
        onRowClick={handleRowClick}
        pagination={paginationConfig}
        footerNote="Implementation: Business config supports categories, versioning, and A/B testing. Changes are versioned and can be rolled back."
      />
    </AppShell>
  )
}

