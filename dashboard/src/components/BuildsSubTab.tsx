'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { api } from '@/lib/api'

type Build = {
  id: string
  version: number
  name: string | null
  description: string | null
  mode: string | null
  isActive: boolean
  configCount: number
  translationCount: number
  createdAt: string
  createdBy: string | null
  creator: {
    id: string
    email: string
    name: string | null
  } | null
  features: Array<{
    id: string
    featureType: string
    itemCount: number
  }>
  _count?: {
    changeLogs: number
  }
}

type FeatureType = 'business_config' | 'localization' | 'api_mocks'

interface BuildsSubTabProps {
  projectId: string
  featureType: FeatureType
  featureLabel: string
  token?: string
}

export default function BuildsSubTab({ projectId, featureType, featureLabel, token: propToken }: BuildsSubTabProps) {
  const router = useRouter()
  const { token: authToken } = useAuth()
  const token = propToken || authToken
  const [builds, setBuilds] = useState<Build[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [buildName, setBuildName] = useState('')
  const [buildDescription, setBuildDescription] = useState('')
  const [selectedBuild, setSelectedBuild] = useState<Build | null>(null)
  const [showDiff, setShowDiff] = useState(false)
  const [diffBuildId, setDiffBuildId] = useState<string | null>(null)
  const [diffData, setDiffData] = useState<any>(null)
  const [businessConfigUsage, setBusinessConfigUsage] = useState<{
    used: number
    limit: number | null
    percentage: number
  } | null>(null)
  const [localizationLanguagesUsage, setLocalizationLanguagesUsage] = useState<{
    used: number
    limit: number | null
    percentage: number
  } | null>(null)
  const [localizationKeysUsage, setLocalizationKeysUsage] = useState<{
    used: number
    limit: number | null
    percentage: number
  } | null>(null)

  useEffect(() => {
    if (!token || !projectId) return
    loadBuilds()
  }, [token, projectId, featureType])

  // Fetch usage for enforcement based on feature type
  useEffect(() => {
    if (!token) return
    const fetchUsage = async () => {
      try {
        const usageRes = await api.subscription.getUsage(token)
        if (featureType === 'business_config' && usageRes?.usage?.businessConfigKeys) {
          setBusinessConfigUsage(usageRes.usage.businessConfigKeys)
        }
        if (featureType === 'localization') {
          if (usageRes?.usage?.localizationLanguages) {
            setLocalizationLanguagesUsage(usageRes.usage.localizationLanguages)
          }
          if (usageRes?.usage?.localizationKeys) {
            setLocalizationKeysUsage(usageRes.usage.localizationKeys)
          }
        }
      } catch (error) {
        console.error('Failed to fetch usage:', error)
      }
    }
    fetchUsage()
  }, [token, featureType])

  const loadBuilds = async () => {
    if (!projectId || !token) return
    try {
      setLoading(true)
      const response = await api.builds.list(projectId, token, featureType)
      const featureBuilds = (response.builds || []).filter((b: any) => 
        b.features?.some((f: any) => f.featureType === featureType)
      )
      setBuilds(featureBuilds)
      if (featureBuilds.length > 0 && !selectedBuild) {
        setSelectedBuild(featureBuilds[0])
      }
    } catch (error) {
      console.error('Failed to load builds:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBuild = async () => {
    if (!token) return
    try {
      setCreating(true)
      await api.builds.create(projectId, token, {
        featureType,
        name: buildName || undefined,
        description: buildDescription || undefined,
      })
      setBuildName('')
      setBuildDescription('')
      await loadBuilds()
    } catch (error) {
      alert('Failed to create build: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setCreating(false)
    }
  }

  const handleSetMode = async (buildId: string, mode: 'preview' | 'production') => {
    if (!token) return
    try {
      await api.builds.setMode(buildId, mode, token)
      await loadBuilds()
      if (selectedBuild?.id === buildId) {
        const updated = await api.builds.get(buildId, token)
        setSelectedBuild(updated.build)
      }
    } catch (error) {
      alert('Failed to set build mode: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const handleDeleteBuild = async (buildId: string) => {
    if (!token) return
    if (!confirm('Are you sure you want to delete this build? This action cannot be undone.')) {
      return
    }
    try {
      await api.builds.delete(buildId, token)
      if (selectedBuild?.id === buildId) {
        setSelectedBuild(null)
      }
      await loadBuilds()
    } catch (error) {
      alert('Failed to delete build: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const handleShowDiff = async (buildId: string, compareWithId: string) => {
    if (!token) return
    try {
      const response = await api.builds.getDiff(compareWithId, buildId, token)
      setDiffData(response.diff)
      setDiffBuildId(buildId)
      setShowDiff(true)
    } catch (error) {
      alert('Failed to load diff: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400">Loading builds...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Enforcement Banner for Business Config Keys (only for business_config) */}
      {featureType === 'business_config' && businessConfigUsage && businessConfigUsage.limit !== null && (
        <>
          {(() => {
            const percentage = businessConfigUsage.percentage
            const warnThreshold = 80
            const hardThreshold = 100
            
            if (percentage >= hardThreshold) {
              return (
                <div className="bg-red-900/20 border-l-4 border-red-600 p-4 rounded mb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
                        <span>🚫</span>
                        <span>Business Config Keys Quota Exceeded</span>
                      </h3>
                      <p className="text-gray-300 text-sm mb-2">
                        You have reached your business config keys limit: <strong>{businessConfigUsage.used}/{businessConfigUsage.limit} keys</strong> ({percentage.toFixed(1)}%).
                      </p>
                      <p className="text-gray-300 text-sm">
                        Build creation is disabled. Please upgrade your plan to create more config keys.
                      </p>
                    </div>
                    <button
                      onClick={() => router.push('/subscription')}
                      className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm whitespace-nowrap"
                    >
                      Upgrade Plan
                    </button>
                  </div>
                </div>
              )
            } else if (percentage >= warnThreshold) {
              return (
                <div className="bg-yellow-900/20 border-l-4 border-yellow-600 p-4 rounded mb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-yellow-400 font-semibold mb-2 flex items-center gap-2">
                        <span>⚠️</span>
                        <span>Approaching Business Config Keys Limit</span>
                      </h3>
                      <p className="text-gray-300 text-sm mb-2">
                        You are approaching your business config keys limit: <strong>{businessConfigUsage.used}/{businessConfigUsage.limit} keys</strong> ({percentage.toFixed(1)}%).
                      </p>
                      <p className="text-gray-300 text-sm">
                        You can create {Math.max(0, businessConfigUsage.limit - businessConfigUsage.used)} more key{businessConfigUsage.limit - businessConfigUsage.used !== 1 ? 's' : ''} before reaching your limit.
                      </p>
                    </div>
                    <button
                      onClick={() => router.push('/subscription')}
                      className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm whitespace-nowrap"
                    >
                      Upgrade Plan
                    </button>
                  </div>
                </div>
              )
            }
            return null
          })()}
        </>
      )}

      {/* Enforcement Banner for Localization (only for localization feature type) */}
      {featureType === 'localization' && (
        <>
          {localizationLanguagesUsage && localizationLanguagesUsage.limit !== null && localizationLanguagesUsage.percentage >= 100 && (
            <div className="bg-red-900/20 border-l-4 border-red-600 p-4 rounded mb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
                    <span>🚫</span>
                    <span>Localization Languages Quota Exceeded</span>
                  </h3>
                  <p className="text-gray-300 text-sm mb-2">
                    You have reached your localization languages limit: <strong>{localizationLanguagesUsage.used}/{localizationLanguagesUsage.limit} languages</strong> ({localizationLanguagesUsage.percentage.toFixed(1)}%).
                  </p>
                  <p className="text-gray-300 text-sm">
                    Build creation is disabled. Please upgrade your plan to add more languages.
                  </p>
                </div>
                <button
                  onClick={() => router.push('/subscription')}
                  className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm whitespace-nowrap"
                >
                  Upgrade Plan
                </button>
              </div>
            </div>
          )}
          {localizationKeysUsage && localizationKeysUsage.limit !== null && localizationKeysUsage.percentage >= 100 && (
            <div className="bg-red-900/20 border-l-4 border-red-600 p-4 rounded mb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
                    <span>🚫</span>
                    <span>Localization Keys Quota Exceeded</span>
                  </h3>
                  <p className="text-gray-300 text-sm mb-2">
                    You have reached your localization keys limit: <strong>{localizationKeysUsage.used}/{localizationKeysUsage.limit} keys</strong> ({localizationKeysUsage.percentage.toFixed(1)}%).
                  </p>
                  <p className="text-gray-300 text-sm">
                    Build creation is disabled. Please upgrade your plan to create more keys.
                  </p>
                </div>
                <button
                  onClick={() => router.push('/subscription')}
                  className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm whitespace-nowrap"
                >
                  Upgrade Plan
                </button>
              </div>
            </div>
          )}
        </>
      )}
      {/* Header with Create Build */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">{featureLabel} Builds</h3>
          <p className="text-sm text-gray-400 mt-1">
            {builds.length} build{builds.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Build name (optional)"
            value={buildName}
            onChange={(e) => setBuildName(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 text-sm"
          />
          <button
            onClick={handleCreateBuild}
            disabled={!!(creating || 
              (featureType === 'business_config' && businessConfigUsage && businessConfigUsage.limit !== null && businessConfigUsage.percentage >= 100) ||
              (featureType === 'localization' && (
                (localizationLanguagesUsage && localizationLanguagesUsage.limit !== null && localizationLanguagesUsage.percentage >= 100) ||
                (localizationKeysUsage && localizationKeysUsage.limit !== null && localizationKeysUsage.percentage >= 100)
              ))
            )}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            title={
              featureType === 'business_config' && businessConfigUsage && businessConfigUsage.limit !== null && businessConfigUsage.percentage >= 100 
                ? 'Cannot create build: Business config keys quota exceeded'
                : featureType === 'localization' && (
                  (localizationLanguagesUsage && localizationLanguagesUsage.limit !== null && localizationLanguagesUsage.percentage >= 100) ||
                  (localizationKeysUsage && localizationKeysUsage.limit !== null && localizationKeysUsage.percentage >= 100)
                )
                ? 'Cannot create build: Localization quota exceeded'
                : undefined
            }
          >
            {creating ? 'Creating...' : 'Create Build'}
          </button>
        </div>
      </div>

      {/* Builds Table */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Version</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Created By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Mode</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {builds.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                    No builds yet. Create your first build for {featureLabel}!
                  </td>
                </tr>
              ) : (
                builds.map((build) => {
                  const featureData = build.features.find(f => f.featureType === featureType)
                  const itemCount = featureData?.itemCount || 0

                  return (
                    <tr
                      key={build.id}
                      className={`hover:bg-gray-800/50 cursor-pointer ${
                        selectedBuild?.id === build.id ? 'bg-blue-900/20' : ''
                      }`}
                      onClick={() => setSelectedBuild(build)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">v{build.version}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-white">{build.name || `v${build.version}`}</div>
                        {build.description && (
                          <div className="text-xs text-gray-400 mt-1">{build.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {itemCount} item{itemCount !== 1 ? 's' : ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {build.creator ? (
                          <div>
                            <div className="text-sm text-white">{build.creator.name || build.creator.email}</div>
                            <div className="text-xs text-gray-400">{build.creator.email}</div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Unknown</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(build.createdAt).toLocaleDateString()}
                        <div className="text-xs text-gray-500">
                          {new Date(build.createdAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {build.mode ? (
                          <span className={`px-2 py-1 text-xs rounded ${
                            build.mode === 'production'
                              ? 'bg-green-900/30 text-green-400'
                              : 'bg-blue-900/30 text-blue-400'
                          }`}>
                            {build.mode === 'production' ? 'Production' : 'Preview'}
                            {build.isActive && ' ✓'}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500">Not assigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleSetMode(build.id, 'preview')}
                            disabled={build.mode === 'preview' && build.isActive}
                            className={`px-3 py-1 rounded text-xs ${
                              build.mode === 'preview' && build.isActive
                                ? 'bg-blue-600 text-white cursor-not-allowed'
                                : 'bg-gray-700 hover:bg-gray-600 text-white'
                            }`}
                            title="Set as Preview"
                          >
                            Preview
                          </button>
                          <button
                            onClick={() => handleSetMode(build.id, 'production')}
                            disabled={build.mode === 'production' && build.isActive}
                            className={`px-3 py-1 rounded text-xs ${
                              build.mode === 'production' && build.isActive
                                ? 'bg-green-600 text-white cursor-not-allowed'
                                : 'bg-gray-700 hover:bg-gray-600 text-white'
                            }`}
                            title="Set as Production"
                          >
                            Production
                          </button>
                          {builds.length > 1 && (
                            <select
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleShowDiff(e.target.value, build.id)
                                }
                              }}
                              className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs"
                              onClick={(e) => e.stopPropagation()}
                              title="Compare with"
                              defaultValue=""
                            >
                              <option value="">Compare</option>
                              {builds
                                .filter(b => b.id !== build.id)
                                .map((b) => (
                                  <option key={b.id} value={b.id}>
                                    {b.name || `v${b.version}`}
                                  </option>
                                ))}
                            </select>
                          )}
                          <button
                            onClick={() => handleDeleteBuild(build.id)}
                            disabled={build.isActive}
                            className="px-3 py-1 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete Build"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Diff View Modal */}
      {showDiff && diffData && selectedBuild && diffBuildId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto border border-gray-800">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">Build Comparison</h2>
              <button
                onClick={() => {
                  setShowDiff(false)
                  setDiffData(null)
                  setDiffBuildId(null)
                }}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {Object.entries(diffData.diff || {}).map(([featureType, changes]: [string, any]) => (
                <div key={featureType} className="border border-gray-700 rounded p-4">
                  <h3 className="text-lg font-semibold text-white mb-3 capitalize">
                    {featureType.replace('_', ' ')}
                  </h3>
                  <div className="space-y-2">
                    {changes.map((change: any, idx: number) => (
                      <div
                        key={idx}
                        className={`p-3 rounded ${
                          change.changeType === 'added'
                            ? 'bg-green-900/20 border border-green-600'
                            : change.changeType === 'deleted'
                            ? 'bg-red-900/20 border border-red-600'
                            : 'bg-yellow-900/20 border border-yellow-600'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 text-xs rounded ${
                            change.changeType === 'added'
                              ? 'bg-green-600 text-white'
                              : change.changeType === 'deleted'
                              ? 'bg-red-600 text-white'
                              : 'bg-yellow-600 text-white'
                          }`}>
                            {change.changeType.toUpperCase()}
                          </span>
                          <span className="text-white font-medium">{change.itemLabel || change.itemKey}</span>
                        </div>
                        {change.changeType === 'changed' && (
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="text-gray-400 mb-1">Old Value</div>
                              <div className="text-red-300 break-all font-mono text-xs">
                                {JSON.stringify(change.oldValue, null, 2)}
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-400 mb-1">New Value</div>
                              <div className="text-green-300 break-all font-mono text-xs">
                                {JSON.stringify(change.newValue, null, 2)}
                              </div>
                            </div>
                          </div>
                        )}
                        {change.changeType === 'added' && (
                          <div className="text-sm">
                            <div className="text-gray-400 mb-1">Value</div>
                            <div className="text-green-300 break-all font-mono text-xs">
                              {JSON.stringify(change.newValue, null, 2)}
                            </div>
                          </div>
                        )}
                        {change.changeType === 'deleted' && (
                          <div className="text-sm">
                            <div className="text-gray-400 mb-1">Value</div>
                            <div className="text-red-300 break-all font-mono text-xs">
                              {JSON.stringify(change.oldValue, null, 2)}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    {changes.length === 0 && (
                      <div className="text-gray-400 text-sm">No changes</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

