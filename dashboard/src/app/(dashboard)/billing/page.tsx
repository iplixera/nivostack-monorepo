'use client'

import { useAuth } from '@/components/AuthProvider'

export default function BillingPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Billing</h1>
        <p className="text-gray-400">Manage your payment method and billing information</p>
      </div>

      <div className="bg-gray-900 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Payment Method</h2>
        <div className="text-gray-400 mb-4">
          <p>No payment method on file.</p>
          <p className="text-sm mt-2">Payment methods will be available when paid plans launch.</p>
        </div>
        <button
          disabled
          className="px-4 py-2 bg-gray-700 text-gray-400 rounded cursor-not-allowed text-sm"
        >
          Add Payment Method (Coming Soon)
        </button>
      </div>

      <div className="bg-gray-900 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Billing Address</h2>
        <div className="text-gray-400">
          <p>No billing address on file.</p>
          <p className="text-sm mt-2">Billing address will be required for paid plans.</p>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Billing Email</h2>
        <div className="text-gray-300">
          {user?.email || 'Not available'}
        </div>
        <p className="text-sm text-gray-400 mt-2">
          Invoices and billing notifications will be sent to this email address.
        </p>
      </div>
    </div>
  )
}

