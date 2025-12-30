'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { api } from '@/lib/api'

type Plan = {
  id: string
  name: string
  displayName: string
  price: number
}

type PromoCode = {
  id: string
  code: string
  description: string | null
  discountType: string
  discountValue: number
  maxUses: number | null
  currentUses: number
  validUntil: string | null
  isActive: boolean
}

type User = {
  id: string
  email: string
  name: string | null
}

export default function CreateSubscriptionPage() {
  const router = useRouter()
  const { token } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchUser, setSearchUser] = useState('')
  const [selectedUserId, setSelectedUserId] = useState('')
  const [selectedPlanId, setSelectedPlanId] = useState('')
  const [selectedPromoCodeId, setSelectedPromoCodeId] = useState('')
  const [discountType, setDiscountType] = useState<'none' | 'promo' | 'direct'>('none')
  const [directDiscountPercent, setDirectDiscountPercent] = useState<number>(0)
  const [directDiscountAmount, setDirectDiscountAmount] = useState<number>(0)

  useEffect(() => {
    if (!token) return
    loadData()
  }, [token])

  const loadData = async () => {
    if (!token) return
    try {
      setLoading(true)
      const [usersData, plansData, promoCodesData] = await Promise.all([
        api.admin.getUsers(token).catch(() => ({ users: [] })),
        api.admin.getPlans(token).catch(() => ({ plans: [] })),
        api.admin.getPromoCodes(token).catch(() => ({ promoCodes: [] })),
      ])
      setUsers(usersData.users || [])
      setPlans(plansData.plans || [])
      setPromoCodes((promoCodesData.promoCodes || []).filter((pc: PromoCode) => pc.isActive))
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!token || !selectedUserId || !selectedPlanId) {
      alert('Please select a user and plan')
      return
    }

    try {
      setSaving(true)

      const data: any = {
        userId: selectedUserId,
        planId: selectedPlanId,
      }

      if (discountType === 'promo' && selectedPromoCodeId) {
        data.promoCodeId = selectedPromoCodeId
      } else if (discountType === 'direct') {
        if (directDiscountPercent > 0) {
          data.discountPercent = directDiscountPercent
        }
        if (directDiscountAmount > 0) {
          data.discountAmount = directDiscountAmount
        }
      }

      await api.admin.createSubscription(data, token)
      alert('Subscription created successfully!')
      router.push('/admin/subscriptions')
    } catch (error) {
      alert('Failed to create subscription: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setSaving(false)
    }
  }

  const selectedPlan = plans.find(p => p.id === selectedPlanId)
  const selectedPromoCode = promoCodes.find(pc => pc.id === selectedPromoCodeId)

  // Calculate final price
  let finalPrice = selectedPlan?.price || 0
  if (discountType === 'promo' && selectedPromoCode) {
    if (selectedPromoCode.discountType === 'percent') {
      finalPrice = finalPrice * (1 - selectedPromoCode.discountValue / 100)
    } else {
      finalPrice = Math.max(0, finalPrice - selectedPromoCode.discountValue)
    }
  } else if (discountType === 'direct') {
    if (directDiscountPercent > 0) {
      finalPrice = finalPrice * (1 - directDiscountPercent / 100)
    }
    if (directDiscountAmount > 0) {
      finalPrice = Math.max(0, finalPrice - directDiscountAmount)
    }
  }

  const filteredUsers = users.filter(
    u =>
      u.email.toLowerCase().includes(searchUser.toLowerCase()) ||
      (u.name && u.name.toLowerCase().includes(searchUser.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => router.back()}
          className="text-gray-400 hover:text-white mb-4 flex items-center gap-2"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-bold text-white mb-2">Create New Subscription</h1>
        <p className="text-gray-400">Assign a plan to a user and apply optional discounts</p>
        <p className="text-sm text-gray-500 mt-1">
          💡 Need to create or edit a plan?{' '}
          <Link href="/admin/plans" className="text-blue-400 hover:text-blue-300 underline">
            Manage Plans
          </Link>
        </p>
      </div>

      <div className="bg-gray-900 rounded-lg p-6 space-y-6">
        {/* User Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Select User</label>
          <input
            type="text"
            placeholder="Search by email or name..."
            value={searchUser}
            onChange={(e) => setSearchUser(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white mb-2"
          />
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white"
            required
          >
            <option value="">-- Select User --</option>
            {filteredUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.email} {user.name && `(${user.name})`}
              </option>
            ))}
          </select>
        </div>

        {/* Plan Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Select Plan</label>
          <select
            value={selectedPlanId}
            onChange={(e) => setSelectedPlanId(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white"
            required
          >
            <option value="">-- Select Plan --</option>
            {plans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.displayName} - ${plan.price.toFixed(2)}/month
              </option>
            ))}
          </select>
        </div>

        {/* Discount Options */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Discount</label>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="discountType"
                  value="none"
                  checked={discountType === 'none'}
                  onChange={() => setDiscountType('none')}
                  className="mr-2"
                />
                <span className="text-gray-300">No Discount</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="discountType"
                  value="promo"
                  checked={discountType === 'promo'}
                  onChange={() => setDiscountType('promo')}
                  className="mr-2"
                />
                <span className="text-gray-300">Promo Code</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="discountType"
                  value="direct"
                  checked={discountType === 'direct'}
                  onChange={() => setDiscountType('direct')}
                  className="mr-2"
                />
                <span className="text-gray-300">Direct Discount</span>
              </label>
            </div>

            {/* Promo Code Selection */}
            {discountType === 'promo' && (
              <div>
                <select
                  value={selectedPromoCodeId}
                  onChange={(e) => setSelectedPromoCodeId(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                >
                  <option value="">-- Select Promo Code --</option>
                  {promoCodes.map((pc) => (
                    <option key={pc.id} value={pc.id}>
                      {pc.code} - {pc.discountType === 'percent' ? `${pc.discountValue}%` : `$${pc.discountValue}`} off
                      {pc.description && ` (${pc.description})`}
                    </option>
                  ))}
                </select>
                {selectedPromoCode && (
                  <div className="mt-2 p-3 bg-blue-900/20 border border-blue-600 rounded text-sm text-blue-300">
                    <div>Code: <strong>{selectedPromoCode.code}</strong></div>
                    <div>Discount: {selectedPromoCode.discountType === 'percent' ? `${selectedPromoCode.discountValue}%` : `$${selectedPromoCode.discountValue}`}</div>
                    {selectedPromoCode.maxUses && (
                      <div>Uses: {selectedPromoCode.currentUses} / {selectedPromoCode.maxUses}</div>
                    )}
                    {selectedPromoCode.validUntil && (
                      <div>Valid until: {new Date(selectedPromoCode.validUntil).toLocaleDateString()}</div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Direct Discount */}
            {discountType === 'direct' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Percentage Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={directDiscountPercent}
                    onChange={(e) => setDirectDiscountPercent(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Fixed Amount Discount ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={directDiscountAmount}
                    onChange={(e) => setDirectDiscountAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                    placeholder="0"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Price Summary */}
        {selectedPlan && (
          <div className="p-4 bg-gray-800 rounded border border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Plan Price:</span>
              <span className="text-white">${selectedPlan.price.toFixed(2)}/month</span>
            </div>
            {finalPrice !== selectedPlan.price && (
              <>
                <div className="flex justify-between items-center mb-2 text-green-400">
                  <span>Discount Applied:</span>
                  <span>-${(selectedPlan.price - finalPrice).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                  <span className="text-white font-semibold">Final Price:</span>
                  <span className="text-white font-bold text-lg">${finalPrice.toFixed(2)}/month</span>
                </div>
              </>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4 pt-4 border-t border-gray-800">
          <button
            onClick={handleCreate}
            disabled={saving || !selectedUserId || !selectedPlanId}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium disabled:opacity-50"
          >
            {saving ? 'Creating...' : 'Create Subscription'}
          </button>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

