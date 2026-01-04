'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { api } from '@/lib/api'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/layout/PageHeader'
import ThemeToggle from '@/components/ThemeToggle'
import DataTable, { Column } from '@/components/DataTable'
import FilterBar from '@/components/FilterBar'

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
    if (!token) return

    api.admin.getSubscriptions(token)
      .then((data) => {
        setSubscriptions(data.subscriptions || [])
        setLoading(false)
      })
      .catch((error) => {
        console.error('Failed to load subscriptions:', error)
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
      
      const data = await api.admin.getSubscriptions(token)
      setSubscriptions(data.subscriptions || [])
    } catch (error) {
      alert('Failed to update subscription: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setToggling(null)
    }
  }

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

  return (
    <AppShell>
      <PageHeader
        title="Subscription Management"
        subtitle="Assign plans to users and manage subscriptions"
        dataMode="Admin"
        actions={
          <>
            <ThemeToggle />
            <Link href="/admin/plans" className="btn secondary">
              Manage Plans
            </Link>
            <button
              onClick={() => router.push('/admin/subscriptions/create')}
              className="btn"
            >
              Create Subscription
            </button>
          </>
        }
      />

      {/* Note Section */}
      <div className="note" style={{ marginTop: '18px' }}>
        <b>Workflow</b>
        <div className="muted" style={{ marginTop: '6px' }}>
          First{' '}
          <Link href="/admin/plans" style={{ color: 'var(--p)', textDecoration: 'underline' }}>
            manage plans
          </Link>
          {' '}to configure limits and pricing, then assign them to users here.
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={[
          {
            type: 'search',
            placeholder: 'Search by email or name...',
            value: search,
            onChange: (e) => setSearch(e.target.value),
          },
          {
            type: 'select',
            options: [
              { value: 'all', label: 'Plan: All' },
              ...availablePlans.map(plan => ({ value: plan, label: plan })),
            ],
            value: planFilter,
            onChange: (e) => setPlanFilter(e.target.value),
          },
          {
            type: 'select',
            options: [
              { value: 'all', label: 'Status: All' },
              { value: 'active', label: 'Active' },
              { value: 'expired', label: 'Expired' },
              { value: 'disabled', label: 'Disabled' },
            ],
            value: statusFilter,
            onChange: (e) => setStatusFilter(e.target.value),
          },
        ]}
        stats={[
          { label: 'Total subscriptions', value: subscriptions.length },
          { label: 'Active', value: subscriptions.filter(s => s.enabled && s.status === 'active').length },
          { label: 'Disabled', value: subscriptions.filter(s => !s.enabled).length },
        ]}
      />

      {/* Subscriptions Table */}
      <DataTable
        data={filteredSubscriptions}
        columns={[
          {
            key: 'user',
            label: 'User',
            render: (sub) => (
              <>
                <b>{sub.user.email}</b>
                {sub.user.name && (
                  <div className="muted" style={{ fontSize: '11px', marginTop: '4px' }}>
                    {sub.user.name}
                  </div>
                )}
              </>
            ),
          },
          {
            key: 'plan',
            label: 'Plan',
            render: (sub) => (
              <>
                <b>{sub.plan.displayName}</b>
                <div className="muted" style={{ fontSize: '11px', marginTop: '4px' }}>
                  ${sub.plan.price === 0 ? 'Free' : sub.plan.price.toFixed(2)}/mo
                </div>
              </>
            ),
          },
          {
            key: 'status',
            label: 'Status',
            render: (sub) => {
              const status = !sub.enabled
                ? { label: 'Disabled', dot: 'bad' }
                : sub.status === 'active'
                ? { label: 'Active', dot: 'good' }
                : { label: sub.status, dot: 'warn' }
              
              return (
                <span className="chip">
                  <span className={`dot ${status.dot}`} />
                  {status.label}
                </span>
              )
            },
          },
          {
            key: 'payment',
            label: 'Payment',
            render: (sub) => {
              const paymentStatus = getPaymentStatus(sub)
              return (
                <span className={paymentStatus === 'Paid' ? 'chip' : 'muted'}>
                  {paymentStatus}
                </span>
              )
            },
          },
          {
            key: 'revenue',
            label: 'Revenue',
            render: (sub) => {
              const revenue = getRevenue(sub)
              return revenue > 0 ? `$${revenue.toFixed(2)}` : '—'
            },
          },
          {
            key: 'actions',
            label: 'Actions',
            render: (sub) => (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  className="btn secondary"
                  style={{ padding: '7px 10px', fontSize: '11px' }}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleToggle(sub)
                  }}
                  disabled={toggling === sub.id}
                >
                  {toggling === sub.id ? '...' : sub.enabled ? 'Disable' : 'Enable'}
                </button>
                <Link
                  href={`/admin/subscriptions/${sub.id}`}
                  className="btn secondary"
                  style={{ padding: '7px 10px', fontSize: '11px' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  View
                </Link>
              </div>
            ),
          },
        ]}
        loading={loading}
        emptyMessage="No subscriptions found"
        onRowClick={(sub) => {
          router.push(`/admin/subscriptions/${sub.id}`)
        }}
        footerNote={`Showing ${filteredSubscriptions.length} of ${subscriptions.length} subscriptions`}
      />
    </AppShell>
  )
}
