'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { api } from '@/lib/api'
import { useParams } from 'next/navigation'
import BuildsSubTab from '@/components/BuildsSubTab'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/layout/PageHeader'
import ThemeToggle from '@/components/ThemeToggle'
import DataTable from '@/components/DataTable'

type MockEnvironment = {
  id: string
  name: string
  description?: string
  mode: string
  isEnabled: boolean
  isDefault: boolean
  _count?: { endpoints: number }
}

type MockEndpoint = {
  id: string
  path: string
  method: string
  description?: string
  isEnabled: boolean
  responses: MockResponse[]
}

type MockResponse = {
  id: string
  statusCode: number
  name?: string
  responseBody?: any
  responseHeaders?: Record<string, string>
  delay: number
  isDefault: boolean
  isEnabled: boolean
}

// Extract common modal styles outside components for reuse
const MODAL_OVERLAY_STYLE: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 50,
}

const MODAL_CONTENT_STYLE: React.CSSProperties = {
  width: '100%',
  maxWidth: '400px',
  margin: '18px',
}

// Common button style for table actions
const ACTION_BUTTON_STYLE: React.CSSProperties = {
  padding: '7px 10px',
  fontSize: '11px',
}

// Common flex container style for action buttons
const ACTION_CONTAINER_STYLE: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
  flexWrap: 'wrap',
}

export default function MocksPage() {
  const { token } = useAuth()
  const params = useParams()
  const projectId = params.id as string

  const [environments, setEnvironments] = useState<MockEnvironment[]>([])
  const [selectedEnvironment, setSelectedEnvironment] = useState<string | null>(null)
  const [endpoints, setEndpoints] = useState<MockEndpoint[]>([])
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null)
  const [selectedEndpointData, setSelectedEndpointData] = useState<MockEndpoint | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreateEnv, setShowCreateEnv] = useState(false)
  const [showCreateEndpoint, setShowCreateEndpoint] = useState(false)
  const [showCreateResponse, setShowCreateResponse] = useState(false)
  const [editingResponse, setEditingResponse] = useState<MockResponse | null>(null)
  const [activeSubTab, setActiveSubTab] = useState<'mocks' | 'builds'>('mocks')

  const loadEnvironments = useCallback(async () => {
    if (!token || !projectId) return
    try {
      const response = await api.mocks.listEnvironments(projectId, token)
      setEnvironments(response.environments)
      if (response.environments.length > 0 && !selectedEnvironment) {
        const defaultEnv = response.environments.find((e) => e.isDefault) || response.environments[0]
        setSelectedEnvironment(defaultEnv.id)
      }
    } catch (error) {
      console.error('Failed to load environments:', error)
    } finally {
      setLoading(false)
    }
  }, [token, projectId, selectedEnvironment])

  const loadEndpoints = useCallback(async () => {
    if (!selectedEnvironment || !token) return
    try {
      const response = await api.mocks.listEndpoints(selectedEnvironment, token)
      setEndpoints(response.endpoints)
      if (selectedEndpoint && !response.endpoints.find((e) => e.id === selectedEndpoint)) {
        setSelectedEndpoint(null)
        setSelectedEndpointData(null)
      }
    } catch (error) {
      console.error('Failed to load endpoints:', error)
    }
  }, [selectedEnvironment, token, selectedEndpoint])

  const loadEndpointDetails = useCallback(async (endpointId: string) => {
    if (!token) return
    try {
      const response = await api.mocks.getEndpoint(endpointId, token)
      setSelectedEndpointData(response.endpoint)
    } catch (error) {
      console.error('Failed to load endpoint details:', error)
    }
  }, [token])

  useEffect(() => {
    if (token && projectId) {
      loadEnvironments()
    }
  }, [token, projectId, loadEnvironments])

  useEffect(() => {
    if (selectedEnvironment && token) {
      loadEndpoints()
    }
  }, [selectedEnvironment, token, loadEndpoints])

  useEffect(() => {
    if (selectedEndpoint && token) {
      loadEndpointDetails(selectedEndpoint)
    }
  }, [selectedEndpoint, token, loadEndpointDetails])

  const handleCreateEnvironment = useCallback(async (data: {
    name: string
    description?: string
    mode?: string
  }) => {
    if (!token || !projectId) return
    try {
      await api.mocks.createEnvironment(projectId, token, {
        name: data.name,
        description: data.description,
        mode: data.mode || 'selective',
      })
      await loadEnvironments()
      setShowCreateEnv(false)
    } catch (error) {
      console.error('Failed to create environment:', error)
      alert('Failed to create environment')
    }
  }, [token, projectId, loadEnvironments])

  const handleCreateEndpoint = useCallback(async (data: {
    path: string
    method: string
    description?: string
  }) => {
    if (!selectedEnvironment || !token) return
    try {
      await api.mocks.createEndpoint(token, {
        environmentId: selectedEnvironment,
        path: data.path,
        method: data.method,
        description: data.description,
      })
      await loadEndpoints()
      setShowCreateEndpoint(false)
    } catch (error) {
      console.error('Failed to create endpoint:', error)
      alert('Failed to create endpoint')
    }
  }, [selectedEnvironment, token, loadEndpoints])

  const handleCreateResponse = useCallback(async (data: {
    statusCode: number
    name?: string
    description?: string
    responseBody?: any
    responseHeaders?: Record<string, string>
    delay?: number
    isDefault?: boolean
  }) => {
    if (!selectedEndpoint || !token) return
    try {
      await api.mocks.createResponse(token, {
        endpointId: selectedEndpoint,
        ...data,
      })
      await loadEndpointDetails(selectedEndpoint)
      setShowCreateResponse(false)
    } catch (error) {
      console.error('Failed to create response:', error)
      alert('Failed to create response')
    }
  }, [selectedEndpoint, token, loadEndpointDetails])

  const handleUpdateResponse = useCallback(async (responseId: string, data: any) => {
    if (!token) return
    try {
      await api.mocks.updateResponse(responseId, token, data)
      if (selectedEndpoint) {
        await loadEndpointDetails(selectedEndpoint)
      }
      setEditingResponse(null)
    } catch (error) {
      console.error('Failed to update response:', error)
      alert('Failed to update response')
    }
  }, [token, selectedEndpoint, loadEndpointDetails])

  const handleDeleteResponse = useCallback(async (responseId: string) => {
    if (!confirm('Are you sure you want to delete this response?') || !token) return
    try {
      await api.mocks.deleteResponse(responseId, token)
      if (selectedEndpoint) {
        await loadEndpointDetails(selectedEndpoint)
      }
    } catch (error) {
      console.error('Failed to delete response:', error)
      alert('Failed to delete response')
    }
  }, [token, selectedEndpoint, loadEndpointDetails])

  const handleDeleteEndpoint = useCallback(async (endpointId: string) => {
    if (!confirm('Are you sure you want to delete this endpoint? All responses will be deleted.') || !token) return
    try {
      await api.mocks.deleteEndpoint(endpointId, token)
      await loadEndpoints()
      setSelectedEndpoint(null)
      setSelectedEndpointData(null)
    } catch (error) {
      console.error('Failed to delete endpoint:', error)
      alert('Failed to delete endpoint')
    }
  }, [token, loadEndpoints])

  const handleToggleEnvironment = useCallback(async (envId: string, enabled: boolean) => {
    if (!token) return
    try {
      await api.mocks.updateEnvironment(envId, token, { isEnabled: enabled })
      await loadEnvironments()
    } catch (error) {
      console.error('Failed to update environment:', error)
    }
  }, [token, loadEnvironments])

  const handleSetDefault = useCallback(async (envId: string) => {
    if (!token) return
    try {
      await api.mocks.updateEnvironment(envId, token, { isDefault: true })
      await loadEnvironments()
    } catch (error) {
      console.error('Failed to set default environment:', error)
    }
  }, [token, loadEnvironments])

  if (loading) {
    return (
      <AppShell>
        <PageHeader
          title="API Mocking"
          subtitle="Create and manage mock environments and endpoints"
          dataMode="Raw"
          actions={<ThemeToggle />}
        />
        <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--m)' }}>
          Loading...
        </div>
      </AppShell>
    )
  }

  const currentEnv = useMemo(() => {
    return environments.find((e) => e.id === selectedEnvironment)
  }, [environments, selectedEnvironment])

  // Memoize column definitions to prevent recreation on every render
  const environmentColumns = useMemo(() => [
    {
      key: 'name',
      label: 'Name',
      render: (env: MockEnvironment) => (
        <>
          <b>{env.name}</b>
          {env.isDefault && (
            <span className="muted" style={{ fontSize: '11px', marginLeft: '8px' }}>(Default)</span>
          )}
          {env.description && (
            <div className="muted" style={{ fontSize: '11px', marginTop: '4px' }}>{env.description}</div>
          )}
        </>
      ),
    },
    {
      key: 'mode',
      label: 'Mode',
      render: (env: MockEnvironment) => <span className="muted">{env.mode}</span>,
    },
    {
      key: 'endpoints',
      label: 'Endpoints',
      render: (env: MockEnvironment) => <span className="muted">{env._count?.endpoints || 0}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (env: MockEnvironment) => (
        <span className="chip">
          <span className={`dot ${env.isEnabled ? 'good' : ''}`} />
          {env.isEnabled ? 'Enabled' : 'Disabled'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (env: MockEnvironment) => (
        <div style={ACTION_CONTAINER_STYLE}>
          {!env.isDefault && (
            <button
              className="btn secondary"
              style={ACTION_BUTTON_STYLE}
              onClick={(e) => {
                e.stopPropagation()
                handleSetDefault(env.id)
              }}
            >
              Set Default
            </button>
          )}
          <button
            className="btn secondary"
            style={ACTION_BUTTON_STYLE}
            onClick={(e) => {
              e.stopPropagation()
              setSelectedEnvironment(env.id)
            }}
          >
            Select
          </button>
        </div>
      ),
    },
  ], [handleSetDefault])

  const endpointColumns = useMemo(() => [
    {
      key: 'method',
      label: 'Method',
      render: (endpoint: MockEndpoint) => (
        <span style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 700, color: 'var(--p)' }}>
          {endpoint.method}
        </span>
      ),
    },
    {
      key: 'path',
      label: 'Path',
      render: (endpoint: MockEndpoint) => (
        <span style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--t)' }}>
          {endpoint.path}
        </span>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (endpoint: MockEndpoint) => (
        <span className="muted">{endpoint.description || '-'}</span>
      ),
    },
    {
      key: 'responses',
      label: 'Responses',
      render: (endpoint: MockEndpoint) => (
        <span className="muted">
          {endpoint.responses.length} response{endpoint.responses.length !== 1 ? 's' : ''}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (endpoint: MockEndpoint) => (
        !endpoint.isEnabled && (
          <span className="chip">
            <span className="dot" />
            Disabled
          </span>
        )
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (endpoint: MockEndpoint) => (
        <div style={ACTION_CONTAINER_STYLE}>
          <button
            className="btn secondary"
            style={{ ...ACTION_BUTTON_STYLE, color: 'var(--d)', borderColor: 'var(--d)' }}
            onClick={(e) => {
              e.stopPropagation()
              handleDeleteEndpoint(endpoint.id)
            }}
          >
            Delete
          </button>
        </div>
      ),
    },
  ], [handleDeleteEndpoint])

  const responseColumns = useMemo(() => [
    {
      key: 'status',
      label: 'Status',
      render: (response: MockResponse) => {
        const statusColor = response.statusCode >= 200 && response.statusCode < 300
          ? 'var(--a)'
          : response.statusCode >= 400 && response.statusCode < 500
            ? 'var(--w)'
            : 'var(--d)'
        return (
          <span className="chip" style={{ borderColor: statusColor, color: statusColor }}>
            {response.statusCode}
          </span>
        )
      },
    },
    {
      key: 'name',
      label: 'Name',
      render: (response: MockResponse) => <span className="muted">{response.name || '-'}</span>,
    },
    {
      key: 'delay',
      label: 'Delay',
      render: (response: MockResponse) => <span className="muted">{response.delay}ms</span>,
    },
    {
      key: 'flags',
      label: 'Flags',
      render: (response: MockResponse) => (
        <div style={ACTION_CONTAINER_STYLE}>
          {response.isDefault && (
            <span className="chip">
              <span className="dot" />
              Default
            </span>
          )}
          {!response.isEnabled && (
            <span className="chip">
              <span className="dot" />
              Disabled
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'preview',
      label: 'Preview',
      render: (response: MockResponse) => (
        response.responseBody && (
          <div style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--m)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {JSON.stringify(response.responseBody).slice(0, 50)}...
          </div>
        )
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (response: MockResponse) => (
        <div style={ACTION_CONTAINER_STYLE}>
          <button
            className="btn secondary"
            style={ACTION_BUTTON_STYLE}
            onClick={(e) => {
              e.stopPropagation()
              setEditingResponse(response)
            }}
          >
            Edit
          </button>
          <button
            className="btn secondary"
            style={{ ...ACTION_BUTTON_STYLE, color: 'var(--d)', borderColor: 'var(--d)' }}
            onClick={(e) => {
              e.stopPropagation()
              handleDeleteResponse(response.id)
            }}
          >
            Delete
          </button>
        </div>
      ),
    },
  ], [handleDeleteResponse])

  return (
    <AppShell>
      <PageHeader
        title="API Mocking"
        subtitle="Create and manage mock environments and endpoints"
        dataMode="Raw"
        actions={<ThemeToggle />}
      />

      {/* Sub-tabs */}
      <div className="card" style={{ marginTop: '18px' }}>
        <div className="tabs">
          <button
            onClick={() => setActiveSubTab('mocks')}
            className={`tab ${activeSubTab === 'mocks' ? 'active' : ''}`}
          >
            API Mocks
          </button>
          <button
            onClick={() => setActiveSubTab('builds')}
            className={`tab ${activeSubTab === 'builds' ? 'active' : ''}`}
          >
            Builds
          </button>
        </div>
      </div>

      {/* Builds Sub-tab */}
      {activeSubTab === 'builds' && (
        <BuildsSubTab
          projectId={projectId}
          featureType="api_mocks"
          featureLabel="API Mocks"
        />
      )}

      {/* Mocks Sub-tab */}
      {activeSubTab === 'mocks' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px' }}>
            <b style={{ fontSize: '18px' }}>Environments</b>
            <button
              onClick={() => setShowCreateEnv(true)}
              className="btn"
            >
              Create Environment
            </button>
          </div>

          {/* Environments Table */}
          <DataTable
            data={environments}
            columns={environmentColumns}
            loading={false}
            emptyMessage="No environments found. Create one to get started."
            onRowClick={(env) => setSelectedEnvironment(env.id)}
            footerNote={`Showing ${environments.length} environment${environments.length !== 1 ? 's' : ''}`}
          />

          {/* Endpoints Table */}
          {selectedEnvironment && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '18px' }}>
                <b style={{ fontSize: '18px' }}>
                  Endpoints {currentEnv && `(${currentEnv.name})`}
                </b>
                <button
                  onClick={() => setShowCreateEndpoint(true)}
                  className="btn"
                >
                  Add Endpoint
                </button>
              </div>

              <DataTable
                data={endpoints}
                columns={endpointColumns}
                loading={false}
                emptyMessage='No endpoints yet. Click "Add Endpoint" to create one.'
                onRowClick={(endpoint) => setSelectedEndpoint(endpoint.id)}
                footerNote={`Showing ${endpoints.length} endpoint${endpoints.length !== 1 ? 's' : ''}`}
              />
            </>
          )}

          {/* Responses Table */}
          {selectedEndpointData && (
            <div className="card" style={{ marginTop: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <b style={{ fontSize: '16px' }}>
                    Responses for {selectedEndpointData.method} {selectedEndpointData.path}
                  </b>
                  {selectedEndpointData.description && (
                    <div className="muted" style={{ fontSize: '12px', marginTop: '4px' }}>
                      {selectedEndpointData.description}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowCreateResponse(true)}
                  className="btn"
                >
                  Add Response
                </button>
              </div>

              <DataTable
                data={selectedEndpointData.responses}
                columns={responseColumns}
                loading={false}
                emptyMessage='No responses yet. Click "Add Response" to create one.'
                footerNote={`Showing ${selectedEndpointData.responses.length} response${selectedEndpointData.responses.length !== 1 ? 's' : ''}`}
              />
            </div>
          )}
        </>
      )}

      {/* Create Environment Modal */}
      {showCreateEnv && (
        <CreateEnvironmentModal
          onClose={() => setShowCreateEnv(false)}
          onSubmit={handleCreateEnvironment}
        />
      )}

      {/* Create Endpoint Modal */}
      {showCreateEndpoint && selectedEnvironment && (
        <CreateEndpointModal
          onClose={() => setShowCreateEndpoint(false)}
          onSubmit={handleCreateEndpoint}
        />
      )}

      {/* Create/Edit Response Modal */}
      {(showCreateResponse || editingResponse) && selectedEndpoint && (
        <ResponseEditorModal
          endpointId={selectedEndpoint}
          response={editingResponse}
          onClose={() => {
            setShowCreateResponse(false)
            setEditingResponse(null)
          }}
          onSubmit={editingResponse
            ? (data) => handleUpdateResponse(editingResponse.id, data)
            : handleCreateResponse}
        />
      )}
    </AppShell>
  )
}

function CreateEnvironmentModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void
  onSubmit: (data: { name: string; description?: string; mode?: string }) => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [mode, setMode] = useState('selective')

  return (
    <div style={MODAL_OVERLAY_STYLE}>
      <div className="card" style={MODAL_CONTENT_STYLE}>
        <b style={{ fontSize: '18px', marginBottom: '14px', display: 'block' }}>Create Mock Environment</b>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label className="muted" style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}>Name</label>
            <input
              type="text"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Development, Staging"
            />
          </div>
          <div>
            <label className="muted" style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}>Description</label>
            <textarea
              className="input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          <div>
            <label className="muted" style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}>Mode</label>
            <select
              className="select"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
            >
              <option value="selective">Selective (only mocked endpoints)</option>
              <option value="global">Global (check all, fallback to real API)</option>
              <option value="whitelist">Whitelist (only whitelisted patterns)</option>
              <option value="blacklist">Blacklist (all except blacklisted)</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button
              className="btn secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="btn"
              onClick={() => {
                if (name) {
                  onSubmit({ name, description, mode })
                }
              }}
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function CreateEndpointModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void
  onSubmit: (data: { path: string; method: string; description?: string }) => void
}) {
  const [path, setPath] = useState('')
  const [method, setMethod] = useState('GET')
  const [description, setDescription] = useState('')

  return (
    <div style={MODAL_OVERLAY_STYLE}>
      <div className="card" style={MODAL_CONTENT_STYLE}>
        <b style={{ fontSize: '18px', marginBottom: '14px', display: 'block' }}>Create Mock Endpoint</b>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label className="muted" style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}>Method</label>
            <select
              className="select"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
            </select>
          </div>
          <div>
            <label className="muted" style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}>Path</label>
            <input
              type="text"
              className="input"
              style={{ fontFamily: 'monospace' }}
              value={path}
              onChange={(e) => setPath(e.target.value)}
              placeholder="e.g., /api/users/:id"
            />
            <div className="muted" style={{ fontSize: '11px', marginTop: '4px' }}>
              Use :param for path parameters, * for wildcards
            </div>
          </div>
          <div>
            <label className="muted" style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}>Description</label>
            <textarea
              className="input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button
              className="btn secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="btn"
              onClick={() => {
                if (path) {
                  onSubmit({ path, method, description })
                }
              }}
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ResponseEditorModal({
  endpointId,
  response,
  onClose,
  onSubmit,
}: {
  endpointId: string
  response?: MockResponse | null
  onClose: () => void
  onSubmit: (data: {
    statusCode: number
    name?: string
    description?: string
    responseBody?: any
    responseHeaders?: Record<string, string>
    delay?: number
    isDefault?: boolean
  }) => void
}) {
  const [statusCode, setStatusCode] = useState(response?.statusCode || 200)
  const [name, setName] = useState(response?.name || '')
  const [description, setDescription] = useState('')
  const [responseBody, setResponseBody] = useState(
    response?.responseBody ? JSON.stringify(response.responseBody, null, 2) : '{\n  \n}'
  )
  const [responseHeaders, setResponseHeaders] = useState<Array<{ key: string; value: string }>>(
    response?.responseHeaders
      ? Object.entries(response.responseHeaders).map(([k, v]) => ({ key: k, value: v }))
      : [{ key: 'Content-Type', value: 'application/json' }]
  )
  const [delay, setDelay] = useState(response?.delay || 0)
  const [isDefault, setIsDefault] = useState(response?.isDefault || false)
  const [bodyError, setBodyError] = useState('')

  const handleSubmit = () => {
    let parsedBody: any = null
    if (responseBody.trim()) {
      try {
        parsedBody = JSON.parse(responseBody)
      } catch (e) {
        setBodyError('Invalid JSON')
        return
      }
    }

    const headersObj: Record<string, string> = {}
    responseHeaders.forEach((h) => {
      if (h.key.trim()) {
        headersObj[h.key] = h.value
      }
    })

    onSubmit({
      statusCode,
      name: name || undefined,
      description: description || undefined,
      responseBody: parsedBody,
      responseHeaders: Object.keys(headersObj).length > 0 ? headersObj : undefined,
      delay,
      isDefault,
    })
  }

  const addHeader = () => {
    setResponseHeaders([...responseHeaders, { key: '', value: '' }])
  }

  const removeHeader = (index: number) => {
    setResponseHeaders(responseHeaders.filter((_, i) => i !== index))
  }

  const updateHeader = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...responseHeaders]
    updated[index] = { ...updated[index], [field]: value }
    setResponseHeaders(updated)
  }

  return (
    <div style={{ ...MODAL_OVERLAY_STYLE, padding: '18px' }}>
      <div className="card" style={{ ...MODAL_CONTENT_STYLE, maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
        <b style={{ fontSize: '18px', marginBottom: '14px', display: 'block' }}>
          {response ? 'Edit Response' : 'Create Response'}
        </b>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
            <div>
              <label className="muted" style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}>Status Code</label>
              <input
                type="number"
                className="input"
                value={statusCode}
                onChange={(e) => setStatusCode(parseInt(e.target.value) || 200)}
                min={100}
                max={599}
              />
            </div>
            <div>
              <label className="muted" style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}>Delay (ms)</label>
              <input
                type="number"
                className="input"
                value={delay}
                onChange={(e) => setDelay(parseInt(e.target.value) || 0)}
                min={0}
              />
            </div>
          </div>
          <div>
            <label className="muted" style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}>Name</label>
            <input
              type="text"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Success, Not Found"
            />
          </div>
          <div>
            <label className="muted" style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}>Description</label>
            <textarea
              className="input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          <div>
            <label className="muted" style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}>Response Body (JSON)</label>
            <textarea
              className="input"
              style={{
                fontFamily: 'monospace',
                fontSize: '12px',
                borderColor: bodyError ? 'var(--d)' : undefined,
              }}
              value={responseBody}
              onChange={(e) => {
                setResponseBody(e.target.value)
                setBodyError('')
              }}
              rows={10}
            />
            {bodyError && (
              <div style={{ color: 'var(--d)', fontSize: '11px', marginTop: '4px' }}>{bodyError}</div>
            )}
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label className="muted" style={{ fontSize: '12px' }}>Response Headers</label>
              <button
                onClick={addHeader}
                className="btn secondary"
                style={{ padding: '4px 8px', fontSize: '11px' }}
              >
                Add Header
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {responseHeaders.map((header, index) => (
                <div key={index} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="input"
                    style={{ flex: 1 }}
                    value={header.key}
                    onChange={(e) => updateHeader(index, 'key', e.target.value)}
                    placeholder="Header name"
                  />
                  <input
                    type="text"
                    className="input"
                    style={{ flex: 1 }}
                    value={header.value}
                    onChange={(e) => updateHeader(index, 'value', e.target.value)}
                    placeholder="Header value"
                  />
                  <button
                    onClick={() => removeHeader(index)}
                    className="btn secondary"
                    style={{ padding: '7px 10px', color: 'var(--d)', borderColor: 'var(--d)' }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                style={{ borderRadius: '4px' }}
              />
              <span className="muted" style={{ fontSize: '12px' }}>Set as default response</span>
            </label>
          </div>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button
              className="btn secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="btn"
              onClick={handleSubmit}
            >
              {response ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
