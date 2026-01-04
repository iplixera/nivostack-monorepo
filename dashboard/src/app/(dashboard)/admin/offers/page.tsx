'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { api } from '@/lib/api'
import Link from 'next/link'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/layout/PageHeader'
import ThemeToggle from '@/components/ThemeToggle'
import DataTable, { Column } from '@/components/DataTable'
import FilterBar from '@/components/FilterBar'

type Offer = {
  id: string
  userId: string
  subscriptionId: string
  type: string
  status: string
  discountPercent: number | null
  discountAmount: number | null
  message: string | null
  expiresAt: string
  createdAt: string
  acceptedAt: string | null
  user: {
    id: string
    email: string
    name: string | null
  }
  subscription: {
    id: string
    plan: {
      name: string
      displayName: string
      price: number
    }
  }
}

export default function AdminOffersPage() {
  const { token } = useAuth()
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [creating, setCreating] = useState(false)
  const [createType, setCreateType] = useState<string>('')
  const [createOptions, setCreateOptions] = useState({
    discountPercent: 10,
    extensionDays: 30,
    daysUntilExpiry: 7,
  })

  useEffect(() => {
    if (!token) return
    loadOffers()
  }, [token, filterStatus, filterType])

  const loadOffers = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (filterStatus !== 'all') params.status = filterStatus
      if (filterType !== 'all') params.type = filterType

      const data = await api.admin.getOffers(token!, params)
      setOffers(data.offers || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load offers')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateOffers = async () => {
    if (!createType) {
      setError('Please select an offer type')
      return
    }

    try {
      setCreating(true)
      setError('')
      const result = await api.admin.createOffers(createType, createOptions, token!)
      
      if (result.success) {
        alert(`Successfully created ${result.created} ${createType} offers!`)
        setCreateType('')
        await loadOffers()
      } else {
        setError(`Failed to create offers: ${result.errors?.join(', ') || 'Unknown error'}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create offers')
    } finally {
      setCreating(false)
    }
  }

  const handleAcceptOffer = async (offerId: string) => {
    if (!confirm('Accept this offer on behalf of the user?')) return

    try {
      await api.admin.acceptOffer(offerId, token!)
      alert('Offer accepted successfully!')
      await loadOffers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept offer')
    }
  }

  const pendingOffers = offers.filter((o) => o.status === 'pending')
  const acceptedOffers = offers.filter((o) => o.status === 'accepted')
  const expiredOffers = offers.filter((o) => o.status === 'expired')

  return (
    <AppShell>
      <PageHeader
        title="Offers Management"
        subtitle="Create and manage early renewal, extension, and upgrade offers"
        dataMode="Admin"
        actions={
          <>
            <ThemeToggle />
            <Link href="/admin" className="btn secondary">
              Back to Dashboard
            </Link>
          </>
        }
      />

      {error && (
        <div className="card" style={{ marginTop: '18px', borderColor: 'var(--d)', background: 'rgba(220, 38, 38, 0.1)' }}>
          <div style={{ color: 'var(--d)' }}>{error}</div>
        </div>
      )}

      {/* Create Offers Section */}
      <div className="card" style={{ marginTop: '18px' }}>
        <b style={{ fontSize: '16px', marginBottom: '14px', display: 'block' }}>Create Offers</b>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label className="muted" style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}>Offer Type</label>
            <select
              className="select"
              value={createType}
              onChange={(e) => setCreateType(e.target.value)}
            >
              <option value="">Select offer type...</option>
              <option value="early_renewal">Early Renewal</option>
              <option value="extension">Extension</option>
              <option value="upgrade">Upgrade</option>
            </select>
          </div>

          {createType === 'early_renewal' && (
            <div>
              <label className="muted" style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}>Discount Percent</label>
              <input
                type="number"
                className="input"
                value={createOptions.discountPercent}
                onChange={(e) => setCreateOptions({ ...createOptions, discountPercent: parseInt(e.target.value) || 10 })}
                min="1"
                max="100"
              />
            </div>
          )}

          {createType === 'extension' && (
            <div>
              <label className="muted" style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}>Extension Days</label>
              <input
                type="number"
                className="input"
                value={createOptions.extensionDays}
                onChange={(e) => setCreateOptions({ ...createOptions, extensionDays: parseInt(e.target.value) || 30 })}
                min="1"
              />
            </div>
          )}

          <div>
            <label className="muted" style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}>Days Until Expiry</label>
            <input
              type="number"
              className="input"
              value={createOptions.daysUntilExpiry}
              onChange={(e) => setCreateOptions({ ...createOptions, daysUntilExpiry: parseInt(e.target.value) || 7 })}
              min="1"
            />
          </div>

          <button
            className="btn"
            onClick={handleCreateOffers}
            disabled={creating || !createType}
          >
            {creating ? 'Creating...' : 'Create Offers'}
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={[
          {
            type: 'select',
            options: [
              { value: 'all', label: 'Status: All' },
              { value: 'pending', label: 'Pending' },
              { value: 'accepted', label: 'Accepted' },
              { value: 'expired', label: 'Expired' },
            ],
            value: filterStatus,
            onChange: (e) => setFilterStatus(e.target.value),
          },
          {
            type: 'select',
            options: [
              { value: 'all', label: 'Type: All' },
              { value: 'early_renewal', label: 'Early Renewal' },
              { value: 'extension', label: 'Extension' },
              { value: 'upgrade', label: 'Upgrade' },
            ],
            value: filterType,
            onChange: (e) => setFilterType(e.target.value),
          },
        ]}
        stats={[
          { label: 'Pending', value: pendingOffers.length, dot: 'warn' },
          { label: 'Accepted', value: acceptedOffers.length, dot: 'good' },
          { label: 'Expired', value: expiredOffers.length },
        ]}
      />

      {/* Offers Table */}
      <DataTable
        data={offers}
        columns={[
          {
            key: 'user',
            label: 'User',
            render: (offer) => (
              <>
                <b>{offer.user.email}</b>
                {offer.user.name && (
                  <div className="muted" style={{ fontSize: '11px', marginTop: '4px' }}>
                    {offer.user.name}
                  </div>
                )}
              </>
            ),
          },
          {
            key: 'type',
            label: 'Type',
            render: (offer) => (
              <span className="chip">
                {offer.type.replace('_', ' ')}
              </span>
            ),
          },
          {
            key: 'discount',
            label: 'Discount',
            render: (offer) => {
              if (offer.discountPercent) {
                return <b>{offer.discountPercent}%</b>
              }
              if (offer.discountAmount) {
                return <b>${offer.discountAmount}</b>
              }
              return <span className="muted">—</span>
            },
          },
          {
            key: 'plan',
            label: 'Plan',
            render: (offer) => offer.subscription.plan.displayName,
          },
          {
            key: 'status',
            label: 'Status',
            render: (offer) => {
              const statusMap: Record<string, { label: string; dot: string }> = {
                pending: { label: 'Pending', dot: 'warn' },
                accepted: { label: 'Accepted', dot: 'good' },
                expired: { label: 'Expired', dot: '' },
              }
              const status = statusMap[offer.status] || { label: offer.status, dot: '' }
              return (
                <span className="chip">
                  <span className={`dot ${status.dot}`} />
                  {status.label}
                </span>
              )
            },
          },
          {
            key: 'expiresAt',
            label: 'Expires',
            render: (offer) => (
              <span className="muted">{new Date(offer.expiresAt).toLocaleDateString()}</span>
            ),
          },
          {
            key: 'actions',
            label: 'Actions',
            render: (offer) => (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {offer.status === 'pending' && (
                  <button
                    className="btn secondary"
                    style={{ padding: '7px 10px', fontSize: '11px' }}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAcceptOffer(offer.id)
                    }}
                  >
                    Accept
                  </button>
                )}
              </div>
            ),
          },
        ]}
        loading={loading}
        emptyMessage="No offers found"
        footerNote={`Showing ${offers.length} offers`}
      />
    </AppShell>
  )
}
