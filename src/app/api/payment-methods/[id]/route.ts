import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe, deletePaymentMethod as stripeDeletePaymentMethod } from '@/lib/stripe'

/**
 * GET /api/payment-methods/[id]
 * Get a specific payment method
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { id } = await params

    const paymentMethod = await prisma.paymentMethod.findFirst({
      where: {
        id,
        userId: payload.userId,
      },
    })

    if (!paymentMethod) {
      return NextResponse.json({ error: 'Payment method not found' }, { status: 404 })
    }

    return NextResponse.json({ paymentMethod })
  } catch (error) {
    console.error('Get payment method error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/payment-methods/[id]
 * Delete a payment method
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { id } = await params

    const paymentMethod = await prisma.paymentMethod.findFirst({
      where: {
        id,
        userId: payload.userId,
      },
    })

    if (!paymentMethod) {
      return NextResponse.json({ error: 'Payment method not found' }, { status: 404 })
    }

    // Delete from Stripe
    if (stripe && paymentMethod.stripePaymentMethodId) {
      await stripeDeletePaymentMethod(paymentMethod.stripePaymentMethodId)
    }

    // Delete from database
    await prisma.paymentMethod.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete payment method error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/payment-methods/[id]
 * Update a payment method (mainly for setting as default)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { id } = await params
    const { isDefault } = await request.json()

    const paymentMethod = await prisma.paymentMethod.findFirst({
      where: {
        id,
        userId: payload.userId,
      },
    })

    if (!paymentMethod) {
      return NextResponse.json({ error: 'Payment method not found' }, { status: 404 })
    }

    // If setting as default, unset other defaults
    if (isDefault === true) {
      await prisma.paymentMethod.updateMany({
        where: { userId: payload.userId, isDefault: true },
        data: { isDefault: false },
      })
    }

    // Update payment method
    const updated = await prisma.paymentMethod.update({
      where: { id },
      data: {
        isDefault: isDefault !== undefined ? isDefault : paymentMethod.isDefault,
      },
    })

    return NextResponse.json({ paymentMethod: updated })
  } catch (error) {
    console.error('Update payment method error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

