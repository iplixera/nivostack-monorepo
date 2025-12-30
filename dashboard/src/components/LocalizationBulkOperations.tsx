'use client'

import { useState } from 'react'
import { api } from '@/lib/api'

interface LocalizationBulkOperationsProps {
  projectId: string
  token: string
  keys: Array<{ id: string; key: string; category: string | null }>
  languages: Array<{ id: string; code: string; name: string }>
  onSuccess: () => void
  onClose: () => void
}

type BulkOperation = 
  | 'update_translations'
  | 'delete_keys'
  | 'assign_category'
  | 'enable_languages'
  | 'disable_languages'

export default function LocalizationBulkOperations({
  projectId,
  token,
  keys,
  languages,
  onSuccess,
  onClose
}: LocalizationBulkOperationsProps) {
  const [operation, setOperation] = useState<BulkOperation>('update_translations')
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())
  const [selectedLanguages, setSelectedLanguages] = useState<Set<string>>(new Set())
  const [category, setCategory] = useState('')
  const [translations, setTranslations] = useState<Array<{ keyId: string; languageId: string; value: string }>>([])
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSelectAllKeys = () => {
    if (selectedKeys.size === keys.length) {
      setSelectedKeys(new Set())
    } else {
      setSelectedKeys(new Set(keys.map(k => k.id)))
    }
  }

  const handleSelectAllLanguages = () => {
    if (selectedLanguages.size === languages.length) {
      setSelectedLanguages(new Set())
    } else {
      setSelectedLanguages(new Set(languages.map(l => l.id)))
    }
  }

  const handleAddTranslation = () => {
    if (selectedKeys.size === 0 || selectedLanguages.size === 0) {
      alert('Please select at least one key and one language')
      return
    }
    setTranslations([...translations, { keyId: '', languageId: '', value: '' }])
  }

  const handleExecute = async () => {
    try {
      setProcessing(true)
      setError(null)

      const filters: any = {}
      if (selectedKeys.size > 0) {
        filters.keyIds = Array.from(selectedKeys)
      }
      if (selectedLanguages.size > 0) {
        filters.languageIds = Array.from(selectedLanguages)
      }
      if (category) {
        filters.category = category
      }

      const updates: any = {}
      
      if (operation === 'update_translations') {
        updates.translations = translations.filter(t => t.keyId && t.languageId && t.value)
      } else if (operation === 'assign_category') {
        updates.category = category
      } else if (operation === 'enable_languages' || operation === 'disable_languages') {
        updates.isEnabled = operation === 'enable_languages'
      }

      const result = await api.localization.bulkEdit(token, {
        projectId,
        operation,
        filters,
        updates
      })

      if (result.errors && result.errors.length > 0) {
        setError(`Completed with ${result.errors.length} errors. ${result.errors.map(e => e.message).join(', ')}`)
      } else {
        alert(`Successfully ${operation.replace('_', ' ')} ${result.affected?.keys || 0} keys, ${result.affected?.translations || 0} translations`)
        onSuccess()
        onClose()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-800">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Bulk Operations</h3>
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

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-900/20 border border-red-600 text-red-300 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Operation Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Operation</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { value: 'update_translations', label: 'Update Translations' },
                { value: 'delete_keys', label: 'Delete Keys' },
                { value: 'assign_category', label: 'Assign Category' },
                { value: 'enable_languages', label: 'Enable Languages' },
                { value: 'disable_languages', label: 'Disable Languages' }
              ].map(op => (
                <button
                  key={op.value}
                  onClick={() => setOperation(op.value as BulkOperation)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                    operation === op.value
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-750'
                  }`}
                >
                  {op.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Select Keys</label>
              <div className="bg-gray-800 rounded-lg p-4 max-h-48 overflow-y-auto border border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-400">
                    {selectedKeys.size} of {keys.length} selected
                  </span>
                  <button
                    onClick={handleSelectAllKeys}
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    {selectedKeys.size === keys.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="space-y-2">
                  {keys.map(key => (
                    <label
                      key={key.id}
                      className="flex items-center gap-2 p-2 hover:bg-gray-700/50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedKeys.has(key.id)}
                        onChange={(e) => {
                          const newSet = new Set(selectedKeys)
                          if (e.target.checked) {
                            newSet.add(key.id)
                          } else {
                            newSet.delete(key.id)
                          }
                          setSelectedKeys(newSet)
                        }}
                        className="rounded bg-gray-700 border-gray-600"
                      />
                      <code className="text-sm text-gray-300">{key.key}</code>
                      {key.category && (
                        <span className="text-xs text-gray-500">({key.category})</span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {(operation === 'update_translations' || operation === 'enable_languages' || operation === 'disable_languages') && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Select Languages</label>
                <div className="bg-gray-800 rounded-lg p-4 max-h-48 overflow-y-auto border border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-400">
                      {selectedLanguages.size} of {languages.length} selected
                    </span>
                    <button
                      onClick={handleSelectAllLanguages}
                      className="text-sm text-blue-400 hover:text-blue-300"
                    >
                      {selectedLanguages.size === languages.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {languages.map(lang => (
                      <label
                        key={lang.id}
                        className="flex items-center gap-2 p-2 hover:bg-gray-700/50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedLanguages.has(lang.id)}
                          onChange={(e) => {
                            const newSet = new Set(selectedLanguages)
                            if (e.target.checked) {
                              newSet.add(lang.id)
                            } else {
                              newSet.delete(lang.id)
                            }
                            setSelectedLanguages(newSet)
                          }}
                          className="rounded bg-gray-700 border-gray-600"
                        />
                        <span className="text-sm text-gray-300">{lang.name}</span>
                        <span className="text-xs text-gray-500">({lang.code})</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {operation === 'assign_category' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Enter category name"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            )}

            {operation === 'update_translations' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-300">Translations</label>
                  <button
                    onClick={handleAddTranslation}
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    + Add Translation
                  </button>
                </div>
                <div className="space-y-2">
                  {translations.map((trans, idx) => (
                    <div key={idx} className="flex gap-2">
                      <select
                        value={trans.keyId}
                        onChange={(e) => {
                          const newTranslations = [...translations]
                          newTranslations[idx].keyId = e.target.value
                          setTranslations(newTranslations)
                        }}
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                      >
                        <option value="">Select Key</option>
                        {keys.map(k => (
                          <option key={k.id} value={k.id}>{k.key}</option>
                        ))}
                      </select>
                      <select
                        value={trans.languageId}
                        onChange={(e) => {
                          const newTranslations = [...translations]
                          newTranslations[idx].languageId = e.target.value
                          setTranslations(newTranslations)
                        }}
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                      >
                        <option value="">Select Language</option>
                        {languages.map(l => (
                          <option key={l.id} value={l.id}>{l.name}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={trans.value}
                        onChange={(e) => {
                          const newTranslations = [...translations]
                          newTranslations[idx].value = e.target.value
                          setTranslations(newTranslations)
                        }}
                        placeholder="Translation value"
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                      />
                      <button
                        onClick={() => setTranslations(translations.filter((_, i) => i !== idx))}
                        className="px-3 py-2 text-red-400 hover:text-red-300"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            disabled={processing}
          >
            Cancel
          </button>
          <button
            onClick={handleExecute}
            disabled={processing || (operation === 'update_translations' && translations.length === 0) || (operation === 'assign_category' && !category)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {processing ? 'Processing...' : 'Execute Operation'}
          </button>
        </div>
      </div>
    </div>
  )
}

