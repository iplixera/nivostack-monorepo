'use client'

import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { api } from '@/lib/api'
import PageHeader from '@/components/layout/PageHeader'
import ThemeToggle from '@/components/ThemeToggle'
import FilterBar, { FilterItem } from '@/components/FilterBar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
// Icons replaced with text/symbols
import Link from 'next/link'

export default function DashboardPage() {
  const params = useParams()
  const { token } = useAuth()
  const projectId = params?.id as string

  const [projectName, setProjectName] = useState('')
  const [dataMode, setDataMode] = useState<'aggregated' | 'raw'>('raw')
  const [stats, setStats] = useState({
    activeDevices: 0,
    sessions: 0,
    apiRequests: 0,
    errorRate: 0,
    p95Latency: 0,
    costEstimate: 0,
    logs: 0,
    crashes: 0,
    status2xx: 0,
    status4xx: 0,
    status5xx: 0,
    avgSessionDuration: 0,
    avgScreensPerSession: 0,
    avgEventsPerSession: 0,
    sessionErrorRate: 0,
    uniqueCrashMessages: 0,
    logErrorCount: 0,
  })

  const fetchProject = useCallback(async () => {
    if (!token || !projectId) return
    try {
      // Fetch project info and stats in parallel
      const [projectData, statsData] = await Promise.all([
        api.projects.list(token),
        fetch(`/api/projects/${projectId}/stats?mode=${dataMode}&timeRange=24h`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).then(res => {
          if (!res.ok) {
            console.error('Stats API error:', res.status, res.statusText)
            return { stats: {} }
          }
          return res.json()
        }).catch(error => {
          console.error('Stats API fetch error:', error)
          return { stats: {} }
        })
      ])

      const project = projectData.projects?.find(p => p.id === projectId)
      setProjectName(project?.name || 'Project')

      // Use aggregated stats from the new endpoint
      if (statsData && statsData.stats) {
        setStats({
          activeDevices: statsData.stats.activeDevices || 0,
          sessions: statsData.stats.sessions || 0,
          apiRequests: statsData.stats.apiRequests || 0,
          errorRate: statsData.stats.errorRate || 0,
          p95Latency: Math.round(statsData.stats.p95Latency || 0),
          costEstimate: Math.round(statsData.stats.costEstimate || 0),
          logs: statsData.stats.logs || 0,
          crashes: statsData.stats.crashes || 0,
          status2xx: statsData.stats.status2xx || 0,
          status4xx: statsData.stats.status4xx || 0,
          status5xx: statsData.stats.status5xx || 0,
          avgSessionDuration: Math.round(statsData.stats.avgSessionDuration || 0),
          avgScreensPerSession: Math.round(statsData.stats.avgScreensPerSession || 0),
          avgEventsPerSession: Math.round(statsData.stats.avgEventsPerSession || 0),
          sessionErrorRate: statsData.stats.sessionErrorRate || 0,
          uniqueCrashMessages: statsData.stats.uniqueCrashMessages || 0,
          logErrorCount: statsData.stats.logErrorCount || 0,
        })
      }
    } catch (error) {
      console.error('Failed to fetch project data:', error)
      // Fallback to basic project data
      try {
        const data = await api.projects.list(token)
        const project = data.projects?.find(p => p.id === projectId)
        setProjectName(project?.name || 'Project')
        if (project) {
          setStats(prev => ({
            ...prev,
            activeDevices: project._count?.devices || 0,
            sessions: project._count?.sessions || 0,
            apiRequests: project._count?.apiTraces || 0,
          }))
        }
      } catch (fallbackError) {
        console.error('Fallback fetch also failed:', fallbackError)
      }
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
      type: 'search',
      placeholder: 'Search (endpoint, screen, version, device, user)',
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
        { value: 'all', label: 'Segment: All' },
        { value: 'ios', label: 'iOS' },
        { value: 'android', label: 'Android' },
        { value: 'debug', label: 'Debug Enabled' },
      ],
    },
    { type: 'button', label: 'More Filters', className: 'secondary' },
    { type: 'button', label: 'Saved Views', className: 'secondary' },
  ], [])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle={`Health snapshot with drilldowns to raw pages (devices/traces/logs/crashes).`}
        dataMode={dataMode === 'aggregated' ? 'Aggregated' : 'Raw'}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Button
                variant={dataMode === 'aggregated' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDataMode('aggregated')}
                className="flex items-center gap-2"
              >
                📊
                Aggregated
              </Button>
              <Button
                variant={dataMode === 'raw' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDataMode('raw')}
                className="flex items-center gap-2"
              >
                🔍
                Raw (Debug)
              </Button>
            </div>
          </div>
        }
      />

      {/* Status Row */}
      <div className="card" style={{ marginTop: '18px' }}>
        <div className="statusRow">
          <span className="chip">
            <span className="dot" style={{ background: dataMode === 'aggregated' ? 'var(--success)' : 'var(--info)' }} />
            {dataMode === 'aggregated' ? 'Showing aggregated metrics (fast)' : 'Showing raw data (debug mode)'}
          </span>
          <span className="chip">
            <span className="dot" />
            Time range: Last 24 hours
          </span>
          {dataMode === 'aggregated' && (
            <span className="chip" style={{ color: 'var(--m)', fontSize: '11px' }}>
              💡 Click any metric to drill down to raw data
            </span>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar filters={filterItems} />

      {/* KPI Strip */}
      <div className="card" style={{ marginTop: '14px' }}>
        <div className="kpis" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px' }}>
          <Link 
            href={`/projects/${projectId}/devices?timeRangePreset=24h`}
            className="kpi" 
            style={{ 
              padding: '12px', 
              borderRadius: '14px', 
              border: '1px solid var(--b)', 
              background: 'linear-gradient(180deg, var(--s), var(--s2))',
              cursor: 'pointer',
              transition: 'all 0.2s',
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <b style={{ fontSize: '18px', color: 'var(--t)' }}>{stats.activeDevices}</b>
            <span style={{ display: 'block', color: 'var(--m)', fontSize: '11px', marginTop: '4px' }}>
              Active Devices (24h)
            </span>
          </Link>
          <Link 
            href={`/projects/${projectId}/sessions?timeRangePreset=24h`}
            className="kpi" 
            style={{ 
              padding: '12px', 
              borderRadius: '14px', 
              border: '1px solid var(--b)', 
              background: 'linear-gradient(180deg, var(--s), var(--s2))',
              cursor: 'pointer',
              transition: 'all 0.2s',
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <b style={{ fontSize: '18px', color: 'var(--t)' }}>{stats.sessions.toLocaleString()}</b>
            <span style={{ display: 'block', color: 'var(--m)', fontSize: '11px', marginTop: '4px' }}>
              Sessions (24h)
            </span>
          </Link>
          <Link 
            href={`/projects/${projectId}/traces?timeRangePreset=24h`}
            className="kpi" 
            style={{ 
              padding: '12px', 
              borderRadius: '14px', 
              border: '1px solid var(--b)', 
              background: 'linear-gradient(180deg, var(--s), var(--s2))',
              cursor: 'pointer',
              transition: 'all 0.2s',
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <b style={{ fontSize: '18px', color: 'var(--t)' }}>{stats.apiRequests.toLocaleString()}</b>
            <span style={{ display: 'block', color: 'var(--m)', fontSize: '11px', marginTop: '4px' }}>
              API Requests (24h)
            </span>
          </Link>
          <Link 
            href={`/projects/${projectId}/traces?timeRangePreset=24h&statusFilter=error`}
            className="kpi" 
            style={{ 
              padding: '12px', 
              borderRadius: '14px', 
              border: '1px solid var(--b)', 
              background: 'linear-gradient(180deg, var(--s), var(--s2))',
              cursor: 'pointer',
              transition: 'all 0.2s',
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <b style={{ fontSize: '18px', color: stats.errorRate > 5 ? 'var(--error)' : 'var(--t)' }}>{stats.errorRate}%</b>
            <span style={{ display: 'block', color: 'var(--m)', fontSize: '11px', marginTop: '4px' }}>
              Error Rate (24h)
            </span>
          </Link>
          <Link 
            href={`/projects/${projectId}/traces?timeRangePreset=24h&sortBy=latency`}
            className="kpi" 
            style={{ 
              padding: '12px', 
              borderRadius: '14px', 
              border: '1px solid var(--b)', 
              background: 'linear-gradient(180deg, var(--s), var(--s2))',
              cursor: 'pointer',
              transition: 'all 0.2s',
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <b style={{ fontSize: '18px', color: 'var(--t)' }}>{stats.p95Latency}ms</b>
            <span style={{ display: 'block', color: 'var(--m)', fontSize: '11px', marginTop: '4px' }}>
              P95 Latency (24h)
            </span>
          </Link>
          <Link 
            href="/subscription?tab=usage"
            className="kpi" 
            style={{ 
              padding: '12px', 
              borderRadius: '14px', 
              border: '1px solid var(--b)', 
              background: 'linear-gradient(180deg, var(--s), var(--s2))',
              cursor: 'pointer',
              transition: 'all 0.2s',
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <b style={{ fontSize: '18px', color: 'var(--t)' }}>${stats.costEstimate}</b>
            <span style={{ display: 'block', color: 'var(--m)', fontSize: '11px', marginTop: '4px' }}>
              Est. Cost (24h)
            </span>
          </Link>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid" style={{ marginTop: '14px' }}>
        <div className="card" style={{ gridColumn: 'span 8' }}>
          <b>Traffic & Errors</b>
          <div className="muted" style={{ marginTop: '6px' }}>
            Chart uses aggregated query only.
          </div>
          <div
            style={{
              marginTop: '12px',
              border: '1px dashed var(--b)',
              borderRadius: '14px',
              padding: '18px',
              color: 'var(--m)',
              textAlign: 'center',
            }}
          >
            Chart placeholder
          </div>
          <div className="row" style={{ marginTop: '12px' }}>
            <Link href={`/projects/${projectId}/traces`} className="btn secondary">
              View Raw Traces
            </Link>
            <Link href={`/projects/${projectId}/devices`} className="btn secondary">
              View Devices
            </Link>
          </div>
        </div>
        <div className="card" style={{ gridColumn: 'span 4' }}>
          <b>Top Issues</b>
          <div className="hr" />
          <div className="row">
            <span className="chip">
              <span className="dot bad" />
              /v1/login 401 spike
            </span>
            <Link href={`/projects/${projectId}/traces?method=POST&url=/v1/login`} className="btn secondary">
              Open
            </Link>
          </div>
          <div className="row" style={{ marginTop: '10px' }}>
            <span className="chip">
              <span className="dot warn" />
              Crash group: NullPointer
            </span>
            <Link href={`/projects/${projectId}/crashes`} className="btn secondary">
              Open
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
