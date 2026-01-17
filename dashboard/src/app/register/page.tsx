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
    <div className="min-h-screen bg-gray-950 flex">
      {/* Left Side - Information */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 p-12 flex-col justify-center border-r border-gray-800">
        <div className="max-w-lg">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-white mb-3">
              Start Free Forever
            </h1>
            <p className="text-lg text-gray-400">
              Full access to all features. No credit card required. No expiration.
            </p>
          </div>

          {/* What You Get - Condensed */}
          {planLoading ? (
            <div className="mb-8">
              <div className="text-gray-400">Loading plan information...</div>
            </div>
          ) : freePlan ? (
            <div className="mb-8">
              <h2 className="text-xs font-semibold text-gray-400 mb-4 uppercase tracking-wider">
                Included Features
              </h2>
              <div className="grid grid-cols-1 gap-2.5">
                {generateFeatures(freePlan).slice(0, 6).map((feature, index) => (
                  <FeatureItem key={index} text={feature.text} />
                ))}
              </div>
              {generateFeatures(freePlan).length > 6 && (
                <p className="text-sm text-gray-500 mt-3">
                  + {generateFeatures(freePlan).length - 6} more features
                </p>
              )}
            </div>
          ) : (
            <div className="mb-8">
              <div className="text-yellow-400">Free plan information unavailable</div>
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
      <div className="w-full lg:w-1/2 flex justify-center p-8 pt-20">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">Create Your Account</h1>
            <p className="text-gray-400">Start free forever - no expiration</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-900/50 border border-red-500 rounded text-red-200 text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                required
                minLength={6}
              />
              <p className="mt-1 text-xs text-gray-500">Minimum 6 characters</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            >
              {loading ? 'Creating account...' : 'Start Free Forever'}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-400 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
              Sign in
            </Link>
          </p>

          <p className="mt-4 text-center text-xs text-gray-500">
            By creating an account, you agree to our{' '}
            <Link href="#" className="text-blue-400 hover:text-blue-300">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="#" className="text-blue-400 hover:text-blue-300">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function FeatureItem({ text }: { text: string }) {
  return (
    <div className="flex items-center text-sm">
      <CheckIcon className="w-4 h-4 text-green-400 mr-3 flex-shrink-0" />
      <span className="text-gray-400">{text}</span>
    </div>
  )
}

function InfoCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg">
      <h3 className="text-sm font-semibold text-white mb-1">{title}</h3>
      <p className="text-xs text-gray-400 leading-relaxed">{description}</p>
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
