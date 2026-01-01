'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { api } from '@/lib/api'

type Subscription = {
  id: string
  userId: string
  planId: string
  status: string
  enabled: boolean
  trialStartDate: string
  trialEndDate: string
  currentPeriodStart: string
  currentPeriodEnd: string
  subscriptionCount?: number
  gracePeriodEnd?: string | null
  gracePeriodReason?: string | null
  plan: {
    id: string
    name: string
    displayName: string
    description: string | null
    price: number
  }
}

type SubscriptionHistory = {
  id: string
  subscriptionId: string
  userId: string
  planId: string
  periodStart: string
  periodEnd: string
  status: string
  totalInvoiced: number
  totalPaid: number | null
  devicesRegistered: number
  apiTracesCount: number
  apiRequestsCount: number
  logsCount: number
  sessionsCount: number
  crashesCount: number
  createdAt: string
  plan?: {
    id: string
    name: string
    displayName: string
    price: number
  }
}

type UsageStats = {
  mockEndpoints?: { used: number; limit: number | null; percentage: number }
  apiEndpoints?: { used: number; limit: number | null; percentage: number }
  apiRequests?: { used: number; limit: number | null; percentage: number }
  logs: { used: number; limit: number | null; percentage: number }
  sessions: { used: number; limit: number | null; percentage: number }
  crashes: { used: number; limit: number | null; percentage: number }
  devices: { used: number; limit: number | null; percentage: number }
  projects: { used: number; limit: number | null; percentage: number }
  businessConfigKeys?: { used: number; limit: number | null; percentage: number }
  localizationLanguages?: { used: number; limit: number | null; percentage: number }
  localizationKeys?: { used: number; limit: number | null; percentage: number }
  teamMembers?: { used: number; limit: number | null; percentage: number }
  trialActive: boolean
  trialEndDate: string
  daysRemaining: number
}

type EnforcementState = {
  state: 'ACTIVE' | 'WARN' | 'GRACE' | 'DEGRADED' | 'SUSPENDED'
  effectivePolicy: any
  graceEndsAt: string | null
  triggeredMetrics: Array<{
    metric: string
    usage: number
    limit: number | null
    percentage: number
  }>
  warnEnteredAt?: string | null
  graceEnteredAt?: string | null
  degradedEnteredAt?: string | null
}

type Plan = {
  id: string
  name: string
  displayName: string
  description: string | null
  price: number
  currency: string
  interval: string
  maxProjects: number | null
  maxDevices: number | null
  maxApiTraces: number | null
  maxApiEndpoints?: number | null
  maxApiRequests?: number | null
  maxLogs: number | null
  maxSessions: number | null
  maxCrashes: number | null
  maxBusinessConfigKeys?: number | null
  maxLocalizationLanguages?: number | null
  maxLocalizationKeys?: number | null
  retentionDays: number | null
  allowCustomDomains: boolean
  allowWebhooks: boolean
  allowTeamMembers: boolean
  allowPrioritySupport: boolean
}

export default function SubscriptionPage() {
  const { user, token } = useAuth()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [usage, setUsage] = useState<UsageStats | null>(null)
  const [history, setHistory] = useState<SubscriptionHistory[]>([])
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([])
  const [enforcement, setEnforcement] = useState<EnforcementState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'usage' | 'plans' | 'history' | 'profile'>('overview')

  useEffect(() => {
    if (!token) return

    Promise.all([
      api.subscription.get(token).catch(() => null),
      api.subscription.getUsage(token).catch(() => null),
      api.subscription.getHistory(token).catch(() => null),
      api.plans.list().catch(() => ({ plans: [] })),
    ])
      .then(async ([subData, usageData, historyData, plansData]) => {
        if (subData && subData.subscription) {
          setSubscription(subData.subscription)
        } else {
          setError('No subscription found. Please contact support.')
        }
        if (usageData) setUsage(usageData.usage)
        if (historyData) setHistory(historyData.history || [])
        
        // Load available upgrade plans (excluding current plan)
        const allPlans: Plan[] = plansData.plans.map(plan => ({
          id: plan.id,
          name: plan.name,
          displayName: plan.displayName,
          description: plan.description || '',
          price: plan.price,
          currency: plan.currency,
          interval: plan.interval,
          maxProjects: plan.maxProjects,
          maxDevices: plan.maxDevices,
          maxApiTraces: plan.maxApiTraces,
          maxApiEndpoints: plan.maxApiEndpoints,
          maxApiRequests: plan.maxApiRequests,
          maxLogs: plan.maxLogs,
          maxSessions: plan.maxSessions,
          maxCrashes: plan.maxCrashes,
          maxBusinessConfigKeys: plan.maxBusinessConfigKeys,
          maxLocalizationLanguages: plan.maxLocalizationLanguages,
          maxLocalizationKeys: plan.maxLocalizationKeys,
          retentionDays: plan.retentionDays,
          allowCustomDomains: plan.allowCustomDomains,
          allowWebhooks: plan.allowWebhooks,
          allowTeamMembers: plan.allowTeamMembers,
          allowPrioritySupport: plan.allowPrioritySupport,
        }))
        // Filter out current plan and inactive plans - show all upgrade options
        const planName = subData?.subscription?.plan?.name || 'free'
        setAvailablePlans(allPlans.filter(p => p.name !== planName && p.name !== 'free'))
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message || 'Failed to load subscription data')
        setLoading(false)
      })
  }, [token])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400">Loading subscription...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-600 rounded-lg p-4">
        <p className="text-red-400">{error}</p>
      </div>
    )
  }

  if (!subscription && !loading) {
    return (
      <div className="space-y-6">
        <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4">
          <p className="text-yellow-400">No subscription found. Please contact support.</p>
        </div>
        {error && (
          <div className="bg-red-900/20 border border-red-600 rounded-lg p-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}
      </div>
    )
  }

  if (!subscription) {
    return null
  }

  const daysRemaining = usage?.daysRemaining || 0
  const isExpired = subscription.status === 'expired'
  const isExpiringSoon = daysRemaining > 0 && daysRemaining <= 7
  const currentPlanName = subscription.plan.name
  const paidPlans = availablePlans.filter(p => p.price > 0 && p.name !== currentPlanName)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Subscription & Account</h1>
        <p className="text-gray-400">Manage your subscription, view usage, and upgrade your plan</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-800">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('usage')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'usage'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Usage
          </button>
          <button
            onClick={() => setActiveTab('plans')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'plans'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Upgrade Plan
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            History ({history.length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'profile'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Organization Profile
          </button>
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Enforcement State Banner */}
          {enforcement && enforcement.state !== 'ACTIVE' && (
            <EnforcementBanner enforcement={enforcement} onUpgrade={() => setActiveTab('plans')} />
          )}

          {/* Status Banner */}
          {isExpired && (
            <div className="bg-red-900/20 border-l-4 border-red-600 p-4 rounded">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-red-400 font-semibold mb-1">Subscription Expired</h3>
                  <p className="text-gray-300 text-sm">
                    Your subscription has expired. SDK is disabled. Your data is safe and will be available once you upgrade.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('plans')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                >
                  Upgrade Now
                </button>
              </div>
            </div>
          )}

          {isExpiringSoon && !isExpired && (
            <div className="bg-yellow-900/20 border-l-4 border-yellow-600 p-4 rounded">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-yellow-400 font-semibold mb-1">Subscription Renewing Soon</h3>
                  <p className="text-gray-300 text-sm">
                    Your subscription renews in {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}. Your plan will automatically renew monthly.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('plans')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                >
                  Upgrade Now
                </button>
              </div>
            </div>
          )}

          {/* Current Plan */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Current Plan</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-gray-400 mb-1">Plan</div>
                <div className="text-2xl font-bold text-white">{subscription.plan.displayName}</div>
                {subscription.plan.price === 0 && (
                  <div className="text-sm text-gray-400 mt-1">Free Forever - Monthly Renewal</div>
                )}
                {subscription.plan.price > 0 && (
                  <div className="text-sm text-gray-400 mt-1">
                    ${subscription.plan.price.toFixed(2)}/month
                  </div>
                )}
                {subscription.subscriptionCount && subscription.subscriptionCount > 1 && (
                  <div className="text-sm text-blue-400 mt-2">
                    🎉 {subscription.subscriptionCount} billing periods subscribed
                  </div>
                )}
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Status</div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    subscription.status === 'active' 
                      ? 'bg-green-900/30 text-green-400' 
                      : 'bg-red-900/30 text-red-400'
                  }`}>
                    {subscription.status === 'active' ? 'Active' : subscription.status}
                  </span>
                  {subscription.gracePeriodEnd && new Date(subscription.gracePeriodEnd) > new Date() && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-900/30 text-yellow-400">
                      Grace Period
                    </span>
                  )}
                </div>
                {subscription.gracePeriodReason && (
                  <div className="text-xs text-yellow-400 mt-2">
                    {subscription.gracePeriodReason}
                  </div>
                )}
              </div>
              {subscription.plan.price === 0 && (
                <>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Period Started</div>
                    <div className="text-white">
                      {new Date(subscription.currentPeriodStart).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Renews On</div>
                    <div className="text-white">
                      {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                    </div>
                  </div>
                </>
              )}
              {subscription.plan.price > 0 && (
                <>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Current Period Start</div>
                    <div className="text-white">
                      {new Date(subscription.currentPeriodStart).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Current Period End</div>
                    <div className="text-white">
                      {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <Link
                      href="/payment-methods"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      Manage Payment Methods
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Quick Usage Summary */}
          {usage && (
            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Usage Summary</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {usage.mockEndpoints && (
                  <UsageCard label="Mock Endpoints" used={usage.mockEndpoints.used} limit={usage.mockEndpoints.limit} />
                )}
                {usage.apiEndpoints && (
                  <UsageCard label="API Endpoints" used={usage.apiEndpoints.used} limit={usage.apiEndpoints.limit} />
                )}
                {usage.apiRequests && (
                  <UsageCard label="API Requests" used={usage.apiRequests.used} limit={usage.apiRequests.limit} />
                )}
                <UsageCard label="Logs" used={usage.logs.used} limit={usage.logs.limit} />
                <UsageCard label="Sessions" used={usage.sessions.used} limit={usage.sessions.limit} />
                <UsageCard label="Crashes" used={usage.crashes.used} limit={usage.crashes.limit} />
                <UsageCard label="Devices" used={usage.devices.used} limit={usage.devices.limit} />
                <UsageCard label="Projects" used={usage.projects.used} limit={usage.projects.limit} />
                {usage.businessConfigKeys && (
                  <UsageCard label="Business Config Keys" used={usage.businessConfigKeys.used} limit={usage.businessConfigKeys.limit} />
                )}
                {usage.localizationLanguages && (
                  <UsageCard label="Localization Languages" used={usage.localizationLanguages.used} limit={usage.localizationLanguages.limit} />
                )}
                {usage.localizationKeys && (
                  <UsageCard label="Localization Keys" used={usage.localizationKeys.used} limit={usage.localizationKeys.limit} />
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Usage Tab */}
      {activeTab === 'usage' && usage && (
        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Detailed Usage Statistics</h2>
          <div className="space-y-4">
            {subscription.plan.price === 0 && (
              <div className="mb-4 p-4 bg-blue-900/20 border border-blue-600 rounded">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-blue-400 font-medium">Current Period</span>
                  <span className="text-white font-semibold">{usage.daysRemaining} days until renewal</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.max(0, Math.min(100, ((30 - usage.daysRemaining) / 30) * 100))}%` }}
                  />
                </div>
              </div>
            )}
            
            {usage.mockEndpoints && (
              <UsageBar
                label="Mock Endpoints"
                used={usage.mockEndpoints.used}
                limit={usage.mockEndpoints.limit}
                percentage={usage.mockEndpoints.percentage}
              />
            )}
            {usage.apiEndpoints && (
              <UsageBar
                label="API Endpoints"
                used={usage.apiEndpoints.used}
                limit={usage.apiEndpoints.limit}
                percentage={usage.apiEndpoints.percentage}
              />
            )}
            {usage.apiRequests && (
              <UsageBar
                label="API Requests"
                used={usage.apiRequests.used}
                limit={usage.apiRequests.limit}
                percentage={usage.apiRequests.percentage}
              />
            )}
            <UsageBar
              label="Logs"
              used={usage.logs.used}
              limit={usage.logs.limit}
              percentage={usage.logs.percentage}
            />
            <UsageBar
              label="Sessions"
              used={usage.sessions.used}
              limit={usage.sessions.limit}
              percentage={usage.sessions.percentage}
            />
            <UsageBar
              label="Crashes"
              used={usage.crashes.used}
              limit={usage.crashes.limit}
              percentage={usage.crashes.percentage}
            />
            <UsageBar
              label="Devices"
              used={usage.devices.used}
              limit={usage.devices.limit}
              percentage={usage.devices.percentage}
            />
            <UsageBar
              label="Projects"
              used={usage.projects.used}
              limit={usage.projects.limit}
              percentage={usage.projects.percentage}
            />
            {usage.businessConfigKeys && (
              <UsageBar
                label="Business Config Keys"
                used={usage.businessConfigKeys.used}
                limit={usage.businessConfigKeys.limit}
                percentage={usage.businessConfigKeys.percentage}
              />
            )}
            {usage.localizationLanguages && (
              <UsageBar
                label="Localization Languages"
                used={usage.localizationLanguages.used}
                limit={usage.localizationLanguages.limit}
                percentage={usage.localizationLanguages.percentage}
              />
            )}
            {usage.localizationKeys && (
              <UsageBar
                label="Localization Keys"
                used={usage.localizationKeys.used}
                limit={usage.localizationKeys.limit}
                percentage={usage.localizationKeys.percentage}
              />
            )}
          </div>
        </div>
      )}

      {/* Plans Tab */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-white mb-2">Upgrade Your Plan</h2>
            <p className="text-gray-400">Choose a plan that fits your needs. Payment integration coming soon.</p>
          </div>

          {paidPlans.length === 0 ? (
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <p className="text-gray-400 text-center">No upgrade plans available at this time. Please check back later.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {paidPlans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  currentPlanName={currentPlanName}
                  token={token}
                  onUpgradeSuccess={() => {
                    // Reload subscription data
                    Promise.all([
                      api.subscription.get(token!).catch(() => null),
                      api.subscription.getUsage(token!).catch(() => null),
                    ]).then(([subData, usageData]) => {
                      if (subData && subData.subscription) {
                        setSubscription(subData.subscription)
                      }
                      if (usageData) setUsage(usageData.usage)
                      setActiveTab('overview')
                    })
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-white mb-2">Subscription History</h2>
            <p className="text-gray-400">View your billing period history and usage statistics</p>
          </div>

          {history.length === 0 ? (
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <p className="text-gray-400 text-center">No subscription history yet. History will appear here after your first billing period.</p>
            </div>
          ) : (
            <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Period</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Plan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Usage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {history.map((period) => (
                    <tr key={period.id} className="hover:bg-gray-800/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">
                          {new Date(period.periodStart).toLocaleDateString()} - {new Date(period.periodEnd).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">{period.plan?.displayName || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          period.status === 'completed'
                            ? 'bg-green-900/30 text-green-400'
                            : period.status === 'cancelled'
                            ? 'bg-red-900/30 text-red-400'
                            : 'bg-gray-900/30 text-gray-400'
                        }`}>
                          {period.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">
                          ${period.totalInvoiced.toFixed(2)}
                          {period.totalPaid !== null && period.totalPaid !== period.totalInvoiced && (
                            <span className="text-xs text-gray-400 ml-1">(Paid: ${period.totalPaid.toFixed(2)})</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-gray-400 space-y-1">
                          <div>Devices: {period.devicesRegistered}</div>
                          <div>Traces: {period.apiTracesCount.toLocaleString()}</div>
                          <div>Sessions: {period.sessionsCount.toLocaleString()}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs text-gray-400">
                          {new Date(period.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Organization Profile</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Organization Name</label>
              <input
                type="text"
                defaultValue={user?.name || ''}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                placeholder="Enter organization name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                type="email"
                defaultValue={user?.email || ''}
                disabled
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Account Type</label>
              <div className="px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white">
                {user?.isAdmin ? 'Admin Account' : 'Standard Account'}
              </div>
            </div>
            <div className="pt-4 border-t border-gray-800">
              <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function UsageCard({ label, used, limit }: { label: string; used: number; limit: number | null }) {
  const displayLimit = limit === null ? '∞' : limit.toLocaleString()
  const displayUsed = used.toLocaleString()
  const percentage = limit === null ? 0 : (used / limit) * 100

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="text-sm text-gray-400 mb-1">{label}</div>
      <div className="text-2xl font-bold text-white mb-1">{displayUsed}</div>
      <div className="text-xs text-gray-500">of {displayLimit}</div>
      {limit !== null && percentage > 75 && (
        <div className="mt-2 w-full bg-gray-700 rounded-full h-1">
          <div
            className={`h-1 rounded-full ${percentage > 90 ? 'bg-red-600' : 'bg-yellow-600'}`}
            style={{ width: `${Math.min(100, percentage)}%` }}
          />
        </div>
      )}
    </div>
  )
}

function UsageBar({ label, used, limit, percentage }: { label: string; used: number; limit: number | null; percentage: number }) {
  const displayLimit = limit === null ? 'Unlimited' : limit.toLocaleString()
  const displayUsed = used.toLocaleString()
  const barColor = percentage > 90 ? 'bg-red-600' : percentage > 75 ? 'bg-yellow-600' : 'bg-blue-600'

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-gray-300 text-sm">{label}</span>
        <span className="text-gray-400 text-sm">
          {displayUsed} / {displayLimit}
        </span>
      </div>
      {limit !== null && (
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`${barColor} h-2 rounded-full transition-all`}
            style={{ width: `${Math.min(100, percentage)}%` }}
          />
        </div>
      )}
      {limit === null && (
        <div className="text-xs text-gray-500">Unlimited</div>
      )}
    </div>
  )
}

function EnforcementBanner({ enforcement, onUpgrade }: { enforcement: EnforcementState; onUpgrade: () => void }) {
  const getBannerConfig = () => {
    switch (enforcement.state) {
      case 'WARN':
        return {
          bg: 'bg-yellow-900/20',
          border: 'border-yellow-600',
          title: 'Approaching Quota Limits',
          icon: '⚠️',
          color: 'text-yellow-400',
        }
      case 'GRACE':
        return {
          bg: 'bg-orange-900/20',
          border: 'border-orange-600',
          title: 'Quota Exceeded - Grace Period Active',
          icon: '⏰',
          color: 'text-orange-400',
        }
      case 'DEGRADED':
        return {
          bg: 'bg-red-900/20',
          border: 'border-red-600',
          title: 'Service Degraded - Upgrade Required',
          icon: '🔻',
          color: 'text-red-400',
        }
      case 'SUSPENDED':
        return {
          bg: 'bg-gray-900/20',
          border: 'border-gray-600',
          title: 'Service Suspended',
          icon: '🚫',
          color: 'text-gray-400',
        }
      default:
        return null
    }
  }

  const config = getBannerConfig()
  if (!config) return null

  const graceEndsAt = enforcement.graceEndsAt ? new Date(enforcement.graceEndsAt) : null
  const timeRemaining = graceEndsAt ? Math.max(0, Math.ceil((graceEndsAt.getTime() - Date.now()) / (1000 * 60 * 60))) : null

  return (
    <div className={`${config.bg} border-l-4 ${config.border} p-4 rounded`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className={`${config.color} font-semibold mb-2 flex items-center gap-2`}>
            <span>{config.icon}</span>
            {config.title}
          </h3>
          
          {enforcement.state === 'WARN' && enforcement.triggeredMetrics.length > 0 && (
            <div className="text-gray-300 text-sm mb-2">
              <p>The following metrics are approaching limits:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                {enforcement.triggeredMetrics.map((metric, idx) => (
                  <li key={idx}>
                    {metric.metric}: {metric.percentage.toFixed(1)}% ({metric.usage.toLocaleString()} / {metric.limit?.toLocaleString()})
                  </li>
                ))}
              </ul>
            </div>
          )}

          {enforcement.state === 'GRACE' && timeRemaining !== null && (
            <p className="text-gray-300 text-sm mb-2">
              Grace period ends in {timeRemaining} {timeRemaining === 1 ? 'hour' : 'hours'}. 
              Upgrade now to avoid service degradation.
            </p>
          )}

          {enforcement.state === 'DEGRADED' && enforcement.effectivePolicy && (
            <div className="text-gray-300 text-sm mb-2">
              <p className="mb-2">Service degradation is active:</p>
              <ul className="list-disc list-inside space-y-1">
                {enforcement.effectivePolicy.sampling?.apiTraces?.enabled && (
                  <li>API Traces: Sampling 1 in {enforcement.effectivePolicy.sampling.apiTraces.rate} requests</li>
                )}
                {enforcement.effectivePolicy.sampling?.sessions?.enabled && (
                  <li>Sessions: Sampling 1 in {enforcement.effectivePolicy.sampling.sessions.rate} sessions</li>
                )}
                {enforcement.effectivePolicy.freezes?.businessConfig && (
                  <li>Business Config: Publishing frozen</li>
                )}
                {enforcement.effectivePolicy.freezes?.localization && (
                  <li>Localization: Publishing frozen</li>
                )}
              </ul>
            </div>
          )}

          {enforcement.state === 'SUSPENDED' && (
            <p className="text-gray-300 text-sm">
              Your subscription has been suspended. Please contact support for assistance.
            </p>
          )}
        </div>
        
        {(enforcement.state === 'WARN' || enforcement.state === 'GRACE' || enforcement.state === 'DEGRADED') && (
          <button
            onClick={onUpgrade}
            className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm whitespace-nowrap"
          >
            Upgrade Now
          </button>
        )}
      </div>
    </div>
  )
}

function PlanCard({ plan, currentPlanName, token, onUpgradeSuccess }: { plan: Plan; currentPlanName: string; token: string | null; onUpgradeSuccess: () => void }) {
  const [upgrading, setUpgrading] = useState(false)
  const [error, setError] = useState('')
  const isCurrentPlan = plan.name === currentPlanName
  const isPopular = plan.name === 'pro'

  return (
    <div className={`bg-gray-900 rounded-lg border-2 p-6 relative ${
      isPopular ? 'border-blue-600' : 'border-gray-800'
    }`}>
      {isPopular && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full">Most Popular</span>
        </div>
      )}
      
      <div className="mb-4">
        <h3 className="text-xl font-bold text-white mb-1">{plan.displayName}</h3>
        <div className="flex items-baseline">
          <span className="text-3xl font-bold text-white">${plan.price.toFixed(2)}</span>
          <span className="text-gray-400 ml-2">/{plan.interval}</span>
        </div>
        {plan.description && (
          <p className="text-gray-400 text-sm mt-2">{plan.description}</p>
        )}
      </div>

      <div className="space-y-3 mb-6">
        <FeatureItem label="Projects" value={plan.maxProjects === null ? 'Unlimited' : plan.maxProjects.toString()} />
        <FeatureItem label="Devices" value={plan.maxDevices === null ? 'Unlimited' : plan.maxDevices.toLocaleString()} />
        <FeatureItem label="API Traces" value={plan.maxApiTraces === null ? 'Unlimited' : plan.maxApiTraces.toLocaleString()} />
        {plan.maxApiEndpoints !== undefined && (
          <FeatureItem label="Unique API Endpoints" value={plan.maxApiEndpoints === null ? 'Unlimited' : plan.maxApiEndpoints.toString()} />
        )}
        {plan.maxApiRequests !== undefined && (
          <FeatureItem label="API Requests/Month" value={plan.maxApiRequests === null ? 'Unlimited' : plan.maxApiRequests.toLocaleString()} />
        )}
        <FeatureItem label="Logs" value={plan.maxLogs === null ? 'Unlimited' : plan.maxLogs.toLocaleString()} />
        <FeatureItem label="Sessions" value={plan.maxSessions === null ? 'Unlimited' : plan.maxSessions.toLocaleString()} />
        <FeatureItem label="Crashes" value={plan.maxCrashes === null ? 'Unlimited' : plan.maxCrashes.toLocaleString()} />
        {plan.maxBusinessConfigKeys !== undefined && (
          <FeatureItem label="Business Config Keys" value={plan.maxBusinessConfigKeys === null ? 'Unlimited' : plan.maxBusinessConfigKeys.toString()} />
        )}
        {plan.maxLocalizationLanguages !== undefined && (
          <FeatureItem label="Languages" value={plan.maxLocalizationLanguages === null ? 'Unlimited' : plan.maxLocalizationLanguages.toString()} />
        )}
        {plan.maxLocalizationKeys !== undefined && (
          <FeatureItem label="Localization Keys" value={plan.maxLocalizationKeys === null ? 'Unlimited' : plan.maxLocalizationKeys.toLocaleString()} />
        )}
        <FeatureItem label="Retention" value={plan.retentionDays === null ? 'Unlimited' : `${plan.retentionDays} days`} />
        {plan.allowCustomDomains && <FeatureItem label="Custom Domains" value="✓" />}
        {plan.allowWebhooks && <FeatureItem label="Webhooks" value="✓" />}
        {plan.allowTeamMembers && <FeatureItem label="Team Members" value="✓" />}
        {plan.allowPrioritySupport && <FeatureItem label="Priority Support" value="✓" />}
      </div>

      {error && (
        <div className="text-red-400 text-sm mb-2">{error}</div>
      )}
      <button
        onClick={async () => {
          if (!token) {
            setError('Not authenticated')
            return
          }
          if (isCurrentPlan) return
          
          setUpgrading(true)
          setError('')
          
          try {
            if (plan.price === 0) {
              const result = await api.subscription.upgrade(plan.id, null, token)
              if (result.success) {
                alert('Plan upgraded successfully!')
                onUpgradeSuccess()
              } else {
                setError(result.error || 'Upgrade failed')
              }
              setUpgrading(false)
              return
            }
            
            let paymentMethods: any[] = []
            try {
              const pmData = await api.paymentMethods.list(token)
              paymentMethods = pmData.paymentMethods || []
            } catch (err) {}
            
            if (paymentMethods.length === 0) {
              if (confirm(`Upgrade to ${plan.displayName} for $${plan.price.toFixed(2)}/month?\n\nYou'll need to add a payment method. Redirect?`)) {
                window.location.href = '/payment-methods?upgrade=' + plan.id
              }
              setUpgrading(false)
              return
            }
            
            const defaultPaymentMethod = paymentMethods.find(pm => pm.isDefault) || paymentMethods[0]
            const result = await api.subscription.upgrade(plan.id, defaultPaymentMethod.stripePaymentMethodId, token)
            
            if (result.success) {
              alert(`Successfully upgraded to ${plan.displayName}!`)
              onUpgradeSuccess()
            } else if (result.requiresPayment && result.paymentIntent) {
              if (confirm(`Complete payment of $${(result.paymentIntent.amount / 100).toFixed(2)} to upgrade?`)) {
                try {
                  const confirmResult = await api.subscription.confirmUpgrade(result.paymentIntent.id, plan.id, token)
                  if (confirmResult.success) {
                    alert('Plan upgraded successfully!')
                    onUpgradeSuccess()
                  } else {
                    setError('Payment confirmation failed')
                  }
                } catch (err) {
                  setError('Failed to confirm payment')
                }
              }
            } else {
              setError(result.error || 'Upgrade failed')
            }
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Upgrade failed')
          } finally {
            setUpgrading(false)
          }
        }}
        disabled={isCurrentPlan || upgrading}
        className={`w-full py-2 px-4 rounded font-medium transition-colors ${
          isCurrentPlan
            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
            : upgrading
            ? 'bg-gray-600 text-gray-300 cursor-wait'
            : isPopular
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-gray-800 hover:bg-gray-700 text-white'
        }`}
      >
        {upgrading ? 'Processing...' : isCurrentPlan ? 'Current Plan' : `Upgrade - $${plan.price.toFixed(2)}/mo`}
      </button>
    </div>
  )
}

function FeatureItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="text-white font-medium">{value}</span>
    </div>
  )
}
