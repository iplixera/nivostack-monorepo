import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

/**
 * PUT /api/localization/glossary/[id]
 * Update a glossary term
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const {
      term,
      definition,
      context,
      translations,
      category,
      isActive
    } = await request.json()

    const glossaryTerm = await prisma.glossary.findUnique({
      where: { id },
      include: {
        project: true
      }
    })

    if (!glossaryTerm) {
      return NextResponse.json({ error: 'Glossary term not found' }, { status: 404 })
    }

    // Verify project ownership
    if (glossaryTerm.project.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const updated = await prisma.glossary.update({
      where: { id },
      data: {
        ...(term !== undefined && { term }),
        ...(definition !== undefined && { definition }),
        ...(context !== undefined && { context }),
        ...(translations !== undefined && { translations }),
        ...(category !== undefined && { category }),
        ...(isActive !== undefined && { isActive })
      }
    })

    return NextResponse.json({ term: updated })
  } catch (error) {
    console.error('Update glossary term error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/localization/glossary/[id]
 * Delete a glossary term
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const glossaryTerm = await prisma.glossary.findUnique({
      where: { id },
      include: {
        project: true
      }
    })

    if (!glossaryTerm) {
      return NextResponse.json({ error: 'Glossary term not found' }, { status: 404 })
    }

    // Verify project ownership
    if (glossaryTerm.project.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await prisma.glossary.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete glossary term error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

