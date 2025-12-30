import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, getAuthUser } from '@/lib/auth'
import { evaluateTargeting, shouldReceiveRollout, TargetingContext } from '@/lib/business-config/targeting'
import { broadcastConfigUpdate } from '@/lib/business-config/events'
import { validateConfigValue } from '@/lib/business-config/validation'

// Valid value types
const VALUE_TYPES = ['string', 'integer', 'boolean', 'decimal', 'json', 'image'] as const
type ValueType = (typeof VALUE_TYPES)[number]

// Helper to extract the value based on type
function extractValue(config: {
  valueType: string
  stringValue: string | null
  integerValue: number | null
  booleanValue: boolean | null
  decimalValue: number | null
  jsonValue: unknown
  imageUrl: string | null
}) {
  switch (config.valueType) {
    case 'string':
      return config.stringValue
    case 'integer':
      return config.integerValue
    case 'boolean':
      return config.booleanValue
    case 'decimal':
      return config.decimalValue
    case 'json':
      return config.jsonValue
    case 'image':
      return config.imageUrl
    default:
      return null
  }
}

// GET - List all business configs for a project (dashboard) or fetch configs for SDK
export async function GET(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key')
    const authHeader = request.headers.get('authorization')
    const projectId = request.nextUrl.searchParams.get('projectId')
    const category = request.nextUrl.searchParams.get('category')
    const key = request.nextUrl.searchParams.get('key')

    // SDK request - return configs for mobile app (simplified format for caching)
    if (apiKey) {
      const project = await prisma.project.findUnique({
        where: { apiKey }
      })

      if (!project) {
        return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
      }

      // Validate subscription and feature access
      const { validateSubscription } = await import('@/lib/subscription-validation')
      const validation = await validateSubscription(project.userId)
      if (!validation.valid) {
        return NextResponse.json({
          configs: [],
          error: validation.error || 'Subscription invalid',
          message: validation.error || 'Please upgrade to continue using DevBridge.'
        }, { status: 403 })
      }

      // Get user/device context from request (optional)
      const contextHeader = request.headers.get('x-devbridge-context')
      let context: TargetingContext = {}
      if (contextHeader) {
        try {
          context = JSON.parse(contextHeader)
        } catch (e) {
          console.warn('Invalid context header:', e)
        }
      }

      // Build where clause
      const where: Record<string, unknown> = {
        projectId: project.id,
        isEnabled: true
      }
      if (category) where.category = category
      if (key) where.key = key

      const configs = await prisma.businessConfig.findMany({
        where,
        select: {
          key: true,
          valueType: true,
          stringValue: true,
          integerValue: true,
          booleanValue: true,
          decimalValue: true,
          jsonValue: true,
          imageUrl: true,
          category: true,
          version: true,
          updatedAt: true,
          metadata: true
        },
        orderBy: { key: 'asc' }
      })

      // Transform to simplified key-value format for SDK with targeting evaluation
      const configMap: Record<string, unknown> = {}
      const configMeta: Record<string, { type: string; category: string | null; version: number; updatedAt: string }> = {}

      for (const config of configs) {
        // Extract advanced fields from metadata
        const metadata = config.metadata as Record<string, unknown> | null
        const rolloutPercentage = metadata?.rolloutPercentage as number | undefined || 100
        const targetingRules = metadata?.targetingRules
        const defaultValueFromMeta = metadata?.defaultValue
        
        // Check rollout percentage first
        const receivesRollout = shouldReceiveRollout(rolloutPercentage, context)
        if (!receivesRollout) {
          // Track that user didn't receive config due to rollout
          trackConfigUsage(project.id, config.key, {
            deviceId: context.device?.deviceId,
            userId: context.user?.id,
            rolloutReceived: false,
            targetingMatched: false,
            cacheHit: false
          })
          continue // Skip this config if user is not in rollout
        }

        // Get default value (use metadata defaultValue if available, otherwise extract from config)
        const defaultValue = defaultValueFromMeta !== undefined ? defaultValueFromMeta : extractValue(config)

        // Check for active experiments on this config
        const activeExperiment = await prisma.experiment.findFirst({
          where: {
            configId: config.id,
            status: 'running',
            AND: [
              {
                OR: [
                  { startDate: null },
                  { startDate: { lte: new Date() } }
                ]
              },
              {
                OR: [
                  { endDate: null },
                  { endDate: { gte: new Date() } }
                ]
              }
            ]
          },
          orderBy: { createdAt: 'desc' }
        })

        let finalValue = defaultValue
        let targetingMatched = false

        // If experiment exists, assign user to variant
        if (activeExperiment) {
          try {
            const { assignToVariant } = await import('@/lib/business-config/experiments')
            const assignment = assignToVariant(
              {
                id: activeExperiment.id,
                variants: activeExperiment.variants as any,
                assignmentType: activeExperiment.assignmentType as any,
                targetingRules: activeExperiment.targetingRules as any
              },
              {
                deviceId: context.device?.deviceId,
                userId: context.user?.id,
                ...context
              }
            )

            if (assignment) {
              // Store assignment if not exists
              await prisma.experimentAssignment.upsert({
                where: {
                  experimentId_deviceId_userId: {
                    experimentId: activeExperiment.id,
                    deviceId: context.device?.deviceId || null,
                    userId: context.user?.id || null
                  }
                },
                update: {
                  lastSeenAt: new Date()
                },
                create: {
                  experimentId: activeExperiment.id,
                  deviceId: context.device?.deviceId || null,
                  userId: context.user?.id || null,
                  variantIndex: assignment.variantIndex,
                  variantName: assignment.variant.name
                }
              })

              // Use experiment variant value
              finalValue = assignment.variant.value
            }
          } catch (error) {
            console.error('Experiment assignment error:', error)
            // Fallback to targeting/default
          }
        }

        // If no experiment or experiment assignment failed, evaluate targeting rules
        if (finalValue === defaultValue && targetingRules) {
          try {
            const targetedValue = evaluateTargeting(
              targetingRules as any,
              context,
              defaultValueFromMeta !== undefined ? defaultValueFromMeta : defaultValue
            )
            targetingMatched = targetedValue !== defaultValue
            finalValue = targetedValue
          } catch (error) {
            console.error('Targeting evaluation error:', error)
            // Fallback to default value on error
            finalValue = defaultValue
          }
        }

        // Track config usage
        trackConfigUsage(project.id, config.key, {
          deviceId: context.device?.deviceId,
          userId: context.user?.id,
          rolloutReceived: true,
          targetingMatched,
          cacheHit: false // TODO: Implement cache detection
        })

        configMap[config.key] = finalValue
        configMeta[config.key] = {
          type: config.valueType,
          category: config.category,
          version: config.version,
          updatedAt: config.updatedAt.toISOString()
        }
      }

      return NextResponse.json({
        configs: configMap,
        meta: configMeta,
        fetchedAt: new Date().toISOString()
      })
    }

    // Dashboard request - return full configs
    if (authHeader && projectId) {
      const token = authHeader.replace('Bearer ', '')
      const payload = verifyToken(token)

      if (!payload) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      // Verify project ownership
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          userId: payload.userId
        }
      })

      if (!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 })
      }

      // Build where clause
      const where: Record<string, unknown> = { projectId }
      if (category) where.category = category

      const configs = await prisma.businessConfig.findMany({
        where,
        orderBy: [{ category: 'asc' }, { key: 'asc' }]
      })

      // Get unique categories
      const categories = await prisma.businessConfig.findMany({
        where: { projectId },
        select: { category: true },
        distinct: ['category']
      })

      return NextResponse.json({
        configs,
        categories: categories.map(c => c.category).filter(Boolean)
      })
    }

    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  } catch (error) {
    console.error('BusinessConfig GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new business config
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const payload = verifyToken(token)

    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      projectId, 
      key, 
      label, 
      description, 
      valueType, 
      value, 
      category, 
      isEnabled, 
      metadata,
      targetingRules,
      defaultValue,
      rolloutPercentage,
      validationSchema,
      minValue,
      maxValue,
      minLength,
      maxLength,
      pattern,
      allowedValues,
      deploymentStrategy,
      deploymentConfig
    } = body

    if (!projectId || !key || !valueType) {
      return NextResponse.json({ error: 'Missing required fields: projectId, key, valueType' }, { status: 400 })
    }

    if (!VALUE_TYPES.includes(valueType)) {
      return NextResponse.json({ error: `Invalid valueType. Must be one of: ${VALUE_TYPES.join(', ')}` }, { status: 400 })
    }

    // Validate value if validation schema/constraints provided
    const constraints = {
      minValue,
      maxValue,
      minLength,
      maxLength,
      pattern,
      allowedValues
    }

    if (validationSchema || Object.values(constraints).some(v => v !== undefined && v !== null)) {
      const validation = validateConfigValue(value, valueType, validationSchema, constraints)
      if (!validation.valid) {
        return NextResponse.json(
          { error: 'Validation failed', details: validation.errors },
          { status: 400 }
        )
      }
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: payload.userId
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Check business config keys quota
    const { checkThrottling } = await import('@/lib/throttling')
    const throttling = await checkThrottling(project.userId, 'businessConfigKeys')
    if (throttling.throttled || (throttling.usage && throttling.usage.limit !== null && throttling.usage.used >= throttling.usage.limit)) {
      return NextResponse.json(
        {
          error: throttling.error || `Business config keys limit reached. You have used ${throttling.usage?.used || 0} of ${throttling.usage?.limit || 0} keys. Please upgrade your plan to create more keys.`,
          usage: throttling.usage,
        },
        {
          status: throttling.throttled ? 429 : 403,
          headers: throttling.retryAfter
            ? { 'Retry-After': throttling.retryAfter.toString() }
            : {},
        }
      )
    }

    // Prepare value fields based on type
    const valueFields = getValueFields(valueType as ValueType, value)

    // Store advanced fields in metadata JSON
    const advancedMetadata: Record<string, unknown> = {}
    if (targetingRules) advancedMetadata.targetingRules = targetingRules
    if (defaultValue !== undefined) advancedMetadata.defaultValue = defaultValue
    if (rolloutPercentage !== undefined) advancedMetadata.rolloutPercentage = Math.max(0, Math.min(100, rolloutPercentage))
    if (validationSchema) advancedMetadata.validationSchema = validationSchema
    if (minValue !== undefined) advancedMetadata.minValue = minValue
    if (maxValue !== undefined) advancedMetadata.maxValue = maxValue
    if (minLength !== undefined) advancedMetadata.minLength = minLength
    if (maxLength !== undefined) advancedMetadata.maxLength = maxLength
    if (pattern) advancedMetadata.pattern = pattern
    if (allowedValues) advancedMetadata.allowedValues = allowedValues
    if (deploymentStrategy) advancedMetadata.deploymentStrategy = deploymentStrategy
    if (deploymentConfig) advancedMetadata.deploymentConfig = deploymentConfig
    
    // Merge with existing metadata
    const finalMetadata = metadata || {}
    const combinedMetadata = { ...finalMetadata, ...advancedMetadata }

    const config = await prisma.businessConfig.create({
      data: {
        projectId,
        key,
        label: label || null,
        description: description || null,
        valueType,
        ...valueFields,
        category: category || null,
        isEnabled: isEnabled !== false,
        metadata: Object.keys(combinedMetadata).length > 0 ? combinedMetadata : null
      }
    })

    // Log change
    await logConfigChange(config.id, projectId, payload.userId, 'create', null, extractValue(config), body)

    // Broadcast update to SSE subscribers
    broadcastConfigUpdate({
      projectId,
      configKey: config.key,
      version: config.version,
      updatedAt: config.updatedAt
    })

    return NextResponse.json({ config })
  } catch (error: unknown) {
    console.error('BusinessConfig POST error:', error)
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: 'A config with this key already exists in this project' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update a business config
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const payload = verifyToken(token)

    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      id, 
      key, 
      label, 
      description, 
      valueType, 
      value, 
      category, 
      isEnabled, 
      metadata,
      targetingRules,
      defaultValue,
      rolloutPercentage,
      validationSchema,
      minValue,
      maxValue,
      minLength,
      maxLength,
      pattern,
      allowedValues,
      deploymentStrategy,
      deploymentConfig
    } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing config ID' }, { status: 400 })
    }

    // Verify config ownership
    const existingConfig = await prisma.businessConfig.findUnique({
      where: { id },
      include: { project: true }
    })

    if (!existingConfig || existingConfig.project.userId !== payload.userId) {
      return NextResponse.json({ error: 'Config not found' }, { status: 404 })
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {}

    if (key !== undefined) updateData.key = key
    if (label !== undefined) updateData.label = label || null
    if (description !== undefined) updateData.description = description || null
    if (category !== undefined) updateData.category = category || null
    if (isEnabled !== undefined) updateData.isEnabled = isEnabled
    if (metadata !== undefined) updateData.metadata = metadata
    if (targetingRules !== undefined) updateData.targetingRules = targetingRules || null
    if (defaultValue !== undefined) updateData.defaultValue = defaultValue !== null ? defaultValue : null
    if (rolloutPercentage !== undefined) updateData.rolloutPercentage = Math.max(0, Math.min(100, rolloutPercentage))
    if (validationSchema !== undefined) updateData.validationSchema = validationSchema || null
    if (minValue !== undefined) updateData.minValue = minValue !== null ? minValue : null
    if (maxValue !== undefined) updateData.maxValue = maxValue !== null ? maxValue : null
    if (minLength !== undefined) updateData.minLength = minLength !== null ? minLength : null
    if (maxLength !== undefined) updateData.maxLength = maxLength !== null ? maxLength : null
    if (pattern !== undefined) updateData.pattern = pattern || null
    if (allowedValues !== undefined) updateData.allowedValues = allowedValues || null
    if (deploymentStrategy !== undefined) updateData.deploymentStrategy = deploymentStrategy || null
    if (deploymentConfig !== undefined) updateData.deploymentConfig = deploymentConfig || null

    // Validate value if validation constraints are being updated
    if (value !== undefined && (
      validationSchema !== undefined ||
      minValue !== undefined || maxValue !== undefined ||
      minLength !== undefined || maxLength !== undefined ||
      pattern !== undefined || allowedValues !== undefined
    )) {
      const finalValue = valueType !== undefined ? value : extractValue(existingConfig)
      const finalType = valueType !== undefined ? valueType : existingConfig.valueType
      const finalSchema = validationSchema !== undefined ? validationSchema : existingConfig.validationSchema
      const finalConstraints = {
        minValue: minValue !== undefined ? minValue : existingConfig.minValue,
        maxValue: maxValue !== undefined ? maxValue : existingConfig.maxValue,
        minLength: minLength !== undefined ? minLength : existingConfig.minLength,
        maxLength: maxLength !== undefined ? maxLength : existingConfig.maxLength,
        pattern: pattern !== undefined ? pattern : existingConfig.pattern,
        allowedValues: allowedValues !== undefined ? allowedValues : existingConfig.allowedValues
      }

      const validation = validateConfigValue(finalValue, finalType, finalSchema, finalConstraints)
      if (!validation.valid) {
        return NextResponse.json(
          { error: 'Validation failed', details: validation.errors },
          { status: 400 }
        )
      }
    }

    // Handle value type and value changes
    if (valueType !== undefined) {
      if (!VALUE_TYPES.includes(valueType)) {
        return NextResponse.json({ error: `Invalid valueType. Must be one of: ${VALUE_TYPES.join(', ')}` }, { status: 400 })
      }
      updateData.valueType = valueType

      // Clear all value fields and set new one
      updateData.stringValue = null
      updateData.integerValue = null
      updateData.booleanValue = null
      updateData.decimalValue = null
      updateData.jsonValue = null
      updateData.imageUrl = null

      if (value !== undefined) {
        const valueFields = getValueFields(valueType as ValueType, value)
        Object.assign(updateData, valueFields)
      }
    } else if (value !== undefined) {
      // Update value using existing type
      const valueFields = getValueFields(existingConfig.valueType as ValueType, value)
      Object.assign(updateData, valueFields)
    }

    // Increment version on any update
    updateData.version = existingConfig.version + 1

    // Store before value for change log
    const beforeValue = extractValue(existingConfig)

    const config = await prisma.businessConfig.update({
      where: { id },
      data: updateData
    })

    // Log change
    const afterValue = extractValue(config)
    await logConfigChange(config.id, config.projectId, payload.userId, 'update', beforeValue, afterValue, body)

    // Broadcast update to SSE subscribers
    broadcastConfigUpdate({
      projectId: config.projectId,
      configKey: config.key,
      version: config.version,
      updatedAt: config.updatedAt
    })

    return NextResponse.json({ config })
  } catch (error: unknown) {
    console.error('BusinessConfig PUT error:', error)
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: 'A config with this key already exists in this project' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete a business config
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const configId = request.nextUrl.searchParams.get('id')

    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const payload = verifyToken(token)

    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!configId) {
      return NextResponse.json({ error: 'Missing config ID' }, { status: 400 })
    }

    // Verify config ownership
    const existingConfig = await prisma.businessConfig.findUnique({
      where: { id: configId },
      include: { project: true }
    })

    if (!existingConfig || existingConfig.project.userId !== payload.userId) {
      return NextResponse.json({ error: 'Config not found' }, { status: 404 })
    }

    // Log change before deletion
    const beforeValue = extractValue(existingConfig)
    await logConfigChange(existingConfig.id, existingConfig.projectId, payload.userId, 'delete', beforeValue, null, {})

    // Broadcast update to SSE subscribers
    broadcastConfigUpdate({
      projectId: existingConfig.projectId,
      configKey: existingConfig.key,
      version: existingConfig.version,
      updatedAt: new Date()
    })

    await prisma.businessConfig.delete({
      where: { id: configId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('BusinessConfig DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to prepare value fields based on type
function getValueFields(valueType: ValueType, value: unknown): Record<string, unknown> {
  const fields: Record<string, unknown> = {
    stringValue: null,
    integerValue: null,
    booleanValue: null,
    decimalValue: null,
    jsonValue: null,
    imageUrl: null
  }

  if (value === null || value === undefined) {
    return fields
  }

  switch (valueType) {
    case 'string':
      fields.stringValue = String(value)
      break
    case 'integer':
      fields.integerValue = parseInt(String(value), 10) || 0
      break
    case 'boolean':
      fields.booleanValue = value === true || value === 'true' || value === 1
      break
    case 'decimal':
      fields.decimalValue = parseFloat(String(value)) || 0
      break
    case 'json':
      try {
        fields.jsonValue = typeof value === 'string' ? JSON.parse(value) : value
      } catch (e) {
        // If JSON parsing fails, treat as invalid and return null fields
        throw new Error(`Invalid JSON value: ${e instanceof Error ? e.message : 'Unknown error'}`)
      }
      break
    case 'image':
      fields.imageUrl = String(value)
      break
  }

  return fields
}

/**
 * Log config changes to audit trail
 */
async function logConfigChange(
  configId: string,
  projectId: string,
  userId: string,
  action: 'create' | 'update' | 'delete',
  beforeValue: any,
  afterValue: any,
  changes: any
) {
  try {
    // Get user name for display
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true }
    })

    await prisma.configChangeLog.create({
      data: {
        configId,
        projectId,
        userId,
        userName: user?.name || user?.email || 'Unknown',
        action,
        beforeValue: beforeValue !== undefined ? beforeValue : null,
        afterValue: afterValue !== undefined ? afterValue : null,
        changes: changes || null
      }
    })
  } catch (error) {
    console.error('Failed to log config change:', error)
    // Don't fail the request if logging fails
  }
}

/**
 * Track config usage metrics
 */
async function trackConfigUsage(
  projectId: string,
  configKey: string,
  metrics: {
    deviceId?: string
    userId?: string
    rolloutReceived: boolean
    targetingMatched: boolean
    cacheHit: boolean
  }
) {
  try {
    const uniqueKey = `${projectId}:${configKey}:${metrics.deviceId || 'none'}:${metrics.userId || 'none'}`
    
    await prisma.configUsageMetric.upsert({
      where: {
        projectId_configKey_deviceId_userId: {
          projectId,
          configKey,
          deviceId: metrics.deviceId || null,
          userId: metrics.userId || null
        }
      },
      update: {
        fetchCount: { increment: 1 },
        cacheHit: metrics.cacheHit,
        targetingMatched: metrics.targetingMatched,
        rolloutReceived: metrics.rolloutReceived,
        lastFetchedAt: new Date()
      },
      create: {
        projectId,
        configKey,
        deviceId: metrics.deviceId || null,
        userId: metrics.userId || null,
        fetchCount: 1,
        cacheHit: metrics.cacheHit,
        targetingMatched: metrics.targetingMatched,
        rolloutReceived: metrics.rolloutReceived
      }
    })
  } catch (error) {
    console.error('Failed to track config usage:', error)
    // Don't fail the request if tracking fails
  }
}
