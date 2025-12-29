'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

interface BusinessConfigHistoryProps {
  projectId: string
  configId?: string
  token: string
  onClose: () => void
}

interface ChangeLog {
  id: string
  action: string
  beforeValue: any
  afterValue: any
  changes: any
  userId: string | null
  userName: string | null
  createdAt: string
  config: {
    key: string
    label: string | null
  }
}

export default function BusinessConfigHistory({
  projectId,
  configId,
  token,
  onClose
}: BusinessConfigHistoryProps) {
  const [changes, setChanges] = useState<ChangeLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadChanges()
  }, [])

  const loadChanges = async () => {
    try {
      setLoading(true)
      const data = await api.businessConfig.getChanges(projectId, configId, 100, token)
      setChanges(data.changes)
    } catch (error) {
      console.error('Failed to load changes:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatAction = (action: string) => {
    const actions: Record<string, string> = {
      create: 'Created',
      update: 'Updated',
      delete: 'Deleted'
    }
    return actions[action] || action
  }

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) {
      return '<empty>'
    }
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2)
    }
    return String(value)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-800">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Change History</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : changes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No change history available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {changes.map((change) => (
                <div key={change.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                        change.action === 'create' ? 'bg-green-600/20 text-green-400' :
                        change.action === 'update' ? 'bg-blue-600/20 text-blue-400' :
                        'bg-red-600/20 text-red-400'
                      }`}>
                        {change.action === 'create' ? '+' :
                         change.action === 'update' ? '↻' : '×'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium text-sm">
                            {formatAction(change.action)}
                          </span>
                          <code className="text-xs text-gray-400 bg-gray-700 px-2 py-0.5 rounded">
                            {change.config.key}
                          </code>
                        </div>
                        <p className="text-gray-500 text-xs mt-1">
                          by {change.userName || 'Unknown'} • {new Date(change.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {change.action === 'update' && change.beforeValue !== null && (
                    <div className="mb-2">
                      <p className="text-xs text-gray-500 mb-1">Previous:</p>
                      <div className="bg-red-900/20 border border-red-800 rounded p-2">
                        <pre className="text-red-300 text-xs overflow-auto whitespace-pre-wrap">
                          {formatValue(change.beforeValue)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {change.action !== 'delete' && change.afterValue !== null && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">New:</p>
                      <div className="bg-green-900/20 border border-green-800 rounded p-2">
                        <pre className="text-green-300 text-xs overflow-auto whitespace-pre-wrap">
                          {formatValue(change.afterValue)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {change.action === 'delete' && change.beforeValue !== null && (
                    <div className="bg-red-900/20 border border-red-800 rounded p-2">
                      <pre className="text-red-300 text-xs overflow-auto whitespace-pre-wrap">
                        {formatValue(change.beforeValue)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

