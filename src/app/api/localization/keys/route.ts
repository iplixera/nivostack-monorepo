import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// GET - Fetch all localization keys for a project
export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get('projectId')
    const category = request.nextUrl.searchParams.get('category')

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

    const where: { projectId: string; category?: string } = { projectId }
    if (category) {
      where.category = category
    }

    const keys = await prisma.localizationKey.findMany({
      where,
      include: {
        translations: {
          include: {
            language: {
              select: {
                id: true,
                code: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: [
        { category: 'asc' },
        { key: 'asc' }
      ]
    })

    return NextResponse.json({ keys })
  } catch (error) {
    console.error('Get localization keys error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new localization key
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
    const { projectId, key, description, category, platform, maxLength, screenshot } = body

    if (!projectId || !key) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: payload.userId }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Check localization keys quota
    const { checkThrottling } = await import('@/lib/throttling')
    const throttling = await checkThrottling(project.userId, 'localizationKeys')
    if (throttling.throttled || (throttling.usage && throttling.usage.limit !== null && throttling.usage.used >= throttling.usage.limit)) {
      return NextResponse.json(
        {
          error: throttling.error || `Localization keys limit reached. You have used ${throttling.usage?.used || 0} of ${throttling.usage?.limit || 0} keys. Please upgrade your plan to create more keys.`,
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

    // Check if key already exists
    const existing = await prisma.localizationKey.findFirst({
      where: { projectId, key }
    })

    if (existing) {
      return NextResponse.json({ error: 'Key already exists' }, { status: 409 })
    }

    const localizationKey = await prisma.localizationKey.create({
      data: {
        projectId,
        key,
        description: description || null,
        category: category || null,
        platform: platform || null,
        maxLength: maxLength || null,
        screenshot: screenshot || null
      },
      include: {
        translations: true
      }
    })

    return NextResponse.json({ key: localizationKey }, { status: 201 })
  } catch (error) {
    console.error('Create localization key error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update a localization key
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
    const { id, key, description, category, platform, maxLength, screenshot } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing key id' }, { status: 400 })
    }

    // Find the key and verify ownership
    const localizationKey = await prisma.localizationKey.findUnique({
      where: { id },
      include: { project: true }
    })

    if (!localizationKey || localizationKey.project.userId !== payload.userId) {
      return NextResponse.json({ error: 'Key not found' }, { status: 404 })
    }

    // If changing the key, check for duplicates
    if (key && key !== localizationKey.key) {
      const existing = await prisma.localizationKey.findFirst({
        where: { projectId: localizationKey.projectId, key, id: { not: id } }
      })
      if (existing) {
        return NextResponse.json({ error: 'Key already exists' }, { status: 409 })
      }
    }

    const updatedKey = await prisma.localizationKey.update({
      where: { id },
      data: {
        key: key !== undefined ? key : localizationKey.key,
        description: description !== undefined ? description : localizationKey.description,
        category: category !== undefined ? category : localizationKey.category,
        platform: platform !== undefined ? platform : localizationKey.platform,
        maxLength: maxLength !== undefined ? maxLength : localizationKey.maxLength,
        screenshot: screenshot !== undefined ? screenshot : localizationKey.screenshot
      },
      include: {
        translations: {
          include: {
            language: {
              select: {
                id: true,
                code: true,
                name: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({ key: updatedKey })
  } catch (error) {
    console.error('Update localization key error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete a localization key
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const keyId = request.nextUrl.searchParams.get('id')

    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const payload = verifyToken(token)

    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!keyId) {
      return NextResponse.json({ error: 'Missing key id' }, { status: 400 })
    }

    // Find the key and verify ownership
    const localizationKey = await prisma.localizationKey.findUnique({
      where: { id: keyId },
      include: { project: true }
    })

    if (!localizationKey || localizationKey.project.userId !== payload.userId) {
      return NextResponse.json({ error: 'Key not found' }, { status: 404 })
    }

    // Delete the key (cascade will delete translations)
    await prisma.localizationKey.delete({
      where: { id: keyId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete localization key error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
