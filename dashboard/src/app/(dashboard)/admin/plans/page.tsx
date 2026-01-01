'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { api } from '@/lib/api'
import Link from 'next/link'

type EnforcementConfig = {
  warnThreshold?: number
  hardThreshold?: number
  gracePeriodHours?: number
  overageBufferPercent?: number
  moduleRules?: {
    apiTraces?: {
      samplingRate?: number
      dropResponseBodies?: boolean
    }
    logs?: {
      prioritizeCrashes?: boolean
      minRetentionDays?: number
    }
    sessions?: {
      samplingRate?: number
      capEventsPerSession?: number
    }
    businessConfig?: {
      freezePublishing?: boolean
      serveLastPublished?: boolean
    }
    localization?: {
      freezePublishing?: boolean
      serveLastPublished?: boolean
    }
  }
}

type Plan = {
  id: string
  name: string
  displayName: string
  description: string | null
  price: number
  currency: string
  interval: string
  isActive: boolean
  isPublic: boolean
  maxProjects: number | null
  maxDevices: number | null
  maxMockEndpoints: number | null
  maxApiEndpoints: number | null
  maxApiRequests: number | null
  maxLogs: number | null
  maxSessions: number | null
  maxCrashes: number | null
  maxBusinessConfigKeys: number | null
  maxLocalizationLanguages: number | null
  maxLocalizationKeys: number | null
  maxTeamMembers: number | null
  maxSeats: number | null
  retentionDays: number | null
  allowApiTracking: boolean
  allowScreenTracking: boolean
  allowCrashReporting: boolean
  allowLogging: boolean
  allowBusinessConfig: boolean
  allowLocalization: boolean
  allowCustomDomains: boolean
  allowWebhooks: boolean
  allowTeamMembers: boolean
  allowPrioritySupport: boolean
  enforcementConfig?: EnforcementConfig | null
  _count: {
    subscriptions: number
  }
}

export default function AdminPlansPage() {
  const { token } = useAuth()
  const [plans, setPlans] = useState<Plan[]>([])
  const [allPlans, setAllPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState<Partial<Plan>>({})
  const [showTestPlans, setShowTestPlans] = useState(false)

  useEffect(() => {
    if (!token) return
    loadPlans()
  }, [token])

  useEffect(() => {
    if (allPlans && allPlans.length > 0) {
      const filtered = showTestPlans 
        ? allPlans 
        : allPlans.filter(p => p.name && !p.name.startsWith('test_'))
      setPlans(filtered)
    } else {
      setPlans([])
    }
  }, [showTestPlans, allPlans])

  const loadPlans = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await api.admin.getPlans(token!)
      if (data && data.plans) {
        setAllPlans(data.plans || [])
        // Filter out test plans by default
        const filtered = showTestPlans 
          ? (data.plans || [])
          : (data.plans || []).filter(p => !p.name.startsWith('test_'))
        setPlans(filtered)
      } else {
        setAllPlans([])
        setPlans([])
      }
    } catch (err) {
      console.error('Failed to load plans:', err)
      setError(err instanceof Error ? err.message : 'Failed to load plans')
      setAllPlans([])
      setPlans([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (allPlans && allPlans.length > 0) {
      const filtered = showTestPlans 
        ? allPlans 
        : allPlans.filter(p => p.name && !p.name.startsWith('test_'))
      setPlans(filtered)
    } else {
      setPlans([])
    }
  }, [showTestPlans, allPlans])

  const handleCreate = async () => {
    try {
      if (!formData.name || !formData.displayName || formData.price === undefined) {
        setError('Name, Display Name, and Price are required')
        return
      }

      await api.admin.createPlan(formData, token!)
      setShowCreateModal(false)
      setFormData({})
      loadPlans()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create plan')
    }
  }

  const handleUpdate = async (planId: string) => {
    try {
      await api.admin.updatePlan(planId, formData, token!)
      setEditingPlan(null)
      setFormData({})
      loadPlans()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update plan')
    }
  }

  const handleDelete = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this plan? This cannot be undone if there are active subscriptions.')) {
      return
    }

    try {
      await api.admin.deletePlan(planId, token!)
      loadPlans()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete plan')
    }
  }

  const handleDeleteTestPlans = async () => {
    if (!token) return
    
    try {
      const testPlans = (allPlans || []).filter(p => p.name && p.name.startsWith('test_'))
      for (const plan of testPlans) {
        try {
          await api.admin.deletePlan(plan.id, token)
        } catch (err) {
          console.error(`Failed to delete plan ${plan.name}:`, err)
        }
      }
      loadPlans()
      alert(`Deleted ${testPlans.length} test plan(s)`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete test plans')
    }
  }

  const formatLimit = (value: number | null) => {
    if (value === null) return 'Unlimited'
    return value.toLocaleString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400">Loading plans...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Plan Management</h1>
          <p className="text-gray-400">Create, edit, and manage subscription plans</p>
          <p className="text-sm text-gray-500 mt-1">
            💡 Configure plan limits, features, and pricing. Then assign plans to users in{' '}
            <Link href="/admin/subscriptions" className="text-blue-400 hover:text-blue-300 underline">
              Subscription Management
            </Link>
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin"
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Back to Dashboard
          </Link>
          <Link
            href="/admin/subscriptions/create"
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Assign Plan to User
          </Link>
          <button
            onClick={() => {
              setFormData({})
              setShowCreateModal(true)
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Plan
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-600 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Filter Toggle */}
      <div className="flex items-center justify-between bg-gray-900 rounded-lg p-4 border border-gray-800">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showTestPlans}
              onChange={(e) => setShowTestPlans(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-300">Show Test Plans</span>
          </label>
            <span className="text-sm text-gray-500">
            Showing {plans?.length ?? 0} of {allPlans?.length ?? 0} plans
          </span>
        </div>
        {!showTestPlans && (allPlans?.length ?? 0) > (plans?.length ?? 0) && (
          <button
            onClick={() => {
              const testPlanCount = (allPlans?.length ?? 0) - (plans?.length ?? 0)
              if (testPlanCount > 0 && confirm(`Delete ${testPlanCount} test plan(s)? This cannot be undone.`)) {
                handleDeleteTestPlans()
              }
            }}
            className="px-3 py-1 text-sm bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded transition-colors"
          >
            Delete Test Plans
          </button>
        )}
      </div>

      <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-800 border-b border-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Plan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Subscriptions</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Key Limits</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {plans && plans.length > 0 ? plans.map((plan) => (
              <tr key={plan.id} className="hover:bg-gray-800/50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-white">{plan.displayName}</div>
                  <div className="text-sm text-gray-400">{plan.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-white">
                    ${plan.price.toFixed(2)}/{plan.interval}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-2">
                    {plan.isActive && (
                      <span className="px-2 py-1 text-xs bg-green-900/30 text-green-400 rounded">Active</span>
                    )}
                    {!plan.isActive && (
                      <span className="px-2 py-1 text-xs bg-gray-900/30 text-gray-400 rounded">Inactive</span>
                    )}
                    {plan.isPublic && (
                      <span className="px-2 py-1 text-xs bg-blue-900/30 text-blue-400 rounded">Public</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-white">{plan._count?.subscriptions ?? 0}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-400 space-y-1">
                    <div>Sessions: {formatLimit(plan.maxSessions ?? null)}</div>
                    <div>Devices: {formatLimit(plan.maxDevices ?? null)}</div>
                    <div>Team Members: {formatLimit(plan.maxTeamMembers ?? plan.maxSeats ?? null)}</div>
                    <div>Mock Endpoints: {formatLimit(plan.maxMockEndpoints ?? null)}</div>
                    <div>API Endpoints: {formatLimit(plan.maxApiEndpoints ?? null)}</div>
                    <div>API Requests: {formatLimit(plan.maxApiRequests ?? null)}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setEditingPlan(plan)
                        setFormData({
                          ...plan,
                          enforcementConfig: plan.enforcementConfig || {
                            warnThreshold: 80,
                            hardThreshold: 100,
                            gracePeriodHours: 48,
                            overageBufferPercent: 0,
                            moduleRules: {
                              apiTraces: { samplingRate: 10, dropResponseBodies: true },
                              logs: { prioritizeCrashes: true, minRetentionDays: 7 },
                              sessions: { samplingRate: 10, capEventsPerSession: 100 },
                              businessConfig: { freezePublishing: true, serveLastPublished: true },
                              localization: { freezePublishing: true, serveLastPublished: true },
                            },
                          },
                        })
                      }}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      Edit
                    </button>
                    {(plan._count?.subscriptions ?? 0) === 0 && (
                      <button
                        onClick={() => handleDelete(plan.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                  {loading ? 'Loading plans...' : 'No plans found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingPlan) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-4">
              {editingPlan ? 'Edit Plan' : 'Create Plan'}
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Name (ID)</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  placeholder="free"
                  disabled={!!editingPlan}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Display Name</label>
                <input
                  type="text"
                  value={formData.displayName || ''}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  placeholder="Free Plan"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price ?? ''}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Currency</label>
                <input
                  type="text"
                  value={formData.currency || 'USD'}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Interval</label>
                <select
                  value={formData.interval || 'month'}
                  onChange={(e) => setFormData({ ...formData, interval: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                >
                  <option value="month">Month</option>
                  <option value="year">Year</option>
                </select>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive ?? true}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-300">Active</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isPublic ?? true}
                    onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-300">Public</span>
                </label>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-white mt-6 mb-3">Quota Limits</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              {[
                { key: 'maxProjects', label: 'Projects' },
                { key: 'maxDevices', label: 'Devices' },
                { key: 'maxMockEndpoints', label: 'Mock Endpoints' },
                { key: 'maxApiEndpoints', label: 'API Endpoints' },
                { key: 'maxApiRequests', label: 'API Requests' },
                { key: 'maxSessions', label: 'Sessions' },
                { key: 'maxLogs', label: 'Logs' },
                { key: 'maxCrashes', label: 'Crashes' },
                { key: 'maxBusinessConfigKeys', label: 'Business Config Keys' },
                { key: 'maxLocalizationLanguages', label: 'Localization Languages' },
                { key: 'maxLocalizationKeys', label: 'Localization Keys' },
                { key: 'maxTeamMembers', label: 'Team Members (Seats)' },
                { key: 'maxSeats', label: 'Max Seats (Alias)' },
                { key: 'retentionDays', label: 'Retention Days' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
                  <input
                    type="number"
                    value={(formData[key as keyof Plan] as number | null | undefined) ?? ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? null : parseInt(e.target.value)
                      setFormData({ ...formData, [key]: value })
                    }}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    placeholder="Unlimited"
                  />
                </div>
              ))}
            </div>

            <h3 className="text-lg font-semibold text-white mt-6 mb-3">Feature Flags</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                { key: 'allowApiTracking', label: 'API Tracking' },
                { key: 'allowScreenTracking', label: 'Screen Tracking' },
                { key: 'allowCrashReporting', label: 'Crash Reporting' },
                { key: 'allowLogging', label: 'Logging' },
                { key: 'allowBusinessConfig', label: 'Business Config' },
                { key: 'allowLocalization', label: 'Localization' },
                { key: 'allowCustomDomains', label: 'Custom Domains' },
                { key: 'allowWebhooks', label: 'Webhooks' },
                { key: 'allowTeamMembers', label: 'Team Members' },
                { key: 'allowPrioritySupport', label: 'Priority Support' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={(formData[key as keyof Plan] as boolean | undefined) ?? false}
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-300">{label}</span>
                </label>
              ))}
            </div>

            {/* Enforcement Settings */}
            <h3 className="text-lg font-semibold text-white mt-6 mb-3">Enforcement Settings</h3>
            <div className="bg-gray-800/50 rounded-lg p-4 mb-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Warn Threshold (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={(formData.enforcementConfig as EnforcementConfig)?.warnThreshold ?? 80}
                    onChange={(e) => {
                      const enforcementConfig: EnforcementConfig = {
                        ...((formData.enforcementConfig as EnforcementConfig) || {}),
                        warnThreshold: parseInt(e.target.value) || 80,
                      }
                      setFormData({ ...formData, enforcementConfig })
                    }}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    placeholder="80"
                  />
                  <p className="text-xs text-gray-500 mt-1">Show warnings when usage reaches this percentage</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Hard Threshold (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={(formData.enforcementConfig as EnforcementConfig)?.hardThreshold ?? 100}
                    onChange={(e) => {
                      const enforcementConfig: EnforcementConfig = {
                        ...((formData.enforcementConfig as EnforcementConfig) || {}),
                        hardThreshold: parseInt(e.target.value) || 100,
                      }
                      setFormData({ ...formData, enforcementConfig })
                    }}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    placeholder="100"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter grace period when usage exceeds this percentage</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Grace Period (hours)</label>
                  <input
                    type="number"
                    min="0"
                    value={(formData.enforcementConfig as EnforcementConfig)?.gracePeriodHours ?? 48}
                    onChange={(e) => {
                      const enforcementConfig: EnforcementConfig = {
                        ...((formData.enforcementConfig as EnforcementConfig) || {}),
                        gracePeriodHours: parseInt(e.target.value) || 48,
                      }
                      setFormData({ ...formData, enforcementConfig })
                    }}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    placeholder="48"
                  />
                  <p className="text-xs text-gray-500 mt-1">Duration of grace period before degradation</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Overage Buffer (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={(formData.enforcementConfig as EnforcementConfig)?.overageBufferPercent ?? 0}
                    onChange={(e) => {
                      const enforcementConfig: EnforcementConfig = {
                        ...((formData.enforcementConfig as EnforcementConfig) || {}),
                        overageBufferPercent: parseInt(e.target.value) || 0,
                      }
                      setFormData({ ...formData, enforcementConfig })
                    }}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">Optional buffer before applying degradation</p>
                </div>
              </div>

              {/* Module Rules */}
              <div className="mt-4 pt-4 border-t border-gray-700">
                <h4 className="text-sm font-semibold text-gray-300 mb-3">Module Degradation Rules</h4>
                
                {/* API Traces */}
                <div className="mb-3 p-3 bg-gray-900/50 rounded">
                  <label className="text-sm font-medium text-gray-300 mb-2 block">API Traces</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Sampling Rate (1 in N)</label>
                      <input
                        type="number"
                        min="1"
                        value={(formData.enforcementConfig as EnforcementConfig)?.moduleRules?.apiTraces?.samplingRate ?? 10}
                        onChange={(e) => {
                          const enforcementConfig: EnforcementConfig = {
                            ...((formData.enforcementConfig as EnforcementConfig) || {}),
                            moduleRules: {
                              ...((formData.enforcementConfig as EnforcementConfig)?.moduleRules || {}),
                              apiTraces: {
                                ...((formData.enforcementConfig as EnforcementConfig)?.moduleRules?.apiTraces || {}),
                                samplingRate: parseInt(e.target.value) || 10,
                              },
                            },
                          }
                          setFormData({ ...formData, enforcementConfig })
                        }}
                        className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                      />
                    </div>
                    <label className="flex items-center gap-2 mt-6">
                      <input
                        type="checkbox"
                        checked={(formData.enforcementConfig as EnforcementConfig)?.moduleRules?.apiTraces?.dropResponseBodies ?? true}
                        onChange={(e) => {
                          const enforcementConfig: EnforcementConfig = {
                            ...((formData.enforcementConfig as EnforcementConfig) || {}),
                            moduleRules: {
                              ...((formData.enforcementConfig as EnforcementConfig)?.moduleRules || {}),
                              apiTraces: {
                                ...((formData.enforcementConfig as EnforcementConfig)?.moduleRules?.apiTraces || {}),
                                dropResponseBodies: e.target.checked,
                              },
                            },
                          }
                          setFormData({ ...formData, enforcementConfig })
                        }}
                        className="rounded"
                      />
                      <span className="text-xs text-gray-400">Drop response bodies first</span>
                    </label>
                  </div>
                </div>

                {/* Logs */}
                <div className="mb-3 p-3 bg-gray-900/50 rounded">
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Logs</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Min Retention (days)</label>
                      <input
                        type="number"
                        min="1"
                        value={(formData.enforcementConfig as EnforcementConfig)?.moduleRules?.logs?.minRetentionDays ?? 7}
                        onChange={(e) => {
                          const enforcementConfig: EnforcementConfig = {
                            ...((formData.enforcementConfig as EnforcementConfig) || {}),
                            moduleRules: {
                              ...((formData.enforcementConfig as EnforcementConfig)?.moduleRules || {}),
                              logs: {
                                ...((formData.enforcementConfig as EnforcementConfig)?.moduleRules?.logs || {}),
                                minRetentionDays: parseInt(e.target.value) || 7,
                              },
                            },
                          }
                          setFormData({ ...formData, enforcementConfig })
                        }}
                        className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                      />
                    </div>
                    <label className="flex items-center gap-2 mt-6">
                      <input
                        type="checkbox"
                        checked={(formData.enforcementConfig as EnforcementConfig)?.moduleRules?.logs?.prioritizeCrashes ?? true}
                        onChange={(e) => {
                          const enforcementConfig: EnforcementConfig = {
                            ...((formData.enforcementConfig as EnforcementConfig) || {}),
                            moduleRules: {
                              ...((formData.enforcementConfig as EnforcementConfig)?.moduleRules || {}),
                              logs: {
                                ...((formData.enforcementConfig as EnforcementConfig)?.moduleRules?.logs || {}),
                                prioritizeCrashes: e.target.checked,
                              },
                            },
                          }
                          setFormData({ ...formData, enforcementConfig })
                        }}
                        className="rounded"
                      />
                      <span className="text-xs text-gray-400">Prioritize crashes</span>
                    </label>
                  </div>
                </div>

                {/* Sessions */}
                <div className="mb-3 p-3 bg-gray-900/50 rounded">
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Sessions</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Sampling Rate (1 in N)</label>
                      <input
                        type="number"
                        min="1"
                        value={(formData.enforcementConfig as EnforcementConfig)?.moduleRules?.sessions?.samplingRate ?? 10}
                        onChange={(e) => {
                          const enforcementConfig: EnforcementConfig = {
                            ...((formData.enforcementConfig as EnforcementConfig) || {}),
                            moduleRules: {
                              ...((formData.enforcementConfig as EnforcementConfig)?.moduleRules || {}),
                              sessions: {
                                ...((formData.enforcementConfig as EnforcementConfig)?.moduleRules?.sessions || {}),
                                samplingRate: parseInt(e.target.value) || 10,
                              },
                            },
                          }
                          setFormData({ ...formData, enforcementConfig })
                        }}
                        className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Cap Events/Session</label>
                      <input
                        type="number"
                        min="1"
                        value={(formData.enforcementConfig as EnforcementConfig)?.moduleRules?.sessions?.capEventsPerSession ?? 100}
                        onChange={(e) => {
                          const enforcementConfig: EnforcementConfig = {
                            ...((formData.enforcementConfig as EnforcementConfig) || {}),
                            moduleRules: {
                              ...((formData.enforcementConfig as EnforcementConfig)?.moduleRules || {}),
                              sessions: {
                                ...((formData.enforcementConfig as EnforcementConfig)?.moduleRules?.sessions || {}),
                                capEventsPerSession: parseInt(e.target.value) || 100,
                              },
                            },
                          }
                          setFormData({ ...formData, enforcementConfig })
                        }}
                        className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Business Config & Localization */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-900/50 rounded">
                    <label className="text-sm font-medium text-gray-300 mb-2 block">Business Config</label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={(formData.enforcementConfig as EnforcementConfig)?.moduleRules?.businessConfig?.freezePublishing ?? true}
                        onChange={(e) => {
                          const enforcementConfig: EnforcementConfig = {
                            ...((formData.enforcementConfig as EnforcementConfig) || {}),
                            moduleRules: {
                              ...((formData.enforcementConfig as EnforcementConfig)?.moduleRules || {}),
                              businessConfig: {
                                ...((formData.enforcementConfig as EnforcementConfig)?.moduleRules?.businessConfig || {}),
                                freezePublishing: e.target.checked,
                                serveLastPublished: true,
                              },
                            },
                          }
                          setFormData({ ...formData, enforcementConfig })
                        }}
                        className="rounded"
                      />
                      <span className="text-xs text-gray-400">Freeze publishing when degraded</span>
                    </label>
                  </div>
                  <div className="p-3 bg-gray-900/50 rounded">
                    <label className="text-sm font-medium text-gray-300 mb-2 block">Localization</label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={(formData.enforcementConfig as EnforcementConfig)?.moduleRules?.localization?.freezePublishing ?? true}
                        onChange={(e) => {
                          const enforcementConfig: EnforcementConfig = {
                            ...((formData.enforcementConfig as EnforcementConfig) || {}),
                            moduleRules: {
                              ...((formData.enforcementConfig as EnforcementConfig)?.moduleRules || {}),
                              localization: {
                                ...((formData.enforcementConfig as EnforcementConfig)?.moduleRules?.localization || {}),
                                freezePublishing: e.target.checked,
                                serveLastPublished: true,
                              },
                            },
                          }
                          setFormData({ ...formData, enforcementConfig })
                        }}
                        className="rounded"
                      />
                      <span className="text-xs text-gray-400">Freeze publishing when degraded</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setEditingPlan(null)
                  setFormData({})
                }}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => editingPlan ? handleUpdate(editingPlan.id) : handleCreate()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                {editingPlan ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

