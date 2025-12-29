/**
 * Targeting Rules Evaluation Engine
 * Evaluates targeting rules against user/device context
 */

export interface TargetingContext {
  user?: {
    id?: string
    email?: string
    [key: string]: any // Custom user attributes
  }
  device?: {
    platform?: string // 'ios' | 'android'
    osVersion?: string
    appVersion?: string
    deviceModel?: string
    [key: string]: any // Custom device attributes
  }
  app?: {
    version?: string
    buildNumber?: string
    [key: string]: any // Custom app attributes
  }
}

export interface TargetingCondition {
  property: string // e.g., "user.email", "device.platform", "app.version"
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'in' | 'notIn' | 'exists' | 'notExists'
  value: any // Value to compare against
  caseSensitive?: boolean
}

export interface TargetingRule {
  conditions: TargetingCondition[]
  logic: 'AND' | 'OR' // Logic to combine conditions
  value: any // Value to return if rule matches
}

export interface TargetingRules {
  rules: TargetingRule[]
  defaultValue: any // Fallback value if no rules match
}

/**
 * Evaluate targeting rules against context
 * Returns the matching value or defaultValue
 */
export function evaluateTargeting(
  targetingRules: TargetingRules | null,
  context: TargetingContext,
  defaultValue: any
): any {
  // If no targeting rules, return default value
  if (!targetingRules || !targetingRules.rules || targetingRules.rules.length === 0) {
    return defaultValue
  }

  // Evaluate each rule
  for (const rule of targetingRules.rules) {
    if (evaluateRule(rule, context)) {
      return rule.value
    }
  }

  // No rules matched, return default
  return targetingRules.defaultValue !== undefined ? targetingRules.defaultValue : defaultValue
}

/**
 * Evaluate a single targeting rule
 */
function evaluateRule(rule: TargetingRule, context: TargetingContext): boolean {
  if (!rule.conditions || rule.conditions.length === 0) {
    return true // Empty rule always matches
  }

  const results = rule.conditions.map(condition => evaluateCondition(condition, context))

  // Combine results based on logic
  if (rule.logic === 'AND') {
    return results.every(r => r === true)
  } else {
    return results.some(r => r === true)
  }
}

/**
 * Evaluate a single condition
 */
function evaluateCondition(condition: TargetingCondition, context: TargetingContext): boolean {
  const { property, operator, value, caseSensitive = false } = condition

  // Get property value from context
  const propertyValue = getPropertyValue(property, context)

  // Handle exists/notExists operators
  if (operator === 'exists') {
    return propertyValue !== undefined && propertyValue !== null
  }
  if (operator === 'notExists') {
    return propertyValue === undefined || propertyValue === null
  }

  // If property doesn't exist and operator requires a value, return false
  if (propertyValue === undefined || propertyValue === null) {
    return false
  }

  // Normalize values for comparison
  const normalizedPropertyValue = normalizeValue(propertyValue, caseSensitive)
  const normalizedCompareValue = normalizeValue(value, caseSensitive)

  // Evaluate based on operator
  switch (operator) {
    case 'equals':
      return normalizedPropertyValue === normalizedCompareValue

    case 'contains':
      if (typeof normalizedPropertyValue === 'string' && typeof normalizedCompareValue === 'string') {
        return normalizedPropertyValue.includes(normalizedCompareValue)
      }
      return false

    case 'startsWith':
      if (typeof normalizedPropertyValue === 'string' && typeof normalizedCompareValue === 'string') {
        return normalizedPropertyValue.startsWith(normalizedCompareValue)
      }
      return false

    case 'endsWith':
      if (typeof normalizedPropertyValue === 'string' && typeof normalizedCompareValue === 'string') {
        return normalizedPropertyValue.endsWith(normalizedCompareValue)
      }
      return false

    case 'greaterThan':
      return compareNumbers(normalizedPropertyValue, normalizedCompareValue) > 0

    case 'lessThan':
      return compareNumbers(normalizedPropertyValue, normalizedCompareValue) < 0

    case 'in':
      if (Array.isArray(normalizedCompareValue)) {
        return normalizedCompareValue.includes(normalizedPropertyValue)
      }
      return false

    case 'notIn':
      if (Array.isArray(normalizedCompareValue)) {
        return !normalizedCompareValue.includes(normalizedPropertyValue)
      }
      return false

    default:
      return false
  }
}

/**
 * Get property value from context using dot notation
 * e.g., "user.email" -> context.user.email
 */
function getPropertyValue(property: string, context: TargetingContext): any {
  const parts = property.split('.')
  let value: any = context

  for (const part of parts) {
    if (value === undefined || value === null) {
      return undefined
    }
    value = value[part]
  }

  return value
}

/**
 * Normalize value for comparison
 */
function normalizeValue(value: any, caseSensitive: boolean): any {
  if (typeof value === 'string' && !caseSensitive) {
    return value.toLowerCase()
  }
  return value
}

/**
 * Compare two values as numbers
 */
function compareNumbers(a: any, b: any): number {
  const numA = typeof a === 'number' ? a : parseFloat(String(a))
  const numB = typeof b === 'number' ? b : parseFloat(String(b))

  if (isNaN(numA) || isNaN(numB)) {
    return 0
  }

  return numA - numB
}

/**
 * Check if user should receive config based on rollout percentage
 * Uses consistent hashing based on userId or deviceId
 */
export function shouldReceiveRollout(
  rolloutPercentage: number,
  context: TargetingContext
): boolean {
  if (rolloutPercentage >= 100) {
    return true
  }
  if (rolloutPercentage <= 0) {
    return false
  }

  // Use userId or deviceId for consistent assignment
  const identifier = context.user?.id || context.device?.deviceId || 'default'
  
  // Simple hash function for consistent assignment
  const hash = simpleHash(identifier)
  const percentage = (hash % 100) + 1 // 1-100

  return percentage <= rolloutPercentage
}

/**
 * Simple hash function for consistent user assignment
 */
function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

