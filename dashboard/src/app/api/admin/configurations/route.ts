import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, isAdminUser } from '@/lib/auth'

/**
 * GET /api/admin/configurations
 * Get all system configurations (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user || !isAdminUser(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const where: any = {}
    if (category) {
      where.category = category
    }

    const configurations = await prisma.systemConfiguration.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { key: 'asc' }
      ]
    })

    // Don't return encrypted values in list view
    const safeConfigs = configurations.map(config => ({
      ...config,
      value: config.encrypted ? '[ENCRYPTED]' : config.value
    }))

    return NextResponse.json({ configurations: safeConfigs })
  } catch (error) {
    console.error('Get configurations error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/configurations
 * Create or update a system configuration (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user || !isAdminUser(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      category,
      key,
      value,
      encrypted,
      description,
      isActive,
      metadata
    } = await request.json()

    if (!category || !key) {
      return NextResponse.json(
        { error: 'category and key are required' },
        { status: 400 }
      )
    }

    // TODO: Implement encryption for sensitive values
    // For now, store as-is

    const configuration = await prisma.systemConfiguration.upsert({
      where: {
        category_key: {
          category,
          key
        }
      },
      update: {
        value: value !== undefined ? value : undefined,
        encrypted: encrypted ?? false,
        description: description !== undefined ? description : undefined,
        isActive: isActive !== undefined ? isActive : true,
        metadata: metadata !== undefined ? metadata : undefined,
        updatedBy: user.id
      },
      create: {
        category,
        key,
        value: value || null,
        encrypted: encrypted ?? false,
        description: description || null,
        isActive: isActive ?? true,
        metadata: metadata || null,
        updatedBy: user.id
      }
    })

    // Don't return encrypted values
    const safeConfig = {
      ...configuration,
      value: configuration.encrypted ? '[ENCRYPTED]' : configuration.value
    }

    return NextResponse.json({ configuration: safeConfig })
  } catch (error) {
    console.error('Create/update configuration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

