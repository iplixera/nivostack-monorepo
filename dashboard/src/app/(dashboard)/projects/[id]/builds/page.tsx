'use client'

import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { api } from '@/lib/api'
import PageHeader from '@/components/layout/PageHeader'
import ThemeToggle from '@/components/ThemeToggle'
import DataTable, { Column } from '@/components/DataTable'
import FilterBar, { FilterItem } from '@/components/FilterBar'

type Build = {
  id: string
  version: string
  environment: 'preview' | 'production'
  status: 'active' | 'promoted' | 'archived'
  createdAt: string
  promotedAt: string | null
  changeLog: string | null
  configChanges: number
  localizationChanges: number
}

export default function BuildsPage() {
  const params = useParams()
  const { token } = useAuth()
  const projectId = params?.id as string

  const [builds, setBuilds] = useState<Build[]>([])
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

  const fetchBuilds = useCallback(async () => {
    if (!token || !projectId) return
    try {
      setLoading(true)
      // TODO: Implement builds API
      setBuilds([])
    } catch (error) {
      console.error('Failed to fetch builds:', error)
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
      fetchBuilds()
    }
  }, [token, projectId, fetchProject, fetchBuilds, projectName])

  // Style constants
  const ACTION_BUTTON_STYLE: React.CSSProperties = { padding: '7px 10px', fontSize: '11px' }
  const ACTION_CONTAINER_STYLE: React.CSSProperties = { display: 'flex', gap: '8px', flexWrap: 'wrap' }

  // Memoize filter array
  const filterItems = useMemo<FilterItem[]>(() => [
    {
      type: 'select',
      options: [
        { value: 'all', label: 'Environment: All' },
        { value: 'preview', label: 'Preview' },
        { value: 'production', label: 'Production' },
      ],
    },
    {
      type: 'select',
      options: [
        { value: 'all', label: 'Status: All' },
        { value: 'active', label: 'Active' },
        { value: 'promoted', label: 'Promoted' },
      ],
    },
    { type: 'button', label: 'More Filters', className: 'secondary' },
  ], [])

  // Memoize stats array
  const statsItems = useMemo(() => [
    { label: 'Preview builds', value: '3' },
    { label: 'Production builds', value: '12' },
    { label: 'Pending promotion', value: '1', dot: 'warn' as const },
  ], [])

  // Memoize column definitions
  const buildColumns = useMemo<Column<Build>[]>(() => [
    { key: 'version', label: 'Version', render: (build) => <b>{build.version}</b> },
    {
      key: 'environment',
      label: 'Environment',
      render: (build) => (
        <span className="chip">
          {build.environment === 'production' ? 'Production' : 'Preview'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (build) => (
        <span className="chip">
          <span className="dot" />
          {build.status}
        </span>
      ),
    },
    {
      key: 'changes',
      label: 'Changes',
      render: (build) => (
        <span className="muted">
          {build.configChanges} config, {build.localizationChanges} l10n
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (build) => (
        <span className="muted">{new Date(build.createdAt).toLocaleDateString()}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (build) => (
        <div style={ACTION_CONTAINER_STYLE}>
          {build.environment === 'preview' && (
            <button
              className="btn secondary"
              style={ACTION_BUTTON_STYLE}
              onClick={(e) => {
                e.stopPropagation()
                // TODO: Promote build
              }}
            >
              Promote
            </button>
          )}
          <button
            className="btn secondary"
            style={ACTION_BUTTON_STYLE}
            onClick={(e) => {
              e.stopPropagation()
              // TODO: View build details
            }}
          >
            View
          </button>
        </div>
      ),
    },
  ], [])

  // Memoize handlers
  const handleRowClick = useCallback((build: Build) => {
    // TODO: Open build detail drawer
    console.log('Open build:', build.id)
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Builds"
        subtitle="Versioning snapshots for Config + Localization. Promote Preview → Production with change log and rollback."
        dataMode="Rel"
        actions={
          <>
            <ThemeToggle />
            <button className="btn" onClick={() => {}}>
              Create Build
            </button>
          </>
        }
      />

      {/* Note Section */}
      <div className="note" style={{ marginTop: '18px' }}>
        <b>Build Mode</b>
        <div className="muted" style={{ marginTop: '6px' }}>
          Preview build can be different from Production build. Promote when ready.
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar filters={filterItems} stats={statsItems} />

      {/* Builds Table */}
      <DataTable
        data={builds}
        columns={buildColumns}
        loading={loading}
        emptyMessage="No builds found"
        onRowClick={handleRowClick}
        footerNote="Implementation: Builds version Config and Localization. Promote Preview → Production with change log and rollback support."
      />
    </div>
  )
}
