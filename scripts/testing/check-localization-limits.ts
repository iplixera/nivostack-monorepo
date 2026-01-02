import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkLocalizationLimits() {
  console.log('\n=== Checking Localization Keys Limits ===\n')
  
  try {
    // Get a project
    const project = await prisma.project.findFirst()
    if (!project) {
      console.error('❌ No project found')
      return
    }
    
    console.log(`Project: ${project.name} (${project.id})\n`)
    
    // Get user's subscription
    const subscription = await prisma.subscription.findFirst({
      where: { userId: project.userId, status: 'ACTIVE' },
      include: { plan: true }
    })
    
    if (!subscription) {
      console.error('❌ No active subscription found')
      return
    }
    
    console.log(`Subscription: ${subscription.status}`)
    console.log(`Plan: ${subscription.plan.name}`)
    console.log(`Plan Limit: ${subscription.plan.maxLocalizationKeys ?? 'unlimited'}`)
    console.log(`Subscription Override: ${subscription.quotaMaxLocalizationKeys ?? 'none'}`)
    
    const effectiveLimit = subscription.quotaMaxLocalizationKeys ?? subscription.plan.maxLocalizationKeys ?? null
    console.log(`Effective Limit: ${effectiveLimit ?? 'unlimited'}\n`)
    
    // Count actual keys
    const keyCount = await prisma.localizationKey.count({
      where: { projectId: project.id }
    })
    
    console.log(`Current Keys Count: ${keyCount}`)
    console.log(`Usage: ${keyCount}/${effectiveLimit ?? 'unlimited'} (${effectiveLimit ? ((keyCount / effectiveLimit) * 100).toFixed(1) : 'N/A'}%)\n`)
    
    // List all keys
    const keys = await prisma.localizationKey.findMany({
      where: { projectId: project.id },
      select: { id: true, key: true, category: true, createdAt: true }
    })
    
    console.log(`All Keys (${keys.length}):`)
    keys.forEach((k, idx) => {
      console.log(`  ${idx + 1}. ${k.key} (${k.category || 'uncategorized'})`)
    })
    
    if (effectiveLimit && keyCount > effectiveLimit) {
      console.log(`\n⚠️  WARNING: Key count (${keyCount}) exceeds limit (${effectiveLimit})!`)
    } else if (effectiveLimit && keyCount === effectiveLimit) {
      console.log(`\n⚠️  WARNING: Key count (${keyCount}) is at the limit (${effectiveLimit})!`)
    } else {
      console.log(`\n✅ Key count is within limits`)
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkLocalizationLimits()
