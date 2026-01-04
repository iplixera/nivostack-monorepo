'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { api } from '@/lib/api'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/layout/PageHeader'
import ThemeToggle from '@/components/ThemeToggle'

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

  const handleSave = async (key: string) => {
    if (!token) return
    setSaving(true)
    try {
      const value = formData[key] || ''
      await api.admin.updateConfiguration(token, activeCategory, key, value)
      alert('Configuration saved successfully!')
      await loadConfigurations()
    } catch (error) {
      alert('Failed to save configuration: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async (key: string) => {
    if (!token) return
    setTesting(key)
    setTestResult(null)
    try {
      const result = await api.admin.testConfiguration(token, activeCategory, key)
      setTestResult({ success: true, message: result.message || 'Test successful' })
    } catch (error) {
      setTestResult({ success: false, message: error instanceof Error ? error.message : 'Test failed' })
    } finally {
      setTesting(null)
    }
  }

  const categoryConfig = CATEGORY_CONFIGS[activeCategory]

  return (
    <AppShell>
      <PageHeader
        title="System Configurations"
        subtitle="Manage system-wide configuration settings"
        dataMode="Admin"
        actions={<ThemeToggle />}
      />

      {/* Category Tabs */}
      <div className="card" style={{ marginTop: '18px' }}>
        <div className="tabs">
          {(Object.keys(CATEGORY_CONFIGS) as ConfigurationCategory[]).map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`tab ${activeCategory === category ? 'active' : ''}`}
            >
              {CATEGORY_CONFIGS[category].label}
            </button>
          ))}
        </div>
      </div>

      {/* Category Description */}
      <div className="note" style={{ marginTop: '14px' }}>
        <b>{categoryConfig.label}</b>
        <div className="muted" style={{ marginTop: '6px' }}>
          {categoryConfig.description}
        </div>
      </div>

      {/* Configuration Form */}
      <div className="card" style={{ marginTop: '14px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--m)' }}>
            Loading configurations...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {categoryConfig.defaultConfigs.map((configDef) => {
              const existingConfig = configurations.find(c => c.key === configDef.key)
              const value = formData[configDef.key] || (existingConfig && !existingConfig.encrypted ? existingConfig.value : '')
              const isEncrypted = configDef.encrypted || existingConfig?.encrypted

              return (
                <div key={configDef.key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div>
                      <label className="muted" style={{ fontSize: '12px', display: 'block' }}>
                        {configDef.label}
                        {configDef.required && <span style={{ color: 'var(--d)' }}> *</span>}
                      </label>
                      <div className="muted" style={{ fontSize: '11px', marginTop: '4px' }}>
                        {configDef.description}
                      </div>
                    </div>
                    {existingConfig && (
                      <span className="chip">
                        <span className={`dot ${existingConfig.isActive ? 'good' : ''}`} />
                        {existingConfig.isActive ? 'Active' : 'Inactive'}
                      </span>
                    )}
                  </div>

                  {configDef.type === 'boolean' ? (
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={value === 'true' || value === '1'}
                        onChange={(e) => setFormData({ ...formData, [configDef.key]: e.target.checked ? 'true' : 'false' })}
                        style={{ borderRadius: '4px' }}
                      />
                      <span className="muted" style={{ fontSize: '12px' }}>Enabled</span>
                    </label>
                  ) : (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type={configDef.type === 'password' || isEncrypted ? 'password' : configDef.type === 'number' ? 'number' : 'text'}
                        className="input"
                        value={isEncrypted && !formData[configDef.key] ? '••••••••' : value}
                        onChange={(e) => setFormData({ ...formData, [configDef.key]: e.target.value })}
                        placeholder={isEncrypted ? 'Enter new value to update' : configDef.description}
                        disabled={isEncrypted && !formData[configDef.key]}
                      />
                      {existingConfig && (
                        <button
                          className="btn secondary"
                          onClick={() => handleTest(configDef.key)}
                          disabled={testing === configDef.key}
                        >
                          {testing === configDef.key ? 'Testing...' : 'Test'}
                        </button>
                      )}
                      <button
                        className="btn"
                        onClick={() => handleSave(configDef.key)}
                        disabled={saving || (isEncrypted && !formData[configDef.key])}
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  )}

                  {testResult && testResult.key === configDef.key && (
                    <div
                      className="card"
                      style={{
                        marginTop: '8px',
                        borderColor: testResult.success ? 'var(--a)' : 'var(--d)',
                        background: testResult.success ? 'rgba(34, 197, 94, 0.1)' : 'rgba(220, 38, 38, 0.1)',
                      }}
                    >
                      <div style={{ color: testResult.success ? 'var(--a)' : 'var(--d)', fontSize: '12px' }}>
                        {testResult.message}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AppShell>
  )
}
