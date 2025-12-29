'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import BuildsSubTab from './BuildsSubTab'
import LocalizationImport from './LocalizationImport'
import LocalizationExport from './LocalizationExport'
import LocalizationStatistics from './LocalizationStatistics'
import LocalizationBulkOperations from './LocalizationBulkOperations'
import LocalizationProviderSettings from './LocalizationProviderSettings'
import LocalizationComments from './LocalizationComments'
import LocalizationHistory from './LocalizationHistory'
import LocalizationGlossary from './LocalizationGlossary'

interface Language {
  id: string
  code: string
  name: string
  nativeName: string | null
  isDefault: boolean
  isEnabled: boolean
  isRTL: boolean
  createdAt: string
}

interface Translation {
  id: string
  value: string
  isReviewed: boolean
  language: {
    id: string
    code: string
    name: string
  }
}

interface LocalizationKey {
  id: string
  key: string
  description: string | null
  category: string | null
  platform: string | null
  maxLength: number | null
  screenshot: string | null
  createdAt: string
  translations: Translation[]
}

interface LocalizationTabProps {
  projectId: string
  token: string
  sharedUsage?: {
    localizationLanguages?: { used: number; limit: number | null; percentage: number }
    localizationKeys?: { used: number; limit: number | null; percentage: number }
  } | null
}

// Common languages with RTL info
const COMMON_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', isRTL: false },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', isRTL: true },
  { code: 'es', name: 'Spanish', nativeName: 'Español', isRTL: false },
  { code: 'fr', name: 'French', nativeName: 'Français', isRTL: false },
  { code: 'de', name: 'German', nativeName: 'Deutsch', isRTL: false },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', isRTL: false },
  { code: 'zh', name: 'Chinese', nativeName: '中文', isRTL: false },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', isRTL: false },
  { code: 'ko', name: 'Korean', nativeName: '한국어', isRTL: false },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', isRTL: false },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', isRTL: false },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', isRTL: false },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', isRTL: true },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', isRTL: true },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', isRTL: true },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', isRTL: false },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', isRTL: false },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', isRTL: false },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', isRTL: false },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', isRTL: false },
]

export default function LocalizationTab({ projectId, token, sharedUsage }: LocalizationTabProps) {
  const router = useRouter()
  const [languages, setLanguages] = useState<Language[]>([])
  const [keys, setKeys] = useState<LocalizationKey[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Quota enforcement state (from shared usage prop)
  const localizationLanguagesUsage = sharedUsage?.localizationLanguages || null
  const localizationKeysUsage = sharedUsage?.localizationKeys || null

  // UI state - reorganized as tabs
  const [activeSubTab, setActiveSubTab] = useState<'keys' | 'languages' | 'import-export' | 'builds' | 'statistics' | 'providers' | 'glossary'>('keys')
  const [showAddLanguage, setShowAddLanguage] = useState(false)
  const [showAddKey, setShowAddKey] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [showBulkOperations, setShowBulkOperations] = useState(false)
  const [showProviderSettings, setShowProviderSettings] = useState(false)
  const [showGlossary, setShowGlossary] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [selectedTranslationForComments, setSelectedTranslationForComments] = useState<string | null>(null)
  const [selectedTranslationForHistory, setSelectedTranslationForHistory] = useState<{ translationId?: string; keyId?: string } | null>(null)
  const [editingKey, setEditingKey] = useState<LocalizationKey | null>(null)
  const [editingTranslation, setEditingTranslation] = useState<{ keyId: string; languageId: string; value: string } | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [translatingKey, setTranslatingKey] = useState<{ keyId: string; targetLanguageId: string } | null>(null)
  const [tmSuggestions, setTmSuggestions] = useState<Array<{ targetText: string; similarity: number }>>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)

  // Form state
  const [newLanguage, setNewLanguage] = useState({ code: '', name: '', nativeName: '', isRTL: false })
  const [newKey, setNewKey] = useState({ key: '', description: '', category: '' })
  const [saving, setSaving] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [languagesRes, keysRes] = await Promise.all([
        api.localization.getLanguages(projectId, token),
        api.localization.getKeys(projectId, token)
      ])
      setLanguages(languagesRes.languages)
      setKeys(keysRes.keys)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load localization data')
    } finally {
      setLoading(false)
    }
  }, [projectId, token])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Usage data comes from sharedUsage prop (fetched once at top level)

  // Get unique categories
  const categories = [...new Set(keys.map(k => k.category).filter(Boolean))] as string[]

  // Filter keys by category
  const filteredKeys = selectedCategory
    ? keys.filter(k => k.category === selectedCategory)
    : keys

  // Group keys by category
  const groupedKeys = filteredKeys.reduce((acc, key) => {
    const cat = key.category || 'Uncategorized'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(key)
    return acc
  }, {} as Record<string, LocalizationKey[]>)

  const handleAddLanguage = async () => {
    if (!newLanguage.code || !newLanguage.name) return

    try {
      setSaving(true)
      await api.localization.createLanguage(projectId, token, {
        code: newLanguage.code,
        name: newLanguage.name,
        nativeName: newLanguage.nativeName || undefined,
        isRTL: newLanguage.isRTL,
        isDefault: languages.length === 0 // First language is default
      })
      setNewLanguage({ code: '', name: '', nativeName: '', isRTL: false })
      setShowAddLanguage(false)
      fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add language')
    } finally {
      setSaving(false)
    }
  }

  const handleSetDefault = async (languageId: string) => {
    try {
      setSaving(true)
      await api.localization.updateLanguage(token, { id: languageId, isDefault: true })
      fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set default language')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleLanguage = async (language: Language) => {
    try {
      setSaving(true)
      await api.localization.updateLanguage(token, { id: language.id, isEnabled: !language.isEnabled })
      fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle language')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteLanguage = async (languageId: string) => {
    if (!confirm('Are you sure you want to delete this language? All translations will be lost.')) return

    try {
      setSaving(true)
      await api.localization.deleteLanguage(languageId, token)
      fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete language')
    } finally {
      setSaving(false)
    }
  }

  const handleAddKey = async () => {
    if (!newKey.key) return

    try {
      setSaving(true)
      await api.localization.createKey(projectId, token, {
        key: newKey.key,
        description: newKey.description || undefined,
        category: newKey.category || undefined
      })
      setNewKey({ key: '', description: '', category: '' })
      setShowAddKey(false)
      fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add key')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateKey = async () => {
    if (!editingKey) return

    try {
      setSaving(true)
      await api.localization.updateKey(token, {
        id: editingKey.id,
        key: editingKey.key,
        description: editingKey.description || undefined,
        category: editingKey.category || undefined
      })
      setEditingKey(null)
      fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update key')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this key? All translations will be lost.')) return

    try {
      setSaving(true)
      await api.localization.deleteKey(keyId, token)
      fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete key')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveTranslation = async () => {
    if (!editingTranslation) return

    try {
      setSaving(true)
      await api.localization.saveTranslation(token, {
        keyId: editingTranslation.keyId,
        languageId: editingTranslation.languageId,
        value: editingTranslation.value
      })
      setEditingTranslation(null)
      fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save translation')
    } finally {
      setSaving(false)
    }
  }

  const selectCommonLanguage = (lang: typeof COMMON_LANGUAGES[0]) => {
    setNewLanguage({
      code: lang.code,
      name: lang.name,
      nativeName: lang.nativeName,
      isRTL: lang.isRTL
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
          {error}
          <button onClick={() => setError(null)} className="float-right">&times;</button>
        </div>
      )}

      {/* Sub-tabs */}
      <div className="border-b border-gray-800">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveSubTab('keys')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeSubTab === 'keys'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Keys ({keys.length})
          </button>
          <button
            onClick={() => setActiveSubTab('languages')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeSubTab === 'languages'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Languages ({languages.length})
          </button>
          <button
            onClick={() => setActiveSubTab('import-export')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeSubTab === 'import-export'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Import/Export
          </button>
          <button
            onClick={() => setActiveSubTab('builds')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeSubTab === 'builds'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Builds
          </button>
          <button
            onClick={() => setActiveSubTab('statistics')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeSubTab === 'statistics'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Statistics
          </button>
          <button
            onClick={() => setActiveSubTab('providers')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeSubTab === 'providers'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Providers
          </button>
          <button
            onClick={() => setActiveSubTab('glossary')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeSubTab === 'glossary'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Glossary
          </button>
        </nav>
      </div>

      {/* Keys Sub-tab */}
      {activeSubTab === 'keys' && (
        <div className="space-y-6">
          {/* Enforcement Banner for Localization Keys */}
          {localizationKeysUsage && localizationKeysUsage.limit !== null && (
            <>
              {(() => {
                const percentage = localizationKeysUsage.percentage
                const warnThreshold = 80
                const hardThreshold = 100
                
                if (percentage >= hardThreshold) {
                  return (
                    <div className="bg-red-900/20 border-l-4 border-red-600 p-4 rounded mb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
                            <span>🚫</span>
                            <span>Localization Keys Quota Exceeded</span>
                          </h3>
                          <p className="text-gray-300 text-sm mb-2">
                            You have reached your localization keys limit: <strong>{localizationKeysUsage.used}/{localizationKeysUsage.limit} keys</strong> ({percentage.toFixed(1)}%).
                          </p>
                          <p className="text-gray-300 text-sm">
                            New localization keys will be blocked. Please upgrade your plan to create more keys.
                          </p>
                        </div>
                        <button
                          onClick={() => router.push('/subscription')}
                          className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm whitespace-nowrap"
                        >
                          Upgrade Plan
                        </button>
                      </div>
                    </div>
                  )
                } else if (percentage >= warnThreshold) {
                  return (
                    <div className="bg-yellow-900/20 border-l-4 border-yellow-600 p-4 rounded mb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-yellow-400 font-semibold mb-2 flex items-center gap-2">
                            <span>⚠️</span>
                            <span>Approaching Localization Keys Limit</span>
                          </h3>
                          <p className="text-gray-300 text-sm mb-2">
                            You are approaching your localization keys limit: <strong>{localizationKeysUsage.used}/{localizationKeysUsage.limit} keys</strong> ({percentage.toFixed(1)}%).
                          </p>
                          <p className="text-gray-300 text-sm">
                            You can create {Math.max(0, localizationKeysUsage.limit - localizationKeysUsage.used)} more key{localizationKeysUsage.limit - localizationKeysUsage.used !== 1 ? 's' : ''} before reaching your limit.
                          </p>
                        </div>
                        <button
                          onClick={() => router.push('/subscription')}
                          className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm whitespace-nowrap"
                        >
                          Upgrade Plan
                        </button>
                      </div>
                    </div>
                  )
                }
                return null
              })()}
            </>
          )}
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-white">Translation Keys</h2>
              {categories.length > 0 && (
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-gray-800 text-gray-300 px-3 py-1.5 rounded-lg border border-gray-700 text-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowAddKey(true)}
                disabled={localizationKeysUsage && localizationKeysUsage.limit !== null && localizationKeysUsage.percentage >= 100}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                + Add Key
              </button>
            </div>
          </div>

          {/* Keys Content */}
          <div className="space-y-4">
            {/* Category Filter */}
            {categories.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-gray-400 text-sm">Filter:</span>
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`px-3 py-1 rounded-full text-sm ${
                    !selectedCategory ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  All
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {keys.length === 0 ? (
              <div className="text-center py-12 bg-gray-900 rounded-lg">
                <p className="text-gray-400 mb-4">No translation keys yet</p>
                {languages.length === 0 ? (
                  <p className="text-gray-500 text-sm">Add a language first before creating keys</p>
                ) : (
                  <button
                    onClick={() => setShowAddKey(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add Your First Key
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedKeys).map(([category, categoryKeys]) => (
                  <div key={category} className="bg-gray-900 rounded-lg overflow-hidden">
                    <div className="px-4 py-3 bg-gray-800/50 border-b border-gray-800">
                      <h3 className="text-gray-300 font-medium flex items-center gap-2">
                        {category}
                        <span className="px-2 py-0.5 bg-gray-700 text-gray-400 text-xs rounded-full">
                          {categoryKeys.length}
                        </span>
                      </h3>
                    </div>
                    <div className="divide-y divide-gray-800">
                      {categoryKeys.map(key => (
                        <div key={key.id} className="p-4">
                          <div className="flex items-start justify-between mb-3 gap-4">
                            <div className="flex-1 min-w-0">
                              <code className="text-blue-400 font-mono text-sm bg-blue-900/20 px-2 py-0.5 rounded break-words block w-full">
                                {key.key}
                              </code>
                              {key.description && (
                                <p className="text-gray-500 text-sm mt-1 break-words">{key.description}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                onClick={() => setEditingKey({ ...key })}
                                className="text-gray-400 hover:text-white p-1"
                                title="Edit key"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteKey(key.id)}
                                className="text-gray-400 hover:text-red-400 p-1"
                                title="Delete key"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>

                          {/* Translations Grid */}
                          <div className="space-y-2">
                            {languages.filter(l => l.isEnabled).map(lang => {
                              const translation = key.translations.find(t => t.language.id === lang.id)
                              const isEditing = editingTranslation?.keyId === key.id && editingTranslation?.languageId === lang.id
                              const hasTranslation = translation?.value && translation.value.trim().length > 0

                              return (
                                <div key={lang.id} className="bg-gray-800/50 rounded-lg p-3">
                                  <div className="flex items-start gap-3">
                                    {/* Language Code Badge */}
                                    <div className="w-12 h-6 flex items-center justify-center bg-gray-700 rounded flex-shrink-0">
                                      <span className="text-xs font-semibold text-gray-300">{lang.code.toUpperCase()}</span>
                                    </div>
                                    
                                    {/* Translation Content */}
                                    <div className="flex-1 min-w-0">
                                      {isEditing ? (
                                        <div className="space-y-2">
                                          <input
                                            type="text"
                                            value={editingTranslation?.value || ''}
                                            onChange={(e) => setEditingTranslation(prev => prev ? { ...prev, value: e.target.value } : null)}
                                            placeholder="Enter translation..."
                                            className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded text-sm focus:outline-none focus:border-blue-500"
                                            dir={lang.isRTL ? 'rtl' : 'ltr'}
                                            autoFocus
                                          />
                                          <div className="flex items-center gap-2">
                                            <button
                                              onClick={async () => {
                                                if (!editingTranslation) return
                                                try {
                                                  setSaving(true)
                                                  await api.localization.updateTranslation(token, {
                                                    keyId: editingTranslation.keyId,
                                                    languageId: editingTranslation.languageId,
                                                    value: editingTranslation.value.trim()
                                                  })
                                                  setEditingTranslation(null)
                                                  await fetchData()
                                                } catch (err) {
                                                  alert('Failed to update translation: ' + (err instanceof Error ? err.message : 'Unknown error'))
                                                } finally {
                                                  setSaving(false)
                                                }
                                              }}
                                              disabled={saving}
                                              className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                                            >
                                              {saving ? 'Saving...' : 'Save'}
                                            </button>
                                            <button
                                              onClick={() => setEditingTranslation(null)}
                                              disabled={saving}
                                              className="px-3 py-1.5 bg-gray-700 text-white rounded text-sm hover:bg-gray-600 disabled:opacity-50 flex-shrink-0"
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="flex items-start justify-between gap-3">
                                          <div className="flex-1 min-w-0">
                                            {hasTranslation ? (
                                              <p 
                                                className="text-white text-sm break-words"
                                                dir={lang.isRTL ? 'rtl' : 'ltr'}
                                              >
                                                {translation.value}
                                              </p>
                                            ) : (
                                              <p className="text-gray-500 text-sm italic">No translation</p>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-2 flex-shrink-0">
                                            {translation?.isReviewed && (
                                              <span className="px-2 py-0.5 bg-green-600/20 text-green-400 text-xs rounded whitespace-nowrap">Reviewed</span>
                                            )}
                                            <button
                                              onClick={() => setEditingTranslation({
                                                keyId: key.id,
                                                languageId: lang.id,
                                                value: translation?.value?.trim() || ''
                                              })}
                                              className="text-gray-400 hover:text-blue-400 p-1.5 flex-shrink-0 transition-colors"
                                              title="Edit translation"
                                            >
                                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                              </svg>
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Languages Sub-tab */}
      {activeSubTab === 'languages' && (
        <div className="space-y-6">
          {/* Enforcement Banner for Localization Languages */}
          {localizationLanguagesUsage && localizationLanguagesUsage.limit !== null && (
            <>
              {(() => {
                const percentage = localizationLanguagesUsage.percentage
                const warnThreshold = 80
                const hardThreshold = 100
                
                if (percentage >= hardThreshold) {
                  return (
                    <div className="bg-red-900/20 border-l-4 border-red-600 p-4 rounded mb-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
                            <span>🚫</span>
                            <span>Localization Languages Quota Exceeded</span>
                          </h3>
                          <p className="text-gray-300 text-sm mb-2">
                            You have reached your localization languages limit: <strong>{localizationLanguagesUsage.used}/{localizationLanguagesUsage.limit} languages</strong> ({percentage.toFixed(1)}%).
                          </p>
                          <p className="text-gray-300 text-sm">
                            New languages will be blocked. Please upgrade your plan to add more languages.
                          </p>
                        </div>
                        <button
                          onClick={() => router.push('/subscription')}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm whitespace-nowrap flex-shrink-0"
                        >
                          Upgrade Plan
                        </button>
                      </div>
                    </div>
                  )
                } else if (percentage >= warnThreshold) {
                  return (
                    <div className="bg-yellow-900/20 border-l-4 border-yellow-600 p-4 rounded mb-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-yellow-400 font-semibold mb-2 flex items-center gap-2">
                            <span>⚠️</span>
                            <span>Approaching Localization Languages Limit</span>
                          </h3>
                          <p className="text-gray-300 text-sm mb-2">
                            You are approaching your localization languages limit: <strong>{localizationLanguagesUsage.used}/{localizationLanguagesUsage.limit} languages</strong> ({percentage.toFixed(1)}%).
                          </p>
                          <p className="text-gray-300 text-sm">
                            You can add {Math.max(0, localizationLanguagesUsage.limit - localizationLanguagesUsage.used)} more language{localizationLanguagesUsage.limit - localizationLanguagesUsage.used !== 1 ? 's' : ''} before reaching your limit.
                          </p>
                        </div>
                        <button
                          onClick={() => router.push('/subscription')}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm whitespace-nowrap flex-shrink-0"
                        >
                          Upgrade Plan
                        </button>
                      </div>
                    </div>
                  )
                }
                return null
              })()}
            </>
          )}
          {/* Header */}
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-white">Languages</h2>
            <button
              onClick={() => setShowAddLanguage(true)}
              disabled={localizationLanguagesUsage && localizationLanguagesUsage.limit !== null && localizationLanguagesUsage.percentage >= 100}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              + Add Language
            </button>
          </div>

          {/* Languages Content */}
          {languages.length === 0 ? (
            <div className="text-center py-12 bg-gray-900 rounded-lg">
              <p className="text-gray-400 mb-4">No languages configured yet</p>
              <button
                onClick={() => setShowAddLanguage(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Your First Language
              </button>
            </div>
          ) : (
            <div className="grid gap-3">
              {languages.map(lang => (
                <div
                  key={lang.id}
                  className="bg-gray-900 rounded-lg p-4 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center text-lg font-bold text-gray-300 flex-shrink-0">
                      {lang.code.toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-medium break-words">{lang.name}</span>
                        {lang.nativeName && lang.nativeName !== lang.name && (
                          <span className="text-gray-500 break-words">({lang.nativeName})</span>
                        )}
                        {lang.isDefault && (
                          <span className="px-2 py-0.5 bg-green-600/20 text-green-400 text-xs rounded-full whitespace-nowrap">Default</span>
                        )}
                        {lang.isRTL && (
                          <span className="px-2 py-0.5 bg-purple-600/20 text-purple-400 text-xs rounded-full whitespace-nowrap">RTL</span>
                        )}
                        {!lang.isEnabled && (
                          <span className="px-2 py-0.5 bg-gray-600/20 text-gray-400 text-xs rounded-full whitespace-nowrap">Disabled</span>
                        )}
                      </div>
                      <p className="text-gray-500 text-sm break-words">Code: {lang.code}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!lang.isDefault && (
                      <button
                        onClick={() => handleSetDefault(lang.id)}
                        className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors whitespace-nowrap"
                        disabled={saving}
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => handleToggleLanguage(lang)}
                      className={`px-3 py-1.5 text-sm rounded transition-colors whitespace-nowrap ${
                        lang.isEnabled
                          ? 'text-yellow-400 hover:text-yellow-300'
                          : 'text-green-400 hover:text-green-300'
                      }`}
                      disabled={saving}
                    >
                      {lang.isEnabled ? 'Disable' : 'Enable'}
                    </button>
                    {!lang.isDefault && (
                      <button
                        onClick={() => handleDeleteLanguage(lang.id)}
                        className="px-3 py-1.5 text-sm text-red-400 hover:text-red-300 transition-colors whitespace-nowrap"
                        disabled={saving}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Import/Export Sub-tab */}
      {activeSubTab === 'import-export' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Import & Export</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setShowImport(true)}
              className="p-6 bg-gray-900 rounded-lg border border-gray-800 hover:border-blue-600 transition-colors text-left"
            >
              <div className="flex items-center gap-3 mb-2">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <h4 className="text-white font-medium">Import</h4>
              </div>
              <p className="text-gray-400 text-sm">Import translations from CSV, JSON, or XLIFF files</p>
            </button>
            <button
              onClick={() => setShowExport(true)}
              className="p-6 bg-gray-900 rounded-lg border border-gray-800 hover:border-blue-600 transition-colors text-left"
            >
              <div className="flex items-center gap-3 mb-2">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <h4 className="text-white font-medium">Export</h4>
              </div>
              <p className="text-gray-400 text-sm">Export translations to CSV, JSON, or XLIFF format</p>
            </button>
            <button
              onClick={() => setShowBulkOperations(true)}
              className="p-6 bg-gray-900 rounded-lg border border-gray-800 hover:border-blue-600 transition-colors text-left"
            >
              <div className="flex items-center gap-3 mb-2">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <h4 className="text-white font-medium">Bulk Operations</h4>
              </div>
              <p className="text-gray-400 text-sm">Perform bulk updates, assignments, and translations</p>
            </button>
          </div>
        </div>
      )}

      {/* Builds Sub-tab */}
      {activeSubTab === 'builds' && (
        <BuildsSubTab 
          projectId={projectId} 
          featureType="localization" 
          featureLabel="Localization"
          token={token}
        />
      )}

      {/* Statistics Sub-tab */}
      {activeSubTab === 'statistics' && (
        <LocalizationStatistics projectId={projectId} token={token} />
      )}

      {/* Providers Sub-tab */}
      {activeSubTab === 'providers' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Translation Providers</h3>
            <button
              onClick={() => setShowProviderSettings(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Configure Providers
            </button>
          </div>
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <p className="text-gray-400 text-center py-8">
              Configure machine translation providers to enable automatic translations.
            </p>
          </div>
        </div>
      )}

      {/* Glossary Sub-tab */}
      {activeSubTab === 'glossary' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Glossary</h3>
            <button
              onClick={() => setShowGlossary(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Manage Glossary
            </button>
          </div>
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <p className="text-gray-400 text-center py-8">
              Manage terminology and glossary terms for consistent translations.
            </p>
          </div>
        </div>
      )}

      {/* Add Language Modal */}
      {showAddLanguage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg w-full max-w-md">
            <div className="p-4 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-white">Add Language</h3>
            </div>
            <div className="p-4 space-y-4">
              {/* Quick select common languages */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Quick Select</label>
                <div className="flex flex-wrap gap-1">
                  {COMMON_LANGUAGES.slice(0, 10).map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => selectCommonLanguage(lang)}
                      className={`px-2 py-1 text-xs rounded ${
                        newLanguage.code === lang.code
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      {lang.code.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Language Code *</label>
                <input
                  type="text"
                  value={newLanguage.code}
                  onChange={(e) => setNewLanguage({ ...newLanguage, code: e.target.value.toLowerCase() })}
                  placeholder="e.g., en, ar, es"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Display Name *</label>
                <input
                  type="text"
                  value={newLanguage.name}
                  onChange={(e) => setNewLanguage({ ...newLanguage, name: e.target.value })}
                  placeholder="e.g., English, Arabic"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Native Name</label>
                <input
                  type="text"
                  value={newLanguage.nativeName}
                  onChange={(e) => setNewLanguage({ ...newLanguage, nativeName: e.target.value })}
                  placeholder="e.g., العربية"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newLanguage.isRTL}
                  onChange={(e) => setNewLanguage({ ...newLanguage, isRTL: e.target.checked })}
                  className="rounded bg-gray-800 border-gray-700"
                />
                <span className="text-gray-300 text-sm">Right-to-Left (RTL) Language</span>
              </label>
            </div>
            <div className="p-4 border-t border-gray-800 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowAddLanguage(false)
                  setNewLanguage({ code: '', name: '', nativeName: '', isRTL: false })
                }}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAddLanguage}
                disabled={!newLanguage.code || !newLanguage.name || saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Adding...' : 'Add Language'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Key Modal */}
      {showAddKey && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg w-full max-w-md">
            <div className="p-4 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-white">Add Translation Key</h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Key *</label>
                <input
                  type="text"
                  value={newKey.key}
                  onChange={(e) => setNewKey({ ...newKey, key: e.target.value })}
                  placeholder="e.g., welcome_message, button.submit"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <input
                  type="text"
                  value={newKey.description}
                  onChange={(e) => setNewKey({ ...newKey, description: e.target.value })}
                  placeholder="Describe where this key is used"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Category</label>
                <input
                  type="text"
                  value={newKey.category}
                  onChange={(e) => setNewKey({ ...newKey, category: e.target.value })}
                  placeholder="e.g., buttons, errors, screens"
                  list="categories"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
                <datalist id="categories">
                  {categories.map(cat => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>
            </div>
            <div className="p-4 border-t border-gray-800 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowAddKey(false)
                  setNewKey({ key: '', description: '', category: '' })
                }}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAddKey}
                disabled={!newKey.key || saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Adding...' : 'Add Key'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Key Modal */}
      {editingKey && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg w-full max-w-md">
            <div className="p-4 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-white">Edit Translation Key</h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Key *</label>
                <input
                  type="text"
                  value={editingKey.key}
                  onChange={(e) => setEditingKey({ ...editingKey, key: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <input
                  type="text"
                  value={editingKey.description || ''}
                  onChange={(e) => setEditingKey({ ...editingKey, description: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Category</label>
                <input
                  type="text"
                  value={editingKey.category || ''}
                  onChange={(e) => setEditingKey({ ...editingKey, category: e.target.value })}
                  list="categories-edit"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
                <datalist id="categories-edit">
                  {categories.map(cat => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>
            </div>
            <div className="p-4 border-t border-gray-800 flex justify-end gap-2">
              <button
                onClick={() => setEditingKey(null)}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateKey}
                disabled={!editingKey.key || saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
            </div>
          </div>
        )}

      {/* Statistics View */}

      {/* Import Modal */}
      {showImport && (
        <LocalizationImport
          projectId={projectId}
          token={token}
          languages={languages}
          onSuccess={fetchData}
          onClose={() => setShowImport(false)}
        />
      )}

      {/* Export Modal */}
      {showExport && (
        <LocalizationExport
          projectId={projectId}
          token={token}
          languages={languages}
          categories={categories}
          onClose={() => setShowExport(false)}
        />
      )}

      {/* Bulk Operations Modal */}
      {showBulkOperations && (
        <LocalizationBulkOperations
          projectId={projectId}
          token={token}
          keys={keys}
          languages={languages}
          onSuccess={fetchData}
          onClose={() => setShowBulkOperations(false)}
        />
      )}

      {/* Provider Settings Modal */}
      {showProviderSettings && (
        <LocalizationProviderSettings
          projectId={projectId}
          token={token}
          languages={languages}
          onClose={() => setShowProviderSettings(false)}
        />
      )}

      {/* Glossary Modal */}
      {showGlossary && (
        <LocalizationGlossary
          projectId={projectId}
          token={token}
          languages={languages}
          onClose={() => setShowGlossary(false)}
        />
      )}

      {/* Comments Modal */}
      {showComments && selectedTranslationForComments && (
        <LocalizationComments
          translationId={selectedTranslationForComments}
          projectId={projectId}
          token={token}
          onClose={() => {
            setShowComments(false)
            setSelectedTranslationForComments(null)
          }}
        />
      )}

      {/* History Modal */}
      {showHistory && selectedTranslationForHistory && (
        <LocalizationHistory
          projectId={projectId}
          translationId={selectedTranslationForHistory.translationId}
          keyId={selectedTranslationForHistory.keyId}
          token={token}
          onClose={() => {
            setShowHistory(false)
            setSelectedTranslationForHistory(null)
          }}
        />
      )}
    </div>
  )
}
