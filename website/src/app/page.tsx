import type { Metadata } from 'next'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Button from '@/components/Button'
import FeatureCard from '@/components/FeatureCard'
import CTASection from '@/components/CTASection'
import StructuredData from '@/components/StructuredData'
import { BRAND, DOMAINS } from '@/lib/branding'
import { FEATURE_CATEGORIES, PLATFORMS } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Mobile App Monitoring & Configuration Platform',
  description: BRAND.description,
  alternates: {
    canonical: DOMAINS.marketing,
  },
  openGraph: {
    title: `${BRAND.name} - ${BRAND.tagline}`,
    description: BRAND.description,
    url: DOMAINS.marketing,
    siteName: BRAND.name,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: BRAND.name,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
}

// All Features List
const ALL_FEATURES = [
  {
    category: 'monitoring',
    icon: '⚡',
    title: 'API Tracing',
    description: 'Monitor every HTTP request/response with full headers, bodies, status codes, and response times in real-time. Track API costs per endpoint.',
  },
  {
    category: 'monitoring',
    icon: '📝',
    title: 'Remote Logging',
    description: 'Stream logs from any device with full context. Filter by level, search by content, and debug issues faster with source code location tracking.',
  },
  {
    category: 'debugging',
    icon: '💥',
    title: 'Crash Reports',
    description: 'Catch crashes with full stack traces. Know exactly what went wrong, on which device, and when. Automatic error detection and alerting.',
  },
  {
    category: 'monitoring',
    icon: '📊',
    title: 'Session Timeline',
    description: 'Track complete user sessions with screen flow, API calls, and logs. Understand user journeys with chronological timeline view.',
  },
  {
    category: 'configuration',
    icon: '🎛️',
    title: 'Feature Flags',
    description: 'Remote feature toggles and SDK control. Enable/disable features without app updates. Master kill switch for complete SDK control.',
  },
  {
    category: 'configuration',
    icon: '⚙️',
    title: 'Remote Configuration',
    description: 'Manage app configurations remotely. Key-value store with multiple types (string, integer, boolean, JSON, images). No deployments needed.',
  },
  {
    category: 'configuration',
    icon: '🌐',
    title: 'Localization',
    description: 'Manage translations remotely with multiple languages, RTL support, translation memory, and OTA updates. Review workflow included.',
  },
  {
    category: 'analytics',
    icon: '📈',
    title: 'Cost Analytics',
    description: 'Track API costs per endpoint, device, or session. Understand usage patterns and optimize spending with detailed breakdowns.',
  },
  {
    category: 'debugging',
    icon: '🔍',
    title: 'Device Debug Mode',
    description: 'Selective tracking for specific devices in production. Enable debug mode for individual devices without affecting others.',
  },
  {
    category: 'monitoring',
    icon: '🚨',
    title: 'Smart Monitoring',
    description: 'Proactive error detection with custom alerts. Monitor status codes, body-based errors, and get multi-channel notifications.',
  },
  {
    category: 'configuration',
    icon: '🔄',
    title: 'Force Update & Maintenance',
    description: 'Control app access remotely. Force updates for outdated versions and show maintenance screens when backend is down.',
  },
  {
    category: 'analytics',
    icon: '🔄',
    title: 'User Flow Analytics',
    description: 'Visualize how users navigate through your app. Screen-to-screen patterns, API calls, and success/error rates per journey.',
  },
]

// Stats Data
const STATS = [
  { value: '93%', label: 'Faster SDK Init', description: 'Performance improvement' },
  { value: '290ms', label: 'Average Init Time', description: 'From 4.3s to 290ms' },
  { value: '99.9%', label: 'Uptime', description: 'Reliable infrastructure' },
  { value: '24/7', label: 'Support', description: 'Always here to help' },
]

// Testimonials
const TESTIMONIALS = [
  {
    name: 'Sarah Chen',
    role: 'CTO, TechStartup',
    image: '👩‍💼',
    quote: 'NivoStack replaced 3 expensive tools we were using. The unified dashboard saves us hours every week, and the cost savings are incredible.',
  },
  {
    name: 'Michael Rodriguez',
    role: 'Lead Mobile Developer',
    image: '👨‍💻',
    quote: 'The device debug mode is a game-changer. We can now debug production issues without overwhelming our system with data from all users.',
  },
  {
    name: 'Emily Johnson',
    role: 'Product Manager',
    image: '👩‍💼',
    quote: 'Remote configuration and feature flags let us ship faster. We can test features with specific users and roll out gradually without deployments.',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <StructuredData />
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Debug Mobile Apps
              <br />
              <span className="text-blue-600 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Remotely
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              {BRAND.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button href={`${DOMAINS.studio}/register`} size="lg">
                Start Free Forever
              </Button>
              <Button href="/features" variant="outline" size="lg">
                Learn More
              </Button>
            </div>
            <p className="mt-4 text-sm text-gray-500">No credit card required • Setup in 2 minutes</p>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-16 rounded-2xl shadow-2xl border border-gray-200 overflow-hidden bg-white animate-slide-up">
            <div className="bg-gray-100 px-4 py-3 flex items-center space-x-2 border-b border-gray-200">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="ml-4 text-sm text-gray-600">studio.nivostack.com</span>
            </div>
            <div className="p-8 bg-gradient-to-br from-gray-50 to-white">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                  <div className="text-2xl font-bold text-gray-900 mb-2">1,234</div>
                  <div className="text-sm text-gray-600">Active Devices</div>
                  <div className="mt-2 h-2 bg-blue-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full w-3/4 animate-progress"></div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                  <div className="text-2xl font-bold text-gray-900 mb-2">45.2K</div>
                  <div className="text-sm text-gray-600">API Requests Today</div>
                  <div className="mt-2 h-2 bg-green-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-600 rounded-full w-2/3 animate-progress"></div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                  <div className="text-2xl font-bold text-gray-900 mb-2">98.5%</div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                  <div className="mt-2 h-2 bg-purple-100 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-600 rounded-full w-[98.5%] animate-progress"></div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Recent API Traces</h3>
                  <span className="text-sm text-gray-500">Live</span>
                </div>
                <div className="space-y-3">
                  {[
                    { method: 'GET', endpoint: '/api/users', status: 200, time: '45ms' },
                    { method: 'POST', endpoint: '/api/orders', status: 201, time: '120ms' },
                    { method: 'GET', endpoint: '/api/products', status: 200, time: '32ms' },
                  ].map((trace, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          trace.method === 'GET' ? 'bg-blue-100 text-blue-800' :
                          trace.method === 'POST' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {trace.method}
                        </span>
                        <span className="text-sm text-gray-700 font-mono">{trace.endpoint}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`text-sm font-medium ${
                          trace.status === 200 ? 'text-green-600' : 'text-blue-600'
                        }`}>
                          {trace.status}
                        </span>
                        <span className="text-sm text-gray-500">{trace.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, idx) => (
              <div key={idx} className="text-center animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">{stat.value}</div>
                <div className="text-lg font-semibold text-gray-900 mb-1">{stat.label}</div>
                <div className="text-sm text-gray-600">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need in One Platform
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Replace multiple expensive tools with one unified, affordable solution
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ALL_FEATURES.map((feature, idx) => (
              <FeatureCard
                key={idx}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={idx * 50}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Platform Support */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Works with Your Stack
            </h2>
            <p className="text-xl text-gray-600">
              Native SDKs for all major mobile platforms
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            {PLATFORMS.map((platform, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
              >
                <div className="text-4xl mb-3">{platform.icon}</div>
                <div className="font-semibold text-gray-900">{platform.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Loved by Developers
            </h2>
            <p className="text-xl text-gray-600">
              See what teams are saying about NivoStack
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial, idx) => (
              <div
                key={idx}
                className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl mr-4">
                    {testimonial.image}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed italic">&ldquo;{testimonial.quote}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <CTASection />

      <Footer />
    </div>
  )
}
