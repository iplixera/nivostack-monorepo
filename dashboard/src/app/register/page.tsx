'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { api } from '@/lib/api'

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

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [freePlan, setFreePlan] = useState<Plan | null>(null)
  const [planLoading, setPlanLoading] = useState(true)
  const { login } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Fetch free plan
    fetch('/api/plans')
      .then(res => res.json())
      .then(data => {
        if (data.plans) {
          const free = data.plans.find((p: Plan) => p.name === 'free')
          setFreePlan(free || null)
        }
        setPlanLoading(false)
      })
      .catch(() => {
        setPlanLoading(false)
      })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { user, token } = await api.auth.register(email, password, name)
      login(token, user)
      router.push('/projects')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  // Helper function to format limit values
  const formatLimit = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return 'Unlimited'
    return value.toLocaleString()
  }

  // Helper function to generate features list from plan data
  const generateFeatures = (plan: Plan | null): Array<{ icon: string; text: string }> => {
    if (!plan) return []
    
    const features: Array<{ icon: string; text: string }> = []
    
    // Limits/Meters
    if (plan.maxDevices !== null && plan.maxDevices !== undefined) {
      features.push({
        icon: '📱',
        text: `${formatLimit(plan.maxDevices)} Device Registrations`
      })
    } else {
      features.push({ icon: '📱', text: 'Unlimited Device Registrations' })
    }
    
    if (plan.maxApiTraces !== null && plan.maxApiTraces !== undefined) {
      features.push({
        icon: '⚡',
        text: `API Tracing - Monitor up to ${formatLimit(plan.maxApiTraces)} API requests/month`
      })
    } else {
      features.push({ icon: '⚡', text: 'API Tracing - Unlimited API requests' })
    }
    
    if (plan.maxLogs !== null && plan.maxLogs !== undefined) {
      features.push({
        icon: '📝',
        text: `Remote Logging - Stream up to ${formatLimit(plan.maxLogs)} logs/month`
      })
    } else {
      features.push({ icon: '📝', text: 'Remote Logging - Unlimited logs' })
    }
    
    if (plan.maxSessions !== null && plan.maxSessions !== undefined) {
      features.push({
        icon: '📊',
        text: `Session Timeline - Track up to ${formatLimit(plan.maxSessions)} sessions/month`
      })
    } else {
      features.push({ icon: '📊', text: 'Session Timeline - Unlimited sessions' })
    }
    
    if (plan.maxCrashes !== null && plan.maxCrashes !== undefined) {
      features.push({
        icon: '💥',
        text: `Crash Reports - Track up to ${formatLimit(plan.maxCrashes)} crashes/month`
      })
    } else {
      features.push({ icon: '💥', text: 'Crash Reports - Unlimited crashes' })
    }
    
    // Feature Flags - Only show if enabled
    if (plan.allowBusinessConfig) {
      features.push({ icon: '⚙️', text: 'Business Configuration' })
    }
    
    if (plan.allowLocalization) {
      features.push({ icon: '🌍', text: 'Localization & Translations' })
    }
    
    if (plan.allowApiTracking) {
      features.push({ icon: '🎭', text: 'API Mocking' })
    }
    
    features.push({ icon: '📦', text: 'Build Versioning' })
    features.push({ icon: '🔍', text: 'Device Debug Mode' })
    
    return features
  }

  const retentionDays = freePlan?.retentionDays || 30

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

      <div className="flex min-h-screen pt-16">
        {/* Left Side - Information */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-12 flex-col justify-center">
        <div className="max-w-lg">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-white mb-3">
              Start Free Forever
            </h1>
            <p className="text-lg text-blue-100">
              Full access to all features. No credit card required. No expiration.
            </p>
          </div>

          {/* What You Get - Condensed */}
          {planLoading ? (
            <div className="mb-8">
              <div className="text-blue-100">Loading plan information...</div>
            </div>
          ) : freePlan ? (
            <div className="mb-8">
              <h2 className="text-xs font-semibold text-blue-200 mb-4 uppercase tracking-wider">
                Included Features
              </h2>
              <div className="grid grid-cols-1 gap-2.5">
                {generateFeatures(freePlan).slice(0, 6).map((feature, index) => (
                  <FeatureItem key={index} text={feature.text} />
                ))}
              </div>
              {generateFeatures(freePlan).length > 6 && (
                <p className="text-sm text-blue-200 mt-3">
                  + {generateFeatures(freePlan).length - 6} more features
                </p>
              )}
            </div>
          ) : (
            <div className="mb-8">
              <div className="text-yellow-200">Free plan information unavailable</div>
            </div>
          )}

          {/* Key Points - Simplified */}
          <div className="space-y-3 mt-8">
            <InfoCard
              title="Data Retention"
              description={`${retentionDays}-day retention per billing cycle. Data only deleted upon account deletion request.`}
            />
            <InfoCard
              title="Monthly Renewal"
              description="Your free plan renews automatically every month. Usage meters reset, but all historical data is preserved."
            />
            <InfoCard
              title="Free Forever"
              description="No expiration date. Your free plan continues indefinitely. Upgrade anytime to unlock higher limits and premium features."
            />
          </div>
        </div>
      </div>

        {/* Right Side - Registration Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center lg:hidden">
                  <span className="text-white font-bold text-xl">N</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Create Your Account</h1>
              </div>
              <p className="text-gray-600">Start free forever - no expiration</p>
            </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                required
                minLength={6}
              />
              <p className="mt-1 text-xs text-gray-500">Minimum 6 characters</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            >
              {loading ? 'Creating account...' : 'Start Free Forever'}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in
            </Link>
          </p>

            <p className="mt-8 text-center text-xs text-gray-500">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="text-blue-600 hover:text-blue-700">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-blue-600 hover:text-blue-700">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureItem({ text }: { text: string }) {
  return (
    <div className="flex items-center text-sm">
      <CheckIcon className="w-4 h-4 text-green-300 mr-3 flex-shrink-0" />
      <span className="text-blue-100">{text}</span>
    </div>
  )
}

function InfoCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-3 bg-white/10 border border-white/20 rounded-lg backdrop-blur-sm">
      <h3 className="text-sm font-semibold text-white mb-1">{title}</h3>
      <p className="text-xs text-blue-100 leading-relaxed">{description}</p>
    </div>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )
}
