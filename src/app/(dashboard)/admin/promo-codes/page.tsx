'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { api } from '@/lib/api'

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
  const router = useRouter()
  const { token } = useAuth()
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCode, setEditingCode] = useState<PromoCode | null>(null)
  const [saving, setSaving] = useState(false)

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
    setIsModalOpen(true)
  }

  const handleEdit = (code: PromoCode) => {
    setEditingCode(code)
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

  const handleSave = async (data: any) => {
    if (!token) return
    setSaving(true)
    try {
      if (editingCode) {
        await api.admin.updatePromoCode(editingCode.id, data, token)
        alert('Promo code updated successfully!')
      } else {
        await api.admin.createPromoCode(data, token)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400">Loading promo codes...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Promo Codes Management</h1>
          <p className="text-gray-400">Create and manage discount codes for subscriptions</p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
        >
          + Create Promo Code
        </button>
      </div>

      <div className="bg-gray-900 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Discount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Uses</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Valid Until</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {promoCodes.map((code) => (
                <tr key={code.id} className="hover:bg-gray-800/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{code.code}</div>
                    {code.description && (
                      <div className="text-xs text-gray-400">{code.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {code.discountType === 'percent' ? `${code.discountValue}%` : `$${code.discountValue}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {code.currentUses} {code.maxUses ? `/ ${code.maxUses}` : '/ ∞'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {code.validUntil ? new Date(code.validUntil).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      code.isActive
                        ? 'bg-green-900/30 text-green-400'
                        : 'bg-red-900/30 text-red-400'
                    }`}>
                      {code.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(code)}
                        className="text-indigo-400 hover:text-indigo-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(code.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {promoCodes.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No promo codes found. Create one to get started.
          </div>
        )}
      </div>

      {isModalOpen && (
        <PromoCodeModal
          code={editingCode}
          onSave={handleSave}
          onClose={() => {
            setIsModalOpen(false)
            setEditingCode(null)
          }}
          saving={saving}
        />
      )}
    </div>
  )
}

function PromoCodeModal({
  code,
  onSave,
  onClose,
  saving,
}: {
  code: PromoCode | null
  onSave: (data: any) => void
  onClose: () => void
  saving: boolean
}) {
  const [formData, setFormData] = useState({
    code: code?.code || '',
    description: code?.description || '',
    discountType: code?.discountType || 'percent',
    discountValue: code?.discountValue || 0,
    maxUses: code?.maxUses || null,
    validFrom: code?.validFrom ? new Date(code.validFrom).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    validUntil: code?.validUntil ? new Date(code.validUntil).toISOString().split('T')[0] : '',
    applicablePlans: code?.applicablePlans || [],
    minPlanPrice: code?.minPlanPrice || null,
    isActive: code?.isActive !== undefined ? code.isActive : true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      maxUses: formData.maxUses || null,
      validUntil: formData.validUntil || null,
      minPlanPrice: formData.minPlanPrice || null,
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-800">
          <h2 className="text-2xl font-bold text-white">{code ? 'Edit Promo Code' : 'Create Promo Code'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Code *</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                required
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                placeholder="SUMMER2024"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                placeholder="Summer promotion"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Discount Type *</label>
              <select
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                required
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
              >
                <option value="percent">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Discount Value * {formData.discountType === 'percent' ? '(0-100%)' : '($)'}
              </label>
              <input
                type="number"
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
                required
                min="0"
                max={formData.discountType === 'percent' ? 100 : undefined}
                step={formData.discountType === 'percent' ? 1 : 0.01}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Max Uses (leave empty for unlimited)</label>
              <input
                type="number"
                value={formData.maxUses || ''}
                onChange={(e) => setFormData({ ...formData, maxUses: e.target.value ? parseInt(e.target.value, 10) : null })}
                min="1"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                placeholder="Unlimited"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Valid From *</label>
              <input
                type="date"
                value={formData.validFrom}
                onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                required
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Valid Until (leave empty for never expires)</label>
              <input
                type="date"
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Min Plan Price ($)</label>
              <input
                type="number"
                value={formData.minPlanPrice || ''}
                onChange={(e) => setFormData({ ...formData, minPlanPrice: e.target.value ? parseFloat(e.target.value) : null })}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                placeholder="No minimum"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-gray-300">
                Active
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md font-medium"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium disabled:opacity-50"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Promo Code'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

