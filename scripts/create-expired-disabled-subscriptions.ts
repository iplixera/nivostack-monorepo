import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Creating expired and disabled subscriptions...')

  // Get all plans
  const plans = await prisma.plan.findMany({
    where: {
      isActive: true,
    },
  })

  if (plans.length === 0) {
    console.error('No active plans found. Please create plans first.')
    process.exit(1)
  }

  // Get some existing users who don't have subscriptions yet
  const usersWithoutSubscriptions = await prisma.user.findMany({
    where: {
      subscription: null,
      isAdmin: false,
    },
    take: 10,
  })

  if (usersWithoutSubscriptions.length === 0) {
    console.log('No users without subscriptions found. Creating new users...')
    
    // Create some test users
    const testUsers = []
    for (let i = 0; i < 10; i++) {
      const user = await prisma.user.create({
        data: {
          email: `expired-user-${i}@test.devbridge.com`,
          name: `Expired User ${i}`,
          password: await hashPassword('password123'),
        },
      })
      testUsers.push(user)
    }
    usersWithoutSubscriptions.push(...testUsers)
  }

  const freePlan = plans.find(p => p.name === 'free' || p.name.includes('free')) || plans[0]
  const proPlan = plans.find(p => p.name === 'pro' || p.name.includes('pro')) || plans[Math.min(1, plans.length - 1)]
  const teamPlan = plans.find(p => p.name === 'team' || p.name.includes('team')) || plans[Math.min(2, plans.length - 1)]

  console.log(`Using plans: ${freePlan.displayName}, ${proPlan?.displayName || 'N/A'}, ${teamPlan?.displayName || 'N/A'}`)

  // Create expired subscriptions
  const expiredCount = Math.min(5, usersWithoutSubscriptions.length)
  for (let i = 0; i < expiredCount; i++) {
    const user = usersWithoutSubscriptions[i]
    const plan = i % 3 === 0 ? freePlan : i % 3 === 1 ? (proPlan || freePlan) : (teamPlan || freePlan)
    
    const trialStartDate = new Date()
    trialStartDate.setDate(trialStartDate.getDate() - 60) // Started 60 days ago
    
    const trialEndDate = new Date(trialStartDate)
    trialEndDate.setDate(trialEndDate.getDate() + 30) // Ended 30 days ago
    
    const currentPeriodEnd = new Date(trialEndDate)
    currentPeriodEnd.setDate(currentPeriodEnd.getDate() - 30) // Period ended 30 days ago

    await prisma.subscription.create({
      data: {
        userId: user.id,
        planId: plan.id,
        status: 'expired',
        enabled: false,
        trialStartDate,
        trialEndDate,
        currentPeriodStart: trialStartDate,
        currentPeriodEnd,
      },
    })

    console.log(`Created expired subscription for ${user.email} (${plan.displayName})`)
  }

  // Create disabled subscriptions
  const disabledStartIndex = expiredCount
  const disabledCount = Math.min(5, usersWithoutSubscriptions.length - disabledStartIndex)
  
  for (let i = 0; i < disabledCount; i++) {
    const user = usersWithoutSubscriptions[disabledStartIndex + i]
    const plan = i % 3 === 0 ? freePlan : i % 3 === 1 ? (proPlan || freePlan) : (teamPlan || freePlan)
    
    const trialStartDate = new Date()
    trialStartDate.setDate(trialStartDate.getDate() - 10) // Started 10 days ago
    
    const trialEndDate = new Date(trialStartDate)
    trialEndDate.setDate(trialEndDate.getDate() + 30) // Ends in 20 days
    
    const currentPeriodEnd = new Date(trialEndDate)

    const subscription = await prisma.subscription.create({
      data: {
        userId: user.id,
        planId: plan.id,
        status: 'active',
        enabled: false, // Disabled
        trialStartDate,
        trialEndDate,
        currentPeriodStart: trialStartDate,
        currentPeriodEnd,
        disabledBy: (await prisma.user.findFirst({ where: { isAdmin: true } }))?.id || null,
        disabledAt: new Date(),
      },
    })

    console.log(`Created disabled subscription for ${user.email} (${plan.displayName})`)
  }

  // Also update some existing subscriptions to expired/disabled
  const existingSubscriptions = await prisma.subscription.findMany({
    where: {
      status: 'active',
      enabled: true,
    },
    take: 5,
  })

  for (let i = 0; i < Math.min(3, existingSubscriptions.length); i++) {
    const sub = existingSubscriptions[i]
    
    if (i === 0) {
      // Make first one expired
      await prisma.subscription.update({
        where: { id: sub.id },
        data: {
          status: 'expired',
          enabled: false,
          trialEndDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          currentPeriodEnd: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      })
      console.log(`Updated subscription ${sub.id} to expired`)
    } else {
      // Make others disabled
      const adminUser = await prisma.user.findFirst({ where: { isAdmin: true } })
      await prisma.subscription.update({
        where: { id: sub.id },
        data: {
          enabled: false,
          disabledBy: adminUser?.id || null,
          disabledAt: new Date(),
        },
      })
      console.log(`Updated subscription ${sub.id} to disabled`)
    }
  }

  console.log('\n✅ Successfully created expired and disabled subscriptions!')
  console.log(`- Created ${expiredCount} expired subscriptions`)
  console.log(`- Created ${disabledCount} disabled subscriptions`)
  console.log(`- Updated ${Math.min(3, existingSubscriptions.length)} existing subscriptions`)
}

async function hashPassword(password: string): Promise<string> {
  const bcrypt = require('bcryptjs')
  return bcrypt.hash(password, 12)
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

