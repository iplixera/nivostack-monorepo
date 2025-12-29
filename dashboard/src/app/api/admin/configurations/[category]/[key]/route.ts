import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, isAdminUser } from '@/lib/auth'

/**
 * GET /api/admin/configurations/[category]/[key]
 * Get a specific configuration value (admin only, returns decrypted value)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ category: string; key: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user || !isAdminUser(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { category, key } = await params

    const configuration = await prisma.systemConfiguration.findUnique({
      where: {
        category_key: {
          category,
          key
        }
      }
    })

    if (!configuration) {
      return NextResponse.json({ error: 'Configuration not found' }, { status: 404 })
    }

    // TODO: Decrypt value if encrypted
    // For now, return as-is

    return NextResponse.json({ configuration })
  } catch (error) {
    console.error('Get configuration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/configurations/[category]/[key]
 * Delete a configuration (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ category: string; key: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user || !isAdminUser(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { category, key } = await params

    await prisma.systemConfiguration.delete({
      where: {
        category_key: {
          category,
          key
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete configuration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

