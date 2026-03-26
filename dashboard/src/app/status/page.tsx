'use client'

import Link from 'next/link'

const services = [
  { name: 'API', status: 'operational', uptime: '99.99%' },
  { name: 'Dashboard', status: 'operational', uptime: '99.98%' },
  { name: 'SDK Services', status: 'operational', uptime: '99.99%' },
  { name: 'Trace Ingestion', status: 'operational', uptime: '99.97%' },
  { name: 'Crash Reporting', status: 'operational', uptime: '99.99%' },
  { name: 'Remote Config', status: 'operational', uptime: '99.98%' },
]

const incidents = [
  {
    date: 'January 18, 2025',
    title: 'Scheduled Maintenance',
    status: 'resolved',
    description: 'Planned database maintenance completed successfully. No service interruption.',
    duration: '15 minutes'
  },
  {
    date: 'January 10, 2025',
    title: 'Elevated Latency',
    status: 'resolved',
    description: 'Brief period of elevated API response times due to increased traffic. Automatically scaled to handle load.',
    duration: '8 minutes'
  }
]

export default function StatusPage() {
  const allOperational = services.every(s => s.status === 'operational')

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <span className="text-xl font-bold text-gray-900">NivoStack</span>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/#features" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">Features</Link>
              <Link href="/#pricing" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">Pricing</Link>
              <Link href="/#integrations" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">Integrations</Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">Contact</Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">Sign in</Link>
              <Link href="/register" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 hover:-translate-y-0.5">Start Free</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-16">
        {/* Hero Section */}
        <div className={`py-20 ${allOperational ? 'bg-gradient-to-br from-green-500 via-green-600 to-green-700' : 'bg-gradient-to-br from-yellow-500 via-yellow-600 to-orange-600'}`}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex items-center justify-center mb-4">
              {allOperational ? (
                <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {allOperational ? 'All Systems Operational' : 'Some Systems Degraded'}
            </h1>
            <p className="text-xl text-white/80">
              Last updated: {new Date().toLocaleString()}
            </p>
          </div>
        </div>

        {/* Services Status */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Service Status</h2>
          <div className="space-y-4">
            {services.map((service, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${service.status === 'operational' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <span className="font-medium text-gray-900">{service.name}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">Uptime: {service.uptime}</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    service.status === 'operational' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {service.status === 'operational' ? 'Operational' : 'Degraded'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Uptime Chart Placeholder */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">90-Day Uptime</h2>
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-end space-x-1 h-24">
                {Array.from({ length: 90 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-green-500 rounded-t"
                    style={{ height: `${85 + Math.random() * 15}%` }}
                  ></div>
                ))}
              </div>
              <div className="flex justify-between mt-4 text-sm text-gray-500">
                <span>90 days ago</span>
                <span>Today</span>
              </div>
            </div>
          </div>

          {/* Recent Incidents */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Recent Incidents</h2>
            {incidents.length === 0 ? (
              <p className="text-gray-500">No incidents in the last 30 days.</p>
            ) : (
              <div className="space-y-4">
                {incidents.map((incident, index) => (
                  <div key={index} className="p-6 bg-white rounded-xl border border-gray-200">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{incident.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        incident.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {incident.status}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{incident.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{incident.date}</span>
                      <span>Duration: {incident.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Subscribe */}
          <div className="mt-12 p-6 bg-blue-50 rounded-xl border border-blue-200">
            <h3 className="font-semibold text-gray-900 mb-2">Stay Updated</h3>
            <p className="text-gray-600 text-sm mb-4">Subscribe to status updates and get notified when incidents occur.</p>
            <Link href="/contact" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              Subscribe to updates →
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
              <div className="col-span-2">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">N</span>
                  </div>
                  <span className="text-xl font-bold">NivoStack</span>
                </div>
                <p className="text-gray-400 text-sm max-w-xs">The complete mobile app testing and monitoring platform.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Product</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><Link href="/#features" className="hover:text-white transition-colors">Features</Link></li>
                  <li><Link href="/#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                  <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Legal</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                  <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-400">
              <p>© {new Date().getFullYear()} NivoStack. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
