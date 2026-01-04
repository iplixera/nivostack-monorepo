'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { api } from '@/lib/api'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/layout/PageHeader'
import ThemeToggle from '@/components/ThemeToggle'
import DataTable, { Column } from '@/components/DataTable'

type PromoCode = {
  id: string
  code: string
  description: string | null
  discountType: string
  discountValue: number
  maxUses: number | null
  currentUses: number
  validFrom: string
  validUntil: string | null
  applicablePlans: string[]
  minPlanPrice: number | null
  isActive: boolean
  createdAt: string
  _count?: {
    subscriptions: number
  }
}

export default function PromoCodesPage() {
  const { token } = useAuth()
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCode, setEditingCode] = useState<PromoCode | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percent',
    discountValue: 10,
    maxUses: null as number | null,
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: null as string | null,
    applicablePlans: [] as string[],
    minPlanPrice: null as number | null,
    isActive: true,
  })

  useEffect(() => {
    if (!token) return
    loadPromoCodes()
  }, [token])

  const loadPromoCodes = async () => {
    if (!token) return
    try {
      setLoading(true)
      const response = await api.admin.getPromoCodes(token)
      setPromoCodes(response.promoCodes || [])
    } catch (error) {
      console.error('Failed to load promo codes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingCode(null)
    setFormData({
      code: '',
      description: '',
      discountType: 'percent',
      discountValue: 10,
      maxUses: null,
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: null,
      applicablePlans: [],
      minPlanPrice: null,
      isActive: true,
    })
    setIsModalOpen(true)
  }

  const handleEdit = (code: PromoCode) => {
    setEditingCode(code)
    setFormData({
      code: code.code,
      description: code.description || '',
      discountType: code.discountType,
      discountValue: code.discountValue,
      maxUses: code.maxUses,
      validFrom: new Date(code.validFrom).toISOString().split('T')[0],
      validUntil: code.validUntil ? new Date(code.validUntil).toISOString().split('T')[0] : null,
      applicablePlans: code.applicablePlans || [],
      minPlanPrice: code.minPlanPrice,
      isActive: code.isActive,
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!token || !confirm('Are you sure you want to delete this promo code?')) return
    try {
      await api.admin.deletePromoCode(id, token)
      alert('Promo code deleted successfully!')
      loadPromoCodes()
    } catch (error) {
      alert('Failed to delete promo code: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const handleSave = async () => {
    if (!token) return
    setSaving(true)
    try {
      if (editingCode) {
        await api.admin.updatePromoCode(editingCode.id, formData, token)
        alert('Promo code updated successfully!')
      } else {
        await api.admin.createPromoCode(formData, token)
        alert('Promo code created successfully!')
      }
      setIsModalOpen(false)
      setEditingCode(null)
      loadPromoCodes()
    } catch (error) {
      alert('Failed to save promo code: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="Promo Codes Management"
        subtitle="Create and manage discount codes for subscriptions"
        dataMode="Admin"
        actions={
          <>
            <ThemeToggle />
            <button onClick={handleCreate} className="btn">
              Create Promo Code
            </button>
          </>
        }
      />

      {/* Promo Codes Table */}
      <DataTable
        data={promoCodes}
        columns={[
          {
            key: 'code',
            label: 'Code',
            render: (code) => (
              <>
                <b>{code.code}</b>
                {code.description && (
                  <div className="muted" style={{ fontSize: '11px', marginTop: '4px' }}>
                    {code.description}
                  </div>
                )}
              </>
            ),
          },
          {
            key: 'discount',
            label: 'Discount',
            render: (code) => (
              <b>{code.discountType === 'percent' ? `${code.discountValue}%` : `$${code.discountValue}`}</b>
            ),
          },
          {
            key: 'uses',
            label: 'Uses',
            render: (code) => (
              <span className="muted">
                {code.currentUses} {code.maxUses ? `/ ${code.maxUses}` : '/ ∞'}
              </span>
            ),
          },
          {
            key: 'validUntil',
            label: 'Valid Until',
            render: (code) => (
              <span className="muted">
                {code.validUntil ? new Date(code.validUntil).toLocaleDateString() : 'Never'}
              </span>
            ),
          },
          {
            key: 'status',
            label: 'Status',
            render: (code) => (
              <span className="chip">
                <span className={`dot ${code.isActive ? 'good' : ''}`} />
                {code.isActive ? 'Active' : 'Inactive'}
              </span>
            ),
          },
          {
            key: 'actions',
            label: 'Actions',
            render: (code) => (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  className="btn secondary"
                  style={{ padding: '7px 10px', fontSize: '11px' }}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEdit(code)
                  }}
                >
                  Edit
                </button>
                <button
                  className="btn secondary"
                  style={{ padding: '7px 10px', fontSize: '11px', color: 'var(--d)', borderColor: 'var(--d)' }}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(code.id)
                  }}
                >
                  Delete
                </button>
              </div>
            ),
          },
        ]}
        loading={loading}
        emptyMessage="No promo codes found"
        footerNote={`Showing ${promoCodes.length} promo codes`}
      />

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', margin: '18px' }}>
            <b style={{ fontSize: '18px', marginBottom: '14px', display: 'block' }}>
              {editingCode ? 'Edit Promo Code' : 'Create Promo Code'}
            </b>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="muted" style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}>Code</label>
                <input
                  type="text"
                  className="input"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="PROMO2024"
                  disabled={!!editingCode}
                />
              </div>

              <div>
                <label className="muted" style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}>Description</label>
                <input
                  type="text"
                  className="input"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>

              <div className="grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                <div>
                  <label className="muted" style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}>Discount Type</label>
                  <select
                    className="select"
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                  >
                    <option value="percent">Percent (%)</option>
                    <option value="amount">Amount ($)</option>
                  </select>
                </div>

                <div>
                  <label className="muted" style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}>Discount Value</label>
                  <input
                    type="number"
                    className="input"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div>
                <label className="muted" style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}>Max Uses (leave empty for unlimited)</label>
                <input
                  type="number"
                  className="input"
                  value={formData.maxUses ?? ''}
                  onChange={(e) => setFormData({ ...formData, maxUses: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="Unlimited"
                />
              </div>

              <div className="grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                <div>
                  <label className="muted" style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}>Valid From</label>
                  <input
                    type="date"
                    className="input"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                  />
                </div>

                <div>
                  <label className="muted" style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}>Valid Until (optional)</label>
                  <input
                    type="date"
                    className="input"
                    value={formData.validUntil || ''}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value || null })}
                  />
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  style={{ borderRadius: '4px' }}
                />
                <span className="muted" style={{ fontSize: '12px' }}>Active</span>
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '14px', marginTop: '18px' }}>
              <button
                className="btn secondary"
                onClick={() => {
                  setIsModalOpen(false)
                  setEditingCode(null)
                }}
              >
                Cancel
              </button>
              <button
                className="btn"
                onClick={handleSave}
                disabled={saving || !formData.code}
              >
                {saving ? 'Saving...' : editingCode ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}
