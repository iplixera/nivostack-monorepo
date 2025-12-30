import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

/**
 * GET /api/devices/[id]/notes
 * Get device notes
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify user owns the device's project
    const device = await prisma.device.findUnique({
      where: { id },
      include: { project: true }
    })

    if (!device) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 })
    }

    if (!device.project || device.project.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // TODO: notes field needs to be added to Device model
    return NextResponse.json({ notes: (device as any).notes || [] })
  } catch (error) {
    console.error('Get device notes error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/devices/[id]/notes
 * Add a note to device
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { content } = await request.json()

    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Note content is required' }, { status: 400 })
    }

    // Verify user owns the device's project
    const device = await prisma.device.findUnique({
      where: { id },
      include: { project: true }
    })

    if (!device) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 })
    }

    if (!device.project || device.project.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // TODO: notes field needs to be added to Device model
    // Get existing notes or initialize empty array
    const existingNotes = ((device as any).notes as any) || []
    
    // Add new note with metadata
    const newNote = {
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content,
      author: user.name || user.email,
      authorId: user.id,
      createdAt: new Date().toISOString()
    }

    const updatedNotes = [...existingNotes, newNote]

    // Update device notes
    // TODO: notes field needs to be added to Device model
    const updatedDevice = await prisma.device.update({
      where: { id },
      data: { notes: updatedNotes as any } as any
    })

    return NextResponse.json({ notes: (updatedDevice as any).notes || updatedNotes })
  } catch (error) {
    console.error('Add device note error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/devices/[id]/notes/[noteId]
 * Delete a note from device
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; noteId?: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const noteId = searchParams.get('noteId') || (await params).noteId

    if (!noteId) {
      return NextResponse.json({ error: 'Note ID is required' }, { status: 400 })
    }

    // Verify user owns the device's project
    const device = await prisma.device.findUnique({
      where: { id },
      include: { project: true }
    })

    if (!device) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 })
    }

    if (!device.project || device.project.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // TODO: notes field needs to be added to Device model
    // Get existing notes
    const existingNotes = (((device as any).notes as any) || []) as Array<{ id: string }>
    
    // Remove note by ID
    const updatedNotes = existingNotes.filter((note: any) => note.id !== noteId)

    // Update device notes
    // TODO: notes field needs to be added to Device model
    const updatedDevice = await prisma.device.update({
      where: { id },
      data: { notes: updatedNotes as any } as any
    })

    return NextResponse.json({ notes: (updatedDevice as any).notes || updatedNotes })
  } catch (error) {
    console.error('Delete device note error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

