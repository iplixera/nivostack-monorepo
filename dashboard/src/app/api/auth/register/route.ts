import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken } from '@/lib/auth'
import { createSubscription } from '@/lib/subscription'
import { createInvitationNotification } from '@/lib/notifications'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    const hashedPassword = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name
      },
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true
      }
    })

    // Create free plan subscription for new user
    try {
      await createSubscription(user.id, 'free')
    } catch (error) {
      console.error('Failed to create subscription:', error)
      // Don't fail registration if subscription creation fails
      // Subscription can be created manually if needed
    }

    // Check for pending invitations for this email
    // This handles the case where a user was invited before they registered
    // Use case-insensitive email matching
    try {
      const emailLower = email.toLowerCase()
      const pendingInvitations = await prisma.projectInvitation.findMany({
        where: {
          email: {
            equals: emailLower,
            mode: 'insensitive', // Case-insensitive matching
          },
          status: 'pending',
          expiresAt: {
            gt: new Date(), // Not expired
          },
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
          inviter: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      // Create notifications for each pending invitation
      for (const invitation of pendingInvitations) {
        try {
          await createInvitationNotification(
            user.id,
            invitation.projectId,
            invitation.id,
            invitation.project.name,
            invitation.inviter.name || invitation.inviter.email,
            invitation.role,
            invitation.token // Pass token for direct acceptance
          )
        } catch (notifError) {
          console.error('Failed to create invitation notification:', notifError)
          // Don't fail registration if notification creation fails
        }
      }

      if (pendingInvitations.length > 0) {
        console.log(`Created ${pendingInvitations.length} invitation notification(s) for new user ${user.email}`)
      }
    } catch (invitationError) {
      console.error('Error checking for pending invitations:', invitationError)
      // Don't fail registration if invitation check fails
    }

    const token = generateToken(user.id)

    return NextResponse.json({
      user,
      token
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
