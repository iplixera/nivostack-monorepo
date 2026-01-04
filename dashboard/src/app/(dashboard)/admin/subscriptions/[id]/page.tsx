'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { api } from '@/lib/api'
import Link from 'next/link'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/layout/PageHeader'
import ThemeToggle from '@/components/ThemeToggle'

type Subscription = {
  id: string
  userId: string
  status: string
  enabled: boolean
  trialStartDate: string
  trialEndDate: string
  promoCode?: {
    id: string
    code: string
    discountType: string
    discountValue: number
  } | null
  discountPercent?: number | null
  discountAmount?: number | null
  discountedPrice?: number | null
  quotaMaxProjects?: number | null
  quotaMaxDevices?: number | null
  quotaMaxMockEndpoints?: number | null
  quotaMaxApiEndpoints?: number | null
  quotaMaxApiRequests?: number | null
  quotaMaxLogs?: number | null
  quotaMaxSessions?: number | null
  quotaMaxCrashes?: number | null
  quotaMaxBusinessConfigKeys?: number | null
  quotaMaxLocalizationLanguages?: number | null
  quotaMaxLocalizationKeys?: number | null
  user: {
    id: string
    email: string
    name: string | null
  }
  plan: {
    id: string
    name: string
    displayName: string
    price: number
    maxProjects: number | null
    maxDevices: number | null
    maxMockEndpoints: number | null
    maxApiEndpoints: number | null
    maxApiRequests: number | null
    maxLogs: number | null
    maxSessions: number | null
    maxCrashes: number | null
    retentionDays: number | null
  }
}

export default function AdminSubscriptionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { token } = useAuth()
  const subscriptionId = params.id as string
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [changingPlan, setChangingPlan] = useState(false)
  const [plans, setPlans] = useState<any[]>([])
  const [selectedPlanId, setSelectedPlanId] = useState<string>('')
  const [showPlanChangeModal, setShowPlanChangeModal] = useState(false)
  const [quotas, setQuotas] = useState({
    maxProjects: null as number | null,
    maxDevices: null as number | null,
    maxMockEndpoints: null as number | null,
    maxApiEndpoints: null as number | null,
    maxApiRequests: null as number | null,
    maxBusinessConfigKeys: null as number | null,
    maxLocalizationLanguages: null as number | null,
    maxLocalizationKeys: null as number | null,
    maxLogs: null as number | null,
    maxSessions: null as number | null,
    maxCrashes: null as number | null,
  })

  useEffect(() => {
    if (!token || !subscriptionId) return
    loadSubscription()
    loadPlans()
  }, [token, subscriptionId])

  const loadPlans = async () => {
    if (!token) return
    try {
      const data = await api.admin.getPlans(token)
      setPlans(data.plans)
    } catch (error) {
      console.error('Failed to load plans:', error)
    }
  }

  const handleChangePlan = async () => {
    if (!token || !selectedPlanId) return
    try {
      setChangingPlan(true)
      await api.admin.changeSubscriptionPlan(subscriptionId, selectedPlanId, token)
      alert('Plan changed successfully!')
      setShowPlanChangeModal(false)
      setSelectedPlanId('')
      loadSubscription()
    } catch (error) {
      alert('Failed to change plan: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setChangingPlan(false)
    }
  }

  const loadSubscription = async () => {
    if (!token) return
    try {
      setLoading(true)
      const response = await api.admin.getSubscription(subscriptionId, token)
      if (response.subscription) {
        const sub = response.subscription
        setSubscription(sub)
        setQuotas({
          maxProjects: (sub as any).quotaMaxProjects !== undefined ? (sub as any).quotaMaxProjects : sub.plan.maxProjects,
          maxDevices: sub.quotaMaxDevices !== undefined ? sub.quotaMaxDevices : sub.plan.maxDevices,
          maxMockEndpoints: (sub as any).quotaMaxMockEndpoints !== undefined ? (sub as any).quotaMaxMockEndpoints : (sub.plan as any).maxMockEndpoints,
          maxApiEndpoints: (sub as any).quotaMaxApiEndpoints !== undefined ? (sub as any).quotaMaxApiEndpoints : (sub.plan as any).maxApiEndpoints,
          maxApiRequests: (sub as any).quotaMaxApiRequests !== undefined ? (sub as any).quotaMaxApiRequests : (sub.plan as any).maxApiRequests,
          maxLogs: sub.quotaMaxLogs !== undefined ? sub.quotaMaxLogs : sub.plan.maxLogs,
          maxSessions: sub.quotaMaxSessions !== undefined ? sub.quotaMaxSessions : sub.plan.maxSessions,
          maxCrashes: sub.quotaMaxCrashes !== undefined ? sub.quotaMaxCrashes : sub.plan.maxCrashes,
          maxBusinessConfigKeys: (sub as any).quotaMaxBusinessConfigKeys !== undefined ? (sub as any).quotaMaxBusinessConfigKeys : (sub.plan as any).maxBusinessConfigKeys,
          maxLocalizationLanguages: (sub as any).quotaMaxLocalizationLanguages !== undefined ? (sub as any).quotaMaxLocalizationLanguages : (sub.plan as any).maxLocalizationLanguages,
          maxLocalizationKeys: (sub as any).quotaMaxLocalizationKeys !== undefined ? (sub as any).quotaMaxLocalizationKeys : (sub.plan as any).maxLocalizationKeys,
        })
      }
    } catch (error) {
      console.error('Failed to load subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!token || !subscription) return
    try {
      setSaving(true)
      await api.admin.updateSubscriptionQuotas(subscriptionId, quotas, token)
      alert('Quotas updated successfully!')
      loadSubscription()
    } catch (error) {
      alert('Failed to update quotas: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setSaving(false)
    }
  }

  const handleQuotaChange = (key: string, value: string) => {
    setQuotas({
      ...quotas,
      [key]: value === '' || value === 'null' ? null : parseInt(value, 10),
    })
  }

  const formatLimit = (value: number | null) => {
    if (value === null) return 'Unlimited'
    return value.toLocaleString()
  }

  if (loading) {
    return (
      <AppShell>
        <PageHeader
          title="Subscription Management"
          subtitle="Manage quotas and limits"
          dataMode="Admin"
          actions={<ThemeToggle />}
        />
        <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--m)' }}>
          Loading subscription...
        </div>
      </AppShell>
    )
  }

  if (!subscription) {
    return (
      <AppShell>
        <PageHeader
          title="Subscription Management"
          subtitle="Manage quotas and limits"
          dataMode="Admin"
          actions={<ThemeToggle />}
        />
        <div className="card" style={{ marginTop: '18px', borderColor: 'var(--d)', background: 'rgba(220, 38, 38, 0.1)' }}>
          <div style={{ color: 'var(--d)' }}>Subscription not found</div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <PageHeader
        title="Subscription Management"
        subtitle={`Manage quotas and limits for ${subscription.user.email}`}
        dataMode="Admin"
        actions={
          <>
            <ThemeToggle />
            <Link href="/admin/subscriptions" className="btn secondary">
              Back to Subscriptions
            </Link>
            <button
              onClick={() => {
                setSelectedPlanId(subscription.plan.id)
                setShowPlanChangeModal(true)
              }}
              className="btn secondary"
            >
              Change Plan
            </button>
          </>
        }
      />

      {/* Subscription Info */}
      <div className="card" style={{ marginTop: '18px' }}>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '18px' }}>
          <div>
            <div className="muted" style={{ fontSize: '12px', marginBottom: '4px' }}>User</div>
            <b>{subscription.user.email}</b>
            {subscription.user.name && (
              <div className="muted" style={{ fontSize: '11px', marginTop: '4px' }}>
                {subscription.user.name}
              </div>
            )}
          </div>
          <div>
            <div className="muted" style={{ fontSize: '12px', marginBottom: '4px' }}>Plan</div>
            <b>{subscription.plan.displayName}</b>
            <div className="muted" style={{ fontSize: '11px', marginTop: '4px' }}>
              ${subscription.plan.price.toFixed(2)}/month
            </div>
          </div>
          <div>
            <div className="muted" style={{ fontSize: '12px', marginBottom: '4px' }}>Status</div>
            <span className="chip">
              <span className={`dot ${subscription.enabled && subscription.status === 'active' ? 'good' : subscription.enabled ? 'warn' : 'bad'}`} />
              {subscription.enabled ? subscription.status : 'Disabled'}
            </span>
          </div>
          <div>
            <div className="muted" style={{ fontSize: '12px', marginBottom: '4px' }}>Trial Ends</div>
            <span className="muted">{new Date(subscription.trialEndDate).toLocaleDateString()}</span>
          </div>
        </div>

        {subscription.promoCode && (
          <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--b)' }}>
            <div className="muted" style={{ fontSize: '12px', marginBottom: '4px' }}>Promo Code</div>
            <b>{subscription.promoCode.code}</b>
            <div className="muted" style={{ fontSize: '11px', marginTop: '4px' }}>
              {subscription.promoCode.discountType === 'percent' ? `${subscription.promoCode.discountValue}%` : `$${subscription.promoCode.discountValue}`} discount
            </div>
          </div>
        )}
      </div>

      {/* Quota Management */}
      <div className="card" style={{ marginTop: '14px' }}>
        <b style={{ fontSize: '16px', marginBottom: '14px', display: 'block' }}>Quota Overrides</b>
        <div className="note" style={{ marginBottom: '14px' }}>
          <b>Note</b>
          <div className="muted" style={{ marginTop: '6px', fontSize: '11px' }}>
            Override plan defaults. Leave empty to use plan defaults. Set to 0 or empty for unlimited.
          </div>
        </div>

        <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
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
          ].map(({ key, label }) => {
            const planValue = (subscription.plan as any)[key]
            const overrideValue = quotas[key as keyof typeof quotas]

            return (
              <div key={key}>
                <label className="muted" style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}>
                  {label}
                  <span className="muted" style={{ fontSize: '10px', marginLeft: '4px' }}>
                    (Plan: {formatLimit(planValue)})
                  </span>
                </label>
                <input
                  type="number"
                  className="input"
                  value={overrideValue ?? ''}
                  onChange={(e) => handleQuotaChange(key, e.target.value)}
                  placeholder={formatLimit(planValue)}
                />
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '14px', marginTop: '18px' }}>
          <button
            className="btn"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Quotas'}
          </button>
        </div>
      </div>

      {/* Change Plan Modal */}
      {showPlanChangeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', margin: '18px' }}>
            <b style={{ fontSize: '18px', marginBottom: '14px', display: 'block' }}>Change Plan</b>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="muted" style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}>Select New Plan</label>
                <select
                  className="select"
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                >
                  <option value="">-- Select Plan --</option>
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.displayName} - ${plan.price.toFixed(2)}/month
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '14px' }}>
                <button
                  className="btn secondary"
                  onClick={() => {
                    setShowPlanChangeModal(false)
                    setSelectedPlanId('')
                  }}
                  disabled={changingPlan}
                >
                  Cancel
                </button>
                <button
                  className="btn"
                  onClick={handleChangePlan}
                  disabled={changingPlan || !selectedPlanId}
                >
                  {changingPlan ? 'Changing...' : 'Change Plan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}
