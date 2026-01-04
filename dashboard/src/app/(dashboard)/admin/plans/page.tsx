'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { api } from '@/lib/api'
import Link from 'next/link'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/layout/PageHeader'
import ThemeToggle from '@/components/ThemeToggle'
import DataTable, { Column } from '@/components/DataTable'
import FilterBar from '@/components/FilterBar'

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

  return (
    <AppShell>
      <PageHeader
        title="Plan Management"
        subtitle="Create, edit, and manage subscription plans"
        dataMode="Admin"
        actions={
          <>
            <ThemeToggle />
            <Link href="/admin" className="btn secondary">
              Back to Dashboard
            </Link>
            <Link href="/admin/subscriptions/create" className="btn secondary">
              Assign Plan to User
            </Link>
            <button
              onClick={() => {
                setFormData({})
                setShowCreateModal(true)
              }}
              className="btn"
            >
              Create Plan
            </button>
          </>
        }
      />

      {/* Note Section */}
      <div className="note" style={{ marginTop: '18px' }}>
        <b>Workflow</b>
        <div className="muted" style={{ marginTop: '6px' }}>
          Configure plan limits, features, and pricing. Then assign plans to users in{' '}
          <Link href="/admin/subscriptions" style={{ color: 'var(--p)', textDecoration: 'underline' }}>
            Subscription Management
          </Link>
        </div>
      </div>

      {error && (
        <div className="card" style={{ marginTop: '14px', borderColor: 'var(--d)', background: 'rgba(220, 38, 38, 0.1)' }}>
          <div style={{ color: 'var(--d)' }}>{error}</div>
        </div>
      )}

      {/* Filter Toggle */}
      <div className="card" style={{ marginTop: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={showTestPlans}
                onChange={(e) => setShowTestPlans(e.target.checked)}
                style={{ borderRadius: '4px' }}
              />
              <span className="muted" style={{ fontSize: '12px' }}>Show Test Plans</span>
            </label>
            <span className="muted" style={{ fontSize: '12px' }}>
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
              className="btn secondary"
              style={{ background: 'rgba(220, 38, 38, 0.1)', color: 'var(--d)', borderColor: 'var(--d)' }}
            >
              Delete Test Plans
            </button>
          )}
        </div>
      </div>

      {/* Plans Table */}
      <DataTable
        data={plans}
        columns={[
          {
            key: 'plan',
            label: 'Plan',
            render: (plan) => (
              <>
                <b>{plan.displayName}</b>
                <div className="muted" style={{ fontSize: '11px', marginTop: '4px' }}>
                  {plan.name}
                </div>
              </>
            ),
          },
          {
            key: 'price',
            label: 'Price',
            render: (plan) => (
              <b>${plan.price.toFixed(2)}/{plan.interval}</b>
            ),
          },
          {
            key: 'status',
            label: 'Status',
            render: (plan) => (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {plan.isActive ? (
                  <span className="chip">
                    <span className="dot good" />
                    Active
                  </span>
                ) : (
                  <span className="chip">
                    <span className="dot" />
                    Inactive
                  </span>
                )}
                {plan.isPublic && (
                  <span className="chip">
                    <span className="dot" />
                    Public
                  </span>
                )}
              </div>
            ),
          },
          {
            key: 'subscriptions',
            label: 'Subscriptions',
            render: (plan) => plan._count?.subscriptions ?? 0,
          },
          {
            key: 'limits',
            label: 'Key Limits',
            render: (plan) => (
              <div className="muted" style={{ fontSize: '11px', lineHeight: '1.6' }}>
                <div>Sessions: {formatLimit(plan.maxSessions ?? null)}</div>
                <div>Devices: {formatLimit(plan.maxDevices ?? null)}</div>
                <div>Team: {formatLimit(plan.maxTeamMembers ?? plan.maxSeats ?? null)}</div>
                <div>API Requests: {formatLimit(plan.maxApiRequests ?? null)}</div>
              </div>
            ),
          },
          {
            key: 'actions',
            label: 'Actions',
            render: (plan) => (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  className="btn secondary"
                  style={{ padding: '7px 10px', fontSize: '11px' }}
                  onClick={(e) => {
                    e.stopPropagation()
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
                >
                  Edit
                </button>
                {(plan._count?.subscriptions ?? 0) === 0 && (
                  <button
                    className="btn secondary"
                    style={{ padding: '7px 10px', fontSize: '11px', color: 'var(--d)', borderColor: 'var(--d)' }}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(plan.id)
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            ),
          },
        ]}
        loading={loading}
        emptyMessage="No plans found"
        footerNote={`Showing ${plans?.length ?? 0} of ${allPlans?.length ?? 0} plans`}
      />

      {/* Create/Edit Modal */}
      {(showCreateModal || editingPlan) && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '100%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', margin: '18px' }}>
            <b style={{ fontSize: '18px', marginBottom: '14px', display: 'block' }}>
              {editingPlan ? 'Edit Plan' : 'Create Plan'}
            </b>

            <div className="grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label className="muted" style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}>Name (ID)</label>
                <input
                  type="text"
                  className="input"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="free"
                  disabled={!!editingPlan}
                />
              </div>
              <div>
                <label className="muted" style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}>Display Name</label>
                <input
                  type="text"
                  className="input"
                  value={formData.displayName || ''}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="Free Plan"
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="muted" style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}>Description</label>
                <textarea
                  className="input"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                />
              </div>
              <div>
                <label className="muted" style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}>Price</label>
                <input
                  type="number"
                  step="0.01"
                  className="input"
                  value={formData.price ?? ''}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="muted" style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}>Currency</label>
                <input
                  type="text"
                  className="input"
                  value={formData.currency || 'USD'}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                />
              </div>
              <div>
                <label className="muted" style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}>Interval</label>
                <select
                  className="select"
                  value={formData.interval || 'month'}
                  onChange={(e) => setFormData({ ...formData, interval: e.target.value })}
                >
                  <option value="month">Month</option>
                  <option value="year">Year</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive ?? true}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    style={{ borderRadius: '4px' }}
                  />
                  <span className="muted" style={{ fontSize: '12px' }}>Active</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.isPublic ?? true}
                    onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                    style={{ borderRadius: '4px' }}
                  />
                  <span className="muted" style={{ fontSize: '12px' }}>Public</span>
                </label>
              </div>
            </div>

            <b style={{ fontSize: '14px', marginTop: '18px', marginBottom: '10px', display: 'block' }}>Quota Limits</b>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '14px' }}>
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
                  <label className="muted" style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}>{label}</label>
                  <input
                    type="number"
                    className="input"
                    value={(formData[key as keyof Plan] as number | null | undefined) ?? ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? null : parseInt(e.target.value)
                      setFormData({ ...formData, [key]: value })
                    }}
                    placeholder="Unlimited"
                  />
                </div>
              ))}
            </div>

            <b style={{ fontSize: '14px', marginTop: '18px', marginBottom: '10px', display: 'block' }}>Feature Flags</b>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', marginBottom: '18px' }}>
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
                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={(formData[key as keyof Plan] as boolean | undefined) ?? false}
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })}
                    style={{ borderRadius: '4px' }}
                  />
                  <span className="muted" style={{ fontSize: '12px' }}>{label}</span>
                </label>
              ))}
            </div>

            {/* Enforcement Settings - Simplified for now */}
            <b style={{ fontSize: '14px', marginTop: '18px', marginBottom: '10px', display: 'block' }}>Enforcement Settings</b>
            <div className="card" style={{ marginBottom: '18px' }}>
              <div className="grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                <div>
                  <label className="muted" style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}>Warn Threshold (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="input"
                    value={(formData.enforcementConfig as EnforcementConfig)?.warnThreshold ?? 80}
                    onChange={(e) => {
                      const enforcementConfig: EnforcementConfig = {
                        ...((formData.enforcementConfig as EnforcementConfig) || {}),
                        warnThreshold: parseInt(e.target.value) || 80,
                      }
                      setFormData({ ...formData, enforcementConfig })
                    }}
                    placeholder="80"
                  />
                </div>
                <div>
                  <label className="muted" style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}>Hard Threshold (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="input"
                    value={(formData.enforcementConfig as EnforcementConfig)?.hardThreshold ?? 100}
                    onChange={(e) => {
                      const enforcementConfig: EnforcementConfig = {
                        ...((formData.enforcementConfig as EnforcementConfig) || {}),
                        hardThreshold: parseInt(e.target.value) || 100,
                      }
                      setFormData({ ...formData, enforcementConfig })
                    }}
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="muted" style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}>Grace Period (hours)</label>
                  <input
                    type="number"
                    min="0"
                    className="input"
                    value={(formData.enforcementConfig as EnforcementConfig)?.gracePeriodHours ?? 48}
                    onChange={(e) => {
                      const enforcementConfig: EnforcementConfig = {
                        ...((formData.enforcementConfig as EnforcementConfig) || {}),
                        gracePeriodHours: parseInt(e.target.value) || 48,
                      }
                      setFormData({ ...formData, enforcementConfig })
                    }}
                    placeholder="48"
                  />
                </div>
                <div>
                  <label className="muted" style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}>Overage Buffer (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    className="input"
                    value={(formData.enforcementConfig as EnforcementConfig)?.overageBufferPercent ?? 0}
                    onChange={(e) => {
                      const enforcementConfig: EnforcementConfig = {
                        ...((formData.enforcementConfig as EnforcementConfig) || {}),
                        overageBufferPercent: parseInt(e.target.value) || 0,
                      }
                      setFormData({ ...formData, enforcementConfig })
                    }}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="footerNote" style={{ marginTop: '10px' }}>
                Note: Module degradation rules (API Traces, Logs, Sessions, Business Config, Localization) are configured with defaults. Advanced settings available in full edit mode.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '14px', marginTop: '18px' }}>
              <button
                className="btn secondary"
                onClick={() => {
                  setShowCreateModal(false)
                  setEditingPlan(null)
                  setFormData({})
                }}
              >
                Cancel
              </button>
              <button
                className="btn"
                onClick={() => editingPlan ? handleUpdate(editingPlan.id) : handleCreate()}
              >
                {editingPlan ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}
