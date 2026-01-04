'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { api } from '@/lib/api'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/layout/PageHeader'
import ThemeToggle from '@/components/ThemeToggle'

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
      <AppShell>
        <PageHeader
          title="Revenue Dashboard"
          subtitle="Track subscription revenue and payment status"
          dataMode="Admin"
          actions={<ThemeToggle />}
        />
        <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--m)' }}>
          Loading revenue data...
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <PageHeader
        title="Revenue Dashboard"
        subtitle="Track subscription revenue and payment status"
        dataMode="Admin"
        actions={<ThemeToggle />}
      />

      {/* Revenue Overview */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginTop: '18px' }}>
        <div className="card" style={{ borderColor: 'var(--a)' }}>
          <div className="muted" style={{ fontSize: '12px', marginBottom: '8px' }}>Total Revenue</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--a)', marginBottom: '4px' }}>
            ${revenue?.totalRevenue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
          </div>
          <div className="muted" style={{ fontSize: '11px' }}>All time</div>
        </div>

        <div className="card">
          <div className="muted" style={{ fontSize: '12px', marginBottom: '8px' }}>Active Subscriptions</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--t)', marginBottom: '4px' }}>
            {revenue?.activeSubscriptions || 0}
          </div>
        </div>

        <div className="card">
          <div className="muted" style={{ fontSize: '12px', marginBottom: '8px' }}>Expired Subscriptions</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--w)', marginBottom: '4px' }}>
            {revenue?.expiredSubscriptions || 0}
          </div>
        </div>

        <div className="card">
          <div className="muted" style={{ fontSize: '12px', marginBottom: '8px' }}>Disabled Subscriptions</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--d)', marginBottom: '4px' }}>
            {revenue?.disabledSubscriptions || 0}
          </div>
        </div>
      </div>

      {/* Revenue by Plan */}
      {revenue?.revenueByPlan && Object.keys(revenue.revenueByPlan).length > 0 && (
        <div className="card" style={{ marginTop: '14px' }}>
          <b style={{ fontSize: '16px', marginBottom: '14px', display: 'block' }}>Revenue by Plan</b>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Object.entries(revenue.revenueByPlan).map(([planName, amount]: [string, any]) => (
              <div key={planName} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <b style={{ textTransform: 'capitalize' }}>{planName} Plan</b>
                  <div className="muted" style={{ fontSize: '11px', marginTop: '4px' }}>
                    {revenue.planCounts[planName] || 0} subscriptions
                  </div>
                </div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--a)' }}>
                  ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Note */}
      <div className="note" style={{ marginTop: '14px' }}>
        <b>Note</b>
        <div className="muted" style={{ marginTop: '6px' }}>
          Currently all subscriptions are Free Plan ($0). Revenue tracking is prepared for future paid plans (Pro, Team).
        </div>
      </div>
    </AppShell>
  )
}
