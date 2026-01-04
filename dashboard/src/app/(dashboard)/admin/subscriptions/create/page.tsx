'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { api } from '@/lib/api'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/layout/PageHeader'
import ThemeToggle from '@/components/ThemeToggle'

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

  return (
    <AppShell>
      <PageHeader
        title="Create New Subscription"
        subtitle="Assign a plan to a user and apply optional discounts"
        dataMode="Admin"
        actions={
          <>
            <ThemeToggle />
            <button
              onClick={() => router.back()}
              className="btn secondary"
            >
              Back
            </button>
          </>
        }
      />

      {/* Note Section */}
      <div className="note" style={{ marginTop: '18px' }}>
        <b>Workflow</b>
        <div className="muted" style={{ marginTop: '6px' }}>
          Need to create or edit a plan?{' '}
          <Link href="/admin/plans" style={{ color: 'var(--p)', textDecoration: 'underline' }}>
            Manage Plans
          </Link>
        </div>
      </div>

      {/* Form */}
      <div className="card" style={{ marginTop: '14px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* User Selection */}
          <div>
            <label className="muted" style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}>Select User *</label>
            <input
              type="text"
              className="input"
              placeholder="Search by email or name..."
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              style={{ marginBottom: '8px' }}
            />
            <select
              className="select"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
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
            <label className="muted" style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}>Select Plan *</label>
            <select
              className="select"
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
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

          {/* Discount Type */}
          <div>
            <label className="muted" style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}>Discount Type</label>
            <select
              className="select"
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as 'none' | 'promo' | 'direct')}
            >
              <option value="none">No Discount</option>
              <option value="promo">Promo Code</option>
              <option value="direct">Direct Discount</option>
            </select>
          </div>

          {/* Promo Code Selection */}
          {discountType === 'promo' && (
            <div>
              <label className="muted" style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}>Select Promo Code</label>
              <select
                className="select"
                value={selectedPromoCodeId}
                onChange={(e) => setSelectedPromoCodeId(e.target.value)}
              >
                <option value="">-- Select Promo Code --</option>
                {promoCodes.map((pc) => (
                  <option key={pc.id} value={pc.id}>
                    {pc.code} ({pc.discountType === 'percent' ? `${pc.discountValue}%` : `$${pc.discountValue}`})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Direct Discount */}
          {discountType === 'direct' && (
            <div className="grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
              <div>
                <label className="muted" style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}>Discount Percent (%)</label>
                <input
                  type="number"
                  className="input"
                  min="0"
                  max="100"
                  value={directDiscountPercent}
                  onChange={(e) => setDirectDiscountPercent(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="muted" style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}>Discount Amount ($)</label>
                <input
                  type="number"
                  className="input"
                  min="0"
                  step="0.01"
                  value={directDiscountAmount}
                  onChange={(e) => setDirectDiscountAmount(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          )}

          {/* Price Summary */}
          {selectedPlan && (
            <div className="card" style={{ background: 'var(--s2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div className="muted" style={{ fontSize: '12px' }}>Base Price</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--t)' }}>
                    ${selectedPlan.price.toFixed(2)}/month
                  </div>
                </div>
                {finalPrice !== selectedPlan.price && (
                  <>
                    <div style={{ fontSize: '20px', color: 'var(--m)' }}>→</div>
                    <div>
                      <div className="muted" style={{ fontSize: '12px' }}>Final Price</div>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--a)' }}>
                        ${finalPrice.toFixed(2)}/month
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '14px', marginTop: '8px' }}>
            <button
              className="btn secondary"
              onClick={() => router.back()}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              className="btn"
              onClick={handleCreate}
              disabled={saving || !selectedUserId || !selectedPlanId}
            >
              {saving ? 'Creating...' : 'Create Subscription'}
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
