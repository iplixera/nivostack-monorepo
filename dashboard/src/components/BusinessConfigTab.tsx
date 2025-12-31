'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import BuildsSubTab from './BuildsSubTab'
import BusinessConfigTargeting from './BusinessConfigTargeting'
import BusinessConfigHistory from './BusinessConfigHistory'
import BusinessConfigAnalytics from './BusinessConfigAnalytics'
import ExperimentsTab from './ExperimentsTab'

type BusinessConfig = {
  id: string
  key: string
  label: string | null
  description: string | null
  valueType: string
  stringValue: string | null
  integerValue: number | null
  booleanValue: boolean | null
  decimalValue: number | null
  jsonValue: unknown
  imageUrl: string | null
  category: string | null
  isEnabled: boolean
  version: number
  metadata: unknown
  targetingRules: any
  defaultValue: any
  rolloutPercentage: number
  validationSchema: any
  minValue: number | null
  maxValue: number | null
  minLength: number | null
  maxLength: number | null
  pattern: string | null
  allowedValues: any[] | null
  deploymentStrategy: string | null
  deploymentConfig: any
  createdAt: string
  updatedAt: string
}

type ValueType = 'string' | 'integer' | 'boolean' | 'decimal' | 'json' | 'image'

const VALUE_TYPES: { value: ValueType; label: string }[] = [
  { value: 'string', label: 'String' },
  { value: 'integer', label: 'Integer' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'decimal', label: 'Decimal' },
  { value: 'json', label: 'JSON' },
  { value: 'image', label: 'Image' }
]

type TemplateConfig = {
  key: string
  label: string
  description: string
  valueType: ValueType
  value: unknown
  category: string
}

const TEMPLATE_CONFIGS: TemplateConfig[] = [
  {
    key: 'maintenance_enabled',
    label: 'Maintenance Mode',
    description: 'Enable to show maintenance page to all users',
    valueType: 'boolean',
    value: false,
    category: 'app_control'
  },
  {
    key: 'maintenance_message',
    label: 'Maintenance Message',
    description: 'Message shown during maintenance',
    valueType: 'string',
    value: 'We are currently performing scheduled maintenance. Please try again later.',
    category: 'app_control'
  },
  {
    key: 'force_update_enabled',
    label: 'Force Update',
    description: 'Force users to update to latest version',
    valueType: 'boolean',
    value: false,
    category: 'app_control'
  },
  {
    key: 'min_app_version',
    label: 'Minimum Version',
    description: 'Minimum app version required (users below this will be forced to update)',
    valueType: 'string',
    value: '1.0.0',
    category: 'app_control'
  },
  {
    key: 'force_update_message',
    label: 'Update Message',
    description: 'Message shown when force update is required',
    valueType: 'string',
    value: 'A new version is available. Please update to continue using the app.',
    category: 'app_control'
  },
  {
    key: 'app_store_url',
    label: 'App Store URL',
    description: 'iOS App Store URL for updates',
    valueType: 'string',
    value: 'https://apps.apple.com/app/your-app-id',
    category: 'app_control'
  },
  {
    key: 'play_store_url',
    label: 'Play Store URL',
    description: 'Google Play Store URL for updates',
    valueType: 'string',
    value: 'https://play.google.com/store/apps/details?id=your.package.name',
    category: 'app_control'
  },
  {
    key: 'feature_flags',
    label: 'Feature Flags',
    description: 'JSON object containing feature toggles',
    valueType: 'json',
    value: { new_checkout: false, dark_mode: true, biometric_login: true, push_notifications: true, in_app_review: false },
    category: 'features'
  },
  {
    key: 'support_config',
    label: 'Support Configuration',
    description: 'Support contact details',
    valueType: 'json',
    value: { email: 'support@example.com', phone: '+1234567890', whatsapp: '+1234567890', hours: '9 AM - 6 PM (Mon-Fri)' },
    category: 'support'
  },
  {
    key: 'legal_urls',
    label: 'Legal URLs',
    description: 'Terms and privacy policy URLs',
    valueType: 'json',
    value: { terms_of_service: 'https://example.com/terms', privacy_policy: 'https://example.com/privacy', cookie_policy: 'https://example.com/cookies' },
    category: 'legal'
  }
]

function getConfigValue(config: BusinessConfig): unknown {
  switch (config.valueType) {
    case 'string': return config.stringValue
    case 'integer': return config.integerValue
    case 'boolean': return config.booleanValue
    case 'decimal': return config.decimalValue
    case 'json': return config.jsonValue
    case 'image': return config.imageUrl
    default: return null
  }
}

function formatValue(config: BusinessConfig): string {
  const value = getConfigValue(config)
  if (value === null || value === undefined) return '-'

  switch (config.valueType) {
    case 'boolean': return value ? 'true' : 'false'
    case 'json': return JSON.stringify(value, null, 2)
    case 'image': return value as string
    default: return String(value)
  }
}

// Templates Modal Component
function TemplatesModal({
  templates,
  existingKeys,
  onAdd,
  onClose,
  loading
}: {
  templates: TemplateConfig[]
  existingKeys: string[]
  onAdd: (templates: TemplateConfig[]) => void
  onClose: () => void
  loading: boolean
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const toggleTemplate = (key: string) => {
    const newSelected = new Set(selected)
    if (newSelected.has(key)) {
      newSelected.delete(key)
    } else {
      newSelected.add(key)
    }
    setSelected(newSelected)
  }

  const selectAll = () => {
    const newSelected = new Set<string>()
    templates.forEach(t => {
      if (!existingKeys.includes(t.key)) {
        newSelected.add(t.key)
      }
    })
    setSelected(newSelected)
  }

  const handleAdd = () => {
    const selectedTemplates = templates.filter(t => selected.has(t.key))
    onAdd(selectedTemplates)
  }

  // Group templates by category
  const groupedTemplates = templates.reduce((acc, template) => {
    const cat = template.category
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(template)
    return acc
  }, {} as Record<string, TemplateConfig[]>)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Add Template Configs</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <span className="text-sm text-gray-400">
            {selected.size} selected
          </span>
          <button
            onClick={selectAll}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            Select all available
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
            <div key={category}>
              <h4 className="text-sm font-medium text-gray-400 uppercase mb-3">{category}</h4>
              <div className="space-y-2">
                {categoryTemplates.map((template) => {
                  const exists = existingKeys.includes(template.key)
                  return (
                    <label
                      key={template.key}
                      className={`flex items-start p-3 rounded-lg border cursor-pointer transition-colors ${
                        exists
                          ? 'border-gray-700 bg-gray-800/50 opacity-50 cursor-not-allowed'
                          : selected.has(template.key)
                          ? 'border-blue-500 bg-blue-900/20'
                          : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected.has(template.key)}
                        onChange={() => !exists && toggleTemplate(template.key)}
                        disabled={exists}
                        className="mt-1 mr-3"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-white font-medium">{template.label}</span>
                          <span className="text-xs text-gray-500 font-mono">{template.key}</span>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">{template.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs px-2 py-0.5 bg-gray-700 rounded text-gray-300">
                            {template.valueType}
                          </span>
                          {exists && (
                            <span className="text-xs px-2 py-0.5 bg-yellow-900/50 rounded text-yellow-400">
                              Already exists
                            </span>
                          )}
                        </div>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-800 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={selected.size === 0 || loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Adding...' : `Add ${selected.size} Config${selected.size !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  )
}

type ConfigCategory = {
  id: string
  name: string
  label: string | null
  description: string | null
  icon: string | null
  order: number
  isEnabled: boolean
}

type Props = {
  projectId: string
  token: string
  sharedUsage?: {
    businessConfigKeys?: { used: number; limit: number | null; percentage: number }
  } | null
}

export default function BusinessConfigTab({ projectId, token, sharedUsage }: Props) {
  const router = useRouter()
  const [configs, setConfigs] = useState<BusinessConfig[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [configCategories, setConfigCategories] = useState<ConfigCategory[]>([])
  const [showCategoryManager, setShowCategoryManager] = useState(false)
  const [editingCategory, setEditingCategory] = useState<ConfigCategory | null>(null)
  const [categoryForm, setCategoryForm] = useState({ name: '', label: '', description: '', icon: '' })
  const [savingCategory, setSavingCategory] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creatingBuild, setCreatingBuild] = useState(false)

  // Sub-tab state
  const [activeSubTab, setActiveSubTab] = useState<'configs' | 'categories' | 'analytics' | 'builds' | 'experiments'>('configs')

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  // Add/Edit state
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingConfig, setEditingConfig] = useState<BusinessConfig | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [addingTemplates, setAddingTemplates] = useState(false)
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set())
  const [showTargeting, setShowTargeting] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [showDeployment, setShowDeployment] = useState(false)
  const [targetingConfig, setTargetingConfig] = useState<BusinessConfig | null>(null)

  // Enforcement and usage state (from shared usage prop)
  const businessConfigUsage = sharedUsage?.businessConfigKeys || null

  // Form state
  const [formData, setFormData] = useState({
    key: '',
    label: '',
    description: '',
    valueType: 'string' as ValueType,
    value: '' as unknown,
    category: '',
    isEnabled: true,
    targetingRules: null as any,
    defaultValue: null as any,
    rolloutPercentage: 100
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchConfigs = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.businessConfig.list(projectId, token, selectedCategory || undefined)
      setConfigs(res.configs as any)
      setCategories(res.categories)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch configs')
    } finally {
      setLoading(false)
    }
  }

  const fetchConfigCategories = async () => {
    try {
      const res = await fetch(`/api/config-categories?projectId=${projectId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!res.ok) {
        throw new Error(`Failed to fetch categories: ${res.statusText}`)
      }
      const data = await res.json()
      if (data.categories) {
        setConfigCategories(data.categories)
      } else {
        setConfigCategories([])
      }
    } catch (err) {
      console.error('Failed to fetch config categories:', err)
      setConfigCategories([])
    }
  }

  useEffect(() => {
    fetchConfigs()
    fetchConfigCategories()
  }, [projectId, token, selectedCategory])

  // Refresh categories when switching to categories tab
  useEffect(() => {
    if (activeSubTab === 'categories') {
      setLoading(true)
      Promise.all([fetchConfigCategories(), fetchConfigs()]).finally(() => {
        setLoading(false)
      })
    }
  }, [activeSubTab])

  // Usage data comes from sharedUsage prop (fetched once at top level)

  const resetCategoryForm = () => {
    setCategoryForm({ name: '', label: '', description: '', icon: '' })
    setEditingCategory(null)
  }

  const handleSaveCategory = async () => {
    if (!categoryForm.name.trim()) return
    setSavingCategory(true)

    try {
      if (editingCategory) {
        await fetch('/api/config-categories', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            id: editingCategory.id,
            name: categoryForm.name,
            label: categoryForm.label || undefined,
            description: categoryForm.description || undefined,
            icon: categoryForm.icon || undefined
          })
        })
      } else {
        await fetch('/api/config-categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            projectId,
            name: categoryForm.name,
            label: categoryForm.label || undefined,
            description: categoryForm.description || undefined,
            icon: categoryForm.icon || undefined
          })
        })
      }
      resetCategoryForm()
      fetchConfigCategories()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save category')
    } finally {
      setSavingCategory(false)
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      await fetch(`/api/config-categories?id=${categoryId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      fetchConfigCategories()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete category')
    }
  }

  const handleEditCategory = (category: ConfigCategory) => {
    setEditingCategory(category)
    setCategoryForm({
      name: category.name,
      label: category.label || '',
      description: category.description || '',
      icon: category.icon || ''
    })
  }

  const resetForm = () => {
    setFormData({
      key: '',
      label: '',
      description: '',
      valueType: 'string',
      value: '',
      category: '',
      isEnabled: true,
      targetingRules: null,
      defaultValue: null,
      rolloutPercentage: 100,
    } as any)
    setEditingConfig(null)
    setShowAddForm(false)
  }

  const handleEdit = (config: BusinessConfig) => {
    setEditingConfig(config)
    setFormData({
      key: config.key,
      label: config.label || '',
      description: config.description || '',
      valueType: config.valueType as ValueType,
      value: getConfigValue(config) ?? '',
      category: config.category || '',
      isEnabled: config.isEnabled,
      targetingRules: (config as any).targetingRules || null,
      defaultValue: (config as any).defaultValue || null,
      rolloutPercentage: (config as any).rolloutPercentage || 100,
    } as any)
    setShowAddForm(true)
  }

  const handleDelete = async (configId: string) => {
    if (!confirm('Are you sure you want to delete this configuration?')) return

    try {
      await api.businessConfig.delete(configId, token)
      fetchConfigs()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete config')
    }
  }

  const handleImageUpload = async (file: File) => {
    setUploading(true)
    try {
      const result = await api.upload.uploadFile(projectId, token, file)
      setFormData(prev => ({ ...prev, value: result.file.url }))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (editingConfig) {
        await api.businessConfig.update(token, {
          id: editingConfig.id,
          key: formData.key,
          label: formData.label || undefined,
          description: formData.description || undefined,
          valueType: formData.valueType,
          value: formData.value,
          category: formData.category || undefined,
          isEnabled: formData.isEnabled,
          targetingRules: formData.targetingRules,
          defaultValue: formData.defaultValue,
          rolloutPercentage: formData.rolloutPercentage
        } as any)
      } else {
        await api.businessConfig.create(projectId, token, {
          key: formData.key,
          label: formData.label || undefined,
          description: formData.description || undefined,
          valueType: formData.valueType,
          value: formData.value,
          category: formData.category || undefined,
          isEnabled: formData.isEnabled,
          targetingRules: formData.targetingRules,
          defaultValue: formData.defaultValue,
          rolloutPercentage: formData.rolloutPercentage
        } as any)
      }

      resetForm()
      fetchConfigs()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save config')
    } finally {
      setSaving(false)
    }
  }

  const handleAddTemplates = async (selectedTemplates: TemplateConfig[]) => {
    if (selectedTemplates.length === 0) return

    setAddingTemplates(true)
    const existingKeys = configs.map(c => c.key)
    let added = 0
    let skipped = 0

    try {
      for (const template of selectedTemplates) {
        if (existingKeys.includes(template.key)) {
          skipped++
          continue
        }

        await api.businessConfig.create(projectId, token, {
          key: template.key,
          label: template.label,
          description: template.description,
          valueType: template.valueType,
          value: template.value,
          category: template.category,
          isEnabled: true
        })
        added++
      }

      if (skipped > 0) {
        alert(`Added ${added} configs. Skipped ${skipped} that already exist.`)
      }

      setShowTemplates(false)
      fetchConfigs()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add templates')
    } finally {
      setAddingTemplates(false)
    }
  }

  const renderValueInput = () => {
    switch (formData.valueType) {
      case 'string':
        return (
          <input
            type="text"
            value={formData.value as string}
            onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
            className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
            placeholder="Enter string value"
          />
        )

      case 'integer':
        return (
          <input
            type="number"
            value={formData.value as number || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, value: parseInt(e.target.value) || 0 }))}
            className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
            placeholder="Enter integer value"
          />
        )

      case 'decimal':
        return (
          <input
            type="number"
            step="0.01"
            value={formData.value as number || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
            className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
            placeholder="Enter decimal value"
          />
        )

      case 'boolean':
        return (
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                checked={formData.value === true}
                onChange={() => setFormData(prev => ({ ...prev, value: true }))}
                className="text-blue-500"
              />
              <span className="text-gray-300">True</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                checked={formData.value === false}
                onChange={() => setFormData(prev => ({ ...prev, value: false }))}
                className="text-blue-500"
              />
              <span className="text-gray-300">False</span>
            </label>
          </div>
        )

      case 'json':
        return (
          <textarea
            value={typeof formData.value === 'string' ? formData.value : JSON.stringify(formData.value, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value)
                setFormData(prev => ({ ...prev, value: parsed }))
              } catch {
                setFormData(prev => ({ ...prev, value: e.target.value }))
              }
            }}
            className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none font-mono text-sm"
            rows={6}
            placeholder='{"key": "value"}'
          />
        )

      case 'image': {
        const imageValue = formData.value as string
        return (
          <div className="space-y-3">
            {imageValue && (
              <div className="relative w-32 h-32 bg-gray-800 rounded-lg overflow-hidden">
                <img
                  src={imageValue}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, value: '' }))}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700"
                >
                  X
                </button>
              </div>
            )}
            <div className="flex items-center space-x-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleImageUpload(file)
                }}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Upload Image'}
              </button>
              <span className="text-gray-500 text-sm">or</span>
              <input
                type="text"
                value={imageValue || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                className="flex-1 bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
                placeholder="Enter image URL"
              />
            </div>
          </div>
        )
      }

      default:
        return null
    }
  }

  // Group configs by category
  const groupedConfigs = configs.reduce((acc, config) => {
    const cat = config.category || 'Uncategorized'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(config)
    return acc
  }, {} as Record<string, BusinessConfig[]>)

  if (loading && configs.length === 0) {
    return <div className="text-gray-400 text-center py-8">Loading configurations...</div>
  }

  return (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <div className="border-b border-gray-800">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveSubTab('configs')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeSubTab === 'configs'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Translation
          </button>
          <button
            onClick={() => setActiveSubTab('categories')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeSubTab === 'categories'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Categories
          </button>
          <button
            onClick={() => setActiveSubTab('analytics')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeSubTab === 'analytics'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Analytics
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
            onClick={() => setActiveSubTab('experiments')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeSubTab === 'experiments'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Experiments
          </button>
        </nav>
      </div>

      {/* Categories Sub-tab */}
      {activeSubTab === 'categories' && (
        <div className="space-y-6">
          {loading && configCategories.length === 0 && categories.length === 0 ? (
            <div className="text-gray-400 text-center py-8">Loading categories...</div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Categories</h3>
                <button
                  onClick={() => {
                    resetCategoryForm()
                    setShowCategoryManager(true)
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  + Add Category
                </button>
              </div>
              
              {/* Combine managed categories and string categories from configs */}
              {(() => {
            // Get all managed categories
            const managedCategories = configCategories || []
            
            // Get string categories from configs that aren't in managed categories
            const stringCategories = (categories || []).filter(
              (catName: string) => !managedCategories.some((mc: any) => mc.name === catName)
            )
            
            // Create display items for string categories (not managed)
            const stringCategoryItems = stringCategories.map((catName: string) => ({
              id: `string-${catName}`,
              name: catName,
              label: catName,
              description: null,
              icon: null,
              isManaged: false
            }))
            
            // Create display items for managed categories
            const managedCategoryItems = managedCategories.map((cat: any) => ({
              ...cat,
              isManaged: true
            }))
            
            // Combine all categories
            const allCategories = [...managedCategoryItems, ...stringCategoryItems]
            
            if (allCategories.length === 0) {
              return (
                <div className="bg-gray-900 rounded-lg border border-gray-800 p-12 text-center">
                  <p className="text-gray-400 mb-2">No categories yet.</p>
                  <p className="text-gray-500 text-sm">Create your first category to organize your configs.</p>
                </div>
              )
            }
            
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allCategories.map((cat: any) => (
                  <div key={cat.id} className="bg-gray-900 rounded-lg border border-gray-800 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {cat.icon && <span className="text-xl">{cat.icon}</span>}
                          <h4 className="text-white font-medium">{cat.label || cat.name}</h4>
                          {!cat.isManaged && (
                            <span className="text-xs px-2 py-0.5 bg-gray-700 text-gray-400 rounded">
                              Auto
                            </span>
                          )}
                        </div>
                        {cat.description && (
                          <p className="text-gray-400 text-sm mb-2">{cat.description}</p>
                        )}
                        <p className="text-gray-500 text-xs font-mono">{cat.name}</p>
                        {cat.isManaged && (
                          <p className="text-gray-600 text-xs mt-1">Managed category</p>
                        )}
                      </div>
                      {cat.isManaged && (
                        <div className="flex items-center gap-1 ml-2">
                          <button
                            onClick={() => handleEditCategory(cat)}
                            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
                            title="Edit category"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-900/30 rounded transition-colors"
                            title="Delete category"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          })()}
            </>
          )}
        </div>
      )}

      {/* Analytics Sub-tab */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Analytics</h3>
            <button
              onClick={() => setShowAnalytics(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              View Detailed Analytics
            </button>
          </div>
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <p className="text-gray-400 text-center py-8">
              Analytics dashboard coming soon. Click "View Detailed Analytics" to see per-config analytics.
            </p>
          </div>
        </div>
      )}

      {/* Builds Sub-tab */}
      {activeSubTab === 'builds' && (
        <BuildsSubTab 
          projectId={projectId} 
          featureType="business_config" 
          featureLabel="Business Configuration"
        />
      )}

      {/* Experiments Sub-tab */}
      {activeSubTab === 'experiments' && (
        <ExperimentsTab projectId={projectId} token={token} />
      )}

      {/* Configs Sub-tab */}
      {activeSubTab === 'configs' && (
        <>
      {/* Enforcement Banner for Business Config Keys */}
      {businessConfigUsage && businessConfigUsage.limit !== null && (
        <>
          {(() => {
            const percentage = businessConfigUsage.percentage
            const warnThreshold = 80
            const hardThreshold = 100
            
            if (percentage >= hardThreshold) {
              return (
                <div className="bg-red-900/20 border-l-4 border-red-600 p-4 rounded mb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
                        <span>🚫</span>
                        <span>Business Config Keys Quota Exceeded</span>
                      </h3>
                      <p className="text-gray-300 text-sm mb-2">
                        You have reached your business config keys limit: <strong>{businessConfigUsage.used}/{businessConfigUsage.limit} keys</strong> ({percentage.toFixed(1)}%).
                      </p>
                      <p className="text-gray-300 text-sm">
                        New configuration keys will be blocked. Please upgrade your plan to create more keys.
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
                        <span>Approaching Business Config Keys Limit</span>
                      </h3>
                      <p className="text-gray-300 text-sm mb-2">
                        You are approaching your business config keys limit: <strong>{businessConfigUsage.used}/{businessConfigUsage.limit} keys</strong> ({percentage.toFixed(1)}%).
                      </p>
                      <p className="text-gray-300 text-sm">
                        You can create {Math.max(0, businessConfigUsage.limit - businessConfigUsage.used)} more key{businessConfigUsage.limit - businessConfigUsage.used !== 1 ? 's' : ''} before reaching your limit.
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
          <h2 className="text-xl font-semibold text-white">Business Configurations</h2>
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
            onClick={() => setShowTemplates(true)}
            disabled={!!(businessConfigUsage && businessConfigUsage.limit !== null && businessConfigUsage.percentage >= 100)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            + Add Template
          </button>
          <button
            onClick={() => {
              resetForm()
              setShowAddForm(true)
            }}
            disabled={!!(businessConfigUsage && businessConfigUsage.limit !== null && businessConfigUsage.percentage >= 100)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            + Add Config
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Category Manager Modal */}
      {showCategoryManager && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowCategoryManager(false)
            resetCategoryForm()
          }
        }}>
          <div className="bg-gray-900 rounded-xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Manage Categories</h3>
              <button
                onClick={() => {
                  setShowCategoryManager(false)
                  resetCategoryForm()
                }}
                className="text-gray-400 hover:text-white text-xl leading-none"
              >
                ✕
              </button>
            </div>

            {/* Add/Edit Category Form */}
            <div className="p-4 border-b border-gray-800 bg-gray-800/30">
              <h4 className="text-sm font-medium text-white mb-3">
                {editingCategory ? '✏️ Edit Category' : '➕ Add New Category'}
              </h4>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Name *</label>
                    <input
                      type="text"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none text-sm"
                      placeholder="features"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Label</label>
                    <input
                      type="text"
                      value={categoryForm.label}
                      onChange={(e) => setCategoryForm(prev => ({ ...prev, label: e.target.value }))}
                      className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none text-sm"
                      placeholder="Features"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Description</label>
                  <input
                    type="text"
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none text-sm"
                    placeholder="Feature toggles and settings"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Icon (emoji)</label>
                  <input
                    type="text"
                    value={categoryForm.icon}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, icon: e.target.value }))}
                    className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none text-sm"
                    placeholder="⚡"
                    maxLength={2}
                  />
                </div>
                <div className="flex items-center justify-end space-x-2">
                  {editingCategory && (
                    <button
                      onClick={resetCategoryForm}
                      className="px-3 py-2 text-gray-400 hover:text-white text-sm transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={handleSaveCategory}
                    disabled={!categoryForm.name.trim() || savingCategory}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {savingCategory ? 'Saving...' : editingCategory ? '✓ Update Category' : '+ Add Category'}
                  </button>
                </div>
              </div>
            </div>

            {/* Categories List */}
            <div className="flex-1 overflow-y-auto p-4">
              <h4 className="text-xs font-medium text-gray-400 uppercase mb-3">Existing Categories</h4>
              {configCategories.length === 0 ? (
                <p className="text-gray-500 text-center py-8 text-sm">
                  No categories yet.<br />
                  <span className="text-gray-600 text-xs">Add your first category using the form above</span>
                </p>
              ) : (
                <div className="space-y-2">
                  {configCategories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {category.icon && <span className="text-lg flex-shrink-0">{category.icon}</span>}
                        <div className="min-w-0 flex-1">
                          <p className="text-white font-medium text-sm truncate">{category.label || category.name}</p>
                          <p className="text-gray-500 text-xs font-mono">{category.name}</p>
                          {category.description && (
                            <p className="text-gray-400 text-xs mt-0.5 truncate">{category.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                          title="Edit category"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Delete category"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-800 bg-gray-800/30">
              <p className="text-gray-500 text-xs">
                💡 Categories help organize your business configs. Use them in the config form to group related settings.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Templates Modal */}
      {showTemplates && (
        <TemplatesModal
          templates={TEMPLATE_CONFIGS}
          existingKeys={configs.map(c => c.key)}
          onAdd={handleAddTemplates}
          onClose={() => setShowTemplates(false)}
          loading={addingTemplates}
        />
      )}

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                {editingConfig ? 'Edit Configuration' : 'Add Configuration'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Key */}
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Key *</label>
                  <input
                    type="text"
                    value={formData.key}
                    onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value }))}
                    className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none font-mono"
                    placeholder="feature_enabled"
                    required
                    pattern="^[a-zA-Z_][a-zA-Z0-9_]*$"
                    title="Key must start with letter or underscore, followed by letters, numbers, or underscores"
                  />
                </div>

                {/* Label */}
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Label</label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                    className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
                    placeholder="Feature Enabled"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
                    rows={2}
                    placeholder="Controls whether the feature is enabled"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
                    placeholder="Features"
                    list="category-suggestions"
                  />
                  <datalist id="category-suggestions">
                    {configCategories.map((cat) => (
                      <option key={cat.id} value={cat.name}>{cat.label || cat.name}</option>
                    ))}
                    {categories.filter(cat => !configCategories.some(cc => cc.name === cat)).map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>

                {/* Value Type */}
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Value Type *</label>
                  <select
                    value={formData.valueType}
                    onChange={(e) => {
                      const newType = e.target.value as ValueType
                      let defaultValue: unknown = ''
                      if (newType === 'boolean') defaultValue = false
                      if (newType === 'integer' || newType === 'decimal') defaultValue = 0
                      if (newType === 'json') defaultValue = {}
                      setFormData(prev => ({ ...prev, valueType: newType, value: defaultValue }))
                    }}
                    className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
                  >
                    {VALUE_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                {/* Value */}
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Value</label>
                  {renderValueInput()}
                </div>

                {/* Enabled */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isEnabled"
                    checked={formData.isEnabled}
                    onChange={(e) => setFormData(prev => ({ ...prev, isEnabled: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label htmlFor="isEnabled" className="text-gray-300">Enabled</label>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-800">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 transition-colors"
                  >
                    {saving ? 'Saving...' : (editingConfig ? 'Update' : 'Create')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Configs List */}
      {configs.length === 0 ? (
        <div className="text-center py-12 bg-gray-900 rounded-lg">
          <p className="text-gray-400 mb-4">No configurations yet</p>
          <p className="text-gray-500 text-sm">
            Create your first configuration to manage app behavior remotely
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedConfigs).map(([category, categoryConfigs]) => {
            const isCollapsed = collapsedCategories.has(category)
            return (
            <div key={category} className="bg-gray-900 rounded-lg overflow-hidden">
              <button
                onClick={() => {
                  const newCollapsed = new Set(collapsedCategories)
                  if (isCollapsed) {
                    newCollapsed.delete(category)
                  } else {
                    newCollapsed.add(category)
                  }
                  setCollapsedCategories(newCollapsed)
                }}
                className="w-full px-4 py-3 bg-gray-800/50 border-b border-gray-800 flex items-center justify-between hover:bg-gray-800/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${isCollapsed ? '' : 'rotate-90'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <h3 className="text-gray-300 font-medium">{category}</h3>
                  <span className="px-2 py-0.5 bg-gray-700 text-gray-400 text-xs rounded-full">
                    {categoryConfigs.length}
                  </span>
                </div>
              </button>
              {!isCollapsed && (
              <div className="divide-y divide-gray-800">
                {categoryConfigs.map((config) => (
                  <div key={config.id} className="p-4 hover:bg-gray-800/30 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <code className="text-blue-400 font-mono text-sm">{config.key}</code>
                          {!config.isEnabled && (
                            <span className="px-2 py-0.5 bg-gray-700 text-gray-400 text-xs rounded">
                              Disabled
                            </span>
                          )}
                          <span className={`px-2 py-0.5 text-xs rounded ${
                            config.valueType === 'boolean' ? 'bg-purple-900/50 text-purple-300' :
                            config.valueType === 'integer' ? 'bg-green-900/50 text-green-300' :
                            config.valueType === 'decimal' ? 'bg-teal-900/50 text-teal-300' :
                            config.valueType === 'json' ? 'bg-orange-900/50 text-orange-300' :
                            config.valueType === 'image' ? 'bg-pink-900/50 text-pink-300' :
                            'bg-blue-900/50 text-blue-300'
                          }`}>
                            {config.valueType}
                          </span>
                        </div>
                        {config.label && (
                          <p className="text-white text-sm font-medium">{config.label}</p>
                        )}
                        {config.description && (
                          <p className="text-gray-500 text-xs mt-0.5">{config.description}</p>
                        )}
                        <div className="mt-2">
                          {config.valueType === 'image' && config.imageUrl ? (
                            <img
                              src={config.imageUrl}
                              alt={config.key}
                              className="h-16 w-16 object-cover rounded-lg border border-gray-700"
                            />
                          ) : config.valueType === 'json' ? (
                            <pre className="text-gray-300 text-xs bg-gray-800 p-2 rounded-lg overflow-x-auto max-w-md">
                              {formatValue(config)}
                            </pre>
                          ) : config.valueType === 'boolean' ? (
                            <span className={`px-2 py-1 rounded text-sm ${
                              config.booleanValue ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
                            }`}>
                              {config.booleanValue ? 'true' : 'false'}
                            </span>
                          ) : (
                            <span className="text-gray-300 text-sm font-mono">{formatValue(config)}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <span className="text-gray-600 text-xs">v{config.version}</span>
                        <button
                          onClick={() => handleEdit(config)}
                          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(config.id)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        <button
                          onClick={() => {
                            setTargetingConfig(config)
                            setShowTargeting(true)
                          }}
                          className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="Targeting Rules"
                        >
                          🎯
                        </button>
                        <button
                          onClick={() => {
                            setTargetingConfig(config)
                            setShowHistory(true)
                          }}
                          className="p-2 text-gray-400 hover:text-green-400 hover:bg-green-900/30 rounded-lg transition-colors"
                          title="Change History"
                        >
                          📜
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              )}
            </div>
          )})}
        </div>
      )}

      {/* SDK Info */}
      <div className="bg-gray-900 rounded-lg p-4">
        <h3 className="text-white font-medium mb-2">SDK Integration</h3>
        <p className="text-gray-400 text-sm mb-3">
          Fetch configurations in your mobile app using the SDK endpoint:
        </p>
        <code className="block bg-gray-800 text-green-400 text-sm p-3 rounded-lg font-mono">
          GET /api/business-config?category=optional
        </code>
        <p className="text-gray-500 text-xs mt-2">
          Include X-API-Key header for authentication. Response includes all enabled configs with their values.
        </p>
      </div>
        </>
      )}

      {/* Targeting Modal */}
      {showTargeting && targetingConfig && (
        <BusinessConfigTargeting
          targetingRules={targetingConfig.targetingRules}
          defaultValue={targetingConfig.defaultValue}
          valueType={targetingConfig.valueType}
          onUpdate={async (targetingRules, defaultValue) => {
            try {
              await api.businessConfig.update(token, {
                id: targetingConfig.id,
                targetingRules,
                defaultValue
              } as any)
              setShowTargeting(false)
              fetchConfigs()
            } catch (err) {
              alert('Failed to update targeting rules: ' + (err instanceof Error ? err.message : 'Unknown error'))
            }
          }}
          onClose={() => {
            setShowTargeting(false)
            setTargetingConfig(null)
          }}
        />
      )}

      {/* History Modal */}
      {showHistory && (
        <BusinessConfigHistory
          projectId={projectId}
          configId={targetingConfig?.id}
          token={token}
          onClose={() => {
            setShowHistory(false)
            setTargetingConfig(null)
          }}
        />
      )}

      {/* Analytics Modal */}
      {showAnalytics && (
        <BusinessConfigAnalytics
          projectId={projectId}
          configKey={targetingConfig?.key}
          token={token}
          onClose={() => {
            setShowAnalytics(false)
            setTargetingConfig(null)
          }}
        />
      )}
    </div>
  )
}
