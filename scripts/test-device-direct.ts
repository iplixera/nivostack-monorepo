import { prisma } from '../dashboard/src/lib/prisma'

async function test() {
  try {
    const project = await prisma.project.findFirst({
      where: { apiKey: 'cmjoin79y00069z09upepkf11' }
    })
    
    if (!project) {
      console.error('Project not found')
      return
    }
    
    console.log('Creating device with projectId:', project.id)
    
    const device = await prisma.device.create({
      data: {
        projectId: project.id,
        deviceId: 'test-direct-' + Date.now(),
        platform: 'ios',
        status: 'active',
        deletedAt: null
      }
    })
    
    console.log('✅ Device created:', device.id)
  } catch (e: any) {
    console.error('❌ Error:', e.message)
    console.error('Code:', e.code)
  } finally {
    await prisma.$disconnect()
  }
}

test()
