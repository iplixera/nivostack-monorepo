'use client'

import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { api } from '@/lib/api'
import PageHeader from '@/components/layout/PageHeader'
import ThemeToggle from '@/components/ThemeToggle'
import FilterBar, { FilterItem } from '@/components/FilterBar'

export default function ScreenFlowPage() {
  const params = useParams()
  const { token } = useAuth()
  const projectId = params?.id as string

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

  useEffect(() => {
    if (token && projectId) {
      fetchProject()
    }
  }, [token, projectId, fetchProject])

  // Memoize filter array
  const filterItems = useMemo<FilterItem[]>(() => [
    {
      type: 'select',
      options: [
        { value: '7d', label: 'Time: Last 7d' },
        { value: '24h', label: 'Last 24h' },
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
  ], [])

  // Memoize stats array
  const statsItems = useMemo(() => [
    { label: 'Total screens', value: '45' },
    { label: 'Unique flows', value: '312' },
    { label: 'Avg screens/session', value: '8.2' },
  ], [])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Screen Flow"
        subtitle="Aggregated screen flow visualization with funnels. Drilldown to raw sessions by screen sequence."
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
          Keep current behavior: screen flow tracking and visualization. Add aggregated funnels + drilldown to raw sessions.
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar filters={filterItems} stats={statsItems} />

      {/* Screen Flow Visualization */}
      <div className="card" style={{ marginTop: '14px' }}>
        <b>Screen Flow Visualization</b>
        <div className="muted" style={{ marginTop: '6px' }}>
          Aggregated screen transitions and funnels.
        </div>
        <div
          style={{
            marginTop: '12px',
            border: '1px dashed var(--b)',
            borderRadius: '14px',
            padding: '18px',
            color: 'var(--m)',
            textAlign: 'center',
            minHeight: '400px',
          }}
        >
          Screen Flow Chart Placeholder
          <div className="muted" style={{ marginTop: '8px', fontSize: '11px' }}>
            Implementation: Use aggregated screen flow data to visualize transitions and funnels.
          </div>
        </div>
        <div className="row" style={{ marginTop: '12px' }}>
          <button
            className="btn secondary"
            onClick={() => {
              // TODO: View raw sessions with screen flow filter
            }}
          >
            View Raw Sessions
          </button>
        </div>
        <div className="footerNote" style={{ marginTop: '12px' }}>
          Implementation: Screen flow aggregated by screen transitions. Drilldown shows raw sessions matching the flow pattern.
        </div>
      </div>
    </div>
  )
}

