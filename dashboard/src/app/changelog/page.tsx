import Link from 'next/link'

const releases = [
  {
    version: '2.1.0',
    date: 'January 20, 2025',
    type: 'Feature',
    changes: [
      'Added date range filtering to API traces view',
      'New summary statistics cards for trace analytics',
      'Improved status code filtering with backend support',
      'Environment filter now supports server-side pagination'
    ]
  },
  {
    version: '2.0.0',
    date: 'January 15, 2025',
    type: 'Major',
    changes: [
      'Complete dashboard redesign with new light theme',
      'New homepage with feature showcase',
      'Improved onboarding flow for new users',
      'Enhanced API trace visualization',
      'Real-time crash reporting dashboard'
    ]
  },
  {
    version: '1.5.2',
    date: 'January 5, 2025',
    type: 'Fix',
    changes: [
      'Fixed pagination issue when filtering traces',
      'Resolved memory leak in SDK automatic screen tracking',
      'Improved error handling for network failures'
    ]
  },
  {
    version: '1.5.0',
    date: 'December 20, 2024',
    type: 'Feature',
    changes: [
      'Added Flutter SDK support',
      'New remote configuration management',
      'Localization and translation features',
      'API mocking capabilities for development'
    ]
  },
  {
    version: '1.4.0',
    date: 'December 1, 2024',
    type: 'Feature',
    changes: [
      'Introduced business configuration module',
      'Team collaboration features',
      'Project sharing and permissions',
      'Webhook notifications for events'
    ]
  },
  {
    version: '1.3.0',
    date: 'November 15, 2024',
    type: 'Feature',
    changes: [
      'Added session timeline tracking',
      'Device registration and management',
      'Build versioning support',
      'Debug mode for test devices'
    ]
  }
]

export default function ChangelogPage() {
  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'Major': return 'bg-purple-100 text-purple-700'
      case 'Feature': return 'bg-blue-100 text-blue-700'
      case 'Fix': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

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
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Changelog</h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Stay up to date with the latest features, improvements, and fixes
            </p>
          </div>
        </div>

        {/* Changelog Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="space-y-12">
            {releases.map((release, index) => (
              <div key={index} className="relative pl-8 border-l-2 border-gray-200">
                <div className="absolute -left-2 top-0 w-4 h-4 bg-blue-600 rounded-full"></div>
                <div className="mb-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <h2 className="text-2xl font-bold text-gray-900">v{release.version}</h2>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getTypeBadgeColor(release.type)}`}>
                      {release.type}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm">{release.date}</p>
                </div>
                <ul className="space-y-2">
                  {release.changes.map((change, changeIndex) => (
                    <li key={changeIndex} className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600">{change}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
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
