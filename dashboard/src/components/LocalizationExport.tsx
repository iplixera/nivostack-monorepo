'use client'

import { useState } from 'react'
import { api } from '@/lib/api'

interface LocalizationExportProps {
  projectId: string
  token: string
  languages: Array<{ id: string; code: string; name: string }>
  categories: string[]
  onClose: () => void
}

export default function LocalizationExport({
  projectId,
  token,
  languages,
  categories,
  onClose,
}: LocalizationExportProps) {
  const [format, setFormat] = useState<'csv' | 'json' | 'android_xml' | 'ios_strings' | 'xliff'>('csv')
  const [languageCode, setLanguageCode] = useState<string>('')
  const [category, setCategory] = useState<string>('')
  const [includeEmpty, setIncludeEmpty] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    try {
      const blob = await api.localization.export(projectId, token, {
        format,
        languageCode: languageCode || undefined,
        category: category || undefined,
        includeEmpty,
      })

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      
      const extensionMap: Record<string, string> = {
        csv: 'csv',
        json: 'json',
        android_xml: 'xml',
        ios_strings: 'strings',
        xliff: 'xliff',
      }
      
      const filename = `translations${languageCode ? `_${languageCode}` : ''}.${extensionMap[format]}`
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      onClose()
    } catch (error) {
      alert('Export failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const requiresLanguage = format !== 'csv'

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-md">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Export Translations</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Format Selection */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Export Format</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as any)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="csv">CSV (All languages)</option>
              <option value="json">JSON</option>
              <option value="android_xml">Android XML</option>
              <option value="ios_strings">iOS Strings</option>
              <option value="xliff">XLIFF</option>
            </select>
          </div>

          {/* Language Selection */}
          {requiresLanguage && (
            <div>
              <label className="block text-sm text-gray-400 mb-2">Language</label>
              <select
                value={languageCode}
                onChange={(e) => setLanguageCode(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                required={requiresLanguage}
              >
                <option value="">Select language...</option>
                {languages.map((lang) => (
                  <option key={lang.id} value={lang.code}>
                    {lang.name} ({lang.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Category Filter */}
          {categories.length > 0 && (
            <div>
              <label className="block text-sm text-gray-400 mb-2">Category (Optional)</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">All categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Options */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeEmpty}
                onChange={(e) => setIncludeEmpty(e.target.checked)}
                className="rounded bg-gray-800 border-gray-700"
              />
              <span className="text-gray-300 text-sm">Include keys without translations</span>
            </label>
          </div>
        </div>

        <div className="p-4 border-t border-gray-800 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={loading || (requiresLanguage && !languageCode)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>
    </div>
  )
}

