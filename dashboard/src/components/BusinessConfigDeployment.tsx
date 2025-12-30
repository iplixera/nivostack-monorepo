'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

interface BusinessConfigDeploymentProps {
  configId: string
  currentRolloutPercentage: number
  token: string
  onClose: () => void
  onDeploy: () => void
}

export default function BusinessConfigDeployment({
  configId,
  currentRolloutPercentage,
  token,
  onClose,
  onDeploy
}: BusinessConfigDeploymentProps) {
  const [strategy, setStrategy] = useState<'immediate' | 'canary' | 'linear' | 'exponential'>('canary')
  const [deploying, setDeploying] = useState(false)
  const [deploymentConfig, setDeploymentConfig] = useState<any>({
    canaryPercentage: 10,
    canaryDuration: 60,
    linearSteps: 5,
    linearInterval: 30,
    exponentialBase: 5,
    exponentialMultiplier: 2,
    exponentialInterval: 15,
    exponentialMax: 20
  })

  const handleDeploy = async () => {
    try {
      setDeploying(true)
      await api.deployments.deploy(configId, strategy, deploymentConfig, token)
      onDeploy()
      onClose()
    } catch (error) {
      alert('Failed to deploy: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setDeploying(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-2xl border border-gray-800">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Deploy Configuration</h3>
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
          {/* Strategy Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Deployment Strategy</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'immediate', label: 'Immediate', desc: 'Deploy to 100% immediately' },
                { value: 'canary', label: 'Canary', desc: 'Start small, then full rollout' },
                { value: 'linear', label: 'Linear', desc: 'Gradual equal increments' },
                { value: 'exponential', label: 'Exponential', desc: 'Exponential growth' }
              ].map((s) => (
                <label
                  key={s.value}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    strategy === s.value
                      ? 'border-blue-500 bg-blue-900/20'
                      : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                  }`}
                >
                  <input
                    type="radio"
                    value={s.value}
                    checked={strategy === s.value}
                    onChange={(e) => setStrategy(e.target.value as any)}
                    className="sr-only"
                  />
                  <div className="text-white font-medium">{s.label}</div>
                  <div className="text-gray-400 text-xs mt-1">{s.desc}</div>
                </label>
              ))}
            </div>
          </div>

          {/* Strategy-specific Configuration */}
          {strategy === 'canary' && (
            <div className="space-y-4 bg-gray-800/50 rounded-lg p-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Initial Percentage</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={deploymentConfig.canaryPercentage}
                  onChange={(e) => setDeploymentConfig((prev: any) => ({ ...prev, canaryPercentage: parseInt(e.target.value) || 10 }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                />
                <p className="text-gray-500 text-xs mt-1">Percentage of users to receive config initially</p>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Wait Duration (minutes)</label>
                <input
                  type="number"
                  min="5"
                  value={deploymentConfig.canaryDuration}
                  onChange={(e) => setDeploymentConfig((prev: any) => ({ ...prev, canaryDuration: parseInt(e.target.value) || 60 }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                />
                <p className="text-gray-500 text-xs mt-1">Wait time before rolling out to 100%</p>
              </div>
            </div>
          )}

          {strategy === 'linear' && (
            <div className="space-y-4 bg-gray-800/50 rounded-lg p-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Number of Steps</label>
                <input
                  type="number"
                  min="2"
                  max="20"
                  value={deploymentConfig.linearSteps}
                  onChange={(e) => setDeploymentConfig((prev: any) => ({ ...prev, linearSteps: parseInt(e.target.value) || 5 }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                />
                <p className="text-gray-500 text-xs mt-1">Number of equal increments (e.g., 5 steps = 20% per step)</p>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Interval Between Steps (minutes)</label>
                <input
                  type="number"
                  min="5"
                  value={deploymentConfig.linearInterval}
                  onChange={(e) => setDeploymentConfig((prev: any) => ({ ...prev, linearInterval: parseInt(e.target.value) || 30 }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                />
              </div>
            </div>
          )}

          {strategy === 'exponential' && (
            <div className="space-y-4 bg-gray-800/50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Base Percentage</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={deploymentConfig.exponentialBase}
                    onChange={(e) => setDeploymentConfig((prev: any) => ({ ...prev, exponentialBase: parseInt(e.target.value) || 5 }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Multiplier</label>
                  <input
                    type="number"
                    min="1.5"
                    step="0.1"
                    value={deploymentConfig.exponentialMultiplier}
                    onChange={(e) => setDeploymentConfig((prev: any) => ({ ...prev, exponentialMultiplier: parseFloat(e.target.value) || 2 }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Interval (minutes)</label>
                  <input
                    type="number"
                    min="5"
                    value={deploymentConfig.exponentialInterval}
                    onChange={(e) => setDeploymentConfig((prev: any) => ({ ...prev, exponentialInterval: parseInt(e.target.value) || 15 }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Max Per Step (%)</label>
                  <input
                    type="number"
                    min="5"
                    max="50"
                    value={deploymentConfig.exponentialMax}
                    onChange={(e) => setDeploymentConfig((prev: any) => ({ ...prev, exponentialMax: parseInt(e.target.value) || 20 }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Current Status */}
          <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
            <div className="text-blue-300 text-sm font-medium mb-1">Current Rollout</div>
            <div className="text-blue-400 text-xs">
              {currentRolloutPercentage}% of users are currently receiving this config
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            disabled={deploying}
          >
            Cancel
          </button>
          <button
            onClick={handleDeploy}
            disabled={deploying}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {deploying ? 'Deploying...' : 'Start Deployment'}
          </button>
        </div>
      </div>
    </div>
  )
}

