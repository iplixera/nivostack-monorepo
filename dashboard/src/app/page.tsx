'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

// SDK Code Snippets
const sdkCodeSnippets: Record<string, { filename: string; code: string }> = {
  flutter: {
    filename: 'main.dart',
    code: `import 'package:nivostack/nivostack.dart';

void main() async {
  // Initialize NivoStack
  await NivoStack.init(
    apiKey: 'your-api-key',
    endpoint: 'https://ingest.nivostack.com',
  );

  // That's it! API calls are tracked automatically.
  runApp(MyApp());
}`
  },
  android: {
    filename: 'Application.kt',
    code: `import com.nivostack.sdk.NivoStack

class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()

        // Initialize NivoStack
        NivoStack.init(
            context = this,
            apiKey = "your-api-key",
            endpoint = "https://ingest.nivostack.com"
        )

        // Enable automatic screen tracking
        registerActivityLifecycleCallbacks(
            NivoStackLifecycleObserver()
        )
    }
}`
  },
  ios: {
    filename: 'AppDelegate.swift',
    code: `import NivoStack

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {

        // Initialize NivoStack
        NivoStack.shared.initialize(
            apiKey: "your-api-key",
            endpoint: "https://ingest.nivostack.com"
        )

        return true
    }
}`
  },
  react: {
    filename: 'App.tsx',
    code: `import { NivoStack } from '@nivostack/react-native';

// Initialize NivoStack in your app entry point
NivoStack.init({
  apiKey: 'your-api-key',
  endpoint: 'https://ingest.nivostack.com',
});

export default function App() {
  return (
    <NavigationContainer>
      {/* Your app content */}
    </NavigationContainer>
  );
}`
  },
  nextjs: {
    filename: 'instrumentation.ts',
    code: `import { NivoStack } from '@nivostack/nextjs';

export async function register() {
  // Initialize NivoStack for server-side monitoring
  NivoStack.init({
    apiKey: process.env.NIVOSTACK_API_KEY!,
    endpoint: 'https://ingest.nivostack.com',
    environment: process.env.NODE_ENV,
  });
}

// Wrap your API routes for automatic tracing
// export const GET = NivoStack.withTracing(handler);`
  }
}

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState('flutter')

  useEffect(() => {
    setIsVisible(true)
  }, [])

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
              <Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">Features</Link>
              <Link href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">Pricing</Link>
              <Link href="#integrations" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">Integrations</Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">Contact</Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 hover:-translate-y-0.5"
              >
                Start Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Debug Mobile Apps<br />
              <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Remotely</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Complete mobile app monitoring and configuration platform. Track API calls, monitor logs,
              catch crashes, manage configurations, and mock APIs—all from one dashboard.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <Link
                href="/register"
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 hover:-translate-y-0.5"
              >
                Start Free Forever
              </Link>
              <Link
                href="#features"
                className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-all border-2 border-gray-200 hover:border-gray-300"
              >
                Learn More
              </Link>
            </div>
            <p className="text-sm text-gray-500">
              No credit card required • Setup in 2 minutes
            </p>
          </div>

          {/* Dashboard Mockup */}
          <div className={`mt-16 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              {/* Browser Chrome */}
              <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-white rounded-lg px-4 py-1.5 text-sm text-gray-500 border border-gray-200 max-w-md mx-auto">
                    studio.nivostack.com
                  </div>
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="p-6 bg-gray-900">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <StatCard
                    label="Active Devices"
                    value="1,234"
                    change="+12%"
                    color="blue"
                    progress={78}
                  />
                  <StatCard
                    label="API Requests Today"
                    value="45.2K"
                    change="+8%"
                    color="green"
                    progress={65}
                  />
                  <StatCard
                    label="Success Rate"
                    value="98.5%"
                    change="+0.3%"
                    color="emerald"
                    progress={98}
                  />
                </div>

                {/* Recent API Traces */}
                <div className="bg-gray-800 rounded-xl p-4">
                  <h3 className="text-white font-semibold mb-4">Recent API Traces</h3>
                  <div className="space-y-2">
                    <TraceRow method="GET" endpoint="/api/users/profile" status={200} time="45ms" />
                    <TraceRow method="POST" endpoint="/api/orders/create" status={201} time="128ms" />
                    <TraceRow method="GET" endpoint="/api/products?category=electronics" status={200} time="89ms" />
                    <TraceRow method="PUT" endpoint="/api/cart/update" status={200} time="67ms" />
                    <TraceRow method="GET" endpoint="/api/notifications" status={304} time="12ms" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features to monitor, debug, and configure your mobile applications remotely.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <FeatureCard icon="api" title="API Tracing" description="Monitor every network request with status codes, response times, and detailed payloads in real-time." delay={0} />
            <FeatureCard icon="logs" title="Remote Logging" description="Stream logs from any device. Filter by level, search by content, and debug issues faster." delay={50} />
            <FeatureCard icon="crash" title="Crash Reports" description="Catch crashes with full stack traces. Know exactly what went wrong and on which device." delay={100} />
            <FeatureCard icon="timeline" title="Session Timeline" description="Track user sessions with screen flow, API calls, and logs. Understand user journeys." delay={150} />
            <FeatureCard icon="flags" title="Feature Flags" description="Toggle features remotely without app updates. A/B test with confidence." delay={200} />
            <FeatureCard icon="config" title="Remote Config" description="Update app configurations instantly. No app store approval needed." delay={250} />
            <FeatureCard icon="globe" title="Localization" description="Manage translations across languages. Update content without releases." delay={300} />
            <FeatureCard icon="analytics" title="Cost Analytics" description="Track API costs and optimize spending with detailed breakdowns." delay={350} />
            <FeatureCard icon="debug" title="Device Debug" description="Enable debug mode for specific devices. Perfect for production debugging." delay={400} />
            <FeatureCard icon="monitor" title="Smart Monitoring" description="Get alerts when things go wrong. Automated anomaly detection." delay={450} />
            <FeatureCard icon="update" title="Force Update" description="Push critical updates to users. Maintenance mode support." delay={500} />
            <FeatureCard icon="flow" title="User Flows" description="Visualize user journeys. Identify drop-offs and optimize conversion." delay={550} />
          </div>
        </div>
      </section>

      {/* Works with Your Stack */}
      <section id="integrations" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Works with Your Stack
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Native SDKs for all major mobile platforms. Integrate in minutes.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <PlatformCard
              platform="flutter"
              name="Flutter"
              isSelected={selectedPlatform === 'flutter'}
              onClick={() => setSelectedPlatform('flutter')}
            />
            <PlatformCard
              platform="android"
              name="Android"
              isSelected={selectedPlatform === 'android'}
              onClick={() => setSelectedPlatform('android')}
            />
            <PlatformCard
              platform="ios"
              name="iOS"
              isSelected={selectedPlatform === 'ios'}
              onClick={() => setSelectedPlatform('ios')}
            />
            <PlatformCard
              platform="react"
              name="React Native"
              isSelected={selectedPlatform === 'react'}
              onClick={() => setSelectedPlatform('react')}
            />
            <PlatformCard
              platform="nextjs"
              name="Next.js"
              isSelected={selectedPlatform === 'nextjs'}
              onClick={() => setSelectedPlatform('nextjs')}
            />
          </div>

          {/* Code Example */}
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
              <div className="px-4 py-3 bg-gray-800 border-b border-gray-700 flex items-center">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <span className="ml-4 text-gray-400 text-sm font-mono">{sdkCodeSnippets[selectedPlatform].filename}</span>
              </div>
              <pre className="p-6 text-sm text-gray-300 overflow-x-auto">
                <code>{sdkCodeSnippets[selectedPlatform].code}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Start free forever. Upgrade when you need more.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PricingCard
              name="Free"
              price="$0"
              period="forever"
              description="Perfect for getting started"
              features={[
                "1,000 API traces/month",
                "10,000 logs/month",
                "100 crash reports/month",
                "30-day data retention",
                "1 project",
                "Community support"
              ]}
              ctaText="Start Free"
              ctaLink="/register"
              highlighted={false}
            />
            <PricingCard
              name="Pro"
              price="$29"
              period="/month"
              description="For growing teams"
              features={[
                "50,000 API traces/month",
                "500,000 logs/month",
                "5,000 crash reports/month",
                "90-day data retention",
                "Unlimited projects",
                "Priority support",
                "Team collaboration",
                "Custom alerts"
              ]}
              ctaText="Start Pro Trial"
              ctaLink="/register"
              highlighted={true}
              badge="MOST POPULAR"
            />
            <PricingCard
              name="Enterprise"
              price="Custom"
              period=""
              description="For large organizations"
              features={[
                "Unlimited everything",
                "365-day data retention",
                "Dedicated support",
                "Custom SLA",
                "On-premise option",
                "SSO & SAML",
                "Compliance support",
                "Custom integrations"
              ]}
              ctaText="Contact Sales"
              ctaLink="/register"
              highlighted={false}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Debug Smarter?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of developers who ship faster with NivoStack.
            Start free today—no credit card required.
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            Start Free Forever
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">N</span>
                </div>
                <span className="text-xl font-bold text-white">NivoStack</span>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Mobile app monitoring and configuration platform for iOS, Android, and Flutter.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="#integrations" className="hover:text-white transition-colors">Integrations</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="/changelog" className="hover:text-white transition-colors">Changelog</Link></li>
                <li><Link href="/status" className="hover:text-white transition-colors">Status</Link></li>
                <li><a href="https://github.com/nivostack" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/security" className="hover:text-white transition-colors">Security</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
            © 2025 NivoStack. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

// Stat Card Component for Dashboard Mockup
function StatCard({ label, value, change, color, progress }: {
  label: string
  value: string
  change: string
  color: string
  progress: number
}) {
  const colorClasses: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    emerald: 'from-emerald-500 to-emerald-600',
  }

  return (
    <div className="bg-gray-800 rounded-xl p-4">
      <div className="text-gray-400 text-sm mb-1">{label}</div>
      <div className="flex items-baseline justify-between">
        <span className="text-2xl font-bold text-white">{value}</span>
        <span className="text-green-400 text-sm">{change}</span>
      </div>
      <div className="mt-3 h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${colorClasses[color]} rounded-full transition-all duration-1000`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

// Trace Row Component for Dashboard Mockup
function TraceRow({ method, endpoint, status, time }: {
  method: string
  endpoint: string
  status: number
  time: string
}) {
  const methodColors: Record<string, string> = {
    GET: 'bg-green-500/20 text-green-400',
    POST: 'bg-blue-500/20 text-blue-400',
    PUT: 'bg-yellow-500/20 text-yellow-400',
    DELETE: 'bg-red-500/20 text-red-400',
  }

  const statusColor = status >= 200 && status < 300 ? 'text-green-400' : status >= 300 && status < 400 ? 'text-yellow-400' : 'text-red-400'

  return (
    <div className="flex items-center justify-between py-2 px-3 bg-gray-900/50 rounded-lg">
      <div className="flex items-center space-x-3">
        <span className={`px-2 py-0.5 rounded text-xs font-mono font-semibold ${methodColors[method]}`}>
          {method}
        </span>
        <span className="text-gray-300 text-sm font-mono truncate max-w-xs">{endpoint}</span>
      </div>
      <div className="flex items-center space-x-4">
        <span className={`text-sm font-mono ${statusColor}`}>{status}</span>
        <span className="text-gray-500 text-sm font-mono">{time}</span>
      </div>
    </div>
  )
}

// Feature Icons Map
const featureIcons: Record<string, React.ReactNode> = {
  api: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  ),
  logs: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
  crash: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  ),
  timeline: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  ),
  flags: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
    </svg>
  ),
  config: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  globe: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  ),
  analytics: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
    </svg>
  ),
  debug: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75c1.148 0 2.278.08 3.383.237 1.037.146 1.866.966 1.866 2.013 0 3.728-2.35 6.75-5.25 6.75S6.75 18.728 6.75 15c0-1.046.83-1.867 1.866-2.013A24.204 24.204 0 0112 12.75zm0 0c2.883 0 5.647.508 8.207 1.44a23.91 23.91 0 01-1.152 6.06M12 12.75c-2.883 0-5.647.508-8.208 1.44.125 2.104.52 4.136 1.153 6.06M12 12.75a2.25 2.25 0 002.248-2.354M12 12.75a2.25 2.25 0 01-2.248-2.354M12 8.25c.995 0 1.971-.08 2.922-.236.403-.066.74-.358.795-.762a3.778 3.778 0 00-.399-2.25M12 8.25c-.995 0-1.97-.08-2.922-.236-.402-.066-.74-.358-.795-.762a3.734 3.734 0 01.4-2.253M12 8.25a2.25 2.25 0 00-2.248 2.146M12 8.25a2.25 2.25 0 012.248 2.146M8.683 5a6.032 6.032 0 01-1.155-1.002c.07-.63.27-1.222.574-1.747m.581 2.749A3.75 3.75 0 0115.318 5m0 0c.427-.283.815-.62 1.155-.999a4.471 4.471 0 00-.575-1.752M4.921 6a24.048 24.048 0 00-.392 3.314c1.668.546 3.416.914 5.223 1.082M19.08 6c.205 1.08.337 2.187.392 3.314a23.882 23.882 0 01-5.223 1.082" />
    </svg>
  ),
  monitor: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
    </svg>
  ),
  update: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  ),
  flow: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  ),
}

// Feature Card Component
function FeatureCard({ icon, title, description, delay }: {
  icon: string
  title: string
  description: string
  delay: number
}) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div
      className={`group p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 text-white group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
        {featureIcons[icon]}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  )
}

// Platform Icons
const platformIcons: Record<string, React.ReactNode> = {
  flutter: (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
      <path d="M14.314 0L3 11.314l3.5 3.5L18.5 3 14.314 0z" fill="#54C5F8"/>
      <path d="M14.314 11.314L7.657 17.97 11.157 21.47 21.5 11.127 18 7.627l-3.686 3.687z" fill="#54C5F8"/>
      <path d="M7.657 17.97l3.5 3.5 3.157-3.156-3.5-3.5-3.157 3.156z" fill="#01579B"/>
    </svg>
  ),
  android: (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
      <path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-5.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C13.85 1.23 12.95 1 12 1c-.96 0-1.86.23-2.66.63L7.85.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31C6.97 3.26 6 5.01 6 7h12c0-1.99-.97-3.75-2.47-4.84zM10 5H9V4h1v1zm5 0h-1V4h1v1z" fill="#3DDC84"/>
    </svg>
  ),
  ios: (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" fill="#000"/>
    </svg>
  ),
  react: (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="2.5" fill="#61DAFB"/>
      <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#61DAFB" strokeWidth="1" fill="none"/>
      <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#61DAFB" strokeWidth="1" fill="none" transform="rotate(60 12 12)"/>
      <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#61DAFB" strokeWidth="1" fill="none" transform="rotate(120 12 12)"/>
    </svg>
  ),
  nextjs: (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.341-3.369-1.341-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" fill="#000"/>
    </svg>
  ),
}

// Platform Card Component
function PlatformCard({
  platform,
  name,
  isSelected,
  onClick
}: {
  platform: string
  name: string
  isSelected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`group flex items-center space-x-3 px-6 py-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 cursor-pointer ${
        isSelected
          ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-600/25'
          : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-xl'
      }`}
    >
      <div className={`transition-transform duration-300 ${isSelected ? 'scale-110' : 'group-hover:scale-110'}`}>
        {platformIcons[platform]}
      </div>
      <span className={`text-lg font-semibold ${isSelected ? 'text-white' : 'text-gray-900'}`}>{name}</span>
    </button>
  )
}

// Pricing Card Component
function PricingCard({
  name,
  price,
  period,
  description,
  features,
  ctaText,
  ctaLink,
  highlighted,
  badge
}: {
  name: string
  price: string
  period: string
  description: string
  features: string[]
  ctaText: string
  ctaLink: string
  highlighted: boolean
  badge?: string
}) {
  return (
    <div className={`relative rounded-2xl p-8 ${
      highlighted
        ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/20 scale-105'
        : 'bg-white border-2 border-gray-200'
    }`}>
      {badge && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-500 to-blue-700 text-white text-xs font-bold rounded-full">
          {badge}
        </div>
      )}
      <div className="text-center mb-6">
        <h3 className={`text-xl font-bold mb-2 ${highlighted ? 'text-white' : 'text-gray-900'}`}>{name}</h3>
        <div className="flex items-baseline justify-center">
          <span className={`text-4xl font-bold ${highlighted ? 'text-white' : 'text-gray-900'}`}>{price}</span>
          {period && <span className={`ml-1 ${highlighted ? 'text-blue-200' : 'text-gray-500'}`}>{period}</span>}
        </div>
        <p className={`text-sm mt-2 ${highlighted ? 'text-blue-100' : 'text-gray-500'}`}>{description}</p>
      </div>

      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <svg className={`w-5 h-5 mr-2 flex-shrink-0 mt-0.5 ${highlighted ? 'text-blue-200' : 'text-green-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className={`text-sm ${highlighted ? 'text-blue-100' : 'text-gray-600'}`}>{feature}</span>
          </li>
        ))}
      </ul>

      <Link
        href={ctaLink}
        className={`block w-full text-center py-3 px-6 rounded-xl font-semibold transition-all ${
          highlighted
            ? 'bg-white text-blue-600 hover:bg-blue-50'
            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
        }`}
      >
        {ctaText}
      </Link>
    </div>
  )
}
