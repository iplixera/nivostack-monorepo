'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { api } from '@/lib/api'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/layout/PageHeader'
import ThemeToggle from '@/components/ThemeToggle'

function StatItem({ label, value, color = 'p' }: { label: string; value: string | number; color?: 'p' | 'a' | 'w' | 'd' }) {
  const colorMap = {
    p: 'var(--p)',
    a: 'var(--a)',
    w: 'var(--w)',
    d: 'var(--d)',
  }

  return (
    <div className="card">
      <div className="muted" style={{ fontSize: '12px', marginBottom: '8px' }}>{label}</div>
      <div style={{ fontSize: '20px', fontWeight: 800, color: colorMap[color] }}>
        {value}
      </div>
    </div>
  )
}

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
      <AppShell>
        <PageHeader
          title="Platform Statistics"
          subtitle="Platform-wide metrics and feature usage"
          dataMode="Admin"
          actions={<ThemeToggle />}
        />
        <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--m)' }}>
          Loading statistics...
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <PageHeader
        title="Platform Statistics"
        subtitle="Platform-wide metrics and feature usage"
        dataMode="Admin"
        actions={<ThemeToggle />}
      />

      {/* User Statistics */}
      <div className="card" style={{ marginTop: '18px' }}>
        <b style={{ fontSize: '16px', marginBottom: '14px', display: 'block' }}>User Statistics</b>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
          <StatItem label="Total Users" value={stats?.users?.total || 0} />
          <StatItem label="Active Subscriptions" value={stats?.users?.active || 0} color="a" />
          <StatItem label="Expired Subscriptions" value={stats?.users?.expired || 0} color="w" />
          <StatItem label="Disabled Subscriptions" value={stats?.users?.disabled || 0} color="d" />
        </div>
      </div>

      {/* Platform Statistics */}
      <div className="card" style={{ marginTop: '14px' }}>
        <b style={{ fontSize: '16px', marginBottom: '14px', display: 'block' }}>Platform Statistics</b>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
          <StatItem label="Total Projects" value={stats?.platform?.projects || 0} />
          <StatItem label="Total Devices" value={stats?.platform?.devices || 0} />
          <StatItem label="Total API Traces" value={stats?.platform?.apiTraces?.toLocaleString() || 0} />
          <StatItem label="Total Logs" value={stats?.platform?.logs?.toLocaleString() || 0} />
          <StatItem label="Total Sessions" value={stats?.platform?.sessions?.toLocaleString() || 0} />
          <StatItem label="Total Crashes" value={stats?.platform?.crashes?.toLocaleString() || 0} />
        </div>
      </div>

      {/* Feature Usage */}
      <div className="card" style={{ marginTop: '14px' }}>
        <b style={{ fontSize: '16px', marginBottom: '14px', display: 'block' }}>Feature Usage</b>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
          <StatItem label="Business Configs" value={stats?.features?.businessConfig || 0} />
          <StatItem label="Localization Keys" value={stats?.features?.localization || 0} />
        </div>
      </div>
    </AppShell>
  )
}
