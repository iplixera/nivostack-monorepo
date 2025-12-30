'use client'

import { useEffect, useState } from 'react'
import { useAuth } from './AuthProvider'
import { api } from '@/lib/api'
import Link from 'next/link'

type Subscription = {
  id: string
  status: string
  enabled: boolean
  trialEndDate: string
}

type UsageStats = {
  trialActive: boolean
  daysRemaining: number
}

export default function SubscriptionBanner() {
  const { token } = useAuth()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [usage, setUsage] = useState<UsageStats | null>(null)

  useEffect(() => {
    if (!token) return

    Promise.all([
      api.subscription.get(token).catch(() => null),
      api.subscription.getUsage(token).catch(() => null),
    ])
      .then(([subData, usageData]) => {
        if (subData) setSubscription(subData.subscription)
        if (usageData) setUsage(usageData.usage)
      })
      .catch(() => {
        // Silently fail - banner is not critical
      })
  }, [token])

  if (!subscription || !usage) return null

  // Check if admin disabled the subscription
  const isAdminDisabled = subscription.enabled === false || subscription.status === 'disabled'
  const isExpired = subscription.status === 'expired'
  const isExpiringSoon = usage.trialActive && usage.daysRemaining > 0 && usage.daysRemaining <= 7

  // Admin disabled - highest priority
  if (isAdminDisabled) {
    return (
      <div className="bg-red-900 border-b border-red-700 text-white text-center p-4 mb-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-sm font-medium mb-1">
            ⚠️ Your subscription has been disabled by an administrator
          </p>
          <p className="text-xs text-red-200">
            Some features may be unavailable. Please contact support for assistance.
          </p>
        </div>
      </div>
    )
  }

  if (!isExpired && !isExpiringSoon) return null

  return (
    <div className={`border-l-4 p-4 mb-6 rounded ${
      isExpired
        ? 'bg-red-900/20 border-red-600'
        : 'bg-yellow-900/20 border-yellow-600'
    }`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`font-semibold mb-1 ${
            isExpired ? 'text-red-400' : 'text-yellow-400'
          }`}>
            {isExpired ? 'Trial Expired' : 'Trial Ending Soon'}
          </h3>
          <p className="text-gray-300 text-sm">
            {isExpired
              ? 'Your free trial has ended. SDK is disabled. Upgrade to continue using DevBridge and access your data.'
              : `Your free trial expires in ${usage.daysRemaining} ${usage.daysRemaining === 1 ? 'day' : 'days'}. Upgrade to continue using all features.`}
          </p>
        </div>
        <Link
          href="/subscription"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm whitespace-nowrap ml-4"
        >
          {isExpired ? 'View Subscription' : 'Upgrade Now'}
        </Link>
      </div>
    </div>
  )
}

