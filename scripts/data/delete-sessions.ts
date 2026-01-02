import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function deleteSessions() {
  console.log('\n=== Deleting Sessions ===\n')
  
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
  
  // Count existing sessions
  const countBefore = await prisma.session.count({
    where: {
      projectId: project.id
    }
  })
  
  console.log(`Found ${countBefore} sessions to delete\n`)
  
  // Delete all sessions
  const deleted = await prisma.session.deleteMany({
    where: {
      projectId: project.id
    }
  })
  
  console.log(`✅ Deleted ${deleted.count} sessions`)
  
  // Verify deletion
  const countAfter = await prisma.session.count({
    where: {
      projectId: project.id
    }
  })
  
  console.log(`Remaining sessions: ${countAfter}`)
  
  await prisma.$disconnect()
}

deleteSessions().catch(console.error)
