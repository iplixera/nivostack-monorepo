'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

interface Experiment {
  id: string
  name: string
  description: string | null
  status: string
  variants: Array<{ value: any; weight: number; name: string }>
  targetingRules: any
  startDate: string | null
  endDate: string | null
  createdAt: string
  config: { key: string; label: string | null }
  _count: { assignments: number; events: number }
}

interface ExperimentsTabProps {
  projectId: string
  token: string
}

export default function ExperimentsTab({ projectId, token }: ExperimentsTabProps) {
  const [experiments, setExperiments] = useState<Experiment[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    loadExperiments()
  }, [statusFilter])

  const loadExperiments = async () => {
    try {
      setLoading(true)
      const data = await api.experiments.list(
        projectId,
        statusFilter === 'all' ? undefined : statusFilter,
        token
      )
      setExperiments(data.experiments)
    } catch (error) {
      console.error('Failed to load experiments:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadResults = async (experimentId: string) => {
    try {
      const data = await api.experiments.getResults(experimentId, token)
      setResults(data)
      setShowResults(true)
    } catch (error) {
      alert('Failed to load results: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const handleStartExperiment = async (experimentId: string) => {
    try {
      await api.experiments.update(experimentId, { status: 'running' }, token)
      await loadExperiments()
    } catch (error) {
      alert('Failed to start experiment: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const handleStopExperiment = async (experimentId: string) => {
    try {
      await api.experiments.update(experimentId, { status: 'completed' }, token)
      await loadExperiments()
    } catch (error) {
      alert('Failed to stop experiment: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const handleDeleteExperiment = async (experimentId: string) => {
    if (!confirm('Are you sure you want to delete this experiment?')) return
    try {
      await api.experiments.delete(experimentId, token)
      await loadExperiments()
    } catch (error) {
      alert('Failed to delete experiment: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-600/20 text-green-400'
      case 'paused': return 'bg-yellow-600/20 text-yellow-400'
      case 'completed': return 'bg-gray-600/20 text-gray-400'
      default: return 'bg-blue-600/20 text-blue-400'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400">Loading experiments...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">A/B Testing Experiments</h2>
          <p className="text-gray-400 text-sm mt-1">Create and manage A/B tests for your configs</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="running">Running</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
          </select>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            + Create Experiment
          </button>
        </div>
      </div>

      {experiments.length === 0 ? (
        <div className="bg-gray-900 rounded-lg p-8 text-center border border-gray-800">
          <p className="text-gray-400 mb-4">No experiments yet</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Create Your First Experiment
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {experiments.map((experiment) => (
            <div key={experiment.id} className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-white font-medium">{experiment.name}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(experiment.status)}`}>
                      {experiment.status}
                    </span>
                    <code className="text-gray-400 text-xs bg-gray-800 px-2 py-0.5 rounded">
                      {experiment.config.key}
                    </code>
                  </div>
                  {experiment.description && (
                    <p className="text-gray-400 text-sm mb-2">{experiment.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{experiment._count.assignments} assignments</span>
                    <span>{experiment._count.events} events</span>
                    {experiment.startDate && (
                      <span>Started: {new Date(experiment.startDate).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {experiment.status === 'running' && (
                    <>
                      <button
                        onClick={() => loadResults(experiment.id)}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                      >
                        View Results
                      </button>
                      <button
                        onClick={() => handleStopExperiment(experiment.id)}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
                      >
                        Stop
                      </button>
                    </>
                  )}
                  {experiment.status === 'draft' && (
                    <button
                      onClick={() => handleStartExperiment(experiment.id)}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                    >
                      Start
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteExperiment(experiment.id)}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Variants */}
              <div className="mt-4 pt-4 border-t border-gray-800">
                <p className="text-xs text-gray-400 mb-2">Variants:</p>
                <div className="flex flex-wrap gap-2">
                  {experiment.variants.map((variant, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-800 rounded-lg px-3 py-2 border border-gray-700"
                    >
                      <div className="text-white text-sm font-medium">{variant.name}</div>
                      <div className="text-gray-400 text-xs mt-1">
                        {variant.weight}% • {typeof variant.value === 'object' ? JSON.stringify(variant.value) : String(variant.value)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Experiment Form */}
      {showCreateForm && (
        <ExperimentForm
          projectId={projectId}
          token={token}
          onClose={() => {
            setShowCreateForm(false)
            loadExperiments()
          }}
        />
      )}

      {/* Results Modal */}
      {showResults && results && (
        <ExperimentResults
          results={results}
          onClose={() => {
            setShowResults(false)
            setResults(null)
          }}
        />
      )}
    </div>
  )
}

// Experiment Form Component
function ExperimentForm({
  projectId,
  token,
  onClose
}: {
  projectId: string
  token: string
  onClose: () => void
}) {
  const [configs, setConfigs] = useState<any[]>([])
  const [formData, setFormData] = useState({
    configId: '',
    name: '',
    description: '',
    variants: [{ name: 'Control', value: '', weight: 50 }, { name: 'Variant A', value: '', weight: 50 }],
    assignmentType: 'consistent' as 'random' | 'consistent' | 'targeting'
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadConfigs()
  }, [])

  const loadConfigs = async () => {
    try {
      const data = await api.businessConfig.list(projectId, token)
      setConfigs(data.configs)
    } catch (error) {
      console.error('Failed to load configs:', error)
    }
  }

  const handleAddVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { name: `Variant ${prev.variants.length}`, value: '', weight: 0 }]
    }))
  }

  const handleRemoveVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }))
  }

  const handleVariantChange = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((v, i) => 
        i === index ? { ...v, [field]: value } : v
      )
    }))
  }

  const normalizeWeights = () => {
    const totalWeight = formData.variants.reduce((sum, v) => sum + (v.weight || 0), 0)
    if (totalWeight === 0) {
      // Distribute evenly
      const weightPerVariant = 100 / formData.variants.length
      setFormData(prev => ({
        ...prev,
        variants: prev.variants.map(v => ({ ...v, weight: weightPerVariant }))
      }))
    } else {
      // Normalize to 100
      setFormData(prev => ({
        ...prev,
        variants: prev.variants.map(v => ({ ...v, weight: (v.weight / totalWeight) * 100 }))
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Normalize weights
    normalizeWeights()
    
    setSaving(true)
    try {
      await api.experiments.create({
        projectId,
        configId: formData.configId,
        name: formData.name,
        description: formData.description || undefined,
        variants: formData.variants.map(v => ({
          ...v,
          weight: v.weight || 0
        })),
        assignmentType: formData.assignmentType
      }, token)
      onClose()
    } catch (error) {
      alert('Failed to create experiment: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setSaving(false)
    }
  }

  const selectedConfig = configs.find(c => c.id === formData.configId)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-gray-800">
        <div className="p-6 border-b border-gray-800">
          <h3 className="text-xl font-semibold text-white">Create Experiment</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Config</label>
            <select
              value={formData.configId}
              onChange={(e) => setFormData(prev => ({ ...prev, configId: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              required
            >
              <option value="">Select a config...</option>
              {configs.map(config => (
                <option key={config.id} value={config.id}>
                  {config.label || config.key} ({config.key})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Experiment Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              placeholder="e.g., Button Color Test"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              rows={3}
              placeholder="What are you testing?"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-300">Variants</label>
              <button
                type="button"
                onClick={handleAddVariant}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                + Add Variant
              </button>
            </div>
            <div className="space-y-3">
              {formData.variants.map((variant, index) => (
                <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Name</label>
                      <input
                        type="text"
                        value={variant.name}
                        onChange={(e) => handleVariantChange(index, 'name', e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-2 py-1.5 text-white text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Value</label>
                      <input
                        type="text"
                        value={variant.value}
                        onChange={(e) => handleVariantChange(index, 'value', e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-2 py-1.5 text-white text-sm"
                        placeholder={selectedConfig?.valueType === 'boolean' ? 'true/false' : 'value'}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Weight (%)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={variant.weight}
                          onChange={(e) => handleVariantChange(index, 'weight', parseFloat(e.target.value) || 0)}
                          className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-2 py-1.5 text-white text-sm"
                          required
                        />
                        {formData.variants.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(index)}
                            className="text-red-400 hover:text-red-300 p-1"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={normalizeWeights}
              className="mt-2 text-sm text-blue-400 hover:text-blue-300"
            >
              Normalize weights to 100%
            </button>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Creating...' : 'Create Experiment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Experiment Results Component
function ExperimentResults({
  results,
  onClose
}: {
  results: any
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-800">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Experiment Results</h3>
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
          <div>
            <h4 className="text-white font-medium mb-2">{results.experiment.name}</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-gray-400 text-xs mb-1">Total Assignments</div>
                <div className="text-white text-2xl font-bold">{results.stats.totalAssignments}</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-gray-400 text-xs mb-1">Total Conversions</div>
                <div className="text-white text-2xl font-bold">{results.stats.totalConversions}</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-gray-400 text-xs mb-1">Overall Conversion Rate</div>
                <div className="text-white text-2xl font-bold">
                  {(results.stats.overallConversionRate * 100).toFixed(2)}%
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-white font-medium mb-4">Variant Performance</h4>
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-300 text-sm font-medium">Variant</th>
                    <th className="text-right px-4 py-3 text-gray-300 text-sm font-medium">Assignments</th>
                    <th className="text-right px-4 py-3 text-gray-300 text-sm font-medium">Conversions</th>
                    <th className="text-right px-4 py-3 text-gray-300 text-sm font-medium">Conversion Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {results.stats.variants.map((variant: any, index: number) => (
                    <tr key={index} className="border-t border-gray-700">
                      <td className="px-4 py-3 text-white text-sm">
                        {results.experiment.variants[index]?.name || `Variant ${index}`}
                      </td>
                      <td className="px-4 py-3 text-gray-300 text-sm text-right">{variant.assignments}</td>
                      <td className="px-4 py-3 text-gray-300 text-sm text-right">{variant.conversions}</td>
                      <td className="px-4 py-3 text-gray-300 text-sm text-right">
                        {(variant.conversionRate * 100).toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {results.significance && results.significance.length > 0 && (
            <div>
              <h4 className="text-white font-medium mb-4">Statistical Significance</h4>
              <div className="space-y-2">
                {results.significance.map((sig: any, index: number) => (
                  <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm">
                        Variant {sig.variantA} vs Variant {sig.variantB}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          sig.significant
                            ? 'bg-green-600/20 text-green-400'
                            : 'bg-gray-600/20 text-gray-400'
                        }`}>
                          {sig.significant ? 'Significant' : 'Not Significant'}
                        </span>
                        <span className="text-gray-400 text-xs">
                          {sig.confidence}% confidence
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

