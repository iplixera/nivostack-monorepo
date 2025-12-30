'use client'

import { useState } from 'react'

interface TargetingCondition {
  property: string
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'in' | 'notIn' | 'exists' | 'notExists'
  value: any
  caseSensitive?: boolean
}

interface TargetingRule {
  conditions: TargetingCondition[]
  logic: 'AND' | 'OR'
  value: any
}

interface BusinessConfigTargetingProps {
  targetingRules: TargetingRule[] | null
  defaultValue: any
  valueType: string
  onUpdate: (targetingRules: TargetingRule[] | null, defaultValue: any) => void
  onClose: () => void
}

const PROPERTY_OPTIONS = [
  { value: 'user.id', label: 'User ID' },
  { value: 'user.email', label: 'User Email' },
  { value: 'device.platform', label: 'Device Platform' },
  { value: 'device.osVersion', label: 'OS Version' },
  { value: 'device.appVersion', label: 'App Version' },
  { value: 'device.deviceModel', label: 'Device Model' },
  { value: 'app.version', label: 'App Version' },
  { value: 'app.buildNumber', label: 'Build Number' }
]

const OPERATOR_OPTIONS = [
  { value: 'equals', label: 'Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'startsWith', label: 'Starts With' },
  { value: 'endsWith', label: 'Ends With' },
  { value: 'greaterThan', label: 'Greater Than' },
  { value: 'lessThan', label: 'Less Than' },
  { value: 'in', label: 'In List' },
  { value: 'notIn', label: 'Not In List' },
  { value: 'exists', label: 'Exists' },
  { value: 'notExists', label: 'Not Exists' }
]

export default function BusinessConfigTargeting({
  targetingRules,
  defaultValue,
  valueType,
  onUpdate,
  onClose
}: BusinessConfigTargetingProps) {
  const [rules, setRules] = useState<TargetingRule[]>(targetingRules || [])
  const [defaultVal, setDefaultVal] = useState(defaultValue)

  const handleAddRule = () => {
    setRules([...rules, {
      conditions: [{ property: 'user.email', operator: 'equals', value: '' }],
      logic: 'AND',
      value: getDefaultValueForType(valueType)
    }])
  }

  const handleRemoveRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index))
  }

  const handleUpdateRule = (index: number, rule: TargetingRule) => {
    const newRules = [...rules]
    newRules[index] = rule
    setRules(newRules)
  }

  const handleAddCondition = (ruleIndex: number) => {
    const newRules = [...rules]
    newRules[ruleIndex].conditions.push({
      property: 'user.email',
      operator: 'equals',
      value: ''
    })
    setRules(newRules)
  }

  const handleRemoveCondition = (ruleIndex: number, conditionIndex: number) => {
    const newRules = [...rules]
    newRules[ruleIndex].conditions = newRules[ruleIndex].conditions.filter((_, i) => i !== conditionIndex)
    setRules(newRules)
  }

  const handleUpdateCondition = (ruleIndex: number, conditionIndex: number, condition: TargetingCondition) => {
    const newRules = [...rules]
    newRules[ruleIndex].conditions[conditionIndex] = condition
    setRules(newRules)
  }

  const handleSave = () => {
    onUpdate(rules.length > 0 ? rules : null, defaultVal)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-800">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Targeting Rules</h3>
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
          {/* Default Value */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Default Value</label>
            <p className="text-gray-400 text-xs mb-2">Value returned when no targeting rules match</p>
            {renderValueInput(valueType, defaultVal, setDefaultVal)}
          </div>

          {/* Targeting Rules */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-300">Targeting Rules</label>
              <button
                onClick={handleAddRule}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
              >
                + Add Rule
              </button>
            </div>

            {rules.length === 0 ? (
              <div className="bg-gray-800 rounded-lg p-4 text-center border border-gray-700">
                <p className="text-gray-400 text-sm">No targeting rules. All users will receive the default value.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {rules.map((rule, ruleIndex) => (
                  <div key={ruleIndex} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-white font-medium">Rule {ruleIndex + 1}</h4>
                      <div className="flex items-center gap-2">
                        <select
                          value={rule.logic}
                          onChange={(e) => handleUpdateRule(ruleIndex, { ...rule, logic: e.target.value as 'AND' | 'OR' })}
                          className="bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 text-white text-sm"
                        >
                          <option value="AND">AND</option>
                          <option value="OR">OR</option>
                        </select>
                        <button
                          onClick={() => handleRemoveRule(ruleIndex)}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Conditions */}
                    <div className="space-y-3 mb-4">
                      {rule.conditions.map((condition, conditionIndex) => (
                        <div key={conditionIndex} className="flex items-center gap-2 bg-gray-700/50 rounded-lg p-3">
                          <select
                            value={condition.property}
                            onChange={(e) => handleUpdateCondition(ruleIndex, conditionIndex, { ...condition, property: e.target.value })}
                            className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
                          >
                            {PROPERTY_OPTIONS.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                          <select
                            value={condition.operator}
                            onChange={(e) => handleUpdateCondition(ruleIndex, conditionIndex, { ...condition, operator: e.target.value as any })}
                            className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
                          >
                            {OPERATOR_OPTIONS.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                          {(condition.operator !== 'exists' && condition.operator !== 'notExists') && (
                            <input
                              type="text"
                              value={typeof condition.value === 'string' ? condition.value : JSON.stringify(condition.value)}
                              onChange={(e) => {
                                let value: any = e.target.value
                                // Try to parse as JSON for 'in' and 'notIn' operators
                                if (condition.operator === 'in' || condition.operator === 'notIn') {
                                  try {
                                    value = JSON.parse(e.target.value)
                                  } catch {
                                    // Keep as string if not valid JSON
                                  }
                                }
                                handleUpdateCondition(ruleIndex, conditionIndex, { ...condition, value })
                              }}
                              placeholder="Value"
                              className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
                            />
                          )}
                          <button
                            onClick={() => handleRemoveCondition(ruleIndex, conditionIndex)}
                            className="text-red-400 hover:text-red-300 p-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => handleAddCondition(ruleIndex)}
                        className="text-sm text-blue-400 hover:text-blue-300"
                      >
                        + Add Condition
                      </button>
                    </div>

                    {/* Rule Value */}
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Value when rule matches:</label>
                      {renderValueInput(valueType, rule.value, (val) => {
                        handleUpdateRule(ruleIndex, { ...rule, value: val })
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save Targeting Rules
          </button>
        </div>
      </div>
    </div>
  )
}

function renderValueInput(valueType: string, value: any, onChange: (value: any) => void) {
  switch (valueType) {
    case 'boolean':
      return (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={value === true || value === 'true'}
            onChange={(e) => onChange(e.target.checked)}
            className="rounded bg-gray-800 border-gray-700"
          />
          <span className="text-gray-300 text-sm">Enabled</span>
        </label>
      )
    case 'integer':
      return (
        <input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
        />
      )
    case 'decimal':
      return (
        <input
          type="number"
          step="0.01"
          value={value || ''}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
        />
      )
    case 'json':
      return (
        <textarea
          value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
          onChange={(e) => {
            try {
              onChange(JSON.parse(e.target.value))
            } catch {
              onChange(e.target.value)
            }
          }}
          rows={4}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm font-mono"
        />
      )
    default:
      return (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
        />
      )
  }
}

function getDefaultValueForType(valueType: string): any {
  switch (valueType) {
    case 'boolean': return false
    case 'integer': return 0
    case 'decimal': return 0.0
    case 'json': return {}
    default: return ''
  }
}

