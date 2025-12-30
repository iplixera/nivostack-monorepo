import { prisma } from '../dashboard/src/lib/prisma'

async function checkProject() {
  const project = await prisma.project.findFirst({
    where: { apiKey: 'cmjoin79y00069z09upepkf11' },
    select: { id: true, name: true, apiKey: true }
  })
  
  console.log('Project:', JSON.stringify(project, null, 2))
  
  // Try to create a device directly
  try {
    const device = await prisma.device.create({
      data: {
        projectId: project?.id,
        deviceId: 'test-direct-2',
        platform: 'ios'
      },
      select: { id: true, deviceId: true, projectId: true }
    })
    console.log('Device created:', JSON.stringify(device, null, 2))
  } catch (e: any) {
    console.error('Error creating device:', e.message)
  }
  
  await prisma.$disconnect()
}

checkProject()
