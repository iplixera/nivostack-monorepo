import { prisma } from './src/lib/prisma'
import { getUsageStats } from './src/lib/subscription'

async function checkQuota() {
  // Find the free plan user
  const user = await prisma.user.findFirst({
    where: { email: 'freeplan@dev.com' },
    include: {
      subscription: {
        include: { plan: true }
      }
    }
  })
  
  if (!user) {
    console.error('User not found')
    return
  }
  
  console.log('User:', user.email)
  console.log('Plan:', user.subscription?.plan.name)
  console.log('Plan Display Name:', user.subscription?.plan.displayName)
  console.log('Max Devices:', user.subscription?.plan.maxDevices)
  
  // Get usage stats
  const usage = await getUsageStats(user.id)
  if (usage) {
    console.log('\nUsage Stats:')
    console.log('Devices used:', usage.devices.used)
    console.log('Devices limit:', usage.devices.limit)
    console.log('Devices percentage:', usage.devices.percentage)
  }
  
  // Count actual devices
  const project = await prisma.project.findFirst({
    where: { userId: user.id }
  })
  
  if (project) {
    const deviceCount = await prisma.device.count({
      where: { projectId: project.id }
    })
    console.log(`\nActual device count for project ${project.id}:`, deviceCount)
  }
  
  await prisma.$disconnect()
}

checkQuota()
