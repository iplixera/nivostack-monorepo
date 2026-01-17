'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'

type DeviceDetails = {
  device: any
  counts: {
    sessions: number
    logs: number
    crashes: number
    traces: number
  }
}

type Tab = 'overview' | 'sessions' | 'logs' | 'crashes' | 'traces' | 'settings'

export default function DeviceDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { token } = useAuth()
  const projectId = params?.id as string
  const deviceId = params?.deviceId as string

  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [details, setDetails] = useState<DeviceDetails | null>(null)
  const [tabData, setTabData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tabLoading, setTabLoading] = useState(false)

  // Fetch device details
  useEffect(() => {
    const fetchDetails = async () => {
      if (!token || !deviceId) return

      try {
        setLoading(true)
        const response = await fetch(`/api/devices/${deviceId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (response.ok) {
          const data = await response.json()
          setDetails(data)
        }
      } catch (error) {
        console.error('Error fetching device details:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDetails()
  }, [token, deviceId])

  // Fetch tab-specific data
  const fetchTabData = useCallback(async (tab: Tab) => {
    if (tab === 'overview' || tab === 'settings') return

    try {
      setTabLoading(true)
      let url = ''

      if (tab === 'sessions') url = `/api/devices/${deviceId}/sessions?limit=20`
      else if (tab === 'logs') url = `/api/devices/${deviceId}/logs?limit=50`
      else if (tab === 'crashes') url = `/api/devices/${deviceId}/crashes?limit=20`
      else if (tab === 'traces') url = `/api/devices/${deviceId}/traces?limit=50`

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setTabData(data)
      }
    } catch (error) {
      console.error(`Error fetching ${tab} data:`, error)
    } finally {
      setTabLoading(false)
    }
  }, [deviceId, token])

  // Handle tab change
  const handleTabChange = useCallback((tab: Tab) => {
    setActiveTab(tab)
    fetchTabData(tab)
  }, [fetchTabData])

  if (loading) {
    return (
      <div style={{ padding: '20px 24px' }}>
        <div>Loading device details...</div>
      </div>
    )
  }

  if (!details) {
    return (
      <div style={{ padding: '20px 24px' }}>
        <div>Device not found</div>
        <button className="btn secondary" onClick={() => router.back()}>Go Back</button>
      </div>
    )
  }

  const device = details.device
  const counts = details.counts

  return (
    <div style={{ padding: '20px 24px', maxWidth: '1400px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <button
          className="btn secondary"
          onClick={() => router.push(`/projects/${projectId}/devices`)}
          style={{ padding: '6px 12px', fontSize: '12px', marginBottom: '12px' }}
        >
          ← Back to Devices
        </button>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 8px 0' }}>
              {device.deviceId}
            </h1>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span className="chip" style={{ textTransform: 'capitalize' }}>{device.platform}</span>
              <span
                className="chip"
                style={{
                  background: device.environment === 'production' ? 'var(--a)' :
                             device.environment === 'staging' ? 'var(--w)' : 'var(--m)',
                  color: 'white',
                }}
              >
                {device.environment}
              </span>
              {device.debugModeEnabled && (
                <span className="chip" style={{ background: 'var(--w)', color: 'white' }}>
                  Debug ON
                </span>
              )}
            </div>
          </div>
          <div style={{ fontSize: '13px', textAlign: 'right' }}>
            <div className="muted">Last seen</div>
            <div>{new Date(device.lastSeenAt).toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '4px',
        borderBottom: '1px solid var(--b)',
        marginBottom: '24px',
      }}>
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'sessions', label: `Sessions (${counts.sessions})` },
          { id: 'logs', label: `Logs (${counts.logs})` },
          { id: 'crashes', label: `Crashes (${counts.crashes})` },
          { id: 'traces', label: `API Traces (${counts.traces})` },
          { id: 'settings', label: 'Settings' },
        ].map((tab) => (
          <button
            key={tab.id}
            className={`btn ${activeTab === tab.id ? '' : 'secondary'}`}
            style={{
              padding: '10px 16px',
              fontSize: '13px',
              borderRadius: '4px 4px 0 0',
              borderBottom: activeTab === tab.id ? '2px solid var(--p)' : 'none',
            }}
            onClick={() => handleTabChange(tab.id as Tab)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Device Information</h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                <div>
                  <div className="muted" style={{ fontSize: '11px' }}>Device ID</div>
                  <div style={{ fontSize: '13px', marginTop: '4px' }}>{device.deviceId}</div>
                </div>
                {device.deviceCode && (
                  <div>
                    <div className="muted" style={{ fontSize: '11px' }}>Device Code</div>
                    <div style={{ fontSize: '13px', marginTop: '4px' }}>{device.deviceCode}</div>
                  </div>
                )}
                <div>
                  <div className="muted" style={{ fontSize: '11px' }}>Platform</div>
                  <div style={{ fontSize: '13px', marginTop: '4px', textTransform: 'capitalize' }}>{device.platform}</div>
                </div>
                <div>
                  <div className="muted" style={{ fontSize: '11px' }}>Environment</div>
                  <div style={{ fontSize: '13px', marginTop: '4px', textTransform: 'capitalize' }}>{device.environment}</div>
                </div>
                <div>
                  <div className="muted" style={{ fontSize: '11px' }}>App Version</div>
                  <div style={{ fontSize: '13px', marginTop: '4px' }}>{device.appVersion || '-'}</div>
                </div>
                <div>
                  <div className="muted" style={{ fontSize: '11px' }}>OS Version</div>
                  <div style={{ fontSize: '13px', marginTop: '4px' }}>{device.osVersion || '-'}</div>
                </div>
                <div>
                  <div className="muted" style={{ fontSize: '11px' }}>Model</div>
                  <div style={{ fontSize: '13px', marginTop: '4px' }}>{device.model || '-'}</div>
                </div>
                {device.manufacturer && (
                  <div>
                    <div className="muted" style={{ fontSize: '11px' }}>Manufacturer</div>
                    <div style={{ fontSize: '13px', marginTop: '4px' }}>{device.manufacturer}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>User Information</h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                {device.userId && (
                  <div>
                    <div className="muted" style={{ fontSize: '11px' }}>User ID</div>
                    <div style={{ fontSize: '13px', marginTop: '4px' }}>{device.userId}</div>
                  </div>
                )}
                {device.userEmail && (
                  <div>
                    <div className="muted" style={{ fontSize: '11px' }}>User Email</div>
                    <div style={{ fontSize: '13px', marginTop: '4px' }}>{device.userEmail}</div>
                  </div>
                )}
                {device.userName && (
                  <div>
                    <div className="muted" style={{ fontSize: '11px' }}>User Name</div>
                    <div style={{ fontSize: '13px', marginTop: '4px' }}>{device.userName}</div>
                  </div>
                )}
                {!device.userId && !device.userEmail && !device.userName && (
                  <div className="muted" style={{ fontSize: '13px' }}>No user information available</div>
                )}
              </div>

              <h3 style={{ fontSize: '16px', fontWeight: '600', marginTop: '24px', marginBottom: '16px' }}>Timestamps</h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                <div>
                  <div className="muted" style={{ fontSize: '11px' }}>First Seen</div>
                  <div style={{ fontSize: '13px', marginTop: '4px' }}>{new Date(device.createdAt).toLocaleString()}</div>
                </div>
                <div>
                  <div className="muted" style={{ fontSize: '11px' }}>Last Seen</div>
                  <div style={{ fontSize: '13px', marginTop: '4px' }}>{new Date(device.lastSeenAt).toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sessions' && (
          <div>
            {tabLoading ? (
              <div>Loading sessions...</div>
            ) : tabData?.sessions ? (
              <div style={{ display: 'grid', gap: '12px' }}>
                {tabData.sessions.map((session: any) => (
                  <div key={session.id} className="card" style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <b>S-{session.sessionToken?.slice(-4).toUpperCase() || 'N/A'}</b>
                      <span className="muted">{session.duration ? `${Math.round(session.duration / 1000)}s` : '-'}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--m)' }}>
                      {new Date(session.startedAt).toLocaleString()}
                    </div>
                    <div style={{ fontSize: '12px', marginTop: '8px' }}>
                      {session.screenCount || 0} screens • {session.eventCount || 0} events
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div>No sessions yet</div>
            )}
          </div>
        )}

        {activeTab === 'logs' && (
          <div>
            {tabLoading ? (
              <div>Loading logs...</div>
            ) : tabData?.logs ? (
              <div style={{ display: 'grid', gap: '8px' }}>
                {tabData.logs.map((log: any) => (
                  <div
                    key={log.id}
                    style={{
                      fontSize: '12px',
                      padding: '12px',
                      background: 'var(--s2)',
                      borderRadius: '4px',
                      borderLeft: `3px solid ${log.level === 'error' ? 'var(--d)' : log.level === 'warn' ? 'var(--w)' : 'var(--m)'}`,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontWeight: '600', textTransform: 'uppercase' }}>{log.level}</span>
                      <span className="muted">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    <div>{log.message}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div>No logs yet</div>
            )}
          </div>
        )}

        {activeTab === 'crashes' && (
          <div>
            {tabLoading ? (
              <div>Loading crashes...</div>
            ) : tabData?.crashes ? (
              <div style={{ display: 'grid', gap: '12px' }}>
                {tabData.crashes.map((crash: any) => (
                  <div key={crash.id} className="card" style={{ padding: '16px', borderLeft: '4px solid var(--d)' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: 'var(--d)' }}>
                      {crash.message}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--m)', marginBottom: '12px' }}>
                      {new Date(crash.timestamp).toLocaleString()}
                    </div>
                    {crash.stackTrace && (
                      <pre style={{
                        fontSize: '11px',
                        padding: '12px',
                        background: 'var(--code)',
                        borderRadius: '4px',
                        overflow: 'auto',
                        maxHeight: '200px',
                      }}>
                        {crash.stackTrace}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div>No crashes reported</div>
            )}
          </div>
        )}

        {activeTab === 'traces' && (
          <div>
            {tabLoading ? (
              <div>Loading API traces...</div>
            ) : tabData?.traces ? (
              <div style={{ display: 'grid', gap: '8px' }}>
                {tabData.traces.map((trace: any) => (
                  <div
                    key={trace.id}
                    style={{
                      fontSize: '12px',
                      padding: '12px',
                      background: 'var(--s2)',
                      borderRadius: '4px',
                      borderLeft: `3px solid ${trace.statusCode >= 400 ? 'var(--d)' : 'var(--a)'}`,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span>
                        <b>{trace.method}</b> {trace.url}
                      </span>
                      <span className={trace.statusCode >= 400 ? '' : 'muted'}>{trace.statusCode}</span>
                    </div>
                    <div className="muted">
                      {new Date(trace.timestamp).toLocaleString()} • {trace.duration}ms
                      {trace.cost && ` • $${trace.cost.toFixed(4)}`}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div>No API traces yet</div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Debug Mode</h3>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', marginBottom: '8px' }}>
                Status: <b>{device.debugModeEnabled ? 'Enabled' : 'Disabled'}</b>
              </div>
              {device.debugModeEnabled && device.debugModeEnabledAt && (
                <div className="muted" style={{ fontSize: '12px', marginBottom: '8px' }}>
                  Enabled: {new Date(device.debugModeEnabledAt).toLocaleString()}
                  {device.debugModeEnabledBy && ` by ${device.debugModeEnabledBy}`}
                </div>
              )}
              {device.debugModeEnabled && device.debugModeExpiresAt && (
                <div className="muted" style={{ fontSize: '12px', marginBottom: '12px' }}>
                  Expires: {new Date(device.debugModeExpiresAt).toLocaleString()}
                </div>
              )}
            </div>
            <button
              className="btn"
              onClick={async () => {
                const enabled = !device.debugModeEnabled
                if (!confirm(enabled ? 'Enable debug mode for 24 hours?' : 'Disable debug mode?')) return

                try {
                  const response = await fetch(`/api/devices/${deviceId}/debug`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ enabled, durationHours: 24 })
                  })

                  if (!response.ok) {
                    throw new Error('Failed to toggle debug mode')
                  }

                  // Refresh page
                  window.location.reload()
                } catch (error: any) {
                  alert(`Error: ${error.message}`)
                }
              }}
            >
              {device.debugModeEnabled ? 'Disable Debug Mode' : 'Enable Debug Mode'}
            </button>

            <p className="muted" style={{ fontSize: '12px', marginTop: '12px' }}>
              Debug mode enables real-time logging and tracing for this device. This may impact performance and incur additional costs.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

