'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { api } from '@/lib/api'
import Link from 'next/link'

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400">Loading offers...</div>
      </div>
    )
  }

  const pendingOffers = offers.filter((o) => o.status === 'pending')
  const acceptedOffers = offers.filter((o) => o.status === 'accepted')
  const expiredOffers = offers.filter((o) => o.status === 'expired')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Offers Management</h1>
          <p className="text-gray-400">Create and manage early renewal, extension, and upgrade offers</p>
        </div>
        <Link
          href="/admin"
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-600 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Create Offers Section */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <h2 className="text-xl font-semibold text-white mb-4">Create Offers</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Offer Type</label>
            <select
              value={createType}
              onChange={(e) => setCreateType(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white"
            >
              <option value="">Select offer type...</option>
              <option value="early_renewal">Early Renewal (80%+ usage)</option>
              <option value="extension">Extension (100%+ usage)</option>
              <option value="upgrade">Upgrade (Conversion opportunities)</option>
            </select>
          </div>

          {createType && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Discount (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={createOptions.discountPercent}
                  onChange={(e) =>
                    setCreateOptions({ ...createOptions, discountPercent: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                />
              </div>
              {createType === 'extension' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Extension Days
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={createOptions.extensionDays}
                    onChange={(e) =>
                      setCreateOptions({ ...createOptions, extensionDays: parseInt(e.target.value) || 30 })
                    }
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                  />
                </div>
              )}
              {createType === 'early_renewal' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Days Until Expiry
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={createOptions.daysUntilExpiry}
                    onChange={(e) =>
                      setCreateOptions({ ...createOptions, daysUntilExpiry: parseInt(e.target.value) || 7 })
                    }
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                  />
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleCreateOffers}
            disabled={!createType || creating}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            {creating ? 'Creating...' : 'Create Offers'}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-900 rounded-lg p-6 border border-yellow-600">
          <div className="text-sm text-gray-400 mb-1">Pending Offers</div>
          <div className="text-3xl font-bold text-yellow-400">{pendingOffers.length}</div>
        </div>
        <div className="bg-gray-900 rounded-lg p-6 border border-green-600">
          <div className="text-sm text-gray-400 mb-1">Accepted</div>
          <div className="text-3xl font-bold text-green-400">{acceptedOffers.length}</div>
        </div>
        <div className="bg-gray-900 rounded-lg p-6 border border-red-600">
          <div className="text-sm text-gray-400 mb-1">Expired</div>
          <div className="text-3xl font-bold text-red-400">{expiredOffers.length}</div>
        </div>
        <div className="bg-gray-900 rounded-lg p-6 border border-blue-600">
          <div className="text-sm text-gray-400 mb-1">Total Offers</div>
          <div className="text-3xl font-bold text-blue-400">{offers.length}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="sent">Sent</option>
          <option value="accepted">Accepted</option>
          <option value="declined">Declined</option>
          <option value="expired">Expired</option>
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white"
        >
          <option value="all">All Types</option>
          <option value="early_renewal">Early Renewal</option>
          <option value="extension">Extension</option>
          <option value="upgrade">Upgrade</option>
        </select>
      </div>

      {/* Offers Table */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-white">Offers</h2>
        </div>

        {offers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-gray-400 mb-4">No offers found</div>
            <p className="text-sm text-gray-500">Create offers to target users at risk or with conversion opportunities</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Discount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Expires</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {offers.map((offer) => (
                  <tr key={offer.id} className="hover:bg-gray-800/50">
                    <td className="px-6 py-4">
                      <div className="text-sm text-white">{offer.user.email}</div>
                      {offer.user.name && (
                        <div className="text-xs text-gray-400">{offer.user.name}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs px-2 py-1 rounded bg-blue-900/30 text-blue-400 capitalize">
                        {offer.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300 capitalize">
                      {offer.subscription.plan.displayName}
                    </td>
                    <td className="px-6 py-4">
                      {offer.discountPercent && (
                        <div className="text-sm text-green-400">
                          {offer.discountPercent}% (${offer.discountAmount?.toFixed(2) || '0.00'})
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          offer.status === 'accepted'
                            ? 'bg-green-900/30 text-green-400'
                            : offer.status === 'pending'
                            ? 'bg-yellow-900/30 text-yellow-400'
                            : offer.status === 'expired'
                            ? 'bg-red-900/30 text-red-400'
                            : 'bg-gray-800 text-gray-400'
                        }`}
                      >
                        {offer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(offer.expiresAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {offer.status === 'pending' && (
                          <button
                            onClick={() => handleAcceptOffer(offer.id)}
                            className="text-xs text-blue-400 hover:text-blue-300"
                          >
                            Accept
                          </button>
                        )}
                        <Link
                          href={`/admin/subscriptions?user=${offer.userId}`}
                          className="text-xs text-gray-400 hover:text-gray-300"
                        >
                          View →
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

