'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { api } from '@/lib/api'
import { useParams } from 'next/navigation'
import BuildsSubTab from '@/components/BuildsSubTab'

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

export default function MocksPage() {
  const { user, token } = useAuth()
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

  useEffect(() => {
    if (token && projectId) {
      loadEnvironments()
    }
  }, [token, projectId])

  useEffect(() => {
    if (selectedEnvironment && token) {
      loadEndpoints()
    }
  }, [selectedEnvironment, token])

  const loadEnvironments = async () => {
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
  }

  const loadEndpoints = async () => {
    if (!selectedEnvironment) return
    try {
      const response = await api.mocks.listEndpoints(selectedEnvironment, token!)
      setEndpoints(response.endpoints)
      // Clear selected endpoint if it's not in the new list
      if (selectedEndpoint && !response.endpoints.find((e) => e.id === selectedEndpoint)) {
        setSelectedEndpoint(null)
        setSelectedEndpointData(null)
      }
    } catch (error) {
      console.error('Failed to load endpoints:', error)
    }
  }

  const loadEndpointDetails = async (endpointId: string) => {
    try {
      const response = await api.mocks.getEndpoint(endpointId, token!)
      setSelectedEndpointData(response.endpoint)
    } catch (error) {
      console.error('Failed to load endpoint details:', error)
    }
  }

  useEffect(() => {
    if (selectedEndpoint && token) {
      loadEndpointDetails(selectedEndpoint)
    }
  }, [selectedEndpoint, token])

  const handleCreateEnvironment = async (data: {
    name: string
    description?: string
    mode?: string
  }) => {
    try {
      await api.mocks.createEnvironment(projectId, token!, {
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
  }

  const handleCreateEndpoint = async (data: {
    path: string
    method: string
    description?: string
  }) => {
    if (!selectedEnvironment) return
    try {
      await api.mocks.createEndpoint(token!, {
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
  }

  const handleCreateResponse = async (data: {
    statusCode: number
    name?: string
    description?: string
    responseBody?: any
    responseHeaders?: Record<string, string>
    delay?: number
    isDefault?: boolean
  }) => {
    if (!selectedEndpoint) return
    try {
      await api.mocks.createResponse(token!, {
        endpointId: selectedEndpoint,
        ...data,
      })
      await loadEndpointDetails(selectedEndpoint)
      setShowCreateResponse(false)
    } catch (error) {
      console.error('Failed to create response:', error)
      alert('Failed to create response')
    }
  }

  const handleUpdateResponse = async (responseId: string, data: any) => {
    try {
      await api.mocks.updateResponse(responseId, token!, data)
      if (selectedEndpoint) {
        await loadEndpointDetails(selectedEndpoint)
      }
      setEditingResponse(null)
    } catch (error) {
      console.error('Failed to update response:', error)
      alert('Failed to update response')
    }
  }

  const handleDeleteResponse = async (responseId: string) => {
    if (!confirm('Are you sure you want to delete this response?')) return
    try {
      await api.mocks.deleteResponse(responseId, token!)
      if (selectedEndpoint) {
        await loadEndpointDetails(selectedEndpoint)
      }
    } catch (error) {
      console.error('Failed to delete response:', error)
      alert('Failed to delete response')
    }
  }

  const handleDeleteEndpoint = async (endpointId: string) => {
    if (!confirm('Are you sure you want to delete this endpoint? All responses will be deleted.')) return
    try {
      await api.mocks.deleteEndpoint(endpointId, token!)
      await loadEndpoints()
      setSelectedEndpoint(null)
      setSelectedEndpointData(null)
    } catch (error) {
      console.error('Failed to delete endpoint:', error)
      alert('Failed to delete endpoint')
    }
  }

  const handleToggleEnvironment = async (envId: string, enabled: boolean) => {
    try {
      await api.mocks.updateEnvironment(envId, token!, { isEnabled: enabled })
      await loadEnvironments()
    } catch (error) {
      console.error('Failed to update environment:', error)
    }
  }

  const handleSetDefault = async (envId: string) => {
    try {
      await api.mocks.updateEnvironment(envId, token!, { isDefault: true })
      await loadEnvironments()
    } catch (error) {
      console.error('Failed to set default environment:', error)
    }
  }

  if (loading) {
    return <div className="p-6 text-gray-400">Loading...</div>
  }

  const currentEnv = environments.find((e) => e.id === selectedEnvironment)

  return (
    <div className="p-6">
      {/* Sub-tabs */}
      <div className="mb-6 border-b border-gray-800">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveSubTab('mocks')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeSubTab === 'mocks'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            API Mocks
          </button>
          <button
            onClick={() => setActiveSubTab('builds')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeSubTab === 'builds'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Builds
          </button>
        </nav>
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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">API Mocking</h1>
        <button
          onClick={() => setShowCreateEnv(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Create Environment
        </button>
      </div>

      {/* Environments Table */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 mb-6">
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">Environments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Mode</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Endpoints</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {environments.map((env) => (
                <tr
                  key={env.id}
                  className={`cursor-pointer hover:bg-gray-800/50 ${
                    selectedEnvironment === env.id ? 'bg-blue-900/20' : ''
                  }`}
                  onClick={() => setSelectedEnvironment(env.id)}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">
                      {env.name}
                      {env.isDefault && <span className="ml-2 text-xs text-gray-400">(Default)</span>}
                    </div>
                    {env.description && (
                      <div className="text-xs text-gray-400 mt-1">{env.description}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{env.mode}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{env._count?.endpoints || 0}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded ${
                      env.isEnabled ? 'bg-green-900/30 text-green-400' : 'bg-gray-700 text-gray-400'
                    }`}>
                      {env.isEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      {!env.isDefault && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSetDefault(env.id)
                          }}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          Set Default
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Endpoints Table */}
      {selectedEnvironment && (
        <div className="bg-gray-900 rounded-lg border border-gray-800 mb-6">
          <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Endpoints {currentEnv && `(${currentEnv.name})`}
            </h2>
            <button
              onClick={() => setShowCreateEndpoint(true)}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              + Add Endpoint
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Method</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Path</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Responses</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {endpoints.map((endpoint) => (
                  <tr
                    key={endpoint.id}
                    className={`cursor-pointer hover:bg-gray-800/50 ${
                      selectedEndpoint === endpoint.id ? 'bg-blue-900/20' : ''
                    }`}
                    onClick={() => setSelectedEndpoint(endpoint.id)}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-mono text-sm font-medium text-blue-400">{endpoint.method}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm text-gray-300">{endpoint.path}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {endpoint.description || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                      {endpoint.responses.length} response{endpoint.responses.length !== 1 ? 's' : ''}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {!endpoint.isEnabled && (
                        <span className="px-2 py-1 text-xs rounded bg-gray-700 text-gray-400">Disabled</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteEndpoint(endpoint.id)
                        }}
                        className="text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {endpoints.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                      No endpoints yet. Click &quot;+ Add Endpoint&quot; to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Responses Table */}
      {selectedEndpointData && (
        <div className="bg-gray-900 rounded-lg border border-gray-800">
          <div className="p-4 border-b border-gray-800">
            <h2 className="text-lg font-semibold text-white mb-2">
              Responses for {selectedEndpointData.method} {selectedEndpointData.path}
            </h2>
            {selectedEndpointData.description && (
              <p className="text-sm text-gray-400">{selectedEndpointData.description}</p>
            )}
          </div>
          <div className="p-4">
            <div className="mb-4">
              <button
                onClick={() => setShowCreateResponse(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                + Add Response
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Delay</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Flags</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Preview</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {selectedEndpointData.responses.map((response) => (
                    <tr key={response.id} className="hover:bg-gray-800/50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          response.statusCode >= 200 && response.statusCode < 300
                            ? 'bg-green-900/30 text-green-400'
                            : response.statusCode >= 400 && response.statusCode < 500
                            ? 'bg-yellow-900/30 text-yellow-400'
                            : 'bg-red-900/30 text-red-400'
                        }`}>
                          {response.statusCode}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">{response.name || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{response.delay}ms</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex gap-2">
                          {response.isDefault && (
                            <span className="px-2 py-0.5 text-xs rounded bg-blue-900/30 text-blue-400">Default</span>
                          )}
                          {!response.isEnabled && (
                            <span className="px-2 py-0.5 text-xs rounded bg-gray-700 text-gray-400">Disabled</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {response.responseBody && (
                          <div className="text-xs font-mono text-gray-400 max-w-xs truncate">
                            {JSON.stringify(response.responseBody).slice(0, 50)}...
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingResponse(response)}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteResponse(response.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
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
    </div>
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-4 text-white">Create Mock Environment</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500"
              placeholder="e.g., Development, Staging"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Mode</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
            >
              <option value="selective">Selective (only mocked endpoints)</option>
              <option value="global">Global (check all, fallback to real API)</option>
              <option value="whitelist">Whitelist (only whitelisted patterns)</option>
              <option value="blacklist">Blacklist (all except blacklisted)</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-700 rounded hover:bg-gray-800 text-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (name) {
                  onSubmit({ name, description, mode })
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-4 text-white">Create Mock Endpoint</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Method</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Path</label>
            <input
              type="text"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded font-mono text-white placeholder-gray-500"
              placeholder="e.g., /api/users/:id"
            />
            <div className="text-xs text-gray-400 mt-1">
              Use :param for path parameters, * for wildcards
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500"
              rows={2}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-700 rounded hover:bg-gray-800 text-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (path) {
                  onSubmit({ path, method, description })
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
    // Validate JSON body
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-white">
          {response ? 'Edit Response' : 'Create Response'}
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Status Code</label>
              <input
                type="number"
                value={statusCode}
                onChange={(e) => setStatusCode(parseInt(e.target.value) || 200)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                min={100}
                max={599}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Delay (ms)</label>
              <input
                type="number"
                value={delay}
                onChange={(e) => setDelay(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                min={0}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500"
              placeholder="e.g., Success, Not Found"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Response Body (JSON)</label>
            <textarea
              value={responseBody}
              onChange={(e) => {
                setResponseBody(e.target.value)
                setBodyError('')
              }}
              className={`w-full px-3 py-2 bg-gray-800 border rounded font-mono text-sm text-white ${
                bodyError ? 'border-red-500' : 'border-gray-700'
              }`}
              rows={10}
            />
            {bodyError && <div className="text-xs text-red-400 mt-1">{bodyError}</div>}
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-300">Response Headers</label>
              <button
                onClick={addHeader}
                className="text-xs px-2 py-1 bg-blue-900/30 text-blue-400 rounded hover:bg-blue-900/50"
              >
                + Add Header
              </button>
            </div>
            <div className="space-y-2">
              {responseHeaders.map((header, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={header.key}
                    onChange={(e) => updateHeader(index, 'key', e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500"
                    placeholder="Header name"
                  />
                  <input
                    type="text"
                    value={header.value}
                    onChange={(e) => updateHeader(index, 'value', e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500"
                    placeholder="Header value"
                  />
                  <button
                    onClick={() => removeHeader(index)}
                    className="px-3 py-2 text-red-400 hover:bg-red-900/20 rounded"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="text-blue-600"
              />
              <span className="text-sm text-gray-300">Set as default response</span>
            </label>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-700 rounded hover:bg-gray-800 text-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {response ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

