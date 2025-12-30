import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { put, del } from '@vercel/blob'

// POST - Upload a file
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

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const projectId = formData.get('projectId') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!projectId) {
      return NextResponse.json({ error: 'Missing projectId' }, { status: 400 })
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

    // Validate file type (only images allowed)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        error: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP, SVG'
      }, { status: 400 })
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({
        error: 'File too large. Maximum size is 5MB'
      }, { status: 400 })
    }

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'jpg'
    const storedName = `${projectId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`

    // Upload to Vercel Blob storage
    const blob = await put(storedName, file, {
      access: 'public',
      contentType: file.type
    })

    // Save file record to database
    const uploadedFile = await prisma.uploadedFile.create({
      data: {
        projectId,
        filename: file.name,
        storedName,
        mimeType: file.type,
        size: file.size,
        url: blob.url,
        uploadedBy: payload.userId
      }
    })

    return NextResponse.json({
      success: true,
      file: {
        id: uploadedFile.id,
        filename: uploadedFile.filename,
        url: uploadedFile.url,
        size: uploadedFile.size,
        mimeType: uploadedFile.mimeType
      }
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}

// DELETE - Delete an uploaded file
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const fileId = request.nextUrl.searchParams.get('id')
    const fileUrl = request.nextUrl.searchParams.get('url')

    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const payload = verifyToken(token)

    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find the file either by ID or URL
    let uploadedFile
    if (fileId) {
      uploadedFile = await prisma.uploadedFile.findUnique({
        where: { id: fileId }
      })
    } else if (fileUrl) {
      uploadedFile = await prisma.uploadedFile.findFirst({
        where: { url: fileUrl }
      })
    }

    if (!uploadedFile) {
      // If not found in DB but URL provided, still try to delete from blob
      if (fileUrl) {
        try {
          await del(fileUrl)
        } catch {
          // Ignore blob deletion errors
        }
      }
      return NextResponse.json({ success: true })
    }

    // Verify ownership through project
    const project = await prisma.project.findFirst({
      where: {
        id: uploadedFile.projectId,
        userId: payload.userId
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Delete from Vercel Blob storage
    try {
      await del(uploadedFile.url)
    } catch (error) {
      console.error('Blob deletion error:', error)
      // Continue even if blob deletion fails
    }

    // Delete record from database
    await prisma.uploadedFile.delete({
      where: { id: uploadedFile.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete file error:', error)
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 })
  }
}

// GET - List uploaded files for a project
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const projectId = request.nextUrl.searchParams.get('projectId')

    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const payload = verifyToken(token)

    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!projectId) {
      return NextResponse.json({ error: 'Missing projectId' }, { status: 400 })
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

    const files = await prisma.uploadedFile.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ files })
  } catch (error) {
    console.error('List files error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
