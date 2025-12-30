import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

/**
 * PATCH /api/business-config/[id]/alerts/[alertId]
 * Update an alert
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; alertId: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, alertId } = await params
    const body = await request.json()

    const config = await prisma.businessConfig.findUnique({
      where: { id },
      include: { project: true }
    })

    if (!config) {
      return NextResponse.json({ error: 'Config not found' }, { status: 404 })
    }

    // Verify project ownership
    if (config.project.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const updateData: any = {}
    if (body.name !== undefined) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description
    if (body.enabled !== undefined) updateData.enabled = body.enabled
    if (body.condition !== undefined) updateData.condition = body.condition
    if (body.threshold !== undefined) updateData.threshold = body.threshold
    if (body.operator !== undefined) updateData.operator = body.operator
    if (body.timeWindow !== undefined) updateData.timeWindow = body.timeWindow
    if (body.minOccurrences !== undefined) updateData.minOccurrences = body.minOccurrences
    if (body.webhookUrl !== undefined) updateData.webhookUrl = body.webhookUrl || null
    if (body.emailRecipients !== undefined) updateData.emailRecipients = body.emailRecipients || null

    const alert = await prisma.configAlert.update({
      where: { id: alertId },
      data: updateData
    })

    return NextResponse.json({ alert })
  } catch (error) {
    console.error('Update alert error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/business-config/[id]/alerts/[alertId]
 * Delete an alert
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; alertId: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, alertId } = await params

    const config = await prisma.businessConfig.findUnique({
      where: { id },
      include: { project: true }
    })

    if (!config) {
      return NextResponse.json({ error: 'Config not found' }, { status: 404 })
    }

    // Verify project ownership
    if (config.project.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await prisma.configAlert.delete({
      where: { id: alertId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete alert error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

