'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { api } from '@/lib/api'

export default function AdminRevenuePage() {
  const { token } = useAuth()
  const [revenue, setRevenue] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return

    api.admin.getRevenue(token)
      .then((data) => {
        setRevenue(data.revenue)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [token])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400">Loading revenue data...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Revenue Dashboard</h1>
        <p className="text-gray-400">Track subscription revenue and payment status</p>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-900 rounded-lg p-6 border border-green-600">
          <div className="text-sm text-gray-400 mb-2">Total Revenue</div>
          <div className="text-4xl font-bold text-green-400">
            ${revenue?.totalRevenue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
          </div>
          <div className="text-xs text-gray-500 mt-2">All time</div>
        </div>

        <div className="bg-gray-900 rounded-lg p-6">
          <div className="text-sm text-gray-400 mb-2">Active Subscriptions</div>
          <div className="text-3xl font-bold text-white">
            {revenue?.activeSubscriptions || 0}
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-6">
          <div className="text-sm text-gray-400 mb-2">Expired Subscriptions</div>
          <div className="text-3xl font-bold text-yellow-400">
            {revenue?.expiredSubscriptions || 0}
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-6">
          <div className="text-sm text-gray-400 mb-2">Disabled Subscriptions</div>
          <div className="text-3xl font-bold text-red-400">
            {revenue?.disabledSubscriptions || 0}
          </div>
        </div>
      </div>

      {/* Revenue by Plan */}
      {revenue?.revenueByPlan && Object.keys(revenue.revenueByPlan).length > 0 && (
        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Revenue by Plan</h2>
          <div className="space-y-4">
            {Object.entries(revenue.revenueByPlan).map(([planName, amount]: [string, any]) => (
              <div key={planName} className="flex items-center justify-between p-4 bg-gray-800 rounded">
                <div>
                  <div className="text-white font-medium capitalize">{planName} Plan</div>
                  <div className="text-sm text-gray-400">
                    {revenue.planCounts[planName] || 0} subscriptions
                  </div>
                </div>
                <div className="text-2xl font-bold text-green-400">
                  ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Note */}
      <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4">
        <p className="text-blue-400 text-sm">
          💡 Currently all subscriptions are Free Plan ($0). Revenue tracking is prepared for future paid plans (Pro, Team).
        </p>
      </div>
    </div>
  )
}

