import type { Metadata } from 'next'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import FeatureCard from '@/components/FeatureCard'
import CTASection from '@/components/CTASection'
import { BRAND, DOMAINS } from '@/lib/branding'
import { FEATURE_CATEGORIES, PLATFORMS } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Features - Complete Mobile App Monitoring & Configuration',
  description: 'Discover all the features of NivoStack - API tracing, crash reporting, remote logging, session tracking, feature flags, localization, and more.',
  alternates: {
    canonical: `${DOMAINS.marketing}/features`,
  },
}

const FEATURES_BY_CATEGORY = {
  monitoring: [
    {
      icon: '⚡',
      title: 'API Tracing',
      description: 'Monitor every HTTP request/response with full headers, bodies, status codes, response times, and errors in real-time. Track API costs per endpoint with configurable cost models.',
      details: [
        'Full request/response capture',
        'Status code and duration tracking',
        'Screen context tracking',
        'Network type and geo-location',
        'Cost analytics per endpoint',
        'Wildcard pattern matching',
      ],
    },
    {
      icon: '📝',
      title: 'Remote Logging',
      description: 'Stream logs from any device with full context. Filter by level, search by content, and debug issues faster with source code location tracking.',
      details: [
        'Six log levels: verbose, debug, info, warn, error, assert',
        'Tag-based organization',
        'Source code location tracking',
        'Screen and thread context',
        'Full-text search',
        'Batch submission support',
      ],
    },
    {
      icon: '📊',
      title: 'Session Timeline',
      description: 'Track complete user sessions with screen flow, API calls, and logs. Understand user journeys with chronological timeline view and interactive flow diagrams.',
      details: [
        'Chronological timeline view',
        'Screen navigation tracking',
        'API calls with request/response details',
        'Logs with source location',
        'Interactive flow diagrams',
        'Success/error rates per transition',
      ],
    },
    {
      icon: '🚨',
      title: 'Smart Monitoring & Alerts',
      description: 'Proactive error detection with custom alerts. Monitor status codes, body-based errors, and get multi-channel notifications.',
      details: [
        'One-click monitoring from traces',
        'Custom status code monitoring',
        'Body-based error detection',
        'Multi-channel notifications',
        'Occurrence tracking',
        'Resolution workflow',
      ],
    },
  ],
  debugging: [
    {
      icon: '💥',
      title: 'Crash Reports',
      description: 'Catch crashes with full stack traces. Know exactly what went wrong, on which device, and when. Automatic error detection and alerting.',
      details: [
        'Full stack trace capture',
        'Device metadata tracking',
        'Automatic crash detection',
        'Error grouping and analysis',
        'Timeline of events before crash',
      ],
    },
    {
      icon: '🔍',
      title: 'Device Debug Mode',
      description: 'Selective tracking for specific devices in production. Enable debug mode for individual devices without affecting others. Perfect for debugging user-reported issues.',
      details: [
        'Device code identification',
        'User association',
        'Selective tracking',
        'Auto-expiry options',
        'Production-safe debugging',
      ],
    },
  ],
  configuration: [
    {
      icon: '🎛️',
      title: 'Feature Flags',
      description: 'Remote feature toggles and SDK control. Enable/disable features without app updates. Master kill switch for complete SDK control.',
      details: [
        'Master SDK kill switch',
        'Per-feature toggles',
        '10+ feature flags',
        'Remote control',
        'No app updates needed',
      ],
    },
    {
      icon: '⚙️',
      title: 'Remote Configuration',
      description: 'Manage app configurations remotely. Key-value store with multiple types (string, integer, boolean, JSON, images). No deployments needed.',
      details: [
        'Multiple value types',
        'Category organization',
        'Version tracking',
        'Image upload support',
        'Instant updates',
      ],
    },
    {
      icon: '🌐',
      title: 'Localization',
      description: 'Manage translations remotely with multiple languages, RTL support, translation memory, and OTA updates. Review workflow included.',
      details: [
        'Multiple languages',
        'RTL support',
        'Translation memory',
        'OTA updates',
        'Review workflow',
        'Bulk operations',
      ],
    },
    {
      icon: '🔄',
      title: 'Force Update & Maintenance',
      description: 'Control app access remotely. Force updates for outdated versions and show maintenance screens when backend is down.',
      details: [
        'Minimum version enforcement',
        'Customizable messages',
        'Platform-specific store URLs',
        'Maintenance mode',
        'Countdown timers',
      ],
    },
  ],
  analytics: [
    {
      icon: '📈',
      title: 'Cost Analytics',
      description: 'Track API costs per endpoint, device, or session. Understand usage patterns and optimize spending with detailed breakdowns.',
      details: [
        'Cost per endpoint',
        'Cost by device',
        'Session-based costs',
        'Usage trends',
        'Optimization insights',
      ],
    },
    {
      icon: '🔄',
      title: 'User Flow Analytics',
      description: 'Visualize how users navigate through your app. Screen-to-screen patterns, API calls, and success/error rates per journey.',
      details: [
        'Screen navigation patterns',
        'API calls between screens',
        'Success/error rates',
        'Cost per journey',
        'Flow visualization',
      ],
    },
  ],
}

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Powerful Features for
            <br />
            <span className="text-blue-600">Modern Mobile Apps</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Everything you need to monitor, debug, and configure your mobile applications—all in one unified platform.
          </p>
        </div>
      </section>

      {/* Features by Category */}
      {FEATURE_CATEGORIES.map((category) => {
        const features = FEATURES_BY_CATEGORY[category.id as keyof typeof FEATURES_BY_CATEGORY] || []
        if (features.length === 0) return null

        return (
          <section key={category.id} className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <div className="text-4xl mb-4">{category.icon}</div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {category.name}
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  {category.description}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-50 rounded-xl p-8 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-start space-x-4 mb-4">
                      <div className="text-3xl">{feature.icon}</div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                        <p className="text-gray-600 mb-4">{feature.description}</p>
                      </div>
                    </div>
                    <ul className="space-y-2">
                      {feature.details.map((detail, detailIdx) => (
                        <li key={detailIdx} className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          <span className="text-gray-700">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )
      })}

      {/* Platform Support */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Works with Your Stack
            </h2>
            <p className="text-xl text-gray-600">
              Native SDKs for all major mobile platforms
            </p>
          </div>
          <div className="grid md:grid-cols-5 gap-6">
            {PLATFORMS.map((platform, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 text-center"
              >
                <div className="text-4xl mb-3">{platform.icon}</div>
                <div className="font-semibold text-gray-900">{platform.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Replace Multiple Tools
            </h2>
            <p className="text-xl text-gray-600">
              NivoStack replaces expensive SaaS tools with one unified platform
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">What You Get</h3>
                <ul className="space-y-3">
                  {[
                    'API Monitoring (Datadog alternative)',
                    'Crash Reporting (Sentry alternative)',
                    'Remote Config (Firebase alternative)',
                    'Feature Flags (LaunchDarkly alternative)',
                    'Analytics (MixPanel alternative)',
                    'Localization Management',
                    'Session Tracking',
                    'Device Management',
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">What You Save</h3>
                <ul className="space-y-3">
                  {[
                    'No need for multiple subscriptions',
                    'Unified dashboard and data',
                    'Lower total cost ($49-149/month vs $500-2000+)',
                    'Simpler integrations',
                    'Single API key',
                    'Consistent data format',
                    'One support team',
                    'Unified billing',
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-blue-500 mr-2">💰</span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CTASection />
      <Footer />
    </div>
  )
}
