'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { api } from '@/lib/api'
import Link from 'next/link'

type PaymentMethod = {
  id: string
  stripePaymentMethodId: string
  type: string
  last4: string | null
  brand: string | null
  expMonth: number | null
  expYear: number | null
  isDefault: boolean
  createdAt: string
  stripe?: {
    brand?: string
    last4?: string
    expMonth?: number
    expYear?: number
  }
}

export default function PaymentMethodsPage() {
  const { token } = useAuth()
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [addingMethod, setAddingMethod] = useState(false)

  useEffect(() => {
    if (!token) return
    loadPaymentMethods()
  }, [token])

  const loadPaymentMethods = async () => {
    try {
      setLoading(true)
      const data = await api.paymentMethods.list(token!)
      setPaymentMethods(data.paymentMethods || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payment methods')
    } finally {
      setLoading(false)
    }
  }

  const handleSetDefault = async (id: string) => {
    try {
      await api.paymentMethods.update(id, { isDefault: true }, token!)
      await loadPaymentMethods()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set default payment method')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this payment method?')) {
      return
    }

    try {
      await api.paymentMethods.delete(id, token!)
      await loadPaymentMethods()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete payment method')
    }
  }

  const getCardBrandIcon = (brand: string | null | undefined) => {
    if (!brand) return '💳'
    const brandLower = brand.toLowerCase()
    if (brandLower.includes('visa')) return '💳'
    if (brandLower.includes('mastercard')) return '💳'
    if (brandLower.includes('amex') || brandLower.includes('american')) return '💳'
    return '💳'
  }

  const formatCardNumber = (last4: string | null) => {
    if (!last4) return '•••• •••• •••• ••••'
    return `•••• •••• •••• ${last4}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400">Loading payment methods...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Payment Methods</h1>
          <p className="text-gray-400">Manage your payment methods for subscription billing</p>
        </div>
        <Link
          href="/subscription"
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          ← Back to Subscription
        </Link>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-600 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Add Payment Method Section */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <h2 className="text-xl font-semibold text-white mb-4">Add Payment Method</h2>
        <div className="bg-blue-900/20 border border-blue-600 text-blue-300 px-4 py-3 rounded-lg mb-4">
          <p className="text-sm">
            <strong>Note:</strong> Payment method integration with Stripe Elements will be added here.
            For now, payment methods are managed through the Stripe Dashboard or API.
          </p>
        </div>
        <button
          onClick={() => {
            alert('Stripe Elements integration coming soon. Payment methods can be added via Stripe Dashboard.')
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          + Add Payment Method
        </button>
      </div>

      {/* Payment Methods List */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-white">Saved Payment Methods</h2>
        </div>

        {paymentMethods.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-gray-400 mb-4">No payment methods found</div>
            <p className="text-sm text-gray-500">
              Add a payment method to enable automatic subscription renewals
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {paymentMethods.map((method) => (
              <div key={method.id} className="p-6 hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{getCardBrandIcon(method.brand || method.stripe?.brand)}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">
                          {formatCardNumber(method.last4 || method.stripe?.last4 || null)}
                        </span>
                        {method.isDefault && (
                          <span className="px-2 py-1 text-xs bg-blue-900/30 text-blue-400 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        {method.brand || method.stripe?.brand || 'Card'} • Expires{' '}
                        {method.expMonth || method.stripe?.expMonth
                          ? `${String(method.expMonth || method.stripe?.expMonth).padStart(2, '0')}/${method.expYear || method.stripe?.expYear}`
                          : 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Added {new Date(method.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!method.isDefault && (
                      <button
                        onClick={() => handleSetDefault(method.id)}
                        className="px-3 py-1 text-sm bg-gray-800 hover:bg-gray-700 text-white rounded transition-colors"
                      >
                        Set as Default
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(method.id)}
                      className="px-3 py-1 text-sm bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-2">About Payment Methods</h3>
        <ul className="text-sm text-gray-400 space-y-2 list-disc list-inside">
          <li>Your default payment method will be used for automatic subscription renewals</li>
          <li>You can add multiple payment methods and switch between them</li>
          <li>Payment methods are securely stored by Stripe</li>
          <li>If payment fails, you'll have a 7-day grace period to update your payment method</li>
        </ul>
      </div>
    </div>
  )
}

