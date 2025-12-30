'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

type Plan = {
  id: string
  name: string
  displayName: string
  description: string | null
  price: number
  currency: string
  interval: string
  isActive: boolean
  isPublic: boolean
  maxProjects: number | null
  maxDevices: number | null
  maxApiTraces: number | null
  maxLogs: number | null
  maxSessions: number | null
  maxCrashes: number | null
  retentionDays: number | null
  allowApiTracking: boolean
  allowScreenTracking: boolean
  allowCrashReporting: boolean
  allowLogging: boolean
  allowBusinessConfig: boolean
  allowLocalization: boolean
  allowCustomDomains: boolean
  allowWebhooks: boolean
  allowTeamMembers: boolean
  allowPrioritySupport: boolean
}

export default function HomePage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch public plans
    fetch('/api/plans')
      .then(res => res.json())
      .then(data => {
        if (data.plans) {
          setPlans(data.plans)
        }
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [])

  const freePlan = plans.find(p => p.name === 'free')
  const proPlan = plans.find(p => p.name === 'pro')
  const teamPlan = plans.find(p => p.name === 'team')
  const enterprisePlan = plans.find(p => p.name === 'enterprise')

  // Helper function to format limit values
  const formatLimit = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return 'Unlimited'
    return value.toLocaleString()
  }

  // Helper function to generate features list from plan data
  const generateFeatures = (plan: Plan | undefined): string[] => {
    if (!plan) return []
    
    const features: string[] = []
    
    // Limits/Meters Section
    if (plan.maxDevices !== null && plan.maxDevices !== undefined) {
      features.push(`${formatLimit(plan.maxDevices)} Device Registrations`)
    } else {
      features.push('Unlimited Device Registrations')
    }
    
    if (plan.maxApiTraces !== null && plan.maxApiTraces !== undefined) {
      features.push(`${formatLimit(plan.maxApiTraces)} API Traces/month`)
    } else {
      features.push('Unlimited API Traces')
    }
    
    if (plan.maxLogs !== null && plan.maxLogs !== undefined) {
      features.push(`${formatLimit(plan.maxLogs)} Logs/month`)
    } else {
      features.push('Unlimited Logs')
    }
    
    if (plan.maxSessions !== null && plan.maxSessions !== undefined) {
      features.push(`${formatLimit(plan.maxSessions)} Sessions/month`)
    } else {
      features.push('Unlimited Sessions')
    }
    
    if (plan.maxCrashes !== null && plan.maxCrashes !== undefined) {
      features.push(`${formatLimit(plan.maxCrashes)} Crashes/month`)
    } else {
      features.push('Unlimited Crashes')
    }
    
    if (plan.retentionDays !== null && plan.retentionDays !== undefined) {
      features.push(`${plan.retentionDays}-day Data Retention`)
    } else {
      features.push('Unlimited Data Retention')
    }
    
    // Available Features Section (based on feature flags)
    if (plan.allowApiTracking) {
      features.push('API Tracking & Tracing')
    }
    
    if (plan.allowScreenTracking) {
      features.push('Screen Tracking')
    }
    
    if (plan.allowCrashReporting) {
      features.push('Crash Reporting')
    }
    
    if (plan.allowLogging) {
      features.push('Remote Logging')
    }
    
    if (plan.allowBusinessConfig) {
      features.push('Business Configuration')
    }
    
    if (plan.allowLocalization) {
      features.push('Localization & Translations')
    }
    
    if (plan.allowCustomDomains) {
      features.push('Custom Domains')
    }
    
    if (plan.allowWebhooks) {
      features.push('Webhooks')
    }
    
    if (plan.allowTeamMembers) {
      features.push('Team Members')
    }
    
    if (plan.allowPrioritySupport) {
      features.push('Priority Support')
    }
    
    return features
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <nav className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <span className="text-xl font-bold text-white">NivoStack</span>
            <div className="space-x-4">
              <Link
                href="/login"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Debug Mobile Apps<br />
            <span className="text-blue-400">Remotely</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Complete mobile app monitoring and configuration platform. Track API calls, monitor logs, 
            catch crashes, manage configurations, and mock APIs—all from one dashboard.
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Start Free Forever
          </Link>
        </div>

        {/* Features Grid - Organized by Category */}
        <div className="mb-20">
          {/* Runtime Monitoring */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Runtime Monitoring</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard
                icon="⚡"
                title="API Tracing"
                description="Monitor every network request with status codes, response times, and errors in real-time. Track up to 20 unique API endpoints."
                color="blue"
              />
              <FeatureCard
                icon="📝"
                title="Remote Logging"
                description="Stream logs from any device. Filter by level, search by content, and debug issues faster. 10,000 logs/month on free plan."
                color="green"
              />
              <FeatureCard
                icon="💥"
                title="Crash Reports"
                description="Catch crashes with full stack traces. Know exactly what went wrong and on which device. 100 crashes/month on free plan."
                color="red"
              />
              <FeatureCard
                icon="📊"
                title="Session Timeline"
                description="Track user sessions with screen flow, API calls, and logs. Understand user journeys and debug issues in context."
                color="orange"
              />
            </div>
          </div>

          {/* Content Management */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Content Management</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <FeatureCard
                icon="⚙️"
                title="Business Configuration"
                description="Remote configuration management for your app. Update feature flags, settings, and configurations without app updates. 50 keys on free plan."
                color="cyan"
              />
              <FeatureCard
                icon="🌍"
                title="Localization"
                description="Manage translations and multi-language support. Support up to 5 languages and 200 translation keys on free plan."
                color="pink"
              />
            </div>
          </div>

          {/* Platform & Development Tools */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Platform & Development Tools</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard
                icon="🎭"
                title="API Mocking"
                description="Mock API endpoints for testing and development. Create environments, define responses, and test edge cases without backend changes."
                color="yellow"
              />
              <FeatureCard
                icon="📦"
                title="Build Versioning"
                description="Version control for Business Config, Localization, and API Mocks. Track changes, compare versions, and rollback when needed."
                color="indigo"
              />
              <FeatureCard
                icon="🔍"
                title="Device Debug Mode"
                description="Selectively enable API tracking and session monitoring for specific devices. Perfect for debugging production issues."
                color="purple"
              />
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Start Free, Upgrade When Ready
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Free forever. No credit card required. No expiration date.
            </p>
          </div>

          {loading ? (
            <div className="text-center text-gray-400">Loading plans...</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {/* Free Plan */}
              {freePlan && (
                <PlanCard
                  plan={freePlan}
                  isPopular={false}
                  isComingSoon={false}
                  features={generateFeatures(freePlan)}
                  ctaText="Start Free Forever"
                  ctaLink="/register"
                  warning="⚠️ Free plan has usage limits. Upgrade to unlock higher limits and premium features."
                />
              )}

              {/* Pro Plan */}
              {proPlan && (
                <PlanCard
                  plan={proPlan}
                  isPopular={true}
                  isComingSoon={!proPlan.isActive}
                  features={generateFeatures(proPlan)}
                  ctaText={proPlan.isActive ? "Upgrade to Pro" : "Coming Soon"}
                  ctaLink={proPlan.isActive ? "/register" : undefined}
                  disabled={!proPlan.isActive}
                />
              )}

              {/* Team Plan */}
              {teamPlan && (
                <PlanCard
                  plan={teamPlan}
                  isPopular={false}
                  isComingSoon={!teamPlan.isActive}
                  features={generateFeatures(teamPlan)}
                  ctaText={teamPlan.isActive ? "Upgrade to Team" : "Coming Soon"}
                  ctaLink={teamPlan.isActive ? "/register" : undefined}
                  disabled={!teamPlan.isActive}
                />
              )}

              {/* Enterprise Plan */}
              {enterprisePlan && (
                <PlanCard
                  plan={enterprisePlan}
                  isPopular={false}
                  isComingSoon={!enterprisePlan.isActive}
                  features={[
                    ...generateFeatures(enterprisePlan),
                    'Dedicated Support',
                    'Custom SLA',
                    'On-premise Option',
                    'Advanced Security',
                    'Compliance Support',
                    'Custom Integrations',
                  ]}
                  ctaText={enterprisePlan.isActive ? "Contact Sales" : "Coming Soon"}
                  ctaLink={enterprisePlan.isActive ? "/register" : undefined}
                  disabled={!enterprisePlan.isActive}
                />
              )}
            </div>
          )}
        </div>

        {/* Integration Section */}
        <div className="bg-gray-900 rounded-lg p-8 mb-20">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Simple Integration
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium text-white mb-3">Flutter SDK</h3>
              <pre className="p-4 bg-gray-950 rounded text-sm text-gray-300 overflow-x-auto">{`// 1. Add to pubspec.yaml
@nivostack/core: ^1.2.0

// 2. Initialize
await NivoStack.init(
  apiKey: 'your-api-key',
  endpoint: 'https://ingest.nivostack.com',
);

// 3. Track API calls automatically
// SDK handles everything!`}</pre>
            </div>
            <div>
              <h3 className="text-lg font-medium text-white mb-3">Native iOS/Android</h3>
              <pre className="p-4 bg-gray-950 rounded text-sm text-gray-300 overflow-x-auto">{`// Copy NivoStackCore.swift or NivoStackCore.kt

// Initialize
NivoStackCore.configure(
  apiKey: "your-api-key",
  endpoint: "https://ingest.nivostack.com"
)

// Track API calls
NivoStackCore.trace(request, response)`}</pre>
            </div>
          </div>
        </div>

        {/* Use Cases */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Perfect For
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <UseCaseCard
              title="Mobile App Developers"
              description="Debug production issues without waiting for users to report them. Track API calls, monitor logs, and catch crashes in real-time."
            />
            <UseCaseCard
              title="QA Teams"
              description="Test API mocking scenarios, verify configurations, and validate localization across multiple languages and devices."
            />
            <UseCaseCard
              title="Product Teams"
              description="Manage feature flags, A/B test configurations, and update app content remotely without app store releases."
            />
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/docs" className="hover:text-white">Documentation</Link></li>
                <li><Link href="/register" className="hover:text-white">Get Started</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">NivoStack</h3>
              <p className="text-gray-400 text-sm">
                Mobile app monitoring and configuration platform for iOS and Android.
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
            © 2024 NivoStack. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description, color }: { icon: string; title: string; description: string; color: string }) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-600/20 text-blue-400',
    green: 'bg-green-600/20 text-green-400',
    red: 'bg-red-600/20 text-red-400',
    purple: 'bg-purple-600/20 text-purple-400',
    indigo: 'bg-indigo-600/20 text-indigo-400',
    yellow: 'bg-yellow-600/20 text-yellow-400',
    cyan: 'bg-cyan-600/20 text-cyan-400',
    pink: 'bg-pink-600/20 text-pink-400',
    orange: 'bg-orange-600/20 text-orange-400',
  }

  return (
    <div className="p-6 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors">
      <div className={`w-12 h-12 ${colorClasses[color] || colorClasses.blue} rounded-lg flex items-center justify-center mb-4 text-2xl`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  )
}

function PlanCard({ 
  plan, 
  isPopular, 
  isComingSoon, 
  features, 
  ctaText, 
  ctaLink, 
  warning,
  disabled 
}: { 
  plan: Plan
  isPopular: boolean
  isComingSoon: boolean
  features: string[]
  ctaText: string
  ctaLink?: string
  warning?: string
  disabled?: boolean
}) {
  const priceDisplay = plan.price === 0 ? 'Free' : `$${plan.price.toFixed(2)}`
  const intervalDisplay = plan.price === 0 ? 'Free Forever' : `/${plan.interval}`

  const content = (
    <div className={`bg-gray-900 rounded-lg p-8 border-2 relative h-full flex flex-col ${
      isPopular ? 'border-blue-600' : 'border-gray-800'
    } ${disabled ? 'opacity-60' : ''}`}>
      {isPopular && (
        <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
          MOST POPULAR
        </div>
      )}
      {isComingSoon && (
        <div className="absolute top-4 right-4 bg-gray-700 text-gray-300 text-xs font-semibold px-3 py-1 rounded-full">
          COMING SOON
        </div>
      )}
      
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">{plan.displayName}</h3>
        <div className="flex items-baseline justify-center">
          <span className="text-4xl font-bold text-blue-400">{priceDisplay}</span>
          {plan.price > 0 && (
            <span className="text-gray-400 ml-2">{intervalDisplay}</span>
          )}
        </div>
        {plan.price === 0 && (
          <div className="text-gray-400 text-sm mt-1">{intervalDisplay}</div>
        )}
        {plan.description && (
          <p className="text-gray-400 text-sm mt-2">{plan.description}</p>
        )}
      </div>

      <ul className="space-y-3 mb-6 flex-grow">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start text-gray-300 text-sm">
            <svg className="w-5 h-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {warning && (
        <div className="bg-yellow-900/20 border border-yellow-600 rounded p-3 mb-4">
          <p className="text-yellow-400 text-xs">{warning}</p>
        </div>
      )}

      {ctaLink && !disabled ? (
        <Link
          href={ctaLink}
          className={`block w-full text-center px-6 py-3 rounded-lg font-medium transition-colors ${
            isPopular
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-800 hover:bg-gray-700 text-white'
          }`}
        >
          {ctaText}
        </Link>
      ) : (
        <button
          disabled
          className="block w-full text-center px-6 py-3 bg-gray-700 text-gray-400 rounded-lg font-medium cursor-not-allowed"
        >
          {ctaText}
        </button>
      )}
    </div>
  )

  return content
}

function UseCaseCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-6 bg-gray-900 rounded-lg">
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  )
}
