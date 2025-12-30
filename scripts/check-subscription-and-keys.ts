import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkSubscriptionAndKeys() {
  console.log('\n=== Checking Subscription and Keys ===\n')
  
  try {
    // Get a project
    const project = await prisma.project.findFirst()
    if (!project) {
      console.error('❌ No project found')
      return
    }
    
    console.log(`Project: ${project.name} (${project.id})`)
    console.log(`User ID: ${project.userId}\n`)
    
    // Get all subscriptions for this user
    const subscriptions = await prisma.subscription.findMany({
      where: { userId: project.userId },
      include: { plan: true },
      orderBy: { createdAt: 'desc' }
    })
    
    console.log(`Subscriptions (${subscriptions.length}):`)
    subscriptions.forEach((sub, idx) => {
      console.log(`\n${idx + 1}. ${sub.plan.name} - Status: ${sub.status}`)
      console.log(`   Plan Limit: ${sub.plan.maxLocalizationKeys ?? 'unlimited'}`)
      console.log(`   Override: ${sub.quotaMaxLocalizationKeys ?? 'none'}`)
      console.log(`   Created: ${sub.createdAt}`)
    })
    
    // Get free plan
    const freePlan = await prisma.plan.findFirst({
      where: { name: 'Free' }
    })
    
    if (freePlan) {
      console.log(`\n\nFree Plan Limits:`)
      console.log(`  Localization Keys: ${freePlan.maxLocalizationKeys ?? 'unlimited'}`)
    }
    
    // Count actual keys
    const keyCount = await prisma.localizationKey.count({
      where: { projectId: project.id }
    })
    
    console.log(`\n\nCurrent Keys Count: ${keyCount}`)
    
    // List all keys
    const keys = await prisma.localizationKey.findMany({
      where: { projectId: project.id },
      select: { id: true, key: true, category: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    })
    
    console.log(`\nAll Keys (${keys.length}):`)
    keys.forEach((k, idx) => {
      console.log(`  ${idx + 1}. ${k.key} (${k.category || 'uncategorized'}) - Created: ${k.createdAt.toISOString().split('T')[0]}`)
    })
    
    if (freePlan && freePlan.maxLocalizationKeys) {
      const limit = freePlan.maxLocalizationKeys
      console.log(`\n\nComparison:`)
      console.log(`  Limit: ${limit}`)
      console.log(`  Actual: ${keyCount}`)
      console.log(`  Difference: ${keyCount - limit} (${keyCount > limit ? 'EXCEEDS' : 'within'})`)
      
      if (keyCount > limit) {
        console.log(`\n⚠️  WARNING: ${keyCount - limit} keys exceed the limit!`)
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkSubscriptionAndKeys()
