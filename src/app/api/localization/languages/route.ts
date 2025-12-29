import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// GET - Fetch all languages for a project
export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json({ error: 'Missing projectId' }, { status: 400 })
    }

    // Check for API key first (SDK access)
    const apiKey = request.headers.get('x-api-key')
    if (apiKey) {
      const project = await prisma.project.findFirst({
        where: { id: projectId, apiKey }
      })
      if (!project) {
        return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
      }
    } else {
      // Dashboard access via JWT
      const authHeader = request.headers.get('authorization')
      if (!authHeader) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const token = authHeader.replace('Bearer ', '')
      const payload = verifyToken(token)

      if (!payload) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      // Verify project ownership
      const project = await prisma.project.findFirst({
        where: { id: projectId, userId: payload.userId }
      })

      if (!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 })
      }
    }

    const languages = await prisma.language.findMany({
      where: { projectId },
      orderBy: [
        { isDefault: 'desc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json({ languages })
  } catch (error) {
    console.error('Get languages error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new language
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
    const { projectId, code, name, nativeName, isDefault, isRTL } = body

    if (!projectId || !code || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: payload.userId }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Check localization languages quota
    const { checkThrottling } = await import('@/lib/throttling')
    const throttling = await checkThrottling(project.userId, 'localizationLanguages')
    if (throttling.throttled || (throttling.usage && throttling.usage.limit !== null && throttling.usage.used >= throttling.usage.limit)) {
      return NextResponse.json(
        {
          error: throttling.error || `Localization languages limit reached. You have used ${throttling.usage?.used || 0} of ${throttling.usage?.limit || 0} languages. Please upgrade your plan to add more languages.`,
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

    // Check if language code already exists
    const existing = await prisma.language.findFirst({
      where: { projectId, code }
    })

    if (existing) {
      return NextResponse.json({ error: 'Language code already exists' }, { status: 409 })
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.language.updateMany({
        where: { projectId, isDefault: true },
        data: { isDefault: false }
      })
    }

    const language = await prisma.language.create({
      data: {
        projectId,
        code,
        name,
        nativeName: nativeName || null,
        isDefault: isDefault || false,
        isRTL: isRTL || false,
        isEnabled: true
      }
    })

    return NextResponse.json({ language }, { status: 201 })
  } catch (error) {
    console.error('Create language error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update a language
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
    const { id, name, nativeName, isDefault, isEnabled, isRTL } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing language id' }, { status: 400 })
    }

    // Find the language and verify ownership
    const language = await prisma.language.findUnique({
      where: { id },
      include: { project: true }
    })

    if (!language || language.project.userId !== payload.userId) {
      return NextResponse.json({ error: 'Language not found' }, { status: 404 })
    }

    // If setting as default, unset other defaults
    if (isDefault && !language.isDefault) {
      await prisma.language.updateMany({
        where: { projectId: language.projectId, isDefault: true },
        data: { isDefault: false }
      })
    }

    const updatedLanguage = await prisma.language.update({
      where: { id },
      data: {
        name: name !== undefined ? name : language.name,
        nativeName: nativeName !== undefined ? nativeName : language.nativeName,
        isDefault: isDefault !== undefined ? isDefault : language.isDefault,
        isEnabled: isEnabled !== undefined ? isEnabled : language.isEnabled,
        isRTL: isRTL !== undefined ? isRTL : language.isRTL
      }
    })

    return NextResponse.json({ language: updatedLanguage })
  } catch (error) {
    console.error('Update language error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete a language
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const languageId = request.nextUrl.searchParams.get('id')

    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const payload = verifyToken(token)

    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!languageId) {
      return NextResponse.json({ error: 'Missing language id' }, { status: 400 })
    }

    // Find the language and verify ownership
    const language = await prisma.language.findUnique({
      where: { id: languageId },
      include: { project: true }
    })

    if (!language || language.project.userId !== payload.userId) {
      return NextResponse.json({ error: 'Language not found' }, { status: 404 })
    }

    // Prevent deleting the default language
    if (language.isDefault) {
      return NextResponse.json({
        error: 'Cannot delete the default language. Set another language as default first.'
      }, { status: 400 })
    }

    // Delete the language (cascade will delete translations)
    await prisma.language.delete({
      where: { id: languageId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete language error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
