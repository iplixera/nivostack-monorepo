'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { api } from '@/lib/api'
import Link from 'next/link'

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
      loadSubscription() // Reload to show new plan
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
        // Load quota overrides if they exist, otherwise use plan defaults
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
      loadSubscription() // Reload to show updated data
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400">Loading subscription...</div>
      </div>
    )
  }

  if (!subscription) {
    return (
      <div className="bg-red-900/20 border border-red-600 rounded-lg p-4">
        <p className="text-red-400">Subscription not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/subscriptions"
            className="text-gray-400 hover:text-white mb-4 flex items-center gap-2"
          >
            ← Back to Subscriptions
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Subscription Management</h1>
          <p className="text-gray-400">Manage quotas and limits for {subscription.user.email}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setSelectedPlanId(subscription.plan.id)
              setShowPlanChangeModal(true)
            }}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Change Plan
          </button>
        </div>
      </div>

      {/* Subscription Info */}
      <div className="bg-gray-900 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Subscription Details</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="text-sm text-gray-400 mb-1">User</div>
            <div className="text-white">{subscription.user.email}</div>
            {subscription.user.name && (
              <div className="text-sm text-gray-400">{subscription.user.name}</div>
            )}
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-1">Plan</div>
            <div className="text-white">{subscription.plan.displayName}</div>
            <div className="text-sm text-gray-400">
              ${subscription.plan.price === 0 ? 'Free' : subscription.plan.price.toFixed(2)}/month
            </div>
            {subscription.promoCode && (
              <div className="text-xs text-green-400 mt-1">
                Promo: {subscription.promoCode.code} ({subscription.promoCode.discountType === 'percent' ? `${subscription.promoCode.discountValue}%` : `$${subscription.promoCode.discountValue}`})
              </div>
            )}
            {subscription.discountedPrice && subscription.discountedPrice !== subscription.plan.price && (
              <div className="text-xs text-blue-400 mt-1">
                Final Price: ${subscription.discountedPrice.toFixed(2)}/month
              </div>
            )}
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-1">Status</div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              !subscription.enabled
                ? 'bg-red-900/30 text-red-400'
                : subscription.status === 'active'
                ? 'bg-green-900/30 text-green-400'
                : 'bg-yellow-900/30 text-yellow-400'
            }`}>
              {!subscription.enabled ? 'Disabled' : subscription.status}
            </span>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-1">Trial Ends</div>
            <div className="text-white">
              {new Date(subscription.trialEndDate).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Quota Management */}
      <div className="bg-gray-900 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Quota Limits</h2>
        <p className="text-sm text-gray-400 mb-6">
          Set custom limits for this subscription. Leave empty or set to ∞ for unlimited (uses plan default). 
          Setting a value overrides the plan limit for this user.
        </p>
        <div className="mb-4 p-3 bg-blue-900/20 border border-blue-600 rounded text-sm text-blue-300">
          <strong>Plan Defaults:</strong> Projects: {subscription.plan.maxProjects === null ? '∞' : subscription.plan.maxProjects} | 
          Devices: {subscription.plan.maxDevices === null ? '∞' : subscription.plan.maxDevices} | 
          Mock Endpoints: {(subscription.plan as any).maxMockEndpoints === null ? '∞' : (subscription.plan as any).maxMockEndpoints} | 
          API Endpoints: {(subscription.plan as any).maxApiEndpoints === null ? '∞' : (subscription.plan as any).maxApiEndpoints.toLocaleString()} | 
          API Requests: {(subscription.plan as any).maxApiRequests === null ? '∞' : (subscription.plan as any).maxApiRequests.toLocaleString()} | 
          Logs: {subscription.plan.maxLogs === null ? '∞' : subscription.plan.maxLogs.toLocaleString()} | 
          Sessions: {subscription.plan.maxSessions === null ? '∞' : subscription.plan.maxSessions.toLocaleString()} | 
          Crashes: {subscription.plan.maxCrashes === null ? '∞' : subscription.plan.maxCrashes} | 
          Business Config Keys: {(subscription.plan as any).maxBusinessConfigKeys === null ? '∞' : (subscription.plan as any).maxBusinessConfigKeys} | 
          Localization Languages: {(subscription.plan as any).maxLocalizationLanguages === null ? '∞' : (subscription.plan as any).maxLocalizationLanguages} | 
          Localization Keys: {(subscription.plan as any).maxLocalizationKeys === null ? '∞' : (subscription.plan as any).maxLocalizationKeys.toLocaleString()}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <QuotaInput
            label="Projects"
            value={quotas.maxProjects}
            onChange={(v) => handleQuotaChange('maxProjects', v)}
          />
          <QuotaInput
            label="Device Registrations"
            value={quotas.maxDevices}
            onChange={(v) => handleQuotaChange('maxDevices', v)}
          />
          <QuotaInput
            label="Mock Endpoints"
            value={(quotas as any).maxMockEndpoints}
            onChange={(v) => handleQuotaChange('maxMockEndpoints', v)}
          />
          <QuotaInput
            label="API Endpoints (per month)"
            value={(quotas as any).maxApiEndpoints}
            onChange={(v) => handleQuotaChange('maxApiEndpoints', v)}
          />
          <QuotaInput
            label="API Requests (per month)"
            value={(quotas as any).maxApiRequests}
            onChange={(v) => handleQuotaChange('maxApiRequests', v)}
          />
          <QuotaInput
            label="Logs (per month)"
            value={quotas.maxLogs}
            onChange={(v) => handleQuotaChange('maxLogs', v)}
          />
          <QuotaInput
            label="Sessions (per month)"
            value={quotas.maxSessions}
            onChange={(v) => handleQuotaChange('maxSessions', v)}
          />
          <QuotaInput
            label="Crashes (per month)"
            value={quotas.maxCrashes}
            onChange={(v) => handleQuotaChange('maxCrashes', v)}
          />
          <QuotaInput
            label="Business Config Keys"
            value={(quotas as any).maxBusinessConfigKeys}
            onChange={(v) => handleQuotaChange('maxBusinessConfigKeys', v)}
          />
          <QuotaInput
            label="Localization Languages"
            value={(quotas as any).maxLocalizationLanguages}
            onChange={(v) => handleQuotaChange('maxLocalizationLanguages', v)}
          />
          <QuotaInput
            label="Localization Keys"
            value={(quotas as any).maxLocalizationKeys}
            onChange={(v) => handleQuotaChange('maxLocalizationKeys', v)}
          />
        </div>

        <div className="mt-6 pt-6 border-t border-gray-800 flex gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Quotas'}
          </button>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-medium"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Change Plan Modal */}
      {showPlanChangeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-white mb-4">Change Subscription Plan</h2>
            <p className="text-gray-400 mb-4">
              Current plan: <strong className="text-white">{subscription.plan.displayName}</strong>
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Select New Plan</label>
              <select
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              >
                <option value="">Select a plan...</option>
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.displayName} - ${plan.price.toFixed(2)}/{plan.interval}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowPlanChangeModal(false)
                  setSelectedPlanId('')
                }}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePlan}
                disabled={!selectedPlanId || changingPlan}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {changingPlan ? 'Changing...' : 'Change Plan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function QuotaInput({ label, value, onChange }: { label: string; value: number | null; onChange: (value: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value === null ? '' : value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Unlimited"
          min="0"
          className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white"
        />
        <button
          onClick={() => onChange('null')}
          className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
          title="Set to unlimited"
        >
          ∞
        </button>
      </div>
    </div>
  )
}

