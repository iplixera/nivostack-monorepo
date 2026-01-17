'use client'

import { useEffect, useState, useCallback } from 'react'

type DeviceDrawerProps = {
  deviceId: string
  token: string
  onClose: () => void
}

type DeviceDetails = {
  device: any
  counts: {
    sessions: number
    logs: number
    crashes: number
    traces: number
  }
}

type Tab = 'overview' | 'realtime' | 'sessions' | 'logs' | 'crashes' | 'traces'

export default function DeviceDrawer({ deviceId, token, onClose }: DeviceDrawerProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [details, setDetails] = useState<DeviceDetails | null>(null)
  const [tabData, setTabData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tabLoading, setTabLoading] = useState(false)
  
  // For realtime tail
  const [isPolling, setIsPolling] = useState(false)
  const [lastTimestamp, setLastTimestamp] = useState<string>(new Date().toISOString())

  // Fetch device details
  useEffect(() => {
    const fetchDetails = async () => {
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
  }, [deviceId, token])

  // Fetch tab-specific data
  const fetchTabData = useCallback(async (tab: Tab) => {
    if (tab === 'overview') return
    
    try {
      setTabLoading(true)
      let url = ''
      
      if (tab === 'sessions') url = `/api/devices/${deviceId}/sessions?limit=10`
      else if (tab === 'logs') url = `/api/devices/${deviceId}/logs?limit=50`
      else if (tab === 'crashes') url = `/api/devices/${deviceId}/crashes?limit=20`
      else if (tab === 'traces') url = `/api/devices/${deviceId}/traces?limit=50`
      else if (tab === 'realtime') {
        // For realtime, fetch both logs and traces
        const [logsRes, tracesRes] = await Promise.all([
          fetch(`/api/devices/${deviceId}/logs?limit=20&since=${lastTimestamp}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`/api/devices/${deviceId}/traces?limit=20&since=${lastTimestamp}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ])
        const logs = logsRes.ok ? await logsRes.json() : { logs: [] }
        const traces = tracesRes.ok ? await tracesRes.json() : { traces: [] }
        setTabData({ logs: logs.logs, traces: traces.traces })
        setTabLoading(false)
        return
      }
      
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
  }, [deviceId, token, lastTimestamp])

  // Handle tab change
  const handleTabChange = useCallback((tab: Tab) => {
    setActiveTab(tab)
    fetchTabData(tab)
    
    // Start polling for realtime tab if debug is enabled
    if (tab === 'realtime' && details?.device?.debugModeEnabled) {
      setIsPolling(true)
    } else {
      setIsPolling(false)
    }
  }, [fetchTabData, details])

  // Polling effect for realtime tab
  useEffect(() => {
    if (!isPolling || activeTab !== 'realtime') return
    
    const interval = setInterval(() => {
      fetchTabData('realtime')
      setLastTimestamp(new Date().toISOString())
    }, 3000) // Poll every 3 seconds
    
    return () => clearInterval(interval)
  }, [isPolling, activeTab, fetchTabData])

  // Initial tab data fetch
  useEffect(() => {
    if (details && activeTab !== 'overview') {
      fetchTabData(activeTab)
    }
  }, [details, activeTab, fetchTabData])

  if (loading) {
    return (
      <div className="device-drawer">
        <div style={{ padding: '20px' }}>Loading...</div>
      </div>
    )
  }

  if (!details) {
    return (
      <div className="device-drawer">
        <div style={{ padding: '20px' }}>Device not found</div>
      </div>
    )
  }

  const device = details.device
  const counts = details.counts

  return (
    <div 
      style={{ 
        position: 'fixed', 
        top: 0, 
        right: 0, 
        width: '600px', 
        height: '100vh', 
        background: 'var(--s)', 
        borderLeft: '1px solid var(--b)', 
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div style={{ 
        padding: '20px', 
        borderBottom: '1px solid var(--b)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
      }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '6px' }}>
            Device Details
          </h2>
          <div style={{ fontSize: '12px', color: 'var(--m)' }}>
            {device.deviceId}
            {device.deviceCode && ` • ${device.deviceCode}`}
          </div>
        </div>
        <button 
          className="btn secondary" 
          style={{ padding: '6px 12px', fontSize: '12px' }}
          onClick={onClose}
        >
          ✕
        </button>
      </div>

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '4px', 
        padding: '12px 20px', 
        borderBottom: '1px solid var(--b)',
        overflowX: 'auto'
      }}>
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'realtime', label: `Realtime${device.debugModeEnabled ? ' 🔴' : ''}`, disabled: !device.debugModeEnabled },
          { id: 'sessions', label: `Sessions (${counts.sessions})` },
          { id: 'logs', label: `Logs (${counts.logs})` },
          { id: 'crashes', label: `Crashes (${counts.crashes})` },
          { id: 'traces', label: `Traces (${counts.traces})` },
        ].map((tab) => (
          <button
            key={tab.id}
            className={`btn ${activeTab === tab.id ? '' : 'secondary'}`}
            style={{ 
              padding: '6px 12px', 
              fontSize: '11px',
              whiteSpace: 'nowrap',
              opacity: tab.disabled ? 0.5 : 1,
              cursor: tab.disabled ? 'not-allowed' : 'pointer'
            }}
            onClick={() => !tab.disabled && handleTabChange(tab.id as Tab)}
            disabled={tab.disabled}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
        {activeTab === 'overview' && (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Metadata</h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                <div>
                  <div className="muted" style={{ fontSize: '11px' }}>Platform</div>
                  <div style={{ fontSize: '13px', marginTop: '4px', textTransform: 'capitalize' }}>{device.platform}</div>
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
                <div>
                  <div className="muted" style={{ fontSize: '11px' }}>Environment</div>
                  <div style={{ fontSize: '13px', marginTop: '4px', textTransform: 'capitalize' }}>
                    {device.environment || 'production'}
                  </div>
                </div>
                <div>
                  <div className="muted" style={{ fontSize: '11px' }}>Last Seen</div>
                  <div style={{ fontSize: '13px', marginTop: '4px' }}>
                    {new Date(device.lastSeenAt).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="muted" style={{ fontSize: '11px' }}>Created</div>
                  <div style={{ fontSize: '13px', marginTop: '4px' }}>
                    {new Date(device.createdAt).toLocaleString()}
                  </div>
                </div>
                {device.userEmail && (
                  <div>
                    <div className="muted" style={{ fontSize: '11px' }}>User Email</div>
                    <div style={{ fontSize: '13px', marginTop: '4px' }}>{device.userEmail}</div>
                  </div>
                )}
                {device.userId && (
                  <div>
                    <div className="muted" style={{ fontSize: '11px' }}>User ID</div>
                    <div style={{ fontSize: '13px', marginTop: '4px' }}>{device.userId}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Debug Mode Status */}
            <div style={{ marginTop: '20px', padding: '12px', background: 'var(--s2)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600' }}>Debug Mode</div>
                  <div className="muted" style={{ fontSize: '11px', marginTop: '2px' }}>
                    {device.debugModeEnabled ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
                <span className={`chip`} style={{ 
                  background: device.debugModeEnabled ? 'var(--w)' : 'var(--s)',
                  color: device.debugModeEnabled ? 'white' : 'var(--m)'
                }}>
                  {device.debugModeEnabled ? 'ON' : 'OFF'}
                </span>
              </div>
              {device.debugModeEnabled && device.debugModeEnabledAt && (
                <div className="muted" style={{ fontSize: '10px', marginTop: '8px' }}>
                  Enabled: {new Date(device.debugModeEnabledAt).toLocaleString()}
                  {device.debugModeEnabledBy && ` by ${device.debugModeEnabledBy}`}
                </div>
              )}
            </div>

            {/* Metadata JSON */}
            {device.metadata && Object.keys(device.metadata).length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Additional Metadata</h3>
                <pre style={{ 
                  fontSize: '11px', 
                  padding: '12px', 
                  background: 'var(--code)', 
                  borderRadius: '6px',
                  overflow: 'auto',
                  maxHeight: '200px'
                }}>
                  {JSON.stringify(device.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {activeTab === 'realtime' && (
          <div>
            {!device.debugModeEnabled ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '40px', opacity: 0.3 }}>🔴</div>
                <h3 style={{ marginTop: '16px' }}>Debug Mode Disabled</h3>
                <p className="muted">Enable debug mode to see realtime activity</p>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: '12px', padding: '8px', background: 'var(--s2)', borderRadius: '6px', fontSize: '11px' }}>
                  🔴 Live • Polling every 3s
                </div>
                {tabLoading && !tabData ? (
                  <div>Loading...</div>
                ) : tabData ? (
                  <div>
                    {/* Recent Logs */}
                    {tabData.logs && tabData.logs.length > 0 && (
                      <div style={{ marginBottom: '20px' }}>
                        <h4 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Recent Logs</h4>
                        {tabData.logs.slice(0, 10).map((log: any) => (
                          <div key={log.id} style={{ 
                            fontSize: '11px', 
                            padding: '6px 8px', 
                            marginBottom: '4px',
                            background: 'var(--s2)',
                            borderRadius: '4px',
                            borderLeft: `3px solid ${log.level === 'error' ? 'var(--d)' : log.level === 'warn' ? 'var(--w)' : 'var(--m)'}`
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                              <span style={{ fontWeight: '600', textTransform: 'uppercase' }}>{log.level}</span>
                              <span className="muted">{new Date(log.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <div>{log.message}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Recent Traces */}
                    {tabData.traces && tabData.traces.length > 0 && (
                      <div>
                        <h4 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Recent API Calls</h4>
                        {tabData.traces.slice(0, 10).map((trace: any) => (
                          <div key={trace.id} style={{ 
                            fontSize: '11px', 
                            padding: '6px 8px', 
                            marginBottom: '4px',
                            background: 'var(--s2)',
                            borderRadius: '4px'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                              <span><b>{trace.method}</b> {trace.url}</span>
                              <span className={trace.statusCode >= 400 ? '' : 'muted'}>{trace.statusCode}</span>
                            </div>
                            <div className="muted">{new Date(trace.timestamp).toLocaleTimeString()} • {trace.duration}ms</div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {(!tabData.logs || tabData.logs.length === 0) && (!tabData.traces || tabData.traces.length === 0) && (
                      <div style={{ textAlign: 'center', padding: '20px', color: 'var(--m)' }}>
                        No activity yet...
                      </div>
                    )}
                  </div>
                ) : (
                  <div>No data</div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'sessions' && (
          <div>
            {tabLoading ? (
              <div>Loading sessions...</div>
            ) : tabData?.sessions ? (
              <div>
                {tabData.sessions.map((session: any) => (
                  <div key={session.id} className="card" style={{ padding: '12px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <b style={{ fontSize: '12px' }}>S-{session.sessionToken?.slice(-4).toUpperCase() || 'N/A'}</b>
                      <span className="muted" style={{ fontSize: '11px' }}>
                        {session.duration ? `${Math.round(session.duration / 1000)}s` : '-'}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--m)' }}>
                      {new Date(session.startedAt).toLocaleString()}
                    </div>
                    <div style={{ fontSize: '11px', marginTop: '6px' }}>
                      {session.screenCount || 0} screens • {session.eventCount || 0} events
                    </div>
                  </div>
                ))}
                {tabData.sessions.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--m)' }}>
                    No sessions yet
                  </div>
                )}
              </div>
            ) : (
              <div>No data</div>
            )}
          </div>
        )}

        {activeTab === 'logs' && (
          <div>
            {tabLoading ? (
              <div>Loading logs...</div>
            ) : tabData?.logs ? (
              <div>
                {tabData.logs.map((log: any) => (
                  <div key={log.id} style={{ 
                    fontSize: '11px', 
                    padding: '8px', 
                    marginBottom: '6px',
                    background: 'var(--s2)',
                    borderRadius: '4px',
                    borderLeft: `3px solid ${log.level === 'error' ? 'var(--d)' : log.level === 'warn' ? 'var(--w)' : 'var(--m)'}`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '600', textTransform: 'uppercase' }}>{log.level}</span>
                      <span className="muted">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    <div>{log.message}</div>
                    {log.screenName && (
                      <div className="muted" style={{ marginTop: '4px' }}>Screen: {log.screenName}</div>
                    )}
                  </div>
                ))}
                {tabData.logs.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--m)' }}>
                    No logs yet
                  </div>
                )}
              </div>
            ) : (
              <div>No data</div>
            )}
          </div>
        )}

        {activeTab === 'crashes' && (
          <div>
            {tabLoading ? (
              <div>Loading crashes...</div>
            ) : tabData?.crashes ? (
              <div>
                {tabData.crashes.map((crash: any) => (
                  <div key={crash.id} className="card" style={{ padding: '12px', marginBottom: '12px', borderLeft: '4px solid var(--d)' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: 'var(--d)' }}>
                      {crash.message}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--m)', marginBottom: '8px' }}>
                      {new Date(crash.timestamp).toLocaleString()}
                    </div>
                    {crash.stackTrace && (
                      <pre style={{ 
                        fontSize: '10px', 
                        padding: '8px', 
                        background: 'var(--code)', 
                        borderRadius: '4px',
                        overflow: 'auto',
                        maxHeight: '150px',
                        marginTop: '8px'
                      }}>
                        {crash.stackTrace}
                      </pre>
                    )}
                  </div>
                ))}
                {tabData.crashes.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--m)' }}>
                    No crashes reported
                  </div>
                )}
              </div>
            ) : (
              <div>No data</div>
            )}
          </div>
        )}

        {activeTab === 'traces' && (
          <div>
            {tabLoading ? (
              <div>Loading API traces...</div>
            ) : tabData?.traces ? (
              <div>
                {tabData.traces.map((trace: any) => (
                  <div key={trace.id} style={{ 
                    fontSize: '11px', 
                    padding: '8px', 
                    marginBottom: '6px',
                    background: 'var(--s2)',
                    borderRadius: '4px',
                    borderLeft: `3px solid ${trace.statusCode >= 400 ? 'var(--d)' : 'var(--a)'}`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span><b>{trace.method}</b> {trace.url}</span>
                      <span className={trace.statusCode >= 400 ? '' : 'muted'}>{trace.statusCode}</span>
                    </div>
                    <div className="muted">
                      {new Date(trace.timestamp).toLocaleString()} • {trace.duration}ms
                      {trace.cost && ` • $${trace.cost.toFixed(4)}`}
                    </div>
                  </div>
                ))}
                {tabData.traces.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--m)' }}>
                    No API traces yet
                  </div>
                )}
              </div>
            ) : (
              <div>No data</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

