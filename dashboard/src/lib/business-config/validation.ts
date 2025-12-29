/**
 * Config Value Validation Engine
 * Validates config values against schema and constraints
 */

export interface ValidationSchema {
  type?: 'string' | 'integer' | 'boolean' | 'decimal' | 'json' | 'image'
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  pattern?: string // Regex pattern
  allowedValues?: any[] // Array of allowed values
  required?: boolean
  properties?: Record<string, ValidationSchema> // For JSON objects
  items?: ValidationSchema // For JSON arrays
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * Validate a config value against schema and constraints
 */
export function validateConfigValue(
  value: any,
  valueType: string,
  schema?: ValidationSchema | null,
  constraints?: {
    minValue?: number | null
    maxValue?: number | null
    minLength?: number | null
    maxLength?: number | null
    pattern?: string | null
    allowedValues?: any[] | null
  }
): ValidationResult {
  const errors: string[] = []

  // Type validation
  if (schema?.type && !validateType(value, schema.type)) {
    errors.push(`Value must be of type ${schema.type}`)
  }

  // Value constraints
  if (constraints?.minValue !== null && constraints?.minValue !== undefined) {
    const numValue = typeof value === 'number' ? value : parseFloat(String(value))
    if (isNaN(numValue) || numValue < constraints.minValue!) {
      errors.push(`Value must be at least ${constraints.minValue}`)
    }
  }

  if (constraints?.maxValue !== null && constraints?.maxValue !== undefined) {
    const numValue = typeof value === 'number' ? value : parseFloat(String(value))
    if (isNaN(numValue) || numValue > constraints.maxValue!) {
      errors.push(`Value must be at most ${constraints.maxValue}`)
    }
  }

  // Length constraints (for strings)
  if (typeof value === 'string') {
    if (constraints?.minLength !== null && constraints?.minLength !== undefined) {
      if (value.length < constraints.minLength!) {
        errors.push(`Value must be at least ${constraints.minLength} characters`)
      }
    }

    if (constraints?.maxLength !== null && constraints?.maxLength !== undefined) {
      if (value.length > constraints.maxLength!) {
        errors.push(`Value must be at most ${constraints.maxLength} characters`)
      }
    }

    // Pattern validation
    if (constraints?.pattern) {
      try {
        const regex = new RegExp(constraints.pattern)
        if (!regex.test(value)) {
          errors.push(`Value does not match required pattern`)
        }
      } catch (e) {
        errors.push(`Invalid pattern: ${constraints.pattern}`)
      }
    }
  }

  // Allowed values
  if (constraints?.allowedValues && constraints.allowedValues.length > 0) {
    if (!constraints.allowedValues.includes(value)) {
      errors.push(`Value must be one of: ${constraints.allowedValues.join(', ')}`)
    }
  }

  // Schema validation (for JSON)
  if (valueType === 'json' && schema) {
    const jsonErrors = validateJsonSchema(value, schema)
    errors.push(...jsonErrors)
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Validate value type
 */
function validateType(value: any, expectedType: string): boolean {
  switch (expectedType) {
    case 'string':
      return typeof value === 'string'
    case 'integer':
      return Number.isInteger(value) || (typeof value === 'string' && /^-?\d+$/.test(value))
    case 'boolean':
      return typeof value === 'boolean' || value === 'true' || value === 'false' || value === 1 || value === 0
    case 'decimal':
      return typeof value === 'number' || !isNaN(parseFloat(String(value)))
    case 'json':
      return typeof value === 'object' && value !== null
    case 'image':
      return typeof value === 'string' && (value.startsWith('http') || value.startsWith('/'))
    default:
      return true
  }
}

/**
 * Validate JSON schema (simplified)
 */
function validateJsonSchema(value: any, schema: ValidationSchema): string[] {
  const errors: string[] = []

  if (typeof value !== 'object' || value === null) {
    return ['Value must be a JSON object']
  }

  // Validate properties
  if (schema.properties) {
    for (const [key, propSchema] of Object.entries(schema.properties)) {
      if (propSchema.required && !(key in value)) {
        errors.push(`Missing required property: ${key}`)
      }
      if (key in value) {
        const propErrors = validateConfigValue(value[key], propSchema.type || 'string', propSchema, {
          minValue: propSchema.min,
          maxValue: propSchema.max,
          minLength: propSchema.minLength,
          maxLength: propSchema.maxLength,
          pattern: propSchema.pattern,
          allowedValues: propSchema.allowedValues
        })
        errors.push(...propErrors.errors.map(e => `${key}: ${e}`))
      }
    }
  }

  // Validate array items
  if (schema.items && Array.isArray(value)) {
    value.forEach((item, index) => {
      const itemErrors = validateConfigValue(item, schema.items!.type || 'string', schema.items!, {
        minValue: schema.items!.min,
        maxValue: schema.items!.max,
        minLength: schema.items!.minLength,
        maxLength: schema.items!.maxLength,
        pattern: schema.items!.pattern,
        allowedValues: schema.items!.allowedValues
      })
      errors.push(...itemErrors.errors.map(e => `[${index}]: ${e}`))
    })
  }

  return errors
}

