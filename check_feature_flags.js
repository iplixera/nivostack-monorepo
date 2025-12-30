const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkFlags() {
  const projects = await prisma.project.findMany({
    include: { featureFlags: true }
  })
  
  console.log('\n=== FEATURE FLAGS STATUS ===\n')
  for (const project of projects) {
    console.log(`Project: ${project.name} (${project.id})`)
    console.log(`API Key: ${project.apiKey}`)
    if (project.featureFlags) {
      console.log(`  - logging: ${project.featureFlags.logging}`)
      console.log(`  - apiTracking: ${project.featureFlags.apiTracking}`)
      console.log(`  - sdkEnabled: ${project.featureFlags.sdkEnabled}`)
    } else {
      console.log('  - No feature flags set (using defaults)')
    }
    console.log('')
  }
  
  await prisma.$disconnect()
}

checkFlags().catch(console.error)
