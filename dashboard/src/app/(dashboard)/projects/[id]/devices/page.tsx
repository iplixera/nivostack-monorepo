'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import DataTable, { Column } from '@/components/DataTable'
import DeviceDrawer from '@/components/DeviceDrawer'
import { DeviceQuery, parseDeviceQuery, serializeDeviceQuery } from '@/lib/deviceQuery'

type Device = {
  id: string
  deviceId: string
  platform: string
  environment: string
  osVersion: string | null
  appVersion: string | null
  model: string | null
  manufacturer: string | null
  deviceCode: string | null
  lastSeenAt: string
  createdAt: string
  debugModeEnabled?: boolean
  debugModeEnabledAt?: string | null
  debugModeEnabledBy?: string | null
  userId?: string | null
  userEmail?: string | null
  userName?: string | null
  status: string
}

type Summary = {
  kpis: {
    totalDevices: number
    activeDevices: number
    debugOnDevices: number
    newDevices: number
  }
  usage: {
    current: number
    limit: number
    percent: number
  }
}

type Facet = {
  value: string
  label: string
  count: number
}

type Facets = {
  platform: Facet[]
  environment: Facet[]
  appVersion: Facet[]
  osVersion: Facet[]
}

export default function DevicesPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { token } = useAuth()
  const projectId = params?.id as string

  // Single source of truth: query state
  const [query, setQuery] = useState<DeviceQuery>(() => 
    parseDeviceQuery(searchParams || new URLSearchParams())
  )

  // Data state
  const [devices, setDevices] = useState<Device[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [facets, setFacets] = useState<Facets | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null)

  // Update URL when query changes
  useEffect(() => {
    const queryString = serializeDeviceQuery(query)
    router.replace(
      `/projects/${projectId}/devices${queryString ? `?${queryString}` : ''}`,
      { scroll: false }
    )
  }, [query, projectId, router])

  // Fetch all data when query changes
  const fetchData = useCallback(async () => {
    if (!token || !projectId) return

    try {
      setLoading(true)
      setError('')

      const queryString = serializeDeviceQuery(query)

      // Fetch all three endpoints in parallel
      const [devicesRes, summaryRes, facetsRes] = await Promise.all([
        fetch(`/api/projects/${projectId}/devices?${queryString}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`/api/projects/${projectId}/devices/summary?${queryString}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`/api/projects/${projectId}/devices/facets?${queryString}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
      ])

      if (!devicesRes.ok || !summaryRes.ok || !facetsRes.ok) {
        throw new Error('Failed to fetch data')
      }

      const [devicesData, summaryData, facetsData] = await Promise.all([
        devicesRes.json(),
        summaryRes.json(),
        facetsRes.json(),
      ])

      setDevices(devicesData.devices || [])
      setSummary(summaryData)
      setFacets(facetsData.facets)
    } catch (error: any) {
      console.error('Failed to fetch devices data:', error)
      setError(error.message || 'Failed to load devices')
    } finally {
      setLoading(false)
    }
  }, [token, projectId, query])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Update query state (single function for all filter changes)
  const updateQuery = useCallback((updates: Partial<DeviceQuery>) => {
    setQuery(prev => ({
      ...prev,
      ...updates,
      page: updates.page !== undefined ? updates.page : 1, // Reset to page 1 unless page is explicitly set
    }))
  }, [])

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setQuery({
      platform: 'all',
      environment: 'all',
      debug: 'all',
      appVersion: 'all',
      osVersion: 'all',
      timeRange: { preset: '24h' },
      page: 1,
      pageSize: 50,
    })
  }, [])

  // Toggle debug mode
  const handleToggleDebug = useCallback(async (deviceId: string, currentState: boolean) => {
    if (!confirm(currentState ? 'Disable debug mode?' : 'Enable debug mode for 24 hours?')) return

    try {
      const response = await fetch(`/api/devices/${deviceId}/debug`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ enabled: !currentState, durationHours: 24 })
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to toggle debug mode')
      }

      // Refresh data
      await fetchData()
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    }
  }, [token, fetchData])

  // Export CSV
  const handleExport = useCallback(() => {
    const queryString = serializeDeviceQuery(query)
    const url = `/api/projects/${projectId}/devices/export?${queryString}`
    window.open(url, '_blank')
  }, [projectId, query])

  // Device columns
  const deviceColumns = useMemo<Column<Device>[]>(() => [
    {
      key: 'device',
      label: 'Device',
      render: (d) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <b>{d.deviceId}</b>
            {d.deviceCode && <span className="muted" style={{ fontSize: '10px' }}>({d.deviceCode})</span>}
          </div>
          {d.userEmail && <div className="muted" style={{ fontSize: '10px', marginTop: '2px' }}>{d.userEmail}</div>}
        </div>
      ),
    },
    {
      key: 'platform',
      label: 'Platform',
      render: (d) => (
        <span className="chip" style={{ textTransform: 'capitalize' }}>
          {d.platform}
        </span>
      )
    },
    {
      key: 'environment',
      label: 'Environment',
      render: (d) => (
        <span className="chip" style={{
          fontSize: '10px',
          textTransform: 'capitalize',
          background: d.environment === 'production' ? 'var(--a)' :
                     d.environment === 'staging' ? 'var(--w)' :
                     'var(--m)',
          color: 'white',
          padding: '3px 8px'
        }}>
          {d.environment}
        </span>
      )
    },
    { key: 'appVersion', label: 'App', render: (d) => d.appVersion || '-' },
    { key: 'osVersion', label: 'OS', render: (d) => d.osVersion || '-' },
    { key: 'model', label: 'Model', render: (d) => d.model || '-' },
    {
      key: 'lastSeenAt',
      label: 'Last Seen',
      render: (d) => {
        const diff = Date.now() - new Date(d.lastSeenAt).getTime()
        const mins = Math.floor(diff / 60000)
        const hrs = Math.floor(diff / 3600000)
        const days = Math.floor(diff / 86400000)

        let status = 'Offline'
        let statusColor = 'var(--m)'
        if (mins < 5) { status = 'Online'; statusColor = 'var(--a)' }
        else if (hrs < 24) { status = 'Idle'; statusColor = 'var(--w)' }

        const timeAgo = mins < 1 ? 'now' : mins < 60 ? `${mins}m` : hrs < 24 ? `${hrs}h` : `${days}d`

        return (
          <div>
            <span style={{ fontSize: '12px' }}>{timeAgo}</span>
            <div style={{ fontSize: '10px', color: statusColor, marginTop: '2px' }}>{status}</div>
          </div>
        )
      },
    },
    {
      key: 'debug',
      label: 'Debug',
      render: (d) => {
        if (d.debugModeEnabled) {
          return (
            <div>
              <span className="chip" style={{ background: 'var(--w)', color: 'white', fontSize: '10px' }}>ON</span>
              {d.debugModeEnabledBy && (
                <div className="muted" style={{ fontSize: '9px', marginTop: '2px' }}>
                  by {d.debugModeEnabledBy.slice(0, 8)}
                </div>
              )}
            </div>
          )
        }
        return <span className="chip" style={{ opacity: 0.5, fontSize: '10px' }}>OFF</span>
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (d) => (
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            className="btn secondary"
            style={{ padding: '4px 8px', fontSize: '10px' }}
            onClick={(e) => {
              e.stopPropagation()
              setSelectedDeviceId(d.id)
            }}
          >
            View
          </button>
          <button
            className="btn secondary"
            style={{ padding: '4px 8px', fontSize: '10px' }}
            onClick={(e) => {
              e.stopPropagation()
              handleToggleDebug(d.id, d.debugModeEnabled || false)
            }}
          >
            {d.debugModeEnabled ? 'Disable' : 'Debug'}
          </button>
        </div>
      ),
    },
  ], [handleToggleDebug])

  // Usage color
  const usagePercent = summary?.usage.percent || 0
  const getUsageColor = (percent: number) => {
    if (percent >= 90) return '#EF4444'
    if (percent >= 80) return '#F59E0B'
    return '#22C55E'
  }

  // Check if has filters
  const hasFilters = query.q || query.platform !== 'all' || query.environment !== 'all' ||
    query.debug !== 'all' || query.appVersion !== 'all' || query.osVersion !== 'all' ||
    query.timeRange?.preset !== '24h'

  return (
    <div style={{ padding: '20px 24px', maxWidth: '100%' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 6px 0' }}>Devices</h1>
        <p style={{ fontSize: '14px', color: 'var(--m)', margin: 0 }}>
          Device registry and debug management
          <span style={{ marginLeft: '12px', fontSize: '11px', opacity: 0.7 }}>
            Counts: Aggregated (hourly) • Rows: Raw registry (live last_seen)
          </span>
        </p>
      </div>

      {/* Usage Bar + Warnings */}
      {summary && (
        <>
          <div className="card" style={{ padding: '16px', marginBottom: '12px', borderLeft: `4px solid ${getUsageColor(usagePercent)}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600' }}>Device Usage</span>
              <span style={{ fontSize: '14px', fontWeight: '700', color: getUsageColor(usagePercent) }}>
                {summary.usage.current.toLocaleString()} / {summary.usage.limit.toLocaleString()} ({usagePercent}%)
              </span>
            </div>
            <div style={{ height: '8px', background: 'var(--s2)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${usagePercent}%`, height: '100%', background: getUsageColor(usagePercent), transition: 'width 0.3s' }} />
            </div>
          </div>

          {/* Usage Warnings */}
          {usagePercent >= 100 && (
            <div className="card" style={{ padding: '12px 16px', marginBottom: '12px', background: '#FEE2E2', border: '1px solid #EF4444' }}>
              <strong style={{ color: '#DC2626' }}>⛔ Device limit reached</strong>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#991B1B' }}>
                New device registrations may be throttled or dropped. <a href="/subscription" style={{ textDecoration: 'underline' }}>Upgrade to continue</a>.
              </p>
            </div>
          )}
          {usagePercent >= 90 && usagePercent < 100 && (
            <div className="card" style={{ padding: '12px 16px', marginBottom: '12px', background: '#FEF3C7', border: '1px solid #F59E0B' }}>
              <strong style={{ color: '#D97706' }}>⚠️ 90% of device limit used</strong>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#92400E' }}>
                New devices may be throttled soon. <a href="/subscription" style={{ textDecoration: 'underline' }}>Consider upgrading</a>.
              </p>
            </div>
          )}
          {usagePercent >= 80 && usagePercent < 90 && (
            <div className="card" style={{ padding: '12px 16px', marginBottom: '12px', background: '#FEF3C7', border: '1px solid #F59E0B' }}>
              <strong style={{ color: '#D97706' }}>⚠️ You've used 80% of your device limit</strong>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#92400E' }}>
                <a href="/subscription" style={{ textDecoration: 'underline' }}>Consider upgrading</a> to avoid throttling.
              </p>
            </div>
          )}
        </>
      )}

      {/* KPI Cards */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '16px' }}>
          <div className="card" style={{ padding: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>{summary.kpis.totalDevices.toLocaleString()}</div>
            <div style={{ fontSize: '12px', color: 'var(--m)' }}>Total Devices</div>
          </div>
          <div className="card" style={{ padding: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>{summary.kpis.activeDevices.toLocaleString()}</div>
            <div style={{ fontSize: '12px', color: 'var(--m)' }}>Active (Range)</div>
          </div>
          <div className="card" style={{ padding: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px', color: 'var(--w)' }}>{summary.kpis.debugOnDevices}</div>
            <div style={{ fontSize: '12px', color: 'var(--m)' }}>Debug ON</div>
          </div>
          <div className="card" style={{ padding: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px', color: 'var(--a)' }}>{summary.kpis.newDevices}</div>
            <div style={{ fontSize: '12px', color: 'var(--m)' }}>New (Range)</div>
          </div>
        </div>
      )}

      {/* Facet Chips */}
      {facets && (
        <div className="card" style={{ padding: '16px', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>Platform Distribution</h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
            {facets.platform.slice(0, 5).map((f) => (
              <button
                key={f.value}
                className={`chip ${query.platform === f.value ? 'active' : ''}`}
                style={{
                  cursor: 'pointer',
                  padding: '6px 12px',
                  background: query.platform === f.value ? 'var(--p)' : 'var(--s2)',
                  color: query.platform === f.value ? 'white' : 'inherit',
                }}
                onClick={() => updateQuery({ platform: f.value as any })}
              >
                <span style={{ fontWeight: '600', marginRight: '6px' }}>{f.label}</span>
                <span style={{ opacity: 0.7 }}>{f.count}</span>
              </button>
            ))}
          </div>

          <h3 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>Environment</h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
            {facets.environment.map((f) => (
              <button
                key={f.value}
                className={`chip ${query.environment === f.value ? 'active' : ''}`}
                style={{
                  cursor: 'pointer',
                  padding: '6px 12px',
                  background: query.environment === f.value ? 'var(--p)' : 'var(--s2)',
                  color: query.environment === f.value ? 'white' : 'inherit',
                }}
                onClick={() => updateQuery({ environment: f.value })}
              >
                <span style={{ fontWeight: '600', marginRight: '6px' }}>{f.label}</span>
                <span style={{ opacity: 0.7 }}>{f.count}</span>
              </button>
            ))}
          </div>

          <h3 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>App Version (Top 5)</h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
            {facets.appVersion.slice(0, 5).map((f) => (
              <button
                key={f.value}
                className={`chip ${query.appVersion === f.value ? 'active' : ''}`}
                style={{
                  cursor: 'pointer',
                  padding: '6px 12px',
                  background: query.appVersion === f.value ? 'var(--p)' : 'var(--s2)',
                  color: query.appVersion === f.value ? 'white' : 'inherit',
                }}
                onClick={() => updateQuery({ appVersion: f.value })}
              >
                <span style={{ fontWeight: '600', marginRight: '6px' }}>{f.label}</span>
                <span style={{ opacity: 0.7 }}>{f.count}</span>
              </button>
            ))}
            {facets.appVersion.length > 5 && (
              <span className="chip" style={{ opacity: 0.6, fontSize: '11px' }}>
                +{facets.appVersion.length - 5} more
              </span>
            )}
          </div>

          <h3 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>OS Version (Top 5)</h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {facets.osVersion.slice(0, 5).map((f) => (
              <button
                key={f.value}
                className={`chip ${query.osVersion === f.value ? 'active' : ''}`}
                style={{
                  cursor: 'pointer',
                  padding: '6px 12px',
                  background: query.osVersion === f.value ? 'var(--p)' : 'var(--s2)',
                  color: query.osVersion === f.value ? 'white' : 'inherit',
                }}
                onClick={() => updateQuery({ osVersion: f.value })}
              >
                <span style={{ fontWeight: '600', marginRight: '6px' }}>{f.label}</span>
                <span style={{ opacity: 0.7 }}>{f.count}</span>
              </button>
            ))}
            {facets.osVersion.length > 5 && (
              <span className="chip" style={{ opacity: 0.6, fontSize: '11px' }}>
                +{facets.osVersion.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="card" style={{ padding: '14px 16px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="input"
            placeholder="Search deviceId, userId, email, model..."
            value={query.q || ''}
            onChange={(e) => updateQuery({ q: e.target.value || undefined })}
            style={{ flex: '1 1 280px', minWidth: '280px' }}
          />

          <select
            className="select"
            value={query.platform || 'all'}
            onChange={(e) => updateQuery({ platform: e.target.value as any })}
            style={{ minWidth: '140px' }}
          >
            <option value="all">All Platforms</option>
            {facets?.platform.map(p => (
              <option key={p.value} value={p.value}>{p.label} ({p.count})</option>
            ))}
          </select>

          <select
            className="select"
            value={query.environment || 'all'}
            onChange={(e) => updateQuery({ environment: e.target.value })}
            style={{ minWidth: '140px' }}
          >
            <option value="all">All Envs</option>
            {facets?.environment.map(e => (
              <option key={e.value} value={e.value}>{e.label} ({e.count})</option>
            ))}
          </select>

          <select
            className="select"
            value={query.debug || 'all'}
            onChange={(e) => updateQuery({ debug: e.target.value as any })}
            style={{ minWidth: '130px' }}
          >
            <option value="all">All Debug</option>
            <option value="on">Debug ON</option>
            <option value="off">Debug OFF</option>
          </select>

          <select
            className="select"
            value={query.timeRange?.preset || '24h'}
            onChange={(e) => updateQuery({ timeRange: { preset: e.target.value as any } })}
            style={{ minWidth: '130px' }}
          >
            <option value="all">All Time</option>
            <option value="24h">Last 24h</option>
            <option value="7d">Last 7d</option>
            <option value="30d">Last 30d</option>
          </select>

          {hasFilters && (
            <button className="btn secondary" onClick={handleClearFilters} style={{ padding: '10px 16px' }}>
              Clear
            </button>
          )}

          <button className="btn secondary" onClick={handleExport} style={{ padding: '10px 16px' }}>
            Export CSV
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="card" style={{ padding: '16px', borderLeft: '4px solid var(--d)', marginBottom: '16px' }}>
          <strong>Error:</strong> {error}
          <button className="btn secondary" style={{ marginLeft: '12px' }} onClick={fetchData}>Retry</button>
        </div>
      )}

      {/* Empty State - Only show if total is actually 0 */}
      {!loading && !error && devices.length === 0 && (
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', opacity: 0.3 }}>📱</div>
          <h3 style={{ marginTop: '16px' }}>No devices found</h3>
          <p className="muted">{hasFilters ? 'Try different filters' : 'No devices connected yet'}</p>
        </div>
      )}

      {/* Devices Table */}
      {!error && devices.length > 0 && (
        <DataTable
          data={devices}
          columns={deviceColumns}
          loading={loading}
          emptyMessage="No devices"
          onRowClick={(d) => setSelectedDeviceId(d.id)}
          pagination={
            (summary?.kpis.totalDevices || 0) > (query.pageSize || 50) ? {
              currentPage: query.page || 1,
              totalPages: Math.ceil((summary?.kpis.totalDevices || 0) / (query.pageSize || 50)),
              onPageChange: (page) => updateQuery({ page }),
            } : undefined
          }
        />
      )}

      {/* Device Detail Drawer */}
      {selectedDeviceId && token && (
        <DeviceDrawer
          deviceId={selectedDeviceId}
          token={token}
          onClose={() => setSelectedDeviceId(null)}
        />
      )}
    </div>
  )
}
