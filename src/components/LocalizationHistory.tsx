'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

interface LocalizationHistoryProps {
  projectId: string
  translationId?: string
  keyId?: string
  token: string
  onClose: () => void
}

interface HistoryEntry {
  id: string
  oldValue: string | null
  newValue: string
  changeType: string
  userId: string | null
  userName: string | null
  createdAt: string
  metadata: Record<string, any> | null
}

export default function LocalizationHistory({
  projectId,
  translationId,
  keyId,
  token,
  onClose
}: LocalizationHistoryProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      setLoading(true)
      const data = await api.localization.getHistory(projectId, translationId, keyId, 50, token)
      setHistory(data.history)
    } catch (error) {
      console.error('Failed to load history:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatChangeType = (type: string) => {
    const types: Record<string, string> = {
      created: 'Created',
      updated: 'Updated',
      deleted: 'Deleted',
      reviewed: 'Reviewed'
    }
    return types[type] || type
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-800">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Translation History</h3>
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
          ) : history.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No history available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((entry, idx) => (
                <div key={entry.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                        entry.changeType === 'created' ? 'bg-green-600/20 text-green-400' :
                        entry.changeType === 'updated' ? 'bg-blue-600/20 text-blue-400' :
                        entry.changeType === 'deleted' ? 'bg-red-600/20 text-red-400' :
                        'bg-purple-600/20 text-purple-400'
                      }`}>
                        {entry.changeType === 'created' ? '+' :
                         entry.changeType === 'updated' ? '↻' :
                         entry.changeType === 'deleted' ? '×' : '✓'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium text-sm">
                            {formatChangeType(entry.changeType)}
                          </span>
                          {entry.metadata?.provider && (
                            <span className="px-2 py-0.5 bg-gray-700 text-gray-400 text-xs rounded">
                              {entry.metadata.provider}
                            </span>
                          )}
                          {entry.metadata?.confidence && (
                            <span className="px-2 py-0.5 bg-gray-700 text-gray-400 text-xs rounded">
                              {Math.round(entry.metadata.confidence * 100)}% confidence
                            </span>
                          )}
                        </div>
                        <p className="text-gray-500 text-xs mt-1">
                          by {entry.userName || 'Unknown'} • {new Date(entry.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {entry.oldValue && entry.changeType === 'updated' && (
                    <div className="mb-2">
                      <p className="text-xs text-gray-500 mb-1">Previous:</p>
                      <div className="bg-red-900/20 border border-red-800 rounded p-2">
                        <p className="text-red-300 text-sm line-through">{entry.oldValue}</p>
                      </div>
                    </div>
                  )}

                  <div>
                    {entry.changeType === 'deleted' ? (
                      <div className="bg-red-900/20 border border-red-800 rounded p-2">
                        <p className="text-red-300 text-sm">{entry.oldValue || entry.newValue}</p>
                      </div>
                    ) : (
                      <div className="bg-green-900/20 border border-green-800 rounded p-2">
                        <p className="text-green-300 text-sm">{entry.newValue}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

