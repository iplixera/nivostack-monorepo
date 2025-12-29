'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

interface LocalizationGlossaryProps {
  projectId: string
  token: string
  languages: Array<{ id: string; code: string; name: string }>
  onClose: () => void
}

interface GlossaryTerm {
  id: string
  term: string
  definition: string | null
  context: string | null
  translations: Record<string, string>
  category: string | null
  isActive: boolean
}

export default function LocalizationGlossary({
  projectId,
  token,
  languages,
  onClose
}: LocalizationGlossaryProps) {
  const [glossary, setGlossary] = useState<GlossaryTerm[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddTerm, setShowAddTerm] = useState(false)
  const [editingTerm, setEditingTerm] = useState<GlossaryTerm | null>(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [formData, setFormData] = useState({
    term: '',
    definition: '',
    context: '',
    category: '',
    translations: {} as Record<string, string>
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadGlossary()
  }, [])

  const loadGlossary = async () => {
    try {
      setLoading(true)
      const data = await api.localization.getGlossary(projectId, category || undefined, search || undefined, token)
      setGlossary(data.glossary)
    } catch (error) {
      console.error('Failed to load glossary:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGlossary()
  }, [search, category])

  const handleAddTerm = async () => {
    if (!formData.term.trim()) return

    try {
      setSaving(true)
      await api.localization.createGlossaryTerm(
        projectId,
        formData.term,
        formData.definition || undefined,
        formData.context || undefined,
        Object.keys(formData.translations).length > 0 ? formData.translations : undefined,
        formData.category || undefined,
        token
      )
      setFormData({ term: '', definition: '', context: '', category: '', translations: {} })
      setShowAddTerm(false)
      loadGlossary()
    } catch (error) {
      alert('Failed to add term: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateTerm = async () => {
    if (!editingTerm) return

    try {
      setSaving(true)
      await api.localization.updateGlossaryTerm(editingTerm.id, {
        term: formData.term,
        definition: formData.definition,
        context: formData.context,
        translations: formData.translations,
        category: formData.category,
        isActive: editingTerm.isActive
      }, token)
      setEditingTerm(null)
      setFormData({ term: '', definition: '', context: '', category: '', translations: {} })
      loadGlossary()
    } catch (error) {
      alert('Failed to update term: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteTerm = async (termId: string) => {
    if (!confirm('Are you sure you want to delete this glossary term?')) return

    try {
      await api.localization.deleteGlossaryTerm(termId, token)
      loadGlossary()
    } catch (error) {
      alert('Failed to delete term: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const categories = [...new Set(glossary.map(t => t.category).filter(Boolean))] as string[]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-6xl max-h-[90vh] flex flex-col border border-gray-800">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Glossary / Terminology</h3>
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

        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search terms..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <button
              onClick={() => {
                setShowAddTerm(true)
                setFormData({ term: '', definition: '', context: '', category: '', translations: {} })
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Add Term
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : glossary.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No glossary terms found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {glossary.map(term => (
                <div
                  key={term.id}
                  className="bg-gray-800 rounded-lg p-4 border border-gray-700"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-medium">{term.term}</span>
                        {term.category && (
                          <span className="px-2 py-0.5 bg-gray-700 text-gray-400 text-xs rounded">
                            {term.category}
                          </span>
                        )}
                        {!term.isActive && (
                          <span className="px-2 py-0.5 bg-gray-700 text-gray-500 text-xs rounded">
                            Inactive
                          </span>
                        )}
                      </div>
                      {term.definition && (
                        <p className="text-gray-400 text-sm mb-1">{term.definition}</p>
                      )}
                      {term.context && (
                        <p className="text-gray-500 text-xs italic">{term.context}</p>
                      )}
                      {Object.keys(term.translations || {}).length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-700">
                          <p className="text-xs text-gray-500 mb-1">Translations:</p>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(term.translations).map(([langCode, translation]) => (
                              <span key={langCode} className="text-xs">
                                <span className="text-gray-500">{langCode}:</span>{' '}
                                <span className="text-gray-300">{translation}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingTerm(term)
                          setFormData({
                            term: term.term,
                            definition: term.definition || '',
                            context: term.context || '',
                            category: term.category || '',
                            translations: term.translations || {}
                          })
                        }}
                        className="text-gray-400 hover:text-white p-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteTerm(term.id)}
                        className="text-gray-400 hover:text-red-400 p-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add/Edit Term Modal */}
        {(showAddTerm || editingTerm) && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10">
            <div className="bg-gray-900 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-800 m-4">
              <div className="p-6 border-b border-gray-800">
                <h4 className="text-lg font-semibold text-white">
                  {editingTerm ? 'Edit Term' : 'Add Term'}
                </h4>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Term *</label>
                  <input
                    type="text"
                    value={formData.term}
                    onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                    placeholder="Enter term"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Definition</label>
                  <textarea
                    value={formData.definition}
                    onChange={(e) => setFormData({ ...formData, definition: e.target.value })}
                    placeholder="Enter definition"
                    rows={3}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Context</label>
                  <textarea
                    value={formData.context}
                    onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                    placeholder="Enter usage context"
                    rows={2}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Enter category"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Translations</label>
                  <div className="space-y-2">
                    {languages.map(lang => (
                      <div key={lang.id} className="flex items-center gap-2">
                        <span className="w-20 text-sm text-gray-400">{lang.name}:</span>
                        <input
                          type="text"
                          value={formData.translations[lang.code] || ''}
                          onChange={(e) => {
                            const newTranslations = { ...formData.translations }
                            if (e.target.value) {
                              newTranslations[lang.code] = e.target.value
                            } else {
                              delete newTranslations[lang.code]
                            }
                            setFormData({ ...formData, translations: newTranslations })
                          }}
                          placeholder={`Translation in ${lang.name}`}
                          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-800 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowAddTerm(false)
                    setEditingTerm(null)
                    setFormData({ term: '', definition: '', context: '', category: '', translations: {} })
                  }}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  onClick={editingTerm ? handleUpdateTerm : handleAddTerm}
                  disabled={!formData.term.trim() || saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? 'Saving...' : editingTerm ? 'Update' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

