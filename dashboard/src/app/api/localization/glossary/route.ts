import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

/**
 * GET /api/localization/glossary
 * Get glossary terms for a project
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const category = searchParams.get('category')
    const search = searchParams.get('search')

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

    let where: any = {
      projectId,
      isActive: true
    }

    if (category) {
      where.category = category
    }

    if (search) {
      where.term = { contains: search, mode: 'insensitive' }
    }

    const glossary = await prisma.glossary.findMany({
      where,
      orderBy: {
        term: 'asc'
      }
    })

    return NextResponse.json({ glossary })
  } catch (error) {
    console.error('Get glossary error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/localization/glossary
 * Create a new glossary term
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      projectId,
      term,
      definition,
      context,
      translations,
      category
    } = await request.json()

    if (!projectId || !term) {
      return NextResponse.json(
        { error: 'projectId and term are required' },
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

    const glossaryTerm = await prisma.glossary.create({
      data: {
        projectId,
        term,
        definition,
        context,
        translations: translations || {},
        category
      }
    })

    return NextResponse.json({ term: glossaryTerm })
  } catch (error) {
    console.error('Create glossary term error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

