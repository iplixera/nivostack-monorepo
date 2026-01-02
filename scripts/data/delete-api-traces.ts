import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function deleteApiTraces() {
  console.log('\n=== Deleting API Traces ===\n')
  
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
  
  // Count existing traces
  const countBefore = await prisma.apiTrace.count({
    where: {
      projectId: project.id
    }
  })
  
  console.log(`Found ${countBefore} API traces to delete\n`)
  
  // Delete all traces
  const deleted = await prisma.apiTrace.deleteMany({
    where: {
      projectId: project.id
    }
  })
  
  console.log(`✅ Deleted ${deleted.count} API traces`)
  
  // Verify deletion
  const countAfter = await prisma.apiTrace.count({
    where: {
      projectId: project.id
    }
  })
  
  console.log(`Remaining traces: ${countAfter}`)
  
  await prisma.$disconnect()
}

deleteApiTraces().catch(console.error)
