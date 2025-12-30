'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { api } from '@/lib/api'
import Link from 'next/link'

type SettingsTab = 'features' | 'performance'

type FeatureFlags = {
  sdkEnabled: boolean
  apiTracking: boolean
  screenTracking: boolean
  crashReporting: boolean
  logging: boolean
  deviceTracking: boolean
  sessionTracking: boolean
  businessConfig: boolean
  localization: boolean
  offlineSupport: boolean
  batchEvents: boolean
}

type SubscriptionStatus = {
  trialActive: boolean
  planName: string
}

type SdkSettings = {
  maxLogQueueSize: number
  maxTraceQueueSize: number
  flushIntervalSeconds: number
  enableBatching: boolean
}

export default function DevBridgeSettingsPage() {
  const { token } = useAuth()
  const [activeTab, setActiveTab] = useState<SettingsTab>('features')
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags | null>(null)
  const [featureFlagsLoading, setFeatureFlagsLoading] = useState(true)
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null)
  const [sdkSettings, setSdkSettings] = useState<SdkSettings | null>(null)
  const [sdkSettingsLoading, setSdkSettingsLoading] = useState(true)
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null)

  useEffect(() => {
    if (token) {
      loadFeatureFlags()
      loadSubscriptionStatus()
      loadSdkSettings()
    }
  }, [token])

  const loadFeatureFlags = async () => {
    if (!token) return
    try {
      setFeatureFlagsLoading(true)
      // Get first project's feature flags as example (feature flags are per-project)
      const projectsRes = await api.projects.list(token)
      if (projectsRes.projects && projectsRes.projects.length > 0) {
        const firstProject = projectsRes.projects[0]
        setCurrentProjectId(firstProject.id)
        const response = await api.featureFlags.get(firstProject.id, token)
        setFeatureFlags(response.flags as FeatureFlags)
      }
    } catch (error) {
      console.error('Failed to load feature flags:', error)
    } finally {
      setFeatureFlagsLoading(false)
    }
  }

  const loadSdkSettings = async () => {
    if (!token) return
    try {
      setSdkSettingsLoading(true)
      // Get first project's SDK settings (settings are per-project)
      const projectsRes = await api.projects.list(token)
      if (projectsRes.projects && projectsRes.projects.length > 0) {
        const firstProject = projectsRes.projects[0]
        setCurrentProjectId(firstProject.id)
        const res = await fetch(`/api/sdk-settings?projectId=${firstProject.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await res.json()
        if (data.settings) {
          setSdkSettings({
            maxLogQueueSize: data.settings.maxLogQueueSize || 100,
            maxTraceQueueSize: data.settings.maxTraceQueueSize || 50,
            flushIntervalSeconds: data.settings.flushIntervalSeconds || 30,
            enableBatching: data.settings.enableBatching ?? true,
          })
        }
      }
    } catch (error) {
      console.error('Failed to load SDK settings:', error)
    } finally {
      setSdkSettingsLoading(false)
    }
  }

  const updateSdkSetting = async (updates: Partial<SdkSettings>) => {
    if (!token || !currentProjectId || !sdkSettings) return
    try {
      const res = await fetch('/api/sdk-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ projectId: currentProjectId, ...updates })
      })
      if (res.ok) {
        setSdkSettings(prev => prev ? { ...prev, ...updates } : prev)
      }
    } catch (error) {
      console.error('Failed to update SDK settings:', error)
      alert('Failed to update SDK settings. Please try again.')
    }
  }

  const loadSubscriptionStatus = async () => {
    if (!token) return
    try {
      const response = await api.subscription.get(token)
      setSubscriptionStatus({
        trialActive: response.subscription?.trialEndDate ? new Date(response.subscription.trialEndDate) > new Date() : false,
        planName: response.subscription?.plan?.name || 'free'
      })
    } catch (error) {
      console.error('Failed to load subscription status:', error)
    }
  }

  const updateFeatureFlag = async (key: keyof FeatureFlags, value: boolean) => {
    if (!token || !featureFlags) return
    try {
      // Get first project to update (feature flags are per-project)
      const projectsRes = await api.projects.list(token)
      if (projectsRes.projects && projectsRes.projects.length > 0) {
        const firstProject = projectsRes.projects[0]
        await api.featureFlags.update(firstProject.id, token, { [key]: value })
        setFeatureFlags({ ...featureFlags, [key]: value })
      } else {
        alert('No projects found. Please create a project first.')
      }
    } catch (error) {
      console.error('Failed to update feature flag:', error)
      alert('Failed to update feature flag. Please try again.')
    }
  }

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400">Please log in to access settings.</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">DevBridge Settings</h1>
        <p className="text-gray-400">Manage global DevBridge configuration and features</p>
      </div>

      {/* Settings Tabs */}
      <div className="border-b border-gray-800">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('features')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'features'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Product Features
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'performance'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Performance Settings
          </button>
        </nav>
      </div>

      {/* Product Features Tab */}
      {activeTab === 'features' && (
        <div className="space-y-6">
          {/* Subscription Status Warning */}
          {subscriptionStatus && !subscriptionStatus.trialActive && (
            <div className="bg-red-900/20 border-l-4 border-red-600 p-4 rounded">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div className="flex-1">
                  <h3 className="text-red-400 font-semibold mb-1">Trial Expired</h3>
                  <p className="text-gray-300 text-sm mb-3">
                    Your free trial has ended. Features are disabled and no new data will be collected. 
                    Upgrade your subscription to re-enable all features.
                  </p>
                  <Link
                    href="/subscription"
                    className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                  >
                    View Subscription
                  </Link>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">⚙️</span>
              <div>
                <h3 className="text-white font-medium">SDK Feature Flags</h3>
                <p className="text-gray-400 text-sm">Control which features are enabled in the SDK. Changes take effect on next app launch.</p>
                {subscriptionStatus && !subscriptionStatus.trialActive && (
                  <p className="text-red-400 text-sm mt-1">
                    ⚠️ Features are disabled due to expired trial subscription.
                  </p>
                )}
              </div>
            </div>

            {featureFlagsLoading ? (
              <div className="flex items-center justify-center py-8">
                <svg className="animate-spin h-6 w-6 text-gray-400" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="ml-2 text-gray-400">Loading feature flags...</span>
              </div>
            ) : featureFlags ? (
              <div className="space-y-6">
                {/* Master Kill Switch */}
                <div className={`p-4 rounded-lg border-2 ${featureFlags.sdkEnabled ? 'bg-green-900/20 border-green-600' : 'bg-red-900/20 border-red-600'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{featureFlags.sdkEnabled ? '🟢' : '🔴'}</span>
                      <div>
                        <p className="text-white font-medium">SDK Enabled (Master Switch)</p>
                        <p className={`text-sm ${featureFlags.sdkEnabled ? 'text-green-400' : 'text-red-400'}`}>
                          {featureFlags.sdkEnabled
                            ? 'SDK is active - all enabled features will work'
                            : 'SDK is disabled - ALL functionality is turned off'}
                        </p>
                      </div>
                    </div>
                    <label className={`relative inline-flex items-center ${subscriptionStatus && !subscriptionStatus.trialActive ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                      <input
                        type="checkbox"
                        checked={featureFlags.sdkEnabled}
                        onChange={(e) => updateFeatureFlag('sdkEnabled', e.target.checked)}
                        disabled={!!(subscriptionStatus && !subscriptionStatus.trialActive)}
                        className="sr-only peer"
                      />
                      <div className={`w-14 h-7 ${featureFlags.sdkEnabled ? 'bg-green-600' : 'bg-red-600'} peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all`}></div>
                    </label>
                  </div>
                  {!featureFlags.sdkEnabled && (
                    <p className="mt-3 text-sm text-red-300 bg-red-900/30 p-2 rounded">
                      Warning: When SDK is disabled, no data will be collected from mobile apps. API tracing, logging, screen tracking, and all other features will be completely inactive.
                    </p>
                  )}
                </div>

                {/* Core Features */}
                <div className={featureFlags.sdkEnabled && (!subscriptionStatus || subscriptionStatus.trialActive) ? '' : 'opacity-50 pointer-events-none'}>
                  <h4 className="text-gray-400 text-sm font-medium mb-3">
                    Core Features 
                    {!featureFlags.sdkEnabled && <span className="text-red-400"> (SDK Disabled)</span>}
                    {subscriptionStatus && !subscriptionStatus.trialActive && <span className="text-red-400"> (Trial Expired)</span>}
                  </h4>
                  <div className={`space-y-3 ${subscriptionStatus && !subscriptionStatus.trialActive ? 'pointer-events-none opacity-50' : ''}`}>
                    {[
                      { key: 'apiTracking', icon: '📡', name: 'API Tracking', desc: 'Track HTTP requests and responses' },
                      { key: 'screenTracking', icon: '📱', name: 'Screen Tracking', desc: 'Track screen views and navigation flow' },
                      { key: 'crashReporting', icon: '💥', name: 'Crash Reporting', desc: 'Capture and report app crashes' },
                      { key: 'logging', icon: '📝', name: 'Logging', desc: 'Collect and send application logs' },
                      { key: 'deviceTracking', icon: '📱', name: 'Device Tracking', desc: 'Register and track devices' },
                      { key: 'sessionTracking', icon: '🔄', name: 'Session Tracking', desc: 'Track app sessions with context' },
                      { key: 'businessConfig', icon: '⚙️', name: 'Business Config', desc: 'Remote configuration management' },
                      { key: 'localization', icon: '🌐', name: 'Localization', desc: 'Remote translation management' },
                      { key: 'offlineSupport', icon: '📴', name: 'Offline Support', desc: 'Queue events when offline' },
                      { key: 'batchEvents', icon: '📦', name: 'Batch Events', desc: 'Batch events before sending' },
                    ].map((feature) => (
                      <div key={feature.key} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{feature.icon}</span>
                          <div>
                            <p className="text-white text-sm font-medium">{feature.name}</p>
                            <p className="text-gray-500 text-xs">{feature.desc}</p>
                          </div>
                        </div>
                        <label className={`relative inline-flex items-center ${subscriptionStatus && !subscriptionStatus.trialActive ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                          <input
                            type="checkbox"
                            checked={featureFlags[feature.key as keyof FeatureFlags] as boolean}
                            onChange={(e) => updateFeatureFlag(feature.key as keyof FeatureFlags, e.target.checked)}
                            disabled={!!(subscriptionStatus && !subscriptionStatus.trialActive)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">Failed to load feature flags</p>
            )}
          </div>
        </div>
      )}

      {/* Performance Settings Tab */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          <div className="bg-gray-900 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">⚡</span>
              <div>
                <h3 className="text-white font-medium">Performance Settings</h3>
                <p className="text-gray-400 text-sm">Configure data retention and performance optimizations</p>
                <p className="text-yellow-400 text-xs mt-1">⚠️ Note: Performance settings are managed per-project. These settings apply to your first project. To manage settings for other projects, go to the project settings.</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Queue and Batching Settings */}
              {sdkSettingsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <svg className="animate-spin h-6 w-6 text-gray-400" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="ml-2 text-gray-400">Loading SDK settings...</span>
                </div>
              ) : sdkSettings ? (
                <div className="p-4 bg-gray-800 rounded-lg">
                  <h4 className="text-white font-medium mb-2">Queue and Batching</h4>
                  <p className="text-gray-400 text-sm mb-4">
                    Configure batching and queue behavior for SDK event collection.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">📦</span>
                        <div>
                          <p className="text-white text-sm font-medium">Enable Batching</p>
                          <p className="text-gray-500 text-xs">Batch events before sending to reduce network calls</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sdkSettings.enableBatching}
                          onChange={(e) => updateSdkSetting({ enableBatching: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-lg">📝</span>
                        <div>
                          <p className="text-white text-sm font-medium">Max Log Queue Size</p>
                          <p className="text-gray-500 text-xs">Maximum logs to queue before flushing</p>
                        </div>
                      </div>
                      <input
                        type="number"
                        value={sdkSettings.maxLogQueueSize}
                        onChange={(e) => updateSdkSetting({ maxLogQueueSize: parseInt(e.target.value) || 100 })}
                        min="10"
                        max="1000"
                        className="w-full px-3 py-2 bg-gray-600 text-white rounded border border-gray-500 text-sm focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div className="p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-lg">📡</span>
                        <div>
                          <p className="text-white text-sm font-medium">Max Trace Queue Size</p>
                          <p className="text-gray-500 text-xs">Maximum API traces to queue before flushing</p>
                        </div>
                      </div>
                      <input
                        type="number"
                        value={sdkSettings.maxTraceQueueSize}
                        onChange={(e) => updateSdkSetting({ maxTraceQueueSize: parseInt(e.target.value) || 50 })}
                        min="5"
                        max="500"
                        className="w-full px-3 py-2 bg-gray-600 text-white rounded border border-gray-500 text-sm focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div className="p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-lg">⏱️</span>
                        <div>
                          <p className="text-white text-sm font-medium">Flush Interval (seconds)</p>
                          <p className="text-gray-500 text-xs">How often to send queued events</p>
                        </div>
                      </div>
                      <input
                        type="number"
                        value={sdkSettings.flushIntervalSeconds}
                        onChange={(e) => updateSdkSetting({ flushIntervalSeconds: parseInt(e.target.value) || 30 })}
                        min="5"
                        max="300"
                        className="w-full px-3 py-2 bg-gray-600 text-white rounded border border-gray-500 text-sm focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gray-800 rounded-lg">
                  <p className="text-gray-400 text-sm">No projects found. Please create a project first to configure SDK settings.</p>
                </div>
              )}

              <div className="p-4 bg-gray-800 rounded-lg">
                <h4 className="text-white font-medium mb-2">Data Retention</h4>
                <p className="text-gray-400 text-sm mb-4">
                  Configure how long data is retained before automatic cleanup. This helps manage storage costs and improve performance.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">API Traces Retention</span>
                    <span className="text-gray-400 text-sm">30 days (default)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">Logs Retention</span>
                    <span className="text-gray-400 text-sm">30 days (default)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">Sessions Retention</span>
                    <span className="text-gray-400 text-sm">90 days (default)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">Crashes Retention</span>
                    <span className="text-gray-400 text-sm">365 days (default)</span>
                  </div>
                </div>
                <p className="text-gray-500 text-xs mt-4">
                  💡 Data retention settings are managed per subscription plan. Upgrade to customize retention periods.
                </p>
              </div>

              <div className="p-4 bg-gray-800 rounded-lg">
                <h4 className="text-white font-medium mb-2">Performance Optimizations</h4>
                <p className="text-gray-400 text-sm mb-4">
                  Enable performance optimizations to improve dashboard loading times and reduce database load.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-gray-300 text-sm">Enable Caching</span>
                      <p className="text-gray-500 text-xs">Cache frequently accessed data</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

