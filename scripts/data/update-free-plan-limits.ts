import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateFreePlanLimits() {
  console.log('\n=== Updating Free Plan Limits ===\n')
  
  const freePlan = await prisma.plan.findUnique({
    where: { name: 'free' }
  })
  
  if (!freePlan) {
    console.error('Free plan not found')
    return
  }
  
  console.log('Current Free Plan Limits:')
  console.log(`  Max Devices: ${freePlan.maxDevices ?? 'unlimited'}`)
  console.log(`  Max API Requests: ${freePlan.maxApiRequests ?? 'unlimited'}`)
  console.log(`  Max API Endpoints: ${freePlan.maxApiEndpoints ?? 'unlimited'}`)
  console.log(`  Max Sessions: ${freePlan.maxSessions ?? 'unlimited'}`)
  console.log(`  Max Logs: ${freePlan.maxLogs ?? 'unlimited'}`)
  console.log(`  Max Crashes: ${freePlan.maxCrashes ?? 'unlimited'}\n`)
  
  // Update to match seed file values
  const updated = await prisma.plan.update({
    where: { name: 'free' },
    data: {
      maxDevices: 2, // Updated from 100 to 2
      maxApiEndpoints: 20, // 20 unique API endpoints
      maxApiRequests: 1000, // 1000 API requests per month
      maxSessions: 2, // Updated from 1000 to 2
      maxLogs: 2, // Updated from 10000 to 2
      maxCrashes: 2, // Updated from 100 to 2
    }
  })
  
  console.log('Updated Free Plan Limits:')
  console.log(`  Max Devices: ${updated.maxDevices ?? 'unlimited'}`)
  console.log(`  Max API Requests: ${updated.maxApiRequests ?? 'unlimited'}`)
  console.log(`  Max API Endpoints: ${updated.maxApiEndpoints ?? 'unlimited'}`)
  console.log(`  Max Sessions: ${updated.maxSessions ?? 'unlimited'}`)
  console.log(`  Max Logs: ${updated.maxLogs ?? 'unlimited'}`)
  console.log(`  Max Crashes: ${updated.maxCrashes ?? 'unlimited'}\n`)
  
  await prisma.$disconnect()
}

updateFreePlanLimits().catch(console.error)
