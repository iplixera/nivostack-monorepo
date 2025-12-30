import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'NivoStack pricing plans - Start free forever, upgrade when ready.',
  alternates: {
    canonical: 'https://nivostack.com/pricing',
  },
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <a href="/" className="text-xl font-bold text-gray-900">NivoStack</a>
            <a href="/" className="text-gray-600 hover:text-gray-900">Back to Home</a>
          </div>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Pricing</h1>
        <p className="text-xl text-gray-600 mb-12">Coming soon - Pricing plans</p>
      </main>
    </div>
  )
}

