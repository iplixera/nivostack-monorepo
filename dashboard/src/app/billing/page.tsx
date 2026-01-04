'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/layout/PageHeader'
import ThemeToggle from '@/components/ThemeToggle'
import DataTable, { Column } from '@/components/DataTable'

type Quota = {
  name: string
  used: number
  limit: number
  percentage: number
  status: 'ok' | 'warning' | 'critical'
}

export default function BillingPage() {
  const { token } = useAuth()
  const [quotas, setQuotas] = useState<Quota[]>([])
  const [plan, setPlan] = useState({ name: 'Team', seats: 5, retention: '7 days' })

  useEffect(() => {
    if (token) {
      fetchBilling()
    }
  }, [token])

  const fetchBilling = async () => {
    if (!token) return
    try {
      // TODO: Implement billing API
      setQuotas([
        { name: 'API Requests', used: 820000, limit: 1000000, percentage: 82, status: 'warning' },
        { name: 'Devices', used: 450, limit: 1000, percentage: 45, status: 'ok' },
        { name: 'Sessions', used: 12300, limit: 50000, percentage: 25, status: 'ok' },
        { name: 'Business Config Keys', used: 820, limit: 1000, percentage: 82, status: 'warning' },
        { name: 'Localization Keys', used: 9300, limit: 10000, percentage: 93, status: 'critical' },
      ])
    } catch (error) {
      console.error('Failed to fetch billing:', error)
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="Billing & Quotas"
        subtitle="Plan, usage, enforcement states, and where 80%/90% warnings surface across the app."
        dataMode="Org"
        actions={
          <>
            <ThemeToggle />
            <button className="btn" onClick={() => {}}>
              Upgrade Plan
            </button>
          </>
        }
      />

      {/* Note Section */}
      <div className="card" style={{ marginTop: '18px' }}>
        <b>Where warnings are displayed (80% / 90%)</b>
        <div className="hr" />
        <ul className="muted" style={{ lineHeight: '1.7' }}>
          <li><b>Global sticky banner</b> below topbar on any page when any quota crosses threshold.</li>
          <li><b>In-product notifications</b> (bell) with links to Billing and the impacted module.</li>
          <li><b>Module header chips</b> (e.g., Traces, Logs) showing % used for that feature.</li>
          <li><b>Billing page</b> shows full breakdown + historical usage trend + projected run-rate.</li>
        </ul>
      </div>

      {/* Current Plan */}
      <div className="card" style={{ marginTop: '14px' }}>
        <b>Current plan</b>
        <div className="row" style={{ marginTop: '10px' }}>
          <span className="chip">
            <span className="dot" />
            {plan.name}
          </span>
          <span className="chip">
            <span className="dot" />
            Seats: {plan.seats}
          </span>
          <span className="chip">
            <span className="dot" />
            Retention: {plan.retention}
          </span>
          <button className="btn" onClick={() => {}}>
            Upgrade
          </button>
        </div>
      </div>

      {/* Usage Table */}
      <div className="card" style={{ marginTop: '14px' }}>
        <b>Usage (month-to-date)</b>
        <DataTable
          data={quotas}
          columns={[
            {
              key: 'name',
              label: 'Quota',
              render: (quota) => <b>{quota.name}</b>,
            },
            {
              key: 'used',
              label: 'Used',
              render: (quota) => quota.used.toLocaleString(),
            },
            {
              key: 'limit',
              label: 'Limit',
              render: (quota) => quota.limit === -1 ? 'Unlimited' : quota.limit.toLocaleString(),
            },
            {
              key: 'percentage',
              label: '%',
              render: (quota) => (
                <span className={quota.status === 'critical' ? 'bad' : quota.status === 'warning' ? 'warn' : ''}>
                  {quota.percentage}%
                </span>
              ),
            },
            {
              key: 'status',
              label: 'Status',
              render: (quota) => {
                if (quota.status === 'critical') {
                  return (
                    <span className="chip">
                      <span className="dot bad" />
                      Critical
                    </span>
                  )
                }
                if (quota.status === 'warning') {
                  return (
                    <span className="chip">
                      <span className="dot warn" />
                      Warning
                    </span>
                  )
                }
                return (
                  <span className="chip">
                    <span className="dot" />
                    OK
                  </span>
                )
              },
            },
            {
              key: 'actions',
              label: 'Action',
              render: (quota) => (
                quota.status !== 'ok' ? (
                  <button
                    className="btn secondary"
                    style={{ padding: '7px 10px', fontSize: '11px' }}
                    onClick={(e) => {
                      e.stopPropagation()
                      // TODO: Upgrade or add capacity
                    }}
                  >
                    Add Capacity
                  </button>
                ) : null
              ),
            },
          ]}
          loading={false}
          emptyMessage="No quotas found"
          footerNote="Implementation: Quota warnings appear at 80% (warning) and 90% (critical). Enforcement happens at 100% based on plan policy."
        />
      </div>
    </AppShell>
  )
}

