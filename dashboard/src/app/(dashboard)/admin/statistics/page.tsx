'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { api } from '@/lib/api'

export default function AdminStatisticsPage() {
  const { token } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return

    api.admin.getStats(token)
      .then((data) => {
        setStats(data.stats)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [token])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400">Loading statistics...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Platform Statistics</h1>
        <p className="text-gray-400">Platform-wide metrics and feature usage</p>
      </div>

      {/* User Statistics */}
      <div className="bg-gray-900 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">User Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatItem label="Total Users" value={stats?.users?.total || 0} />
          <StatItem label="Active Subscriptions" value={stats?.users?.active || 0} color="green" />
          <StatItem label="Expired Subscriptions" value={stats?.users?.expired || 0} color="yellow" />
          <StatItem label="Disabled Subscriptions" value={stats?.users?.disabled || 0} color="red" />
        </div>
      </div>

      {/* Platform Statistics */}
      <div className="bg-gray-900 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Platform Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatItem label="Total Projects" value={stats?.platform?.projects || 0} />
          <StatItem label="Total Devices" value={stats?.platform?.devices || 0} />
          <StatItem label="Total API Traces" value={stats?.platform?.apiTraces?.toLocaleString() || 0} />
          <StatItem label="Total Logs" value={stats?.platform?.logs?.toLocaleString() || 0} />
          <StatItem label="Total Sessions" value={stats?.platform?.sessions?.toLocaleString() || 0} />
          <StatItem label="Total Crashes" value={stats?.platform?.crashes?.toLocaleString() || 0} />
        </div>
      </div>

      {/* Feature Usage */}
      <div className="bg-gray-900 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Feature Usage</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatItem label="Business Configs" value={stats?.features?.businessConfig || 0} />
          <StatItem label="Localization Keys" value={stats?.features?.localization || 0} />
        </div>
      </div>
    </div>
  )
}

function StatItem({ label, value, color = 'blue' }: { label: string; value: string | number; color?: string }) {
  const colorClasses: Record<string, string> = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    yellow: 'text-yellow-400',
    red: 'text-red-400',
  }

  return (
    <div className="p-4 bg-gray-800 rounded">
      <div className="text-sm text-gray-400 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${colorClasses[color] || colorClasses.blue}`}>
        {value}
      </div>
    </div>
  )
}

