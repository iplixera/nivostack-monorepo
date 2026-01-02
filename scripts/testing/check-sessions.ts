import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkSessions() {
  console.log('\n=== Checking Sessions ===\n')
  
  // Find the project
  const project = await prisma.project.findFirst({
    where: {
      user: {
        email: 'freeplan@dev.com'
      }
    }
  })
  
  if (!project) {
    console.error('❌ Project not found')
    return
  }
  
  console.log(`Project: ${project.name} (ID: ${project.id})`)
  
  // Get all sessions
  const sessions = await prisma.session.findMany({
    where: {
      projectId: project.id
    },
    include: {
      device: {
        select: {
          deviceId: true,
          platform: true
        }
      }
    },
    orderBy: {
      startedAt: 'desc'
    }
  })
  
  console.log(`\nTotal sessions: ${sessions.length}\n`)
  
  if (sessions.length > 0) {
    console.log('Sessions:')
    sessions.forEach((session, index) => {
      console.log(`\n${index + 1}. Session ID: ${session.id}`)
      console.log(`   Token: ${session.sessionToken}`)
      console.log(`   Device: ${session.device?.deviceId || 'N/A'}`)
      console.log(`   Started: ${session.startedAt}`)
      console.log(`   Ended: ${session.endedAt || 'Active'}`)
      console.log(`   Is Active: ${session.isActive}`)
    })
  }
  
  // Check subscription and quota
  const user = await prisma.user.findUnique({
    where: { email: 'freeplan@dev.com' },
    include: {
      subscriptions: {
        where: {
          status: { in: ['active', 'trial'] }
        },
        include: {
          plan: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 1
        }
    }
  })
  
  if (user && user.subscriptions.length > 0) {
    const subscription = user.subscriptions[0]
    console.log(`\nSubscription:`)
    console.log(`  Plan: ${subscription.plan.name}`)
    console.log(`  Max Sessions: ${subscription.plan.maxSessions}`)
    console.log(`  Status: ${subscription.status}`)
    console.log(`  Current Period Start: ${subscription.currentPeriodStart}`)
    console.log(`  Current Period End: ${subscription.currentPeriodEnd}`)
    
    // Count sessions in current period
    const periodStart = subscription.currentPeriodStart
    const periodEnd = subscription.currentPeriodEnd || new Date()
    
    const sessionsInPeriod = await prisma.session.count({
      where: {
        project: {
          userId: user.id
        },
        createdAt: {
          gte: periodStart,
          lt: periodEnd
        }
      }
    })
    
    console.log(`\nSessions in current period (${periodStart.toISOString()} to ${periodEnd.toISOString()}): ${sessionsInPeriod}`)
  }
  
  await prisma.$disconnect()
}

checkSessions().catch(console.error)
