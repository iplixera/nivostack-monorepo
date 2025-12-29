'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { api } from '@/lib/api'

type Subscription = {
  id: string
  userId: string
  status: string
  enabled: boolean
  trialStartDate: string
  trialEndDate: string
  disabledBy: string | null
  disabledAt: string | null
  enabledBy: string | null
  enabledAt: string | null
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
    maxBusinessConfigKeys: number | null
    maxLocalizationLanguages: number | null
    maxLocalizationKeys: number | null
  }
  promoCode?: {
    id: string
    code: string
    discountType: string
    discountValue: number
  } | null
  discountPercent?: number | null
  discountAmount?: number | null
  discountedPrice?: number | null
  quotaMaxDevices?: number | null
  invoices: Array<{
    id: string
    amount: number
    status: string
    createdAt: string
  }>
}

export default function AdminSubscriptionsPage() {
  const router = useRouter()
  const { token } = useAuth()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [planFilter, setPlanFilter] = useState<string>('all')
  const [toggling, setToggling] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      console.log('No token available')
      return
    }

    console.log('Loading subscriptions with token...')
    api.admin.getSubscriptions(token)
      .then((data) => {
        console.log('Subscriptions API response:', data)
        console.log('Subscriptions loaded:', data.subscriptions?.length || 0)
        if (data && data.subscriptions) {
          setSubscriptions(data.subscriptions)
        } else {
          console.warn('No subscriptions in response:', data)
          setSubscriptions([])
        }
        setLoading(false)
      })
      .catch((error) => {
        console.error('Failed to load subscriptions:', error)
        alert('Failed to load subscriptions: ' + (error instanceof Error ? error.message : 'Unknown error'))
        setSubscriptions([])
        setLoading(false)
      })
  }, [token])

  const handleToggle = async (subscription: Subscription) => {
    if (!token) return
    setToggling(subscription.id)

    try {
      if (subscription.enabled) {
        await api.admin.disableSubscription(subscription.id, token)
      } else {
        await api.admin.enableSubscription(subscription.id, token)
      }
      
      // Refresh subscriptions
      const data = await api.admin.getSubscriptions(token)
      setSubscriptions(data.subscriptions || [])
    } catch (error) {
      alert('Failed to update subscription: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setToggling(null)
    }
  }

  // Get unique plans from subscriptions
  const availablePlans = Array.from(
    new Set(subscriptions.map(sub => sub.plan.name))
  ).sort()

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesSearch = 
      sub.user.email.toLowerCase().includes(search.toLowerCase()) ||
      (sub.user.name && sub.user.name.toLowerCase().includes(search.toLowerCase()))
    
    const matchesPlan = planFilter === 'all' || sub.plan.name === planFilter
    
    let matchesStatus = true
    if (statusFilter === 'active') {
      matchesStatus = sub.enabled && sub.status === 'active'
    } else if (statusFilter === 'expired') {
      matchesStatus = sub.status === 'expired'
    } else if (statusFilter === 'disabled') {
      matchesStatus = !sub.enabled
    }
    
    return matchesSearch && matchesPlan && matchesStatus
  })

  const getPaymentStatus = (sub: Subscription) => {
    if (sub.plan.price === 0) return 'Free'
    const latestInvoice = sub.invoices[0]
    if (latestInvoice && latestInvoice.status === 'paid') return 'Paid'
    return 'Unpaid'
  }

  const getRevenue = (sub: Subscription) => {
    return sub.invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.amount, 0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400">Loading subscriptions...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Subscription Management</h1>
          <p className="text-gray-400">Assign plans to users and manage subscriptions</p>
          <div className="mt-2 p-3 bg-blue-900/20 border border-blue-600/50 rounded-lg">
            <p className="text-sm text-blue-300">
              💡 <strong>Workflow:</strong> First{' '}
              <Link href="/admin/plans" className="underline hover:text-blue-200 font-medium">
                manage plans
              </Link>
              {' '}to configure limits and pricing, then assign them to users here
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/plans"
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Manage Plans
          </Link>
          <button
            onClick={() => router.push('/admin/subscriptions/create')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Subscription
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 rounded-lg p-4 flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search by email or name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500"
        />
        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white"
        >
          <option value="all">All Plans</option>
          {availablePlans.map(planName => {
            const plan = subscriptions.find(s => s.plan.name === planName)?.plan
            return (
              <option key={planName} value={planName}>
                {plan?.displayName || planName}
              </option>
            )
          })}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="disabled">Disabled</option>
        </select>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-gray-900 rounded-lg overflow-hidden">
        {subscriptions.length === 0 && !loading ? (
          <div className="p-6 text-center">
            <p className="text-gray-400 mb-4">No subscriptions found in the system.</p>
            <button
              onClick={() => router.push('/admin/subscriptions/create')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
            >
              Create First Subscription
            </button>
          </div>
        ) : subscriptions.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Plan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Quotas</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Trial Ends</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredSubscriptions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-gray-800/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-white">{sub.user.email}</div>
                          {sub.user.name && (
                            <div className="text-sm text-gray-400">{sub.user.name}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">{sub.plan.displayName}</div>
                        <div className="text-xs text-gray-400">
                          ${sub.plan.price === 0 ? 'Free' : sub.plan.price.toFixed(2)}/mo
                        </div>
                        {sub.promoCode && (
                          <div className="text-xs text-green-400 mt-1">
                            Promo: {sub.promoCode.code} ({sub.promoCode.discountType === 'percent' ? `${sub.promoCode.discountValue}%` : `$${sub.promoCode.discountValue}`})
                          </div>
                        )}
                        {sub.discountedPrice && sub.discountedPrice !== sub.plan.price && (
                          <div className="text-xs text-blue-400 mt-1">
                            Final: ${sub.discountedPrice.toFixed(2)}/mo
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs space-y-1">
                          <div className="text-gray-300">Projects: {sub.plan.maxProjects === null ? '∞' : sub.plan.maxProjects}</div>
                          <div className="text-gray-300">Devices: {sub.plan.maxDevices === null ? '∞' : sub.plan.maxDevices}</div>
                          <div className="text-gray-300">Mock Endpoints: {sub.plan.maxMockEndpoints === null ? '∞' : sub.plan.maxMockEndpoints}</div>
                          <div className="text-gray-300">API Endpoints: {sub.plan.maxApiEndpoints === null ? '∞' : sub.plan.maxApiEndpoints.toLocaleString()}</div>
                          <div className="text-gray-300">API Requests: {sub.plan.maxApiRequests === null ? '∞' : sub.plan.maxApiRequests.toLocaleString()}</div>
                          <div className="text-gray-300">Logs: {sub.plan.maxLogs === null ? '∞' : sub.plan.maxLogs.toLocaleString()}</div>
                          <div className="text-gray-300">Sessions: {sub.plan.maxSessions === null ? '∞' : sub.plan.maxSessions.toLocaleString()}</div>
                          <div className="text-gray-300">Crashes: {sub.plan.maxCrashes === null ? '∞' : sub.plan.maxCrashes}</div>
                          <div className="text-gray-300">Business Config Keys: {sub.plan.maxBusinessConfigKeys === null ? '∞' : sub.plan.maxBusinessConfigKeys}</div>
                          <div className="text-gray-300">Localization Languages: {sub.plan.maxLocalizationLanguages === null ? '∞' : sub.plan.maxLocalizationLanguages}</div>
                          <div className="text-gray-300">Localization Keys: {sub.plan.maxLocalizationKeys === null ? '∞' : sub.plan.maxLocalizationKeys.toLocaleString()}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className={`px-2 py-1 text-xs rounded w-fit ${
                            !sub.enabled
                              ? 'bg-red-900/30 text-red-400'
                              : sub.status === 'active'
                              ? 'bg-green-900/30 text-green-400'
                              : 'bg-yellow-900/30 text-yellow-400'
                          }`}>
                            {!sub.enabled ? 'Disabled' : sub.status}
                          </span>
                          {sub.disabledAt && (
                            <span className="text-xs text-gray-500">
                              Disabled {new Date(sub.disabledAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded ${
                          getPaymentStatus(sub) === 'Paid'
                            ? 'bg-green-900/30 text-green-400'
                            : getPaymentStatus(sub) === 'Free'
                            ? 'bg-blue-900/30 text-blue-400'
                            : 'bg-gray-900/30 text-gray-400'
                        }`}>
                          {getPaymentStatus(sub)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        ${getRevenue(sub).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(sub.trialEndDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => router.push(`/admin/subscriptions/${sub.id}`)}
                            className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                          >
                            Manage
                          </button>
                          <button
                            onClick={() => handleToggle(sub)}
                            disabled={toggling === sub.id}
                            className={`px-3 py-1 text-xs rounded transition-colors ${
                              sub.enabled
                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                : 'bg-green-600 hover:bg-green-700 text-white'
                            } ${toggling === sub.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {toggling === sub.id
                              ? '...'
                              : sub.enabled
                              ? 'Disable'
                              : 'Enable'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredSubscriptions.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                No subscriptions match your search/filter criteria
              </div>
            )}
          </>
        ) : null}
      </div>

      {subscriptions.length > 0 && (
        <div className="text-sm text-gray-400">
          Showing {filteredSubscriptions.length} of {subscriptions.length} subscriptions
        </div>
      )}
    </div>
  )
}

