import { prisma } from '../dashboard/src/lib/prisma'

async function test() {
  try {
    // Test the exact flow from the API
    const project = await prisma.project.findFirst({
      where: { apiKey: 'cmjoin79y00069z09upepkf11' }
    })
    
    if (!project) {
      console.error('Project not found')
      return
    }
    
    const deviceId = 'test-api-flow-' + Date.now()
    const platform = 'ios'
    
    // Build device data exactly as API does
    const deviceData: any = {
      projectId: project.id,
      deviceId,
      platform,
      status: 'active',
      deletedAt: null,
      lastSeenAt: new Date()
    }
    
    // Check if device exists
    const existingDevice = await prisma.device.findFirst({
      where: {
        projectId: project.id,
        deviceId
      }
    })
    
    console.log('Existing device:', existingDevice ? 'Found' : 'Not found')
    
    if (existingDevice) {
      const updateData: any = { ...deviceData }
      delete updateData.projectId
      delete updateData.deviceId
      
      const device = await prisma.device.update({
        where: { id: existingDevice.id },
        data: updateData
      })
      console.log('✅ Updated device:', device.id)
    } else {
      const device = await prisma.device.create({
        data: deviceData
      })
      console.log('✅ Created device:', device.id)
    }
  } catch (e: any) {
    console.error('❌ Error:', e.message)
    console.error('Code:', e.code)
    console.error('Stack:', e.stack?.split('\n').slice(0, 5).join('\n'))
  } finally {
    await prisma.$disconnect()
  }
}

test()
