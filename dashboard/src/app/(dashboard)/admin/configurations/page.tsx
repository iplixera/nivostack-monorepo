'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { api } from '@/lib/api'

type ConfigurationCategory =
  | 'notifications'
  | 'payment'
  | 'machine_translation'
  | 'email'
  | 'sms'
  | 'webhooks'
  | 'general'

interface Configuration {
  id: string
  category: string
  key: string
  value: string
  encrypted: boolean
  description: string | null
  isActive: boolean
  metadata: Record<string, any> | null
  updatedBy: string | null
  createdAt: string
  updatedAt: string
}

const CATEGORY_CONFIGS: Record<ConfigurationCategory, {
  label: string
  description: string
  defaultConfigs: Array<{
    key: string
    label: string
    description: string
    type: 'text' | 'password' | 'number' | 'boolean' | 'json'
    encrypted?: boolean
    required?: boolean
  }>
}> = {
  notifications: {
    label: 'Notifications',
    description: 'Configure notification channels (email, SMS, push)',
    defaultConfigs: [
      { key: 'email_enabled', label: 'Email Enabled', description: 'Enable email notifications', type: 'boolean' },
      { key: 'sms_enabled', label: 'SMS Enabled', description: 'Enable SMS notifications', type: 'boolean' },
      { key: 'push_enabled', label: 'Push Enabled', description: 'Enable push notifications', type: 'boolean' }
    ]
  },
  payment: {
    label: 'Payment',
    description: 'Configure payment providers (Stripe, etc.)',
    defaultConfigs: [
      { key: 'stripe_secret_key', label: 'Stripe Secret Key', description: 'Stripe secret key for payment processing', type: 'password', encrypted: true, required: true },
      { key: 'stripe_publishable_key', label: 'Stripe Publishable Key', description: 'Stripe publishable key for client-side', type: 'password', encrypted: true },
      { key: 'stripe_webhook_secret', label: 'Stripe Webhook Secret', description: 'Stripe webhook secret for verifying webhooks', type: 'password', encrypted: true },
      { key: 'currency', label: 'Default Currency', description: 'Default currency code (e.g., USD)', type: 'text' }
    ]
  },
  machine_translation: {
    label: 'Machine Translation',
    description: 'Configure MT providers (Google, DeepL, Azure)',
    defaultConfigs: [
      { key: 'google_api_key', label: 'Google Translate API Key', description: 'Google Cloud Translation API key', type: 'password', encrypted: true },
      { key: 'deepl_api_key', label: 'DeepL API Key', description: 'DeepL API key', type: 'password', encrypted: true },
      { key: 'azure_api_key', label: 'Azure Translator API Key', description: 'Azure Cognitive Services Translator API key', type: 'password', encrypted: true },
      { key: 'azure_region', label: 'Azure Region', description: 'Azure region (e.g., global, eastus)', type: 'text' },
      { key: 'default_provider', label: 'Default Provider', description: 'Default MT provider (google, deepl, azure)', type: 'text' }
    ]
  },
  email: {
    label: 'Email',
    description: 'Configure SMTP settings for email delivery',
    defaultConfigs: [
      { key: 'smtp_host', label: 'SMTP Host', description: 'SMTP server hostname', type: 'text', required: true },
      { key: 'smtp_port', label: 'SMTP Port', description: 'SMTP server port (usually 587 or 465)', type: 'number', required: true },
      { key: 'smtp_username', label: 'SMTP Username', description: 'SMTP authentication username', type: 'text', required: true },
      { key: 'smtp_password', label: 'SMTP Password', description: 'SMTP authentication password', type: 'password', encrypted: true, required: true },
      { key: 'smtp_secure', label: 'Use TLS/SSL', description: 'Enable TLS/SSL encryption', type: 'boolean' },
      { key: 'from_email', label: 'From Email', description: 'Default sender email address', type: 'text', required: true },
      { key: 'from_name', label: 'From Name', description: 'Default sender name', type: 'text' }
    ]
  },
  sms: {
    label: 'SMS',
    description: 'Configure SMS provider settings',
    defaultConfigs: [
      { key: 'provider', label: 'SMS Provider', description: 'SMS provider (twilio, aws_sns, etc.)', type: 'text' },
      { key: 'api_key', label: 'API Key', description: 'SMS provider API key', type: 'password', encrypted: true },
      { key: 'api_secret', label: 'API Secret', description: 'SMS provider API secret', type: 'password', encrypted: true },
      { key: 'from_number', label: 'From Number', description: 'Default sender phone number', type: 'text' }
    ]
  },
  webhooks: {
    label: 'Webhooks',
    description: 'Configure webhook settings',
    defaultConfigs: [
      { key: 'default_url', label: 'Default Webhook URL', description: 'Default webhook URL for notifications', type: 'text' },
      { key: 'timeout_seconds', label: 'Timeout (seconds)', description: 'Webhook request timeout', type: 'number' },
      { key: 'retry_attempts', label: 'Retry Attempts', description: 'Number of retry attempts for failed webhooks', type: 'number' }
    ]
  },
  general: {
    label: 'General',
    description: 'General system settings',
    defaultConfigs: [
      { key: 'app_name', label: 'App Name', description: 'Application name', type: 'text' },
      { key: 'app_url', label: 'App URL', description: 'Application base URL', type: 'text' },
      { key: 'support_email', label: 'Support Email', description: 'Support email address', type: 'text' }
    ]
  }
}

export default function AdminConfigurationsPage() {
  const { token } = useAuth()
  const [configurations, setConfigurations] = useState<Configuration[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<ConfigurationCategory>('general')
  const [editingConfig, setEditingConfig] = useState<{ category: string; key: string; value: string; encrypted: boolean } | null>(null)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState<string | null>(null)
  const [testResult, setTestResult] = useState<any>(null)

  useEffect(() => {
    if (token) {
      loadConfigurations()
    }
  }, [token, activeCategory])

  const loadConfigurations = async () => {
    if (!token) return
    try {
      setLoading(true)
      const data = await api.admin.getConfigurations(token, activeCategory)
      setConfigurations(data.configurations)

      // Initialize form data with existing values
      const formDataInit: Record<string, string> = {}
      data.configurations.forEach(config => {
        formDataInit[config.key] = config.encrypted ? '' : (config.value || '')
      })
      setFormData(formDataInit)
    } catch (error) {
      console.error('Failed to load configurations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (key: string, value: string, encrypted: boolean) => {
    if (!token) return
    try {
      setSaving(true)
      const configDef = CATEGORY_CONFIGS[activeCategory].defaultConfigs.find(c => c.key === key)

      await api.admin.saveConfiguration({
        category: activeCategory,
        key,
        value: encrypted && !value ? undefined : value, // Don't update if encrypted and empty
        encrypted: encrypted || configDef?.encrypted || false,
        description: configDef?.description,
        isActive: true
      }, token)

      await loadConfigurations()
      setEditingConfig(null)
      setTestResult(null)
    } catch (error) {
      alert('Failed to save configuration: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async (key: string, testType: string) => {
    if (!token) return
    try {
      setTesting(key)
      setTestResult(null)

      let testData: any = {}

      // Prepare test data based on category and key
      if (activeCategory === 'machine_translation') {
        testData = {
          provider: key.includes('google') ? 'google' : key.includes('deepl') ? 'deepl' : 'azure',
          sourceText: 'Hello, world!',
          sourceLang: 'en',
          targetLang: 'es'
        }
      } else if (activeCategory === 'webhooks' && key === 'default_url') {
        testData = {}
      } else if (activeCategory === 'payment' && key === 'stripe_secret_key') {
        testData = {}
      }

      const result = await api.admin.testConfiguration(activeCategory, key, testType, testData, token)
      setTestResult({ key, ...result.testResult })
    } catch (error) {
      setTestResult({
        key,
        success: false,
        message: error instanceof Error ? error.message : 'Test failed'
      })
    } finally {
      setTesting(null)
    }
  }

  const getTestType = (category: ConfigurationCategory, key: string): string => {
    if (category === 'payment' && key.includes('stripe')) return 'payment'
    if (category === 'machine_translation') return 'machine_translation'
    if (category === 'email') return 'email'
    if (category === 'sms') return 'sms'
    if (category === 'webhooks') return 'webhook'
    return 'general'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400">Loading configurations...</div>
      </div>
    )
  }

  const categoryConfig = CATEGORY_CONFIGS[activeCategory]
  const categoryConfigs = configurations.filter(c => c.category === activeCategory)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">System Configuration</h1>
          <p className="text-gray-400 mt-1">Manage system-wide settings and integrations</p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-800 pb-4">
        {(Object.keys(CATEGORY_CONFIGS) as ConfigurationCategory[]).map(category => (
          <button
            key={category}
            onClick={() => {
              setActiveCategory(category)
              setEditingConfig(null)
              setTestResult(null)
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeCategory === category
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-750'
              }`}
          >
            {CATEGORY_CONFIGS[category].label}
          </button>
        ))}
      </div>

      {/* Category Description */}
      <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
        <h2 className="text-lg font-semibold text-white mb-1">{categoryConfig.label}</h2>
        <p className="text-gray-400 text-sm">{categoryConfig.description}</p>
      </div>

      {/* Configurations List */}
      <div className="space-y-4">
        {categoryConfig.defaultConfigs.map(configDef => {
          const existingConfig = categoryConfigs.find(c => c.key === configDef.key)
          const isEditing = editingConfig?.key === configDef.key
          const value = isEditing
            ? editingConfig.value
            : existingConfig
              ? (existingConfig.encrypted ? '[ENCRYPTED]' : existingConfig.value || '')
              : ''
          const isEncrypted = configDef.encrypted || existingConfig?.encrypted || false

          return (
            <div key={configDef.key} className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-medium">{configDef.label}</h3>
                    {isEncrypted && (
                      <span className="px-2 py-0.5 bg-yellow-600/20 text-yellow-400 text-xs rounded">Encrypted</span>
                    )}
                    {existingConfig && !existingConfig.isActive && (
                      <span className="px-2 py-0.5 bg-gray-600/20 text-gray-400 text-xs rounded">Inactive</span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm">{configDef.description}</p>
                  {existingConfig && (
                    <p className="text-gray-500 text-xs mt-1">
                      Last updated: {new Date(existingConfig.updatedAt).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {getTestType(activeCategory, configDef.key) !== 'general' && (
                    <button
                      onClick={() => handleTest(configDef.key, getTestType(activeCategory, configDef.key))}
                      disabled={testing === configDef.key || !existingConfig}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {testing === configDef.key ? 'Testing...' : 'Test'}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setEditingConfig({
                        category: activeCategory,
                        key: configDef.key,
                        value: existingConfig && !existingConfig.encrypted ? existingConfig.value || '' : '',
                        encrypted: isEncrypted
                      })
                      setTestResult(null)
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                  >
                    {existingConfig ? 'Edit' : 'Add'}
                  </button>
                </div>
              </div>

              {/* Test Result */}
              {testResult && testResult.key === configDef.key && (
                <div className={`mb-3 p-3 rounded-lg border ${testResult.success
                  ? 'bg-green-900/20 border-green-600 text-green-300'
                  : 'bg-red-900/20 border-red-600 text-red-300'
                  }`}>
                  <p className="text-sm font-medium">{testResult.success ? '✓ Test Passed' : '✗ Test Failed'}</p>
                  <p className="text-xs mt-1">{testResult.message}</p>
                  {testResult.result && (
                    <pre className="text-xs mt-2 bg-gray-800 p-2 rounded overflow-auto">
                      {JSON.stringify(testResult.result, null, 2)}
                    </pre>
                  )}
                </div>
              )}

              {/* Edit Form */}
              {isEditing && (
                <div className="mt-4 pt-4 border-t border-gray-800">
                  <div className="space-y-3">
                    {configDef.type === 'boolean' ? (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingConfig.value === 'true'}
                          onChange={(e) => setEditingConfig({ ...editingConfig, value: e.target.checked ? 'true' : 'false' })}
                          className="rounded bg-gray-800 border-gray-700"
                        />
                        <span className="text-gray-300 text-sm">Enabled</span>
                      </label>
                    ) : (
                      <input
                        type={configDef.type === 'password' || isEncrypted ? 'password' : configDef.type === 'number' ? 'number' : 'text'}
                        value={editingConfig.value}
                        onChange={(e) => setEditingConfig({ ...editingConfig, value: e.target.value })}
                        placeholder={isEncrypted && !existingConfig ? 'Enter new value' : `Enter ${configDef.label.toLowerCase()}`}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      />
                    )}
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingConfig(null)
                          setTestResult(null)
                        }}
                        className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                        disabled={saving}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSave(editingConfig.key, editingConfig.value, editingConfig.encrypted)}
                        disabled={saving || (configDef.required && !editingConfig.value)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Display Value (when not editing) */}
              {!isEditing && (
                <div className="mt-2">
                  <div className="bg-gray-800 rounded-lg px-3 py-2">
                    <code className="text-sm text-gray-300 break-all">
                      {value || <span className="text-gray-500 italic">Not configured</span>}
                    </code>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

