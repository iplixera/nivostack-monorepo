import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateApiKey } from '@/lib/auth'
import { evaluateTargeting, shouldReceiveRollout, TargetingContext } from '@/lib/business-config/targeting'

/**
 * POST /api/business-config/evaluate
 * Evaluate config with targeting rules and rollout percentage
 * This endpoint allows testing targeting rules with sample context
 */
export async function POST(request: NextRequest) {
  try {
    const project = await validateApiKey(request)
    if (!project) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    const { configKey, context } = await request.json()

    if (!configKey) {
      return NextResponse.json(
        { error: 'configKey is required' },
        { status: 400 }
      )
    }

    const config = await prisma.businessConfig.findFirst({
      where: {
        projectId: project.id,
        key: configKey
      }
    })

    if (!config || !config.isEnabled) {
      return NextResponse.json({ error: 'Config not found' }, { status: 404 })
    }

    // Check rollout percentage
    const receivesRollout = shouldReceiveRollout(
      config.rolloutPercentage || 100,
      (context || {}) as TargetingContext
    )

    if (!receivesRollout) {
      return NextResponse.json({
        receivesRollout: false,
        value: null,
        reason: 'User not included in rollout percentage'
      })
    }

    // Helper to extract value based on type
    function extractValue(c: typeof config): any {
      switch (c.valueType) {
        case 'string': return c.stringValue
        case 'integer': return c.integerValue
        case 'boolean': return c.booleanValue
        case 'decimal': return c.decimalValue
        case 'json': return c.jsonValue
        case 'image': return c.imageUrl
        default: return null
      }
    }

    // Get default value
    const defaultValue = extractValue(config)

    // Evaluate targeting rules
    let finalValue = defaultValue
    if (config.targetingRules) {
      try {
        finalValue = evaluateTargeting(
          config.targetingRules as any,
          (context || {}) as TargetingContext,
          config.defaultValue !== null ? config.defaultValue : defaultValue
        )
      } catch (error) {
        return NextResponse.json({
          error: 'Targeting evaluation failed',
          details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
      }
    }

    return NextResponse.json({
      receivesRollout: true,
      value: finalValue,
      matchedTargeting: config.targetingRules ? true : false
    })
  } catch (error) {
    console.error('Evaluate config error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

