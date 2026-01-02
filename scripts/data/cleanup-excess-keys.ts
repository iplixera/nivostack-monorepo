import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanupExcessKeys() {
  console.log('\n=== Cleaning Up Excess Keys ===\n')
  
  try {
    // Get a project
    const project = await prisma.project.findFirst()
    if (!project) {
      console.error('❌ No project found')
      return
    }
    
    // Get user's subscription
    const subscription = await prisma.subscription.findFirst({
      where: { userId: project.userId },
      include: { plan: true }
    })
    
    if (!subscription) {
      console.error('❌ No subscription found')
      return
    }
    
    const limit = subscription.quotaMaxLocalizationKeys ?? subscription.plan.maxLocalizationKeys ?? null
    
    if (!limit) {
      console.log('⚠️  No limit set - unlimited keys allowed')
      return
    }
    
    console.log(`Plan: ${subscription.plan.name}`)
    console.log(`Limit: ${limit} keys\n`)
    
    // Get all keys ordered by creation date (oldest first)
    const allKeys = await prisma.localizationKey.findMany({
      where: { projectId: project.id },
      orderBy: { createdAt: 'asc' },
      include: {
        translations: true
      }
    })
    
    console.log(`Current Keys Count: ${allKeys.length}`)
    
    if (allKeys.length <= limit) {
      console.log(`✅ Key count is within limit. No cleanup needed.\n`)
      return
    }
    
    // Keep the first N keys (oldest), delete the rest
    const keysToKeep = allKeys.slice(0, limit)
    const keysToDelete = allKeys.slice(limit)
    
    console.log(`\nKeeping ${keysToKeep.length} keys:`)
    keysToKeep.forEach((k, idx) => {
      console.log(`  ${idx + 1}. ${k.key}`)
    })
    
    console.log(`\nDeleting ${keysToDelete.length} excess keys:`)
    keysToDelete.forEach((k, idx) => {
      console.log(`  ${idx + 1}. ${k.key} (${k.translations.length} translations)`)
    })
    
    // Delete translations first, then keys
    for (const key of keysToDelete) {
      // Delete translations (cascade should handle this, but being explicit)
      await prisma.translation.deleteMany({
        where: { keyId: key.id }
      })
      
      // Delete the key
      await prisma.localizationKey.delete({
        where: { id: key.id }
      })
      
      console.log(`✅ Deleted: ${key.key}`)
    }
    
    const finalCount = await prisma.localizationKey.count({
      where: { projectId: project.id }
    })
    
    console.log(`\n✅ Cleanup complete!`)
    console.log(`Final Keys Count: ${finalCount}/${limit}\n`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanupExcessKeys()
