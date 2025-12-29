import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// GET - List all config categories for a project
export async function GET(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key')
    const authHeader = request.headers.get('authorization')
    const projectId = request.nextUrl.searchParams.get('projectId')

    let project

    // SDK authentication (API key)
    if (apiKey) {
      project = await prisma.project.findUnique({
        where: { apiKey },
        select: { id: true }
      })
      if (!project) {
        return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
      }
    }
    // Dashboard authentication (JWT)
    else if (authHeader && projectId) {
      const token = authHeader.replace('Bearer ', '')
      const payload = verifyToken(token)
      if (!payload) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      project = await prisma.project.findFirst({
        where: { id: projectId, userId: payload.userId },
        select: { id: true }
      })
      if (!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 })
      }
    } else {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const categories = await prisma.configCategory.findMany({
      where: { projectId: project.id },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Config categories GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new config category
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
    const { projectId, name, label, description, icon } = body

    if (!projectId || !name) {
      return NextResponse.json({ error: 'Project ID and name required' }, { status: 400 })
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: payload.userId }
    })
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Get max order for new category
    const maxOrder = await prisma.configCategory.aggregate({
      where: { projectId },
      _max: { order: true }
    })

    const category = await prisma.configCategory.create({
      data: {
        projectId,
        name,
        label: label || null,
        description: description || null,
        icon: icon || null,
        order: (maxOrder._max.order ?? -1) + 1
      }
    })

    return NextResponse.json({ category }, { status: 201 })
  } catch (error) {
    console.error('Config categories POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update a config category
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
    const { id, name, label, description, icon, order, isEnabled } = body

    if (!id) {
      return NextResponse.json({ error: 'Category ID required' }, { status: 400 })
    }

    // Verify category ownership via project
    const existingCategory = await prisma.configCategory.findUnique({
      where: { id },
      include: { project: { select: { userId: true } } }
    })

    if (!existingCategory || existingCategory.project.userId !== payload.userId) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    const category = await prisma.configCategory.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(label !== undefined && { label }),
        ...(description !== undefined && { description }),
        ...(icon !== undefined && { icon }),
        ...(order !== undefined && { order }),
        ...(isEnabled !== undefined && { isEnabled })
      }
    })

    return NextResponse.json({ category })
  } catch (error) {
    console.error('Config categories PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete a config category
export async function DELETE(request: NextRequest) {
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

    const categoryId = request.nextUrl.searchParams.get('id')
    if (!categoryId) {
      return NextResponse.json({ error: 'Category ID required' }, { status: 400 })
    }

    // Verify category ownership via project
    const category = await prisma.configCategory.findUnique({
      where: { id: categoryId },
      include: { project: { select: { userId: true } } }
    })

    if (!category || category.project.userId !== payload.userId) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    await prisma.configCategory.delete({
      where: { id: categoryId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Config categories DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
