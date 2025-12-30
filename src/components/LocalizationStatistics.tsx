'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

interface LocalizationStatisticsProps {
  projectId: string
  token: string
}

export default function LocalizationStatistics({ projectId, token }: LocalizationStatisticsProps) {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<{
    overview: {
      totalKeys: number
      totalLanguages: number
      totalTranslations: number
      completionRate: number
    }
    languages: Array<{
      id: string
      code: string
      name: string
      totalKeys: number
      translatedKeys: number
      completionRate: number
      missingKeys: number
      reviewedCount: number
      reviewedRate: number
    }>
    categories: Array<{
      category: string
      totalKeys: number
      translatedKeys: number
      completionRate: number
    }>
    recentActivity: Array<{
      type: string
      timestamp: string
      details: Record<string, any>
    }>
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadStatistics()
  }, [projectId, token])

  const loadStatistics = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.localization.getStatistics(projectId, token)
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load statistics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
        {error}
        <button onClick={loadStatistics} className="ml-4 text-red-300 hover:text-red-100 underline">
          Retry
        </button>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-1">Total Keys</div>
          <div className="text-2xl font-bold text-white">{stats.overview.totalKeys}</div>
        </div>
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-1">Languages</div>
          <div className="text-2xl font-bold text-white">{stats.overview.totalLanguages}</div>
        </div>
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-1">Translations</div>
          <div className="text-2xl font-bold text-white">{stats.overview.totalTranslations}</div>
        </div>
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-1">Completion Rate</div>
          <div className="text-2xl font-bold text-white">{stats.overview.completionRate.toFixed(1)}%</div>
        </div>
      </div>

      {/* Language Statistics */}
      <div className="bg-gray-900 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Language Completion</h3>
        <div className="space-y-3">
          {stats.languages.map((lang) => (
            <div key={lang.id} className="bg-gray-800 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{lang.name}</span>
                  <span className="text-gray-500 text-sm">({lang.code})</span>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">{lang.completionRate.toFixed(1)}%</div>
                  <div className="text-gray-500 text-xs">
                    {lang.translatedKeys} / {lang.totalKeys}
                  </div>
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${lang.completionRate}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span>{lang.missingKeys} missing</span>
                <span>
                  {lang.reviewedCount} reviewed ({lang.reviewedRate.toFixed(1)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Statistics */}
      {stats.categories.length > 0 && (
        <div className="bg-gray-900 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Category Breakdown</h3>
          <div className="space-y-2">
            {stats.categories.map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between bg-gray-800 rounded-lg p-2">
                <div>
                  <div className="text-white font-medium">{cat.category}</div>
                  <div className="text-gray-500 text-sm">{cat.totalKeys} keys</div>
                </div>
                <div className="text-right">
                  <div className="text-white">{cat.completionRate.toFixed(1)}%</div>
                  <div className="text-gray-500 text-xs">{cat.translatedKeys} translated</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {stats.recentActivity.length > 0 && (
        <div className="bg-gray-900 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {stats.recentActivity.slice(0, 20).map((activity, idx) => (
              <div key={idx} className="flex items-start gap-3 bg-gray-800 rounded-lg p-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="text-white text-sm">
                    {activity.type === 'key_created' && 'Key created'}
                    {activity.type === 'translation_created' && 'Translation created'}
                    {activity.type === 'translation_updated' && 'Translation updated'}
                  </div>
                  <div className="text-gray-500 text-xs">
                    {activity.details.key && (
                      <code className="text-blue-400">{activity.details.key}</code>
                    )}
                    {activity.details.language && ` • ${activity.details.languageName} (${activity.details.language})`}
                  </div>
                  <div className="text-gray-600 text-xs mt-1">
                    {new Date(activity.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

