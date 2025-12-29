'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

interface BusinessConfigAnalyticsProps {
  projectId: string
  configKey?: string
  token: string
  onClose: () => void
}

export default function BusinessConfigAnalytics({
  projectId,
  configKey,
  token,
  onClose
}: BusinessConfigAnalyticsProps) {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  useEffect(() => {
    loadAnalytics()
  }, [startDate, endDate])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const data = await api.businessConfig.getAnalytics(
        projectId,
        configKey,
        startDate || undefined,
        endDate || undefined,
        token
      )
      setAnalytics(data)
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num)
  }

  const formatPercent = (num: number) => {
    return `${(num * 100).toFixed(1)}%`
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-6xl max-h-[90vh] flex flex-col border border-gray-800">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Config Analytics</h3>
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

        {/* Filters */}
        <div className="p-4 border-b border-gray-800 bg-gray-800/30 flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-xs text-gray-400 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-white text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-400 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-white text-sm"
            />
          </div>
          <button
            onClick={() => {
              setStartDate('')
              setEndDate('')
            }}
            className="px-4 py-2 text-gray-400 hover:text-white text-sm"
          >
            Clear Filters
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : analytics ? (
            <div className="space-y-6">
              {/* Overall Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="text-gray-400 text-xs mb-1">Total Fetches</div>
                  <div className="text-white text-2xl font-bold">{formatNumber(analytics.stats.totalFetches)}</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="text-gray-400 text-xs mb-1">Unique Devices</div>
                  <div className="text-white text-2xl font-bold">{formatNumber(analytics.stats.uniqueDevices)}</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="text-gray-400 text-xs mb-1">Unique Users</div>
                  <div className="text-white text-2xl font-bold">{formatNumber(analytics.stats.uniqueUsers)}</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="text-gray-400 text-xs mb-1">Cache Hit Rate</div>
                  <div className="text-white text-2xl font-bold">{formatPercent(analytics.stats.cacheHitRate)}</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="text-gray-400 text-xs mb-1">Targeting Match</div>
                  <div className="text-white text-2xl font-bold">{formatPercent(analytics.stats.targetingMatchRate)}</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="text-gray-400 text-xs mb-1">Rollout Receive</div>
                  <div className="text-white text-2xl font-bold">{formatPercent(analytics.stats.rolloutReceiveRate)}</div>
                </div>
              </div>

              {/* By Config Key */}
              {analytics.byConfigKey && analytics.byConfigKey.length > 0 && (
                <div>
                  <h4 className="text-white font-medium mb-4">By Config Key</h4>
                  <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-700/50">
                        <tr>
                          <th className="text-left px-4 py-3 text-gray-300 text-sm font-medium">Config Key</th>
                          <th className="text-right px-4 py-3 text-gray-300 text-sm font-medium">Fetches</th>
                          <th className="text-right px-4 py-3 text-gray-300 text-sm font-medium">Devices</th>
                          <th className="text-right px-4 py-3 text-gray-300 text-sm font-medium">Users</th>
                          <th className="text-right px-4 py-3 text-gray-300 text-sm font-medium">Cache Hits</th>
                          <th className="text-right px-4 py-3 text-gray-300 text-sm font-medium">Targeting</th>
                          <th className="text-right px-4 py-3 text-gray-300 text-sm font-medium">Rollout</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.byConfigKey.map((item: any, index: number) => (
                          <tr key={index} className="border-t border-gray-700">
                            <td className="px-4 py-3 text-white text-sm font-mono">{item.configKey}</td>
                            <td className="px-4 py-3 text-gray-300 text-sm text-right">{formatNumber(item.totalFetches)}</td>
                            <td className="px-4 py-3 text-gray-300 text-sm text-right">{formatNumber(item.uniqueDevices)}</td>
                            <td className="px-4 py-3 text-gray-300 text-sm text-right">{formatNumber(item.uniqueUsers)}</td>
                            <td className="px-4 py-3 text-gray-300 text-sm text-right">{formatNumber(item.cacheHits)}</td>
                            <td className="px-4 py-3 text-gray-300 text-sm text-right">{formatNumber(item.targetingMatches)}</td>
                            <td className="px-4 py-3 text-gray-300 text-sm text-right">{formatNumber(item.rolloutReceives)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">No analytics data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

