'use client'

import { useAuth } from '@/components/AuthProvider'

export default function InvoicesPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Invoices</h1>
        <p className="text-gray-400">View and download your invoice history</p>
      </div>

      <div className="bg-gray-900 rounded-lg p-6">
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-semibold text-white">No Invoices</h3>
          <p className="mt-2 text-gray-400">
            You don't have any invoices yet. Invoices will appear here once you upgrade to a paid plan.
          </p>
          <div className="mt-6">
            <p className="text-sm text-gray-500">
              Currently on Free Plan - No invoices generated
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

