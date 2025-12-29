import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Mobile App Monitoring & Configuration Platform',
  description: 'Complete mobile app monitoring and configuration platform. Track API calls, monitor logs, catch crashes, manage configurations, and mock APIs—all from one dashboard.',
  alternates: {
    canonical: 'https://nivostack.com',
  },
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <span className="text-xl font-bold text-gray-900">NivoStack</span>
            <div className="space-x-4">
              <Link href="/features" className="text-gray-600 hover:text-gray-900">
                Features
              </Link>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900">
                Pricing
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-900">
                About
              </Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900">
                Contact
              </Link>
              <Link
                href="https://studio.nivostack.com/login"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Debug Mobile Apps
            <br />
            <span className="text-blue-600">Remotely</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Complete mobile app monitoring and configuration platform. Track API calls, monitor logs, catch crashes, manage configurations, and mock APIs—all from one dashboard.
          </p>
          <div className="space-x-4">
            <Link
              href="https://studio.nivostack.com/register"
              className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Start Free Forever
            </Link>
            <Link
              href="/features"
              className="inline-block px-8 py-3 bg-white hover:bg-gray-50 text-gray-900 font-medium rounded-lg border border-gray-300 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          <div className="p-6 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4 text-2xl">
              ⚡
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">API Tracing</h3>
            <p className="text-gray-600 text-sm">
              Monitor every network request with status codes, response times, and errors in real-time.
            </p>
          </div>
          <div className="p-6 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-4 text-2xl">
              📝
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Remote Logging</h3>
            <p className="text-gray-600 text-sm">
              Stream logs from any device. Filter by level, search by content, and debug issues faster.
            </p>
          </div>
          <div className="p-6 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-lg flex items-center justify-center mb-4 text-2xl">
              💥
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Crash Reports</h3>
            <p className="text-gray-600 text-sm">
              Catch crashes with full stack traces. Know exactly what went wrong and on which device.
            </p>
          </div>
          <div className="p-6 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center mb-4 text-2xl">
              📊
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Session Timeline</h3>
            <p className="text-gray-600 text-sm">
              Track user sessions with screen flow, API calls, and logs. Understand user journeys.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-gray-900 font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <Link href="/features" className="hover:text-gray-900">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-gray-900">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-gray-900 font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <Link href="/about" className="hover:text-gray-900">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-gray-900">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-gray-900 font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <Link href="/privacy" className="hover:text-gray-900">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-gray-900">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-gray-900 font-semibold mb-4">NivoStack</h3>
              <p className="text-gray-600 text-sm">
                Mobile app monitoring and configuration platform for iOS and Android.
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
            © 2024 NivoStack. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

