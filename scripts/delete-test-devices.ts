const API_BASE = 'http://localhost:3000'

async function deleteTestDevices() {
  console.log('\n=== Deleting Test Devices ===\n')
  
  // Get project info
  const projectResponse = await fetch(`${API_BASE}/api/projects`, {
    headers: {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWpvaTJrOGEwMDAwOXowOTU1NWo2cmg5IiwiaWF0IjoxNzY2ODUyMDE1LCJleHAiOjE3Njc0NTY4MTV9.0r1-Z1hB0ywxAiePWIxm7kAf8CdqGJazBG-DKBtimAQ'
    }
  })
  
  const projectsData = await projectResponse.json()
  const project = projectsData.projects?.[0]
  
  if (!project) {
    console.error('❌ No projects found')
    return
  }
  
  console.log(`Project: ${project.name} (ID: ${project.id})`)
  
  // Get all devices
  const devicesResponse = await fetch(`${API_BASE}/api/devices?projectId=${project.id}&limit=100`, {
    headers: {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWpvaTJrOGEwMDAwOXowOTU1NWo2cmg5IiwiaWF0IjoxNzY2ODUyMDE1LCJleHAiOjE3Njc0NTY4MTV9.0r1-Z1hB0ywxAiePWIxm7kAf8CdqGJazBG-DKBtimAQ'
    }
  })
  
  const devicesData = await devicesResponse.json()
  const devices = devicesData.devices || []
  
  console.log(`Found ${devices.length} devices to delete\n`)
  
  // Delete each device (we'll need to use Prisma directly since there's no DELETE endpoint)
  // Actually, let's use the database directly
  const { PrismaClient } = await import('@prisma/client')
  const prisma = new PrismaClient()
  
  try {
    const deleted = await prisma.device.deleteMany({
      where: {
        projectId: project.id
      }
    })
    
    console.log(`✅ Deleted ${deleted.count} devices`)
    
    // Verify deletion
    const remaining = await prisma.device.count({
      where: {
        projectId: project.id
      }
    })
    
    console.log(`Remaining devices: ${remaining}`)
    
  } catch (error: any) {
    console.error('❌ Error deleting devices:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

deleteTestDevices().catch(console.error)
