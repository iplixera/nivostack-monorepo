import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

/**
 * GET /api/localization/providers
 * Get translation providers for a project
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId is required' },
        { status: 400 }
      )
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: user.id }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const providers = await prisma.translationProvider.findMany({
      where: { projectId },
      select: {
        id: true,
        provider: true,
        isEnabled: true,
        autoTranslate: true,
        defaultSourceLanguageId: true,
        createdAt: true,
        updatedAt: true
        // Don't return API keys for security
      }
    })

    return NextResponse.json({ providers })
  } catch (error) {
    console.error('Get providers error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/localization/providers
 * Create or update a translation provider
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      projectId,
      provider,
      apiKey,
      apiSecret,
      isEnabled,
      autoTranslate,
      defaultSourceLanguageId
    } = await request.json()

    if (!projectId || !provider) {
      return NextResponse.json(
        { error: 'projectId and provider are required' },
        { status: 400 }
      )
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: user.id }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Validate provider
    const validProviders = ['google', 'deepl', 'azure', 'manual']
    if (!validProviders.includes(provider)) {
      return NextResponse.json(
        { error: `Invalid provider. Must be one of: ${validProviders.join(', ')}` },
        { status: 400 }
      )
    }

    // TODO: Encrypt API keys before storing
    // For now, store as-is (should use encryption in production)

    const translationProvider = await prisma.translationProvider.upsert({
      where: {
        projectId_provider: {
          projectId,
          provider
        }
      },
      update: {
        ...(apiKey !== undefined && { apiKey }),
        ...(apiSecret !== undefined && { apiSecret }),
        ...(isEnabled !== undefined && { isEnabled }),
        ...(autoTranslate !== undefined && { autoTranslate }),
        ...(defaultSourceLanguageId !== undefined && { defaultSourceLanguageId })
      },
      create: {
        projectId,
        provider,
        apiKey: apiKey || null,
        apiSecret: apiSecret || null,
        isEnabled: isEnabled ?? true,
        autoTranslate: autoTranslate ?? false,
        defaultSourceLanguageId: defaultSourceLanguageId || null
      }
    })

    // Don't return API keys in response
    const { apiKey: _, apiSecret: __, ...response } = translationProvider

    return NextResponse.json({ provider: response })
  } catch (error) {
    console.error('Create/update provider error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

