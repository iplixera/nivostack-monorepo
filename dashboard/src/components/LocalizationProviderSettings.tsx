'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

interface LocalizationProviderSettingsProps {
  projectId: string
  token: string
  languages: Array<{ id: string; code: string; name: string }>
  onClose: () => void
}

type Provider = 'google' | 'deepl' | 'azure' | 'manual'

export default function LocalizationProviderSettings({
  projectId,
  token,
  languages,
  onClose
}: LocalizationProviderSettingsProps) {
  const [providers, setProviders] = useState<Array<{
    id: string
    provider: string
    isEnabled: boolean
    autoTranslate: boolean
    defaultSourceLanguageId: string | null
  }>>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null)
  const [formData, setFormData] = useState({
    apiKey: '',
    apiSecret: '',
    isEnabled: true,
    autoTranslate: false,
    defaultSourceLanguageId: ''
  })

  useEffect(() => {
    loadProviders()
  }, [])

  const loadProviders = async () => {
    try {
      setLoading(true)
      const data = await api.localization.getProviders(projectId, token)
      setProviders(data.providers)
    } catch (error) {
      console.error('Failed to load providers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditProvider = (provider: Provider) => {
    const existing = providers.find(p => p.provider === provider)
    setEditingProvider(provider)
    setFormData({
      apiKey: '',
      apiSecret: '',
      isEnabled: existing?.isEnabled ?? true,
      autoTranslate: existing?.autoTranslate ?? false,
      defaultSourceLanguageId: existing?.defaultSourceLanguageId || ''
    })
  }

  const handleSaveProvider = async () => {
    if (!editingProvider) return

    try {
      setSaving(true)
      await api.localization.createProvider(
        projectId,
        editingProvider,
        formData.apiKey || undefined,
        formData.apiSecret || undefined,
        formData.isEnabled,
        formData.autoTranslate,
        formData.defaultSourceLanguageId || undefined,
        token
      )
      setEditingProvider(null)
      setFormData({ apiKey: '', apiSecret: '', isEnabled: true, autoTranslate: false, defaultSourceLanguageId: '' })
      loadProviders()
    } catch (error) {
      alert('Failed to save provider: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-lg p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-2xl border border-gray-800">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Translation Providers</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {!editingProvider ? (
            <>
              <p className="text-gray-400 text-sm mb-4">
                Configure machine translation providers to automatically translate your keys.
              </p>
              <div className="space-y-3">
                {(['google', 'deepl', 'azure'] as Provider[]).map(provider => {
                  const existing = providers.find(p => p.provider === provider)
                  return (
                    <div
                      key={provider}
                      className="bg-gray-800 rounded-lg p-4 border border-gray-700 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium capitalize">{provider}</span>
                          {existing?.isEnabled && (
                            <span className="px-2 py-0.5 bg-green-600/20 text-green-400 text-xs rounded">Enabled</span>
                          )}
                          {existing?.autoTranslate && (
                            <span className="px-2 py-0.5 bg-blue-600/20 text-blue-400 text-xs rounded">Auto-translate</span>
                          )}
                        </div>
                        {existing && (
                          <p className="text-gray-500 text-sm mt-1">
                            Default source: {languages.find(l => l.id === existing.defaultSourceLanguageId || '')?.name || 'Not set'}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleEditProvider(provider)}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
                      >
                        {existing ? 'Edit' : 'Configure'}
                      </button>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-medium text-white mb-4 capitalize">Configure {editingProvider}</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">API Key</label>
                    <input
                      type="password"
                      value={formData.apiKey}
                      onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                      placeholder={`Enter ${editingProvider} API key`}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                    <p className="text-gray-500 text-xs mt-1">
                      Leave empty to keep existing key unchanged
                    </p>
                  </div>

                  {editingProvider === 'azure' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">API Secret / Region</label>
                      <input
                        type="password"
                        value={formData.apiSecret}
                        onChange={(e) => setFormData({ ...formData, apiSecret: e.target.value })}
                        placeholder="Enter Azure region or secret"
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Default Source Language</label>
                    <select
                      value={formData.defaultSourceLanguageId}
                      onChange={(e) => setFormData({ ...formData, defaultSourceLanguageId: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Select default source language</option>
                      {languages.map(lang => (
                        <option key={lang.id} value={lang.id}>{lang.name} ({lang.code})</option>
                      ))}
                    </select>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isEnabled}
                      onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
                      className="rounded bg-gray-800 border-gray-700"
                    />
                    <span className="text-gray-300 text-sm">Enable this provider</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.autoTranslate}
                      onChange={(e) => setFormData({ ...formData, autoTranslate: e.target.checked })}
                      className="rounded bg-gray-800 border-gray-700"
                    />
                    <span className="text-gray-300 text-sm">Auto-translate new keys</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                <button
                  onClick={() => {
                    setEditingProvider(null)
                    setFormData({ apiKey: '', apiSecret: '', isEnabled: true, autoTranslate: false, defaultSourceLanguageId: '' })
                  }}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProvider}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

