'use client'

import { useState } from 'react'
import { api } from '@/lib/api'

interface LocalizationImportProps {
  projectId: string
  token: string
  languages: Array<{ id: string; code: string; name: string }>
  onSuccess: () => void
  onClose: () => void
}

export default function LocalizationImport({
  projectId,
  token,
  languages,
  onSuccess,
  onClose,
}: LocalizationImportProps) {
  const [file, setFile] = useState<File | null>(null)
  const [format, setFormat] = useState<'csv' | 'json' | 'android_xml' | 'ios_strings' | 'xliff'>('csv')
  const [languageCode, setLanguageCode] = useState<string>('')
  const [options, setOptions] = useState({
    createMissingKeys: true,
    updateExisting: true,
    dryRun: false,
    category: '',
  })
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<Array<{ key: string; value: string; action: string }> | null>(null)
  const [result, setResult] = useState<{
    success: boolean
    stats?: {
      keysCreated: number
      keysUpdated: number
      keysSkipped: number
      translationsCreated: number
      translationsUpdated: number
      errors: Array<{ key?: string; message: string }>
    }
    errors?: Array<{ row?: number; message: string }>
  } | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setPreview(null)
      setResult(null)
    }
  }

  const handlePreview = async () => {
    if (!file) return

    setLoading(true)
    try {
      const response = await api.localization.import(projectId, token, file, {
        format,
        languageCode: languageCode || undefined,
        createMissingKeys: options.createMissingKeys,
        updateExisting: options.updateExisting,
        dryRun: true,
        category: options.category || undefined,
      })

      if (response.preview) {
        setPreview(response.preview)
      }
      if (response.errors && response.errors.length > 0) {
        setResult({ success: false, errors: response.errors })
      }
    } catch (error) {
      setResult({
        success: false,
        errors: [{ message: error instanceof Error ? error.message : 'Preview failed' }],
      })
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    if (!file) return

    setLoading(true)
    try {
      const response = await api.localization.import(projectId, token, file, {
        format,
        languageCode: languageCode || undefined,
        createMissingKeys: options.createMissingKeys,
        updateExisting: options.updateExisting,
        dryRun: false,
        category: options.category || undefined,
      })

      if (response.success && response.stats) {
        setResult({ success: true, stats: response.stats })
        setTimeout(() => {
          onSuccess()
          onClose()
        }, 2000)
      } else {
        setResult({ success: false, errors: response.errors || [] })
      }
    } catch (error) {
      setResult({
        success: false,
        errors: [{ message: error instanceof Error ? error.message : 'Import failed' }],
      })
    } finally {
      setLoading(false)
    }
  }

  const requiresLanguage = format !== 'xliff' && format !== 'json'

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Import Translations</h3>
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
          {/* File Selection */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">File Format</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as any)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="csv">CSV</option>
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

          {/* File Upload */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">File</label>
            <input
              type="file"
              onChange={handleFileChange}
              accept={format === 'csv' ? '.csv' : format === 'json' ? '.json' : format === 'android_xml' ? '.xml' : format === 'ios_strings' ? '.strings' : '.xliff'}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            />
            {file && (
              <p className="text-sm text-gray-500 mt-1">{file.name} ({(file.size / 1024).toFixed(2)} KB)</p>
            )}
          </div>

          {/* Options */}
          <div className="space-y-2">
            <label className="block text-sm text-gray-400">Options</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={options.createMissingKeys}
                onChange={(e) => setOptions({ ...options, createMissingKeys: e.target.checked })}
                className="rounded bg-gray-800 border-gray-700"
              />
              <span className="text-gray-300 text-sm">Create missing keys</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={options.updateExisting}
                onChange={(e) => setOptions({ ...options, updateExisting: e.target.checked })}
                className="rounded bg-gray-800 border-gray-700"
              />
              <span className="text-gray-300 text-sm">Update existing translations</span>
            </label>
            <div>
              <input
                type="text"
                placeholder="Category (optional)"
                value={options.category}
                onChange={(e) => setOptions({ ...options, category: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Preview */}
          {preview && (
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">Preview ({preview.length} items)</h4>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {preview.slice(0, 10).map((item, idx) => (
                  <div key={idx} className="text-sm text-gray-400">
                    <code className="text-blue-400">{item.key}</code>: {item.value.substring(0, 50)}
                    {item.value.length > 50 ? '...' : ''}
                  </div>
                ))}
                {preview.length > 10 && (
                  <div className="text-sm text-gray-500">... and {preview.length - 10} more</div>
                )}
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className={`rounded-lg p-4 ${result.success ? 'bg-green-900/50 border border-green-500' : 'bg-red-900/50 border border-red-500'}`}>
              {result.success && result.stats ? (
                <div>
                  <h4 className="text-white font-medium mb-2">Import Successful!</h4>
                  <div className="text-sm text-gray-300 space-y-1">
                    <div>Keys created: {result.stats.keysCreated}</div>
                    <div>Keys updated: {result.stats.keysUpdated}</div>
                    <div>Translations created: {result.stats.translationsCreated}</div>
                    <div>Translations updated: {result.stats.translationsUpdated}</div>
                    {result.stats.errors && result.stats.errors.length > 0 && (
                      <div className="text-yellow-400 mt-2">
                        {result.stats.errors.length} errors occurred
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="text-white font-medium mb-2">Import Failed</h4>
                  <div className="text-sm text-red-300">
                    {result.errors?.map((err, idx) => (
                      <div key={idx}>{err.message}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-800 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white"
            disabled={loading}
          >
            Cancel
          </button>
          {file && !result?.success && (
            <button
              onClick={handlePreview}
              disabled={loading || (requiresLanguage && !languageCode)}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50"
            >
              Preview
            </button>
          )}
          <button
            onClick={handleImport}
            disabled={loading || !file || (requiresLanguage && !languageCode)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Importing...' : 'Import'}
          </button>
        </div>
      </div>
    </div>
  )
}

